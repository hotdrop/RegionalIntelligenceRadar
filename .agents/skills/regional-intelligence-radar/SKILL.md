---
name: regional-intelligence-radar
description: Build and evolve the Regional Intelligence Radar web app from docs/design_v02.md. Use for changes to the one-screen weekly regional signal console, archive, filters, data and detail presentation, console visual language, or responsive behavior.
---

# Regional Intelligence Radar

Implement the PoC as a focused local viewer for manually supplied weekly regional-policy Signal reports. Preserve the console character while keeping weekly JSON replacement simple.

## Start with the source of truth

1. Read `docs/design_v02.md` completely and consult `docs/design_v01.md` only for the original visual direction.
2. Read the root `AGENTS.md` and inspect the current page before editing.
3. Treat bundled sample content as plausible fictional examples. Do not present it as verified news.
4. Confirm that the requested change belongs to v0.1. Do not add authentication, databases, news APIs, LLM integration, or background collection unless the user explicitly expands scope.

## Preserve responsibility boundaries

- Keep `Signal`, `WeeklySignalData`, and `ArchivedSignal` contracts in `types/signal.ts`.
- Keep replaceable weekly reports in automatically discovered `data/YYYY-MM-DD.json` files.
- Keep archive loading, filtering, and presentation metadata in `lib/`; `data/` contains JSON reports only.
- Keep prefecture layout metadata in `lib/prefectures.ts`.
- Keep state coordination and derived filtering in `components/RegionalRadar.tsx`.
- Keep presentational regions focused: `PrefectureMap`, `CategoryFilter`, `SignalList`, and `SignalDetail` receive only the values and callbacks they need.
- Keep `app/page.tsx` as a thin composition entry point.
- Prefer these direct boundaries over repositories, use cases, or a generic design system while the app remains a prototype.

## Maintain the interaction contract

- Selecting a prefecture filters the list and updates the detail to the first matching signal.
- Selecting the same prefecture again clears that filter.
- Week, category, prefecture, and municipality filters combine with AND semantics.
- Clearing one dimension preserves compatible selections; `すべて解除` returns to Latest and clears all other filters.
- The selected detail must always belong to the visible filtered list.
- An empty result must render an intentional empty state without stale detail content.
- All controls must be keyboard reachable and expose selected state where applicable.

## Maintain the visual language

- Use a fixed dark palette, thin cyan-tinted borders, subtle grid structure, restrained glow, and monospace labels.
- Optimize the primary composition for 1440–1920 px landscape displays.
- Let narrow screens stack without attempting full mobile optimization.
- Keep animation finite or subtle; honor `prefers-reduced-motion` and avoid continuously moving backgrounds.
- Favor information hierarchy and legibility over decorative cyber effects.
- Use natural Japanese for user-facing console labels and signal content. Keep only short product marks or identifiers such as `RIR` and `MAP_01` in English when they support the console character.

## Extend data safely

Add reports as `data/YYYY-MM-DD.json`. Match the filename to `week`, use globally unique stable IDs, ISO dates, supported categories/importances, a short summary, distinct `whyItMatters` and `opportunity` analysis, related topics, and a clearly non-production source URL when fictional.

Do not add APIs, databases, automatic collection or synchronization, upload UI, or browser filesystem access. JSON files are loaded and validated on the server boundary before reaching UI components.

## Validate proportionally

1. Run `npm run build` for type, route, and deployment-output validation.
2. Run `npm run lint` when component or interaction code changes.
3. For interaction changes, confirm Latest/past/All, prefecture select/clear, municipality, category, combined filters, signal detail selection, empty results, and `すべて解除`.
4. Report browser/device checks separately from build and lint; do not claim visual confirmation if it was not performed.
