import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import test from 'node:test';
import { createMoodleClient } from '../../client/moodle-rest-client.mjs';
import { loadContract } from '../helpers/contract.mjs';
import { getEnv, getTimeout, requireEnv, resolveCliCommand } from '../helpers/env.mjs';
import { callMcp } from '../helpers/mcp.mjs';
import { fromRoot } from '../helpers/paths.mjs';

const execFileAsync = promisify(execFile);
const hasConfig = requireEnv(['MOODLE_BASE_URL', 'MOODLE_REST_TOKEN']);

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

function assertGrade(payload, expectedGrade, marker) {
  assert.equal(payload.graded, true);
  assert.ok(Math.abs(payload.grade - expectedGrade) < 0.0001, `Expected grade ${expectedGrade}, got ${payload.grade}`);
  assert.match(payload.feedback_comment, new RegExp(marker));
}

test('Assignment rubric, checklist, and marking guide workflows work through REST, MCP, and CLI', { skip: !hasConfig }, async () => {
  const contract = await loadContract();
  const restClient = createMoodleClient({
    baseUrl: getEnv('MOODLE_BASE_URL'),
    token: getEnv('MOODLE_REST_TOKEN'),
    contract,
    timeoutMs: getTimeout()
  });
  const callRest = (operation, parameters = {}) => restClient.call(operation, parameters);
  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  let category = null;
  let course = null;
  let sectionNumber = 1;
  let success = false;

  async function createAssignment(label) {
    const assignment = await callRest('create_module', {
      course_id: course.course_id,
      section_number: sectionNumber,
      module_type: 'assign',
      name: `MoodlIA Advanced ${label} ${suffix}`,
      options: JSON.stringify({
        activity: `<p>Advanced grading ${label} smoke.</p>`,
        online_text: true,
        file_submissions: false,
        submission_drafts: true,
        require_submission_statement: false,
        grade: 100,
        feedback_comments: true
      })
    });

    await callRest('save_assignment_submission', {
      course_id: course.course_id,
      module_id: assignment.course_module_id,
      online_text: `<p>MoodlIA advanced grading ${label} submission ${suffix}</p>`
    });
    await callRest('submit_assignment_for_grading', {
      course_id: course.course_id,
      module_id: assignment.course_module_id
    });

    return assignment;
  }

  try {
    const currentUser = await callRest('get_current_user');
    category = await callRest('create_course_category', {
      name: `MoodlIA Advanced Grading Category ${suffix}`,
      visible: 1
    });
    course = await callRest('create_course', {
      fullname: `MoodlIA Advanced Grading Course ${suffix}`,
      shortname: `moodlia-advanced-grading-${suffix}`,
      category_id: category.category_id,
      visible: 0,
      course_format: 'topics'
    });
    const section = await callRest('create_section', {
      course_id: course.course_id,
      name: `MoodlIA Advanced Grading Section ${suffix}`
    });
    sectionNumber = section.section_number;
    await callRest('enrol_user', {
      course_id: course.course_id,
      user_id: currentUser.id,
      role_archetype: 'student'
    });

    const checklistAssignment = await createAssignment('Checklist');
    const checklist = await callRest('set_assignment_checklist', {
      course_id: course.course_id,
      module_id: checklistAssignment.course_module_id,
      name: `MoodlIA Checklist ${suffix}`,
      description: '<p>Binary checklist generated as a Moodle rubric.</p>',
      items: JSON.stringify({
        items: [
          { description: 'Includes a clear objective', score: 50 },
          { description: 'Includes assessment evidence', score: 50 }
        ]
      })
    });
    assert.equal(checklist.active_method, 'rubric');
    assert.equal(checklist.checklist_compatible, true);
    assert.equal(checklist.criteria.length, 2);

    const checklistGrade = await callCli([
      'grade-assignment-with-checklist',
      '--course-id', String(course.course_id),
      '--module-id', String(checklistAssignment.course_module_id),
      '--user-id', String(currentUser.id),
      '--items', JSON.stringify({
        items: [
          { criterion_id: checklist.criteria[0].criterion_id, checked: true, remark: 'Met.' },
          { criterion_id: checklist.criteria[1].criterion_id, checked: false, remark: 'Needs evidence.' }
        ]
      }),
      '--feedback-comment', `<p>Checklist feedback ${suffix}</p>`
    ]);
    assertGrade(checklistGrade, 50, 'Checklist feedback');

    const rubricAssignment = await createAssignment('Rubric');
    const rubric = await callMcpTool('set_assignment_rubric', {
      course_id: course.course_id,
      module_id: rubricAssignment.course_module_id,
      name: `MoodlIA Rubric ${suffix}`,
      description: '<p>Rubric generated through MCP.</p>',
      criteria: {
        criteria: [
          {
            description: 'Content quality',
            levels: [
              { definition: 'Missing', score: 0 },
              { definition: 'Adequate', score: 25 },
              { definition: 'Strong', score: 50 }
            ]
          },
          {
            description: 'Classroom applicability',
            levels: [
              { definition: 'Missing', score: 0 },
              { definition: 'Adequate', score: 25 },
              { definition: 'Strong', score: 50 }
            ]
          }
        ]
      }
    });
    assert.equal(rubric.active_method, 'rubric');
    assert.equal(rubric.criteria.length, 2);

    const rubricGrade = await callRest('grade_assignment_with_rubric', {
      course_id: course.course_id,
      module_id: rubricAssignment.course_module_id,
      user_id: currentUser.id,
      criteria: JSON.stringify({
        criteria: [
          {
            criterion_id: rubric.criteria[0].criterion_id,
            level_id: rubric.criteria[0].levels.at(-1).level_id,
            remark: 'Strong content.'
          },
          {
            criterion_id: rubric.criteria[1].criterion_id,
            level_id: rubric.criteria[1].levels.at(1).level_id,
            remark: 'Applicable with minor changes.'
          }
        ]
      }),
      feedback_comment: `<p>Rubric feedback ${suffix}</p>`
    });
    assertGrade(rubricGrade, 75, 'Rubric feedback');

    const guideAssignment = await createAssignment('Guide');
    const guide = await callCli([
      'set-assignment-marking-guide',
      '--course-id', String(course.course_id),
      '--module-id', String(guideAssignment.course_module_id),
      '--name', `MoodlIA Marking Guide ${suffix}`,
      '--description', '<p>Marking guide generated through CLI.</p>',
      '--criteria', JSON.stringify({
        criteria: [
          {
            shortname: 'Accuracy',
            description: 'Accuracy of the response',
            description_markers: 'Check factual correctness.',
            max_score: 40
          },
          {
            shortname: 'Usefulness',
            description: 'Usefulness for classroom practice',
            description_markers: 'Check whether a teacher can reuse it.',
            max_score: 60
          }
        ]
      }),
      '--comments', JSON.stringify({
        comments: [
          { description: 'Clear and actionable feedback.' }
        ]
      })
    ]);
    assert.equal(guide.active_method, 'guide');
    assert.equal(guide.criteria.length, 2);
    assert.equal(guide.comments.length, 1);

    const guideGrade = await callMcpTool('grade_assignment_with_marking_guide', {
      course_id: course.course_id,
      module_id: guideAssignment.course_module_id,
      user_id: currentUser.id,
      criteria: {
        criteria: [
          { criterion_id: guide.criteria[0].criterion_id, score: 30, remark: 'Mostly accurate.' },
          { criterion_id: guide.criteria[1].criterion_id, score: 60, remark: 'Very useful.' }
        ]
      },
      feedback_comment: `<p>Guide feedback ${suffix}</p>`
    });
    assertGrade(guideGrade, 90, 'Guide feedback');

    const finalGuideForm = await callRest('get_assignment_grading_form', {
      course_id: course.course_id,
      module_id: guideAssignment.course_module_id
    });
    assert.equal(finalGuideForm.active_method, 'guide');
    assert.equal(finalGuideForm.definition_id, guide.definition_id);

    success = true;
  } finally {
    if (success && course?.course_id) {
      await callRest('delete_course', { course_id: course.course_id });
    } else if (course?.course_id) {
      console.error(`Advanced grading course left in Moodle for inspection: ${course.course_id}`);
    }

    if (success && category?.category_id) {
      await callRest('delete_course_category', { category_id: category.category_id });
    } else if (category?.category_id) {
      console.error(`Advanced grading category left in Moodle for inspection: ${category.category_id}`);
    }
  }
});
