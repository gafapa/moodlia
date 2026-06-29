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

function activity(details) {
  return JSON.parse(details.extra_json).activity ?? {};
}

async function createModule(contract, courseId, sectionNumber, moduleType, name, options) {
  return call(contract, 'create_module', {
    course_id: courseId,
    section_number: sectionNumber,
    module_type: moduleType,
    name,
    options: JSON.stringify({
      completion_tracking: 'automatic',
      ...options
    })
  });
}

test('REST module custom completion rules are created and exposed through Moodle APIs', {
  skip: !hasRestConfig,
  timeout: 120000
}, async () => {
  const contract = await loadContract();
  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  let courseCategoryId = null;
  let courseId = null;
  let success = false;

  try {
    const category = await call(contract, 'create_course_category', {
      name: `MoodlIA Custom Completion Category ${suffix}`,
      visible: 1
    });
    courseCategoryId = Number(category.category_id);

    const course = await call(contract, 'create_course', {
      fullname: `MoodlIA Custom Completion ${suffix}`,
      shortname: `mia-custom-completion-${suffix}`,
      category_id: courseCategoryId,
      visible: 1,
      enable_completion: 1
    });
    courseId = Number(course.course_id);
    assert.equal(course.enable_completion, true);

    const section = await call(contract, 'create_section', {
      course_id: courseId,
      name: `MoodlIA Custom Completion Section ${suffix}`,
      summary: 'Custom completion rules smoke test section.'
    });

    const forum = await createModule(contract, courseId, section.section_number, 'forum', `MoodlIA Custom Completion Forum ${suffix}`, {
      intro: '<p>Forum custom completion rules.</p>',
      forum_type: 'general',
      completion_discussions: 1,
      completion_replies: 1,
      completion_posts: 2
    });
    assert.equal(forum.completion, 2);

    const glossary = await createModule(contract, courseId, section.section_number, 'glossary', `MoodlIA Custom Completion Glossary ${suffix}`, {
      intro: '<p>Glossary custom completion rules.</p>',
      display_format: 'dictionary',
      completion_entries: 1
    });
    assert.equal(glossary.completion, 2);

    const database = await createModule(contract, courseId, section.section_number, 'data', `MoodlIA Custom Completion Database ${suffix}`, {
      intro: '<p>Database custom completion rules.</p>',
      edit_any: true,
      completion_entries: 1
    });
    assert.equal(database.completion, 2);

    const feedback = await createModule(contract, courseId, section.section_number, 'feedback', `MoodlIA Custom Completion Feedback ${suffix}`, {
      intro: '<p>Feedback custom completion rules.</p>',
      page_after_submit: '<p>Thank you.</p>',
      completion_submit: true
    });
    assert.equal(feedback.completion, 2);

    const lesson = await createModule(contract, courseId, section.section_number, 'lesson', `MoodlIA Custom Completion Lesson ${suffix}`, {
      intro: '<p>Lesson custom completion rules.</p>',
      progress_bar: true,
      max_answers: 4,
      completion_end_reached: true,
      completion_time_spent_seconds: 30
    });
    assert.equal(lesson.completion, 2);

    const wiki = await createModule(contract, courseId, section.section_number, 'wiki', `MoodlIA Custom Completion Wiki ${suffix}`, {
      intro: '<p>Wiki custom completion rules.</p>',
      first_page_title: `MoodlIA Custom Completion Wiki Home ${suffix}`,
      wiki_mode: 'collaborative',
      default_format: 'html'
    });
    assert.equal(wiki.completion, 2);

    const courseForums = await call(contract, 'get_course_forums', { course_id: courseId });
    const createdForum = courseForums.forums.find((item) => Number(item.module_id) === Number(forum.course_module_id));
    assert.ok(createdForum, 'created forum must be returned by get_course_forums');
    assert.equal(createdForum.completion_discussions, 1);
    assert.equal(createdForum.completion_replies, 1);
    assert.equal(createdForum.completion_posts, 2);

    const courseGlossaries = await call(contract, 'get_course_glossaries', { course_id: courseId });
    const createdGlossary = courseGlossaries.glossaries.find((item) => Number(item.module_id) === Number(glossary.course_module_id));
    assert.ok(createdGlossary, 'created glossary must be returned by get_course_glossaries');
    assert.equal(createdGlossary.completion_entries, 1);

    const dataDetails = activity(await call(contract, 'get_module_details', {
      course_id: courseId,
      module_id: database.course_module_id
    }));
    assert.equal(dataDetails.completion_entries, 1);

    const feedbackDetails = activity(await call(contract, 'get_module_details', {
      course_id: courseId,
      module_id: feedback.course_module_id
    }));
    assert.equal(feedbackDetails.completion_submit, true);

    const lessonDetails = activity(await call(contract, 'get_module_details', {
      course_id: courseId,
      module_id: lesson.course_module_id
    }));
    assert.equal(lessonDetails.completion_end_reached, true);
    assert.equal(lessonDetails.completion_time_spent_seconds, 30);

    const statuses = await call(contract, 'get_activity_completion_statuses', {
      course_id: courseId
    });
    for (const module of [forum, glossary, database, feedback, lesson, wiki]) {
      assert.ok(
        statuses.statuses.some((status) =>
          Number(status.module_id) === Number(module.course_module_id) &&
          Number(status.tracking) === 2 &&
          status.has_completion === true
        ),
        `${module.module_type} must be visible in activity completion statuses`
      );
    }

    success = true;
  } finally {
    if (success && courseId) {
      const deletedCourse = await call(contract, 'delete_course', {
        course_id: courseId
      });
      assert.equal(deletedCourse.deleted, true);
      courseId = null;
    }
    if (success && courseCategoryId) {
      const deletedCategory = await call(contract, 'delete_course_category', {
        category_id: courseCategoryId
      });
      assert.equal(deletedCategory.deleted, true);
      courseCategoryId = null;
    }
    if (!success && courseId) {
      console.error(`Custom completion course left in Moodle for inspection: ${courseId}`);
    }
    if (!success && courseCategoryId) {
      console.error(`Custom completion category left in Moodle for inspection: ${courseCategoryId}`);
    }
  }
});
