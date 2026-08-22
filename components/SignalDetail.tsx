import type { ArchivedSignal } from "@/types/signal";
import { importanceLabels, topicLabel } from "@/data/presentationLabels";

export function SignalDetail({ signal }: { signal: ArchivedSignal | null }) {
  if (!signal) {
    return <section className="panel detail-panel empty-detail"><span>シグナルを選択してください</span></section>;
  }

  return (
    <section className="panel detail-panel" key={signal.id}>
      <div className="detail-top">
        <span className={`importance ${signal.importance.toLowerCase()}`}>{importanceLabels[signal.importance]}</span>
        <span className="detail-location">{signal.prefecture} — {signal.municipality}</span>
        <span className="detail-dates">
          <span><b>REPORT WEEK</b>{signal.reportWeek.replaceAll("-", ".")}</span>
          <span><b>PUBLISHED AT</b>{signal.publishedAt.replaceAll("-", ".")}</span>
        </span>
      </div>
      <h3>{signal.title}</h3>
      <div className="detail-scroll">
        <div className="detail-grid">
          <article><span className="eyebrow">シグナル概要</span><p>{signal.summary}</p></article>
          <article><span className="eyebrow">注目する理由</span><p>{signal.whyItMatters}</p></article>
          <article className="opportunity-block"><span className="eyebrow accent">期待される機会</span><p>{signal.opportunity}</p></article>
        </div>
        <footer className="detail-footer">
          <div><span className="eyebrow">関連トピック</span><div className="topic-list">{signal.relatedTopics.map((topic) => <span key={topic}>{topicLabel(topic)}</span>)}</div></div>
          <a href={signal.sourceUrl} target="_blank" rel="noreferrer" className="source-link">情報源 <span aria-hidden="true">↗</span></a>
        </footer>
      </div>
    </section>
  );
}
