import path from 'node:path';
import { getEnv, loadEnvFile } from '../tests/helpers/env.mjs';

loadEnvFile();

const deployMode = resolveDeployMode();
const required = [
  'LOCAL_PLUGIN_SOURCE',
  'SFTP_HOST',
  'SFTP_PORT',
  'SFTP_USER',
  'SFTP_KEY_PATH',
  'SFTP_REMOTE_UPLOAD_PATH'
];

if (deployMode === 'docker') {
  required.push(
    'MOODLE_DOCKER_CONTAINER',
    'MOODLE_CONTAINER_CLI_ROOT',
    'MOODLE_CONTAINER_PLUGIN_PATH'
  );
} else if (deployMode === 'direct') {
  required.push(
    'MOODLE_SERVER_ROOT',
    'MOODLE_SERVER_PLUGIN_PATH'
  );
} else {
  console.error('DEPLOY_MODE must be direct or docker.');
  process.exit(1);
}

const missing = required.filter((name) => !getEnv(name));
if (missing.length > 0) {
  console.error(`Missing required variables for ${deployMode} deployment: ${missing.join(', ')}`);
  process.exit(1);
}

const sshTarget = `${getEnv('SFTP_USER')}@${getEnv('SFTP_HOST')}`;
const sshBase = `ssh -p ${getEnv('SFTP_PORT')} -i "${getEnv('SFTP_KEY_PATH')}" ${sshTarget}`;
const uploadPath = normalizeRemotePath(getEnv('SFTP_REMOTE_UPLOAD_PATH'));
const localSource = getEnv('LOCAL_PLUGIN_SOURCE');
const localPackage = getEnv('LOCAL_PLUGIN_PACKAGE_PATH') || localSource;
const pluginName = path.posix.basename(deployMode === 'docker'
  ? getEnv('MOODLE_CONTAINER_PLUGIN_PATH')
  : getEnv('MOODLE_SERVER_PLUGIN_PATH'));

if (pluginName !== 'moodlia') {
  console.error('The Moodle plugin folder must be named moodlia.');
  process.exit(1);
}

console.log([
  `Deploy mode: ${deployMode}`,
  `Plugin folder name: ${pluginName}`,
  `Local plugin source: ${localSource}`,
  `Local packaged folder: ${localPackage}`,
  `Upload target: ${uploadPath}`,
  '',
  'SFTP target:',
  `sftp -P ${getEnv('SFTP_PORT')} -i "${getEnv('SFTP_KEY_PATH')}" ${sshTarget}`,
  `put -r "${localPackage}" ${uploadPath}`,
  '',
  'SSH target:',
  sshBase,
  '',
  ...modeSpecificOutput()
].join('\n'));

function modeSpecificOutput() {
  if (deployMode === 'docker') {
    const dockerContainer = getEnv('MOODLE_DOCKER_CONTAINER');
    const moodleCliRoot = getEnv('MOODLE_CONTAINER_CLI_ROOT');
    const pluginPath = normalizeRemotePath(getEnv('MOODLE_CONTAINER_PLUGIN_PATH'));

    return [
      `Container plugin path: ${pluginPath}`,
      '',
      'Run on the server after uploading the plugin folder:',
      `sudo docker exec -u 0 ${dockerContainer} rm -rf ${pluginPath}`,
      `sudo docker cp ${uploadPath} ${dockerContainer}:${pluginPath}`,
      `sudo docker exec -w ${moodleCliRoot} ${dockerContainer} php admin/cli/upgrade.php --non-interactive`,
      `sudo docker exec -w ${moodleCliRoot} ${dockerContainer} php admin/cli/purge_caches.php`,
      '',
      'One-line server command:',
      `sudo docker exec -u 0 ${dockerContainer} rm -rf ${pluginPath} && sudo docker cp ${uploadPath} ${dockerContainer}:${pluginPath} && sudo docker exec -w ${moodleCliRoot} ${dockerContainer} php admin/cli/upgrade.php --non-interactive && sudo docker exec -w ${moodleCliRoot} ${dockerContainer} php admin/cli/purge_caches.php`
    ];
  }

  const moodleRoot = normalizeRemotePath(getEnv('MOODLE_SERVER_ROOT'));
  const pluginPath = normalizeRemotePath(getEnv('MOODLE_SERVER_PLUGIN_PATH'));
  const phpBin = getEnv('MOODLE_SERVER_PHP') || 'php';

  return [
    `Moodle root: ${moodleRoot}`,
    `Server plugin path: ${pluginPath}`,
    '',
    'Run on the server after uploading the plugin folder:',
    `rm -rf ${pluginPath}`,
    `mkdir -p ${path.posix.dirname(pluginPath)}`,
    `cp -a ${uploadPath} ${pluginPath}`,
    `cd ${moodleRoot} && ${phpBin} admin/cli/upgrade.php --non-interactive`,
    `cd ${moodleRoot} && ${phpBin} admin/cli/purge_caches.php`,
    '',
    'One-line server command:',
    `rm -rf ${pluginPath} && mkdir -p ${path.posix.dirname(pluginPath)} && cp -a ${uploadPath} ${pluginPath} && cd ${moodleRoot} && ${phpBin} admin/cli/upgrade.php --non-interactive && ${phpBin} admin/cli/purge_caches.php`
  ];
}

function normalizeRemotePath(value) {
  return value.replace(/\\/g, '/').replace(/\/+$/, '');
}

function resolveDeployMode() {
  const configured = getEnv('DEPLOY_MODE');
  if (configured) {
    return configured.toLowerCase();
  }

  if (getEnv('MOODLE_SERVER_ROOT') && getEnv('MOODLE_SERVER_PLUGIN_PATH')) {
    return 'direct';
  }

  if (getEnv('MOODLE_DOCKER_CONTAINER') && getEnv('MOODLE_CONTAINER_PLUGIN_PATH')) {
    return 'docker';
  }

  return 'direct';
}
