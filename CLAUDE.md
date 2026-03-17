# CLAUDE.md

## Specialized Tool Preferences

- When using 'gh' to search github, return a direct link to the file as well.

## Code Stack

- **React 19 + TypeScript** (Vite build tooling)
- **LESS** (CSS preprocessor via Vite's built-in support)
- **GitHub Pages** - static hosting, custom domain via `CNAME` (`williamrrsalas.com`)
- **GitHub Actions** - cached GitHub events + BTC prices data pipelines
- **Cloudflare Workers** - live BTC/FBTC price proxy (Twelvedata API, 10-min edge cache)
- **Google Analytics 4** - page tracking (GA-0D3VJGGB54)
- **Font Awesome 6.5.2** - icons via CDN (GitHub, LinkedIn, menu bar icons)
- **Vitest + React Testing Library** - unit and component tests
- **Prettier** - code formatting (2-space indent, no tabs)

## Folder Structure

```
├── index.html                      # Vite entry (meta, GA, Font Awesome CDN, SPA redirect restore, div#root)
├── vite.config.ts                  # Vite + Vitest config
├── tsconfig.json                   # TypeScript project references
├── package.json
├── public/
│   ├── CNAME                       # GitHub Pages custom domain
│   ├── 404.html                    # SPA redirect for GitHub Pages (preserves client-side routes)
│   ├── favicon.ico
│   ├── apple-touch-icon.png
│   ├── safari-pinned-tab.svg
│   ├── site.webmanifest            # PWA manifest
│   ├── data/github-events.json     # Cached GitHub activity (updated by CI)
│   ├── data/btc-prices.json        # Cached BTC/FBTC prices (fallback for worker)
│   └── assets/icons/               # Favicons (16, 32, 48px)
├── src/
│   ├── main.tsx                    # ReactDOM.createRoot entry
│   ├── test-setup.ts               # Vitest setup (jest-dom matchers)
│   ├── App.tsx                     # Top-level layout + client-side routing
│   ├── App.less                    # Global + homepage styles
│   ├── styles/
│   │   ├── variables.less          # LESS variables (colors, breakpoints, mixins)
│   │   ├── global.less             # Shared styles (menu, project tiles, dialog)
│   │   ├── btc.less                # BTC page styles
│   │   └── formatter.less          # Claude Formatter page styles
│   ├── components/
│   │   ├── Header.tsx              # Greeting, bio, project carousel
│   │   ├── Footer.tsx              # GitHub + LinkedIn links
│   │   ├── MenuButton.tsx          # Hamburger menu with client-side nav
│   │   ├── ProjectCarousel.tsx     # Grid of project tiles on homepage
│   │   ├── ProjectTile.tsx         # Single project card (active or "coming soon")
│   │   ├── GitHubActivity.tsx      # Stateful - loading/error/data states
│   │   ├── RepoSection.tsx         # Repo header + PR list
│   │   ├── PRListItem.tsx          # Single PR row
│   │   ├── OtherEventItem.tsx      # Single non-PR event row
│   │   ├── btc/
│   │   │   ├── BtcPage.tsx         # BTC holdings page (inputs, summary, what-if)
│   │   │   ├── FundInput.tsx       # Multi-entry fund input with consolidation
│   │   │   ├── FundSelector.tsx    # Toggle buttons to show/hide fund columns
│   │   │   ├── AddEntryDialog.tsx  # Modal dialog for adding fund entries (native/USD)
│   │   │   ├── HoldingsSummary.tsx # Per-fund + combined breakdown (BTC + USD)
│   │   │   ├── WhatIfTable.tsx     # What-if price scenario table
│   │   │   ├── SharesPerBtc.tsx    # ETF shares-per-BTC ratio table
│   │   │   ├── PriceSource.tsx     # Live-ticking relative timestamp + attribution
│   │   │   └── __tests__/          # BTC component tests
│   │   ├── claude-formatter/
│   │   │   ├── ClaudeFormatterPage.tsx  # Paste + format Claude Code terminal output
│   │   │   └── __tests__/              # Formatter component tests
│   │   ├── icons/
│   │   │   ├── PRStatusIcon.tsx    # Inline SVG for open/merged/closed
│   │   │   └── RepoIcon.tsx        # Inline SVG for repo header
│   │   └── __tests__/              # Component tests
│   ├── hooks/
│   │   ├── useRoute.ts             # Client-side routing (pushState + popstate)
│   │   ├── useGitHubEvents.ts      # Fetch + transform + group pipeline
│   │   ├── useBtcPrices.ts         # Worker -> cached JSON -> default fallback chain
│   │   ├── useCopyToClipboard.ts   # Copy text + 2s "Copied!" feedback
│   │   └── __tests__/              # Hook tests
│   ├── lib/
│   │   ├── events.ts               # Data transformation, filtering, grouping
│   │   ├── btc.ts                  # BTC/FBTC parsing, formatting, conversions
│   │   ├── formatter.ts            # Claude output cleanup (dedent, join wraps, collapse blanks)
│   │   ├── date.ts                 # Date formatting ("MMM DD")
│   │   ├── types.ts                # Shared TypeScript interfaces
│   │   └── __tests__/              # Unit tests for pure logic
│   └── assets/
│       └── img/
│           ├── pikaconstruction.gif
│           ├── btclogo.png
│           ├── fidelitylogo.jpeg
│           ├── blackrocklogo.png
│           ├── grayscalelogo.png
│           └── formatterlogo.png
├── tools/
│   ├── merge_events.py             # GitHub events merge/dedup script
│   ├── test_merge_events.py        # Python tests for merge script
│   └── make_favicons_sfmono_bold.py
├── .prettierrc
├── .devcontainer/devcontainer.json  # Codespaces (Node.js, port 5173)
├── workers/
│   └── btc-prices-worker.js         # Cloudflare Worker (paste into dashboard)
├── .github/
│   ├── workflows/
│   │   ├── cache-github-events.yml  # Scheduled GitHub events refresh
│   │   ├── cache-btc-prices.yml     # Scheduled BTC price cache refresh
│   │   └── deploy.yml               # Build + deploy to GitHub Pages
│   └── CODEOWNERS
```

## Naming Conventions & Code Style

- **Functions/variables**: `camelCase` (`transformPullRequestEvents`, `safeRepoName`)
- **Constants**: `UPPER_SNAKE_CASE` (`GITHUB_DATA_URL`)
- **CSS/LESS classes**: `kebab-case`, prefixed by feature area (`github-events`, `pr-event`, `repo-header`)
- **Components**: `PascalCase` files and exports (`PRListItem.tsx`, `RepoSection.tsx`)
- **Files**: grouped by domain (`components/`, `hooks/`, `lib/`)
- **Formatting**: Prettier with 2-space indent, no tabs (`.prettierrc`)
- **Modules**: Keep small and focused (most are under 60 lines)

## Dev Commands

```bash
npm run dev       # Start Vite dev server (http://localhost:5173)
npm run build     # Type-check + production build to dist/
npm run preview   # Preview production build locally
npm test          # Run Vitest test suite
npm run lint      # Check formatting (Prettier --check)
npm run format    # Fix formatting (Prettier --write)
npm run local     # Format + build + preview in one command
```

The Codespaces devcontainer auto-installs deps and starts the dev server on port 5173.

## Gotchas & Non-obvious Decisions

- **`chore(data)` filtering** - Automated data-refresh PRs (titled `chore(data): ...`) are filtered out of the activity feed in `events.ts` so they don't clutter the display.
- **SPA routing on GitHub Pages** - `public/404.html` redirects unknown paths to `index.html` with a query-string encoding (via [spa-github-pages](https://github.com/rafgraph/spa-github-pages)). `index.html` has a matching restore script. The `useRoute` hook handles client-side navigation with `pushState`/`popstate`. Routes: `/` (home), `/btc`, `/claude-formatter`.
- **Inline SVG icons** - PR status and repo icons are inline React SVG components (not external files) to eliminate HTTP requests. Don't use Font Awesome for PR state indicators.
- **Static data files** - `public/data/github-events.json` and `public/data/btc-prices.json` are served as static files and fetched at runtime. Both are refreshed by their respective GitHub Actions.
- **BTC price fallback chain** - `useBtcPrices` tries the Cloudflare Worker first, falls back to the cached JSON, then hardcoded defaults. The worker proxies Twelvedata with a 10-min edge cache to limit API credit usage.
- **Multi-fund BTC page** - Supports BTC, FBTC, IBIT, and GBTC. Each fund is configured via `FundConfig` in `types.ts`. `FundSelector` toggles visibility; `FundInput` supports multiple entries per fund with consolidation; `AddEntryDialog` allows native or USD-based entry.
- **Cloudflare Worker is manual-deploy** - `workers/btc-prices-worker.js` must be pasted into the Cloudflare dashboard manually. It is not deployed by CI.
- **PriceSource ticking timestamp** - `PriceSource.tsx` uses a 1-second `setInterval` to show a live-updating relative time ("2 min and 30 seconds ago"). Tests use `vi.useFakeTimers()` + `vi.setSystemTime()` for deterministic assertions.
- **PWA manifest** - `site.webmanifest` is configured for standalone display mode with the site's dark theme colors (`#222831` / `#000000`).
- **LESS stylesheets** - Styles are split by feature: `App.less` (homepage/global), `styles/variables.less` (colors, breakpoints, mixins), `styles/global.less` (shared components), `styles/btc.less`, `styles/formatter.less`.

## Preferred Patterns

- **React components** - Functional components with hooks. No class components.
- **Custom hooks for data** - Data fetching lives in custom hooks (`useGitHubEvents`, `useBtcPrices`), following the fetch-transform-render pattern.
- **Pure logic in `lib/`** - Data transformation (`events.ts`) and utilities (`date.ts`) are pure functions with no React deps.
- **TypeScript interfaces in `types.ts`** - Shared types live in `src/lib/types.ts`.
- **Small, single-purpose modules** - Each file should do one thing. Split by concern.
- **Feature-based grouping** - Group related modules by domain, not by layer.
- **Inline SVG for PR state icons** - SVG paths are in `PRStatusIcon.tsx` and `RepoIcon.tsx`.
