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
