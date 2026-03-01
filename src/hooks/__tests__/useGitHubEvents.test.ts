import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useGitHubEvents } from "../useGitHubEvents.ts";

const mockEvents = [
  {
    id: "1",
    type: "PullRequestEvent",
    created_at: "2024-06-01T00:00:00Z",
    repo: { name: "user/repo" },
    payload: {
      action: "opened",
      pull_request: {
        number: 1,
        html_url: "https://github.com/user/repo/pull/1",
        title: "Test PR",
        merged: false,
      },
    },
  },
];

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("useGitHubEvents", () => {
  it("starts in loading state", () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(
      () => new Promise(() => {}),
    );
    const { result } = renderHook(() => useGitHubEvents());
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it("fetches and transforms events", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => mockEvents,
    } as Response);

    const { result } = renderHook(() => useGitHubEvents());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.prGroups.size).toBe(1);
    expect(result.current.prGroups.get("user/repo")).toHaveLength(1);
    expect(result.current.error).toBeNull();
  });

  it("sets error on fetch failure", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("fail"));

    const { result } = renderHook(() => useGitHubEvents());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toContain("Could not load GitHub activity");
  });

  it("handles empty response", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => [],
    } as Response);

    const { result } = renderHook(() => useGitHubEvents());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.prGroups.size).toBe(0);
    expect(result.current.otherEvents).toHaveLength(0);
  });
});
