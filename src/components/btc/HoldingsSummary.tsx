import { formatBtc, formatUsd } from "../../lib/btc.ts";

interface HoldingsSummaryProps {
  btcBtc: number;
  fbtcBtc: number;
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

export function HoldingsSummary({
  btcBtc,
  fbtcBtc,
  btcPrice,
}: HoldingsSummaryProps) {
  const totalBtc = btcBtc + fbtcBtc;

  return (
    <div className="btc-summary">
      <h3 className="btc-summary-heading">Total Holdings</h3>
      <SummaryRow
        label="BTC"
        btc={btcBtc}
        btcPrice={btcPrice}
        testIdBtc="btc-holdings-btc"
        testIdUsd="btc-holdings-usd"
      />
      <SummaryRow
        label="FBTC"
        btc={fbtcBtc}
        btcPrice={btcPrice}
        testIdBtc="fbtc-holdings-btc"
        testIdUsd="fbtc-holdings-usd"
      />
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
}
