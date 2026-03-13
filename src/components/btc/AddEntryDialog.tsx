import { useRef, useEffect, useState } from "react";
import { sanitizeNumericInput, formatWithCommas } from "../../lib/btc.ts";
import type { FundConfig, FundEntry } from "../../lib/types.ts";

const DISMISS_THRESHOLD = 100;

const ACCENT_COLORS: Record<string, string> = {
  btc: "#f7931a",
  fbtc: "#76a923",
  ibit: "#ffffff",
  gbtc: "#9481c4",
};

interface AddEntryDialogProps {
  fund: FundConfig;
  currentPrice: number;
  onAdd: (entry: FundEntry) => void;
  onCancel: () => void;
}

export function AddEntryDialog({
  fund,
  currentPrice,
  onAdd,
  onCancel,
}: AddEntryDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const dragY = useRef<number | null>(null);
  const offsetYRef = useRef(0);
  const [offsetY, setOffsetY] = useState(0);
  const [mode, setMode] = useState<"native" | "usd">("native");
  const [amount, setAmount] = useState("");
  const [buyPrice, setBuyPrice] = useState(currentPrice.toString());

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;

    const handleTouchStart = (e: TouchEvent) => {
      dragY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (dragY.current === null) return;
      const dy = Math.max(0, e.touches[0].clientY - dragY.current);
      if (dy > 0) e.preventDefault();
      offsetYRef.current = dy;
      setOffsetY(dy);
    };

    const handleTouchEnd = () => {
      if (offsetYRef.current > DISMISS_THRESHOLD) {
        el.close();
      } else {
        setOffsetY(0);
      }
      offsetYRef.current = 0;
      dragY.current = null;
    };

    el.addEventListener("touchstart", handleTouchStart);
    el.addEventListener("touchmove", handleTouchMove, { passive: false });
    el.addEventListener("touchend", handleTouchEnd);
    return () => {
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove", handleTouchMove);
      el.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  const parsedAmount = parseFloat(amount);
  const parsedBuyPrice = parseFloat(buyPrice);
  const isValid =
    mode === "native"
      ? !isNaN(parsedAmount) && parsedAmount > 0
      : !isNaN(parsedAmount) &&
        parsedAmount > 0 &&
        !isNaN(parsedBuyPrice) &&
        parsedBuyPrice > 0;

  const handleAdd = () => {
    if (!isValid) return;
    if (mode === "native") {
      onAdd({ amount });
    } else {
      const converted = (parsedAmount / parsedBuyPrice).toString();
      onAdd({ amount: converted, buyPrice: parsedBuyPrice });
    }
  };

  const style: React.CSSProperties & Record<string, string> = {
    "--accent": ACCENT_COLORS[fund.cssModifier] ?? ACCENT_COLORS.btc,
  };
  if (offsetY > 0) {
    style.transform = `translateY(${offsetY}px)`;
    style.transition = "none";
  }

  return (
    <dialog
      ref={dialogRef}
      className="add-entry-dialog"
      style={style}
      onClose={onCancel}
      onClick={(e) => {
        if (e.target === dialogRef.current) dialogRef.current?.close();
      }}
    >
      <div className="add-entry-dialog-handle" />
      <div className="add-entry-dialog-content">
        <h3 className="add-entry-dialog-title">Add {fund.ticker} Entry</h3>
        <div className="add-entry-dialog-toggle">
          <button
            className={`add-entry-dialog-toggle-btn${mode === "native" ? " add-entry-dialog-toggle-btn--active" : ""}`}
            onClick={() => setMode("native")}
            type="button"
          >
            {fund.nativePrefix}
          </button>
          <button
            className={`add-entry-dialog-toggle-btn${mode === "usd" ? " add-entry-dialog-toggle-btn--active" : ""}`}
            onClick={() => setMode("usd")}
            type="button"
          >
            USD
          </button>
        </div>
        <label className="add-entry-dialog-label">
          {mode === "native" ? fund.nativePrefix : "USD Amount"}
          <input
            className="add-entry-dialog-input"
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(sanitizeNumericInput(e.target.value))}
            placeholder={mode === "native" ? fund.nativePlaceholder : "0.00"}
            autoFocus
            aria-label={
              mode === "native"
                ? `${fund.ticker} amount`
                : `USD amount for ${fund.ticker}`
            }
          />
        </label>
        <div
          className={`add-entry-dialog-usd-fields${mode === "usd" ? " add-entry-dialog-usd-fields--open" : ""}`}
        >
          <div className="add-entry-dialog-usd-fields-inner">
            <label className="add-entry-dialog-label">
              Price per {fund.nativeMode === "btc" ? "BTC" : "share"}
              <input
                className="add-entry-dialog-input"
                type="text"
                inputMode="decimal"
                value={buyPrice}
                tabIndex={mode === "usd" ? 0 : -1}
                onChange={(e) =>
                  setBuyPrice(sanitizeNumericInput(e.target.value))
                }
                aria-label={`Buy price per ${fund.nativeMode === "btc" ? "BTC" : "share"}`}
              />
            </label>
            {isValid && (
              <div className="add-entry-dialog-preview">
                ={" "}
                {formatWithCommas(
                  (parsedAmount / parsedBuyPrice).toFixed(
                    fund.nativeMode === "btc" ? 8 : 2,
                  ),
                )}{" "}
                {fund.nativePrefix}
              </div>
            )}
          </div>
        </div>
        <div className="add-entry-dialog-actions">
          <button
            className="add-entry-dialog-cancel"
            onClick={() => dialogRef.current?.close()}
            type="button"
          >
            Cancel
          </button>
          <button
            className="add-entry-dialog-add"
            onClick={handleAdd}
            disabled={!isValid}
            type="button"
          >
            Add
          </button>
        </div>
      </div>
    </dialog>
  );
}
