import { formatMonthDay } from "../utils/date.js";
import { iconFor, repoHeader } from "./icons.js";
import { safeRepoName } from "./events.js";

export function buildPRListItem(e) {
  const li = document.createElement("li");
  li.className = "pr-event";

  const title = document.createElement("a");
  title.href = e.url;
  title.target = "_blank";
  title.rel = "noopener noreferrer";
  title.textContent = e.title || "(no title)";
  title.className = "pr-title-link";

  const date = document.createElement("small");
  date.className = "github-date";
  date.textContent = e.created_at ? formatMonthDay(e.created_at) : "";

  li.append(iconFor(e), title, date);
  return li;
}

export function buildOtherEventItem(e) {
  const li = document.createElement("li");
  li.className = "other-event";

  const type = document.createElement("b");
  type.textContent = (e?.type || "").replace("Event", "");

  const code = document.createElement("code");
  code.textContent = safeRepoName(e);

  const br = document.createElement("br");

  const date = document.createElement("small");
  date.className = "github-date";
  date.textContent = e.created_at ? formatMonthDay(e.created_at) : "";

  li.append(type, document.createTextNode(" on "), code, br, date);
  return li;
}

export function renderPRSections(container, grouped) {
  const frag = document.createDocumentFragment();
  for (const [repo, events] of grouped.entries()) {
    frag.appendChild(repoHeader(repo));
    const ul = document.createElement("ul");
    ul.className = "github-activity-list pr-list";
    events.forEach((e) => ul.appendChild(buildPRListItem(e)));
    frag.appendChild(ul);
  }
  container.appendChild(frag);
}

export function renderOtherEvents(container, events) {
  const ul = document.createElement("ul");
  ul.className = "github-activity-list other-list";
  events.forEach((e) => ul.appendChild(buildOtherEventItem(e)));
  container.appendChild(ul);
}
