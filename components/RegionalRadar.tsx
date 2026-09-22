"use client";

/* eslint-disable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex -- A focusable WAI-ARIA separator is an interactive widget. */

import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";
import { filterSignals, firstSignalId } from "@/lib/filterSignals";
import type { SignalArchive } from "@/types/signal";
import { PrefectureMap } from "@/components/PrefectureMap";
import { SignalDetail } from "@/components/SignalDetail";
import { SignalList } from "@/components/SignalList";

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

function subscribeMobileLayout(onChange: () => void) {
  const query = window.matchMedia("(max-width: 950px)");
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

export function RegionalRadar({ archive }: { archive: SignalArchive }) {
  const isMobile = useSyncExternalStore(
    subscribeMobileLayout,
    () => window.matchMedia("(max-width: 950px)").matches,
    () => false,
  );
  const workspaceRef = useRef<HTMLElement>(null);
  const rightColumnRef = useRef<HTMLElement>(null);
  const dragSession = useRef<DragSession | null>(null);
  const resizeCleanup = useRef<(() => void) | null>(null);
  const [selectedPrefecture, setSelectedPrefecture] = useState<string | null>(null);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("explore");
  const [layoutSizing, setLayoutSizing] = useState<LayoutSizing>(layoutPresets.explore);
  const [resizingAxis, setResizingAxis] = useState<ResizeAxis | null>(null);
  const [selectedSignalId, setSelectedSignalId] = useState<string | null>(() =>
    firstSignalId(archive.allSignals, { prefecture: null }),
  );

  useEffect(() => () => resizeCleanup.current?.(), []);

  const [mobileLayout, setMobileLayout] = useState<Exclude<LayoutMode, "custom">>("explore");
  const filters = useMemo(() => ({ prefecture: selectedPrefecture }), [selectedPrefecture]);

  const filteredSignals = useMemo(
    () => filterSignals(archive.allSignals, filters),
    [archive.allSignals, filters],
  );
  const selectedSignal = filteredSignals.find((signal) => signal.id === selectedSignalId) ?? filteredSignals[0] ?? null;
  const latestReport = archive.reports[0] ?? null;

  function choosePrefecture(prefecture: string | null) {
    setSelectedPrefecture(prefecture);
    setSelectedSignalId(firstSignalId(archive.allSignals, { prefecture }));
  }

  function chooseSignal(id: string) {
    setSelectedSignalId(id);
    if (window.matchMedia("(max-width: 950px)").matches) {
      requestAnimationFrame(() => {
        const detail = rightColumnRef.current?.querySelector<HTMLElement>(".detail-panel");
        detail?.focus({ preventScroll: true });
        detail?.scrollIntoView({
          block: "start",
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
        });
      });
    }
  }

  function chooseLayout(mode: Exclude<LayoutMode, "custom">) {
    setMobileLayout(mode);
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

  return (
    <main className="console-shell" data-resizing={resizingAxis ?? "false"} data-mobile-layout={mobileLayout}>
      <header className="topbar">
        <div className="brand-lockup"><span className="brand-mark">RIR</span><h1>地域インテリジェンス・レーダー</h1></div>
        <div className="topbar-tools">
          <div className="layout-presets" role="group" aria-label="表示配分">
            <span>表示配分</span>
            {(Object.keys(layoutLabels) as Array<Exclude<LayoutMode, "custom">>).map((mode) => (
              <button
                key={mode}
                type="button"
                aria-pressed={(isMobile ? mobileLayout : layoutMode) === mode}
                onClick={() => chooseLayout(mode)}
              >
                {layoutLabels[mode]}
              </button>
            ))}
          </div>
          <div className="system-stats">
            <span><b>LATEST REPORT</b>{latestReport?.week ?? "—"}</span>
            <span><b>SIGNALS</b>{archive.allSignals.length}</span>
          </div>
        </div>
      </header>

      <section
        className="workspace"
        ref={workspaceRef}
        style={{
          "--map-share": `${layoutSizing.mapShare}%`,
          "--list-share": `${layoutSizing.listShare}%`,
        } as CSSProperties}
      >
        <PrefectureMap
          signals={archive.allSignals}
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
          <SignalList signals={filteredSignals} totalSignals={archive.allSignals.length} selectedSignalId={selectedSignal?.id ?? null} onSelectSignal={chooseSignal} />
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
