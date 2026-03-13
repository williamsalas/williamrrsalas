import { memo, useState, useEffect } from "react";
import { sanitizeNumericInput, formatUsd } from "../../lib/btc.ts";
import type { FundConfig, FundEntry } from "../../lib/types.ts";

export interface FundInputProps {
  fund: FundConfig;
  entries: FundEntry[];
  onEntryChange: (index: number, value: string) => void;
  onOpenAddDialog: () => void;
  onRemoveEntry: (index: number) => void;
  onConsolidate: (indices: number[]) => void;
}

export const FundInput = memo(function FundInput({
  fund,
  entries,
  onEntryChange,
  onOpenAddDialog,
  onRemoveEntry,
  onConsolidate,
}: FundInputProps) {
  const [selected, setSelected] = useState<Set<number>>(new Set());

  // Reset selection when entries length changes (rows added/removed/consolidated)
  useEffect(() => {
    setSelected((prev) => (prev.size === 0 ? prev : new Set()));
  }, [entries.length]);

  const toggleSelected = (index: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const handleConsolidate = () => {
    onConsolidate([...selected]);
    setSelected(new Set());
  };

  const showCheckboxes = entries.length >= 2;
  const canConsolidate = selected.size >= 2;

  return (
    <div className={`btc-input-group btc-input-group--${fund.cssModifier}`}>
      <div className="btc-label">{fund.label}</div>
      {entries.map((entry, i) => (
        <div className="btc-input-row" key={i}>
          {showCheckboxes && (
            <input
              type="checkbox"
              className="btc-entry-checkbox"
              checked={selected.has(i)}
              onChange={() => toggleSelected(i)}
              aria-label={`Select ${fund.ticker} entry ${i + 1}`}
            />
          )}
          <span className="btc-input-prefix">{fund.nativePrefix}</span>
          <input
            className="btc-input"
            type="text"
            inputMode="decimal"
            name={`${fund.cssModifier}-${i}`}
            value={entry.amount}
            onChange={(e) =>
              onEntryChange(i, sanitizeNumericInput(e.target.value))
            }
            placeholder={fund.nativePlaceholder}
            aria-label={`${fund.nativeAriaLabel} ${i + 1}`}
          />
          {entry.buyPrice != null && (
            <span className="btc-entry-buy-price">
              @ {formatUsd(entry.buyPrice)}
            </span>
          )}
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
      {canConsolidate && (
        <button
          className="btc-entry-consolidate"
          onClick={handleConsolidate}
          aria-label={`Consolidate ${selected.size} selected ${fund.ticker} entries`}
        >
          Consolidate {selected.size} selected
        </button>
      )}
      <button className="btc-entry-add" onClick={onOpenAddDialog}>
        +
      </button>
    </div>
  );
});
