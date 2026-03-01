import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useRoute } from "../useRoute.ts";

describe("useRoute", () => {
  beforeEach(() => {
    window.history.replaceState(null, "", "/");
  });

  it("reads the current path", () => {
    const { result } = renderHook(() => useRoute());
    expect(result.current.path).toBe("/");
  });

  it("updates path on navigate", () => {
    const { result } = renderHook(() => useRoute());
    act(() => {
      result.current.navigate("/btc");
    });
    expect(result.current.path).toBe("/btc");
    expect(window.location.pathname).toBe("/btc");
  });

  it("updates path on popstate", () => {
    const { result } = renderHook(() => useRoute());
    act(() => {
      window.history.pushState(null, "", "/btc");
      window.dispatchEvent(new PopStateEvent("popstate"));
    });
    expect(result.current.path).toBe("/btc");
  });
});
