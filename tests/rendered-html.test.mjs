import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(new URL(pathname, "http://localhost/"), {
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
  assert.match(html, /<title>MoodlIA — One Moodle\. Three ways forward\.<\/title>/i);
  assert.match(html, /Moodle,/i);
  assert.match(html, /made easier\./i);
  assert.match(html, /Three ways\./i);
  assert.match(html, /MoodlIA Moodle Plugin/);
  assert.match(html, /Moodle Core CLI/);
  assert.match(html, /MoodlIA Rubrics/);
  assert.match(html, /MoodlIA Corrector/);
  assert.match(html, /Teacher Dashboard/);
  assert.match(html, /MoodlIA Analyzer Web/);
  assert.match(html, /controlled access to Moodle actions and content/i);
  assert.match(html, /teacher-approved corrections/i);
  assert.match(html, /participation trends, student risk, and priorities/i);
  assert.match(html, /application\/ld\+json/);
  assert.match(html, /contact@moodlia\.com/);
  assert.match(html, /Tell us what is getting in the way\./i);
  assert.match(html, /https:\/\/moodlia\.com\/moodlia-educators-together-v2\.jpg/);
  assert.match(html, /href="\/es"[^>]*hrefLang="es"/i);
  assert.doesNotMatch(html, /github\.com/i);
  assert.doesNotMatch(html, /codex-preview|loading skeleton|Your site is taking shape/i);
});

test("keeps the product source free from starter preview code", async () => {
  const [page, catalog, layout, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/catalog.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(page, /const paths = getLocalizedWays\(locale\)\.map/);
  assert.match(catalog, /Bring AI into Moodle/);
  assert.match(catalog, /Make teaching flow/);
  assert.match(catalog, /See what needs attention/);
  assert.match(layout, /metadataBase: new URL\("https:\/\/moodlia\.com"\)/);
  assert.doesNotMatch(page, /SkeletonPreview|codex-preview/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  await access(new URL("../public/moodlia-educators-together-v2.jpg", import.meta.url));
  await Promise.all([
    access(new URL("../public/moodlia-ai-companion-v2.jpg", import.meta.url)),
    access(new URL("../public/moodlia-teaching-flow-v2.jpg", import.meta.url)),
    access(new URL("../public/moodlia-learning-clarity-v2.jpg", import.meta.url)),
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
  assert.match(html, /<a[^>]*class="skip-link"[^>]*href="#main-content"/i);
  assert.match(html, /<main[^>]*id="main-content"/i);
  assert.match(html, /<nav[^>]*aria-label="Main navigation"/i);
  assert.match(html, /<section[^>]*class="selections"[^>]*id="projects"[^>]*aria-labelledby="projects-title"/i);
  assert.equal((html.match(/class="selection-item selection-item-[123]"/g) ?? []).length, 3);
  assert.equal((html.match(/class="selection-image"/g) ?? []).length, 3);
  assert.match(html, /<nav[^>]*class="sequence-nav"/i);
  assert.match(html, /2852ad08/);
  assert.equal((html.match(/<article[^>]*tabindex=/gi) ?? []).length, 0);
  assert.equal((html.match(/<article\b/gi) ?? []).length, 3);
});

test("preserves accessible motion, focus, and touch behavior", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  const response = await render();
  const html = await response.text();

  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(css, /@view-transition\s*\{\s*navigation:\s*auto/s);
  assert.match(css, /view-transition-name:\s*moodlia-header/);
  assert.match(css, /view-transition-name:\s*moodlia-page/);
  assert.match(css, /paper-page-out 140ms/);
  assert.match(css, /paper-page-in 320ms/);
  assert.match(html, /id="moodlia-page-arrival"/);
  assert.match(html, /id="moodlia-page-navigation"/);
  assert.match(css, /\.skip-link:focus-visible\s*\{[^}]*transform: translateY\(0\)/s);
  assert.match(css, /a:focus-visible,\s*button:focus-visible\s*\{[^}]*outline:/s);
  assert.match(css, /\.site-header nav a,\s*\.header-contact\s*\{[^}]*min-height: 44px/s);
  assert.match(css, /\.primary-action, \.text-action, \.open-selection, \.detail-help > a\s*\{[^}]*min-height: 48px/s);
  assert.match(css, /--ease-out:\s*cubic-bezier\(/);
  assert.match(css, /@media \(max-width: 620px\)/);
});

test("keeps every in-page navigation link backed by a target", async () => {
  const response = await render();
  const html = await response.text();
  const targetIds = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]));
  const fragments = [...html.matchAll(/\bhref="#([^"]+)"/g)].map((match) => match[1]);

  assert.ok(fragments.length >= 1);
  for (const fragment of fragments) {
    assert.ok(targetIds.has(fragment), `Missing target for #${fragment}`);
  }
});

test("renders every way and product page with route-specific metadata", async () => {
  const detailRoutes = [
    ["/ways/ai-integration", "AI integration", "MoodlIA Moodle Plugin", "moodlia-ai-companion-v2.jpg"],
    ["/ways/teaching-tools", "Teaching tools", "MoodlIA Corrector", "moodlia-teaching-flow-v2.jpg"],
    ["/ways/learning-insights", "Learning insights", "MoodlIA Analyzer Web", "moodlia-learning-clarity-v2.jpg"],
    ["/products/moodle-plugin", "MoodlIA Moodle Plugin", "permission-aware workflows", "moodlia-ai-companion-v2.jpg"],
    ["/products/cli", "MoodlIA CLI", "Published npm package", "moodlia-ai-companion-v2.jpg"],
    ["/products/moodle-core-cli", "Moodle Core CLI", "Moodle 5.0 or later", "moodlia-ai-companion-v2.jpg"],
    ["/products/skills", "MoodlIA Skills", "Portable HTML", "moodlia-ai-companion-v2.jpg"],
    ["/products/rubrics", "MoodlIA Rubrics", "CSV rubric", "moodlia-teaching-flow-v2.jpg"],
    ["/products/corrector", "MoodlIA Corrector", "teacher control", "moodlia-teaching-flow-v2.jpg"],
    ["/products/chrome-extensions", "MoodlIA Chrome Extensions", "Browser-tool family", "moodlia-teaching-flow-v2.jpg"],
    ["/products/teacher-dashboard", "MoodlIA Teacher Dashboard", "backend-free dashboard", "moodlia-learning-clarity-v2.jpg"],
    ["/products/analyzer-web", "MoodlIA Analyzer Web", "intervention queues", "moodlia-learning-clarity-v2.jpg"],
    ["/products/analyzer-desktop", "MoodlIA Analyzer Desktop", "passwords kept only in memory", "moodlia-learning-clarity-v2.jpg"],
  ];

  for (const [route, title, proof, image] of detailRoutes) {
    const response = await render(route);
    assert.equal(response.status, 200, `${route} did not render`);
    const html = await response.text();
    assert.match(html, new RegExp(`<title>${title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")} \\| MoodlIA<\\/title>`, "i"));
    assert.match(html, new RegExp(proof, "i"));
    assert.match(html, new RegExp(`property="og:image"[^>]*content="https:\\/\\/moodlia\\.com\\/${image}"`, "i"));
    assert.match(html, new RegExp(`rel="canonical"[^>]*href="https:\\/\\/moodlia\\.com${route}"`, "i"));
    assert.doesNotMatch(html, /og-paper-automata\.png/i);
    assert.equal((html.match(/<h1\b/gi) ?? []).length, 1);
  }
});

test("renders complete Spanish routes with localized copy and SEO metadata", async () => {
  const spanishRoutes = [
    ["/es/ways/ai-integration", "Integración con IA", "Integra la IA en Moodle"],
    ["/es/ways/teaching-tools", "Herramientas docentes", "Haz que la enseñanza fluya"],
    ["/es/ways/learning-insights", "Información del aprendizaje", "Descubre qué necesita atención"],
    ["/es/products/moodle-plugin", "MoodlIA Moodle Plugin", "acceso controlado"],
    ["/es/products/cli", "MoodlIA CLI", "Paquete npm publicado"],
    ["/es/products/moodle-core-cli", "Moodle Core CLI", "Moodle 5.0 o posterior"],
    ["/es/products/skills", "MoodlIA Skills", "HTML portable"],
    ["/es/products/rubrics", "MoodlIA Rubrics", "archivo CSV"],
    ["/es/products/corrector", "MoodlIA Corrector", "control del docente"],
    ["/es/products/chrome-extensions", "MoodlIA Chrome Extensions", "Familia de herramientas"],
    ["/es/products/teacher-dashboard", "MoodlIA Teacher Dashboard", "panel sin backend"],
    ["/es/products/analyzer-web", "MoodlIA Analyzer Web", "colas de intervención"],
    ["/es/products/analyzer-desktop", "MoodlIA Analyzer Desktop", "únicamente en memoria"],
  ];

  const homeResponse = await render("/es");
  assert.equal(homeResponse.status, 200);
  const homeHtml = await homeResponse.text();
  assert.match(homeHtml, /<title>MoodlIA — Un solo Moodle\. Tres formas de avanzar\.<\/title>/i);
  assert.match(homeHtml, /Tres formas/i);
  assert.match(homeHtml, /<main[^>]*lang="es"/i);
  assert.match(homeHtml, /rel="canonical"[^>]*href="https:\/\/moodlia\.com\/es"/i);
  assert.match(homeHtml, /hrefLang="en"/i);
  assert.doesNotMatch(homeHtml, /github\.com/i);

  for (const [route, title, proof] of spanishRoutes) {
    const response = await render(route);
    assert.equal(response.status, 200, `${route} did not render`);
    const html = await response.text();
    assert.match(html, new RegExp(`<title>${title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")} \\| MoodlIA<\\/title>`, "i"));
    assert.match(html, new RegExp(proof, "i"));
    assert.match(html, /<main[^>]*lang="es"/i);
    assert.match(html, new RegExp(`rel="canonical"[^>]*href="https:\\/\\/moodlia\\.com${route}"`, "i"));
    assert.match(html, /hrefLang="en"/i);
  }
});

test("mentions GitHub only on individual product pages", async () => {
  const [homeResponse, wayResponse, productResponse] = await Promise.all([
    render("/"),
    render("/ways/ai-integration"),
    render("/products/moodle-plugin"),
  ]);
  const [homeHtml, wayHtml, productHtml] = await Promise.all([
    homeResponse.text(),
    wayResponse.text(),
    productResponse.text(),
  ]);

  assert.doesNotMatch(homeHtml, /github\.com/i);
  assert.doesNotMatch(wayHtml, /github\.com/i);
  assert.match(productHtml, /github\.com\/gafapa\/moodle-local_moodlia/i);
});

test("publishes complete social metadata without leaking preview URLs", async () => {
  const response = await render();
  const html = await response.text();

  assert.match(html, /property="og:title"[^>]*content="MoodlIA — One Moodle\. Three ways forward\."/i);
  assert.match(html, /property="og:image"[^>]*content="https:\/\/moodlia\.com\/moodlia-educators-together-v2\.jpg"/i);
  assert.match(html, /name="twitter:card"[^>]*content="summary_large_image"/i);
  assert.doesNotMatch(html, /localhost|127\.0\.0\.1|codex-preview/i);
});
