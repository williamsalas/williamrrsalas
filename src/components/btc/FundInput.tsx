import { memo, useState, useEffect } from "react";
import { sanitizeNumericInput, formatUsd } from "../../lib/btc.ts";
import type { FundConfig, FundEntry } from "../../lib/types.ts";

export interface FundInputProps {
  fund: FundConfig;
  entries: FundEntry[];
  onEntryChange: (index: number, value: string) => void;
  onDescriptionChange: (index: number, value: string) => void;
  onOpenAddDialog: () => void;
  onRemoveEntry: (index: number) => void;
  onConsolidate: (indices: number[]) => void;
}

export const FundInput = memo(function FundInput({
  fund,
  entries,
  onEntryChange,
  onDescriptionChange,
  onOpenAddDialog,
  onRemoveEntry,
  onConsolidate,
}: FundInputProps) {
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [noteOpen, setNoteOpen] = useState<Set<number>>(new Set());

  useEffect(() => {
    setSelected((prev) => (prev.size === 0 ? prev : new Set()));
    setNoteOpen((prev) => (prev.size === 0 ? prev : new Set()));
  }, [entries.length]);

  const toggleNote = (index: number) => {
    setNoteOpen((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const closeNoteIfEmpty = (index: number, value: string) => {
    if (!value) {
      setNoteOpen((prev) => {
        const next = new Set(prev);
        next.delete(index);
        return next;
      });
    }
  };

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
        <div className="btc-entry-wrap" key={i}>
          <div className="btc-input-row">
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
              className={`btc-note-toggle${noteOpen.has(i) || entry.description ? " btc-note-toggle--active" : ""}`}
              onClick={() => {
                toggleNote(i);
              }}
              aria-label={`${noteOpen.has(i) ? "Hide" : "Show"} note for ${fund.ticker} entry ${i + 1}`}
              title="Add note"
            >
              <i className="fa-regular fa-note-sticky" />
            </button>
            <button
              className="btc-entry-remove"
              onClick={() =>
                entries.length > 1 ? onRemoveEntry(i) : onEntryChange(i, "")
              }
              aria-label={`Remove ${fund.ticker} entry ${i + 1}`}
            >
              ×
            </button>
          </div>
          {(noteOpen.has(i) || !!entry.description) && (
            <input
              className="btc-entry-description"
              type="text"
              value={entry.description ?? ""}
              onChange={(e) => onDescriptionChange(i, e.target.value)}
              onBlur={(e) => closeNoteIfEmpty(i, e.target.value)}
              placeholder="add note..."
              maxLength={200}
              autoFocus={noteOpen.has(i) && !entry.description}
              aria-label={`Note for ${fund.ticker} entry ${i + 1}`}
            />
          )}
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
