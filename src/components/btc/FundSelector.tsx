import { memo } from "react";
import type { FundConfig } from "../../lib/types.ts";
import btcLogo from "../../assets/img/btclogo.png";
import fidelityLogo from "../../assets/img/fidelitylogo.jpeg";
import blackrockLogo from "../../assets/img/blackrocklogo.png";
import grayscaleLogo from "../../assets/img/grayscalelogo.png";

const FUND_LOGOS: Record<string, string> = {
  BTC: btcLogo,
  FBTC: fidelityLogo,
  IBIT: blackrockLogo,
  GBTC: grayscaleLogo,
};

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
          <img
            src={FUND_LOGOS[fund.ticker] ?? btcLogo}
            alt=""
            className="fund-selector-logo"
          />
          {fund.ticker}
        </button>
      ))}
    </div>
  );
});
