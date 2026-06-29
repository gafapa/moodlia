import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const packageDirectory = path.join(rootDirectory, 'packages', 'moodlia');
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const args = ['pack', ...process.argv.slice(2)];

const child = spawn(npmCommand, args, {
  cwd: packageDirectory,
  stdio: 'inherit',
  shell: process.platform === 'win32'
});

child.on('exit', (code) => {
  process.exitCode = code ?? 1;
});
