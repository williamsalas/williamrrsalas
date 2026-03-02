import { formatBtc, formatUsd, BTC_PRICE_USD } from "../../lib/btc.ts";

interface HoldingsSummaryProps {
  btcBtc: number;
  fbtcBtc: number;
}

function SummaryRow({
  label,
  btc,
  testIdBtc,
  testIdUsd,
}: {
  label: string;
  btc: number;
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
          {formatUsd(btc * BTC_PRICE_USD)}
        </span>
      </span>
    </div>
  );
}

export function HoldingsSummary({ btcBtc, fbtcBtc }: HoldingsSummaryProps) {
  const totalBtc = btcBtc + fbtcBtc;

  return (
    <div className="btc-summary">
      <h3 className="btc-summary-heading">Total Holdings</h3>
      <SummaryRow
        label="BTC"
        btc={btcBtc}
        testIdBtc="btc-holdings-btc"
        testIdUsd="btc-holdings-usd"
      />
      <SummaryRow
        label="FBTC"
        btc={fbtcBtc}
        testIdBtc="fbtc-holdings-btc"
        testIdUsd="fbtc-holdings-usd"
      />
      <div className="btc-summary-divider" />
      <SummaryRow
        label="Combined"
        btc={totalBtc}
        testIdBtc="total-btc"
        testIdUsd="current-value"
      />
      <div className="btc-summary-note">@ {formatUsd(BTC_PRICE_USD)} per BTC</div>
    </div>
  );
}
