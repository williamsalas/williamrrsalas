import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { Header } from "../Header.tsx";

afterEach(cleanup);

describe("Header", () => {
  it("renders greeting", () => {
    render(<Header />);
    expect(screen.getByText(/hi, i'm william salas/)).toBeInTheDocument();
  });

  it("renders the pikachu image", () => {
    render(<Header />);
    const img = screen.getByAltText("Under Construction");
    expect(img).toBeInTheDocument();
    expect(img).toHaveClass("pikachu");
  });

  it("renders bio text", () => {
    render(<Header />);
    expect(
      screen.getByText(/software developer from southern california/),
    ).toBeInTheDocument();
  });
});
