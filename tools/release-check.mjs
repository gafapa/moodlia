import { spawn } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';

const includePackage = !process.argv.includes('--skip-package');

const checks = [
  ['npm', ['run', 'lint:js']],
  ['npm', ['run', 'lint:php']],
  ['npm', ['run', 'manifests:check']],
  ['npm', ['run', 'types:check']],
  ['npm', ['run', 'test:static']]
];

if (includePackage) {
  checks.push(['npm', ['run', 'plugin:package', '--', path.join(os.tmpdir(), `moodlia-release-check-${process.pid}`)]]);
}

for (const [command, args] of checks) {
  await run(command, args);
}

console.log('MoodlIA release checks completed.');

function run(command, args) {
  const label = `${command} ${args.join(' ')}`;
  console.log(`\n> ${label}`);

  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: process.cwd(),
      stdio: 'inherit',
      shell: process.platform === 'win32'
    });

    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${label} exited with code ${code ?? 1}`));
    });
  });
}
