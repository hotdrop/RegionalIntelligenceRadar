import assert from "node:assert/strict";
import test from "node:test";
import { readdir, readFile } from "node:fs/promises";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the Regional Intelligence Radar shell", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>地域インテリジェンス・レーダー<\/title>/i);
  assert.match(html, /地域インテリジェンス・レーダー/);
  assert.match(html, /LATEST REPORT/);
  assert.match(html, /2026-08-17/);
  assert.match(html, /生成AIによる行政問い合わせ支援を全庁運用へ移行/);
  assert.match(html, /ARCHIVE/);
  assert.doesNotMatch(html, /SIGNAL WIRE|最新シグナル|すべて解除|すべての自治体|class="archive-filter"|class="filter-strip"/);
  assert.match(html, /地域選択を解除/);
  const files = (await readdir(new URL("../data/", import.meta.url))).filter(name => /^\d{4}-\d{2}-\d{2}\.json$/.test(name));
  const reports = await Promise.all(files.map(async name => JSON.parse(await readFile(new URL("../data/" + name, import.meta.url), "utf8"))));
  const total = reports.reduce((sum, report) => sum + report.signals.length, 0);
  assert.match(html, new RegExp("<b>SIGNALS</b>(?:<!-- -->)?" + total));
  for (const report of reports) {
    for (const signal of report.signals) assert.ok(html.includes(signal.title));
  }
  assert.match(html, /地域シグナル/);
  assert.match(html, /REPORT WEEK/);
  assert.match(html, /PUBLISHED AT/);
  assert.match(html, /日本シグナルマップ/);
  assert.match(html, /aria-label="表示配分"/);
  assert.match(html, /aria-pressed="true"[^>]*>探索</);
  assert.match(html, /aria-label="マップとシグナル領域の幅を変更"[^>]*aria-valuenow="55"/);
  assert.match(html, /aria-label="シグナル一覧と詳細の高さを変更"[^>]*aria-valuenow="70"/);
  assert.match(html, /class="map-signal-marker critical focused"[^>]*data-prefecture="福岡県"/);
  assert.match(html, /aria-label="地図を縮小"[^>]*disabled/);
  assert.match(html, /aria-label="地図表示を100%にリセット。現在100%"/);
  assert.match(html, /aria-label="地図を拡大"/);
  assert.doesNotMatch(html, /REALTIME|ONLINE FEED|>LIVE<|本日の地域シグナル|システム稼働中/i);
  assert.doesNotMatch(html, /codex-preview|SkeletonPreview|Building your site/i);
});
