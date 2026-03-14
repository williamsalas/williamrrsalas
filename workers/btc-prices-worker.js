// Cloudflare Worker - paste into dashboard at https://dash.cloudflare.com
// Requires:
//   - TWELVEDATA_API_KEY secret configured in worker settings
//   - PRICES KV namespace bound to the worker (variable name: PRICES)

const KV_KEY = "btc-prices";
const KV_TTL = 600; // 10 minutes - how long KV data is considered fresh
const EDGE_CACHE_TTL = 60; // 1 minute - short-lived per-PoP layer in front of KV

function corsHeaders(origin) {
  const allowed =
    origin === "https://williamrrsalas.com" ||
    origin?.startsWith("http://localhost:") ||
    origin?.startsWith("http://127.0.0.1:") ||
    origin?.startsWith("http://[::1]:");
  return {
    "Access-Control-Allow-Origin": allowed ? origin : "",
    "Access-Control-Allow-Methods": "GET",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function jsonResponse(body, status, origin) {
  return new Response(body, {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": `public, max-age=${EDGE_CACHE_TTL}`,
      ...corsHeaders(origin),
    },
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") || "";

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    if (url.pathname !== "/prices") {
      return jsonResponse(JSON.stringify({ error: "Not found" }), 404, origin);
    }

    // Layer 1: Per-PoP edge cache (fast, but independent per location)
    const cache = caches.default;
    const cacheKey = new Request(url.toString(), { method: "GET" });
    const edgeHit = await cache.match(cacheKey);
    if (edgeHit) {
      const headers = new Headers(edgeHit.headers);
      Object.entries(corsHeaders(origin)).forEach(([k, v]) =>
        headers.set(k, v),
      );
      return new Response(edgeHit.body, { status: 200, headers });
    }

    // Layer 2: KV global cache (shared across all PoPs)
    try {
      const { value: kvData, metadata } =
        await env.PRICES.getWithMetadata(KV_KEY);

      if (kvData && metadata?.ts) {
        const ageSeconds = (Date.now() - metadata.ts) / 1000;

        if (ageSeconds < KV_TTL) {
          // KV is fresh - serve it and populate edge cache
          await cache.put(
            cacheKey,
            new Response(kvData, {
              status: 200,
              headers: {
                "Content-Type": "application/json",
                "Cache-Control": `public, max-age=${EDGE_CACHE_TTL}`,
              },
            }),
          );
          return jsonResponse(kvData, 200, origin);
        }
      }

      // Layer 3: KV stale or missing - fetch from Twelvedata
      const apiUrl = `https://api.twelvedata.com/price?symbol=BTC/USD,FBTC,IBIT,GBTC&apikey=${env.TWELVEDATA_API_KEY}`;
      const apiRes = await fetch(apiUrl);
      if (!apiRes.ok) throw new Error(`Twelvedata HTTP ${apiRes.status}`);
      const data = await apiRes.json();

      const btcPrice = parseFloat(data["BTC/USD"]?.price);
      const fbtcPrice = parseFloat(data["FBTC"]?.price);
      const ibitPrice = parseFloat(data["IBIT"]?.price);
      const gbtcPrice = parseFloat(data["GBTC"]?.price);

      if (
        isNaN(btcPrice) ||
        isNaN(fbtcPrice) ||
        isNaN(ibitPrice) ||
        isNaN(gbtcPrice)
      ) {
        // Twelvedata returned bad data - serve stale KV if available
        if (kvData) return jsonResponse(kvData, 200, origin);
        throw new Error("Invalid price data from Twelvedata");
      }

      const body = JSON.stringify({
        btc: btcPrice,
        fbtc: fbtcPrice,
        ibit: ibitPrice,
        gbtc: gbtcPrice,
        ts: new Date().toISOString(),
      });

      // Write to KV (global) + edge cache (local PoP) in parallel
      await Promise.all([
        env.PRICES.put(KV_KEY, body, { metadata: { ts: Date.now() } }),
        cache.put(
          cacheKey,
          new Response(body, {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": `public, max-age=${EDGE_CACHE_TTL}`,
            },
          }),
        ),
      ]);

      return jsonResponse(body, 200, origin);
    } catch (err) {
      return jsonResponse(
        JSON.stringify({ error: err.message || "Failed to fetch prices" }),
        502,
        origin,
      );
    }
  },
};
