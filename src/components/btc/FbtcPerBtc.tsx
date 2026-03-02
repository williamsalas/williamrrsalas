interface FbtcPerBtcProps {
  btcPrice: number;
  fbtcPrice: number;
}

export function FbtcPerBtc({ btcPrice, fbtcPrice }: FbtcPerBtcProps) {
  const sharesPerBtc = btcPrice / fbtcPrice;

  return (
    <div className="btc-fbtc-per-btc">
      <h3 className="btc-fbtc-per-btc-heading">
        How many FBTC shares are in a Bitcoin?
      </h3>
      <div className="btc-fbtc-per-btc-row">
        <span className="btc-fbtc-per-btc-label">1 BTC</span>
        <span className="btc-fbtc-per-btc-value">
          {sharesPerBtc.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}{" "}
          FBTC shares
        </span>
      </div>
      <p className="btc-fbtc-per-btc-note">
        Based on BTC at $
        {btcPrice.toLocaleString("en-US", { maximumFractionDigits: 2 })} / FBTC
        at ${fbtcPrice.toLocaleString("en-US", { maximumFractionDigits: 2 })}
      </p>
    </div>
  );
}
