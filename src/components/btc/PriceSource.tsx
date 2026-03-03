import { memo, useState, useEffect } from "react";
import type { BtcPrices } from "../../lib/types.ts";

interface PriceSourceProps {
  prices: BtcPrices;
}

export function formatRelativeTime(isoString: string, now: number): string {
  const then = new Date(isoString).getTime();
  let diff = Math.max(0, Math.floor((now - then) / 1000));

  const days = Math.floor(diff / 86400);
  diff %= 86400;
  const hours = Math.floor(diff / 3600);
  diff %= 3600;
  const min = Math.floor(diff / 60);
  const sec = diff % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days} day${days !== 1 ? "s" : ""}`);
  if (hours > 0) parts.push(`${hours} hour${hours !== 1 ? "s" : ""}`);
  if (min > 0) parts.push(`${min} min`);
  parts.push(`${sec} second${sec !== 1 ? "s" : ""}`);

  if (parts.length === 1) return `${parts[0]} ago`;
  const last = parts.pop()!;
  return `${parts.join(", ")} and ${last} ago`;
}

export const PriceSource = memo(function PriceSource({
  prices,
}: PriceSourceProps) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const relative = formatRelativeTime(prices.ts, now);

  return (
    <p className="btc-price-source">
      Pricing information accurate as of {relative} via{" "}
      <a
        href="https://twelvedata.com"
        target="_blank"
        rel="noopener noreferrer"
      >
        Twelve Data
      </a>
      <br />
      Not financial advice
    </p>
  );
});
