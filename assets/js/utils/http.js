export async function loadJson(url, opts = {}) {
  const { cache = "default", ...rest } = opts;
  const res = await fetch(url, { cache, ...rest });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
