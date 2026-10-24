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
  "portable",
  "corrector",
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
  "MoodlIA Portable",
  "MoodlIA Corrector",
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

test("home explains the flagship, assessment and reuse workflows", async () => {
  const page = await html("/");
  assert.match(page, /<title>MoodlIA — Open-source tools for Moodle<\/title>/);
  assert.match(page, /From idea<\/span><span>to Moodle\./);
  for (const slug of ["moodle-plugin", "rubrics", "corrector", "sync", "backup-converter", "edx-converter"]) {
    assert.ok(page.includes(`href="/apps/${slug}"`), `home has no visible guide link for ${slug}`);
  }
  assert.match(page, /href="\/apps\/moodle-plugin#install"/);
  assert.match(page, /href="#workflow"/);
  assert.match(page, /Illustrative teaching example/);
  assert.match(page, /Your teacher review/);
  assert.match(page, /"@type":"FAQPage"/);
  assert.match(page, /contact@moodlia\.com/);
});

test("Portable is discoverable and explains the real preview installer distribution", async () => {
  for (const prefix of ["", "/es"]) {
    const home = await html(prefix || "/");
    assert.ok(home.includes(`href="${prefix}/apps/portable"`));
    const directory = await html(`${prefix}/apps`);
    assert.match(directory, /MoodlIA Portable/);
    const installation = await html(prefix ? "/es/instalar" : "/install");
    assert.match(installation, /id="portable"/);
    const guide = await html(`${prefix}/apps/portable`);
    assert.match(guide, /status-preview/);
    assert.match(guide, /moodlia-portable\/actions\/workflows\/native\.yml/);
    assert.match(guide, /MoodlIA-Windows-x64/);
    assert.match(guide, /MoodlIA-macOS-arm64/);
    assert.match(guide, /MoodlIA-Linux-arm64/);
    assert.match(guide, /credentials\.txt/);
    assert.match(guide, /\.mbz/);
    assert.doesNotMatch(guide, /moodlia-portable\/releases\/download/);
  }
  const english = await html("/apps/portable");
  assert.match(english, /GitHub account/);
  assert.match(english, /unsigned previews/);
  assert.match(english, /No public GitHub Release/);
  assert.match(english, /You do not install Docker/);
});

test("concept-only and superseded apps are not advertised as products", async () => {
  for (const pathname of ["/", "/apps", "/install", "/es", "/es/apps", "/es/instalar"]) {
    const page = await html(pathname);
    assert.doesNotMatch(page, /Analyzer Desktop|MoodlIA Studio|MoodlIA Sync MCP/, pathname);
  }
});

test("the skills offer contains only portable content authoring in both languages", async () => {
  for (const pathname of ["/apps/skills", "/es/apps/skills"]) {
    const page = await html(pathname);
    assert.match(page, /design-portable-moodle-content/);
    assert.doesNotMatch(page, /operate-moodle-with-moodlia/);
    assert.match(page, /source\.json|validador|validator/i);
    assert.doesNotMatch(page, /Two agent skills|Dos skills para agentes/);
  }
});

test("the outcome directory includes every tool with readiness and no audience labels", async () => {
  for (const pathname of ["/apps", "/es/apps"]) {
    const page = await html(pathname);
    for (const name of appNames) assert.ok(page.includes(name), `${pathname} omits ${name}`);
    for (const family of ["connect", "assess", "reuse", "follow-up"]) assert.ok(page.includes(`id="family-${family}"`));
    assert.match(page, /status-manual/);
    assert.match(page, /status-source/);
    assert.match(page, /status-preview/);
    assert.doesNotMatch(page, /level-technical|Anyone with a browser|Cualquiera con un navegador|For Moodle administrators|Para administradores de Moodle/);
  }
});

test("Corrector guides match the public release and preserve teacher control", async () => {
  for (const pathname of ["/apps/corrector", "/es/apps/corrector"]) {
    const page = await html(pathname);
    assert.match(page, /releases\/tag\/v0\.1\.71/);
    assert.match(page, /moodlia-corrector-0\.1\.71\.zip/);
    assert.match(page, /chrome:\/\/extensions/);
    assert.doesNotMatch(page, /0\.1\.45|0\.1\.62/);
    assert.match(page, /LM Studio/);
  }
  const english = await html("/apps/corrector");
  assert.match(english, /never automatically submits the grading form/);
  assert.match(english, /evidence reaches your selected AI provider/);
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
  assert.match(home, /De idea<\/span><span>a Moodle\./);
  assert.match(home, /revisa los comentarios y decide la nota/);
  assert.doesNotMatch(home, /Your AI, working inside Moodle/);
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

test("permanent extension privacy URLs and general index links survive redesigns", async () => {
  const { loadPrivacyPolicies } = await import("../tools/privacy-policies.mjs");
  const projectRoot = new URL("../", import.meta.url);
  const { fileURLToPath } = await import("node:url");
  const policies = await loadPrivacyPolicies(fileURLToPath(projectRoot));
  assert.deepEqual(policies.map(({ id, path }) => ({ id, path })), [
    { id: "corrector", path: "/privacy/corrector.html" },
    { id: "rubrics", path: "/privacy/rubrics.html" },
  ]);
  for (const pathname of ["/privacy", "/es/privacy", "/", "/es", "/apps", "/es/apps"]) {
    const page = await html(pathname);
    for (const policy of policies) assert.ok(page.includes(`href="${policy.path}"`), `${pathname} missing ${policy.path}`);
  }
  for (const prefix of ["", "/es"]) {
    for (const policy of policies) {
      const page = await html(`${prefix}/apps/${policy.id}`);
      assert.ok(page.includes(`href="${policy.path}"`), `${prefix}/apps/${policy.id} missing its privacy policy`);
    }
    const install = await html(prefix ? "/es/instalar" : "/install");
    for (const policy of policies) assert.ok(install.includes(`href="${policy.path}"`), `installation page missing ${policy.path}`);
  }
  const sitemap = await (await render("/sitemap.xml")).text();
  for (const policy of policies) assert.ok(sitemap.includes(`https://moodlia.com${policy.path}`));
  assert.match(policies[0].bytes.toString(), /HTTP is unencrypted/);
  assert.match(policies[0].bytes.toString(), /Limited Use/);
  assert.match(policies[1].bytes.toString(), /Rubricando for Moodle/);
  assert.match(policies[1].bytes.toString(), /CSV\/Excel/);
});

test("static exports retain exact policy bytes and missing source policies fail validation", async () => {
  const { loadPrivacyPolicies, preservePrivacyPolicies } = await import("../tools/privacy-policies.mjs");
  const { fileURLToPath } = await import("node:url");
  const { resolve, sep } = await import("node:path");
  const { mkdtemp, mkdir, copyFile, rm } = await import("node:fs/promises");
  const projectRoot = fileURLToPath(new URL("../", import.meta.url));
  const temporary = await mkdtemp(resolve(projectRoot, "node_modules/.privacy-contract-"));
  assert.ok(temporary.startsWith(resolve(projectRoot, "node_modules") + sep));
  try {
    const policies = await loadPrivacyPolicies(projectRoot);
    const output = resolve(temporary, "export");
    await preservePrivacyPolicies(output, policies);
    for (const policy of policies) assert.deepEqual(await readFile(resolve(output, `.${policy.path}`)), policy.bytes);
    await mkdir(resolve(temporary, "config"));
    await mkdir(resolve(temporary, "public/privacy"), { recursive: true });
    await copyFile(resolve(projectRoot, "config/extension-privacy.json"), resolve(temporary, "config/extension-privacy.json"));
    await copyFile(resolve(projectRoot, policies[0].source), resolve(temporary, policies[0].source));
    await assert.rejects(loadPrivacyPolicies(temporary), /ENOENT/);
  } finally {
    assert.ok(temporary.startsWith(resolve(projectRoot, "node_modules") + sep));
    await rm(temporary, { recursive: true, force: true });
  }
});
