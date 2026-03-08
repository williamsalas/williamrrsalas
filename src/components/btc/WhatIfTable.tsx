import { memo } from "react";
import {
  WHAT_IF_PRICES,
  formatUsd,
  sanitizeNumericInput,
  formatWithCommas,
} from "../../lib/btc.ts";

interface WhatIfTableProps {
  totalBtc: number;
  customPrice: string;
  onCustomPriceChange: (value: string) => void;
}

export const WhatIfTable = memo(function WhatIfTable({
  totalBtc,
  customPrice,
  onCustomPriceChange,
}: WhatIfTableProps) {
  const customPriceNum = parseFloat(customPrice);
  const hasCustom = !isNaN(customPriceNum) && customPriceNum > 0;

  return (
    <div className="btc-whatif">
      <h3 className="btc-whatif-heading">What If BTC Reaches...</h3>
      <table className="btc-whatif-table">
        <thead>
          <tr>
            <th>Price</th>
            <th>Your Value</th>
          </tr>
        </thead>
        <tbody>
          {WHAT_IF_PRICES.map((price) => (
            <tr key={price}>
              <td>{formatUsd(price)}</td>
              <td>{formatUsd(totalBtc * price)}</td>
            </tr>
          ))}
          <tr>
            <td>
              <span className="btc-input-prefix btc-custom-prefix">$</span>
              <input
                className="btc-input btc-custom-input"
                type="text"
                inputMode="decimal"
                name="custom-btc-price"
                value={formatWithCommas(customPrice)}
                onChange={(e) =>
                  onCustomPriceChange(sanitizeNumericInput(e.target.value))
                }
                placeholder="Custom"
                aria-label="Custom BTC price"
              />
            </td>
            <td>{hasCustom ? formatUsd(totalBtc * customPriceNum) : "-"}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
});
