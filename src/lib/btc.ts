// TODO: Replace hardcoded prices with TwelveData API (free tier) - see https://twelvedata.com
export const BTC_PRICE_USD = 65_296.67;
export const FBTC_PRICE_USD = 57.15;

export const WHAT_IF_PRICES = [100_000, 200_000, 500_000, 1_000_000];

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

export function parseBtcHoldings(amount: string, mode: "btc" | "usd"): number {
  const n = parseFloat(amount);
  if (isNaN(n) || n < 0) return 0;
  if (mode === "btc") return n;
  return n / BTC_PRICE_USD;
}

export function parseFbtcHoldings(
  amount: string,
  mode: "shares" | "usd",
): number {
  const n = parseFloat(amount);
  if (isNaN(n) || n < 0) return 0;
  if (mode === "shares") return n * (FBTC_PRICE_USD / BTC_PRICE_USD);
  return n / BTC_PRICE_USD;
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

export function btcToCanonical(amount: string, mode: "btc" | "usd"): string {
  if (mode === "btc") return amount;
  const n = parseFloat(amount);
  if (isNaN(n) || n < 0) return "";
  return (n / BTC_PRICE_USD).toString();
}

export function fbtcToCanonicalShares(
  amount: string,
  mode: "shares" | "usd",
): string {
  if (mode === "shares") return amount;
  const n = parseFloat(amount);
  if (isNaN(n) || n < 0) return "";
  return (n / FBTC_PRICE_USD).toString();
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
