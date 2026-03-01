"""Merge and deduplicate GitHub events for the cached activity feed."""

import json
import os
import sys
import urllib.request
import urllib.error

MAX_EVENTS = 500


def filter_pr_events(events):
    """Keep only PullRequestEvent items."""
    return [e for e in events if e.get("type") == "PullRequestEvent"]


def enrich_pr_events(events):
    """Fetch title, html_url, and merged from the PR API for events missing them."""
    enriched = []
    for event in events:
        pr = event.get("payload", {}).get("pull_request", {})
        if pr.get("title") and pr.get("html_url"):
            enriched.append(event)
            continue

        repo_name = event.get("repo", {}).get("name")
        number = pr.get("number")
        if not repo_name or not number:
            enriched.append(event)
            continue

        api_url = f"https://api.github.com/repos/{repo_name}/pulls/{number}"
        try:
            req = urllib.request.Request(
                api_url,
                headers={"Accept": "application/vnd.github+json"},
            )
            with urllib.request.urlopen(req) as resp:
                pr_data = json.loads(resp.read())
            pr["title"] = pr_data.get("title")
            pr["html_url"] = pr_data.get("html_url")
            pr["merged"] = pr_data.get("merged")
            print(f"  Enriched PR #{number}: {pr['title']}")
        except Exception as e:
            print(f"  Warning: could not enrich PR #{number}: {e}")

        enriched.append(event)
    return enriched


def merge_events(new_events, existing_events, max_events=MAX_EVENTS):
    """Combine new and existing events, deduplicate by id, sort newest first.

    When an event id appears in both lists, the version from new_events wins
    so that updated PR state (e.g. open -> merged) is reflected.
    """
    seen = {}
    for event in new_events:
        eid = event.get("id")
        if eid:
            seen[eid] = event
    for event in existing_events:
        eid = event.get("id")
        if eid and eid not in seen:
            seen[eid] = event

    merged = sorted(
        seen.values(),
        key=lambda e: e.get("created_at", ""),
        reverse=True,
    )
    return merged[:max_events]


def main():
    if len(sys.argv) != 3:
        print(f"Usage: {sys.argv[0]} <new-events.json> <cache-file.json>")
        sys.exit(1)

    new_file = sys.argv[1]
    cache_file = sys.argv[2]

    with open(new_file) as f:
        raw_events = json.load(f)

    pr_events = filter_pr_events(raw_events)

    existing = []
    if os.path.exists(cache_file):
        with open(cache_file) as f:
            existing = json.load(f)

    merged = enrich_pr_events(merge_events(pr_events, existing))

    os.makedirs(os.path.dirname(cache_file) or ".", exist_ok=True)
    with open(cache_file, "w") as f:
        json.dump(merged, f, indent=2)
        f.write("\n")

    print(f"Merged: {len(pr_events)} new PRs + {len(existing)} existing = {len(merged)} unique events")


if __name__ == "__main__":
    main()
