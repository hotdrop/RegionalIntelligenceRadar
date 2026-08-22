"use client";

import { useState } from "react";

type SignalTickerItem = {
  id: string;
  prefecture: string;
  municipality: string;
  title: string;
};

type SignalTickerProps = {
  week: string | null;
  signals: SignalTickerItem[];
};

function TickerGroup({ signals, clone = false }: { signals: SignalTickerItem[]; clone?: boolean }) {
  return (
    <span className="signal-wire-group" aria-hidden="true" data-clone={clone || undefined}>
      {signals.map((signal) => (
        <span className="signal-wire-item" key={`${clone ? "clone" : "source"}-${signal.id}`}>
          <span className="signal-wire-location">{signal.prefecture} / {signal.municipality}</span>
          <span>{signal.title}</span>
        </span>
      ))}
    </span>
  );
}

export function SignalTicker({ week, signals }: SignalTickerProps) {
  const [paused, setPaused] = useState(false);
  const hasSignals = signals.length > 0;

  return (
    <section className="signal-wire" data-paused={paused || !hasSignals} aria-label="最新シグナル">
      <div className="signal-wire-label" aria-hidden="true">
        <span>最新シグナル</span>
        <b>SIGNAL WIRE</b>
      </div>
      <div className="signal-wire-viewport">
        {hasSignals ? (
          <>
            <p className="sr-only">
              最新週 {week ?? "不明"}。{signals.map((signal) => `${signal.prefecture} ${signal.municipality}、${signal.title}`).join("。")}
            </p>
            <div className="signal-wire-track">
              <TickerGroup signals={signals} />
              <TickerGroup signals={signals} clone />
            </div>
          </>
        ) : (
          <p className="signal-wire-empty">表示できる最新シグナルはありません</p>
        )}
      </div>
      <span className="signal-wire-week" aria-label={`対象週 ${week ?? "不明"}`}>{week ?? "—"}</span>
      {hasSignals && (
        <button
          className="signal-wire-toggle"
          type="button"
          aria-pressed={paused}
          aria-label={paused ? "最新シグナルの自動スクロールを再生" : "最新シグナルの自動スクロールを停止"}
          onClick={() => setPaused((current) => !current)}
        >
          <span aria-hidden="true">{paused ? "再生" : "停止"}</span>
        </button>
      )}
    </section>
  );
}
