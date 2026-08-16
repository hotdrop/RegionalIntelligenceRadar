import type { RegionalSignal } from "@/types/signal";

export function SignalDetail({ signal }: { signal: RegionalSignal | null }) {
  if (!signal) {
    return <section className="panel detail-panel empty-detail"><span>SELECT A SIGNAL</span></section>;
  }

  return (
    <section className="panel detail-panel" key={signal.id}>
      <div className="detail-top">
        <span className={`importance ${signal.importance.toLowerCase()}`}>{signal.importance}</span>
        <span className="detail-location">{signal.prefecture} — {signal.municipality}</span>
        <time className="detail-date">{signal.publishedAt.replaceAll("-", ".")}</time>
      </div>
      <h3>{signal.title}</h3>
      <div className="detail-scroll">
        <div className="detail-grid">
          <article><span className="eyebrow">SIGNAL</span><p>{signal.summary}</p></article>
          <article><span className="eyebrow">WHY IT MATTERS</span><p>{signal.whyItMatters}</p></article>
          <article className="opportunity-block"><span className="eyebrow accent">OPPORTUNITY</span><p>{signal.opportunity}</p></article>
        </div>
        <footer className="detail-footer">
          <div><span className="eyebrow">RELATED TOPICS</span><div className="topic-list">{signal.relatedTopics.map((topic) => <span key={topic}>{topic}</span>)}</div></div>
          <a href={signal.sourceUrl} target="_blank" rel="noreferrer" className="source-link">SOURCE <span aria-hidden="true">↗</span></a>
        </footer>
      </div>
    </section>
  );
}
