import { memo } from "react";
import type { BtcPrices } from "../../lib/types.ts";

interface SharesPerBtcProps {
  prices: BtcPrices;
  visibleTickers: Set<string>;
}

const TICKER_PRICE_KEY: Record<string, keyof BtcPrices> = {
  FBTC: "fbtc",
  IBIT: "ibit",
  GBTC: "gbtc",
};

export const SharesPerBtc = memo(function SharesPerBtc({
  prices,
  visibleTickers,
}: SharesPerBtcProps) {
  const visibleEtfs = Object.keys(TICKER_PRICE_KEY).filter((t) =>
    visibleTickers.has(t),
  );

  if (visibleEtfs.length === 0) return null;

  return (
    <div className="btc-shares-per-btc">
      <h3 className="btc-shares-per-btc-heading">
        How many ETF shares are in a Bitcoin?
      </h3>
      <table className="btc-shares-per-btc-table">
        <thead>
          <tr>
            <th>Fund</th>
            <th>Share Price</th>
            <th>Shares / BTC</th>
          </tr>
        </thead>
        <tbody>
          {visibleEtfs.map((ticker) => {
            const priceKey = TICKER_PRICE_KEY[ticker];
            const etfPrice = prices[priceKey] as number;
            const sharesPerBtc = prices.btc / etfPrice;
            return (
              <tr
                className={`shares-row--${ticker.toLowerCase()}`}
                key={ticker}
              >
                <td>{ticker}</td>
                <td>
                  $
                  {etfPrice.toLocaleString("en-US", {
                    maximumFractionDigits: 2,
                  })}
                </td>
                <td>
                  {sharesPerBtc.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="btc-shares-per-btc-note">
        Based on BTC at $
        {prices.btc.toLocaleString("en-US", { maximumFractionDigits: 2 })}
      </p>
    </div>
  );
});
