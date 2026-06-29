import { loadEnvFile, getEnv } from '../tests/helpers/env.mjs';

loadEnvFile();

const functionName = process.argv[2] ?? 'local_moodlia_get_current_user';
const parameters = {};
for (const argument of process.argv.slice(3)) {
  const separatorIndex = argument.indexOf('=');
  if (separatorIndex === -1) {
    continue;
  }
  parameters[argument.slice(0, separatorIndex)] = argument.slice(separatorIndex + 1);
}
const endpoint = new URL('/webservice/rest/server.php', getEnv('MOODLE_BASE_URL'));
const body = new URLSearchParams({
  wstoken: getEnv('MOODLE_REST_TOKEN'),
  wsfunction: functionName,
  moodlewsrestformat: 'json'
});

for (const [key, value] of Object.entries(parameters)) {
  if (value !== undefined && value !== null) {
    body.set(key, String(value));
  }
}

const response = await fetch(endpoint, {
  method: 'POST',
  body
});

console.log(`HTTP ${response.status}`);
console.log(await response.text());
