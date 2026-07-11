import fs from 'node:fs/promises';
import { resolveMoodleUrl } from '../client/moodle-rest-client.mjs';
import { getEnv, getTimeout, loadEnvFile } from '../tests/helpers/env.mjs';
import { fromRoot } from '../tests/helpers/paths.mjs';

loadEnvFile();

const required = ['MOODLE_BASE_URL', 'MOODLE_USERNAME', 'MOODLE_PASSWORD', 'MOODLE_REST_SERVICE'];
const missing = required.filter((name) => !getEnv(name));

if (missing.length > 0) {
  console.error(`Missing required variables: ${missing.join(', ')}`);
  process.exit(1);
}

const endpoint = resolveMoodleUrl(getEnv('MOODLE_BASE_URL'), 'login/token.php');
const body = new URLSearchParams({
  username: getEnv('MOODLE_USERNAME'),
  password: getEnv('MOODLE_PASSWORD'),
  service: getEnv('MOODLE_REST_SERVICE')
});

const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), getTimeout());

try {
  const response = await fetch(endpoint, {
    method: 'POST',
    body,
    redirect: 'error',
    signal: controller.signal
  });

  const payload = await response.json();
  if (!response.ok || payload.error || !payload.token) {
    console.error(JSON.stringify({
      error: payload.error ?? `HTTP ${response.status}`,
      errorcode: payload.errorcode
    }, null, 2));
    process.exit(1);
  }

  const envPath = fromRoot('.env.test');
  const current = await fs.readFile(envPath, 'utf8').catch((error) =>
    error.code === 'ENOENT' ? '' : Promise.reject(error)
  );
  const next = current.includes('MOODLE_REST_TOKEN=')
    ? current.replace(/^MOODLE_REST_TOKEN=.*$/m, `MOODLE_REST_TOKEN=${payload.token}`)
    : `${current.replace(/\s*$/, '')}\nMOODLE_REST_TOKEN=${payload.token}\n`;

  await fs.writeFile(envPath, next, 'utf8');
  await fs.chmod(envPath, 0o600).catch(() => {});
  console.log('MOODLE_REST_TOKEN refreshed in .env.test.');
} finally {
  clearTimeout(timeout);
}
