import fs from 'node:fs/promises';
import path from 'node:path';
import { getEnv, loadEnvFile } from '../tests/helpers/env.mjs';
import { fromRoot } from '../tests/helpers/paths.mjs';

loadEnvFile();

const source = fromRoot(getEnv('LOCAL_PLUGIN_SOURCE') || 'plugin/moodlia');
const target = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.resolve(getEnv('LOCAL_PLUGIN_PACKAGE_PATH') || 'D:/tmp/moodlia');

await fs.rm(target, { recursive: true, force: true });
await fs.mkdir(path.dirname(target), { recursive: true });
await fs.cp(source, target, {
  recursive: true,
  filter: (entry) => {
    const name = path.basename(entry);
    return !['.env', 'node_modules', 'vendor', 'test-results', 'playwright-report'].includes(name);
  }
});

console.log(`Packaged plugin from ${source} to ${target}`);
