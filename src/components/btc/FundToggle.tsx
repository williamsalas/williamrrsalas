import { memo } from "react";
import type { FundConfig } from "../../lib/types.ts";

interface FundToggleProps {
  funds: FundConfig[];
  visibleTickers: Set<string>;
  onToggle: (ticker: string) => void;
}

export const FundToggle = memo(function FundToggle({
  funds,
  visibleTickers,
  onToggle,
}: FundToggleProps) {
  return (
    <div className="fund-toggle">
      {funds.map((fund) => (
        <button
          key={fund.ticker}
          className={`fund-toggle-btn ${visibleTickers.has(fund.ticker) ? "fund-toggle-btn--active" : ""}`}
          onClick={() => onToggle(fund.ticker)}
          aria-pressed={visibleTickers.has(fund.ticker)}
        >
          {fund.ticker}
        </button>
      ))}
    </div>
  );
});
