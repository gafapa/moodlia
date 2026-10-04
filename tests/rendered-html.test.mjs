import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(new URL(pathname, "http://localhost/"), { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

async function html(pathname) {
  const response = await render(pathname);
  assert.equal(response.status, 200, `${pathname} returned ${response.status}`);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  return response.text();
}

const appSlugs = [
  "rubrics",
  "backup-converter",
  "edx-converter",
  "teacher-dashboard",
  "analyzer-web",
  "moodle-plugin",
  "cli",
  "moodle-core-cli",
  "sync",
  "skills",
];
const appNames = [
  "MoodlIA Rubrics",
  "MoodlIA Backup Converter",
  "MoodlIA edX Converter",
  "MoodlIA Teacher Dashboard",
  "MoodlIA Analyzer Web",
  "MoodlIA Moodle Plugin",
  "MoodlIA CLI",
  "Moodle Core CLI",
  "MoodlIA Sync",
  "MoodlIA Skills",
];

// English route, Spanish route.
const pagePairs = [
  ["/", "/es"],
  ["/apps", "/es/apps"],
  ["/install", "/es/instalar"],
  ["/how-it-works", "/es/como-funciona"],
  ["/legal-notice", "/es/aviso-legal"],
  ["/privacy", "/es/privacy"],
  ["/cookies", "/es/cookies"],
  ...appSlugs.map((slug) => [`/apps/${slug}`, `/es/apps/${slug}`]),
];

test("home explains MoodlIA and lists every app", async () => {
  const page = await html("/");
  assert.match(page, /<title>MoodlIA — Open-source tools for Moodle<\/title>/);
  assert.match(page, /<h1[^>]*>Tools that make Moodle easier, for teachers and for administrators\.<\/h1>/);
  for (const name of appNames) assert.ok(page.includes(name), `home is missing ${name}`);
  assert.match(page, /href="\/install"/);
  assert.match(page, /What do you want to do\?/);
  assert.match(page, /"@type":"FAQPage"/);
  assert.match(page, /contact@moodlia\.com/);
});

test("apps without a public release are not shown", async () => {
  for (const pathname of ["/", "/apps", "/install", "/es", "/es/apps", "/es/instalar"]) {
    const page = await html(pathname);
    assert.doesNotMatch(page, /Corrector|Analyzer Desktop|MoodlIA Studio/, pathname);
  }
});

test("every page has its own title, canonical, hreflang pair, and one h1", async () => {
  const titles = { en: new Set(), es: new Set() };
  for (const [en, es] of pagePairs) {
    for (const [pathname, lang] of [[en, "en"], [es, "es"]]) {
      const page = await html(pathname);
      const title = page.match(/<title>([^<]+)<\/title>/)?.[1];
      assert.ok(title, `${pathname} has no title`);
      assert.ok(!titles[lang].has(title), `${pathname} repeats the title “${title}”`);
      titles[lang].add(title);
      assert.match(page, new RegExp(`<link rel="canonical" href="https://moodlia\\.com${pathname === "/" ? "/?" : pathname}"`), `${pathname} canonical`);
      assert.match(page, new RegExp(`hrefLang="en" href="https://moodlia\\.com${en === "/" ? "/?" : en}"`), `${pathname} hreflang en`);
      assert.match(page, new RegExp(`hrefLang="es" href="https://moodlia\\.com${es}"`), `${pathname} hreflang es`);
      assert.equal(page.match(/<h1[\s>]/g)?.length, 1, `${pathname} must have exactly one h1`);
      assert.match(page, new RegExp(`<main id="main" lang="${lang}"`), `${pathname} main landmark`);
      assert.match(page, /class="skip-link" href="#main"/, `${pathname} skip link`);
      assert.match(page, new RegExp(`<a href="${en === "/" ? "/" : en}" hrefLang="en"`), `${pathname} language switch to English`);
      assert.match(page, new RegExp(`<a href="${es}" hrefLang="es"`), `${pathname} language switch to Spanish`);
    }
  }
});

test("every app page has real installation steps and a way to get the app", async () => {
  for (const slug of appSlugs) {
    for (const pathname of [`/apps/${slug}`, `/es/apps/${slug}`]) {
      const page = await html(pathname);
      assert.match(page, /<section id="install"/, `${pathname} install section`);
      assert.match(page, /<ol class="steps"/, `${pathname} steps`);
      assert.match(page, /class="button button-accent" href="(?:https:\/\/|\/tools\/)/, `${pathname} get link`);
      assert.match(page, /"@type":"SoftwareApplication"/, `${pathname} structured data`);
    }
  }
});

test("installation instructions name the real distribution channels and commands", async () => {
  const install = await html("/install");
  for (const slug of appSlugs) assert.match(install, new RegExp(`id="${slug}"`), `install page anchor ${slug}`);
  assert.match(install, /chromewebstore\.google\.com\/detail\/rubricando-para-moodle/);
  assert.match(install, /marketplace\.moodle\.com\/plugins\/local_moodlia/);
  assert.match(install, /npm install -g moodlia</);
  assert.match(install, /npm install -g moodlia-sync/);
  assert.match(install, /href="\/tools\/backup-converter\/"/);

  const plugin = await html("/apps/moodle-plugin");
  assert.match(plugin, /local\/moodlia\/mcp\.php/);
  assert.match(plugin, /local\/moodlia:useapi/);
  assert.match(plugin, /docs\/web-installation\.md/);

  const pluginEs = await html("/es/apps/moodle-plugin");
  assert.match(pluginEs, /Instalar complementos/);
  assert.match(pluginEs, /Administrar fichas \(tokens\)/);
});

test("code blocks carry a copy button and the layout wires it", async () => {
  const page = await html("/apps/cli");
  assert.match(page, /<div class="code-block"><pre><code>npm install -g moodlia<\/code><\/pre><button type="button" class="copy-button" data-copy="true" data-copied-label="Copied">Copy<\/button>/);
  assert.match(page, /navigator\.clipboard\.writeText/);
  const spanish = await html("/es/apps/cli");
  assert.match(spanish, /data-copied-label="Copiado">Copiar</);
});

test("in-page links point at existing targets", async () => {
  for (const pathname of ["/", "/install", "/apps/moodle-plugin", "/es/instalar"]) {
    const page = await html(pathname);
    const ids = new Set([...page.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]));
    for (const [, target] of page.matchAll(/href="#([^"]+)"/g)) {
      assert.ok(ids.has(target), `${pathname} links to missing #${target}`);
    }
  }
});

test("Spanish pages are written in Spanish", async () => {
  const home = await html("/es");
  assert.match(home, /¿Qué quieres hacer\?/);
  assert.doesNotMatch(home, /What do you want to do\?/);
  const rubrics = await html("/es/apps/rubrics");
  assert.match(rubrics, /Añadir desde la Chrome Web Store/);
  assert.doesNotMatch(rubrics, /Add from the Chrome Web Store/);
});

test("publishes social metadata without development URLs", async () => {
  await access(new URL("../public/og-moodlia.png", import.meta.url));
  for (const pathname of ["/", "/es/apps/sync"]) {
    const page = await html(pathname);
    assert.match(page, /<meta property="og:image" content="https:\/\/moodlia\.com\/og-moodlia\.png"/);
    assert.match(page, /<meta name="twitter:card" content="summary_large_image"/);
    assert.doesNotMatch(page, /(?:href|src)="https?:\/\/(?:localhost|127\.0\.0\.1)/);
  }
});

test("keeps focus, reduced-motion, and dark-mode styles", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(css, /:focus-visible\s*{/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.match(css, /prefers-color-scheme: dark/);
  assert.match(css, /\.skip-link:focus/);
});
