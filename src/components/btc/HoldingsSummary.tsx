import { formatBtc, formatUsd, BTC_PRICE_USD } from "../../lib/btc.ts";

interface HoldingsSummaryProps {
  totalBtc: number;
}

export function HoldingsSummary({ totalBtc }: HoldingsSummaryProps) {
  const currentValue = totalBtc * BTC_PRICE_USD;

  return (
    <div className="btc-summary">
      <h3 className="btc-summary-heading">Total Holdings</h3>
      <div className="btc-summary-row">
        <span className="btc-summary-label">BTC</span>
        <span className="btc-summary-value" data-testid="total-btc">
          {formatBtc(totalBtc)}
        </span>
      </div>
      <div className="btc-summary-row">
        <span className="btc-summary-label">Current Value</span>
        <span className="btc-summary-value" data-testid="current-value">
          {formatUsd(currentValue)}
        </span>
      </div>
      <div className="btc-summary-note">
        @ {formatUsd(BTC_PRICE_USD)} per BTC
      </div>
    </div>
  );
}
