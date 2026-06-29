import { getEnv, loadEnvFile } from '../tests/helpers/env.mjs';

loadEnvFile();

const names = [
  'MOODLE_BASE_URL',
  'MOODLE_USERNAME',
  'MOODLE_PASSWORD',
  'MOODLE_REST_SERVICE',
  'MOODLE_REST_TOKEN',
  'MOODLE_MCP_ENDPOINT',
  'MOODLE_TEST_COURSE_IDS',
  'MOODLE_TEST_SECTION_NUMBER',
  'MOODLE_CLI_BIN',
  'PLAYWRIGHT_BASE_URL',
  'TEST_TIMEOUT_MS',
  'DEPLOY_ENV',
  'SFTP_HOST',
  'SFTP_PORT',
  'SFTP_USER',
  'SFTP_AUTH_MODE',
  'SFTP_KEY_PATH',
  'LOCAL_PLUGIN_SOURCE',
  'LOCAL_PLUGIN_PACKAGE_PATH',
  'SFTP_REMOTE_UPLOAD_PATH',
  'MOODLE_DOCKER_CONTAINER',
  'MOODLE_CONTAINER_CLI_ROOT',
  'MOODLE_CONTAINER_ROOT',
  'MOODLE_CONTAINER_PLUGIN_PATH'
];

const redacted = new Set(['MOODLE_PASSWORD', 'MOODLE_REST_TOKEN']);
const config = Object.fromEntries(
  names.map((name) => {
    const value = getEnv(name);
    return [name, value && redacted.has(name) ? '<redacted>' : value ?? '<unset>'];
  })
);

console.log(JSON.stringify(config, null, 2));
