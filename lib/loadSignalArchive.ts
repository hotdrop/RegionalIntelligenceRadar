/// <reference types="vite/client" />

import {
  IMPORTANCE_LEVELS,
  SIGNAL_CATEGORIES,
  type ArchivedSignal,
  type Importance,
  type Signal,
  type SignalArchive,
  type SignalCategory,
  type WeeklySignalData,
} from "../types/signal.ts";

const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const categorySet = new Set<string>(SIGNAL_CATEGORIES);
const importanceSet = new Set<string>(IMPORTANCE_LEVELS);

function fail(source: string, path: string, message: string): never {
  throw new Error(`[${source}] ${path}: ${message}`);
}

function record(value: unknown, source: string, path: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    fail(source, path, "オブジェクトである必要があります");
  }
  return value as Record<string, unknown>;
}

function text(value: unknown, source: string, path: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    fail(source, path, "空でない文字列である必要があります");
  }
  return value;
}

function isoDate(value: unknown, source: string, path: string): string {
  const result = text(value, source, path);
  if (!datePattern.test(result) || Number.isNaN(Date.parse(`${result}T00:00:00Z`))) {
    fail(source, path, "YYYY-MM-DD形式の有効な日付である必要があります");
  }
  return result;
}

function signalCategory(value: unknown, source: string, path: string): SignalCategory {
  const result = text(value, source, path);
  if (!categorySet.has(result)) fail(source, path, `未対応のカテゴリです: ${result}`);
  return result as SignalCategory;
}

function importance(value: unknown, source: string, path: string): Importance {
  const result = text(value, source, path);
  if (!importanceSet.has(result)) fail(source, path, `未対応の重要度です: ${result}`);
  return result as Importance;
}

function topics(value: unknown, source: string, path: string): string[] {
  if (!Array.isArray(value)) fail(source, path, "文字列の配列である必要があります");
  return value.map((topic, index) => text(topic, source, `${path}[${index}]`));
}

function sourceUrl(value: unknown, source: string, path: string): string {
  const result = text(value, source, path);
  let url: URL;
  try {
    url = new URL(result);
  } catch {
    fail(source, path, "有効なURLである必要があります");
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    fail(source, path, "httpまたはhttps URLである必要があります");
  }
  return result;
}

function parseSignal(value: unknown, source: string, index: number): Signal {
  const path = `signals[${index}]`;
  const input = record(value, source, path);
  return {
    id: text(input.id, source, `${path}.id`),
    prefecture: text(input.prefecture, source, `${path}.prefecture`),
    municipality: text(input.municipality, source, `${path}.municipality`),
    category: signalCategory(input.category, source, `${path}.category`),
    title: text(input.title, source, `${path}.title`),
    summary: text(input.summary, source, `${path}.summary`),
    importance: importance(input.importance, source, `${path}.importance`),
    publishedAt: isoDate(input.publishedAt, source, `${path}.publishedAt`),
    whyItMatters: text(input.whyItMatters, source, `${path}.whyItMatters`),
    opportunity: text(input.opportunity, source, `${path}.opportunity`),
    relatedTopics: topics(input.relatedTopics, source, `${path}.relatedTopics`),
    sourceUrl: sourceUrl(input.sourceUrl, source, `${path}.sourceUrl`),
  };
}

export function parseWeeklySignalData(value: unknown, source: string): WeeklySignalData {
  const input = record(value, source, "root");
  const week = isoDate(input.week, source, "week");
  const expectedWeek = source.match(/(\d{4}-\d{2}-\d{2})\.json$/)?.[1];
  if (expectedWeek && expectedWeek !== week) {
    fail(source, "week", `ファイル名の日付 ${expectedWeek} と一致しません`);
  }
  const generatedAt = text(input.generatedAt, source, "generatedAt");
  if (Number.isNaN(Date.parse(generatedAt))) {
    fail(source, "generatedAt", "有効なISO日時である必要があります");
  }
  if (!Array.isArray(input.signals)) fail(source, "signals", "配列である必要があります");
  return {
    week,
    generatedAt,
    signals: input.signals.map((item, index) => parseSignal(item, source, index)),
  };
}

export function createSignalArchive(files: Array<{ source: string; data: unknown }>): SignalArchive {
  const reports = files
    .map(({ source, data }) => parseWeeklySignalData(data, source))
    .sort((a, b) => b.week.localeCompare(a.week));
  const ids = new Map<string, string>();
  const allSignals: ArchivedSignal[] = [];
  for (const report of reports) {
    for (const signal of report.signals) {
      const previousWeek = ids.get(signal.id);
      if (previousWeek) {
        fail(report.week, `signal.id=${signal.id}`, `既に ${previousWeek} で使用されています`);
      }
      ids.set(signal.id, report.week);
      allSignals.push({ ...signal, reportWeek: report.week });
    }
  }
  return { reports, latestWeek: reports[0]?.week ?? null, allSignals };
}

export function loadSignalArchive(): SignalArchive {
  const modules = import.meta.glob<unknown>("../data/*.json", { eager: true, import: "default" });
  return createSignalArchive(
    Object.entries(modules).map(([source, data]) => ({ source, data })),
  );
}
