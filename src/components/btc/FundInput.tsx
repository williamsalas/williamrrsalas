import { sanitizeNumericInput } from "../../lib/btc.ts";
import type { FundConfig } from "../../lib/types.ts";

interface FundInputProps {
  fund: FundConfig;
  entries: string[];
  mode: string;
  onEntryChange: (index: number, value: string) => void;
  onAddEntry: () => void;
  onRemoveEntry: (index: number) => void;
  onModeChange: (mode: string) => void;
}

export function FundInput({
  fund,
  entries,
  mode,
  onEntryChange,
  onAddEntry,
  onRemoveEntry,
  onModeChange,
}: FundInputProps) {
  const isNative = mode === fund.nativeMode;
  return (
    <div className={`btc-input-group btc-input-group--${fund.cssModifier}`}>
      <label className="btc-label">{fund.label}</label>
      {entries.map((entry, i) => (
        <div className="btc-input-row" key={i}>
          <span className="btc-input-prefix">
            {isNative ? fund.nativePrefix : "$"}
          </span>
          <input
            className="btc-input"
            type="text"
            inputMode="decimal"
            value={entry}
            onChange={(e) =>
              onEntryChange(i, sanitizeNumericInput(e.target.value))
            }
            placeholder={isNative ? fund.nativePlaceholder : "0.00"}
            aria-label={
              isNative
                ? `${fund.nativeAriaLabel} ${i + 1}`
                : `USD amount for ${fund.ticker} ${i + 1}`
            }
          />
          <button
            className="btc-entry-remove"
            onClick={() =>
              entries.length > 1 ? onRemoveEntry(i) : onEntryChange(i, "")
            }
            aria-label={`Remove ${fund.ticker} entry ${i + 1}`}
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
          className={`btc-toggle ${isNative ? "btc-toggle-active" : ""}`}
          onClick={() => onModeChange(fund.nativeMode)}
        >
          {fund.nativePrefix}
        </button>
        <button
          className={`btc-toggle ${!isNative ? "btc-toggle-active" : ""}`}
          onClick={() => onModeChange("usd")}
        >
          USD
        </button>
      </div>
    </div>
  );
}
