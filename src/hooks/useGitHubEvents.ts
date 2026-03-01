import { useState, useEffect } from "react";
import type { GitHubEvent, TransformedEvent } from "../lib/types.ts";
import {
  transformPullRequestEvents,
  uniquePRs,
  groupPRsByRepo,
} from "../lib/events.ts";

const GITHUB_DATA_URL = "data/github-events.json";

interface UseGitHubEventsResult {
  prGroups: Map<string, TransformedEvent[]>;
  otherEvents: TransformedEvent[];
  loading: boolean;
  error: string | null;
}

export function useGitHubEvents(): UseGitHubEventsResult {
  const [prGroups, setPrGroups] = useState<Map<string, TransformedEvent[]>>(
    new Map(),
  );
  const [otherEvents, setOtherEvents] = useState<TransformedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchEvents() {
      try {
        const res = await fetch(GITHUB_DATA_URL);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const raw: GitHubEvent[] = await res.json();

        if (cancelled) return;

        if (!Array.isArray(raw) || raw.length === 0) {
          setLoading(false);
          return;
        }

        const data = transformPullRequestEvents(raw);
        const cleaned = uniquePRs(data);
        const grouped = groupPRsByRepo(cleaned);
        const other = data.filter((e) => e.type !== "PullRequestEvent");

        if (!cancelled) {
          setPrGroups(grouped);
          setOtherEvents(other);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            `Could not load GitHub activity. ${err instanceof Error ? err.message : err}`,
          );
          setLoading(false);
        }
      }
    }

    fetchEvents();
    return () => {
      cancelled = true;
    };
  }, []);

  return { prGroups, otherEvents, loading, error };
}
