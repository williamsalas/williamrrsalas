import { describe, it, expect } from "vitest";
import {
  sanitizeNumericInput,
  parseBtcHoldings,
  parseEtfHoldings,
  formatUsd,
  formatBtc,
  btcToCanonical,
  etfToCanonicalShares,
  parseStoredEntries,
  formatWithCommas,
  DEFAULT_BTC_PRICE,
  DEFAULT_FBTC_PRICE,
  DEFAULT_IBIT_PRICE,
  DEFAULT_GBTC_PRICE,
} from "../btc.ts";

describe("sanitizeNumericInput", () => {
  it("allows digits and a single decimal point", () => {
    expect(sanitizeNumericInput("123.45")).toBe("123.45");
  });

  it("strips non-numeric characters", () => {
    expect(sanitizeNumericInput("$1,234.56")).toBe("1234.56");
  });

  it("allows only one decimal point", () => {
    expect(sanitizeNumericInput("1.2.3")).toBe("1.23");
  });

  it("returns empty string for empty input", () => {
    expect(sanitizeNumericInput("")).toBe("");
  });

  it("prepends 0 for leading decimal point", () => {
    expect(sanitizeNumericInput(".5")).toBe("0.5");
  });
});

describe("parseBtcHoldings", () => {
  it("returns BTC amount directly in btc mode", () => {
    expect(parseBtcHoldings("1.5", "btc", DEFAULT_BTC_PRICE)).toBe(1.5);
  });

  it("converts USD to BTC in usd mode", () => {
    const result = parseBtcHoldings(
      String(DEFAULT_BTC_PRICE),
      "usd",
      DEFAULT_BTC_PRICE,
    );
    expect(result).toBeCloseTo(1, 8);
  });

  it("returns 0 for empty string", () => {
    expect(parseBtcHoldings("", "btc", DEFAULT_BTC_PRICE)).toBe(0);
  });

  it("returns 0 for negative values", () => {
    expect(parseBtcHoldings("-1", "btc", DEFAULT_BTC_PRICE)).toBe(0);
  });

  it("returns 0 for non-numeric input", () => {
    expect(parseBtcHoldings("abc", "btc", DEFAULT_BTC_PRICE)).toBe(0);
  });
});

describe("parseEtfHoldings", () => {
  it("converts shares to BTC using FBTC/BTC ratio", () => {
    const result = parseEtfHoldings(
      "100",
      "shares",
      DEFAULT_BTC_PRICE,
      DEFAULT_FBTC_PRICE,
    );
    const expected = 100 * (DEFAULT_FBTC_PRICE / DEFAULT_BTC_PRICE);
    expect(result).toBeCloseTo(expected, 8);
  });

  it("converts USD to BTC in usd mode", () => {
    const result = parseEtfHoldings(
      String(DEFAULT_BTC_PRICE),
      "usd",
      DEFAULT_BTC_PRICE,
      DEFAULT_FBTC_PRICE,
    );
    expect(result).toBeCloseTo(1, 8);
  });

  it("returns 0 for empty string", () => {
    expect(
      parseEtfHoldings("", "shares", DEFAULT_BTC_PRICE, DEFAULT_FBTC_PRICE),
    ).toBe(0);
  });

  it("returns 0 for negative values", () => {
    expect(
      parseEtfHoldings("-5", "shares", DEFAULT_BTC_PRICE, DEFAULT_FBTC_PRICE),
    ).toBe(0);
  });
});

describe("formatUsd", () => {
  it("formats a number as USD currency", () => {
    expect(formatUsd(1234.5)).toBe("$1,234.50");
  });

  it("formats zero", () => {
    expect(formatUsd(0)).toBe("$0.00");
  });

  it("formats large numbers", () => {
    expect(formatUsd(1_000_000)).toBe("$1,000,000.00");
  });
});

describe("formatBtc", () => {
  it("formats with 8 decimal places", () => {
    expect(formatBtc(1.5)).toBe("1.50000000");
  });

  it("formats zero", () => {
    expect(formatBtc(0)).toBe("0.00000000");
  });
});

describe("btcToCanonical", () => {
  it("returns amount as-is in btc mode", () => {
    expect(btcToCanonical("1.5", "btc", DEFAULT_BTC_PRICE)).toBe("1.5");
  });

  it("converts USD to BTC string in usd mode", () => {
    const result = parseFloat(
      btcToCanonical(String(DEFAULT_BTC_PRICE), "usd", DEFAULT_BTC_PRICE),
    );
    expect(result).toBeCloseTo(1, 8);
  });

  it("returns empty string for invalid input", () => {
    expect(btcToCanonical("abc", "usd", DEFAULT_BTC_PRICE)).toBe("");
  });
});

describe("etfToCanonicalShares", () => {
  it("returns amount as-is in shares mode", () => {
    expect(etfToCanonicalShares("100", "shares", DEFAULT_FBTC_PRICE)).toBe(
      "100",
    );
  });

  it("converts USD to shares in usd mode", () => {
    const result = parseFloat(
      etfToCanonicalShares(
        String(DEFAULT_FBTC_PRICE),
        "usd",
        DEFAULT_FBTC_PRICE,
      ),
    );
    expect(result).toBeCloseTo(1, 8);
  });

  it("returns empty string for invalid input", () => {
    expect(etfToCanonicalShares("abc", "usd", DEFAULT_FBTC_PRICE)).toBe("");
  });
});

describe("parseStoredEntries", () => {
  it("returns [''] for null", () => {
    expect(parseStoredEntries(null)).toEqual([""]);
  });

  it("returns [''] for empty string", () => {
    expect(parseStoredEntries("")).toEqual([""]);
  });

  it("wraps a legacy single value in an array", () => {
    expect(parseStoredEntries("2.5")).toEqual(["2.5"]);
  });

  it("parses a JSON array", () => {
    expect(parseStoredEntries('["1","2.5"]')).toEqual(["1", "2.5"]);
  });

  it("returns [''] for an empty JSON array", () => {
    expect(parseStoredEntries("[]")).toEqual([""]);
  });

  it("returns legacy value for invalid JSON", () => {
    expect(parseStoredEntries("{bad")).toEqual(["{bad"]);
  });
});

describe("formatWithCommas", () => {
  it("returns empty string for empty input", () => {
    expect(formatWithCommas("")).toBe("");
  });

  it("adds commas to large integers", () => {
    expect(formatWithCommas("1000000")).toBe("1,000,000");
  });

  it("does not add commas to small numbers", () => {
    expect(formatWithCommas("999")).toBe("999");
  });

  it("preserves decimal portion", () => {
    expect(formatWithCommas("1234567.89")).toBe("1,234,567.89");
  });

  it("handles number with trailing dot", () => {
    expect(formatWithCommas("1000.")).toBe("1,000.");
  });
});

describe("default prices", () => {
  it("exports IBIT and GBTC default prices", () => {
    expect(DEFAULT_IBIT_PRICE).toBeGreaterThan(0);
    expect(DEFAULT_GBTC_PRICE).toBeGreaterThan(0);
  });
});
