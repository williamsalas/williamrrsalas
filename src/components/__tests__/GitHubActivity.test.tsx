import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import { GitHubActivity } from "../GitHubActivity.tsx";

afterEach(cleanup);

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

describe("GitHubActivity", () => {
  it("shows loading state initially", () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(
      () => new Promise(() => {}),
    );
    render(<GitHubActivity />);
    expect(
      screen.getByText("Loading recent GitHub activity..."),
    ).toBeInTheDocument();
  });

  it("shows error state on fetch failure", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("Network error"));
    render(<GitHubActivity />);
    await waitFor(() => {
      expect(
        screen.getByText(/Could not load GitHub activity/),
      ).toBeInTheDocument();
    });
  });

  it("shows empty state for empty data", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => [],
    } as Response);
    render(<GitHubActivity />);
    await waitFor(() => {
      expect(
        screen.getByText("No recent GitHub activity."),
      ).toBeInTheDocument();
    });
  });

  it("renders PR events on success", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => mockEvents,
    } as Response);
    render(<GitHubActivity />);
    await waitFor(() => {
      expect(screen.getByText("Test PR")).toBeInTheDocument();
    });
    expect(screen.getByText("user/repo")).toBeInTheDocument();
  });
});
