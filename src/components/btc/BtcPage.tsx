import { useState, useEffect } from "react";
import { BtcInput } from "./BtcInput.tsx";
import { FbtcInput } from "./FbtcInput.tsx";
import { HoldingsSummary } from "./HoldingsSummary.tsx";
import { WhatIfTable } from "./WhatIfTable.tsx";
import { FbtcPerBtc } from "./FbtcPerBtc.tsx";
import {
  parseBtcHoldings,
  parseFbtcHoldings,
  btcToCanonical,
  fbtcToCanonicalShares,
  parseStoredEntries,
} from "../../lib/btc.ts";

const LS_BTC_KEY = "btc-holdings-btc";
const LS_FBTC_KEY = "btc-holdings-fbtc-shares";

export function BtcPage() {
  const [btcEntries, setBtcEntries] = useState(() =>
    parseStoredEntries(localStorage.getItem(LS_BTC_KEY)),
  );
  const [btcMode, setBtcMode] = useState<"btc" | "usd">("btc");

  const [fbtcEntries, setFbtcEntries] = useState(() =>
    parseStoredEntries(localStorage.getItem(LS_FBTC_KEY)),
  );
  const [fbtcMode, setFbtcMode] = useState<"shares" | "usd">("shares");

  const [customPrice, setCustomPrice] = useState("");

  useEffect(() => {
    const canonicals = btcEntries
      .map((e) => btcToCanonical(e, btcMode))
      .filter((c) => c !== "" && parseFloat(c) !== 0);
    if (canonicals.length > 0) {
      localStorage.setItem(LS_BTC_KEY, JSON.stringify(canonicals));
    } else {
      localStorage.removeItem(LS_BTC_KEY);
    }
  }, [btcEntries, btcMode]);

  useEffect(() => {
    const canonicals = fbtcEntries
      .map((e) => fbtcToCanonicalShares(e, fbtcMode))
      .filter((c) => c !== "" && parseFloat(c) !== 0);
    if (canonicals.length > 0) {
      localStorage.setItem(LS_FBTC_KEY, JSON.stringify(canonicals));
    } else {
      localStorage.removeItem(LS_FBTC_KEY);
    }
  }, [fbtcEntries, fbtcMode]);

  const handleBtcEntryChange = (index: number, value: string) => {
    setBtcEntries((prev) => prev.map((e, i) => (i === index ? value : e)));
  };

  const handleAddBtcEntry = () => {
    setBtcEntries((prev) => [...prev, ""]);
  };

  const handleRemoveBtcEntry = (index: number) => {
    setBtcEntries((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFbtcEntryChange = (index: number, value: string) => {
    setFbtcEntries((prev) => prev.map((e, i) => (i === index ? value : e)));
  };

  const handleAddFbtcEntry = () => {
    setFbtcEntries((prev) => [...prev, ""]);
  };

  const handleRemoveFbtcEntry = (index: number) => {
    setFbtcEntries((prev) => prev.filter((_, i) => i !== index));
  };

  const btcBtc = btcEntries.reduce(
    (sum, e) => sum + parseBtcHoldings(e, btcMode),
    0,
  );
  const fbtcBtc = fbtcEntries.reduce(
    (sum, e) => sum + parseFbtcHoldings(e, fbtcMode),
    0,
  );
  const totalBtc = btcBtc + fbtcBtc;

  return (
    <div className="btc-page">
      <h2 className="btc-heading">BTC Holdings Visualizer</h2>
      <div className="btc-inputs">
        <BtcInput
          entries={btcEntries}
          mode={btcMode}
          onEntryChange={handleBtcEntryChange}
          onAddEntry={handleAddBtcEntry}
          onRemoveEntry={handleRemoveBtcEntry}
          onModeChange={setBtcMode}
        />
        <FbtcInput
          entries={fbtcEntries}
          mode={fbtcMode}
          onEntryChange={handleFbtcEntryChange}
          onAddEntry={handleAddFbtcEntry}
          onRemoveEntry={handleRemoveFbtcEntry}
          onModeChange={setFbtcMode}
        />
      </div>
      <HoldingsSummary btcBtc={btcBtc} fbtcBtc={fbtcBtc} />
      <WhatIfTable
        totalBtc={totalBtc}
        customPrice={customPrice}
        onCustomPriceChange={setCustomPrice}
      />
      <FbtcPerBtc />
      <p className="btc-disclaimer">
        Demo - BTC and{" "}
        <a
          href="https://digital.fidelity.com/prgw/digital/research/quote/dashboard/summary?symbol=FBTC"
          target="_blank"
          rel="noopener noreferrer"
        >
          FBTC
        </a>{" "}
        prices are hardcoded. Live pricing via{" "}
        <a
          href="https://twelvedata.com/docs#overview"
          target="_blank"
          rel="noopener noreferrer"
        >
          Twelve Data API
        </a>{" "}
        coming soon.
      </p>
    </div>
  );
}
