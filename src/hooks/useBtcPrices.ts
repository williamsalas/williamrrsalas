import { useState, useEffect } from "react";
import type { BtcPrices } from "../lib/types.ts";
import {
  DEFAULT_BTC_PRICE,
  DEFAULT_FBTC_PRICE,
  DEFAULT_IBIT_PRICE,
  DEFAULT_GBTC_PRICE,
} from "../lib/btc.ts";

const WORKER_URL = "https://wrrs.williamsalas24.workers.dev/prices";
const FALLBACK_URL = "data/btc-prices.json";

const DEFAULT_PRICES: BtcPrices = {
  btc: DEFAULT_BTC_PRICE,
  fbtc: DEFAULT_FBTC_PRICE,
  ibit: DEFAULT_IBIT_PRICE,
  gbtc: DEFAULT_GBTC_PRICE,
  ts: "2025-01-01T00:00:00Z",
  source: "default",
};

interface WorkerResponse {
  btc: number;
  fbtc: number;
  ibit: number;
  gbtc: number;
  ts: string;
}

function isValidResponse(data: unknown): data is WorkerResponse {
  return (
    typeof data === "object" &&
    data !== null &&
    typeof (data as WorkerResponse).btc === "number" &&
    typeof (data as WorkerResponse).fbtc === "number" &&
    typeof (data as WorkerResponse).ibit === "number" &&
    typeof (data as WorkerResponse).gbtc === "number" &&
    typeof (data as WorkerResponse).ts === "string" &&
    (data as WorkerResponse).btc > 0 &&
    (data as WorkerResponse).fbtc > 0 &&
    (data as WorkerResponse).ibit > 0 &&
    (data as WorkerResponse).gbtc > 0
  );
}

interface UseBtcPricesResult {
  prices: BtcPrices;
  loading: boolean;
}

export function useBtcPrices(): UseBtcPricesResult {
  const [prices, setPrices] = useState<BtcPrices>(DEFAULT_PRICES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function tryFetch(
      url: string,
      source: "live" | "cached",
    ): Promise<boolean> {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: unknown = await res.json();
      if (!isValidResponse(data)) throw new Error("Invalid response shape");
      if (!cancelled) {
        setPrices({
          btc: data.btc,
          fbtc: data.fbtc,
          ibit: data.ibit,
          gbtc: data.gbtc,
          ts: data.ts,
          source,
        });
        setLoading(false);
      }
      return true;
    }

    async function fetchPrices() {
      try {
        if (await tryFetch(WORKER_URL, "live")) return;
      } catch {
        // Fall through to static fallback
      }

      try {
        if (await tryFetch(FALLBACK_URL, "cached")) return;
      } catch {
        // Fall through to defaults
      }

      if (!cancelled) {
        setPrices(DEFAULT_PRICES);
        setLoading(false);
      }
    }

    fetchPrices();
    return () => {
      cancelled = true;
    };
  }, []);

  return { prices, loading };
}
