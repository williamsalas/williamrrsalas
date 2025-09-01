export const isChoreDataPR = (e) =>
  e.type === "PullRequestEvent" && e.title && e.title.startsWith("chore(data");

export const safeRepoName = (e) =>
  e?.repo && e.repo.name ? e.repo.name : e?.repo || "unknown";

export function uniquePRs(events) {
  const seen = new Set();
  return events.filter((e) => {
    if (e.type !== "PullRequestEvent" || !e.pr_number) return true;
    if (seen.has(e.pr_number)) return false;
    seen.add(e.pr_number);
    return true;
  });
}

export function groupPRsByRepo(events) {
  const map = new Map();
  events.forEach((e) => {
    if (e.type !== "PullRequestEvent") return;
    const repo = safeRepoName(e);
    if (!map.has(repo)) map.set(repo, []);
    map.get(repo).push(e);
  });
  return map;
}

/** @typedef {{
 *   id: string,
 *   type: string,
 *   created_at: string,
 *   repo: { name?: string } | undefined,
 *   payload?: { action?: string, pull_request?: {
 *     number: number, html_url: string, title: string, merged?: boolean
 *   }}
 * }} GitHubEvent */

/** Return only PullRequestEvent items in the jq-shaped form. */
export function transformPullRequestEvents(events /** @type GitHubEvent[] */) {
  return events
    .filter((e) => e?.type === "PullRequestEvent" && e?.payload?.pull_request)
    .map((e) => ({
      id: e.id,
      type: e.type,
      created_at: e.created_at,
      repo: e.repo?.name ?? null,
      pr_number: e.payload.pull_request.number,
      url: e.payload.pull_request.html_url,
      title: e.payload.pull_request.title,
      merged: !!e.payload.pull_request.merged,
      action: e.payload.action ?? null,
    }));
}
