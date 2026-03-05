import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { FundSelector } from "../FundSelector.tsx";
import { ALL_FUNDS } from "../../../lib/btc.ts";

afterEach(cleanup);

describe("FundSelector", () => {
  it("renders a button for each fund", () => {
    render(
      <FundSelector
        funds={ALL_FUNDS}
        visibleTickers={new Set(["BTC", "FBTC"])}
        onToggle={() => {}}
      />,
    );
    expect(screen.getByRole("button", { name: "BTC" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "FBTC" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "IBIT" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "GBTC" })).toBeInTheDocument();
  });

  it("marks visible fund buttons as active with aria-pressed", () => {
    render(
      <FundSelector
        funds={ALL_FUNDS}
        visibleTickers={new Set(["BTC", "FBTC"])}
        onToggle={() => {}}
      />,
    );
    expect(screen.getByRole("button", { name: "BTC" })).toHaveAttribute(
      "aria-pressed",
      "true",
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
      <FundSelector
        funds={ALL_FUNDS}
        visibleTickers={new Set(["BTC", "FBTC"])}
        onToggle={onToggle}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "IBIT" }));
    expect(onToggle).toHaveBeenCalledWith("IBIT");
  });
});
