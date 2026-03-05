import { memo } from "react";
import type { FundConfig } from "../../lib/types.ts";
// todo later: add logos to selector
// import { FUND_LOGOS } from "../icons/FundLogos.tsx";

interface FundSelectorProps {
  funds: FundConfig[];
  visibleTickers: Set<string>;
  onToggle: (ticker: string) => void;
}

export const FundSelector = memo(function FundSelector({
  funds,
  visibleTickers,
  onToggle,
}: FundSelectorProps) {
  return (
    <div className="fund-selector">
      {funds.map((fund) => (
        <button
          key={fund.ticker}
          className={`fund-selector-btn ${visibleTickers.has(fund.ticker) ? "fund-selector-btn--active" : ""}`}
          onClick={() => onToggle(fund.ticker)}
          aria-pressed={visibleTickers.has(fund.ticker)}
        >
          {/* {FUND_LOGOS[fund.ticker]}  */}
          {fund.ticker}
        </button>
      ))}
    </div>
  );
});
