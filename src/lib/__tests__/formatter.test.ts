import { describe, it, expect } from "vitest";
import {
  dedent,
  joinWrappedLines,
  restoreHeaders,
  collapseBlankLines,
  formatClaudeOutput,
} from "../formatter.ts";

describe("dedent", () => {
  it("strips consistent 2-space indent", () => {
    const input = "  line one\n  line two\n  line three";
    expect(dedent(input)).toBe("line one\nline two\nline three");
  });

  it("preserves relative indentation", () => {
    const input = "  outer\n    inner\n  outer";
    expect(dedent(input)).toBe("outer\n  inner\nouter");
  });

  it("ignores blank lines when computing min indent", () => {
    const input = "  line one\n\n  line two";
    expect(dedent(input)).toBe("line one\n\nline two");
  });

  it("returns empty string as-is", () => {
    expect(dedent("")).toBe("");
  });

  it("handles already-dedented text", () => {
    expect(dedent("no indent\nhere")).toBe("no indent\nhere");
  });
});

describe("joinWrappedLines", () => {
  it("joins continuation lines to bullet items", () => {
    const input = "- This is a long bullet that was\nwrapped by the terminal";
    expect(joinWrappedLines(input)).toBe(
      "- This is a long bullet that was wrapped by the terminal",
    );
  });

  it("joins continuation lines in plain paragraphs", () => {
    const input = "This is a long paragraph that was\nwrapped by the terminal";
    expect(joinWrappedLines(input)).toBe(
      "This is a long paragraph that was wrapped by the terminal",
    );
  });

  it("does NOT join lines inside code blocks", () => {
    const input = "```\nline one\nline two\n```";
    expect(joinWrappedLines(input)).toBe("```\nline one\nline two\n```");
  });

  it("does NOT join lines that start with bullets/headers/numbered lists", () => {
    const input = "- bullet one\n- bullet two\n# Header\n1. numbered";
    expect(joinWrappedLines(input)).toBe(
      "- bullet one\n- bullet two\n# Header\n1. numbered",
    );
  });

  it("does NOT join lines after blank lines", () => {
    const input = "paragraph one\n\nparagraph two";
    expect(joinWrappedLines(input)).toBe("paragraph one\n\nparagraph two");
  });

  it("handles already-clean text (no-op)", () => {
    const input = "- bullet one\n- bullet two\n\n## Header\n\n- bullet three";
    expect(joinWrappedLines(input)).toBe(input);
  });
});

describe("restoreHeaders", () => {
  it("prepends ## to short standalone lines followed by blank", () => {
    const input = "Summary\n\n- bullet point";
    expect(restoreHeaders(input)).toBe("## Summary\n\n- bullet point");
  });

  it("skips lines that already have #", () => {
    const input = "## Summary\n\n- bullet";
    expect(restoreHeaders(input)).toBe("## Summary\n\n- bullet");
  });

  it("skips bullet lines", () => {
    const input = "- short line\n\nnext";
    expect(restoreHeaders(input)).toBe("- short line\n\nnext");
  });

  it("skips lines inside code blocks", () => {
    const input = "```\nSummary\n\n```";
    expect(restoreHeaders(input)).toBe("```\nSummary\n\n```");
  });

  it("skips lines longer than 40 chars", () => {
    const long = "A".repeat(41);
    const input = `${long}\n\nnext`;
    expect(restoreHeaders(input)).toBe(`${long}\n\nnext`);
  });
});

describe("collapseBlankLines", () => {
  it("replaces 3+ newlines with 2", () => {
    expect(collapseBlankLines("a\n\n\nb")).toBe("a\n\nb");
    expect(collapseBlankLines("a\n\n\n\n\nb")).toBe("a\n\nb");
  });

  it("preserves double newlines", () => {
    expect(collapseBlankLines("a\n\nb")).toBe("a\n\nb");
  });
});

describe("formatClaudeOutput", () => {
  it("handles the real prDescriptionEx example", () => {
    const input = [
      "  Summary",
      "",
      "  - Replace per-PoP edge cache with a 3-layer caching strategy (edge cache -> Cloudflare KV -> TwelveData) to prevent",
      "  exceeding TwelveData's 8 calls/minute rate limit",
      "  - Edge cache misses on different Cloudflare PoPs were independently calling TwelveData (4 credits each), so CI + a",
      "  browser request from different regions could burn all 8 credits simultaneously",
      "",
      "  What changed",
      "",
      "  - KV global cache (10 min TTL): All PoPs now share a single cached price via Cloudflare KV instead of maintaining",
      "  independent per-PoP caches",
      "  - Edge cache reduced to 1 min: Acts as a short-lived burst absorber in front of KV reads",
      "  - Stale fallback: If TwelveData returns bad data, serves stale KV instead of erroring",
      "",
      "  Test plan",
      "",
      "  - Create btc-prices KV namespace in Cloudflare dashboard",
      "  - Bind it to the worker as PRICES",
      "  - Deploy updated worker code",
      "  - Verify first request populates KV and returns fresh prices",
      "  - Verify subsequent requests from different locations serve from KV (no additional TwelveData calls)",
    ].join("\n");

    const output = formatClaudeOutput(input);
    expect(output).toBe(
      [
        "Summary",
        "",
        "- Replace per-PoP edge cache with a 3-layer caching strategy (edge cache -> Cloudflare KV -> TwelveData) to prevent exceeding TwelveData's 8 calls/minute rate limit",
        "- Edge cache misses on different Cloudflare PoPs were independently calling TwelveData (4 credits each), so CI + a browser request from different regions could burn all 8 credits simultaneously",
        "",
        "What changed",
        "",
        "- KV global cache (10 min TTL): All PoPs now share a single cached price via Cloudflare KV instead of maintaining independent per-PoP caches",
        "- Edge cache reduced to 1 min: Acts as a short-lived burst absorber in front of KV reads",
        "- Stale fallback: If TwelveData returns bad data, serves stale KV instead of erroring",
        "",
        "Test plan",
        "",
        "- Create btc-prices KV namespace in Cloudflare dashboard",
        "- Bind it to the worker as PRICES",
        "- Deploy updated worker code",
        "- Verify first request populates KV and returns fresh prices",
        "- Verify subsequent requests from different locations serve from KV (no additional TwelveData calls)",
      ].join("\n"),
    );
  });

  it("restores headers when option enabled", () => {
    const input = "  Summary\n\n  - bullet";
    const output = formatClaudeOutput(input, { restoreHeaders: true });
    expect(output).toBe("## Summary\n\n- bullet");
  });

  it("does not restore headers by default", () => {
    const input = "  Summary\n\n  - bullet";
    const output = formatClaudeOutput(input);
    expect(output).toBe("Summary\n\n- bullet");
  });

  it("returns empty string for empty input", () => {
    expect(formatClaudeOutput("")).toBe("");
  });

  it("handles already-clean input", () => {
    const clean = "## Summary\n\n- bullet point";
    expect(formatClaudeOutput(clean)).toBe(clean);
  });

  it("preserves nested list indentation", () => {
    const input = "  - top\n    - nested\n      - deep";
    expect(formatClaudeOutput(input)).toBe("- top\n  - nested\n    - deep");
  });

  it("preserves code block content", () => {
    const input = "  ```\n    const x = 1;\n  ```";
    expect(formatClaudeOutput(input)).toBe("```\n  const x = 1;\n```");
  });
});
