export function formatMonthDay(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const month = d.toLocaleString("en-US", { month: "short" });
  return `${month} ${d.getDate()}`;
}

export function daysSince(startISO, now = new Date()) {
  const start = new Date(startISO);
  const diff = Math.max(0, Math.floor((now - start) / (1000 * 60 * 60 * 24)));
  return diff;
}
