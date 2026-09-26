import type { ArchivedSignal } from "@/types/signal";
import { topicLabel } from "./presentationLabels.ts";

export type SignalFilters = {
  prefecture: string | null;
  query?: string;

};

export const defaultFilters: SignalFilters = {
  prefecture: null, query: "",
};

export function normalizeSearch(value: string) {
  return value.normalize("NFKC").toLowerCase();
}

export function searchTerms(query: string) {
  return [...new Set(normalizeSearch(query).split(/\s+/u).filter(Boolean))];
}

export function searchFields(signal: ArchivedSignal) {
  return [
    { label: "タイトル", text: signal.title },
    { label: "概要", text: signal.summary },
    { label: "自治体", text: signal.municipality },
    ...signal.relatedTopics.map(topic => ({ label: "関連トピック", text: topicLabel(topic) === topic ? topic : `${topicLabel(topic)}（${topic}）` })),
    { label: "注目する理由", text: signal.whyItMatters },
  ];
}

export function filterSignals(signals: ArchivedSignal[], filters: SignalFilters) {
  const terms = searchTerms(filters.query ?? "");
  return signals.filter(signal => {
    if (filters.prefecture && signal.prefecture !== filters.prefecture) return false;
    if (!terms.length) return true;
    const fields = searchFields(signal).map(field => normalizeSearch(field.text));
    return terms.every(term => fields.some(field => field.includes(term)));
  }).sort((a, b) => b.reportWeek.localeCompare(a.reportWeek));
}

export function firstSignalId(signals: ArchivedSignal[], filters: SignalFilters) {
  return filterSignals(signals, filters)[0]?.id ?? null;
}

export type TextPart = { text: string; matched: boolean };
type MatchRange = { start: number; end: number };

// Map normalized UTF-16 offsets back to complete original graphemes (e.g. ｶﾞ, ㍿).
function matchRanges(text: string, terms: string[]): MatchRange[] {
  let normalized = "";
  const offsets: MatchRange[] = [];
  for (const { segment, index } of new Intl.Segmenter("ja", { granularity: "grapheme" }).segment(text)) {
    const value = normalizeSearch(segment);
    normalized += value;
    for (let i = 0; i < value.length; i++) offsets.push({ start: index, end: index + segment.length });
  }
  const ranges: MatchRange[] = [];
  for (const term of terms) {
    if (!term) continue;
    for (let at = normalized.indexOf(term); at !== -1; at = normalized.indexOf(term, at + 1)) {
      ranges.push({ start: offsets[at].start, end: offsets[at + term.length - 1].end });
    }
  }
  const merged: MatchRange[] = [];
  for (const range of ranges.sort((a, b) => a.start - b.start)) {
    const previous = merged.at(-1);
    if (previous && range.start <= previous.end) previous.end = Math.max(previous.end, range.end);
    else merged.push({ ...range });
  }
  return merged;
}

function partsInRange(text: string, ranges: MatchRange[], start: number, end: number): TextPart[] {
  const parts: TextPart[] = [];
  let cursor = start;
  for (const range of ranges) {
    if (range.end <= start || range.start >= end) continue;
    const left = Math.max(start, range.start);
    const right = Math.min(end, range.end);
    if (left > cursor) parts.push({ text: text.slice(cursor, left), matched: false });
    parts.push({ text: text.slice(left, right), matched: true });
    cursor = right;
  }
  if (cursor < end) parts.push({ text: text.slice(cursor, end), matched: false });
  return parts;
}

export function highlightParts(text: string, terms: string[]): TextPart[] {
  return partsInRange(text, matchRanges(text, terms), 0, text.length);
}

export function matchingExcerpts(signal: ArchivedSignal, terms: string[]) {
  if (!terms.length) return [];
  return searchFields(signal).flatMap(field => {
    const ranges = matchRanges(field.text, terms);
    if (!ranges.length) return [];
    const first = ranges[0];
    // Snap the excerpt boundaries to graphemes, so emoji and combining marks stay intact.
    const boundaries = [...new Intl.Segmenter("ja", { granularity: "grapheme" }).segment(field.text)].map(s => s.index);
    boundaries.push(field.text.length);
    const start = boundaries.find(b => b >= Math.max(0, first.start - 24)) ?? 0;
    const end = boundaries.find(b => b >= Math.max(first.end, start + 100)) ?? field.text.length;
    return [{ label: field.label, parts: [
      ...(start ? [{ text: "…", matched: false }] : []),
      ...partsInRange(field.text, ranges, start, end),
      ...(end < field.text.length ? [{ text: "…", matched: false }] : []),
    ] }];
  }).slice(0, 3);
}
