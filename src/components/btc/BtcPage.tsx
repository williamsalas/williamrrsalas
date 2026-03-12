import { useState, useEffect, useMemo, useCallback } from "react";
import { FundInput } from "./FundInput.tsx";
import { FundSelector } from "./FundSelector.tsx";
import { HoldingsSummary } from "./HoldingsSummary.tsx";
import { WhatIfTable } from "./WhatIfTable.tsx";
import { SharesPerBtc } from "./SharesPerBtc.tsx";
import { PriceSource } from "./PriceSource.tsx";
import {
  ALL_FUNDS,
  parseStoredEntries,
  formatUsd,
  formatBtc,
} from "../../lib/btc.ts";
import { useBtcPrices } from "../../hooks/useBtcPrices.ts";
import type { FundInputProps } from "./FundInput.tsx";
import { Footer } from "../Footer.tsx";

type FundHandlers = Pick<
  FundInputProps,
  "onEntryChange" | "onAddEntry" | "onRemoveEntry" | "onConsolidate"
>;

const LS_VISIBLE_KEY = "btc-visible-tickers";
const DEFAULT_VISIBLE = ["BTC", "FBTC"];

function loadVisibleTickers(): Set<string> {
  try {
    const raw = localStorage.getItem(LS_VISIBLE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return new Set(parsed);
    }
  } catch {
    // fall through
  }
  return new Set(DEFAULT_VISIBLE);
}

export function BtcPage() {
  const { prices, loading } = useBtcPrices();

  const [visibleTickers, setVisibleTickers] =
    useState<Set<string>>(loadVisibleTickers);

  const [entries, setEntries] = useState<Record<string, string[]>>(() =>
    Object.fromEntries(
      ALL_FUNDS.map((fund) => [
        fund.ticker,
        parseStoredEntries(localStorage.getItem(fund.lsKey)),
      ]),
    ),
  );

  const [customPrice, setCustomPrice] = useState("");

  const activeFunds = useMemo(
    () => ALL_FUNDS.filter((f) => visibleTickers.has(f.ticker)),
    [visibleTickers],
  );

  const handleToggleFund = useCallback((ticker: string) => {
    setVisibleTickers((prev) => {
      const next = new Set(prev);
      if (next.has(ticker)) {
        next.delete(ticker);
        if (next.size === 0) next.add("BTC");
      } else {
        next.add(ticker);
      }
      return next;
    });
  }, []);

  useEffect(() => {
    localStorage.setItem(LS_VISIBLE_KEY, JSON.stringify([...visibleTickers]));
  }, [visibleTickers]);

  useEffect(() => {
    ALL_FUNDS.forEach((fund) => {
      const fundEntries = entries[fund.ticker] ?? [""];
      const canonicals = fundEntries
        .map((e) => fund.toCanonical(e, fund.nativeMode, prices))
        .filter((c) => c !== "" && parseFloat(c) !== 0);
      if (canonicals.length > 0) {
        localStorage.setItem(fund.lsKey, JSON.stringify(canonicals));
      } else {
        localStorage.removeItem(fund.lsKey);
      }
    });
  }, [entries, prices]);

  const handleEntryChange = useCallback(
    (ticker: string, index: number, value: string) => {
      setEntries((prev) => ({
        ...prev,
        [ticker]: prev[ticker].map((e, i) => (i === index ? value : e)),
      }));
    },
    [],
  );

  const handleAddEntry = useCallback((ticker: string) => {
    setEntries((prev) => ({
      ...prev,
      [ticker]: [...prev[ticker], ""],
    }));
  }, []);

  const handleRemoveEntry = useCallback((ticker: string, index: number) => {
    setEntries((prev) => ({
      ...prev,
      [ticker]: prev[ticker].filter((_, i) => i !== index),
    }));
  }, []);

  const handleConsolidate = useCallback((ticker: string, indices: number[]) => {
    setEntries((prev) => {
      const current = prev[ticker];
      const indexSet = new Set(indices);
      const sum = indices.reduce((acc, i) => {
        const val = parseFloat(current[i]);
        return acc + (isNaN(val) ? 0 : val);
      }, 0);
      const kept = current.filter((_, i) => !indexSet.has(i));
      return {
        ...prev,
        [ticker]: [parseFloat(sum.toFixed(8)).toString(), ...kept],
      };
    });
  }, []);

  // Stable per-fund handler objects so React.memo on FundInput can bail out
  // when a sibling fund's entries change.
  const fundHandlers = useMemo<Record<string, FundHandlers>>(
    () =>
      Object.fromEntries(
        ALL_FUNDS.map((fund) => [
          fund.ticker,
          {
            onEntryChange: (index: number, value: string) =>
              handleEntryChange(fund.ticker, index, value),
            onAddEntry: () => handleAddEntry(fund.ticker),
            onRemoveEntry: (index: number) =>
              handleRemoveEntry(fund.ticker, index),
            onConsolidate: (indices: number[]) =>
              handleConsolidate(fund.ticker, indices),
          },
        ]),
      ),
    [handleEntryChange, handleAddEntry, handleRemoveEntry, handleConsolidate],
  );

  const fundHoldings = useMemo(
    () =>
      activeFunds.map((fund) => ({
        label: fund.ticker,
        btc: (entries[fund.ticker] ?? []).reduce(
          (sum, e) => sum + fund.parseHoldings(e, fund.nativeMode, prices),
          0,
        ),
        testIdBtc: `${fund.ticker.toLowerCase()}-holdings-btc`,
        testIdUsd: `${fund.ticker.toLowerCase()}-holdings-usd`,
      })),
    [activeFunds, entries, prices],
  );

  const totalBtc = useMemo(
    () => fundHoldings.reduce((sum, f) => sum + f.btc, 0),
    [fundHoldings],
  );

  if (loading) {
    return (
      <div className="btc-page">
        <h2 className="btc-heading">BTC Holdings Visualizer</h2>
        <p className="btc-loading">Loading prices...</p>
      </div>
    );
  }

  return (
    <div className="btc-page">
      <h2 className="btc-heading">BTC Holdings Visualizer</h2>
      <div className="btc-total-banner" data-testid="total-banner">
        <span className="btc-total-banner-value">
          {formatUsd(totalBtc * prices.btc)}
        </span>
        <span className="btc-total-banner-btc">{formatBtc(totalBtc)} BTC</span>
      </div>
      <FundSelector
        funds={ALL_FUNDS}
        visibleTickers={visibleTickers}
        onToggle={handleToggleFund}
      />
      <div className="btc-inputs">
        {activeFunds.map((fund) => (
          <FundInput
            key={fund.ticker}
            fund={fund}
            entries={entries[fund.ticker] ?? [""]}
            {...fundHandlers[fund.ticker]}
          />
        ))}
      </div>
      <HoldingsSummary holdings={fundHoldings} btcPrice={prices.btc} />
      <WhatIfTable
        totalBtc={totalBtc}
        customPrice={customPrice}
        onCustomPriceChange={setCustomPrice}
      />
      <SharesPerBtc prices={prices} visibleTickers={visibleTickers} />
      <PriceSource prices={prices} />
      <Footer />
    </div>
  );
}
