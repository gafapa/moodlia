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

test("server-renders the MoodlIA ecosystem page", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>MoodlIA — Open-source AI tools for Moodle<\/title>/i);
  assert.match(html, /Moodle,/);
  assert.match(html, /ready for what(?:&#x27;|')s next\./i);
  assert.match(html, /MoodlIA Moodle Plugin/);
  assert.match(html, /Moodle Core CLI/);
  assert.match(html, /MoodlIA Rubrics/);
  assert.match(html, /MoodlIA Corrector/);
  assert.match(html, /Teacher Dashboard/);
  assert.match(html, /MoodlIA Analyzer Web/);
  assert.match(html, /application\/ld\+json/);
  assert.match(html, /Open-source AI tools for Moodle/);
  assert.match(html, /https:\/\/moodlia\.com\/og-ecosystem\.png/);
  assert.doesNotMatch(html, /codex-preview|loading skeleton|Your site is taking shape/i);
});

test("keeps the product source free from starter preview code", async () => {
  const [page, layout, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(page, /const areas = \[/);
  assert.match(page, /AI integration/);
  assert.match(page, /Teaching tools/);
  assert.match(page, /Learning analytics/);
  assert.match(layout, /metadataBase: new URL\("https:\/\/moodlia\.com"\)/);
  assert.doesNotMatch(page, /SkeletonPreview|codex-preview/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  await access(new URL("../public/og-ecosystem.png", import.meta.url));
  await Promise.all([
    access(new URL("../public/moodlia-ai-integration.jpg", import.meta.url)),
    access(new URL("../public/moodlia-teaching-tools.jpg", import.meta.url)),
    access(new URL("../public/moodlia-learning-analytics.jpg", import.meta.url)),
    access(new URL("../app/robots.ts", import.meta.url)),
    access(new URL("../app/sitemap.ts", import.meta.url)),
  ]);
});

test("renders an accessible landmark and heading structure", async () => {
  const response = await render();
  const html = await response.text();

  assert.match(html, /<html[^>]*lang="en"/i);
  assert.equal((html.match(/<main\b/gi) ?? []).length, 1);
  assert.equal((html.match(/<h1\b/gi) ?? []).length, 1);
  assert.match(html, /<nav[^>]*aria-label="Main navigation"/i);
  assert.match(html, /<section[^>]*id="projects"[^>]*aria-labelledby="projects-title"/i);
  assert.equal((html.match(/class="project-card"/g) ?? []).length, 3);
  assert.equal((html.match(/<article\b/gi) ?? []).length, 3);
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

  assert.match(html, /property="og:title"[^>]*content="MoodlIA — Open-source AI tools for Moodle"/i);
  assert.match(html, /property="og:image"[^>]*content="https:\/\/moodlia\.com\/og-ecosystem\.png"/i);
  assert.match(html, /name="twitter:card"[^>]*content="summary_large_image"/i);
  assert.doesNotMatch(html, /localhost|127\.0\.0\.1|codex-preview/i);
});
