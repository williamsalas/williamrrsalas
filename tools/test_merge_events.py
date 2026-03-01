"""Tests for merge_events.py."""

import unittest
from unittest.mock import patch, MagicMock
import json

from merge_events import filter_pr_events, merge_events, enrich_pr_events


def make_event(id, type="PullRequestEvent", created_at="2025-08-25T00:00:00Z", **extra):
    event = {"id": id, "type": type, "created_at": created_at}
    event.update(extra)
    return event


class TestFilterPrEvents(unittest.TestCase):
    def test_keeps_pull_request_events(self):
        events = [
            make_event("1", type="PullRequestEvent"),
            make_event("2", type="PushEvent"),
            make_event("3", type="PullRequestEvent"),
        ]
        result = filter_pr_events(events)
        self.assertEqual(len(result), 2)
        self.assertTrue(all(e["type"] == "PullRequestEvent" for e in result))

    def test_returns_empty_for_no_pr_events(self):
        events = [
            make_event("1", type="PushEvent"),
            make_event("2", type="CreateEvent"),
        ]
        self.assertEqual(filter_pr_events(events), [])

    def test_returns_empty_for_empty_input(self):
        self.assertEqual(filter_pr_events([]), [])


class TestMergeEvents(unittest.TestCase):
    def test_deduplication(self):
        new = [make_event("1"), make_event("2")]
        existing = [make_event("2"), make_event("3")]
        result = merge_events(new, existing)
        ids = [e["id"] for e in result]
        self.assertEqual(sorted(ids), ["1", "2", "3"])

    def test_new_events_take_precedence(self):
        new = [make_event("1", action="closed")]
        existing = [make_event("1", action="opened")]
        result = merge_events(new, existing)
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]["action"], "closed")

    def test_sorted_by_created_at_descending(self):
        new = [
            make_event("1", created_at="2025-08-20T00:00:00Z"),
            make_event("2", created_at="2025-08-25T00:00:00Z"),
        ]
        existing = [
            make_event("3", created_at="2025-08-22T00:00:00Z"),
        ]
        result = merge_events(new, existing)
        dates = [e["created_at"] for e in result]
        self.assertEqual(dates, sorted(dates, reverse=True))

    def test_cap_enforcement(self):
        events = [make_event(str(i), created_at=f"2025-08-{i+1:02d}T00:00:00Z") for i in range(10)]
        result = merge_events(events, [], max_events=5)
        self.assertEqual(len(result), 5)
        # Should keep the 5 newest (highest dates)
        kept_ids = {e["id"] for e in result}
        self.assertEqual(kept_ids, {"5", "6", "7", "8", "9"})

    def test_empty_new_events(self):
        existing = [make_event("1"), make_event("2")]
        result = merge_events([], existing)
        self.assertEqual(len(result), 2)

    def test_empty_existing_events(self):
        new = [make_event("1"), make_event("2")]
        result = merge_events(new, [])
        self.assertEqual(len(result), 2)

    def test_both_empty(self):
        self.assertEqual(merge_events([], []), [])

    def test_events_without_id_are_skipped(self):
        new = [{"type": "PullRequestEvent", "created_at": "2025-08-25T00:00:00Z"}]
        existing = [make_event("1")]
        result = merge_events(new, existing)
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]["id"], "1")


class TestEnrichPrEvents(unittest.TestCase):
    def test_skips_already_enriched_events(self):
        event = {
            "type": "PullRequestEvent",
            "repo": {"name": "owner/repo"},
            "payload": {
                "action": "opened",
                "pull_request": {
                    "number": 1,
                    "title": "existing title",
                    "html_url": "https://github.com/owner/repo/pull/1",
                },
            },
        }
        with patch("merge_events.urllib.request.urlopen") as mock_urlopen:
            result = enrich_pr_events([event])
            mock_urlopen.assert_not_called()
        self.assertEqual(result[0]["payload"]["pull_request"]["title"], "existing title")

    def test_fetches_missing_title_and_url(self):
        event = {
            "type": "PullRequestEvent",
            "repo": {"name": "owner/repo"},
            "payload": {
                "action": "opened",
                "pull_request": {"number": 5},
            },
        }
        api_response = json.dumps({
            "title": "fetched title",
            "html_url": "https://github.com/owner/repo/pull/5",
            "merged": True,
        }).encode()

        mock_resp = MagicMock()
        mock_resp.read.return_value = api_response
        mock_resp.__enter__ = lambda s: s
        mock_resp.__exit__ = MagicMock(return_value=False)

        with patch("merge_events.urllib.request.urlopen", return_value=mock_resp):
            result = enrich_pr_events([event])

        pr = result[0]["payload"]["pull_request"]
        self.assertEqual(pr["title"], "fetched title")
        self.assertEqual(pr["html_url"], "https://github.com/owner/repo/pull/5")
        self.assertTrue(pr["merged"])

    def test_handles_api_failure_gracefully(self):
        event = {
            "type": "PullRequestEvent",
            "repo": {"name": "owner/repo"},
            "payload": {
                "action": "opened",
                "pull_request": {"number": 5},
            },
        }
        with patch(
            "merge_events.urllib.request.urlopen",
            side_effect=Exception("rate limited"),
        ):
            result = enrich_pr_events([event])

        self.assertEqual(len(result), 1)
        self.assertNotIn("title", result[0]["payload"]["pull_request"])


if __name__ == "__main__":
    unittest.main()
