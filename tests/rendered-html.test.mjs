import assert from "node:assert/strict";
import test from "node:test";

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
  assert.match(html, /ARCHIVE/);
  assert.match(html, /2(?:<!-- -->)? WEEKS/);
  assert.match(html, /地域シグナル/);
  assert.match(html, /REPORT WEEK/);
  assert.match(html, /PUBLISHED AT/);
  assert.match(html, /日本シグナルマップ/);
  assert.match(html, /aria-label="地図を縮小"[^>]*disabled/);
  assert.match(html, /aria-label="地図表示を100%にリセット。現在100%"/);
  assert.match(html, /aria-label="地図を拡大"/);
  assert.doesNotMatch(html, /REALTIME|ONLINE FEED|>LIVE<|本日の地域シグナル|システム稼働中/i);
  assert.doesNotMatch(html, /codex-preview|SkeletonPreview|Building your site/i);
});
