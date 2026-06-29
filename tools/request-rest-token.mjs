import { getEnv, getTimeout, loadEnvFile } from '../tests/helpers/env.mjs';

loadEnvFile();

const required = ['MOODLE_BASE_URL', 'MOODLE_USERNAME', 'MOODLE_PASSWORD', 'MOODLE_REST_SERVICE'];
const missing = required.filter((name) => !getEnv(name));

if (missing.length > 0) {
  console.error(`Missing required variables: ${missing.join(', ')}`);
  process.exit(1);
}

const endpoint = new URL('/login/token.php', getEnv('MOODLE_BASE_URL'));
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
    signal: controller.signal
  });

  const payload = await response.json();

  if (!response.ok || payload.error || !payload.token) {
    console.error(JSON.stringify({
      error: payload.error ?? `HTTP ${response.status}`,
      errorcode: payload.errorcode,
      stack: payload.stack
    }, null, 2));
    process.exit(1);
  }

  console.log(JSON.stringify({
    moodle_base_url: getEnv('MOODLE_BASE_URL'),
    service: getEnv('MOODLE_REST_SERVICE'),
    token: payload.token,
    private_token: payload.privatetoken ?? null
  }, null, 2));
} finally {
  clearTimeout(timeout);
}
