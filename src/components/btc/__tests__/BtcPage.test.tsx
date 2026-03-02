import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { BtcPage } from "../BtcPage.tsx";

vi.mock("../../../hooks/useBtcPrices.ts", () => ({
  useBtcPrices: () => ({
    prices: {
      btc: 65_296.67,
      fbtc: 57.15,
      ts: "2025-01-01T00:00:00Z",
      source: "default" as const,
    },
    loading: false,
  }),
}));

beforeEach(() => {
  localStorage.clear();
});

afterEach(cleanup);

describe("BtcPage", () => {
  it("renders the heading", () => {
    render(<BtcPage />);
    expect(screen.getByText("BTC Holdings Visualizer")).toBeInTheDocument();
  });

  it("renders BTC and FBTC input groups", () => {
    render(<BtcPage />);
    expect(screen.getByText("BTC Holdings")).toBeInTheDocument();
    expect(screen.getByText("FBTC Holdings")).toBeInTheDocument();
  });

  it("shows total holdings as zero initially", () => {
    render(<BtcPage />);
    expect(screen.getByTestId("total-btc")).toHaveTextContent("0.00000000");
    expect(screen.getByTestId("current-value")).toHaveTextContent("$0.00");
  });

  it("updates total when BTC amount is entered", () => {
    render(<BtcPage />);
    const btcInput = screen.getByLabelText("BTC amount 1");
    fireEvent.change(btcInput, { target: { value: "1" } });
    expect(screen.getByTestId("total-btc")).toHaveTextContent("1.00000000");
  });

  it("toggles BTC input to USD mode", () => {
    render(<BtcPage />);
    const btcButtons = screen.getAllByText("USD");
    fireEvent.click(btcButtons[0]);
    expect(screen.getByLabelText("USD amount for BTC 1")).toBeInTheDocument();
  });

  it("toggles FBTC input to USD mode", () => {
    render(<BtcPage />);
    const usdButtons = screen.getAllByText("USD");
    fireEvent.click(usdButtons[1]);
    expect(screen.getByLabelText("USD amount for FBTC 1")).toBeInTheDocument();
  });

  it("renders the what-if table with price points", () => {
    render(<BtcPage />);
    expect(screen.getByText("$100,000.00")).toBeInTheDocument();
    expect(screen.getByText("$200,000.00")).toBeInTheDocument();
    expect(screen.getByText("$500,000.00")).toBeInTheDocument();
    expect(screen.getByText("$1,000,000.00")).toBeInTheDocument();
  });

  it("persists BTC entries to localStorage as JSON array", () => {
    render(<BtcPage />);
    const btcInput = screen.getByLabelText("BTC amount 1");
    fireEvent.change(btcInput, { target: { value: "2.5" } });
    expect(localStorage.getItem("btc-holdings-btc")).toBe('["2.5"]');
  });

  it("loads BTC entries from localStorage (JSON array)", () => {
    localStorage.setItem("btc-holdings-btc", '["3.14","1.5"]');
    render(<BtcPage />);
    const inputs = screen.getAllByLabelText(/^BTC amount \d+$/);
    expect(inputs).toHaveLength(2);
    expect((inputs[0] as HTMLInputElement).value).toBe("3.14");
    expect((inputs[1] as HTMLInputElement).value).toBe("1.5");
  });

  it("migrates legacy single-value localStorage to array", () => {
    localStorage.setItem("btc-holdings-btc", "3.14");
    render(<BtcPage />);
    const btcInput = screen.getByLabelText("BTC amount 1") as HTMLInputElement;
    expect(btcInput.value).toBe("3.14");
  });

  it("updates what-if values when custom price is entered", () => {
    render(<BtcPage />);
    const btcInput = screen.getByLabelText("BTC amount 1");
    fireEvent.change(btcInput, { target: { value: "1" } });
    const customInput = screen.getByLabelText("Custom BTC price");
    fireEvent.change(customInput, { target: { value: "150000" } });
    expect(screen.getByText("$150,000.00")).toBeInTheDocument();
  });

  it("adds a new BTC entry when + is clicked", () => {
    render(<BtcPage />);
    const addButtons = screen.getAllByText("+");
    fireEvent.click(addButtons[0]);
    const inputs = screen.getAllByLabelText(/^BTC amount \d+$/);
    expect(inputs).toHaveLength(2);
  });

  it("removes a BTC entry when x is clicked", () => {
    localStorage.setItem("btc-holdings-btc", '["1","2"]');
    render(<BtcPage />);
    const removeButton = screen.getByLabelText("Remove BTC entry 1");
    fireEvent.click(removeButton);
    const inputs = screen.getAllByLabelText(/^BTC amount \d+$/);
    expect(inputs).toHaveLength(1);
    expect((inputs[0] as HTMLInputElement).value).toBe("2");
  });

  it("sums multiple BTC entries in total", () => {
    localStorage.setItem("btc-holdings-btc", '["1","2.5"]');
    render(<BtcPage />);
    expect(screen.getByTestId("total-btc")).toHaveTextContent("3.50000000");
  });

  it("clears value instead of removing when only one entry", () => {
    localStorage.setItem("btc-holdings-btc", '["2.5"]');
    render(<BtcPage />);
    const removeButton = screen.getByLabelText("Remove BTC entry 1");
    fireEvent.click(removeButton);
    const input = screen.getByLabelText("BTC amount 1") as HTMLInputElement;
    expect(input.value).toBe("");
  });

  it("does not persist empty or zero entries to localStorage", () => {
    render(<BtcPage />);
    const btcInput = screen.getByLabelText("BTC amount 1");
    fireEvent.change(btcInput, { target: { value: "0" } });
    expect(localStorage.getItem("btc-holdings-btc")).toBeNull();
    fireEvent.change(btcInput, { target: { value: "" } });
    expect(localStorage.getItem("btc-holdings-btc")).toBeNull();
  });

  it("only persists non-empty non-zero entries", () => {
    localStorage.setItem("btc-holdings-btc", '["1","2"]');
    render(<BtcPage />);
    const inputs = screen.getAllByLabelText(/^BTC amount \d+$/);
    fireEvent.change(inputs[0], { target: { value: "0" } });
    expect(localStorage.getItem("btc-holdings-btc")).toBe('["2"]');
  });

  it("shows price source attribution", () => {
    render(<BtcPage />);
    expect(
      screen.getByText(/Pricing information accurate as of/),
    ).toBeInTheDocument();
  });
});
