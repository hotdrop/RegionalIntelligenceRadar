import assert from "node:assert/strict";
import test from "node:test";
import { filterSignals, firstSignalId } from "../lib/filterSignals.ts";

const signals = [
  { id: "new-fukuoka-ai", reportWeek: "2026-08-17", prefecture: "福岡県", municipality: "北九州市", category: "AI" },
  { id: "new-nagano-health", reportWeek: "2026-08-17", prefecture: "長野県", municipality: "松本市", category: "Healthcare" },
  { id: "old-fukuoka-gov", reportWeek: "2026-08-10", prefecture: "福岡県", municipality: "福岡市", category: "GovTech" },
];

test("default and reset include all weeks, municipalities and categories in archive order", () => {
  assert.deepEqual(filterSignals(signals, { prefecture: null }), signals);
  assert.equal(firstSignalId(signals, { prefecture: null }), "new-fukuoka-ai");
});

test("prefecture selection includes old reports and different municipalities and categories", () => {
  assert.deepEqual(filterSignals(signals, { prefecture: "福岡県" }).map(s => s.id),
    ["new-fukuoka-ai", "old-fukuoka-gov"]);
  assert.equal(firstSignalId(signals, { prefecture: "長野県" }), "new-nagano-health");
});

test("no matches and empty archive have no selected detail", () => {
  assert.deepEqual(filterSignals(signals, { prefecture: "東京都" }), []);
  assert.equal(firstSignalId(signals, { prefecture: "東京都" }), null);
  assert.equal(firstSignalId([], { prefecture: null }), null);
});

const { defaultFilters, searchTerms, highlightParts, matchingExcerpts } = await import('../lib/filterSignals.ts');
const complete = [
  { ...signals[0], title: 'ＡＩの窓口', summary: '子育ての相談', relatedTopics: ['GovTech'], whyItMatters: '住民の手間を減らす', publishedAt: '2026-08-01' },
  { ...signals[1], municipality: '北九州市', title: '窓口', summary: '子育ての相談', relatedTopics: ['Healthcare'], whyItMatters: '医療の連携', publishedAt: '2026-08-16' },
  { ...signals[2], title: 'マイナンバーの窓口', summary: '子育てを支援', relatedTopics: ['Digital Identity'], whyItMatters: '職員の負担を減らす', publishedAt: '2026-08-09' },
];
const ids = filters => filterSignals(complete, { ...defaultFilters, ...filters }).map(s => s.id);

test('AND terms cross fields and report weeks, with empty and normalized queries', () => {
  assert.deepEqual(searchTerms(' ＡＩ　子育て  ai\n'), ['ai', '子育て']);
  assert.deepEqual(ids({ query: 'ai 子育て' }), ['new-fukuoka-ai']);
  assert.deepEqual(ids({ query: 'マイナンバー 子育て 職員' }), ['old-fukuoka-gov']);
  assert.deepEqual(ids({ query: '  　\n' }), complete.map(s => s.id));
  assert.deepEqual(ids({ query: '存在しない言葉' }), []);
  assert.deepEqual(ids({ query: 'ai 医療' }), []);
});

test('searches municipalities and original and Japanese topic labels', () => {
  assert.deepEqual(ids({ query: '北九州市' }), ['new-fukuoka-ai', 'new-nagano-health']);
  assert.deepEqual(ids({ query: '行政DX' }), ['new-fukuoka-ai']);
  assert.deepEqual(ids({ query: 'govtech' }), ['new-fukuoka-ai']);
  assert.deepEqual(ids({ query: 'デジタル本人確認' }), ['old-fukuoka-gov']);
});

test('keywords combine with map selection and clear independently', () => {
  assert.deepEqual(ids({ query: '北九州市', prefecture: '福岡県' }), ['new-fukuoka-ai']);
  assert.deepEqual(ids({ query: '北九州市', prefecture: null }), ['new-fukuoka-ai', 'new-nagano-health']);
  assert.deepEqual(ids({ query: '', prefecture: '福岡県' }), ['new-fukuoka-ai', 'old-fukuoka-gov']);
  assert.deepEqual(ids(defaultFilters), complete.map(s => s.id));
  assert.equal(firstSignalId(complete, { query: 'ai', prefecture: '長野県' }), null);
  assert.deepEqual(filterSignals([], { ...defaultFilters, query: '窓口' }), []);
});

test('results always use report-week order, with stable ties regardless of published date', () => {
  const shuffled = [complete[2], complete[0], complete[1]];
  assert.deepEqual(filterSignals(shuffled, { ...defaultFilters, query: '窓口' }).map(s => s.id), complete.map(s => s.id));
  assert.equal(firstSignalId(shuffled, { ...defaultFilters, query: '窓口' }), 'new-fukuoka-ai');
  assert.deepEqual(shuffled.map(s => s.id), ['old-fukuoka-gov', 'new-fukuoka-ai', 'new-nagano-health']);
});

test('highlights preserve original graphemes when normalization contracts or expands them', () => {
  const text = 'ＡＩ ｶﾞ ㍿ e\u0301 <script>&';
  const parts = highlightParts(text, searchTerms('ai ガ 株式 é <script>'));
  assert.equal(parts.map(p => p.text).join(''), text);
  assert.deepEqual(parts.filter(p => p.matched).map(p => p.text), ['ＡＩ', 'ｶﾞ', '㍿', 'e\u0301', '<script>']);
  assert.deepEqual(highlightParts('マイナンバーカード', searchTerms('マイナンバー ナンバーカード')), [{ text: 'マイナンバーカード', matched: true }]);
  assert.deepEqual(highlightParts('plain', []), [{ text: 'plain', matched: false }]);
});

test('excerpts show actual matched fields, bounded context and at most three matches', () => {
  const signal = { ...complete[0], summary: '前'.repeat(150) + '子育て' + '後'.repeat(150) };
  const excerpts = matchingExcerpts(signal, searchTerms('子育て'));
  assert.equal(excerpts[0].label, '概要');
  assert.equal(excerpts[0].parts.filter(p => p.matched).map(p => p.text).join(''), '子育て');
  assert.ok(excerpts[0].parts.map(p => p.text).join('').startsWith('…'));
  assert.ok(excerpts[0].parts.map(p => p.text).join('').length <= 102);
  assert.equal(matchingExcerpts(signal, []).length, 0);
  assert.equal(matchingExcerpts(signal, searchTerms('窓口 子育て 北九州市 行政DX 手間')).length, 3);
  assert.equal(matchingExcerpts(signal, searchTerms('govtech'))[0].label, '関連トピック');
});
