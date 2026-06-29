import path from 'node:path';
import { getEnv, loadEnvFile } from '../tests/helpers/env.mjs';

loadEnvFile();

const required = [
  'LOCAL_PLUGIN_SOURCE',
  'SFTP_HOST',
  'SFTP_PORT',
  'SFTP_USER',
  'SFTP_KEY_PATH',
  'SFTP_REMOTE_UPLOAD_PATH',
  'MOODLE_DOCKER_CONTAINER',
  'MOODLE_CONTAINER_CLI_ROOT',
  'MOODLE_CONTAINER_ROOT',
  'MOODLE_CONTAINER_PLUGIN_PATH'
];

const missing = required.filter((name) => !getEnv(name));
if (missing.length > 0) {
  console.error(`Missing required variables: ${missing.join(', ')}`);
  process.exit(1);
}

const pluginName = path.posix.basename(getEnv('MOODLE_CONTAINER_PLUGIN_PATH'));
const expectedSuffix = `/local/${pluginName}`;

if (!getEnv('MOODLE_CONTAINER_ROOT').endsWith('/public')) {
  console.error('MOODLE_CONTAINER_ROOT must end with /public.');
  process.exit(1);
}

if (!getEnv('MOODLE_CONTAINER_PLUGIN_PATH').endsWith(expectedSuffix)) {
  console.error(`MOODLE_CONTAINER_PLUGIN_PATH must end with ${expectedSuffix}.`);
  process.exit(1);
}

const sshTarget = `${getEnv('SFTP_USER')}@${getEnv('SFTP_HOST')}`;
const sshBase = `ssh -p ${getEnv('SFTP_PORT')} -i "${getEnv('SFTP_KEY_PATH')}" ${sshTarget}`;
const dockerContainer = getEnv('MOODLE_DOCKER_CONTAINER');
const moodleCliRoot = getEnv('MOODLE_CONTAINER_CLI_ROOT');
const moodleRoot = getEnv('MOODLE_CONTAINER_ROOT');
const uploadPath = getEnv('SFTP_REMOTE_UPLOAD_PATH');
const pluginPath = getEnv('MOODLE_CONTAINER_PLUGIN_PATH');
const localSource = getEnv('LOCAL_PLUGIN_SOURCE');
const localPackage = getEnv('LOCAL_PLUGIN_PACKAGE_PATH') || localSource;

console.log([
  `Plugin folder name: ${pluginName}`,
  `Local plugin source: ${localSource}`,
  `Local packaged folder: ${localPackage}`,
  `Upload target: ${uploadPath}`,
  `Container plugin path: ${pluginPath}`,
  '',
  'SFTP target:',
  `sftp -P ${getEnv('SFTP_PORT')} -i "${getEnv('SFTP_KEY_PATH')}" ${sshTarget}`,
  `put -r "${localPackage}" ${uploadPath}`,
  '',
  'SSH target:',
  sshBase,
  '',
  'Run on the server after uploading the plugin folder:',
  `sudo docker cp ${uploadPath} ${dockerContainer}:${pluginPath}`,
  `sudo docker exec -w ${moodleCliRoot} ${dockerContainer} php admin/cli/upgrade.php --non-interactive`,
  `sudo docker exec -w ${moodleCliRoot} ${dockerContainer} php admin/cli/purge_caches.php`,
  '',
  'One-line server command:',
  `sudo docker cp ${uploadPath} ${dockerContainer}:${pluginPath} && sudo docker exec -w ${moodleCliRoot} ${dockerContainer} php admin/cli/upgrade.php --non-interactive && sudo docker exec -w ${moodleCliRoot} ${dockerContainer} php admin/cli/purge_caches.php`
].join('\n'));
