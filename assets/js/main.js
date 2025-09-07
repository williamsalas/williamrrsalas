import { loadJson } from "./utils/http.js";
import {
  isChoreDataPR,
  uniquePRs,
  groupPRsByRepo,
  transformPullRequestEvents,
} from "./github/events.js";
import { renderPRSections, renderOtherEvents } from "./github/render.js";
// cloudflare worker URL
const GITHUB_DATA_URL = "https://wrrs.williamsalas24.workers.dev/githubEvents";

async function init() {
  const container = document.getElementById("github-events");
  if (!container) return;

  try {
    const raw = await loadJson(GITHUB_DATA_URL);
    if (!Array.isArray(raw) || raw.length === 0) {
      container.textContent = "No recent GitHub activity.";
      return;
    }
    const data = transformPullRequestEvents(raw);

    const cleaned = uniquePRs(data.filter((e) => !isChoreDataPR(e)));
    const prGrouped = groupPRsByRepo(cleaned);
    const other = data.filter((e) => e.type !== "PullRequestEvent");

    const frag = document.createDocumentFragment();
    renderPRSections(frag, prGrouped);
    renderOtherEvents(frag, other);

    container.replaceChildren(frag);
  } catch (err) {
    container.textContent = `Could not load GitHub activity. ${err.message}`;
    console.error(err);
  }
}

init();
