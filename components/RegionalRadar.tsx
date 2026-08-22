"use client";

/* eslint-disable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex -- A focusable WAI-ARIA separator is an interactive widget. */

import { useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";
import { ALL_WEEKS, filterSignals, firstSignalId, type WeekFilter } from "@/data/filterSignals";
import type { SignalArchive, SignalCategory } from "@/types/signal";
import { ArchiveFilter, type MunicipalityOption } from "@/components/ArchiveFilter";
import { CategoryFilter } from "@/components/CategoryFilter";
import { PrefectureMap } from "@/components/PrefectureMap";
import { SignalDetail } from "@/components/SignalDetail";
import { SignalList } from "@/components/SignalList";

function municipalityKey(prefecture: string, municipality: string) {
  return `${prefecture}\t${municipality}`;
}

type LayoutMode = "explore" | "balanced" | "detail" | "custom";
type ResizeAxis = "horizontal" | "vertical";

type LayoutSizing = {
  mapShare: number;
  listShare: number;
};

type DragSession = {
  axis: ResizeAxis;
  startPosition: number;
  startShare: number;
  availableSize: number;
};

const MIN_SHARE = 35;
const MAX_SHARE = 65;
const MIN_LIST_SHARE = 30;
const MAX_LIST_SHARE = 70;
const KEYBOARD_STEP = 2;
const KEYBOARD_LARGE_STEP = 5;

const layoutPresets: Record<Exclude<LayoutMode, "custom">, LayoutSizing> = {
  explore: { mapShare: 55, listShare: 70 },
  balanced: { mapShare: 50, listShare: 50 },
  detail: { mapShare: 35, listShare: 30 },
};

const layoutLabels: Record<Exclude<LayoutMode, "custom">, string> = {
  explore: "探索",
  balanced: "均等",
  detail: "詳細",
};

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

export function RegionalRadar({ archive }: { archive: SignalArchive }) {
  const defaultWeek = archive.latestWeek ?? ALL_WEEKS;
  const workspaceRef = useRef<HTMLElement>(null);
  const rightColumnRef = useRef<HTMLElement>(null);
  const dragSession = useRef<DragSession | null>(null);
  const resizeCleanup = useRef<(() => void) | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<WeekFilter>(defaultWeek);
  const [selectedPrefecture, setSelectedPrefecture] = useState<string | null>(null);
  const [selectedMunicipality, setSelectedMunicipality] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<SignalCategory | null>(null);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("explore");
  const [layoutSizing, setLayoutSizing] = useState<LayoutSizing>(layoutPresets.explore);
  const [resizingAxis, setResizingAxis] = useState<ResizeAxis | null>(null);
  const [selectedSignalId, setSelectedSignalId] = useState<string | null>(() =>
    firstSignalId(archive.allSignals, { week: defaultWeek, prefecture: null, municipality: null, category: null }),
  );

  useEffect(() => () => resizeCleanup.current?.(), []);

  const municipalities = useMemo<MunicipalityOption[]>(() => {
    const options = new Map<string, MunicipalityOption>();
    for (const signal of archive.allSignals) {
      const key = municipalityKey(signal.prefecture, signal.municipality);
      options.set(key, { key, prefecture: signal.prefecture, municipality: signal.municipality });
    }
    return [...options.values()].sort((a, b) =>
      a.prefecture.localeCompare(b.prefecture, "ja") || a.municipality.localeCompare(b.municipality, "ja"),
    );
  }, [archive.allSignals]);

  const filters = useMemo(() => ({
    week: selectedWeek,
    prefecture: selectedPrefecture,
    municipality: selectedMunicipality,
    category: selectedCategory,
  }), [selectedCategory, selectedMunicipality, selectedPrefecture, selectedWeek]);

  const filteredSignals = useMemo(
    () => filterSignals(archive.allSignals, filters),
    [archive.allSignals, filters],
  );
  const periodSignals = useMemo(
    () => filterSignals(archive.allSignals, { week: selectedWeek, prefecture: null, municipality: null, category: null }),
    [archive.allSignals, selectedWeek],
  );
  const selectedSignal = filteredSignals.find((signal) => signal.id === selectedSignalId) ?? filteredSignals[0] ?? null;
  const latestReport = archive.reports[0] ?? null;

  function selectFirst(nextFilters: typeof filters) {
    setSelectedSignalId(firstSignalId(archive.allSignals, nextFilters));
  }

  function chooseWeek(week: WeekFilter) {
    setSelectedWeek(week);
    selectFirst({ ...filters, week });
  }

  function choosePrefecture(prefecture: string | null) {
    const municipalityIsValid = prefecture && municipalities.some(
      (option) => option.prefecture === prefecture && option.municipality === selectedMunicipality,
    );
    const municipality = municipalityIsValid ? selectedMunicipality : null;
    setSelectedPrefecture(prefecture);
    setSelectedMunicipality(municipality);
    selectFirst({ ...filters, prefecture, municipality });
  }

  function chooseMunicipality(option: MunicipalityOption | null) {
    const prefecture = option?.prefecture ?? selectedPrefecture;
    const municipality = option?.municipality ?? null;
    setSelectedPrefecture(prefecture);
    setSelectedMunicipality(municipality);
    selectFirst({ ...filters, prefecture, municipality });
  }

  function chooseCategory(category: SignalCategory | null) {
    setSelectedCategory(category);
    selectFirst({ ...filters, category });
  }

  function clearFilters() {
    setSelectedWeek(defaultWeek);
    setSelectedPrefecture(null);
    setSelectedMunicipality(null);
    setSelectedCategory(null);
    selectFirst({ week: defaultWeek, prefecture: null, municipality: null, category: null });
  }

  function chooseLayout(mode: Exclude<LayoutMode, "custom">) {
    setLayoutMode(mode);
    setLayoutSizing(layoutPresets[mode]);
  }

  function updateShare(axis: ResizeAxis, nextShare: number) {
    setLayoutMode("custom");
    setLayoutSizing((current) => axis === "horizontal"
      ? { ...current, mapShare: clamp(nextShare, MIN_SHARE, MAX_SHARE) }
      : { ...current, listShare: clamp(nextShare, MIN_LIST_SHARE, MAX_LIST_SHARE) });
  }

  function beginResize(axis: ResizeAxis, event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    const container = axis === "horizontal" ? workspaceRef.current : rightColumnRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    resizeCleanup.current?.();
    dragSession.current = {
      axis,
      startPosition: axis === "horizontal" ? event.clientX : event.clientY,
      startShare: axis === "horizontal" ? layoutSizing.mapShare : layoutSizing.listShare,
      availableSize: axis === "horizontal" ? rect.width : rect.height,
    };

    const continueWindowResize = (pointerEvent: globalThis.PointerEvent) => {
      const session = dragSession.current;
      if (!session) return;
      const position = session.axis === "horizontal" ? pointerEvent.clientX : pointerEvent.clientY;
      const nextShare = session.startShare + ((position - session.startPosition) / session.availableSize) * 100;
      updateShare(session.axis, nextShare);
    };
    const finishWindowResize = () => {
      window.removeEventListener("pointermove", continueWindowResize);
      window.removeEventListener("pointerup", finishWindowResize);
      window.removeEventListener("pointercancel", finishWindowResize);
      dragSession.current = null;
      resizeCleanup.current = null;
      setResizingAxis(null);
    };

    window.addEventListener("pointermove", continueWindowResize);
    window.addEventListener("pointerup", finishWindowResize);
    window.addEventListener("pointercancel", finishWindowResize);
    resizeCleanup.current = finishWindowResize;
    event.currentTarget.setPointerCapture(event.pointerId);
    setResizingAxis(axis);
  }

  function handleSeparatorKeyDown(axis: ResizeAxis, event: KeyboardEvent<HTMLDivElement>) {
    const current = axis === "horizontal" ? layoutSizing.mapShare : layoutSizing.listShare;
    const minimum = axis === "horizontal" ? MIN_SHARE : MIN_LIST_SHARE;
    const maximum = axis === "horizontal" ? MAX_SHARE : MAX_LIST_SHARE;
    const decrementKey = axis === "horizontal" ? "ArrowLeft" : "ArrowUp";
    const incrementKey = axis === "horizontal" ? "ArrowRight" : "ArrowDown";
    const step = event.shiftKey ? KEYBOARD_LARGE_STEP : KEYBOARD_STEP;
    let nextShare: number | null = null;

    if (event.key === decrementKey) nextShare = current - step;
    if (event.key === incrementKey) nextShare = current + step;
    if (event.key === "Home") nextShare = minimum;
    if (event.key === "End") nextShare = maximum;
    if (nextShare === null) return;

    event.preventDefault();
    updateShare(axis, nextShare);
  }

  const selectedMunicipalityKey = selectedPrefecture && selectedMunicipality
    ? municipalityKey(selectedPrefecture, selectedMunicipality)
    : "";
  const hasFilters = selectedWeek !== defaultWeek || Boolean(selectedPrefecture || selectedMunicipality || selectedCategory);

  return (
    <main className="console-shell" data-resizing={resizingAxis ?? "false"}>
      <header className="topbar">
        <div className="brand-lockup"><span className="brand-mark">RIR</span><h1>地域インテリジェンス・レーダー</h1></div>
        <div className="topbar-tools">
          <div className="layout-presets" role="group" aria-label="表示配分">
            <span>表示配分</span>
            {(Object.keys(layoutLabels) as Array<Exclude<LayoutMode, "custom">>).map((mode) => (
              <button
                key={mode}
                type="button"
                aria-pressed={layoutMode === mode}
                onClick={() => chooseLayout(mode)}
              >
                {layoutLabels[mode]}
              </button>
            ))}
          </div>
          <div className="system-stats">
            <span><b>LATEST REPORT</b>{latestReport?.week ?? "—"}</span>
            <span><b>SIGNALS</b>{latestReport?.signals.length ?? 0}</span>
          </div>
        </div>
      </header>

      <ArchiveFilter
        weeks={archive.reports.map((report) => report.week)}
        latestWeek={archive.latestWeek}
        selectedWeek={selectedWeek}
        municipalities={municipalities}
        selectedMunicipalityKey={selectedMunicipalityKey}
        onSelectWeek={chooseWeek}
        onSelectMunicipality={chooseMunicipality}
      />
      <CategoryFilter
        selectedCategory={selectedCategory}
        hasFilters={hasFilters}
        onSelectCategory={chooseCategory}
        onClearAll={clearFilters}
      />

      <section
        className="workspace"
        ref={workspaceRef}
        style={{
          "--map-share": `${layoutSizing.mapShare}%`,
          "--list-share": `${layoutSizing.listShare}%`,
        } as CSSProperties}
      >
        <PrefectureMap
          signals={periodSignals}
          selectedPrefecture={selectedPrefecture}
          focusedPrefecture={selectedSignal?.prefecture ?? null}
          onSelectPrefecture={choosePrefecture}
        />
        <div
          className="workspace-resizer horizontal-resizer"
          role="separator"
          tabIndex={0}
          aria-label="マップとシグナル領域の幅を変更"
          aria-orientation="vertical"
          aria-valuemin={MIN_SHARE}
          aria-valuemax={MAX_SHARE}
          aria-valuenow={Math.round(layoutSizing.mapShare)}
          aria-valuetext={`マップ ${Math.round(layoutSizing.mapShare)}%`}
          data-active={resizingAxis === "horizontal"}
          onPointerDown={(event) => beginResize("horizontal", event)}
          onKeyDown={(event) => handleSeparatorKeyDown("horizontal", event)}
        />
        <section className="right-column" ref={rightColumnRef}>
          <SignalList signals={filteredSignals} totalSignals={periodSignals.length} selectedSignalId={selectedSignal?.id ?? null} onSelectSignal={setSelectedSignalId} />
          <div
            className="workspace-resizer vertical-resizer"
            role="separator"
            tabIndex={0}
            aria-label="シグナル一覧と詳細の高さを変更"
            aria-orientation="horizontal"
            aria-valuemin={MIN_LIST_SHARE}
            aria-valuemax={MAX_LIST_SHARE}
            aria-valuenow={Math.round(layoutSizing.listShare)}
            aria-valuetext={`シグナル一覧 ${Math.round(layoutSizing.listShare)}%`}
            data-active={resizingAxis === "vertical"}
            onPointerDown={(event) => beginResize("vertical", event)}
            onKeyDown={(event) => handleSeparatorKeyDown("vertical", event)}
          />
          <SignalDetail signal={selectedSignal} />
        </section>
      </section>
    </main>
  );
}
