import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, relative, sep, dirname } from 'node:path';

// Privacy URLs are external contracts with extension stores, independent of site design.
export async function loadPrivacyPolicies(projectRoot) {
  const contract = JSON.parse((await readFile(resolve(projectRoot, 'config/extension-privacy.json'), 'utf8')).replace(/^\uFEFF/, ''));
  assert.equal(contract.version, 1, 'Unsupported privacy route contract');
  assert.ok(Array.isArray(contract.policies) && contract.policies.length > 0);
  const seen = new Set();
  const policies = [];
  for (const policy of contract.policies) {
    assert.match(policy.path, /^\/privacy\/[a-z-]+\.html$/, 'Privacy routes must remain unversioned public HTML paths');
    assert.ok(!seen.has(policy.path), `Duplicate privacy route: ${policy.path}`);
    seen.add(policy.path);
    assert.equal(policy.source, `public${policy.path}`, 'Policy source must match its reserved public URL');
    const sourcePath = resolve(projectRoot, policy.source);
    assert.ok(relative(resolve(projectRoot, 'public'), sourcePath).split(sep)[0] !== '..');
    const bytes = await readFile(sourcePath);
    const html = bytes.toString('utf8');
    assert.match(html, /<html lang="en"/);
    assert.ok(html.includes(`href="https://moodlia.com${policy.path}"`), `Missing policy canonical: ${policy.path}`);
    assert.match(html, /<h1>.+privacy policy<\/h1>/i);
    policies.push({ ...policy, bytes });
  }
  return policies;
}

export async function preservePrivacyPolicies(outputRoot, policies) {
  for (const policy of policies) {
    const target = resolve(outputRoot, `.${policy.path}`);
    assert.ok(target.startsWith(resolve(outputRoot) + sep), 'Privacy output escaped the export directory');
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, policy.bytes);
    assert.deepEqual(await readFile(target), policy.bytes, `Exported policy differs: ${policy.path}`);
  }
}
