import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { FundToggle } from "../FundToggle.tsx";
import { ETF_FUNDS } from "../../../lib/btc.ts";

afterEach(cleanup);

describe("FundToggle", () => {
  it("renders a button for each ETF fund", () => {
    render(
      <FundToggle
        funds={ETF_FUNDS}
        visibleTickers={new Set(["FBTC"])}
        onToggle={() => {}}
      />,
    );
    expect(screen.getByRole("button", { name: "FBTC" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "IBIT" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "GBTC" })).toBeInTheDocument();
  });

  it("marks visible fund buttons as active with aria-pressed", () => {
    render(
      <FundToggle
        funds={ETF_FUNDS}
        visibleTickers={new Set(["FBTC"])}
        onToggle={() => {}}
      />,
    );
    expect(screen.getByRole("button", { name: "FBTC" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "IBIT" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("calls onToggle with the ticker when clicked", () => {
    const onToggle = vi.fn();
    render(
      <FundToggle
        funds={ETF_FUNDS}
        visibleTickers={new Set(["FBTC"])}
        onToggle={onToggle}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "IBIT" }));
    expect(onToggle).toHaveBeenCalledWith("IBIT");
  });
});
