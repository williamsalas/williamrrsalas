import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useBtcPrices } from "../useBtcPrices.ts";

const mockWorkerResponse = {
  btc: 97432.15,
  fbtc: 84.23,
  ibit: 55.12,
  gbtc: 76.45,
  ts: "2026-03-01T14:30:00Z",
};

const mockCachedResponse = {
  btc: 72508.44,
  fbtc: 63.68,
  ibit: 41.45,
  gbtc: 56.975,
  ts: "2025-01-01T00:00:00Z",
};

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("useBtcPrices", () => {
  it("starts in loading state", () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(
      () => new Promise(() => {}),
    );
    const { result } = renderHook(() => useBtcPrices());
    expect(result.current.loading).toBe(true);
  });

  it("returns live prices from worker", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => mockWorkerResponse,
    } as Response);

    const { result } = renderHook(() => useBtcPrices());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.prices.source).toBe("live");
    expect(result.current.prices.btc).toBe(97432.15);
    expect(result.current.prices.fbtc).toBe(84.23);
    expect(result.current.prices.ibit).toBe(55.12);
    expect(result.current.prices.gbtc).toBe(76.45);
  });

  it("falls back to cached prices when worker fails", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockRejectedValueOnce(new Error("worker down"))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockCachedResponse,
      } as Response);

    const { result } = renderHook(() => useBtcPrices());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.prices.source).toBe("cached");
    expect(result.current.prices.btc).toBe(72508.44);
  });

  it("falls back to defaults when both sources fail", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("fail"));

    const { result } = renderHook(() => useBtcPrices());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.prices.source).toBe("default");
    expect(result.current.prices.btc).toBe(72508.44);
    expect(result.current.prices.fbtc).toBe(63.68);
  });

  it("rejects invalid response shape", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ invalid: true }),
      } as Response)
      .mockRejectedValueOnce(new Error("fallback also fails"));

    const { result } = renderHook(() => useBtcPrices());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.prices.source).toBe("default");
  });
});
