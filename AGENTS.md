# Regional Intelligence Radar — Agent Guide

## Product source of truth

Read `docs/design_v03.md` before feature, UI, or architecture work. The product presents manually supplied weekly regional-policy Signal reports. Its primary success criterion is whether members can understand and retrieve useful archived information quickly in meetings and conversations.

Do not add authentication, a database, news APIs, LLM integration, scraping, background collection, or production operations unless the user explicitly expands the scope.

## Applying these instructions

Explicit user instructions govern the requested scope; these project rules provide defaults within that scope. Treat an explicit scope expansion as authorization for the requested work, without asking for the same approval again. It does not authorize unrelated features or external actions.

Use `docs/design_v03.md` for product behavior, this file for shared project constraints, and the project skill for implementation workflow. Verify implementation details against current code and `package.json`. If instructions conflict, resolve stale references from this order; ask a focused question only when the answer would materially change the requested behavior. Continue independent work while awaiting an answer.

For ordinary implementation choices within the request, use judgment and proceed through verification. Keep edits focused and preserve unrelated user changes. Planning or review requests produce plans or findings rather than unrequested implementation.

## Product principles

- Prioritize clear regional information and discovery; distinguish facts, reasons for attention, and opportunities without making opportunity creation the product goal.
- Preserve the Intelligence Console / Operations Center character without turning the page into a game UI.
- Use a fixed dark theme, restrained cyan accents, thin borders, subtle glow, high but organized information density, and selective monospace typography.
- Use natural Japanese for user-facing labels, categories, statuses, and signal content. Short product marks and console identifiers such as `RIR` or `MAP_01` may remain in English.
- Support 1440–1920 px landscape displays and mobile layouts down to 360 px. Keep header controls and statistics visible at every width.
- Keep animation lightweight, subtle, and compatible with `prefers-reduced-motion`.

## Architecture

- `app/`: App Router entry points, metadata, and global styles, run through vinext/Vite.
- `components/`: focused UI regions and the client-side coordinator.
- `types/`: stable UI-facing domain contracts.
- `data/`: manually supplied weekly `YYYY-MM-DD.json` reports only.
- `lib/`: server-side archive loading, filtering, and presentation metadata.
- `docs/`: product requirements and design decisions.

Keep `app/page.tsx` thin: it loads the validated archive on the server and passes it into `components/RegionalRadar.tsx`. `RegionalRadar` owns page-level selection/filter state and derives the visible signals. Presentational components receive only needed values and callbacks. UI components may depend on `ArchivedSignal`, but must not import weekly JSON or the loader directly. Do not introduce Clean Architecture layers or repositories.

Do not add an API or BFF for archive search. Weekly JSON is the intentional manual data boundary.

## Interaction invariants

- Default to all weeks, municipalities, and categories. Combine keyword AND search with map prefecture selection. Do not add category filters.
- Keyword search is the only search input. Do not add municipality selectors, date ranges, advanced conditions, or sort controls. Results always use descending report-week order with archive-order ties.
- Search title, summary, municipality, topic values/Japanese labels, and reasons for attention with NFKC/case normalization. Preserve original text in highlights and excerpts.
- Selecting the active prefecture again clears it.
- When the visible list is nonempty, detail selection points to a signal in that list; otherwise there is no selected detail.
- Changing a filter selects the first matching signal; zero matches show an empty list and no stale detail.
- `地域選択を解除` beside zoom controls clears only the prefecture and selects the first remaining match without changing map zoom or pan.
- Clearing all conditions clears the keyword and map prefecture. Filter changes reset result scrolling and select the first match without navigating to detail. Defer keyword filtering during IME composition.
- Clickable controls remain keyboard accessible and expose accessible names or selected state.

## Data rules

Weekly reports live in automatically discovered `data/YYYY-MM-DD.json` files and conform to `WeeklySignalData` in `types/signal.ts`. The filename must match `week`, IDs must be unique across the archive, dates must use ISO formats, and categories/importances must be supported. Keep fictional sample records clearly fictional and use non-production source URLs. Do not add an index file, automatic synchronization, upload UI, or browser filesystem access.

## Verification

Run `npm run build` after application implementation. Run `npm run lint` for component or interaction changes. For archive/filter changes, run `npm test` and exercise all-period display, prefecture select/clear, detail selection, empty results, mobile scrolling and detail navigation, and desktop resizing. `npm test` currently includes the build, so a successful run satisfies that build check without repeating it.

For documentation or instruction-only changes, check consistency, referenced paths, and the diff; application builds and browser checks are unnecessary. Add tests for changed behavior or regressions when useful, rather than tests that merely match implementation text. Once relevant checks pass, repeat them only for further changes or unresolved failures.

Report verification honestly by layer: build/lint, automated tests, then browser/manual checks. A successful build is not visual confirmation.

## Project skill

Use `.agents/skills/regional-intelligence-radar/SKILL.md` for the concrete implementation workflow and guardrails specific to this screen.
