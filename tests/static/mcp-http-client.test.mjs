import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';

import { fromRoot } from '../helpers/paths.mjs';

test('MCP REST bridge uses Moodle HTTP security and proxy handling', async () => {
  const source = await fs.readFile(fromRoot('plugin/moodlia/mcp.php'), 'utf8');

  assert.match(source, /new \\core\\http_client\s*\(/);
  assert.match(source, /'http_errors'\s*=>\s*false/);
  assert.doesNotMatch(source, /\bcurl_(?:init|setopt|setopt_array|exec|getinfo|error|close)\s*\(/);
});
