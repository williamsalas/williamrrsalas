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
      {visibleEtfs.map((ticker) => {
        const priceKey = TICKER_PRICE_KEY[ticker];
        const etfPrice = prices[priceKey] as number;
        const sharesPerBtc = prices.btc / etfPrice;
        return (
          <div className="btc-shares-per-btc-row" key={ticker}>
            <span className="btc-shares-per-btc-label">1 BTC</span>
            <span className="btc-shares-per-btc-value">
              {sharesPerBtc.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              {ticker} shares
            </span>
          </div>
        );
      })}
      <p className="btc-shares-per-btc-note">
        Based on BTC at $
        {prices.btc.toLocaleString("en-US", { maximumFractionDigits: 2 })}
        {visibleEtfs.map((ticker) => {
          const priceKey = TICKER_PRICE_KEY[ticker];
          const etfPrice = prices[priceKey] as number;
          return ` / ${ticker} at $${etfPrice.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
        })}
      </p>
    </div>
  );
});
