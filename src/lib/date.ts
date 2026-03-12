export function formatMonthDay(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  const month = d.toLocaleString("en-US", { month: "short" });
  return `${month} ${d.getDate()}`;
}
