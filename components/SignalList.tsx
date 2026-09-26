import { useEffect, useRef, type ReactNode } from "react";
import type { ArchivedSignal } from "@/types/signal";
import { categoryLabels, importanceLabels } from "@/lib/presentationLabels";
import { highlightParts, matchingExcerpts, searchTerms, type TextPart } from "@/lib/filterSignals";

type SignalListProps = {
  signals: ArchivedSignal[];
  totalSignals: number;
  selectedSignalId: string | null;
  onSelectSignal: (id: string) => void;
  query: string;
  filterRevision: number;
  children: ReactNode;
};

function Highlight({ parts }: { parts: TextPart[] }) {
  return parts.map((part, index) => part.matched ? <mark key={index}>{part.text}</mark> : part.text);
}

export function SignalList({ signals, totalSignals, selectedSignalId, onSelectSignal, query, filterRevision, children }: SignalListProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const terms = searchTerms(query);
  useEffect(() => { if (listRef.current) listRef.current.scrollTop = 0; }, [filterRevision]);

  return (
    <section className="panel signals-panel">
      <div className="panel-heading">
        <div><span className="eyebrow">週次レポート / SIGNAL ARCHIVE</span><h2>地域シグナル</h2></div>
        <span className="count-badge" role="status" aria-live="polite" aria-atomic="true">{signals.length}件 / 全{totalSignals}件</span>
      </div>
      <div className="signal-search-scroll">{children}</div>
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- The scrollable results region needs keyboard scrolling. */}
      <div className="signal-list" role="region" ref={listRef} tabIndex={0} aria-label="検索結果一覧">
        {signals.map((signal, index) => (
          <button key={signal.id} type="button" className={`signal-row ${selectedSignalId === signal.id ? "selected" : ""}`} aria-pressed={selectedSignalId === signal.id} onClick={() => onSelectSignal(signal.id)}>
            <span className="signal-index">{String(index + 1).padStart(2, "0")}</span>
            <span className="signal-copy">
              <span className="signal-meta">{signal.prefecture} / <Highlight parts={highlightParts(signal.municipality, terms)} /> · {categoryLabels[signal.category]}</span>
              <strong><Highlight parts={highlightParts(signal.title, terms)} /></strong>
              <span className="signal-dates">公開日 <time dateTime={signal.publishedAt}>{signal.publishedAt}</time> · レポート週 <time dateTime={signal.reportWeek}>{signal.reportWeek}</time></span>
              <span className="signal-summary"><Highlight parts={highlightParts(signal.summary, terms)} /></span>
              {matchingExcerpts(signal, terms).map((excerpt, i) => <span className="match-excerpt" key={i}><span className="match-label">{excerpt.label}</span><Highlight parts={excerpt.parts} /></span>)}
            </span>
            <span className="signal-tail"><span className={`importance ${signal.importance.toLowerCase()}`}>{importanceLabels[signal.importance]}</span></span>
          </button>
        ))}
        {signals.length === 0 && <div className="empty-state"><span>該当するシグナルはありません</span><p>キーワードを変更するか、検索・地域選択を解除してください。</p></div>}
      </div>
    </section>
  );
}
