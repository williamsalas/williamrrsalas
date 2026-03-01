import { sanitizeNumericInput } from "../../lib/btc.ts";

interface FbtcInputProps {
  entries: string[];
  mode: "shares" | "usd";
  onEntryChange: (index: number, value: string) => void;
  onAddEntry: () => void;
  onRemoveEntry: (index: number) => void;
  onModeChange: (mode: "shares" | "usd") => void;
}

export function FbtcInput({
  entries,
  mode,
  onEntryChange,
  onAddEntry,
  onRemoveEntry,
  onModeChange,
}: FbtcInputProps) {
  return (
    <div className="btc-input-group btc-input-group--fbtc">
      <label className="btc-label">FBTC Holdings</label>
      {entries.map((entry, i) => (
        <div className="btc-input-row" key={i}>
          <span className="btc-input-prefix">
            {mode === "shares" ? "Shares" : "$"}
          </span>
          <input
            className="btc-input"
            type="text"
            inputMode="decimal"
            value={entry}
            onChange={(e) =>
              onEntryChange(i, sanitizeNumericInput(e.target.value))
            }
            placeholder={mode === "shares" ? "0" : "0.00"}
            aria-label={
              mode === "shares"
                ? `FBTC shares ${i + 1}`
                : `USD amount for FBTC ${i + 1}`
            }
          />
          <button
            className="btc-entry-remove"
            onClick={() =>
              entries.length > 1 ? onRemoveEntry(i) : onEntryChange(i, "")
            }
            aria-label={`Remove FBTC entry ${i + 1}`}
          >
            x
          </button>
        </div>
      ))}
      <button className="btc-entry-add" onClick={onAddEntry}>
        +
      </button>
      <div className="btc-toggle-row">
        <button
          className={`btc-toggle ${mode === "shares" ? "btc-toggle-active" : ""}`}
          onClick={() => onModeChange("shares")}
        >
          Shares
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
