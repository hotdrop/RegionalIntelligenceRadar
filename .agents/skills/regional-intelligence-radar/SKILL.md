---
name: regional-intelligence-radar
description: Build and evolve the Regional Intelligence Radar web app from docs/design_v01.md. Use for changes to the one-screen regional signal console, prefecture or category filtering, signal data and detail presentation, console visual language, responsive behavior, or future replacement of mock data with an API.
---

# Regional Intelligence Radar

Implement the prototype as a focused intelligence console for regional policy signals. Preserve the product direction while keeping the mock-data boundary easy to replace.

## Start with the source of truth

1. Read `docs/design_v01.md` completely.
2. Read the root `AGENTS.md` and inspect the current page before editing.
3. Treat mock content as plausible fictional examples. Do not present it as verified news.
4. Confirm that the requested change belongs to v0.1. Do not add authentication, databases, news APIs, LLM integration, or background collection unless the user explicitly expands scope.

## Preserve responsibility boundaries

- Keep the `RegionalSignal` contract in `types/signal.ts`.
- Keep replaceable prototype records in `data/mockSignals.ts`.
- Keep prefecture layout metadata in `data/prefectures.ts`.
- Keep state coordination and derived filtering in `components/RegionalRadar.tsx`.
- Keep presentational regions focused: `PrefectureMap`, `CategoryFilter`, `SignalList`, and `SignalDetail` receive only the values and callbacks they need.
- Keep `app/page.tsx` as a thin composition entry point.
- Prefer these direct boundaries over repositories, use cases, or a generic design system while the app remains a prototype.

## Maintain the interaction contract

- Selecting a prefecture filters the list and updates the detail to the first matching signal.
- Selecting the same prefecture again clears that filter.
- Category and prefecture filters combine with AND semantics.
- Clearing either filter preserves the other; `すべて解除` clears both.
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

Add mock records through the `RegionalSignal` type. Use stable IDs, ISO `YYYY-MM-DD` dates, one supported category, one importance value, a short summary, distinct `whyItMatters` and `opportunity` analysis, related topics, and a clearly non-production source URL when the source is fictional.

When introducing a real API, adapt its response at the data boundary into `RegionalSignal[]`. Do not spread transport response shapes through UI components.

## Validate proportionally

1. Run `npm run build` for type, route, and deployment-output validation.
2. Run `npm run lint` when component or interaction code changes.
3. For interaction changes, confirm prefecture select/clear, category select/clear, combined filters, signal detail selection, empty results, and `すべて解除`.
4. Report browser/device checks separately from build and lint; do not claim visual confirmation if it was not performed.
