# Regional Intelligence Radar — Agent Guide

## Product source of truth

Read `docs/design_v01.md` before feature, UI, or architecture work. The current product is a personal-use v0.1 prototype: a one-screen intelligence console for regional policy signals. Its success criterion is whether the UI/UX makes the direction feel worth using.

Do not add authentication, a database, news APIs, LLM integration, scraping, background collection, or production operations unless the user explicitly expands the scope.

## Product principles

- Present regional information as `Signal → Opportunity`, not as a generic news list.
- Preserve the Intelligence Console / Operations Center character without turning the page into a game UI.
- Use a fixed dark theme, restrained cyan accents, thin borders, subtle glow, high but organized information density, and selective monospace typography.
- Use English system labels with natural Japanese signal content.
- Prioritize 1440–1920 px landscape displays. Smaller layouts must remain usable but do not require full smartphone optimization.
- Keep animation lightweight, subtle, and compatible with `prefers-reduced-motion`.

## Architecture

- `app/`: Next.js App Router entry points, metadata, and global styles.
- `components/`: focused UI regions and the client-side coordinator.
- `types/`: stable UI-facing domain contracts.
- `data/`: replaceable prototype records and presentation metadata.
- `docs/`: product requirements and design decisions.

Keep `app/page.tsx` thin. `components/RegionalRadar.tsx` owns page-level selection/filter state and derives the visible signals. Presentational components receive only needed values and callbacks. UI components may depend on `RegionalSignal`, but must not import mock records directly. Do not introduce Clean Architecture layers before an actual external data boundary requires them.

Future API or BFF responses must be adapted into `RegionalSignal[]` at the data boundary so transport shapes do not leak into UI components.

## Interaction invariants

- Prefecture and category filters combine with AND semantics.
- Selecting the active prefecture/category again clears it.
- Detail selection always points to a signal in the visible list.
- Changing a filter selects the first matching signal; zero matches show an empty list and no stale detail.
- `RESET ALL` clears all filters and restores the default signal.
- Clickable controls remain keyboard accessible and expose accessible names or selected state.

## Data rules

Mock records live in `data/mockSignals.ts` and conform to `types/signal.ts`. Use stable IDs, ISO dates, supported categories/importances, realistic but clearly fictional content, distinct analysis for `whyItMatters` and `opportunity`, and non-production source URLs for fictional records.

## Verification

Run `npm run build` after implementation. Run `npm run lint` for component or interaction changes. For filter changes, exercise prefecture select/clear, category select/clear, their combined state, detail selection, empty results, and full reset.

Report verification honestly by layer: build/lint, automated tests, then browser/manual checks. A successful build is not visual confirmation.

## Project skill

Use `.agents/skills/regional-intelligence-radar/SKILL.md` for the concrete implementation workflow and guardrails specific to this screen.
