import { describe, it, expect, afterEach, vi, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { PriceSource, formatRelativeTime } from "../PriceSource.tsx";
import type { BtcPrices } from "../../../lib/types.ts";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("formatRelativeTime", () => {
  it("shows seconds only for short durations", () => {
    const ts = "2026-03-01T12:00:00Z";
    const now = new Date("2026-03-01T12:00:45Z").getTime();
    expect(formatRelativeTime(ts, now)).toBe("45 seconds ago");
  });

  it("shows minutes and seconds", () => {
    const ts = "2026-03-01T12:00:00Z";
    const now = new Date("2026-03-01T12:02:30Z").getTime();
    expect(formatRelativeTime(ts, now)).toBe("2 min and 30 seconds ago");
  });

  it("shows hours, minutes, and seconds", () => {
    const ts = "2026-03-01T12:00:00Z";
    const now = new Date("2026-03-01T15:12:05Z").getTime();
    expect(formatRelativeTime(ts, now)).toBe(
      "3 hours, 12 min and 5 seconds ago",
    );
  });

  it("shows days, hours, minutes, and seconds", () => {
    const ts = "2026-03-01T12:00:00Z";
    const now = new Date("2026-03-02T15:12:05Z").getTime();
    expect(formatRelativeTime(ts, now)).toBe(
      "1 day, 3 hours, 12 min and 5 seconds ago",
    );
  });

  it("handles singular units", () => {
    const ts = "2026-03-01T12:00:00Z";
    const now = new Date("2026-03-01T13:01:01Z").getTime();
    expect(formatRelativeTime(ts, now)).toBe("1 hour, 1 min and 1 second ago");
  });

  it("returns 0 seconds for identical timestamps", () => {
    const ts = "2026-03-01T12:00:00Z";
    const now = new Date("2026-03-01T12:00:00Z").getTime();
    expect(formatRelativeTime(ts, now)).toBe("0 seconds ago");
  });

  it("omits zero-value segments except seconds", () => {
    const ts = "2026-03-01T12:00:00Z";
    const now = new Date("2026-03-02T12:00:07Z").getTime();
    expect(formatRelativeTime(ts, now)).toBe("1 day and 7 seconds ago");
  });
});

describe("PriceSource", () => {
  it("shows relative time and Twelve Data link", () => {
    vi.setSystemTime(new Date("2026-03-01T14:32:30Z"));
    const prices: BtcPrices = {
      btc: 97432.15,
      fbtc: 84.23,
      ts: "2026-03-01T14:30:00Z",
      source: "live",
    };
    render(<PriceSource prices={prices} />);
    expect(
      screen.getByText(/Pricing information accurate as of/),
    ).toBeInTheDocument();
    expect(screen.getByText(/2 min and 30 seconds ago/)).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "https://twelvedata.com",
    );
    expect(screen.getByText(/Not financial advice/)).toBeInTheDocument();
  });

  it("shows relative time for cached source", () => {
    vi.setSystemTime(new Date("2026-03-01T12:05:00Z"));
    const prices: BtcPrices = {
      btc: 65296.67,
      fbtc: 57.15,
      ts: "2026-03-01T12:00:00Z",
      source: "cached",
    };
    render(<PriceSource prices={prices} />);
    expect(screen.getByText(/5 min and 0 seconds ago/)).toBeInTheDocument();
  });

  it("shows relative time for default source", () => {
    vi.setSystemTime(new Date("2026-03-01T01:00:00Z"));
    const prices: BtcPrices = {
      btc: 65296.67,
      fbtc: 57.15,
      ts: "2026-03-01T00:00:00Z",
      source: "default",
    };
    render(<PriceSource prices={prices} />);
    expect(screen.getByText(/1 hour and 0 seconds ago/)).toBeInTheDocument();
  });
});
