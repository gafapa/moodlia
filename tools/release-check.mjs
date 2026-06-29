import { spawn } from 'node:child_process';

const includePackage = !process.argv.includes('--skip-package');
const includeSmokeSyntax = !process.argv.includes('--skip-smoke-syntax');

const checks = [
  ['npm', ['run', 'manifests:check']],
  ['npm', ['run', 'types:check']],
  ['npm', ['run', 'test:static']]
];

if (includeSmokeSyntax) {
  checks.push(
    ['node', ['--check', 'tests/smoke/module-completion-matrix.test.mjs']],
    ['node', ['--check', 'tests/smoke/module-custom-completion-rules.test.mjs']],
    ['node', ['--check', 'tests/smoke/generated-course-lifecycle.test.mjs']],
    ['node', ['--check', 'tests/browser/moodle-generated-content.spec.mjs']]
  );
}

if (includePackage) {
  checks.push(['npm', ['run', 'plugin:package']]);
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
