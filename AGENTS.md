# Regional Intelligence Radar — Agent Guide

## Product source of truth

Read `docs/design_v02.md` before feature, UI, or architecture work, and use `docs/design_v01.md` only as the original visual-design background. The current product is a local-only PoC: a one-screen viewer for manually supplied weekly regional-policy Signal reports. Its primary success criterion is whether useful Signals can be discovered continuously and reviewed clearly in meetings.

Do not add authentication, a database, news APIs, LLM integration, scraping, background collection, or production operations unless the user explicitly expands the scope.

## Product principles

- Present regional information as `Signal → Opportunity`, not as a generic news list.
- Preserve the Intelligence Console / Operations Center character without turning the page into a game UI.
- Use a fixed dark theme, restrained cyan accents, thin borders, subtle glow, high but organized information density, and selective monospace typography.
- Use natural Japanese for user-facing labels, categories, statuses, and signal content. Short product marks and console identifiers such as `RIR` or `MAP_01` may remain in English.
- Prioritize 1440–1920 px landscape displays. Smaller layouts must remain usable but do not require full smartphone optimization.
- Keep animation lightweight, subtle, and compatible with `prefers-reduced-motion`.

## Architecture

- `app/`: Next.js App Router entry points, metadata, and global styles.
- `components/`: focused UI regions and the client-side coordinator.
- `types/`: stable UI-facing domain contracts.
- `data/`: manually supplied weekly `YYYY-MM-DD.json` reports only.
- `lib/`: server-side archive loading, filtering, and presentation metadata.
- `docs/`: product requirements and design decisions.

Keep `app/page.tsx` thin: it loads the validated archive on the server and passes it into `components/RegionalRadar.tsx`. `RegionalRadar` owns page-level selection/filter state and derives the visible signals. Presentational components receive only needed values and callbacks. UI components may depend on `ArchivedSignal`, but must not import weekly JSON or the loader directly. Do not introduce Clean Architecture layers or repositories.

Do not add an API or BFF in this PoC. Weekly JSON is the intentional manual data boundary.

## Interaction invariants

- Week, prefecture, municipality, and category filters combine with AND semantics.
- Selecting the active prefecture/category again clears it.
- Detail selection always points to a signal in the visible list.
- Changing a filter selects the first matching signal; zero matches show an empty list and no stale detail.
- `すべて解除` returns to Latest, clears all other filters, and restores the default signal.
- Clickable controls remain keyboard accessible and expose accessible names or selected state.

## Data rules

Weekly reports live in automatically discovered `data/YYYY-MM-DD.json` files and conform to `WeeklySignalData` in `types/signal.ts`. The filename must match `week`, IDs must be unique across the archive, dates must use ISO formats, and categories/importances must be supported. Keep fictional sample records clearly fictional and use non-production source URLs. Do not add an index file, automatic synchronization, upload UI, or browser filesystem access.

## Verification

Run `npm run build` after implementation. Run `npm run lint` for component or interaction changes. For archive/filter changes, exercise Latest, past weeks, All, prefecture, municipality, category, their combined state, detail selection, empty results, and full reset.

Report verification honestly by layer: build/lint, automated tests, then browser/manual checks. A successful build is not visual confirmation.

## Project skill

Use `.agents/skills/regional-intelligence-radar/SKILL.md` for the concrete implementation workflow and guardrails specific to this screen.
