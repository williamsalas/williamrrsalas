import { describe, it, expect } from "vitest";
import { formatMonthDay } from "../date.ts";

describe("formatMonthDay", () => {
  it("formats an ISO date as 'Mon D'", () => {
    const result = formatMonthDay("2024-03-15T12:00:00Z");
    expect(result).toMatch(/Mar 15/);
  });

  it("returns empty string for empty input", () => {
    expect(formatMonthDay("")).toBe("");
  });
});
