import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import {
  render,
  screen,
  cleanup,
  fireEvent,
  within,
} from "@testing-library/react";
import { BtcPage } from "../BtcPage.tsx";

vi.mock("../../../hooks/useBtcPrices.ts", () => ({
  useBtcPrices: () => ({
    prices: {
      btc: 72_508.44,
      fbtc: 63.68,
      ibit: 41.45,
      gbtc: 56.975,
      ts: "2025-01-01T00:00:00Z",
      source: "default" as const,
    },
    loading: false,
  }),
}));

beforeEach(() => {
  localStorage.clear();
  HTMLDialogElement.prototype.showModal =
    HTMLDialogElement.prototype.showModal ||
    vi.fn(function (this: HTMLDialogElement) {
      this.setAttribute("open", "");
    });
  HTMLDialogElement.prototype.close =
    HTMLDialogElement.prototype.close ||
    vi.fn(function (this: HTMLDialogElement) {
      this.removeAttribute("open");
      this.dispatchEvent(new Event("close"));
    });
  window.matchMedia =
    window.matchMedia || vi.fn(() => ({ matches: false }) as MediaQueryList);
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

  it("renders 4 fund selector buttons", () => {
    const { container } = render(<BtcPage />);
    const selector = within(
      container.querySelector(".fund-selector")! as HTMLElement,
    );
    expect(selector.getByRole("button", { name: "BTC" })).toBeInTheDocument();
    expect(selector.getByRole("button", { name: "FBTC" })).toBeInTheDocument();
    expect(selector.getByRole("button", { name: "IBIT" })).toBeInTheDocument();
    expect(selector.getByRole("button", { name: "GBTC" })).toBeInTheDocument();
  });

  it("toggling IBIT shows its input group", () => {
    const { container } = render(<BtcPage />);
    const selector = within(
      container.querySelector(".fund-selector")! as HTMLElement,
    );
    expect(screen.queryByText("IBIT Holdings")).not.toBeInTheDocument();
    fireEvent.click(selector.getByRole("button", { name: "IBIT" }));
    expect(screen.getByText("IBIT Holdings")).toBeInTheDocument();
  });

  it("toggling off a fund hides its input group", () => {
    const { container } = render(<BtcPage />);
    const selector = within(
      container.querySelector(".fund-selector")! as HTMLElement,
    );
    expect(screen.getByText("FBTC Holdings")).toBeInTheDocument();
    fireEvent.click(selector.getByRole("button", { name: "FBTC" }));
    expect(screen.queryByText("FBTC Holdings")).not.toBeInTheDocument();
  });

  it("cannot deselect all funds - defaults back to BTC", () => {
    const { container } = render(<BtcPage />);
    const selector = within(
      container.querySelector(".fund-selector")! as HTMLElement,
    );
    fireEvent.click(selector.getByRole("button", { name: "FBTC" }));
    fireEvent.click(selector.getByRole("button", { name: "BTC" }));
    expect(screen.getByText("BTC Holdings")).toBeInTheDocument();
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

  it("renders the what-if table with price points", () => {
    render(<BtcPage />);
    expect(screen.getByText("$100,000.00")).toBeInTheDocument();
    expect(screen.getByText("$200,000.00")).toBeInTheDocument();
    expect(screen.getByText("$500,000.00")).toBeInTheDocument();
    expect(screen.getByText("$1,000,000.00")).toBeInTheDocument();
  });

  it("persists BTC entries to localStorage as FundEntry array", () => {
    render(<BtcPage />);
    const btcInput = screen.getByLabelText("BTC amount 1");
    fireEvent.change(btcInput, { target: { value: "2.5" } });
    expect(localStorage.getItem("btc-holdings-btc")).toBe('[{"amount":"2.5"}]');
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

  it("opens add dialog when + is clicked", () => {
    render(<BtcPage />);
    const addButtons = screen.getAllByText("+");
    fireEvent.click(addButtons[0]);
    expect(screen.getByText("Add BTC Entry")).toBeInTheDocument();
  });

  it("adds entry via dialog in native mode", () => {
    render(<BtcPage />);
    fireEvent.click(screen.getAllByText("+")[0]);
    const amountInput = screen.getByLabelText("BTC amount");
    fireEvent.change(amountInput, { target: { value: "1.5" } });
    fireEvent.click(screen.getByText("Add"));
    const inputs = screen.getAllByLabelText(/^BTC amount \d+$/);
    expect(inputs).toHaveLength(2);
    expect((inputs[1] as HTMLInputElement).value).toBe("1.5");
  });

  it("adds entry via dialog in USD mode with buy price annotation", () => {
    render(<BtcPage />);
    fireEvent.click(screen.getAllByText("+")[0]);
    fireEvent.click(screen.getByText("USD"));
    const amountInput = screen.getByLabelText("USD amount for BTC");
    fireEvent.change(amountInput, { target: { value: "72508.44" } });
    fireEvent.click(screen.getByText("Add"));
    const annotation = document.querySelector(".btc-entry-buy-price");
    expect(annotation).toBeInTheDocument();
    expect(annotation).toHaveTextContent("@ $72,508.44");
  });

  it("cancel dismisses dialog without adding", () => {
    render(<BtcPage />);
    fireEvent.click(screen.getAllByText("+")[0]);
    expect(screen.getByText("Add BTC Entry")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Cancel"));
    expect(screen.queryByText("Add BTC Entry")).not.toBeInTheDocument();
    expect(screen.getAllByLabelText(/^BTC amount \d+$/)).toHaveLength(1);
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
    expect(localStorage.getItem("btc-holdings-btc")).toBe('[{"amount":"2"}]');
  });

  it("shows price source attribution", () => {
    render(<BtcPage />);
    expect(
      screen.getByText(/Pricing information accurate as of/),
    ).toBeInTheDocument();
  });

  it("renders total banner with USD and BTC values", () => {
    localStorage.setItem("btc-holdings-btc", '["1"]');
    render(<BtcPage />);
    const banner = screen.getByTestId("total-banner");
    expect(banner).toHaveTextContent("$72,508.44");
    expect(banner).toHaveTextContent("1.00000000 BTC");
  });

  it("checkboxes hidden with only 1 row", () => {
    render(<BtcPage />);
    expect(
      screen.queryByLabelText(/^Select BTC entry/),
    ).not.toBeInTheDocument();
  });

  it("checkboxes shown with 2+ rows", () => {
    localStorage.setItem("btc-holdings-btc", '["1","2"]');
    render(<BtcPage />);
    expect(screen.getByLabelText("Select BTC entry 1")).toBeInTheDocument();
    expect(screen.getByLabelText("Select BTC entry 2")).toBeInTheDocument();
  });

  it("consolidate button hidden until 2+ checkboxes selected", () => {
    localStorage.setItem("btc-holdings-btc", '["1","2","3"]');
    render(<BtcPage />);
    expect(screen.queryByText(/Consolidate/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("Select BTC entry 1"));
    expect(screen.queryByText(/Consolidate/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("Select BTC entry 2"));
    expect(screen.getByText("Consolidate 2 selected")).toBeInTheDocument();
  });

  it("consolidate merges only selected entries, keeps unselected", () => {
    localStorage.setItem("btc-holdings-btc", '["1","2","3"]');
    render(<BtcPage />);

    // Select entries 1 and 3
    fireEvent.click(screen.getByLabelText("Select BTC entry 1"));
    fireEvent.click(screen.getByLabelText("Select BTC entry 3"));
    fireEvent.click(screen.getByText("Consolidate 2 selected"));

    const inputs = screen.getAllByLabelText(/^BTC amount \d+$/);
    expect(inputs).toHaveLength(2);
    // Sum of 1 + 3 = 4 in first position, unselected entry "2" kept
    expect((inputs[0] as HTMLInputElement).value).toBe("4");
    expect((inputs[1] as HTMLInputElement).value).toBe("2");
  });
});
