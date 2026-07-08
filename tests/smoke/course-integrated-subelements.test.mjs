import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import test from 'node:test';
import { loadContract, toRestFunctionName } from '../helpers/contract.mjs';
import { requireEnv } from '../helpers/env.mjs';
import { callRestFunction } from '../helpers/moodle-rest.mjs';

const hasConfig = requireEnv(['MOODLE_BASE_URL', 'MOODLE_REST_TOKEN']);

async function call(contract, operationName, parameters = {}) {
  return callRestFunction(toRestFunctionName(contract, operationName), parameters);
}

async function cleanup(operation) {
  try {
    await operation();
  } catch {
    // Best-effort cleanup keeps the original smoke failure visible.
  }
}

function assertEntryContains(entry, text) {
  assert.match(entry.contents_json, new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
}

test('integrated course subelements, completion, gradebook, files, and backup close end-to-end', {
  skip: !hasConfig,
  timeout: 300000
}, async () => {
  const contract = await loadContract();
  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  let categoryId = null;
  let courseId = null;
  let backupFileId = null;
  let success = false;

  try {
    const category = await call(contract, 'create_course_category', {
      name: `MoodlIA Integrated Category ${suffix}`,
      visible: 0
    });
    categoryId = category.category_id;

    const course = await call(contract, 'create_course', {
      fullname: `MoodlIA Integrated Course ${suffix}`,
      shortname: `moodlia-integrated-${suffix}`,
      category_id: categoryId,
      visible: 0,
      enable_completion: 1,
      summary: `<p>Integrated subelement smoke ${suffix}</p>`,
      summary_format: 'html',
      course_format: 'topics'
    });
    courseId = course.course_id;

    const section = await call(contract, 'create_section', {
      course_id: courseId,
      name: `Integrated Section ${suffix}`,
      summary: 'Integrated generated content.'
    });

    const folder = await call(contract, 'create_module', {
      course_id: courseId,
      section_number: section.section_number,
      module_type: 'folder',
      name: `Integrated Folder ${suffix}`,
      options: JSON.stringify({
        intro: `<p>Folder for integrated smoke ${suffix}</p>`,
        completion_tracking: 'manual'
      })
    });
    const uploaded = await call(contract, 'upload_folder_file', {
      course_id: courseId,
      module_id: folder.course_module_id,
      filename: `integrated-${suffix}.txt`,
      upload_reference: Buffer.from(`Integrated file ${suffix}`, 'utf8').toString('base64')
    });
    assert.ok(uploaded.file_id > 0);
    const folderFiles = await call(contract, 'get_folder_files', {
      course_id: courseId,
      module_id: folder.course_module_id
    });
    assert.ok(folderFiles.files.some((file) => file.file_id === uploaded.file_id));

    const completionSet = await call(contract, 'set_activity_completion_status', {
      module_id: folder.course_module_id,
      completed: 1
    });
    assert.equal(completionSet.completed, true);
    const completion = await call(contract, 'get_activity_completion_statuses', {
      course_id: courseId
    });
    assert.equal(Array.isArray(completion.statuses), true);

    const database = await call(contract, 'create_module', {
      course_id: courseId,
      section_number: section.section_number,
      module_type: 'data',
      name: `Integrated Database ${suffix}`,
      options: JSON.stringify({
        intro: `<p>Database for integrated smoke ${suffix}</p>`,
        approval_required: false,
        manage_approved: false,
        edit_any: true
      })
    });
    const titleField = await call(contract, 'create_data_field', {
      course_id: courseId,
      module_id: database.course_module_id,
      field_type: 'text',
      name: `Integrated Title ${suffix}`,
      required: 1
    });
    const urlField = await call(contract, 'create_data_field', {
      course_id: courseId,
      module_id: database.course_module_id,
      field_type: 'url',
      name: `Integrated URL ${suffix}`,
      options: JSON.stringify({ auto_link: true })
    });
    const entryUrl = `https://example.com/integrated-${suffix}`;
    const entry = await call(contract, 'create_data_entry', {
      course_id: courseId,
      module_id: database.course_module_id,
      values: JSON.stringify({
        [titleField.name]: `Integrated entry ${suffix}`,
        [`${urlField.name}.url`]: entryUrl,
        [`${urlField.name}.text`]: 'Integrated link'
      })
    });
    assertEntryContains(entry, entryUrl);

    const feedback = await call(contract, 'create_module', {
      course_id: courseId,
      section_number: section.section_number,
      module_type: 'feedback',
      name: `Integrated Feedback ${suffix}`,
      options: JSON.stringify({
        intro: `<p>Feedback for integrated smoke ${suffix}</p>`,
        anonymous: 'anonymous'
      })
    });
    const feedbackQuestion = await call(contract, 'create_feedback_item', {
      course_id: courseId,
      module_id: feedback.course_module_id,
      type: 'textfield',
      name: `Integrated Goal ${suffix}`,
      definition: JSON.stringify({ size: 40, max_length: 120 })
    });
    const captcha = await call(contract, 'create_feedback_item', {
      course_id: courseId,
      module_id: feedback.course_module_id,
      type: 'captcha',
      definition: JSON.stringify({})
    });
    const feedbackItems = await call(contract, 'get_feedback_items', {
      course_id: courseId,
      module_id: feedback.course_module_id
    });
    assert.ok(feedbackItems.items.some((item) => item.item_id === feedbackQuestion.item_id));
    assert.equal(feedbackItems.items.filter((item) => item.type === 'captcha' && item.item_id === captcha.item_id).length, 1);

    const lesson = await call(contract, 'create_module', {
      course_id: courseId,
      section_number: section.section_number,
      module_type: 'lesson',
      name: `Integrated Lesson ${suffix}`,
      options: JSON.stringify({
        intro: `<p>Lesson for integrated smoke ${suffix}</p>`,
        max_answers: 4,
        grade: 100,
        custom_scoring: false,
        completion_tracking: 'manual'
      })
    });
    const shortAnswer = await call(contract, 'create_lesson_page', {
      course_id: courseId,
      module_id: lesson.course_module_id,
      page_type: 'shortanswer',
      title: `Integrated Shortanswer ${suffix}`,
      content: `<p>Type MoodlIA for ${suffix}</p>`,
      answers: JSON.stringify({
        answers: [
          { answer: 'MoodlIA', response: 'Correct', jump_to: 'next_page', score: 1 }
        ]
      })
    });
    assert.equal(shortAnswer.page.question_type, 1);
    const numerical = await call(contract, 'create_lesson_page', {
      course_id: courseId,
      module_id: lesson.course_module_id,
      page_type: 'numerical',
      title: `Integrated Numerical ${suffix}`,
      content: `<p>Enter a number between 8 and 10.</p>`,
      answers: JSON.stringify({
        answers: [
          { answer: '8:10', response: 'Correct range', jump_to: 'end_of_lesson', score: 1 }
        ]
      })
    });
    assert.equal(numerical.page.question_type, 8);
    const lessonPages = await call(contract, 'get_lesson_pages', {
      course_id: courseId,
      module_id: lesson.course_module_id
    });
    assert.ok(lessonPages.pages.some((page) => page.page_id === shortAnswer.page.page_id));
    assert.ok(lessonPages.pages.some((page) => page.page_id === numerical.page.page_id));

    const gradeItem = await call(contract, 'create_grade_item', {
      course_id: courseId,
      name: `Integrated Manual Grade ${suffix}`,
      grade_max: 10,
      grade_min: 0,
      grade_pass: 5
    });
    assert.equal(gradeItem.item_type, 'manual');
    const gradeItems = await call(contract, 'get_grade_items', {
      course_id: courseId
    });
    assert.ok(gradeItems.items.some((item) => item.item_id === gradeItem.item_id));

    const audit = await call(contract, 'audit_course_completion', {
      course_id: courseId,
      include_ok: 1
    });
    assert.equal(audit.course_id, courseId);
    assert.equal(Array.isArray(JSON.parse(audit.issues_json)), true);
    assert.equal(Array.isArray(JSON.parse(audit.ok_json)), true);

    const backup = await call(contract, 'backup_course', {
      course_id: courseId,
      filename: `integrated-${suffix}.mbz`,
      include_users: 0,
      include_activities: 1,
      include_blocks: 1,
      include_filters: 1
    });
    backupFileId = backup.file_id;
    assert.ok(backup.filesize > 0);
    assert.match(backup.filename, /\.mbz$/);

    const contents = await call(contract, 'get_course_contents', {
      course_id: courseId
    });
    const moduleTypes = new Set(contents.sections.flatMap((courseSection) =>
      courseSection.modules.map((module) => module.module_type)
    ));
    for (const moduleType of ['folder', 'data', 'feedback', 'lesson']) {
      assert.ok(moduleTypes.has(moduleType), `course must contain ${moduleType}`);
    }

    success = true;
  } finally {
    if (backupFileId !== null) {
      await cleanup(() => call(contract, 'delete_course_backup_file', {
        file_id: backupFileId
      }));
    }
    if (courseId !== null) {
      if (success) {
        await cleanup(() => call(contract, 'delete_course', {
          course_id: courseId
        }));
      } else {
        console.error(`Integrated subelements course left in Moodle for inspection: ${courseId}`);
      }
    }
    if (categoryId !== null) {
      if (success) {
        await cleanup(() => call(contract, 'delete_course_category', {
          category_id: categoryId
        }));
      } else {
        console.error(`Integrated subelements category left in Moodle for inspection: ${categoryId}`);
      }
    }
  }
});
