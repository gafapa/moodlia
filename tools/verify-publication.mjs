import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readdir, readFile, mkdir, writeFile } from "node:fs/promises";
import { resolve, relative, sep } from "node:path";

const root = resolve(".static-export");
const base = new URL(process.argv[2] ?? "https://moodlia.com/");
assert.equal(base.protocol, "https:");
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const files = [];
async function collect(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) await collect(path);
    else if (entry.isFile()) files.push(path);
    else throw new Error(`Unexpected export entry: ${path}`);
  }
}
await collect(root);
const results = [];
let cursor = 0;
await Promise.all(Array.from({ length: 6 }, async () => {
  while (cursor < files.length) {
    const file = files[cursor++];
    const path = relative(root, file).split(sep).join("/");
    const url = new URL(path, base);
    const response = await fetch(url, { headers: { "cache-control": "no-cache" }, signal: AbortSignal.timeout(30000) });
    assert.equal(response.status, 200, `${url} returned ${response.status}`);
    const expected = hash(await readFile(file));
    const actual = hash(Buffer.from(await response.arrayBuffer()));
    assert.equal(actual, expected, `${url} differs from the local export`);
    results.push({ path, sha256: actual });
  }
}));
for (const path of ["/", "/es/", "/apps/", "/es/apps/", "/es/apps/corrector/", "/es/apps/rubrics/", "/es/instalar/", "/es/como-funciona/", "/privacy", "/es/privacy"]) {
  const response = await fetch(new URL(path, base), { signal: AbortSignal.timeout(30000) });
  assert.equal(response.status, 200, `Clean route ${path} returned ${response.status}`);
}
let redirect;
let httpObservation;
try {
  redirect = await fetch(new URL(base.href.replace(/^https:/, "http:")), { redirect: "manual", signal: AbortSignal.timeout(15000) });
} catch (error) {
  httpObservation = { verified: false, reason: error.cause?.code ?? error.message };
}
if (redirect) {
  assert.ok([301, 302, 307, 308].includes(redirect.status), "HTTP must redirect to HTTPS");
  assert.match(redirect.headers.get("location") ?? "", /^https:\/\/moodlia\.com/);
  httpObservation = { verified: true, status: redirect.status, location: redirect.headers.get("location") };
}
await mkdir(".taste-skill/deployment", { recursive: true });
await writeFile(".taste-skill/deployment/publication.json", JSON.stringify({ verifiedAt: new Date().toISOString(), base: base.href, files: results.sort((a, b) => a.path.localeCompare(b.path)), cleanRoutes: 10, http: httpObservation }, null, 2) + "\n");
console.log(`Verified ${results.length} public files byte for byte and 10 clean HTTPS routes. HTTP redirect: ${httpObservation.verified ? "verified" : httpObservation.reason}.`);
