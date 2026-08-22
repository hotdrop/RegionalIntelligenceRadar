import type { ArchivedSignal } from "@/types/signal";
import { categoryLabels, importanceLabels } from "@/lib/presentationLabels";

type SignalListProps = {
  signals: ArchivedSignal[];
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
        <div><span className="eyebrow">週次レポート / SIGNAL ARCHIVE</span><h2>地域シグナル</h2></div>
        <span className="count-badge">{String(signals.length).padStart(2, "0")} / {String(totalSignals).padStart(2, "0")}</span>
      </div>
      <div className="signal-list" aria-live="polite">
        {signals.map((signal, index) => (
          <button key={signal.id} type="button" className={`signal-row ${selectedSignalId === signal.id ? "selected" : ""}`} onClick={() => onSelectSignal(signal.id)}>
            <span className="signal-index">{String(index + 1).padStart(2, "0")}</span>
            <span className="signal-copy">
              <span className="signal-meta">{signal.prefecture} / {signal.municipality} · {categoryLabels[signal.category]}</span>
              <strong>{signal.title}</strong>
              <span className="signal-summary">{signal.summary}</span>
            </span>
            <span className="signal-tail"><span className={`importance ${signal.importance.toLowerCase()}`}>{importanceLabels[signal.importance]}</span><time>{formatDate(signal.publishedAt)}</time></span>
          </button>
        ))}
        {signals.length === 0 && <div className="empty-state"><span>該当するシグナルはありません</span><p>絞り込み条件を変更してください。</p></div>}
      </div>
    </section>
  );
}
