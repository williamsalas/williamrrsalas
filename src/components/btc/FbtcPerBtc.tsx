import { BTC_PRICE_USD, FBTC_PRICE_USD } from "../../lib/btc.ts";

const SHARES_PER_BTC = BTC_PRICE_USD / FBTC_PRICE_USD;

export function FbtcPerBtc() {
  return (
    <div className="btc-fbtc-per-btc">
      <h3 className="btc-fbtc-per-btc-heading">
        How many FBTC shares are in a Bitcoin?
      </h3>
      <div className="btc-fbtc-per-btc-row">
        <span className="btc-fbtc-per-btc-label">1 BTC</span>
        <span className="btc-fbtc-per-btc-value">
          {SHARES_PER_BTC.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}{" "}
          FBTC shares
        </span>
      </div>
      <p className="btc-fbtc-per-btc-note">
        Based on BTC at $
        {BTC_PRICE_USD.toLocaleString("en-US", { maximumFractionDigits: 2 })} /
        FBTC at $
        {FBTC_PRICE_USD.toLocaleString("en-US", { maximumFractionDigits: 2 })}
      </p>
    </div>
  );
}
