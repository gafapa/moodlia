import assert from "node:assert/strict";
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const clientRoot = resolve(projectRoot, "dist", "client");
const serverEntry = resolve(projectRoot, "dist", "server", "index.js");
const outputRoot = resolve(projectRoot, ".static-export");
const fontSourcePrefix = `${projectRoot.replaceAll("\\", "/")}/.vinext/fonts/`;
const englishPageRoutes = [
  "/",
  "/ways/ai-integration",
  "/ways/teaching-tools",
  "/ways/learning-insights",
  "/products/moodle-plugin",
  "/products/cli",
  "/products/moodle-core-cli",
  "/products/skills",
  "/products/rubrics",
  "/products/corrector",
  "/products/chrome-extensions",
  "/products/teacher-dashboard",
  "/products/analyzer-web",
  "/products/analyzer-desktop",
];
const pageRoutes = [
  ...englishPageRoutes,
  ...englishPageRoutes.map((route) => route === "/" ? "/es" : `/es${route}`),
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
const html = renderedPages[0].html;
assert.match(html, /<title>MoodlIA — One Moodle\. Three ways forward\.<\/title>/i);
assert.match(html, /https:\/\/moodlia\.com\/moodlia-educators-together-v2\.jpg/i);
assert.doesNotMatch(html, /localhost|127\.0\.0\.1|codex-preview/i);
assert.match(robotsText, /Sitemap: https:\/\/moodlia\.com\/sitemap\.xml/i);
assert.match(sitemapXml, /<loc>https:\/\/moodlia\.com\/<\/loc>/i);
assert.match(sitemapXml, /<loc>https:\/\/moodlia\.com\/ways\/ai-integration<\/loc>/i);
assert.match(sitemapXml, /<loc>https:\/\/moodlia\.com\/es\/ways\/ai-integration<\/loc>/i);
assert.match(sitemapXml, /<loc>https:\/\/moodlia\.com\/products\/analyzer-desktop<\/loc>/i);
assert.match(sitemapXml, /<loc>https:\/\/moodlia\.com\/es\/products\/analyzer-desktop<\/loc>/i);

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

console.log(`Exported static site to ${outputRoot}`);
