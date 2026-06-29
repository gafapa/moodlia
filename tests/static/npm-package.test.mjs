import fs from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import { fromRoot } from '../helpers/paths.mjs';

async function listFiles(directory, root = directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...await listFiles(fullPath, root));
      continue;
    }

    files.push(path.relative(root, fullPath).replaceAll(path.sep, '/'));
  }

  return files.sort();
}

test('npm CLI package contains only the publishable REST client surface', async () => {
  const packageDirectory = fromRoot('packages/moodlia');
  const packageJson = JSON.parse(await fs.readFile(path.join(packageDirectory, 'package.json'), 'utf8'));
  const contract = JSON.parse(await fs.readFile(path.join(packageDirectory, 'contract/operations.json'), 'utf8'));
  const files = await listFiles(packageDirectory);

  assert.equal(packageJson.name, 'moodlia');
  assert.deepEqual(packageJson.bin, {
    moodlia: 'cli/moodlia.mjs'
  });
  assert.deepEqual(files, [
    'LICENSE',
    'README.md',
    'cli/moodlia.mjs',
    'client/generated/operation-types.d.ts',
    'client/moodle-rest-client.d.ts',
    'client/moodle-rest-client.mjs',
    'contract/operations.json',
    'package.json'
  ]);

  for (const operation of contract.operations) {
    assert.ok(operation.transports.includes('cli'), `${operation.name} must be a CLI operation`);
    assert.ok(!operation.transports.includes('mcp'), `${operation.name} must not expose MCP transport metadata`);
    assert.ok(!operation.tests?.includes('mcp'), `${operation.name} must not expose MCP test metadata`);
  }

  const packageText = await Promise.all(files.map((file) => fs.readFile(path.join(packageDirectory, file), 'utf8')));
  assert.ok(!packageText.join('\n').match(/\bmcp\b/i), 'publishable package must not include MCP references');
  assert.ok(!packageText.join('\n').match(/winscp|playwright|test-results|\.env\.test/i), 'publishable package must not include development tooling references');
});
