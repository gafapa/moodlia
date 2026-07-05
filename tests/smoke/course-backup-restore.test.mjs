import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import test from 'node:test';
import { loadContract, toRestFunctionName } from '../helpers/contract.mjs';
import { getEnv, getTimeout, requireEnv, resolveCliCommand } from '../helpers/env.mjs';
import { callMcp } from '../helpers/mcp.mjs';
import { callRestFunction } from '../helpers/moodle-rest.mjs';
import { fromRoot } from '../helpers/paths.mjs';

const execFileAsync = promisify(execFile);
const hasRestConfig = requireEnv(['MOODLE_BASE_URL', 'MOODLE_REST_TOKEN']);

function restName(contract, operationName) {
  return toRestFunctionName(contract, operationName);
}

async function call(contract, operationName, parameters = {}) {
  return callRestFunction(restName(contract, operationName), parameters);
}

async function callMcpTool(name, toolArguments = {}) {
  return callMcp('tools/call', {
    name,
    arguments: toolArguments
  });
}

async function callCli(args) {
  const configured = resolveCliCommand();
  const localCli = fromRoot('cli/moodle-mcp.mjs');
  const commandPath = configured ?? localCli;
  const command = commandPath.endsWith('.mjs') || commandPath.endsWith('.js') ? process.execPath : commandPath;
  const commandArgs = command === process.execPath ? [commandPath, ...args, '--format', 'json'] : [...args, '--format', 'json'];
  const { stdout } = await execFileAsync(command, commandArgs, {
    timeout: getTimeout(),
    env: {
      ...process.env,
      MOODLE_BASE_URL: getEnv('MOODLE_BASE_URL'),
      MOODLE_REST_TOKEN: getEnv('MOODLE_REST_TOKEN')
    }
  });

  return JSON.parse(stdout.trim());
}

function parseJsonField(payload, field) {
  assert.equal(typeof payload[field], 'string', `${field} must be a JSON string.`);
  return JSON.parse(payload[field]);
}

function assertBackupFile(filesPayload, fileId, label) {
  const files = parseJsonField(filesPayload, 'files_json');
  assert.equal(filesPayload.count, files.length, `${label} count must match files_json.`);
  assert.ok(
    files.some((file) => Number(file.file_id) === Number(fileId) && String(file.filename).endsWith('.mbz')),
    `${label} must include backup file ${fileId}.`
  );
}

async function createSourceCourse(contract, suffix) {
  const category = await call(contract, 'create_course_category', {
    name: `MoodlIA Backup Restore Category ${suffix}`,
    visible: 1
  });
  const categoryId = Number(category.category_id);

  const sourceCourse = await call(contract, 'create_course', {
    fullname: `MoodlIA Backup Source ${suffix}`,
    shortname: `mia-backup-source-${suffix}`,
    category_id: categoryId,
    visible: 1,
    summary: `<p>Native backup source ${suffix}</p>`,
    summary_format: 'html'
  });
  const sourceCourseId = Number(sourceCourse.course_id);

  const section = await call(contract, 'create_section', {
    course_id: sourceCourseId,
    name: `Backup Section ${suffix}`,
    summary: 'Native backup smoke section.'
  });

  const page = await call(contract, 'create_module', {
    course_id: sourceCourseId,
    section_number: section.section_number,
    module_type: 'page',
    name: `Backup Page ${suffix}`,
    options: JSON.stringify({
      content: `<p>Native backup page ${suffix}</p>`
    })
  });
  assert.equal(page.module_type, 'page');

  return { categoryId, sourceCourseId };
}

async function assertRestoredPage(contract, restoredCourseId) {
  const contents = await call(contract, 'get_course_contents', {
    course_id: restoredCourseId
  });
  const restoredModules = contents.sections.flatMap((courseSection) => courseSection.modules);
  assert.ok(
    restoredModules.some((module) => module.module_type === 'page' && module.name.includes('Backup Page')),
    'restored course must include the source page activity.'
  );
}

test('native Moodle course backup files can be uploaded, listed, restored, and deleted through REST, MCP, and CLI', {
  skip: !hasRestConfig,
  timeout: 300000
}, async () => {
  const contract = await loadContract();
  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  let categoryId = null;
  let sourceCourseId = null;
  const restoredCourseIds = [];
  const backupFileIds = [];
  const uploadedFileIds = [];
  let success = false;

  try {
    ({ categoryId, sourceCourseId } = await createSourceCourse(contract, suffix));

    const backup = await call(contract, 'backup_course', {
      course_id: sourceCourseId,
      filename: `moodlia-rest-backup-${suffix}.mbz`,
      include_users: 0,
      include_activities: 1,
      include_blocks: 1,
      include_filters: 1
    });
    backupFileIds.push(Number(backup.file_id));
    assert.equal(backup.course_id, sourceCourseId);
    assert.ok(Number(backup.file_id) > 0, 'backup must return a stored backup file id.');
    assert.match(backup.filename, /\.mbz$/);
    assert.ok(Number(backup.filesize) > 0, 'backup file must not be empty.');

    const restFiles = await call(contract, 'get_course_backup_files', {
      course_id: sourceCourseId,
      include_private: 1
    });
    assertBackupFile(restFiles, backup.file_id, 'REST backup file list');

    const restored = await call(contract, 'restore_course_backup', {
      backup_file_id: backup.file_id,
      target: 'new_course',
      category_id: categoryId,
      fullname: `MoodlIA Backup Restored ${suffix}`,
      shortname: `mia-backup-restored-${suffix}`
    });
    restoredCourseIds.push(Number(restored.course_id));
    assert.equal(restored.restored, true);
    assert.equal(restored.target, 'new_course');
    assert.equal(restored.category_id, categoryId);
    await assertRestoredPage(contract, Number(restored.course_id));

    const uploaded = await call(contract, 'upload_course_backup', {
      filename: `moodlia-uploaded-${suffix}.mbz`,
      upload_reference: Buffer.from(`not a real Moodle backup ${suffix}`).toString('base64')
    });
    uploadedFileIds.push(Number(uploaded.file_id));
    assert.equal(uploaded.course_id, 0);
    assert.equal(uploaded.filename, `moodlia-uploaded-${suffix}.mbz`);
    const privateFiles = await call(contract, 'get_course_backup_files', {
      include_private: 1
    });
    assertBackupFile(privateFiles, uploaded.file_id, 'REST private backup file list');

    const mcpBackup = await callMcpTool('backup_course', {
      course_id: sourceCourseId,
      filename: `moodlia-mcp-backup-${suffix}.mbz`,
      include_users: false
    });
    backupFileIds.push(Number(mcpBackup.file_id));
    assert.equal(mcpBackup.course_id, sourceCourseId);
    assert.ok(Number(mcpBackup.filesize) > 0);
    const mcpFiles = await callMcpTool('get_course_backup_files', {
      course_id: sourceCourseId,
      include_private: true
    });
    assertBackupFile(mcpFiles, mcpBackup.file_id, 'MCP backup file list');
    const mcpRestored = await callMcpTool('restore_course_backup', {
      backup_file_id: mcpBackup.file_id,
      target: 'new_course',
      category_id: categoryId,
      fullname: `MoodlIA MCP Restored ${suffix}`,
      shortname: `mia-mcp-restored-${suffix}`
    });
    restoredCourseIds.push(Number(mcpRestored.course_id));
    assert.equal(mcpRestored.restored, true);
    await assertRestoredPage(contract, Number(mcpRestored.course_id));

    const cliBackup = await callCli([
      'backup-course',
      '--course-id',
      String(sourceCourseId),
      '--filename',
      `moodlia-cli-backup-${suffix}.mbz`,
      '--include-users',
      'false'
    ]);
    backupFileIds.push(Number(cliBackup.file_id));
    assert.equal(cliBackup.course_id, sourceCourseId);
    const cliFiles = await callCli([
      'get-course-backup-files',
      '--course-id',
      String(sourceCourseId),
      '--include-private',
      'true'
    ]);
    assertBackupFile(cliFiles, cliBackup.file_id, 'CLI backup file list');
    const cliRestored = await callCli([
      'restore-course-backup',
      '--backup-file-id',
      String(cliBackup.file_id),
      '--target',
      'new_course',
      '--category-id',
      String(categoryId),
      '--fullname',
      `MoodlIA CLI Restored ${suffix}`,
      '--shortname',
      `mia-cli-restored-${suffix}`
    ]);
    restoredCourseIds.push(Number(cliRestored.course_id));
    assert.equal(cliRestored.restored, true);
    await assertRestoredPage(contract, Number(cliRestored.course_id));

    for (const fileId of [...backupFileIds, ...uploadedFileIds]) {
      const deleted = await call(contract, 'delete_course_backup_file', {
        file_id: fileId
      });
      assert.equal(deleted.deleted, true);
    }
    backupFileIds.length = 0;
    uploadedFileIds.length = 0;

    success = true;
  } finally {
    for (const fileId of [...backupFileIds, ...uploadedFileIds]) {
      try {
        await call(contract, 'delete_course_backup_file', { file_id: fileId });
      } catch {
        // Best-effort cleanup: the course deletion may already have removed a course backup file.
      }
    }
    if (success) {
      for (const courseId of restoredCourseIds.reverse()) {
        const deletedRestored = await call(contract, 'delete_course', {
          course_id: courseId
        });
        assert.equal(deletedRestored.deleted, true);
      }
    }
    if (success && sourceCourseId) {
      const deletedSource = await call(contract, 'delete_course', {
        course_id: sourceCourseId
      });
      assert.equal(deletedSource.deleted, true);
      sourceCourseId = null;
    }
    if (success && categoryId) {
      const deletedCategory = await call(contract, 'delete_course_category', {
        category_id: categoryId
      });
      assert.equal(deletedCategory.deleted, true);
      categoryId = null;
    }
    if (!success && restoredCourseIds.length > 0) {
      console.error(`Restored backup courses left in Moodle for inspection: ${restoredCourseIds.join(', ')}`);
    }
    if (!success && sourceCourseId) {
      console.error(`Source backup course left in Moodle for inspection: ${sourceCourseId}`);
    }
    if (!success && categoryId) {
      console.error(`Backup restore category left in Moodle for inspection: ${categoryId}`);
    }
  }
});
