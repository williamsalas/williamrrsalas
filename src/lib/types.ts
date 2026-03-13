export interface GitHubEvent {
  id: string;
  type: string;
  created_at: string;
  repo?: {
    name?: string;
  };
  payload?: {
    action?: string;
    pull_request?: {
      number: number;
      html_url: string;
      title: string;
      merged?: boolean;
    };
  };
}

export interface TransformedEvent {
  id: string;
  type: string;
  created_at: string;
  repo: string | null;
  pr_number: number;
  url: string;
  title: string;
  merged: boolean;
  action: string | null;
}

export interface BtcPrices {
  btc: number;
  fbtc: number;
  ibit: number;
  gbtc: number;
  ts: string;
  source: "live" | "cached" | "default";
}

export interface FundEntry {
  amount: string;
  buyPrice?: number;
}

export type FundMode = "btc" | "shares" | "usd";

export interface FundConfig {
  ticker: string;
  label: string;
  lsKey: string;
  cssModifier: string;
  nativeMode: FundMode;
  nativePrefix: string;
  nativePlaceholder: string;
  nativeAriaLabel: string;
  parseHoldings: (amount: string, mode: FundMode, prices: BtcPrices) => number;
  toCanonical: (amount: string, mode: FundMode, prices: BtcPrices) => string;
}
