import { describe, it, expect } from "vitest";
import { formatMonthDay, daysSince } from "../date.ts";

describe("formatMonthDay", () => {
  it("formats an ISO date as 'Mon D'", () => {
    const result = formatMonthDay("2024-03-15T12:00:00Z");
    expect(result).toMatch(/Mar 15/);
  });

  it("returns empty string for empty input", () => {
    expect(formatMonthDay("")).toBe("");
  });
});

describe("daysSince", () => {
  it("returns 0 for today", () => {
    const now = new Date("2024-06-01T12:00:00Z");
    expect(daysSince("2024-06-01T00:00:00Z", now)).toBe(0);
  });

  it("returns correct day count", () => {
    const now = new Date("2024-06-10T12:00:00Z");
    expect(daysSince("2024-06-01T12:00:00Z", now)).toBe(9);
  });

  it("returns 0 for future dates", () => {
    const now = new Date("2024-06-01T12:00:00Z");
    expect(daysSince("2024-06-10T12:00:00Z", now)).toBe(0);
  });
});
