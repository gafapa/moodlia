import assert from "node:assert/strict";
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const clientRoot = resolve(projectRoot, "dist", "client");
const serverEntry = resolve(projectRoot, "dist", "server", "index.js");
const outputRoot = resolve(projectRoot, ".static-export");

await readFile(serverEntry);

const workerUrl = pathToFileURL(serverEntry);
workerUrl.searchParams.set("static-export", `${process.pid}-${Date.now()}`);
const { default: worker } = await import(workerUrl.href);

const response = await worker.fetch(
  new Request("https://moodlia.com/", {
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

assert.equal(response.status, 200, "The home page did not render successfully.");
const html = await response.text();
assert.match(html, /<title>MoodlIA — Three ways to improve Moodle<\/title>/i);
assert.match(html, /https:\/\/moodlia\.com\/og-ecosystem\.png/i);
assert.doesNotMatch(html, /localhost|127\.0\.0\.1|codex-preview/i);

await rm(outputRoot, { recursive: true, force: true });
await mkdir(outputRoot, { recursive: true });
await cp(clientRoot, outputRoot, { recursive: true });
await Promise.all([
  rm(resolve(outputRoot, ".vite"), { recursive: true, force: true }),
  rm(resolve(outputRoot, ".assetsignore"), { force: true }),
  rm(resolve(outputRoot, "_headers"), { force: true }),
]);
await writeFile(resolve(outputRoot, "index.html"), html, "utf8");

console.log(`Exported static site to ${outputRoot}`);
