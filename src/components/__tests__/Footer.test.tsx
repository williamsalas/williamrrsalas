import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { Footer } from "../Footer.tsx";

afterEach(cleanup);

describe("Footer", () => {
  it("renders GitHub link", () => {
    render(<Footer />);
    const link = screen.getByLabelText("GitHub");
    expect(link).toHaveAttribute("href", "https://github.com/williamsalas");
  });

  it("renders LinkedIn link", () => {
    render(<Footer />);
    const link = screen.getByLabelText("LinkedIn");
    expect(link).toHaveAttribute(
      "href",
      "https://linkedin.com/in/williamsalas",
    );
  });

  it("opens links in new tab", () => {
    render(<Footer />);
    const links = screen.getAllByRole("link");
    links.forEach((link) => {
      expect(link).toHaveAttribute("target", "_blank");
    });
  });
});
