import assert from "node:assert/strict";
import test from "node:test";
import { createSignalArchive, parseWeeklySignalData } from "../lib/loadSignalArchive.ts";

function signal(overrides = {}) {
  return {
    id: "2026-08-17-001",
    prefecture: "長野県",
    municipality: "松本市",
    category: "Regional Mobility",
    title: "テストSignal",
    summary: "テスト概要",
    importance: "HIGH",
    publishedAt: "2026-08-16",
    whyItMatters: "テスト理由",
    opportunity: "テスト機会",
    relatedTopics: ["Mobility"],
    sourceUrl: "https://example.com/test",
    ...overrides,
  };
}

function report(week = "2026-08-17", signals = [signal()]) {
  return { week, generatedAt: `${week}T09:00:00+09:00`, signals };
}

test("creates a newest-first archive and attaches report weeks", () => {
  const archive = createSignalArchive([
    { source: "./2026-08-10.json", data: report("2026-08-10", [signal({ id: "old" })]) },
    { source: "./2026-08-17.json", data: report("2026-08-17", [signal({ id: "new" })]) },
  ]);
  assert.equal(archive.latestWeek, "2026-08-17");
  assert.deepEqual(archive.reports.map((item) => item.week), ["2026-08-17", "2026-08-10"]);
  assert.deepEqual(archive.allSignals.map((item) => [item.id, item.reportWeek]), [
    ["new", "2026-08-17"], ["old", "2026-08-10"],
  ]);
});

test("rejects missing fields, unsupported values, and invalid dates", () => {
  assert.throws(() => parseWeeklySignalData(report("2026-08-17", [signal({ title: undefined })]), "./2026-08-17.json"), /title/);
  assert.throws(() => parseWeeklySignalData(report("2026-08-17", [signal({ category: "Unknown" })]), "./2026-08-17.json"), /未対応のカテゴリ/);
  assert.throws(() => parseWeeklySignalData(report("2026-08-17", [signal({ publishedAt: "2026-99-99" })]), "./2026-08-17.json"), /publishedAt/);
});

test("rejects filename/week mismatches and duplicate ids across weeks", () => {
  assert.throws(() => parseWeeklySignalData(report(), "./2026-08-10.json"), /ファイル名の日付/);
  assert.throws(() => createSignalArchive([
    { source: "./2026-08-17.json", data: report() },
    { source: "./2026-08-10.json", data: report("2026-08-10") },
  ]), /既に 2026-08-17 で使用/);
});
