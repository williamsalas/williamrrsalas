import { daysSince } from "../utils/date.js";

export function renderPikachuCounter(startISO, elId = "pikachu-counter") {
  const el = document.getElementById(elId);
  if (!el) return;
  const days = daysSince(startISO);
  el.textContent = `pikachu has been working on this website for ${days} day${
    days === 1 ? "" : "s"
  }!`;
}
