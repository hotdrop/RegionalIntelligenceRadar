---
name: regional-intelligence-radar
description: Build and evolve the Regional Intelligence Radar web app from docs/design_v03.md. Use for changes to the one-screen weekly regional signal console, archive, filters, data and detail presentation, console visual language, or responsive behavior.
---

# Regional Intelligence Radar

Use the root `AGENTS.md` for shared product, architecture, data, interaction, and verification rules. This skill supplies the screen-specific workflow; explicit user instructions take precedence over its defaults.

## Establish the affected behavior

Read `docs/design_v03.md` for feature, UI, or architecture changes and inspect the affected code before editing. For visual changes, inspect the current page when browser access is available; otherwise report the visual verification gap. Documentation-only work does not require opening the app.

Apply the current manual-archive viewer and search scope unless the user explicitly expands it. Resolve routine implementation details from the design and existing code without introducing an approval step. Treat bundled sample content as fictional, not verified news.

## Make a focused change

- Keep `app/page.tsx` as the server composition entry point and page-level state in `components/RegionalRadar.tsx`.
- Keep `Signal`, `WeeklySignalData`, and `ArchivedSignal` contracts in `types/signal.ts`; loading, filtering, labels, and prefecture layout metadata belong in `lib/`.
- Use the existing `PrefectureMap`, `SignalList`, and `SignalDetail` regions. Pass needed values and callbacks; combine keyword search and map prefecture selection; do not introduce category controls.
- Preserve the manual weekly JSON boundary. For report changes, check filename/week agreement, globally unique IDs, supported values, dates, and source URLs through the existing archive validation. Keep `whyItMatters` and `opportunity` distinct.
- Map counts and header totals use the full archive. Selecting a prefecture combines with the other search conditions and changes the visible list and detail, not the header totals. Clearing it removes only the prefecture and preserves map zoom and pan.

## Search behavior

- Keep search/filtering, normalization, ordering, and excerpt generation in `lib/`; page-level conditions belong to `RegionalRadar`.
- Use whitespace-separated AND terms across title, summary, municipality, related topics (raw and Japanese labels), and reasons for attention. Normalize NFKC/case; map matches to original graphemes for safe React highlights.
- Keyword search is the only search input. Do not reintroduce advanced conditions, municipality selectors, date inputs, or sort controls. Always sort by descending report week with archive-order ties.
- Changes reset result scroll and select the first match without navigating to detail. Defer query application during IME composition. All-condition reset clears the keyword and map prefecture.
- Place search below the list heading, without a disclosure or advanced controls. Show active keyword/prefecture clear controls, both dates, and up to three labeled matching excerpts. Keep the results usable when desktop panels shrink.

## Implement responsive behavior

Preserve the visual language defined in `AGENTS.md` and the following layout behavior:

- At 950px and below, retain map/list/detail order for feature 1 and keep header statistics visible. The map and results scroll area are each 480px high; search controls and detail use natural height. The overall mobile entry redesign belongs to feature 4. Do not add layout preset controls.
- Selecting a list item on mobile moves focus and view to the detail heading. Honor `prefers-reduced-motion` with immediate movement.
- On narrow screens, allow map heading and controls to occupy two rows and keep primary control targets at least 44px.
- Desktop starts with 55% width for the map and 70% of the right region's height for the list. Resizing works with both dragging and keyboard controls.
- User-facing category labels are Japanese; preserve supported enum values in the data contract and use presentation labels for display.

## Verify the result

Follow the change-specific commands in `AGENTS.md`. For affected interactions, check full-archive display, prefecture selection and repeat-selection clearing, explicit clearing without zoom/pan changes, first matching detail, and an empty result without stale detail.

For layout or navigation changes, check 360px mobile and 1440–1920px desktop widths, header visibility, list scrolling, detail focus/navigation, and desktop resizing. Verify keyboard operation and reduced-motion behavior for affected controls.

Report the outcome, relevant checks and failures, and any unverified browser behavior. A build or rendered-HTML test does not establish visual correctness. After the relevant checks pass, finish without expanding into unrelated refactoring or repeated verification.
