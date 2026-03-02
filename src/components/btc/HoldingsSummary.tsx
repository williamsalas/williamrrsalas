import { memo } from "react";
import { formatBtc, formatUsd } from "../../lib/btc.ts";

interface FundHolding {
  label: string;
  btc: number;
  testIdBtc?: string;
  testIdUsd?: string;
}

interface HoldingsSummaryProps {
  holdings: FundHolding[];
  btcPrice: number;
}

function SummaryRow({
  label,
  btc,
  btcPrice,
  testIdBtc,
  testIdUsd,
}: {
  label: string;
  btc: number;
  btcPrice: number;
  testIdBtc?: string;
  testIdUsd?: string;
}) {
  return (
    <div className="btc-summary-row">
      <span className="btc-summary-label">{label}</span>
      <span className="btc-summary-amounts">
        <span className="btc-summary-value" data-testid={testIdBtc}>
          {formatBtc(btc)} BTC
        </span>
        <span className="btc-summary-sep">/</span>
        <span className="btc-summary-value" data-testid={testIdUsd}>
          {formatUsd(btc * btcPrice)}
        </span>
      </span>
    </div>
  );
}

export const HoldingsSummary = memo(function HoldingsSummary({
  holdings,
  btcPrice,
}: HoldingsSummaryProps) {
  const totalBtc = holdings.reduce((sum, h) => sum + h.btc, 0);

  return (
    <div className="btc-summary">
      <h3 className="btc-summary-heading">Total Holdings</h3>
      {holdings.map((h) => (
        <SummaryRow
          key={h.label}
          label={h.label}
          btc={h.btc}
          btcPrice={btcPrice}
          testIdBtc={h.testIdBtc}
          testIdUsd={h.testIdUsd}
        />
      ))}
      <div className="btc-summary-divider" />
      <SummaryRow
        label="Combined"
        btc={totalBtc}
        btcPrice={btcPrice}
        testIdBtc="total-btc"
        testIdUsd="current-value"
      />
      <div className="btc-summary-note">@ {formatUsd(btcPrice)} per BTC</div>
    </div>
  );
});
