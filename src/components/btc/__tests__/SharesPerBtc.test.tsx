import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { SharesPerBtc } from "../SharesPerBtc.tsx";
import type { BtcPrices } from "../../../lib/types.ts";

afterEach(cleanup);

const prices: BtcPrices = {
  btc: 72_508.44,
  fbtc: 63.68,
  ibit: 41.45,
  gbtc: 56.975,
  ts: "2025-01-01T00:00:00Z",
  source: "default",
};

describe("SharesPerBtc", () => {
  it("renders nothing when no ETF funds are visible", () => {
    const { container } = render(
      <SharesPerBtc prices={prices} visibleTickers={new Set()} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("shows ratio for a single visible ETF fund", () => {
    render(<SharesPerBtc prices={prices} visibleTickers={new Set(["FBTC"])} />);
    expect(screen.getByText(/FBTC shares/)).toBeInTheDocument();
    expect(screen.queryByText(/IBIT shares/)).not.toBeInTheDocument();
  });

  it("shows ratios for multiple visible ETF funds", () => {
    render(
      <SharesPerBtc
        prices={prices}
        visibleTickers={new Set(["FBTC", "IBIT"])}
      />,
    );
    expect(screen.getByText(/FBTC shares/)).toBeInTheDocument();
    expect(screen.getByText(/IBIT shares/)).toBeInTheDocument();
  });

  it("computes the correct shares-per-BTC ratio", () => {
    render(<SharesPerBtc prices={prices} visibleTickers={new Set(["FBTC"])} />);
    const expected = (prices.btc / prices.fbtc).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    expect(screen.getByText(new RegExp(expected))).toBeInTheDocument();
  });
});
