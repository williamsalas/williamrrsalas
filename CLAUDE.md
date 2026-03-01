# CLAUDE.md

## Code Stack

- **React 19 + TypeScript** (Vite build tooling)
- **LESS** (CSS preprocessor via Vite's built-in support)
- **GitHub Pages** - static hosting, custom domain via `CNAME` (`williamrrsalas.com`)
- **GitHub Actions** - cached GitHub events data pipeline (`public/data/github-events.json`)
- **Google Analytics 4** - page tracking (GA-0D3VJGGB54)
- **Font Awesome 6.5.2** - icons via CDN (only GitHub + LinkedIn icons)
- **Vitest + React Testing Library** - unit and component tests
- **Prettier** - code formatting (2-space indent, no tabs)

## Folder Structure

```
├── index.html                      # Vite entry (meta, GA, Font Awesome CDN, div#root)
├── vite.config.ts                  # Vite + Vitest config
├── tsconfig.json                   # TypeScript project references
├── package.json
├── public/
│   ├── CNAME                       # GitHub Pages custom domain
│   ├── favicon.ico
│   ├── apple-touch-icon.png
│   ├── safari-pinned-tab.svg
│   ├── site.webmanifest            # PWA manifest
│   ├── data/github-events.json     # Cached GitHub activity (updated by CI)
│   └── assets/icons/               # Favicons (16, 32, 48px)
├── src/
│   ├── main.tsx                    # ReactDOM.createRoot entry
│   ├── App.tsx                     # Top-level layout
│   ├── App.less                    # All styles (dark theme, flexbox layout)
│   ├── components/
│   │   ├── Header.tsx              # Greeting, bio, pikachu gif
│   │   ├── Footer.tsx              # GitHub + LinkedIn links
│   │   ├── GitHubActivity.tsx      # Stateful - loading/error/data states
│   │   ├── RepoSection.tsx         # Repo header + PR list
│   │   ├── PRListItem.tsx          # Single PR row
│   │   ├── OtherEventItem.tsx      # Single non-PR event row
│   │   ├── icons/
│   │   │   ├── PRStatusIcon.tsx    # Inline SVG for open/merged/closed
│   │   │   └── RepoIcon.tsx        # Inline SVG for repo header
│   │   └── __tests__/              # Component tests
│   ├── hooks/
│   │   ├── useGitHubEvents.ts      # Fetch + transform + group pipeline
│   │   └── __tests__/              # Hook tests
│   ├── lib/
│   │   ├── events.ts               # Data transformation, filtering, grouping
│   │   ├── date.ts                 # Date formatting ("MMM DD")
│   │   ├── types.ts                # Shared TypeScript interfaces
│   │   └── __tests__/              # Unit tests for pure logic
│   └── assets/
│       └── img/pikaconstruction.gif
├── tools/
│   ├── merge_events.py             # GitHub events merge/dedup script
│   ├── test_merge_events.py        # Python tests for merge script
│   └── make_favicons_sfmono_bold.py
├── .prettierrc
├── .devcontainer/devcontainer.json  # Codespaces (Node.js, port 5173)
├── .github/
│   ├── workflows/
│   │   ├── cache-github-events.yml  # Scheduled data refresh
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
```

The Codespaces devcontainer auto-installs deps and starts the dev server on port 5173.

## Gotchas & Non-obvious Decisions

- **`chore(data)` filtering** - Automated data-refresh PRs (titled `chore(data): ...`) are filtered out of the activity feed in `events.ts` so they don't clutter the display.
- **Inline SVG icons** - PR status and repo icons are inline React SVG components (not external files) to eliminate HTTP requests. Don't use Font Awesome for PR state indicators.
- **Static data file** - `public/data/github-events.json` is served as a static file and fetched at runtime by `useGitHubEvents`. It's refreshed by the `cache-github-events.yml` GitHub Action.
- **PWA manifest** - `site.webmanifest` is configured for standalone display mode with the site's dark theme colors (`#222831` / `#000000`).
- **LESS stylesheet** - The stylesheet was ported from the vanilla CSS version and converted to LESS. All class names are preserved in components.

## Preferred Patterns

- **React components** - Functional components with hooks. No class components.
- **Custom hooks for data** - Data fetching lives in `hooks/useGitHubEvents.ts`, following the fetch-transform-render pattern.
- **Pure logic in `lib/`** - Data transformation (`events.ts`) and utilities (`date.ts`) are pure functions with no React deps.
- **TypeScript interfaces in `types.ts`** - Shared types live in `src/lib/types.ts`.
- **Small, single-purpose modules** - Each file should do one thing. Split by concern.
- **Feature-based grouping** - Group related modules by domain, not by layer.
- **Inline SVG for PR state icons** - SVG paths are in `PRStatusIcon.tsx` and `RepoIcon.tsx`.
