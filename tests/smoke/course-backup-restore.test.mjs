import assert from 'node:assert/strict';
import test from 'node:test';
import { loadContract, toRestFunctionName } from '../helpers/contract.mjs';
import { requireEnv } from '../helpers/env.mjs';
import { callRestFunction } from '../helpers/moodle-rest.mjs';

const hasRestConfig = requireEnv(['MOODLE_BASE_URL', 'MOODLE_REST_TOKEN']);

function restName(contract, operationName) {
  return toRestFunctionName(contract, operationName);
}

async function call(contract, operationName, parameters = {}) {
  return callRestFunction(restName(contract, operationName), parameters);
}

test('REST native Moodle course backup and restore creates a new course from an .mbz file', {
  skip: !hasRestConfig,
  timeout: 120000
}, async () => {
  const contract = await loadContract();
  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  let categoryId = null;
  let sourceCourseId = null;
  let restoredCourseId = null;
  let success = false;

  try {
    const category = await call(contract, 'create_course_category', {
      name: `MoodlIA Backup Restore Category ${suffix}`,
      visible: 1
    });
    categoryId = Number(category.category_id);

    const sourceCourse = await call(contract, 'create_course', {
      fullname: `MoodlIA Backup Source ${suffix}`,
      shortname: `mia-backup-source-${suffix}`,
      category_id: categoryId,
      visible: 1,
      summary: `<p>Native backup source ${suffix}</p>`,
      summary_format: 'html'
    });
    sourceCourseId = Number(sourceCourse.course_id);

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

    const backup = await call(contract, 'backup_course', {
      course_id: sourceCourseId,
      filename: `moodlia-backup-${suffix}.mbz`,
      include_users: 0,
      include_activities: 1,
      include_blocks: 1,
      include_filters: 1
    });
    assert.equal(backup.course_id, sourceCourseId);
    assert.ok(Number(backup.file_id) > 0, 'backup must return a stored backup file id.');
    assert.match(backup.filename, /\.mbz$/);
    assert.ok(Number(backup.filesize) > 0, 'backup file must not be empty.');

    const restored = await call(contract, 'restore_course_backup', {
      backup_file_id: backup.file_id,
      target: 'new_course',
      category_id: categoryId,
      fullname: `MoodlIA Backup Restored ${suffix}`,
      shortname: `mia-backup-restored-${suffix}`
    });
    restoredCourseId = Number(restored.course_id);
    assert.equal(restored.restored, true);
    assert.equal(restored.target, 'new_course');
    assert.equal(restored.category_id, categoryId);

    const contents = await call(contract, 'get_course_contents', {
      course_id: restoredCourseId
    });
    const restoredModules = contents.sections.flatMap((courseSection) => courseSection.modules);
    assert.ok(
      restoredModules.some((module) => module.module_type === 'page' && module.name.includes('Backup Page')),
      'restored course must include the source page activity.'
    );

    success = true;
  } finally {
    if (success && restoredCourseId) {
      const deletedRestored = await call(contract, 'delete_course', {
        course_id: restoredCourseId
      });
      assert.equal(deletedRestored.deleted, true);
      restoredCourseId = null;
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
    if (!success && restoredCourseId) {
      console.error(`Restored backup course left in Moodle for inspection: ${restoredCourseId}`);
    }
    if (!success && sourceCourseId) {
      console.error(`Source backup course left in Moodle for inspection: ${sourceCourseId}`);
    }
    if (!success && categoryId) {
      console.error(`Backup restore category left in Moodle for inspection: ${categoryId}`);
    }
  }
});
