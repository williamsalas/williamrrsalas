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
  globalThis.ResizeObserver = class ResizeObserver {
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

describe("ClaudeFormatterPage view toggle", () => {
  function getToggleCheckbox(): HTMLInputElement {
    return document.querySelector(
      ".formatter-view-toggle input[type='checkbox']",
    )! as HTMLInputElement;
  }

  function toggleToRaw() {
    fireEvent.click(getToggleCheckbox());
  }

  it("renders toggle in preview mode by default", () => {
    render(<ClaudeFormatterPage />);
    expect(getToggleCheckbox().checked).toBe(true);
    expect(screen.getByText("Raw")).toBeTruthy();
    expect(screen.getByText("Preview")).toBeTruthy();
  });

  it("switches to raw mode when toggle is clicked", () => {
    render(<ClaudeFormatterPage />);
    toggleToRaw();
    expect(getToggleCheckbox().checked).toBe(false);
  });

  it("switches back to preview mode when toggle is clicked again", () => {
    render(<ClaudeFormatterPage />);
    toggleToRaw();
    fireEvent.click(getToggleCheckbox());
    expect(getToggleCheckbox().checked).toBe(true);
  });

  it("renders markdown as HTML in preview mode", () => {
    render(<ClaudeFormatterPage />);
    const textarea = screen.getByPlaceholderText(
      "Paste Claude Code output here...",
    );
    fireEvent.change(textarea, {
      target: { value: "## Hello\n\nWorld" },
    });
    fireEvent.click(screen.getByText("Format"));
    const preview = document.querySelector(".formatter-preview")!;
    expect(preview.querySelector("h2")!.textContent).toBe("Hello");
    expect(preview.querySelector("p")!.textContent).toBe("World");
  });

  it("shows placeholder in preview mode when output is empty", () => {
    render(<ClaudeFormatterPage />);
    expect(
      screen.getByText("Formatted output will appear here..."),
    ).toBeTruthy();
  });

  it("copy button still works in preview mode", () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: { writeText: writeTextMock },
    });

    render(<ClaudeFormatterPage />);
    const textarea = screen.getByPlaceholderText(
      "Paste Claude Code output here...",
    );
    fireEvent.change(textarea, { target: { value: "## Test" } });
    fireEvent.click(screen.getByText("Format"));
    const outputCopyBtn = document.querySelector(
      ".formatter-output-actions .formatter-btn--copy",
    )!;
    fireEvent.click(outputCopyBtn);
    expect(writeTextMock).toHaveBeenCalled();
  });
});
