import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the MoodlIA product page", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>MoodlIA — Open tools for Moodle<\/title>/i);
  assert.match(html, /Build better courses\. Automate careful work\. See where to act\./);
  assert.match(html, /MoodlIA Plugin/);
  assert.match(html, /Moodle Core CLI/);
  assert.match(html, /MoodlIA Rubrics/);
  assert.match(html, /MoodlIA Corrector/);
  assert.match(html, /MoodlIA Analyzer/);
  assert.match(html, /MoodlIA Studio/);
  assert.match(html, /https:\/\/moodlia\.com\/og\.png/);
  assert.doesNotMatch(html, /codex-preview|loading skeleton|Your site is taking shape/i);
});

test("keeps the product source free from starter preview code", async () => {
  const [page, layout, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(page, /const products = \[/);
  assert.match(page, /Studio is currently an idea, not an implementation/);
  assert.match(layout, /metadataBase: new URL\("https:\/\/moodlia\.com"\)/);
  assert.doesNotMatch(page, /SkeletonPreview|codex-preview/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  await access(new URL("../public/og.png", import.meta.url));
});

test("renders an accessible landmark and heading structure", async () => {
  const response = await render();
  const html = await response.text();

  assert.match(html, /<html[^>]*lang="en"/i);
  assert.equal((html.match(/<main\b/gi) ?? []).length, 1);
  assert.equal((html.match(/<h1\b/gi) ?? []).length, 1);
  assert.match(html, /<nav[^>]*aria-label="Main navigation"/i);
  assert.match(html, /<aside[^>]*aria-label="MoodlIA capabilities"/i);
  assert.equal((html.match(/class="product-card"/g) ?? []).length, 6);
});

test("keeps every in-page navigation link backed by a target", async () => {
  const response = await render();
  const html = await response.text();
  const targetIds = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]));
  const fragments = [...html.matchAll(/\bhref="#([^"]+)"/g)].map((match) => match[1]);

  assert.ok(fragments.length >= 5);
  for (const fragment of fragments) {
    assert.ok(targetIds.has(fragment), `Missing target for #${fragment}`);
  }
});

test("publishes complete social metadata without leaking preview URLs", async () => {
  const response = await render();
  const html = await response.text();

  assert.match(html, /property="og:title"[^>]*content="MoodlIA — Open tools for Moodle"/i);
  assert.match(html, /property="og:image"[^>]*content="https:\/\/moodlia\.com\/og\.png"/i);
  assert.match(html, /name="twitter:card"[^>]*content="summary_large_image"/i);
  assert.doesNotMatch(html, /localhost|127\.0\.0\.1|codex-preview/i);
});
