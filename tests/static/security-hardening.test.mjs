import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';
import { fromRoot } from '../helpers/paths.mjs';

test('dependency lockfile uses the official npm registry with integrity hashes', async () => {
  const lockfile = JSON.parse(await fs.readFile(fromRoot('package-lock.json'), 'utf8'));

  for (const [packagePath, definition] of Object.entries(lockfile.packages)) {
    if (!definition.resolved) {
      continue;
    }

    assert.equal(
      new URL(definition.resolved).host,
      'registry.npmjs.org',
      `${packagePath} must resolve from the official npm registry`
    );
    assert.match(definition.integrity ?? '', /^sha512-/, `${packagePath} must include a SHA-512 integrity hash`);
  }
});

test('CI pins third-party actions and requires Node 24, PHP lint, and dependency audit', async () => {
  const workflow = await fs.readFile(fromRoot('.github/workflows/ci.yml'), 'utf8');
  const actionReferences = [...workflow.matchAll(/^\s*uses:\s*([^\s#]+)/gm)].map((match) => match[1]);

  assert.ok(actionReferences.length >= 4);
  for (const reference of actionReferences) {
    assert.match(reference, /@[a-f0-9]{40}$/, `${reference} must be pinned to an immutable commit`);
  }

  assert.match(workflow, /node-version:\s*'24'/);
  assert.match(workflow, /php-version:\s*'8\.2'/);
  assert.match(workflow, /npm run lint:php -- --required/);
  assert.match(workflow, /npm audit --audit-level=high/);
});

test('MCP endpoint implements lifecycle, origin validation, bounded input, and CallToolResult', async () => {
  const source = await fs.readFile(fromRoot('plugin/moodlia/mcp.php'), 'utf8');

  assert.match(source, /\$method === 'initialize'/);
  assert.match(source, /\$method === 'notifications\/initialized'/);
  assert.match(source, /\$method === 'ping'/);
  assert.match(source, /local_moodlia_mcp_validate_origin/);
  assert.match(source, /CONTENT_TYPE/);
  assert.match(source, /HTTP_ACCEPT/);
  assert.match(source, /HTTP_MCP_PROTOCOL_VERSION/);
  assert.match(source, /LOCAL_MOODLIA_MCP_MAX_REQUEST_BYTES/);
  assert.match(source, /'structuredContent' => \$payload/);
  assert.match(source, /'isError' => false/);
});

test('file overwrites and token provisioning retain the previous asset until replacement succeeds', async () => {
  const folderUpload = await fs.readFile(fromRoot('plugin/moodlia/classes/operation/upload_folder_file.php'), 'utf8');
  const backupTools = await fs.readFile(fromRoot('plugin/moodlia/classes/operation/course_backup_tools.php'), 'utf8');
  const tokenTool = await fs.readFile(fromRoot('tools/create-moodlia-token-ui.mjs'), 'utf8');

  assert.match(folderUpload, /replace_file_with\(\$draftfile\)/);
  assert.match(backupTools, /replace_file_with\(\$draftfile\)/);
  assert.doesNotMatch(folderUpload, /\$existing->delete\(\)/);
  assert.match(tokenTool, /getAuthenticatedUser/);
  assert.doesNotMatch(tokenTool, /value\s*=\s*['"]2['"]/);
});
