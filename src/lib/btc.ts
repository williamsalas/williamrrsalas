import type { FundConfig } from "./types.ts";

export const DEFAULT_BTC_PRICE = 72_508.44;
export const DEFAULT_FBTC_PRICE = 63.68;
export const DEFAULT_IBIT_PRICE = 41.45;
export const DEFAULT_GBTC_PRICE = 56.975;

export const WHAT_IF_PRICES = [100_000, 126_200, 200_000, 500_000, 1_000_000];

export function sanitizeNumericInput(raw: string): string {
  // Allow only digits and a single decimal point
  let result = "";
  let hasDot = false;
  for (const ch of raw) {
    if (ch >= "0" && ch <= "9") {
      result += ch;
    } else if (ch === "." && !hasDot) {
      hasDot = true;
      result += ch;
    }
  }
  if (result.startsWith(".")) result = "0" + result;
  return result;
}

export function formatWithCommas(value: string): string {
  if (!value) return "";
  const [int, dec] = value.split(".");
  const withCommas = int.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return dec !== undefined ? `${withCommas}.${dec}` : withCommas;
}

export function parseBtcHoldings(
  amount: string,
  mode: "btc" | "usd",
  btcPrice: number,
): number {
  const n = parseFloat(amount);
  if (isNaN(n) || n < 0) return 0;
  if (mode === "btc") return n;
  return n / btcPrice;
}

export function parseEtfHoldings(
  amount: string,
  mode: "shares" | "usd",
  btcPrice: number,
  fbtcPrice: number,
): number {
  const n = parseFloat(amount);
  if (isNaN(n) || n < 0) return 0;
  if (mode === "shares") return n * (fbtcPrice / btcPrice);
  return n / btcPrice;
}

export function formatUsd(value: number): string {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatBtc(value: number): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 8,
    maximumFractionDigits: 8,
  });
}

export function btcToCanonical(
  amount: string,
  mode: "btc" | "usd",
  btcPrice: number,
): string {
  if (mode === "btc") return amount;
  const n = parseFloat(amount);
  if (isNaN(n) || n < 0) return "";
  return (n / btcPrice).toString();
}

export function etfToCanonicalShares(
  amount: string,
  mode: "shares" | "usd",
  fbtcPrice: number,
): string {
  if (mode === "shares") return amount;
  const n = parseFloat(amount);
  if (isNaN(n) || n < 0) return "";
  return (n / fbtcPrice).toString();
}

export function parseStoredEntries(raw: string | null): string[] {
  if (!raw) return [""];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    if (Array.isArray(parsed)) return [""];
    return [raw];
  } catch {
    return [raw];
  }
}

export const ALL_FUNDS: FundConfig[] = [
  {
    ticker: "BTC",
    label: "BTC Holdings",
    lsKey: "btc-holdings-btc",
    cssModifier: "btc",
    nativeMode: "btc",
    nativePrefix: "BTC",
    nativePlaceholder: "0.00000000",
    nativeAriaLabel: "BTC amount",
    parseHoldings: (amount, mode, prices) =>
      parseBtcHoldings(amount, mode as "btc" | "usd", prices.btc),
    toCanonical: (amount, mode, prices) =>
      btcToCanonical(amount, mode as "btc" | "usd", prices.btc),
  },
  {
    ticker: "FBTC",
    label: "FBTC Holdings",
    lsKey: "btc-holdings-fbtc-shares",
    cssModifier: "fbtc",
    nativeMode: "shares",
    nativePrefix: "Shares",
    nativePlaceholder: "0",
    nativeAriaLabel: "FBTC shares",
    parseHoldings: (amount, mode, prices) =>
      parseEtfHoldings(
        amount,
        mode as "shares" | "usd",
        prices.btc,
        prices.fbtc,
      ),
    toCanonical: (amount, mode, prices) =>
      etfToCanonicalShares(amount, mode as "shares" | "usd", prices.fbtc),
  },
  {
    ticker: "IBIT",
    label: "IBIT Holdings",
    lsKey: "btc-holdings-ibit-shares",
    cssModifier: "ibit",
    nativeMode: "shares",
    nativePrefix: "Shares",
    nativePlaceholder: "0",
    nativeAriaLabel: "IBIT shares",
    parseHoldings: (amount, mode, prices) =>
      parseEtfHoldings(
        amount,
        mode as "shares" | "usd",
        prices.btc,
        prices.ibit,
      ),
    toCanonical: (amount, mode, prices) =>
      etfToCanonicalShares(amount, mode as "shares" | "usd", prices.ibit),
  },
  {
    ticker: "GBTC",
    label: "GBTC Holdings",
    lsKey: "btc-holdings-gbtc-shares",
    cssModifier: "gbtc",
    nativeMode: "shares",
    nativePrefix: "Shares",
    nativePlaceholder: "0",
    nativeAriaLabel: "GBTC shares",
    parseHoldings: (amount, mode, prices) =>
      parseEtfHoldings(
        amount,
        mode as "shares" | "usd",
        prices.btc,
        prices.gbtc,
      ),
    toCanonical: (amount, mode, prices) =>
      etfToCanonicalShares(amount, mode as "shares" | "usd", prices.gbtc),
  },
];

export const ETF_FUNDS = ALL_FUNDS.filter((f) => f.ticker !== "BTC");
