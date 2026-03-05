// Cloudflare Worker - paste into dashboard at https://dash.cloudflare.com
// Requires TWELVEDATA_API_KEY secret configured in worker settings

const CACHE_TTL = 600; // 10 minutes

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

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") || "";

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    if (url.pathname !== "/prices") {
      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
      });
    }

    // Check edge cache
    const cache = caches.default;
    const cacheKey = new Request(url.toString(), { method: "GET" });
    let response = await cache.match(cacheKey);
    if (response) {
      const headers = new Headers(response.headers);
      Object.entries(corsHeaders(origin)).forEach(([k, v]) =>
        headers.set(k, v),
      );
      return new Response(response.body, { status: 200, headers });
    }

    // Fetch from Twelvedata
    try {
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
        throw new Error("Invalid price data from Twelvedata");
      }

      const body = JSON.stringify({
        btc: btcPrice,
        fbtc: fbtcPrice,
        ibit: ibitPrice,
        gbtc: gbtcPrice,
        ts: new Date().toISOString(),
      });

      response = new Response(body, {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": `public, max-age=${CACHE_TTL}`,
          ...corsHeaders(origin),
        },
      });

      // Store in edge cache (non-blocking)
      const cacheResponse = new Response(body, {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": `public, max-age=${CACHE_TTL}`,
        },
      });
      await cache.put(cacheKey, cacheResponse);

      return response;
    } catch (err) {
      return new Response(
        JSON.stringify({ error: err.message || "Failed to fetch prices" }),
        {
          status: 502,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders(origin),
          },
        },
      );
    }
  },
};
