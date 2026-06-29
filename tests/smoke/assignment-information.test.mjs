import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import test from 'node:test';
import { loadContract, toRestFunctionName } from '../helpers/contract.mjs';
import { getEnv, getTimeout, requireEnv, resolveCliCommand } from '../helpers/env.mjs';
import { callMcp } from '../helpers/mcp.mjs';
import { callRestFunction } from '../helpers/moodle-rest.mjs';
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
  const commandArgs = command === process.execPath ? [commandPath, ...args] : args;
  const { stdout } = await execFileAsync(command, [...commandArgs, '--format', 'json'], {
    timeout: getTimeout(),
    env: {
      ...process.env,
      MOODLE_BASE_URL: getEnv('MOODLE_BASE_URL'),
      MOODLE_REST_TOKEN: getEnv('MOODLE_REST_TOKEN')
    }
  });

  return JSON.parse(stdout.trim());
}

function findSubmission(submissions, userId, marker) {
  return submissions.find((submission) =>
    submission.user_id === userId &&
    submission.online_text.includes(marker)
  );
}

function findGrade(grades, userId, expectedGrade) {
  return grades.find((grade) =>
    grade.user_id === userId &&
    Math.abs(grade.grade - expectedGrade) < 0.0001
  );
}

function assertCourseAssignments(payload, courseId, assignment) {
  assert.equal(payload.course_id, courseId);
  assert.equal(payload.count, payload.assignments.length);
  const listed = payload.assignments.find((item) =>
    item.assignment_id === assignment.instance_id &&
    item.module_id === assignment.course_module_id
  );
  assert.ok(listed, 'Created assignment must be returned by course assignment listing.');
  assert.equal(listed.course_id, courseId);
  assert.match(listed.name, /MoodlIA Assignment Info/);
  assert.equal(listed.grade, 100);
  assert.equal(typeof listed.intro, 'string');
  assert.equal(typeof listed.activity, 'string');
  assert.equal(typeof listed.visible, 'boolean');
  assert.ok(Array.isArray(listed.submission_plugins));
  assert.ok(Array.isArray(listed.feedback_plugins));
  assert.match(listed.url, /\/mod\/assign\/view\.php\?id=/);
}

test('Assignment submission and grade information works through REST, MCP, and CLI', { skip: !hasConfig }, async () => {
  const contract = await loadContract();
  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const submissionText = `MoodlIA assignment information submission ${suffix}`;
  const feedbackText = `MoodlIA assignment information feedback ${suffix}`;
  const gradeValue = 91.25;
  let categoryId = null;
  let courseId = null;

  try {
    const currentUser = await callRestFunction(toRestFunctionName(contract, 'get_current_user'));

    const category = await callRestFunction(toRestFunctionName(contract, 'create_course_category'), {
      name: `MoodlIA Assignment Info Category ${suffix}`,
      visible: 1
    });
    categoryId = category.category_id;

    const course = await callRestFunction(toRestFunctionName(contract, 'create_course'), {
      fullname: `MoodlIA Assignment Info Course ${suffix}`,
      shortname: `moodlia-assignment-info-${suffix}`,
      category_id: categoryId,
      visible: 0,
      summary: `<p>MoodlIA assignment information smoke course ${suffix}</p>`,
      summary_format: 'html',
      course_format: 'topics'
    });
    courseId = course.course_id;

    const section = await callRestFunction(toRestFunctionName(contract, 'create_section'), {
      course_id: courseId,
      name: `MoodlIA Assignment Info Section ${suffix}`
    });

    const assignment = await callRestFunction(toRestFunctionName(contract, 'create_module'), {
      course_id: courseId,
      section_number: section.section_number,
      module_type: 'assign',
      name: `MoodlIA Assignment Info ${suffix}`,
      options: JSON.stringify({
        activity: '<p>Assignment information smoke.</p>',
        online_text: true,
        file_submissions: false,
        submission_drafts: true,
        require_submission_statement: false,
        grade: 100,
        feedback_comments: true
      })
    });

    const restCourseAssignments = await callRestFunction(toRestFunctionName(contract, 'get_course_assignments'), {
      course_id: courseId
    });
    assertCourseAssignments(restCourseAssignments, courseId, assignment);

    const mcpCourseAssignments = await callMcpTool('get_course_assignments', {
      course_id: courseId
    });
    assertCourseAssignments(mcpCourseAssignments, courseId, assignment);

    const cliCourseAssignments = await callCli([
      'get-course-assignments',
      '--course-id', String(courseId)
    ]);
    assertCourseAssignments(cliCourseAssignments, courseId, assignment);

    const enrolment = await callRestFunction(toRestFunctionName(contract, 'enrol_user'), {
      course_id: courseId,
      user_id: currentUser.id,
      role_archetype: 'student'
    });
    assert.equal(enrolment.enrolled, true);

    const savedSubmission = await callRestFunction(toRestFunctionName(contract, 'save_assignment_submission'), {
      course_id: courseId,
      module_id: assignment.course_module_id,
      online_text: `<p>${submissionText}</p>`
    });
    assert.match(savedSubmission.online_text, new RegExp(submissionText));

    const submitted = await callRestFunction(toRestFunctionName(contract, 'submit_assignment_for_grading'), {
      course_id: courseId,
      module_id: assignment.course_module_id
    });
    assert.equal(submitted.submitted, true);

    const graded = await callRestFunction(toRestFunctionName(contract, 'save_assignment_grade'), {
      course_id: courseId,
      module_id: assignment.course_module_id,
      user_id: currentUser.id,
      grade: gradeValue,
      feedback_comment: `<p>${feedbackText}</p>`
    });
    assert.equal(graded.graded, true);
    assert.equal(graded.grade, gradeValue);

    const restSubmissions = await callRestFunction(toRestFunctionName(contract, 'get_assignment_submissions'), {
      course_id: courseId,
      module_id: assignment.course_module_id,
      status: 'submitted'
    });
    assert.equal(restSubmissions.assignment_id, assignment.instance_id);
    assert.ok(findSubmission(restSubmissions.submissions, currentUser.id, submissionText));

    const mcpSubmissions = await callMcpTool('get_assignment_submissions', {
      course_id: courseId,
      module_id: assignment.course_module_id,
      status: 'submitted'
    });
    assert.ok(findSubmission(mcpSubmissions.submissions, currentUser.id, submissionText));

    const cliSubmissions = await callCli([
      'get-assignment-submissions',
      '--course-id', String(courseId),
      '--module-id', String(assignment.course_module_id),
      '--status', 'submitted'
    ]);
    assert.ok(findSubmission(cliSubmissions.submissions, currentUser.id, submissionText));

    const restGrades = await callRestFunction(toRestFunctionName(contract, 'get_assignment_grades'), {
      course_id: courseId,
      module_id: assignment.course_module_id
    });
    assert.equal(restGrades.assignment_id, assignment.instance_id);
    assert.ok(findGrade(restGrades.grades, currentUser.id, gradeValue));

    const mcpGrades = await callMcpTool('get_assignment_grades', {
      course_id: courseId,
      module_id: assignment.course_module_id
    });
    assert.ok(findGrade(mcpGrades.grades, currentUser.id, gradeValue));

    const cliGrades = await callCli([
      'get-assignment-grades',
      '--course-id', String(courseId),
      '--module-id', String(assignment.course_module_id)
    ]);
    assert.ok(findGrade(cliGrades.grades, currentUser.id, gradeValue));

    const restView = await callRestFunction(toRestFunctionName(contract, 'view_assignment'), {
      course_id: courseId,
      module_id: assignment.course_module_id
    });
    assert.equal(restView.view, 'assignment');
    assert.equal(restView.viewed, true);

    const mcpView = await callMcpTool('view_assignment', {
      course_id: courseId,
      module_id: assignment.course_module_id
    });
    assert.equal(mcpView.view, 'assignment');
    assert.equal(mcpView.viewed, true);

    const cliView = await callCli([
      'view-assignment',
      '--course-id', String(courseId),
      '--module-id', String(assignment.course_module_id)
    ]);
    assert.equal(cliView.view, 'assignment');
    assert.equal(cliView.viewed, true);

    const restStatusView = await callRestFunction(toRestFunctionName(contract, 'view_assignment_submission_status'), {
      course_id: courseId,
      module_id: assignment.course_module_id
    });
    assert.equal(restStatusView.view, 'submission_status');
    assert.equal(restStatusView.viewed, true);

    const mcpStatusView = await callMcpTool('view_assignment_submission_status', {
      course_id: courseId,
      module_id: assignment.course_module_id
    });
    assert.equal(mcpStatusView.view, 'submission_status');
    assert.equal(mcpStatusView.viewed, true);

    const cliStatusView = await callCli([
      'view-assignment-submission-status',
      '--course-id', String(courseId),
      '--module-id', String(assignment.course_module_id)
    ]);
    assert.equal(cliStatusView.view, 'submission_status');
    assert.equal(cliStatusView.viewed, true);

    const restGradingView = await callRestFunction(toRestFunctionName(contract, 'view_assignment_grading_table'), {
      course_id: courseId,
      module_id: assignment.course_module_id
    });
    assert.equal(restGradingView.view, 'grading_table');
    assert.equal(restGradingView.viewed, true);

    const mcpGradingView = await callMcpTool('view_assignment_grading_table', {
      course_id: courseId,
      module_id: assignment.course_module_id
    });
    assert.equal(mcpGradingView.view, 'grading_table');
    assert.equal(mcpGradingView.viewed, true);

    const cliGradingView = await callCli([
      'view-assignment-grading-table',
      '--course-id', String(courseId),
      '--module-id', String(assignment.course_module_id)
    ]);
    assert.equal(cliGradingView.view, 'grading_table');
    assert.equal(cliGradingView.viewed, true);

    const deletedCourse = await callRestFunction(toRestFunctionName(contract, 'delete_course'), {
      course_id: courseId
    });
    assert.equal(deletedCourse.deleted, true);
    courseId = null;

    const deletedCategory = await callRestFunction(toRestFunctionName(contract, 'delete_course_category'), {
      category_id: categoryId
    });
    assert.equal(deletedCategory.deleted, true);
    categoryId = null;
  } finally {
    if (courseId !== null) {
      // The course is intentionally left behind on failure for manual Moodle inspection.
    } else if (categoryId !== null) {
      await callRestFunction(toRestFunctionName(contract, 'delete_course_category'), {
        category_id: categoryId
      });
    }
  }
});
