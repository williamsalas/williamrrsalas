export function formatMonthDay(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  const month = d.toLocaleString("en-US", { month: "short" });
  return `${month} ${d.getDate()}`;
}

export function daysSince(startISO: string, now: Date = new Date()): number {
  const start = new Date(startISO);
  const diff = Math.max(
    0,
    Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)),
  );
  return diff;
}
