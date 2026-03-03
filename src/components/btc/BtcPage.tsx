import { useState, useEffect, useMemo, useCallback } from "react";
import { FundInput } from "./FundInput.tsx";
import { HoldingsSummary } from "./HoldingsSummary.tsx";
import { WhatIfTable } from "./WhatIfTable.tsx";
import { FbtcPerBtc } from "./FbtcPerBtc.tsx";
import { PriceSource } from "./PriceSource.tsx";
import { ACTIVE_FUNDS, parseStoredEntries } from "../../lib/btc.ts";
import { useBtcPrices } from "../../hooks/useBtcPrices.ts";
import type { FundInputProps } from "./FundInput.tsx";
import { Footer } from "../Footer.tsx";

type FundHandlers = Pick<
  FundInputProps,
  "onEntryChange" | "onAddEntry" | "onRemoveEntry" | "onModeChange"
>;

export function BtcPage() {
  const { prices, loading } = useBtcPrices();

  const [entries, setEntries] = useState<Record<string, string[]>>(() =>
    Object.fromEntries(
      ACTIVE_FUNDS.map((fund) => [
        fund.ticker,
        parseStoredEntries(localStorage.getItem(fund.lsKey)),
      ]),
    ),
  );

  const [modes, setModes] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      ACTIVE_FUNDS.map((fund) => [fund.ticker, fund.nativeMode]),
    ),
  );

  const [customPrice, setCustomPrice] = useState("");

  useEffect(() => {
    ACTIVE_FUNDS.forEach((fund) => {
      const fundEntries = entries[fund.ticker] ?? [""];
      const canonicals = fundEntries
        .map((e) => fund.toCanonical(e, modes[fund.ticker], prices))
        .filter((c) => c !== "" && parseFloat(c) !== 0);
      if (canonicals.length > 0) {
        localStorage.setItem(fund.lsKey, JSON.stringify(canonicals));
      } else {
        localStorage.removeItem(fund.lsKey);
      }
    });
  }, [entries, modes, prices]);

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

  const handleModeChange = useCallback((ticker: string, mode: string) => {
    setModes((prev) => ({ ...prev, [ticker]: mode }));
  }, []);

  // Stable per-fund handler objects so React.memo on FundInput can bail out
  // when a sibling fund's entries change.
  const fundHandlers = useMemo<Record<string, FundHandlers>>(
    () =>
      Object.fromEntries(
        ACTIVE_FUNDS.map((fund) => [
          fund.ticker,
          {
            onEntryChange: (index: number, value: string) =>
              handleEntryChange(fund.ticker, index, value),
            onAddEntry: () => handleAddEntry(fund.ticker),
            onRemoveEntry: (index: number) =>
              handleRemoveEntry(fund.ticker, index),
            onModeChange: (mode: string) => handleModeChange(fund.ticker, mode),
          },
        ]),
      ),
    [handleEntryChange, handleAddEntry, handleRemoveEntry, handleModeChange],
  );

  const fundHoldings = useMemo(
    () =>
      ACTIVE_FUNDS.map((fund) => ({
        label: fund.ticker,
        btc: (entries[fund.ticker] ?? []).reduce(
          (sum, e) => sum + fund.parseHoldings(e, modes[fund.ticker], prices),
          0,
        ),
        testIdBtc: `${fund.ticker.toLowerCase()}-holdings-btc`,
        testIdUsd: `${fund.ticker.toLowerCase()}-holdings-usd`,
      })),
    [entries, modes, prices],
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
      <div className="btc-inputs">
        {ACTIVE_FUNDS.map((fund) => (
          <FundInput
            key={fund.ticker}
            fund={fund}
            entries={entries[fund.ticker] ?? [""]}
            mode={modes[fund.ticker]}
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
      <FbtcPerBtc btcPrice={prices.btc} fbtcPrice={prices.fbtc} />
      <PriceSource prices={prices} />
      <Footer />
    </div>
  );
}
