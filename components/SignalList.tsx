import type { RegionalSignal } from "@/types/signal";

type SignalListProps = {
  signals: RegionalSignal[];
  totalSignals: number;
  selectedSignalId: string | null;
  onSelectSignal: (id: string) => void;
};

function formatDate(value: string) {
  return value.replaceAll("-", ".").slice(5);
}

export function SignalList({ signals, totalSignals, selectedSignalId, onSelectSignal }: SignalListProps) {
  return (
    <section className="panel signals-panel">
      <div className="panel-heading">
        <div><span className="eyebrow">LIVE INTELLIGENCE FEED</span><h2>TODAY&apos;S REGIONAL SIGNALS</h2></div>
        <span className="count-badge">{String(signals.length).padStart(2, "0")} / {String(totalSignals).padStart(2, "0")}</span>
      </div>
      <div className="signal-list" aria-live="polite">
        {signals.map((signal, index) => (
          <button key={signal.id} type="button" className={`signal-row ${selectedSignalId === signal.id ? "selected" : ""}`} onClick={() => onSelectSignal(signal.id)}>
            <span className="signal-index">{String(index + 1).padStart(2, "0")}</span>
            <span className="signal-copy">
              <span className="signal-meta">{signal.prefecture} / {signal.municipality} · {signal.category.toUpperCase()}</span>
              <strong>{signal.title}</strong>
              <span className="signal-summary">{signal.summary}</span>
            </span>
            <span className="signal-tail"><span className={`importance ${signal.importance.toLowerCase()}`}>{signal.importance}</span><time>{formatDate(signal.publishedAt)}</time></span>
          </button>
        ))}
        {signals.length === 0 && <div className="empty-state"><span>NO SIGNAL DETECTED</span><p>フィルター条件に一致するSignalはありません。</p></div>}
      </div>
    </section>
  );
}
