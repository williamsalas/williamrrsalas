import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import {
  render,
  screen,
  cleanup,
  fireEvent,
  act,
} from "@testing-library/react";
import { ClaudeFormatterPage } from "../ClaudeFormatterPage.tsx";

const LS_KEY = "claude-formatter-input";

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("ClaudeFormatterPage localStorage", () => {
  it("initializes with empty input when nothing is stored", () => {
    render(<ClaudeFormatterPage />);
    const textarea = screen.getByPlaceholderText(
      "Paste Claude Code output here...",
    ) as HTMLTextAreaElement;
    expect(textarea.value).toBe("");
  });

  it("restores saved input on mount", () => {
    localStorage.setItem(LS_KEY, "saved text");
    render(<ClaudeFormatterPage />);
    const textarea = screen.getByPlaceholderText(
      "Paste Claude Code output here...",
    ) as HTMLTextAreaElement;
    expect(textarea.value).toBe("saved text");
  });

  it("persists input to localStorage after debounce", () => {
    render(<ClaudeFormatterPage />);
    const textarea = screen.getByPlaceholderText(
      "Paste Claude Code output here...",
    );
    fireEvent.change(textarea, { target: { value: "hello world" } });
    expect(localStorage.getItem(LS_KEY)).toBeNull();
    act(() => vi.advanceTimersByTime(500));
    expect(localStorage.getItem(LS_KEY)).toBe("hello world");
  });

  it("removes key from localStorage when Clear is clicked", () => {
    localStorage.setItem(LS_KEY, "some text");
    render(<ClaudeFormatterPage />);
    fireEvent.click(screen.getByText("Clear"));
    expect(localStorage.getItem(LS_KEY)).toBeNull();
  });

  it("does not persist input exceeding size cap", () => {
    render(<ClaudeFormatterPage />);
    const textarea = screen.getByPlaceholderText(
      "Paste Claude Code output here...",
    );
    const oversized = "x".repeat(100_001);
    fireEvent.change(textarea, { target: { value: oversized } });
    act(() => vi.advanceTimersByTime(500));
    expect(localStorage.getItem(LS_KEY)).toBeNull();
  });

  it("resets debounce timer on rapid changes", () => {
    render(<ClaudeFormatterPage />);
    const textarea = screen.getByPlaceholderText(
      "Paste Claude Code output here...",
    );
    fireEvent.change(textarea, { target: { value: "first" } });
    act(() => vi.advanceTimersByTime(300));
    fireEvent.change(textarea, { target: { value: "second" } });
    act(() => vi.advanceTimersByTime(300));
    expect(localStorage.getItem(LS_KEY)).toBeNull();
    act(() => vi.advanceTimersByTime(200));
    expect(localStorage.getItem(LS_KEY)).toBe("second");
  });

  it("removes key when input is cleared to empty string", () => {
    localStorage.setItem(LS_KEY, "existing");
    render(<ClaudeFormatterPage />);
    const textarea = screen.getByPlaceholderText(
      "Paste Claude Code output here...",
    );
    fireEvent.change(textarea, { target: { value: "" } });
    act(() => vi.advanceTimersByTime(500));
    expect(localStorage.getItem(LS_KEY)).toBeNull();
  });
});
