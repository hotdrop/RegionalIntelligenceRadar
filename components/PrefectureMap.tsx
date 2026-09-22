"use client";

/* eslint-disable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex -- The pannable map viewport is an application region with explicit keyboard handling. */

import japan from "@svg-maps/japan";
import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { prefectureNamesById, signalMarkerPositions } from "@/lib/prefectures";
import type { ArchivedSignal } from "@/types/signal";
import { importanceLabels } from "@/lib/presentationLabels";

type PrefectureMapProps = {
  signals: ArchivedSignal[];
  selectedPrefecture: string | null;
  focusedPrefecture: string | null;
  onSelectPrefecture: (prefecture: string | null) => void;
};

const importanceWeight = { LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 } as const;
const MIN_ZOOM = 1;
const MAX_ZOOM = 2;
const ZOOM_STEP = 0.25;
const DRAG_THRESHOLD = 5;
const KEYBOARD_PAN_STEP = 32;

type Point = { x: number; y: number };

type DragState = {
  pointerId: number;
  startX: number;
  startY: number;
  origin: Point;
  moved: boolean;
};

const ORIGIN: Point = { x: 0, y: 0 };

function samePoint(a: Point, b: Point) {
  return a.x === b.x && a.y === b.y;
}

export function PrefectureMap({ signals, selectedPrefecture, focusedPrefecture, onSelectPrefecture }: PrefectureMapProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const mapCanvasRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const suppressClickRef = useRef(false);
  const suppressClickTimerRef = useRef<number | null>(null);
  const [zoom, setZoom] = useState(MIN_ZOOM);
  const [pan, setPan] = useState<Point>(ORIGIN);
  const [isDragging, setIsDragging] = useState(false);
  const stats = new Map<string, { count: number; peak: keyof typeof importanceWeight }>();
  for (const signal of signals) {
    const current = stats.get(signal.prefecture);
    const peak = current && importanceWeight[current.peak] > importanceWeight[signal.importance] ? current.peak : signal.importance;
    stats.set(signal.prefecture, { count: (current?.count ?? 0) + 1, peak });
  }

  const clampPan = useCallback((candidate: Point, scale: number): Point => {
    const stage = stageRef.current;
    const canvas = mapCanvasRef.current;
    if (!stage || !canvas || scale <= MIN_ZOOM) return ORIGIN;

    const scaledWidth = canvas.offsetWidth * scale;
    const scaledHeight = canvas.offsetHeight * scale;
    const centerX = canvas.offsetLeft;
    const centerY = canvas.offsetTop;

    const x = scaledWidth <= stage.clientWidth
      ? 0
      : Math.min(scaledWidth / 2 - centerX, Math.max(stage.clientWidth - scaledWidth / 2 - centerX, candidate.x));
    const y = scaledHeight <= stage.clientHeight
      ? 0
      : Math.min(scaledHeight / 2 - centerY, Math.max(stage.clientHeight - scaledHeight / 2 - centerY, candidate.y));

    return { x, y };
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = mapCanvasRef.current;
    if (!stage || !canvas) return;

    const reclamp = () => setPan((current) => {
      const next = clampPan(current, zoom);
      return samePoint(current, next) ? current : next;
    });
    const observer = new ResizeObserver(reclamp);
    observer.observe(stage);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [clampPan, zoom]);

  useEffect(() => () => {
    if (suppressClickTimerRef.current !== null) window.clearTimeout(suppressClickTimerRef.current);
  }, []);

  function updateZoom(nextZoom: number) {
    const boundedZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, nextZoom));
    setZoom(boundedZoom);
    setPan((current) => {
      const next = clampPan(current, boundedZoom);
      return samePoint(current, next) ? current : next;
    });
  }

  function resetViewport() {
    setZoom(MIN_ZOOM);
    setPan(ORIGIN);
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (zoom <= MIN_ZOOM || event.button !== 0) return;
    if (event.target instanceof Element && event.target.closest(".map-zoom-controls")) return;

    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      origin: pan,
      moved: false,
    };
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - drag.startX;
    const deltaY = event.clientY - drag.startY;
    if (!drag.moved && Math.hypot(deltaX, deltaY) < DRAG_THRESHOLD) return;

    if (!drag.moved) {
      drag.moved = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      setIsDragging(true);
    }
    event.preventDefault();
    setPan(clampPan({ x: drag.origin.x + deltaX, y: drag.origin.y + deltaY }, zoom));
  }

  function finishPointer(event: PointerEvent<HTMLDivElement>, cancelled = false) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (drag.moved && !cancelled) {
      suppressClickRef.current = true;
      if (suppressClickTimerRef.current !== null) window.clearTimeout(suppressClickTimerRef.current);
      suppressClickTimerRef.current = window.setTimeout(() => {
        suppressClickRef.current = false;
        suppressClickTimerRef.current = null;
      }, 0);
    }
    dragRef.current = null;
    setIsDragging(false);
  }

  function handleStageKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget || zoom <= MIN_ZOOM) return;

    const movement: Record<string, Point> = {
      ArrowLeft: { x: KEYBOARD_PAN_STEP, y: 0 },
      ArrowRight: { x: -KEYBOARD_PAN_STEP, y: 0 },
      ArrowUp: { x: 0, y: KEYBOARD_PAN_STEP },
      ArrowDown: { x: 0, y: -KEYBOARD_PAN_STEP },
    };
    const delta = movement[event.key];
    if (!delta) return;

    event.preventDefault();
    setPan((current) => clampPan({ x: current.x + delta.x, y: current.y + delta.y }, zoom));
  }

  function selectPrefecture(prefecture: string, selected: boolean) {
    if (suppressClickRef.current) return;
    onSelectPrefecture(selected ? null : prefecture);
  }

  const zoomPercent = Math.round(zoom * 100);

  return (
    <section className="panel map-panel">
      <div className="panel-heading">
        <h2>日本シグナルマップ</h2>
        <div className="map-heading-actions">
        <button type="button" className="text-action" onClick={() => onSelectPrefecture(null)} disabled={!selectedPrefecture}>地域選択を解除</button>
          <div className="map-zoom-controls" role="group" aria-label="地図の表示倍率">
            <button type="button" aria-label="地図を縮小" onClick={() => updateZoom(zoom - ZOOM_STEP)} disabled={zoom <= MIN_ZOOM}>−</button>
            <button type="button" className="map-zoom-reset" aria-label={`地図表示を100%にリセット。現在${zoomPercent}%`} onClick={resetViewport}>{zoomPercent}%</button>
            <button type="button" aria-label="地図を拡大" onClick={() => updateZoom(zoom + ZOOM_STEP)} disabled={zoom >= MAX_ZOOM}>＋</button>
          </div>
        </div>
      </div>
      <div
        ref={stageRef}
        className="map-stage"
        role="application"
        aria-roledescription="パン操作可能な地図"
        tabIndex={0}
        aria-label={`日本地図。現在の倍率${zoomPercent}%。拡大時はドラッグまたは矢印キーで移動できます`}
        data-zoomed={zoom > MIN_ZOOM}
        data-dragging={isDragging}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishPointer}
        onPointerCancel={(event) => finishPointer(event, true)}
        onKeyDown={handleStageKeyDown}
      >
        <div className="map-orbit orbit-one" /><div className="map-orbit orbit-two" />
        <div
          ref={mapCanvasRef}
          className="map-canvas"
          style={{ transform: `translate(calc(-50% + ${pan.x}px), calc(-50% + ${pan.y}px)) scale(${zoom})` }}
        >
          <svg className="japan-map" viewBox={japan.viewBox} role="img" aria-labelledby="japan-map-title">
            <title id="japan-map-title">都道府県別の地域シグナルを表示する日本地図</title>
            <g className="prefecture-shapes">
              {japan.locations.map((location) => {
                const prefecture = prefectureNamesById[location.id];
                const signal = stats.get(prefecture);
                const selected = selectedPrefecture === prefecture;
                return (
                  <path
                    key={location.id}
                    d={location.path}
                    role="button"
                    tabIndex={0}
                    aria-label={`${prefecture}${signal ? `、シグナル${signal.count}件` : "、シグナルなし"}`}
                    aria-pressed={selected}
                    className={`prefecture-shape ${signal ? `active ${signal.peak.toLowerCase()}` : ""} ${selected ? "selected" : ""}`}
                    onClick={() => selectPrefecture(prefecture, selected)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onSelectPrefecture(selected ? null : prefecture);
                      }
                    }}
                  >
                    <title>{`${prefecture}${signal ? ` — シグナル${signal.count}件 / 重要度${importanceLabels[signal.peak]}` : " — シグナルなし"}`}</title>
                  </path>
                );
              })}
            </g>
            <g className="signal-markers" aria-hidden="true">
              {japan.locations.flatMap((location, locationIndex) => {
                const prefecture = prefectureNamesById[location.id];
                const signal = stats.get(prefecture);
                const marker = signalMarkerPositions[location.id];
                if (!signal || !marker) return [];
                const focused = focusedPrefecture === prefecture;
                return [
                  <g
                    key={location.id}
                    className={`map-signal-marker ${signal.peak.toLowerCase()} ${focused ? "focused" : ""}`}
                    data-prefecture={prefecture}
                  >
                    <circle
                      className="marker-wave"
                      cx={marker.x}
                      cy={marker.y}
                      r="8"
                      style={{ animationDelay: `${locationIndex * -0.43}s` }}
                    />
                    {focused && <circle className="marker-focus-halo" cx={marker.x} cy={marker.y} r="10" />}
                    <circle className="marker-core" cx={marker.x} cy={marker.y} r={signal.count > 1 ? "3.5" : "2.8"} />
                  </g>,
                ];
              })}
            </g>
          </svg>
        </div>
        <div className="map-scanline" aria-hidden="true" />
        <div className="map-readout">
          <strong>{selectedPrefecture ?? "全国"}</strong>
        </div>
        <div className="map-axis axis-x"><span>西</span><span>東</span></div>
      </div>
      <div className="map-legend">
        <span><i className="legend-dot critical" /> 最重要</span><span><i className="legend-dot high" /> 高</span><span><i className="legend-dot medium" /> 中</span>
      </div>
    </section>
  );
}
