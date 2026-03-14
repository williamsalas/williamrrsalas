import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { Header } from "../Header.tsx";

afterEach(cleanup);

const noop = () => {};

describe("Header", () => {
  it("renders greeting", () => {
    render(<Header navigate={noop} />);
    expect(screen.getByText(/hi, i'm william salas/)).toBeInTheDocument();
  });

  it("renders project carousel", () => {
    render(<Header navigate={noop} />);
    expect(screen.getByText("BTC Visualizer")).toBeInTheDocument();
    expect(screen.getByText("Guess the Globe")).toBeInTheDocument();
  });

  it("renders bio text", () => {
    render(<Header navigate={noop} />);
    expect(
      screen.getByText(/software developer from southern california/),
    ).toBeInTheDocument();
  });
});
