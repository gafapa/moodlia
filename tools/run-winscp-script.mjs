import { spawn } from 'node:child_process';
import path from 'node:path';
import { fromRoot } from '../tests/helpers/paths.mjs';

const script = process.argv[2];
const log = process.argv[3];

if (!script) {
  console.error('Usage: node tools/run-winscp-script.mjs <script-path> [log-path]');
  process.exit(1);
}

const winscp = 'C:\\Program Files (x86)\\WinSCP\\WinSCP.com';
const args = [
  '/ini=nul',
  `/script=${fromRoot(script)}`
];

if (log) {
  args.push(`/log=${path.resolve(log)}`);
}

const child = spawn(winscp, args, {
  stdio: 'inherit',
  windowsVerbatimArguments: false
});

child.on('exit', (code) => {
  process.exit(code ?? 1);
});
