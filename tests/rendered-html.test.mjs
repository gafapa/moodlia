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
  assert.match(html, /<title>MoodlIA — Make Moodle work for you\.<\/title>/i);
  assert.match(html, /Make Moodle/i);
  assert.match(html, /work for you\./i);
  assert.match(html, /Three ways\./i);
  assert.match(html, /MoodlIA Moodle Plugin/);
  assert.match(html, /Moodle Core CLI/);
  assert.match(html, /MoodlIA Rubrics/);
  assert.match(html, /MoodlIA Corrector/);
  assert.match(html, /MoodlIA Backup Converter/);
  assert.match(html, /Teacher Dashboard/);
  assert.match(html, /MoodlIA Analyzer Web/);
  assert.match(html, /controlled access to Moodle actions and content/i);
  assert.match(html, /teacher-approved corrections/i);
  assert.match(html, /participation trends, student risk, and priorities/i);
  assert.match(html, /application\/ld\+json/);
  assert.match(html, /contact@moodlia\.com/);
  assert.match(html, /href="\/start"[^>]*>Find your starting point</i);
  assert.match(html, /Tell us what you want to make easier\./i);
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
  assert.match(catalog, /Turn ideas into Moodle learning/);
  assert.match(catalog, /Spend more time teaching/);
  assert.match(catalog, /Know where to help next/);
  assert.match(layout, /metadataBase: new URL\("https:\/\/moodlia\.com"\)/);
  assert.doesNotMatch(page, /SkeletonPreview|codex-preview/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  await access(new URL("../public/moodlia-educators-together-v2.jpg", import.meta.url));
  await Promise.all([
    access(new URL("../public/moodlia-ai-companion-v2.jpg", import.meta.url)),
    access(new URL("../public/moodlia-teaching-flow-v2.jpg", import.meta.url)),
    access(new URL("../public/moodlia-learning-clarity-v2.jpg", import.meta.url)),
    access(new URL("../public/moodlia-start-here-brand.png", import.meta.url)),
    access(new URL("../app/getting-started.tsx", import.meta.url)),
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
  assert.doesNotMatch(css, /view-transition|paper-page-out|paper-page-in/);
  assert.doesNotMatch(html, /sessionStorage|moodlia-page-transition/);
  assert.match(css, /\.skip-link:focus-visible\s*\{[^}]*transform: translateY\(0\)/s);
  assert.match(css, /a:focus-visible,\s*button:focus-visible\s*\{[^}]*outline:/s);
  assert.match(css, /\.site-header nav a,\s*\.header-contact\s*\{[^}]*min-height: 44px/s);
  assert.match(css, /\.primary-action, \.text-action, \.open-selection, \.detail-help > a\s*\{[^}]*min-height: 48px/s);
  assert.match(css, /--ease-out:\s*cubic-bezier\(/);
  assert.match(css, /@media \(max-width: 620px\)/);
});

test("renders legal information in English and Spanish with persistent footer links", async () => {
  const routes = [
    ["/legal-notice", "Legal notice", "Website operator", "https://moodlia.com/legal-notice"],
    ["/privacy", "Privacy", "Who is responsible", "https://moodlia.com/privacy"],
    ["/cookies", "Cookies", "Current use", "https://moodlia.com/cookies"],
    ["/es/aviso-legal", "Aviso legal", "Titular del sitio web", "https://moodlia.com/es/aviso-legal"],
    ["/es/privacy", "Privacidad", "Quién es responsable", "https://moodlia.com/es/privacy"],
    ["/es/cookies", "Cookies", "Uso actual", "https://moodlia.com/es/cookies"],
  ];

  for (const [route, title, proof, canonical] of routes) {
    const response = await render(route);
    assert.equal(response.status, 200, `${route} did not render`);
    const html = await response.text();
    assert.match(html, new RegExp(`<title>${title} \\| MoodlIA<\\/title>`, "i"));
    assert.match(html, new RegExp(proof, "i"));
    assert.match(html, new RegExp(`rel="canonical"[^>]*href="${canonical}"`, "i"));
    assert.match(html, /href="\/(legal-notice|es\/aviso-legal)"/i);
    assert.match(html, /href="\/(privacy|es\/privacy)"/i);
    assert.match(html, /href="\/(cookies|es\/cookies)"/i);
  }
});

test("gives non-technical visitors a localized first step", async () => {
  const routes = [
    ["/start", "Start with MoodlIA", "You do not need to be technical", "https://moodlia.com/start", "href=\"/es/empezar\""],
    ["/es/empezar", "Empieza con MoodlIA", "No necesitas saber de tecnología", "https://moodlia.com/es/empezar", "href=\"/start\""],
  ];

  for (const [route, title, proof, canonical, alternate] of routes) {
    const response = await render(route);
    assert.equal(response.status, 200, `${route} did not render`);
    const html = await response.text();
    assert.match(html, new RegExp(`<title>${title} \\| MoodlIA<\\/title>`, "i"));
    assert.match(html, new RegExp(proof, "i"));
    assert.match(html, /moodlia-start-here-brand\.png/i);
    assert.match(html, /src="\/favicon\.svg"/i);
    assert.match(html, /How each tool is installed and used\.|Cómo se instala y se utiliza cada herramienta\./i);
    assert.match(html, new RegExp(`rel="canonical"[^>]*href="${canonical}"`, "i"));
    assert.match(html, new RegExp(alternate, "i"));
    assert.doesNotMatch(html, /github\.com/i);
    assert.equal((html.match(/<h1\b/gi) ?? []).length, 1);
  }
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
    ["/ways/ai-integration", "Plan with AI", "MoodlIA Moodle Plugin", "moodlia-ai-companion-v2.jpg"],
    ["/ways/teaching-tools", "Teach with ease", "MoodlIA Corrector", "moodlia-teaching-flow-v2.jpg"],
    ["/ways/learning-insights", "See what matters", "MoodlIA Analyzer Web", "moodlia-learning-clarity-v2.jpg"],
    ["/products/moodle-plugin", "MoodlIA Moodle Plugin", "permission-aware workflows", "moodlia-ai-companion-v2.jpg"],
    ["/products/cli", "MoodlIA CLI", "Published npm package", "moodlia-ai-companion-v2.jpg"],
    ["/products/moodle-core-cli", "Moodle Core CLI", "Moodle 5.0 or later", "moodlia-ai-companion-v2.jpg"],
    ["/products/skills", "MoodlIA Skills", "Portable HTML", "moodlia-ai-companion-v2.jpg"],
    ["/products/rubrics", "MoodlIA Rubrics", "CSV rubric", "moodlia-teaching-flow-v2.jpg"],
    ["/products/corrector", "MoodlIA Corrector", "teacher control", "moodlia-teaching-flow-v2.jpg"],
    ["/products/backup-converter", "MoodlIA Backup Converter", "never uploads it", "moodlia-teaching-flow-v2.jpg"],
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
    if (route.startsWith("/products/")) {
      assert.match(html, /How installation and use work\./i);
      assert.match(html, /Set it up once/i);
      assert.match(html, /Try one small thing/i);
      assert.match(html, /href="#how-to-start"[^>]*>See installation and first-use steps/i);
    }
    assert.match(html, new RegExp(`property="og:image"[^>]*content="https:\\/\\/moodlia\\.com\\/${image}"`, "i"));
    assert.match(html, new RegExp(`rel="canonical"[^>]*href="https:\\/\\/moodlia\\.com${route}"`, "i"));
    assert.doesNotMatch(html, /og-paper-automata\.png/i);
    assert.equal((html.match(/<h1\b/gi) ?? []).length, 1);
  }
});

test("renders complete Spanish routes with localized copy and SEO metadata", async () => {
  const spanishRoutes = [
    ["/es/ways/ai-integration", "Planifica con IA", "Convierte ideas en aprendizaje en Moodle"],
    ["/es/ways/teaching-tools", "Enseña con facilidad", "Dedica más tiempo a enseñar"],
    ["/es/ways/learning-insights", "Ve lo importante", "Sabe dónde ayudar después"],
    ["/es/products/moodle-plugin", "MoodlIA Moodle Plugin", "acceso controlado"],
    ["/es/products/cli", "MoodlIA CLI", "Paquete npm publicado"],
    ["/es/products/moodle-core-cli", "Moodle Core CLI", "Moodle 5.0 o posterior"],
    ["/es/products/skills", "MoodlIA Skills", "HTML portable"],
    ["/es/products/rubrics", "MoodlIA Rubrics", "archivo CSV"],
    ["/es/products/corrector", "MoodlIA Corrector", "control del docente"],
    ["/es/products/backup-converter", "MoodlIA Backup Converter", "nunca la sube"],
    ["/es/products/chrome-extensions", "MoodlIA Chrome Extensions", "Familia de herramientas"],
    ["/es/products/teacher-dashboard", "MoodlIA Teacher Dashboard", "panel sin backend"],
    ["/es/products/analyzer-web", "MoodlIA Analyzer Web", "colas de intervención"],
    ["/es/products/analyzer-desktop", "MoodlIA Analyzer Desktop", "únicamente en memoria"],
  ];

  const homeResponse = await render("/es");
  assert.equal(homeResponse.status, 200);
  const homeHtml = await homeResponse.text();
  assert.match(homeHtml, /<title>MoodlIA — Haz que Moodle trabaje contigo\.<\/title>/i);
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
    if (route.startsWith("/es/products/")) {
      assert.match(html, /Cómo se instala y se utiliza\./i);
      assert.match(html, /Configúralo una vez/i);
      assert.match(html, /Prueba una cosa pequeña/i);
      assert.match(html, /href="#how-to-start"[^>]*>Ver cómo instalarla y utilizarla/i);
    }
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

test("gives each product an actionable installation guide", async () => {
  const routes = [
    ["/products/moodle-plugin", "Install MoodlIA in Moodle", "local/moodlia", "mcp\.php"],
    ["/products/cli", "Install and run MoodlIA CLI", "npm install -g moodlia", "moodlia get-current-user"],
    ["/products/moodle-core-cli", "Install and run Moodle Core CLI", "npx moodle-core-cli get-courses", "--allow-write"],
    ["/products/rubrics", "Install MoodlIA Rubrics in Chrome", "chrome://extensions", "Chrome Web Store"],
    ["/products/corrector", "Install MoodlIA Corrector in Chrome", "chromewebstore\.google\.com", "Ollama"],
    ["/products/backup-converter", "Convert a Moodle backup in your browser", "Protect the original", "empty test course"],
    ["/es/products/moodle-plugin", "Instala MoodlIA en Moodle", "local/moodlia", "mcp\.php"],
    ["/es/products/cli", "Instala y ejecuta MoodlIA CLI", "npm install -g moodlia", "moodlia get-current-user"],
    ["/es/products/rubrics", "Instala MoodlIA Rubrics en Chrome", "chrome://extensions", "Chrome Web Store"],
    ["/es/products/backup-converter", "Convierte una copia de Moodle en tu navegador", "Protege el original", "curso de prueba vacío"],
  ];

  for (const [route, heading, firstProof, secondProof] of routes) {
    const response = await render(route);
    assert.equal(response.status, 200, `${route} did not render`);
    const html = await response.text();
    assert.match(html, new RegExp(heading, "i"));
    assert.match(html, new RegExp(firstProof, "i"));
    assert.match(html, new RegExp(secondProof, "i"));
  }
});

test("links the backup converter product to the hosted browser application", async () => {
  for (const route of ["/products/backup-converter", "/es/products/backup-converter"]) {
    const response = await render(route);
    assert.equal(response.status, 200, `${route} did not render`);
    const html = await response.text();
    assert.match(html, /href="\/tools\/backup-converter\/"/i);
    assert.match(html, /github\.com\/gafapa\/moodlia-backup-converter/i);
  }
});

test("publishes complete social metadata without leaking preview URLs", async () => {
  const response = await render();
  const html = await response.text();

  assert.match(html, /property="og:title"[^>]*content="MoodlIA — Make Moodle work for you\."/i);
  assert.match(html, /property="og:image"[^>]*content="https:\/\/moodlia\.com\/moodlia-educators-together-v2\.jpg"/i);
  assert.match(html, /name="twitter:card"[^>]*content="summary_large_image"/i);
  assert.doesNotMatch(html, /localhost|127\.0\.0\.1|codex-preview/i);
});
