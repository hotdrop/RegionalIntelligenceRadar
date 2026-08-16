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
  assert.match(html, /本日の地域シグナル/);
  assert.match(html, /日本シグナルマップ/);
  assert.doesNotMatch(html, /codex-preview|SkeletonPreview|Building your site/i);
});
