# CLAUDE.md

## Code Stack

- **Vanilla JavaScript** (ES6 modules, no framework, no bundler, no build step)
- **Plain HTML5 + CSS3** (no preprocessor)
- **GitHub Pages** — static hosting, custom domain via `CNAME` (`williamrrsalas.com`)
- **Cloudflare Workers** — serverless proxy to the GitHub Events API
- **Google Analytics 4** — page tracking (GA-0D3VJGGB54)
- **Font Awesome 6.5.2** — icons via CDN
- **Prettier** — code formatting (2-space indent, no tabs)

## Folder Structure

```
├── index.html                  # Single-page entry point
├── CNAME                       # GitHub Pages custom domain
├── site.webmanifest            # PWA manifest
├── assets/
│   ├── css/styles.css          # All styles (dark theme, flexbox layout)
│   ├── js/
│   │   ├── main.js             # App init — orchestrates fetch → transform → render
│   │   ├── github/
│   │   │   ├── events.js       # Data transformation, filtering, grouping
│   │   │   ├── render.js       # DOM element creation and insertion
│   │   │   └── icons.js        # PR state → SVG icon mapping
│   │   └── utils/
│   │       ├── http.js         # Fetch wrapper (cache: 'default')
│   │       └── date.js         # Date formatting ("MMM DD")
│   ├── img/                    # SVG icons for PR states, images
│   └── icons/                  # Favicons (16, 32, 48px)
├── tools/
│   └── make_favicons_sfmono_bold.py  # Favicon generation script (PIL)
├── .prettierrc                 # Prettier config
├── .devcontainer/              # GitHub Codespaces setup
└── .github/CODEOWNERS          # Code ownership rules
```

## Naming Conventions & Code Style

- **Functions/variables**: `camelCase` (`transformPullRequestEvents`, `safeRepoName`)
- **Constants**: `UPPER_SNAKE_CASE` (`GITHUB_DATA_URL`)
- **CSS classes**: `kebab-case`, prefixed by feature area (`github-events`, `pr-event`, `repo-header`)
- **Files**: `lowercase.js`, grouped by domain (`github/`, `utils/`)
- **Type hints**: JSDoc comments (no TypeScript)
- **Formatting**: Prettier with 2-space indent, no tabs (`.prettierrc`)
- **Modules**: Keep small and focused (most are under 60 lines)

## Running the Dev Server

No build step. Serve static files locally:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`. The Codespaces devcontainer does this automatically on port 8080.

There are no tests or build commands.

## Gotchas & Non-obvious Decisions

- **No bundler** — JS uses native ES module `import`/`export` with bare `<script type="module">` in `index.html`. No webpack, vite, or similar.
- **Cloudflare Worker proxy** — GitHub API calls go through `https://wrrs.williamsalas24.workers.dev/githubEvents`, not directly to `api.github.com`. This avoids CORS issues and rate limits.
- **`chore(data)` filtering** — Automated data-refresh PRs (titled `chore(data): ...`) are filtered out of the activity feed in `events.js` so they don't clutter the display.
- **HTTP caching** — `loadJson()` in `http.js` uses `cache: 'default'` to leverage browser/CDN caching. A recent fix (#51) addressed caching behavior.
- **PWA manifest** — `site.webmanifest` is configured for standalone display mode with the site's dark theme colors (`#222831` / `#000000`).

## Preferred Patterns

- **Vanilla DOM manipulation** — Use `document.createElement`, `DocumentFragment`, and `appendChild`. No jQuery, no virtual DOM.
- **Data pipeline in `main.js`** — Follow the existing fetch → transform → render flow. New data sources should follow this same pattern.
- **ES module imports** — Always use explicit `import`/`export`. No global variables.
- **Small, single-purpose modules** — Each file should do one thing. Split by concern: data transformation (`events.js`), rendering (`render.js`), utilities (`utils/`).
- **Feature-based grouping** — Group related modules in a directory by domain (e.g., `github/`), not by layer.
- **Custom SVG icons for PR states** — PR icons live in `assets/img/` and are mapped in `icons.js`. Don't use Font Awesome for PR state indicators.
