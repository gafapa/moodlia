import assert from "node:assert/strict";
import { loadPrivacyPolicies, preservePrivacyPolicies } from "./privacy-policies.mjs";
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const privacyPolicies = await loadPrivacyPolicies(projectRoot);
const clientRoot = resolve(projectRoot, "dist", "client");
const serverEntry = resolve(projectRoot, "dist", "server", "index.js");
const outputRoot = resolve(projectRoot, ".static-export");
const fontSourcePrefix = `${projectRoot.replaceAll("\\", "/")}/.vinext/fonts/`;
const appSlugs = [
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
const pageRoutes = [
  "/",
  "/apps",
  "/install",
  "/how-it-works",
  "/legal-notice",
  "/privacy",
  "/cookies",
  ...appSlugs.map((slug) => `/apps/${slug}`),
  "/es",
  "/es/apps",
  "/es/instalar",
  "/es/como-funciona",
  "/es/aviso-legal",
  "/es/privacy",
  "/es/cookies",
  ...appSlugs.map((slug) => `/es/apps/${slug}`),
];

await readFile(serverEntry);

const workerUrl = pathToFileURL(serverEntry);
workerUrl.searchParams.set("static-export", `${process.pid}-${Date.now()}`);
const { default: worker } = await import(workerUrl.href);

async function renderPath(pathname, accept, extraHeaders = {}) {
  const response = await worker.fetch(
    new Request(new URL(pathname, "https://moodlia.com/"), {
      headers: { accept, ...extraHeaders },
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

  assert.equal(response.status, 200, `${pathname} did not render successfully.`);
  return response.text();
}

const [renderedPages, robotsText, sitemapXml] = await Promise.all([
  Promise.all(pageRoutes.map(async (route) => ({
    route,
    html: await renderPath(route, "text/html"),
    rscPayload: await renderPath(
      route === "/" ? "/.rsc" : `${route}.rsc`,
      "text/x-component",
      { "x-vinext-interception-context": route },
    ),
  }))),
  renderPath("/robots.txt", "text/plain"),
  renderPath("/sitemap.xml", "application/xml"),
]);
for (const policy of privacyPolicies) assert.ok(sitemapXml.includes(`https://moodlia.com${policy.path}`), `Missing policy from sitemap: ${policy.path}`);
const html = renderedPages[0].html;
assert.match(html, /<title>MoodlIA — Open-source tools for Moodle<\/title>/i);
assert.match(html, /https:\/\/moodlia\.com\/og-moodlia\.png/i);
assert.doesNotMatch(html, /(?:href|src)="https?:\/\/(?:localhost|127\.0\.0\.1)|codex-preview/i);
assert.match(robotsText, /Sitemap: https:\/\/moodlia\.com\/sitemap\.xml/i);
for (const route of pageRoutes) {
  const location = route === "/" ? "https://moodlia.com/" : `https://moodlia.com${route}`;
  assert.ok(sitemapXml.includes(`<loc>${location}</loc>`), `${route} is missing from the sitemap.`);
}

for (const page of renderedPages) {
  page.html = page.html.replaceAll(fontSourcePrefix, "/assets/_vinext_fonts/");
  if (page.route === "/es" || page.route.startsWith("/es/")) {
    page.html = page.html.replace('<html lang="en">', '<html lang="es">');
  }
  assert.doesNotMatch(page.html, /(?:file:\/\/\/|[a-z]:\/)\S*\.woff2/i);
}

await rm(outputRoot, { recursive: true, force: true });
await mkdir(outputRoot, { recursive: true });
await cp(clientRoot, outputRoot, { recursive: true });
await preservePrivacyPolicies(outputRoot, privacyPolicies);
await Promise.all([
  rm(resolve(outputRoot, ".vite"), { recursive: true, force: true }),
  rm(resolve(outputRoot, ".assetsignore"), { force: true }),
  rm(resolve(outputRoot, "_headers"), { force: true }),
]);
await Promise.all([
  ...renderedPages.flatMap((page) => {
    const routePath = page.route === "/" ? "" : page.route.slice(1);
    const htmlPath = resolve(outputRoot, routePath, "index.html");
    const rscPath = page.route === "/"
      ? resolve(outputRoot, ".rsc")
      : resolve(outputRoot, `${routePath}.rsc`);
    return [
      mkdir(dirname(htmlPath), { recursive: true }).then(() => writeFile(htmlPath, page.html, "utf8")),
      mkdir(dirname(rscPath), { recursive: true }).then(() => writeFile(rscPath, page.rscPayload, "utf8")),
    ];
  }),
  writeFile(resolve(outputRoot, "robots.txt"), robotsText, "utf8"),
  writeFile(resolve(outputRoot, "sitemap.xml"), sitemapXml, "utf8"),
]);

// Retired routes keep working as redirects, because static hosting has no server-side rewrites.
// Routes of the previous site, which other pages and search engines still link to.
const retiredProducts = { "chrome-extensions": null, "analyzer-desktop": null, "sync-mcp": "sync" };
const legacyRedirects = {
  "/start": "/install",
  "/es/empezar": "/es/instalar",
  ...Object.fromEntries(["ai-integration", "teaching-tools", "learning-insights"].flatMap((way) => [
    [`/ways/${way}`, "/apps"],
    [`/es/ways/${way}`, "/es/apps"],
  ])),
  ...Object.fromEntries([...appSlugs.filter((slug) => slug !== "edx-converter"), ...Object.keys(retiredProducts)].flatMap((slug) => {
    const target = slug in retiredProducts ? retiredProducts[slug] : slug;
    return [
      [`/products/${slug}`, target ? `/apps/${target}` : "/apps"],
      [`/es/products/${slug}`, target ? `/es/apps/${target}` : "/es/apps"],
    ];
  })),
};
await Promise.all(Object.entries(legacyRedirects).map(async ([from, to]) => {
  const target = `https://moodlia.com${to}`;
  const htmlPath = resolve(outputRoot, from.slice(1), "index.html");
  await mkdir(dirname(htmlPath), { recursive: true });
  await writeFile(
    htmlPath,
    `<!doctype html><html><head><meta charset="utf-8"><title>Moved</title>` +
      `<link rel="canonical" href="${target}"><meta name="robots" content="noindex">` +
      `<meta http-equiv="refresh" content="0; url=${to}"></head>` +
      `<body><a href="${to}">${target}</a></body></html>`,
    "utf8",
  );
}));

const converterHtml = await readFile(resolve(outputRoot, "tools", "backup-converter", "index.html"), "utf8");
assert.match(converterHtml, /\/tools\/backup-converter\/assets\/index-[^\"']+\.js/i);
assert.match(converterHtml, /<title>MoodlIA Backup Converter<\/title>/i);

console.log(`Exported static site to ${outputRoot}`);
