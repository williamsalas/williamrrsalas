import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { PRListItem } from "../PRListItem.tsx";
import type { TransformedEvent } from "../../lib/types.ts";

const mockEvent: TransformedEvent = {
  id: "1",
  type: "PullRequestEvent",
  created_at: "2024-03-15T12:00:00Z",
  repo: "user/repo",
  pr_number: 42,
  url: "https://github.com/user/repo/pull/42",
  title: "Add awesome feature",
  merged: false,
  action: "opened",
};

afterEach(cleanup);

describe("PRListItem", () => {
  it("renders PR title as a link", () => {
    render(<PRListItem event={mockEvent} />);
    const link = screen.getByText("Add awesome feature");
    expect(link).toBeInTheDocument();
    expect(link.closest("a")).toHaveAttribute(
      "href",
      "https://github.com/user/repo/pull/42",
    );
  });

  it("renders the formatted date", () => {
    render(<PRListItem event={mockEvent} />);
    expect(screen.getByText(/Mar 15/)).toBeInTheDocument();
  });

  it("renders a status icon", () => {
    const { container } = render(<PRListItem event={mockEvent} />);
    expect(container.querySelector("svg.status-icon")).toBeInTheDocument();
  });

  it("shows (no title) when title is empty", () => {
    render(<PRListItem event={{ ...mockEvent, title: "" }} />);
    expect(screen.getByText("(no title)")).toBeInTheDocument();
  });
});
