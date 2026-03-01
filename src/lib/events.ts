import type { GitHubEvent, TransformedEvent } from "./types.ts";

export const isChoreDataPR = (e: TransformedEvent): boolean =>
  e.type === "PullRequestEvent" &&
  !!e.title &&
  e.title.startsWith("chore(data");

export const safeRepoName = (
  e: Pick<TransformedEvent, "repo"> | GitHubEvent,
): string => {
  if ("repo" in e && e.repo) {
    if (typeof e.repo === "string") return e.repo;
    if (typeof e.repo === "object" && e.repo.name) return e.repo.name;
  }
  return "unknown";
};

export function uniquePRs(events: TransformedEvent[]): TransformedEvent[] {
  const seen = new Set<number>();
  return events.filter((e) => {
    if (e.type !== "PullRequestEvent" || !e.pr_number) return true;
    if (seen.has(e.pr_number)) return false;
    seen.add(e.pr_number);
    return true;
  });
}

export function groupPRsByRepo(
  events: TransformedEvent[],
): Map<string, TransformedEvent[]> {
  const map = new Map<string, TransformedEvent[]>();
  events.forEach((e) => {
    if (e.type !== "PullRequestEvent") return;
    const repo = safeRepoName(e);
    if (!map.has(repo)) map.set(repo, []);
    map.get(repo)!.push(e);
  });

  const sorted = [...map.entries()]
    .sort(([, a], [, b]) =>
      (b[0]?.created_at ?? "").localeCompare(a[0]?.created_at ?? ""),
    )
    .map(
      ([repo, prs]) => [repo, prs.slice(0, 10)] as [string, TransformedEvent[]],
    );

  return new Map(sorted);
}

export function transformPullRequestEvents(
  events: GitHubEvent[],
): TransformedEvent[] {
  return events
    .filter((e) => e?.type === "PullRequestEvent" && e?.payload?.pull_request)
    .map((e) => {
      const pr = e.payload!.pull_request!;
      const repo = e.repo?.name ?? null;
      const number = pr.number;
      return {
        id: e.id,
        type: e.type,
        created_at: e.created_at,
        repo,
        pr_number: number,
        url: pr.html_url || `https://github.com/${repo}/pull/${number}`,
        title: pr.title || `PR #${number}`,
        merged: pr.merged ?? e.payload?.action === "merged",
        action: e.payload?.action ?? null,
      };
    });
}
