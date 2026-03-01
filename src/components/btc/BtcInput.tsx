import { sanitizeNumericInput } from "../../lib/btc.ts";

interface BtcInputProps {
  entries: string[];
  mode: "btc" | "usd";
  onEntryChange: (index: number, value: string) => void;
  onAddEntry: () => void;
  onRemoveEntry: (index: number) => void;
  onModeChange: (mode: "btc" | "usd") => void;
}

export function BtcInput({
  entries,
  mode,
  onEntryChange,
  onAddEntry,
  onRemoveEntry,
  onModeChange,
}: BtcInputProps) {
  return (
    <div className="btc-input-group btc-input-group--btc">
      <label className="btc-label">BTC Holdings</label>
      {entries.map((entry, i) => (
        <div className="btc-input-row" key={i}>
          <span className="btc-input-prefix">
            {mode === "btc" ? "BTC" : "$"}
          </span>
          <input
            className="btc-input"
            type="text"
            inputMode="decimal"
            value={entry}
            onChange={(e) =>
              onEntryChange(i, sanitizeNumericInput(e.target.value))
            }
            placeholder={mode === "btc" ? "0.00000000" : "0.00"}
            aria-label={
              mode === "btc"
                ? `BTC amount ${i + 1}`
                : `USD amount for BTC ${i + 1}`
            }
          />
          {entries.length > 1 && (
            <button
              className="btc-entry-remove"
              onClick={() => onRemoveEntry(i)}
              aria-label={`Remove BTC entry ${i + 1}`}
            >
              x
            </button>
          )}
        </div>
      ))}
      <button className="btc-entry-add" onClick={onAddEntry}>
        +
      </button>
      <div className="btc-toggle-row">
        <button
          className={`btc-toggle ${mode === "btc" ? "btc-toggle-active" : ""}`}
          onClick={() => onModeChange("btc")}
        >
          BTC
        </button>
        <button
          className={`btc-toggle ${mode === "usd" ? "btc-toggle-active" : ""}`}
          onClick={() => onModeChange("usd")}
        >
          USD
        </button>
      </div>
    </div>
  );
}
