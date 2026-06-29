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

function moduleCases(suffix) {
  return [
    {
      type: 'page',
      name: `MoodlIA Completion Page ${suffix}`,
      options: {
        content: '<p>Completion matrix page content.</p>'
      }
    },
    {
      type: 'assign',
      name: `MoodlIA Completion Assignment ${suffix}`,
      options: {
        intro: '<p>Completion matrix assignment intro.</p>',
        online_text: true,
        file_submissions: false
      }
    },
    {
      type: 'book',
      name: `MoodlIA Completion Book ${suffix}`,
      options: {
        intro: '<p>Completion matrix book intro.</p>',
        numbering: 'numbers'
      }
    },
    {
      type: 'label',
      name: `MoodlIA Completion Label ${suffix}`,
      options: {
        content: '<p>Completion matrix label content.</p>'
      }
    },
    {
      type: 'url',
      name: `MoodlIA Completion URL ${suffix}`,
      options: {
        external_url: `https://example.com/moodlia-completion-${suffix}`,
        intro: '<p>Completion matrix URL intro.</p>'
      }
    },
    {
      type: 'forum',
      name: `MoodlIA Completion Forum ${suffix}`,
      options: {
        forum_type: 'general',
        intro: '<p>Completion matrix forum intro.</p>'
      }
    },
    {
      type: 'glossary',
      name: `MoodlIA Completion Glossary ${suffix}`,
      options: {
        intro: '<p>Completion matrix glossary intro.</p>',
        display_format: 'dictionary'
      }
    },
    {
      type: 'choice',
      name: `MoodlIA Completion Choice ${suffix}`,
      options: {
        intro: '<p>Completion matrix choice intro.</p>',
        choices: ['REST API', 'MCP tool', 'Node CLI']
      }
    },
    {
      type: 'data',
      name: `MoodlIA Completion Database ${suffix}`,
      options: {
        intro: '<p>Completion matrix database intro.</p>',
        edit_any: true
      }
    },
    {
      type: 'feedback',
      name: `MoodlIA Completion Feedback ${suffix}`,
      options: {
        intro: '<p>Completion matrix feedback intro.</p>',
        page_after_submit: '<p>Thank you.</p>'
      }
    },
    {
      type: 'folder',
      name: `MoodlIA Completion Folder ${suffix}`,
      options: {
        show_expanded: true
      }
    },
    {
      type: 'resource',
      name: `MoodlIA Completion Resource ${suffix}`,
      options: {
        intro: '<p>Completion matrix resource intro.</p>',
        filename: `moodlia-completion-${suffix}.txt`,
        upload_reference: Buffer.from(`MoodlIA completion matrix ${suffix}\n`, 'utf8').toString('base64'),
        display: 'embed',
        print_intro: true
      }
    },
    {
      type: 'quiz',
      name: `MoodlIA Completion Quiz ${suffix}`,
      options: {
        intro: '<p>Completion matrix quiz intro.</p>'
      }
    },
    {
      type: 'wiki',
      name: `MoodlIA Completion Wiki ${suffix}`,
      options: {
        intro: '<p>Completion matrix wiki intro.</p>',
        first_page_title: `MoodlIA Completion Wiki Home ${suffix}`,
        wiki_mode: 'collaborative',
        default_format: 'html'
      }
    },
    {
      type: 'lesson',
      name: `MoodlIA Completion Lesson ${suffix}`,
      options: {
        intro: '<p>Completion matrix lesson intro.</p>',
        progress_bar: true,
        max_answers: 4,
        grade: 100
      }
    },
    {
      type: 'lti',
      name: `MoodlIA Completion External Tool ${suffix}`,
      options: {
        intro: '<p>Completion matrix LTI intro.</p>',
        tool_url: `https://example.com/moodlia-lti-${suffix}`,
        launch_container: 'embed'
      }
    },
    {
      type: 'workshop',
      name: `MoodlIA Completion Workshop ${suffix}`,
      options: {
        intro: '<p>Completion matrix workshop intro.</p>',
        strategy: 'accumulative',
        submission_grade: 80,
        assessment_grade: 20,
        submission_instructions: '<p>Submit a short draft.</p>',
        assessment_instructions: '<p>Review the draft.</p>',
        text_submission: 'available',
        file_submission: 'disabled'
      }
    }
  ];
}

test('REST module completion matrix supports create, update, details, and status reads', {
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
      name: `MoodlIA Completion Matrix Category ${suffix}`,
      visible: 1
    });
    courseCategoryId = Number(category.category_id);

    const course = await call(contract, 'create_course', {
      fullname: `MoodlIA Completion Matrix ${suffix}`,
      shortname: `mia-completion-${suffix}`,
      category_id: courseCategoryId,
      visible: 1,
      enable_completion: 1
    });
    courseId = Number(course.course_id);
    assert.equal(course.enable_completion, true);

    const section = await call(contract, 'create_section', {
      course_id: courseId,
      name: `MoodlIA Completion Matrix Section ${suffix}`,
      summary: 'Completion matrix smoke test section.'
    });

    const results = [];
    for (const moduleCase of moduleCases(suffix)) {
      const created = await call(contract, 'create_module', {
        course_id: courseId,
        section_number: section.section_number,
        module_type: moduleCase.type,
        name: moduleCase.name,
        options: JSON.stringify({
          ...moduleCase.options,
          completion_tracking: 'manual'
        })
      });

      assert.equal(created.module_type, moduleCase.type);
      assert.equal(created.completion, 1, `${moduleCase.type} must be created with manual completion`);

      const updated = await call(contract, 'update_module', {
        course_id: courseId,
        module_id: created.course_module_id,
        options: JSON.stringify({
          completion_tracking: 'automatic',
          completion_view_required: true,
          reset_completion_states: true
        })
      });

      assert.equal(updated.completion, 2, `${moduleCase.type} must update to automatic completion`);
      assert.equal(updated.completion_view, 1, `${moduleCase.type} must require view completion`);

      const details = await call(contract, 'get_module_details', {
        course_id: courseId,
        module_id: created.course_module_id
      });

      assert.equal(details.completion, 2, `${moduleCase.type} details must expose automatic completion`);
      assert.equal(details.completion_view, 1, `${moduleCase.type} details must expose view completion`);

      results.push({
        module_id: created.course_module_id,
        module_type: moduleCase.type
      });
    }

    const statuses = await call(contract, 'get_activity_completion_statuses', {
      course_id: courseId
    });
    assert.ok(Array.isArray(statuses.statuses), 'completion status response must include statuses');

    for (const result of results) {
      assert.ok(
        statuses.statuses.some((status) =>
          Number(status.module_id) === Number(result.module_id) &&
          status.module_type === result.module_type &&
          Number(status.tracking) === 2 &&
          status.has_completion === true
        ),
        `${result.module_type} must be present in activity completion statuses`
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
      console.error(`Completion matrix course left in Moodle for inspection: ${courseId}`);
    }
    if (!success && courseCategoryId) {
      console.error(`Completion matrix category left in Moodle for inspection: ${courseCategoryId}`);
    }
  }
});
