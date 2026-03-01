import { describe, it, expect } from "vitest";
import {
  isChoreDataPR,
  safeRepoName,
  uniquePRs,
  groupPRsByRepo,
  transformPullRequestEvents,
} from "../events.ts";
import type { GitHubEvent, TransformedEvent } from "../types.ts";

function makeTransformed(
  overrides: Partial<TransformedEvent> = {},
): TransformedEvent {
  return {
    id: "1",
    type: "PullRequestEvent",
    created_at: "2024-06-01T00:00:00Z",
    repo: "user/repo",
    pr_number: 1,
    url: "https://github.com/user/repo/pull/1",
    title: "test PR",
    merged: false,
    action: "opened",
    ...overrides,
  };
}

describe("isChoreDataPR", () => {
  it("returns true for chore(data) PRs", () => {
    const e = makeTransformed({ title: "chore(data): refresh events" });
    expect(isChoreDataPR(e)).toBe(true);
  });

  it("returns false for regular PRs", () => {
    const e = makeTransformed({ title: "add new feature" });
    expect(isChoreDataPR(e)).toBe(false);
  });

  it("returns false for non-PR events", () => {
    const e = makeTransformed({ type: "PushEvent" });
    expect(isChoreDataPR(e)).toBe(false);
  });
});

describe("safeRepoName", () => {
  it("returns repo string from TransformedEvent", () => {
    expect(safeRepoName({ repo: "user/repo" } as TransformedEvent)).toBe(
      "user/repo",
    );
  });

  it("returns 'unknown' when repo is null", () => {
    expect(safeRepoName({ repo: null } as TransformedEvent)).toBe("unknown");
  });

  it("returns name from GitHubEvent repo object", () => {
    expect(safeRepoName({ repo: { name: "org/project" } } as GitHubEvent)).toBe(
      "org/project",
    );
  });
});

describe("uniquePRs", () => {
  it("deduplicates PRs by pr_number", () => {
    const events = [
      makeTransformed({ id: "1", pr_number: 10 }),
      makeTransformed({ id: "2", pr_number: 10 }),
      makeTransformed({ id: "3", pr_number: 20 }),
    ];
    const result = uniquePRs(events);
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe("1");
    expect(result[1].id).toBe("3");
  });

  it("keeps non-PR events", () => {
    const events = [
      makeTransformed({ type: "PushEvent", pr_number: 0 }),
      makeTransformed({ id: "2", pr_number: 10 }),
    ];
    const result = uniquePRs(events);
    expect(result).toHaveLength(2);
  });
});

describe("groupPRsByRepo", () => {
  it("groups PR events by repo name", () => {
    const events = [
      makeTransformed({ repo: "user/a", created_at: "2024-06-02T00:00:00Z" }),
      makeTransformed({
        id: "2",
        repo: "user/b",
        created_at: "2024-06-01T00:00:00Z",
      }),
      makeTransformed({
        id: "3",
        repo: "user/a",
        created_at: "2024-06-01T00:00:00Z",
      }),
    ];
    const grouped = groupPRsByRepo(events);
    expect(grouped.size).toBe(2);
    expect(grouped.get("user/a")).toHaveLength(2);
    expect(grouped.get("user/b")).toHaveLength(1);
  });

  it("sorts repos by most recent event", () => {
    const events = [
      makeTransformed({
        repo: "user/old",
        created_at: "2024-01-01T00:00:00Z",
      }),
      makeTransformed({
        id: "2",
        repo: "user/new",
        created_at: "2024-06-01T00:00:00Z",
      }),
    ];
    const grouped = groupPRsByRepo(events);
    const keys = [...grouped.keys()];
    expect(keys[0]).toBe("user/new");
    expect(keys[1]).toBe("user/old");
  });

  it("caps each repo at 10 PRs", () => {
    const events = Array.from({ length: 15 }, (_, i) =>
      makeTransformed({ id: String(i), pr_number: i, repo: "user/repo" }),
    );
    const grouped = groupPRsByRepo(events);
    expect(grouped.get("user/repo")).toHaveLength(10);
  });
});

describe("transformPullRequestEvents", () => {
  it("transforms raw GitHub events to TransformedEvent shape", () => {
    const raw: GitHubEvent[] = [
      {
        id: "42",
        type: "PullRequestEvent",
        created_at: "2024-06-01T00:00:00Z",
        repo: { name: "user/repo" },
        payload: {
          action: "opened",
          pull_request: {
            number: 5,
            html_url: "https://github.com/user/repo/pull/5",
            title: "Add feature",
            merged: false,
          },
        },
      },
    ];

    const result = transformPullRequestEvents(raw);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      id: "42",
      type: "PullRequestEvent",
      created_at: "2024-06-01T00:00:00Z",
      repo: "user/repo",
      pr_number: 5,
      url: "https://github.com/user/repo/pull/5",
      title: "Add feature",
      merged: false,
      action: "opened",
    });
  });

  it("filters out non-PR events", () => {
    const raw: GitHubEvent[] = [
      {
        id: "1",
        type: "PushEvent",
        created_at: "2024-06-01T00:00:00Z",
        repo: { name: "user/repo" },
      },
    ];
    expect(transformPullRequestEvents(raw)).toHaveLength(0);
  });

  it("handles missing html_url by constructing one", () => {
    const raw: GitHubEvent[] = [
      {
        id: "1",
        type: "PullRequestEvent",
        created_at: "2024-06-01T00:00:00Z",
        repo: { name: "user/repo" },
        payload: {
          action: "opened",
          pull_request: {
            number: 3,
            html_url: "",
            title: "Fix bug",
          },
        },
      },
    ];
    const result = transformPullRequestEvents(raw);
    expect(result[0].url).toBe("https://github.com/user/repo/pull/3");
  });
});
