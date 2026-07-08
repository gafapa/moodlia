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

function workshopOptions(suffix, overrides = {}) {
  const now = Math.floor(Date.now() / 1000);
  return {
    intro: `<p>MoodlIA workshop intro ${suffix}</p>`,
    strategy: 'accumulative',
    submission_grade: 80,
    assessment_grade: 20,
    grade_decimals: 1,
    submission_instructions: `<p>Submit the generated work ${suffix}</p>`,
    assessment_instructions: `<p>Assess peer work ${suffix}</p>`,
    text_submission: 'required',
    file_submission: 'available',
    max_submission_attachments: 2,
    submission_file_types: '.txt,.pdf',
    late_submissions: true,
    self_assessment: true,
    example_submissions: false,
    examples_mode: 'voluntary',
    submission_start: now - 60,
    submission_end: now + 3600,
    assessment_start: now + 7200,
    assessment_end: now + 10800,
    switch_to_assessment_after_submission_deadline: false,
    conclusion: `<p>Workshop conclusion ${suffix}</p>`,
    overall_feedback_mode: 1,
    overall_feedback_files: 1,
    overall_feedback_file_types: '.txt',
    ...overrides
  };
}

function assertWorkshopDetails(details, created, expected) {
  const extra = JSON.parse(details.extra_json);

  assert.equal(details.module_type, 'workshop');
  assert.equal(details.course_module_id, created.course_module_id);
  assert.equal(extra.activity.workshop_id, created.instance_id);
  assert.equal(extra.activity.strategy, expected.strategy);
  assert.equal(extra.activity.submission_grade, expected.submission_grade);
  assert.equal(extra.activity.assessment_grade, expected.assessment_grade);
  assert.equal(extra.activity.grade_decimals, expected.grade_decimals);
  assert.equal(extra.activity.text_submission, expected.text_submission === 'required' ? 2 : 1);
  assert.equal(extra.activity.file_submission, expected.file_submission === 'required' ? 2 : 1);
  assert.equal(extra.activity.max_submission_attachments, expected.max_submission_attachments);
  assert.equal(extra.activity.late_submissions, expected.late_submissions);
  assert.equal(extra.activity.self_assessment, expected.self_assessment);
  assert.equal(extra.activity.submission_end > extra.activity.submission_start, true);
  assert.equal(extra.activity.assessment_start > extra.activity.submission_end, true);
}

function workshopGradingFormDefinition(suffix) {
  return {
    dimensions: [
      {
        description: `<p>Content quality ${suffix}</p>`,
        grade: 10,
        weight: 1
      },
      {
        description: `<p>Practical applicability ${suffix}</p>`,
        grade: 10,
        weight: 1
      }
    ]
  };
}

function workshopCommentsFormDefinition(suffix) {
  return {
    dimensions: [
      {
        description: `<p>Content feedback ${suffix}</p>`
      },
      {
        description: `<p>Practical feedback ${suffix}</p>`
      }
    ]
  };
}

function workshopNumErrorsFormDefinition(suffix) {
  return {
    dimensions: [
      {
        description: `<p>Required sources are cited ${suffix}</p>`,
        grade0: 'No',
        grade1: 'Yes',
        weight: 1
      },
      {
        description: `<p>Conclusion follows evidence ${suffix}</p>`,
        grade0: 'No',
        grade1: 'Yes',
        weight: 1
      }
    ],
    mappings: [
      { errors: 1, grade: 50 },
      { errors: 2, grade: 0 }
    ]
  };
}

function workshopRubricFormDefinition(suffix) {
  return {
    layout: 'list',
    dimensions: [
      {
        description: `<p>Content quality ${suffix}</p>`,
        levels: [
          { definition: 'Missing', grade: 0 },
          { definition: 'Adequate', grade: 5 },
          { definition: 'Strong', grade: 10 }
        ]
      },
      {
        description: `<p>Practical applicability ${suffix}</p>`,
        levels: [
          { definition: 'Missing', grade: 0 },
          { definition: 'Adequate', grade: 5 },
          { definition: 'Strong', grade: 10 }
        ]
      }
    ]
  };
}

function assertWorkshopGradingForm(form, expected) {
  assert.equal(form.course_id, expected.courseId);
  assert.equal(form.module_id, expected.moduleId);
  assert.equal(form.workshop_id, expected.workshopId);
  assert.equal(form.strategy, expected.strategy ?? 'accumulative');
  assert.equal(form.updated, true);
  assert.equal(form.dimensions_count, expected.dimensionsCount);
  const dimensions = JSON.parse(form.dimensions_json);
  assert.equal(Array.isArray(dimensions), true);
  assert.equal(dimensions.length, expected.dimensionsCount);
}

function assertSubmission(submission, expected) {
  assert.equal(submission.module_id, expected.moduleId);
  assert.equal(submission.title, expected.title);
  assert.equal(submission.content_format, expected.contentFormat ?? 'html');
  assert.match(submission.content, expected.contentPattern);
  assert.ok(submission.submission_id > 0);
}

function assertWorkshopUserPlan(plan, expected) {
  assert.equal(plan.course_id, expected.courseId);
  assert.equal(plan.module_id, expected.moduleId);
  assert.equal(plan.workshop_id, expected.workshopId);
  assert.ok(plan.user_id > 0);
  assert.equal(plan.phase_count, 5);
  assert.equal(plan.phases.length, plan.phase_count);
  assert.equal(plan.phases.some((phase) => phase.phase === expected.activePhase && phase.active === true), true);
  assert.equal(plan.phases.every((phase) => Array.isArray(phase.tasks) && phase.task_count === phase.tasks.length), true);
  assert.equal(plan.phases.every((phase) => Array.isArray(phase.actions) && phase.action_count === phase.actions.length), true);
  assert.equal(Array.isArray(plan.examples), true);
  assert.equal(plan.example_count, plan.examples.length);
}

function assertWorkshopGrades(grades, expected) {
  assert.equal(grades.course_id, expected.courseId);
  assert.equal(grades.module_id, expected.moduleId);
  assert.equal(grades.workshop_id, expected.workshopId);
  assert.ok(grades.user_id > 0);
  assert.equal(typeof grades.submission_raw_grade, 'number');
  assert.equal(typeof grades.submission_grade, 'string');
  assert.equal(typeof grades.submission_grade_hidden, 'boolean');
  assert.equal(typeof grades.assessment_raw_grade, 'number');
  assert.equal(typeof grades.assessment_grade, 'string');
  assert.equal(typeof grades.assessment_grade_hidden, 'boolean');
}

function assertWorkshopGradesReport(report, expected) {
  assert.equal(report.course_id, expected.courseId);
  assert.equal(report.module_id, expected.moduleId);
  assert.equal(report.workshop_id, expected.workshopId);
  assert.equal(report.group_id, 0);
  assert.equal(report.sort_by, expected.sortBy ?? 'submissiontitle');
  assert.equal(report.sort_direction, expected.sortDirection ?? 'ASC');
  assert.equal(report.page, 0);
  assert.equal(report.per_page, expected.perPage ?? 20);
  assert.ok(report.total_count >= 0);
  assert.equal(report.count, report.grades.length);

  for (const row of report.grades) {
    assert.equal(typeof row.user_id, 'number');
    assert.equal(typeof row.submission_id, 'number');
    assert.equal(typeof row.submission_title, 'string');
    assert.equal(typeof row.submission_modified, 'number');
    assert.equal(typeof row.submission_grade, 'number');
    assert.equal(typeof row.grading_grade, 'number');
    assert.equal(Array.isArray(row.reviewed_by), true);
    assert.equal(Array.isArray(row.reviewer_of), true);
  }
}

function assertWorkshopAssessments(payload, expected) {
  assert.equal(payload.course_id, expected.courseId);
  assert.equal(payload.module_id, expected.moduleId);
  assert.equal(payload.workshop_id, expected.workshopId);
  assert.equal(payload.count, payload.assessments.length);
  assert.equal(Array.isArray(payload.assessments), true);

  if ('userId' in expected) {
    assert.equal(payload.user_id, expected.userId);
  }

  if ('submissionId' in expected) {
    assert.equal(payload.submission_id, expected.submissionId);
  }

  for (const assessment of payload.assessments) {
    assert.equal(assessment.module_id, expected.moduleId);
    assert.equal(assessment.workshop_id, expected.workshopId);
    assert.equal(typeof assessment.assessment_id, 'number');
    assert.equal(typeof assessment.submission_id, 'number');
    assert.equal(typeof assessment.reviewer_id, 'number');
    assert.equal(typeof assessment.weight, 'number');
    assert.equal(typeof assessment.grade, 'number');
    assert.equal(typeof assessment.grading_grade, 'number');
    assert.equal(typeof assessment.grading_grade_over, 'number');
    assert.equal(typeof assessment.grading_grade_over_by, 'number');
    assert.equal(typeof assessment.feedback_author, 'string');
    assert.equal(typeof assessment.feedback_author_format, 'string');
    assert.equal(typeof assessment.feedback_reviewer, 'string');
    assert.equal(typeof assessment.feedback_reviewer_format, 'string');
    assert.equal(typeof assessment.time_created, 'number');
    assert.equal(typeof assessment.time_modified, 'number');

    if ('submissionId' in expected) {
      assert.equal(assessment.submission_id, expected.submissionId);
    }
  }
}

function assertWorkshopAssessmentForm(form, expected) {
  assert.equal(form.course_id, expected.courseId);
  assert.equal(form.module_id, expected.moduleId);
  assert.equal(form.workshop_id, expected.workshopId);
  assert.equal(form.assessment_id, expected.assessmentId);
  assert.equal(form.mode, expected.mode ?? 'assessment');
  assert.equal(typeof form.dimensions_count, 'number');
  assert.equal(typeof form.description_files_count, 'number');
  assert.doesNotThrow(() => JSON.parse(form.options_json));
  assert.doesNotThrow(() => JSON.parse(form.fields_json));
  assert.doesNotThrow(() => JSON.parse(form.current_json));
  assert.doesNotThrow(() => JSON.parse(form.dimensions_json));
  assert.equal(Array.isArray(form.warnings), true);
}

function assertWorkshopAssessmentEvaluation(evaluation, expected) {
  assert.equal(evaluation.course_id, expected.courseId);
  assert.equal(evaluation.module_id, expected.moduleId);
  assert.equal(evaluation.workshop_id, expected.workshopId);
  assert.equal(evaluation.assessment_id, expected.assessmentId);
  assert.equal(evaluation.evaluated, true);
  assert.equal(Array.isArray(evaluation.warnings), true);
}

function assessmentUpdateDataFromForm(form) {
  const fields = JSON.parse(form.fields_json);
  const data = fields.map((field) => {
    const row = { ...field };
    if (String(row.name).startsWith('peercomment__idx_')) {
      row.value = 'MoodlIA generated assessment comment';
    } else if (String(row.name).startsWith('grade__idx_')) {
      row.value = '25';
    }
    return {
      name: String(row.name),
      value: row.value === undefined || row.value === null ? '' : String(row.value)
    };
  });

  data.push({
    name: 'nodims',
    value: String(form.dimensions_count)
  });

  return data;
}

test('Workshop module lifecycle works through REST, MCP, and CLI', { skip: !hasConfig }, async () => {
  const contract = await loadContract();
  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const categoryName = `MoodlIA Workshop Category ${suffix}`;
  const courseName = `MoodlIA Workshop Course ${suffix}`;
  const courseShortname = `moodlia-workshop-${suffix}`;
  const sectionName = `MoodlIA Workshop Section ${suffix}`;
  let categoryId = null;
  let courseId = null;
  let sectionDeleted = false;
  let restWorkshopDeleted = false;
  let mcpWorkshopDeleted = false;
  let cliWorkshopDeleted = false;
  let categoryDeleted = false;

  try {
    const category = await callRestFunction(toRestFunctionName(contract, 'create_course_category'), {
      name: categoryName,
      visible: 1
    });
    categoryId = category.category_id;

    const course = await callRestFunction(toRestFunctionName(contract, 'create_course'), {
      fullname: courseName,
      shortname: courseShortname,
      category_id: categoryId,
      visible: 0,
      summary: `<p>MoodlIA workshop smoke course ${suffix}</p>`,
      summary_format: 'html',
      course_format: 'topics'
    });
    courseId = course.course_id;

    const section = await callRestFunction(toRestFunctionName(contract, 'create_section'), {
      course_id: courseId,
      name: sectionName
    });

    const restCommentsOptions = workshopOptions(suffix, { strategy: 'comments' });
    const restCommentsWorkshop = await callRestFunction(toRestFunctionName(contract, 'create_module'), {
      course_id: courseId,
      section_number: section.section_number,
      module_type: 'workshop',
      name: `MoodlIA REST Comments Workshop ${suffix}`,
      options: JSON.stringify(restCommentsOptions)
    });
    assert.equal(restCommentsWorkshop.module_type, 'workshop');

    const restCommentsGradingForm = await callRestFunction(toRestFunctionName(contract, 'set_workshop_grading_form'), {
      course_id: courseId,
      module_id: restCommentsWorkshop.course_module_id,
      strategy: 'comments',
      definition: JSON.stringify(workshopCommentsFormDefinition(suffix))
    });
    assertWorkshopGradingForm(restCommentsGradingForm, {
      courseId,
      moduleId: restCommentsWorkshop.course_module_id,
      workshopId: restCommentsWorkshop.instance_id,
      strategy: 'comments',
      dimensionsCount: 2
    });

    const deletedRestCommentsWorkshop = await callRestFunction(toRestFunctionName(contract, 'delete_module'), {
      course_id: courseId,
      module_id: restCommentsWorkshop.course_module_id
    });
    assert.equal(deletedRestCommentsWorkshop.deleted, true);

    const restNumErrorsOptions = workshopOptions(suffix, { strategy: 'numerrors' });
    const restNumErrorsWorkshop = await callRestFunction(toRestFunctionName(contract, 'create_module'), {
      course_id: courseId,
      section_number: section.section_number,
      module_type: 'workshop',
      name: `MoodlIA REST Number of Errors Workshop ${suffix}`,
      options: JSON.stringify(restNumErrorsOptions)
    });
    assert.equal(restNumErrorsWorkshop.module_type, 'workshop');

    const restNumErrorsGradingForm = await callRestFunction(toRestFunctionName(contract, 'set_workshop_grading_form'), {
      course_id: courseId,
      module_id: restNumErrorsWorkshop.course_module_id,
      strategy: 'numerrors',
      definition: JSON.stringify(workshopNumErrorsFormDefinition(suffix))
    });
    assertWorkshopGradingForm(restNumErrorsGradingForm, {
      courseId,
      moduleId: restNumErrorsWorkshop.course_module_id,
      workshopId: restNumErrorsWorkshop.instance_id,
      strategy: 'numerrors',
      dimensionsCount: 2
    });

    const deletedRestNumErrorsWorkshop = await callRestFunction(toRestFunctionName(contract, 'delete_module'), {
      course_id: courseId,
      module_id: restNumErrorsWorkshop.course_module_id
    });
    assert.equal(deletedRestNumErrorsWorkshop.deleted, true);

    const restRubricOptions = workshopOptions(suffix, { strategy: 'rubric' });
    const restRubricWorkshop = await callRestFunction(toRestFunctionName(contract, 'create_module'), {
      course_id: courseId,
      section_number: section.section_number,
      module_type: 'workshop',
      name: `MoodlIA REST Rubric Workshop ${suffix}`,
      options: JSON.stringify(restRubricOptions)
    });
    assert.equal(restRubricWorkshop.module_type, 'workshop');

    const restRubricGradingForm = await callRestFunction(toRestFunctionName(contract, 'set_workshop_grading_form'), {
      course_id: courseId,
      module_id: restRubricWorkshop.course_module_id,
      strategy: 'rubric',
      definition: JSON.stringify(workshopRubricFormDefinition(suffix))
    });
    assertWorkshopGradingForm(restRubricGradingForm, {
      courseId,
      moduleId: restRubricWorkshop.course_module_id,
      workshopId: restRubricWorkshop.instance_id,
      strategy: 'rubric',
      dimensionsCount: 2
    });

    const deletedRestRubricWorkshop = await callRestFunction(toRestFunctionName(contract, 'delete_module'), {
      course_id: courseId,
      module_id: restRubricWorkshop.course_module_id
    });
    assert.equal(deletedRestRubricWorkshop.deleted, true);

    const restOptions = workshopOptions(suffix);
    const restWorkshop = await callRestFunction(toRestFunctionName(contract, 'create_module'), {
      course_id: courseId,
      section_number: section.section_number,
      module_type: 'workshop',
      name: `MoodlIA REST Workshop ${suffix}`,
      options: JSON.stringify(restOptions)
    });
    assert.equal(restWorkshop.module_type, 'workshop');
    assert.match(restWorkshop.url, /\/mod\/workshop\/view\.php\?id=/);

    const restDetails = await callRestFunction(toRestFunctionName(contract, 'get_module_details'), {
      course_id: courseId,
      module_id: restWorkshop.course_module_id
    });
    assertWorkshopDetails(restDetails, restWorkshop, restOptions);

    const restGradingForm = await callRestFunction(toRestFunctionName(contract, 'set_workshop_grading_form'), {
      course_id: courseId,
      module_id: restWorkshop.course_module_id,
      strategy: 'accumulative',
      definition: JSON.stringify(workshopGradingFormDefinition(suffix))
    });
    assertWorkshopGradingForm(restGradingForm, {
      courseId,
      moduleId: restWorkshop.course_module_id,
      workshopId: restWorkshop.instance_id,
      dimensionsCount: 2
    });

    const restPhase = await callRestFunction(toRestFunctionName(contract, 'set_workshop_phase'), {
      course_id: courseId,
      module_id: restWorkshop.course_module_id,
      phase: 'submission'
    });
    assert.equal(restPhase.phase, 'submission');

    const restUserPlan = await callRestFunction(toRestFunctionName(contract, 'get_workshop_user_plan'), {
      course_id: courseId,
      module_id: restWorkshop.course_module_id
    });
    assertWorkshopUserPlan(restUserPlan, {
      courseId,
      moduleId: restWorkshop.course_module_id,
      workshopId: restWorkshop.instance_id,
      activePhase: 'submission'
    });

    const restGrades = await callRestFunction(toRestFunctionName(contract, 'get_workshop_grades'), {
      course_id: courseId,
      module_id: restWorkshop.course_module_id
    });
    assertWorkshopGrades(restGrades, {
      courseId,
      moduleId: restWorkshop.course_module_id,
      workshopId: restWorkshop.instance_id
    });

    const restSubmission = await callRestFunction(toRestFunctionName(contract, 'create_workshop_submission'), {
      course_id: courseId,
      module_id: restWorkshop.course_module_id,
      title: `MoodlIA REST Workshop Submission ${suffix}`,
      content: `<p>MoodlIA REST workshop submission ${suffix}</p>`,
      content_format: 'html'
    });
    assertSubmission(restSubmission, {
      moduleId: restWorkshop.course_module_id,
      title: `MoodlIA REST Workshop Submission ${suffix}`,
      contentPattern: new RegExp(`REST workshop submission ${suffix}`)
    });

    const restGradesReport = await callRestFunction(toRestFunctionName(contract, 'get_workshop_grades_report'), {
      course_id: courseId,
      module_id: restWorkshop.course_module_id,
      sort_by: 'submissiontitle',
      sort_direction: 'ASC',
      page: 0,
      per_page: 20
    });
    assertWorkshopGradesReport(restGradesReport, {
      courseId,
      moduleId: restWorkshop.course_module_id,
      workshopId: restWorkshop.instance_id,
      submissionId: restSubmission.submission_id,
      submissionTitle: `MoodlIA REST Workshop Submission ${suffix}`
    });

    const updatedRestSubmission = await callRestFunction(toRestFunctionName(contract, 'update_workshop_submission'), {
      course_id: courseId,
      module_id: restWorkshop.course_module_id,
      submission_id: restSubmission.submission_id,
      title: `MoodlIA REST Updated Workshop Submission ${suffix}`,
      content: `<p>MoodlIA REST updated workshop submission ${suffix}</p>`,
      content_format: 'html'
    });
    assertSubmission(updatedRestSubmission, {
      moduleId: restWorkshop.course_module_id,
      title: `MoodlIA REST Updated Workshop Submission ${suffix}`,
      contentPattern: new RegExp(`REST updated workshop submission ${suffix}`)
    });

    const restSubmissions = await callRestFunction(toRestFunctionName(contract, 'get_workshop_submissions'), {
      course_id: courseId,
      module_id: restWorkshop.course_module_id
    });
    assert.equal(restSubmissions.submissions.some((submission) => submission.submission_id === restSubmission.submission_id), true);

    const restAssessmentPhase = await callRestFunction(toRestFunctionName(contract, 'set_workshop_phase'), {
      course_id: courseId,
      module_id: restWorkshop.course_module_id,
      phase: 'assessment'
    });
    assert.equal(restAssessmentPhase.phase, 'assessment');

    const allocatedRestAssessment = await callRestFunction(toRestFunctionName(contract, 'allocate_workshop_submission'), {
      course_id: courseId,
      module_id: restWorkshop.course_module_id,
      submission_id: restSubmission.submission_id,
      reviewer_id: restUserPlan.user_id,
      weight: 1
    });
    assert.equal(allocatedRestAssessment.submission_id, restSubmission.submission_id);
    assert.equal(allocatedRestAssessment.reviewer_id, restUserPlan.user_id);
    assert.equal(allocatedRestAssessment.created, true);

    const restReviewerAssessments = await callRestFunction(toRestFunctionName(contract, 'get_workshop_reviewer_assessments'), {
      course_id: courseId,
      module_id: restWorkshop.course_module_id,
      user_id: restUserPlan.user_id
    });
    assertWorkshopAssessments(restReviewerAssessments, {
      courseId,
      moduleId: restWorkshop.course_module_id,
      workshopId: restWorkshop.instance_id,
      userId: restUserPlan.user_id
    });

    const restSubmissionAssessments = await callRestFunction(toRestFunctionName(contract, 'get_workshop_submission_assessments'), {
      course_id: courseId,
      module_id: restWorkshop.course_module_id,
      submission_id: restSubmission.submission_id
    });
    assertWorkshopAssessments(restSubmissionAssessments, {
      courseId,
      moduleId: restWorkshop.course_module_id,
      workshopId: restWorkshop.instance_id,
      submissionId: restSubmission.submission_id
    });
    assert.ok(restSubmissionAssessments.assessments.length > 0, 'REST workshop submission must expose at least one assessment.');
    const restAssessment = restSubmissionAssessments.assessments.find(
      (assessment) => assessment.assessment_id === allocatedRestAssessment.assessment_id
    );
    assert.ok(restAssessment, 'REST allocated assessment must be listed for the submission.');

    const restAssessmentForm = await callRestFunction(toRestFunctionName(contract, 'get_workshop_assessment_form_definition'), {
      course_id: courseId,
      module_id: restWorkshop.course_module_id,
      assessment_id: restAssessment.assessment_id,
      mode: 'assessment'
    });
    assertWorkshopAssessmentForm(restAssessmentForm, {
      courseId,
      moduleId: restWorkshop.course_module_id,
      workshopId: restWorkshop.instance_id,
      assessmentId: restAssessment.assessment_id
    });

    const restAssessmentUpdate = await callRestFunction(toRestFunctionName(contract, 'update_workshop_assessment'), {
      course_id: courseId,
      module_id: restWorkshop.course_module_id,
      assessment_id: restAssessment.assessment_id,
      data_json: JSON.stringify(assessmentUpdateDataFromForm(restAssessmentForm))
    });
    assert.equal(restAssessmentUpdate.assessment_id, restAssessment.assessment_id);
    assert.equal(typeof restAssessmentUpdate.raw_grade, 'number');
    assert.equal(Array.isArray(restAssessmentUpdate.warnings), true);

    const restAssessmentEvaluation = await callRestFunction(toRestFunctionName(contract, 'evaluate_workshop_assessment'), {
      course_id: courseId,
      module_id: restWorkshop.course_module_id,
      assessment_id: restAssessment.assessment_id,
      feedback_text: `<p>MoodlIA REST assessment feedback ${suffix}</p>`,
      feedback_format: 'html',
      weight: 1
    });
    assertWorkshopAssessmentEvaluation(restAssessmentEvaluation, {
      courseId,
      moduleId: restWorkshop.course_module_id,
      workshopId: restWorkshop.instance_id,
      assessmentId: restAssessment.assessment_id
    });

    const restBackToSubmissionPhase = await callRestFunction(toRestFunctionName(contract, 'set_workshop_phase'), {
      course_id: courseId,
      module_id: restWorkshop.course_module_id,
      phase: 'submission'
    });
    assert.equal(restBackToSubmissionPhase.phase, 'submission');

    const deletedRestSubmission = await callRestFunction(toRestFunctionName(contract, 'delete_workshop_submission'), {
      course_id: courseId,
      module_id: restWorkshop.course_module_id,
      submission_id: restSubmission.submission_id
    });
    assert.equal(deletedRestSubmission.deleted, true);

    const mcpOptions = workshopOptions(suffix, { self_assessment: true, grade_decimals: 0 });
    const mcpWorkshop = await callMcpTool('create_module', {
      course_id: courseId,
      section_number: section.section_number,
      module_type: 'workshop',
      name: `MoodlIA MCP Workshop ${suffix}`,
      options: mcpOptions
    });
    assert.equal(mcpWorkshop.module_type, 'workshop');

    const mcpDetails = await callMcpTool('get_module_details', {
      course_id: courseId,
      module_id: mcpWorkshop.course_module_id
    });
    assertWorkshopDetails(mcpDetails, mcpWorkshop, mcpOptions);

    const mcpGradingForm = await callMcpTool('set_workshop_grading_form', {
      course_id: courseId,
      module_id: mcpWorkshop.course_module_id,
      strategy: 'accumulative',
      definition: workshopGradingFormDefinition(suffix)
    });
    assertWorkshopGradingForm(mcpGradingForm, {
      courseId,
      moduleId: mcpWorkshop.course_module_id,
      workshopId: mcpWorkshop.instance_id,
      dimensionsCount: 2
    });

    const mcpPhase = await callMcpTool('set_workshop_phase', {
      course_id: courseId,
      module_id: mcpWorkshop.course_module_id,
      phase: 'submission'
    });
    assert.equal(mcpPhase.phase, 'submission');

    const mcpUserPlan = await callMcpTool('get_workshop_user_plan', {
      course_id: courseId,
      module_id: mcpWorkshop.course_module_id
    });
    assertWorkshopUserPlan(mcpUserPlan, {
      courseId,
      moduleId: mcpWorkshop.course_module_id,
      workshopId: mcpWorkshop.instance_id,
      activePhase: 'submission'
    });

    const mcpGrades = await callMcpTool('get_workshop_grades', {
      course_id: courseId,
      module_id: mcpWorkshop.course_module_id
    });
    assertWorkshopGrades(mcpGrades, {
      courseId,
      moduleId: mcpWorkshop.course_module_id,
      workshopId: mcpWorkshop.instance_id
    });

    const mcpSubmission = await callMcpTool('create_workshop_submission', {
      course_id: courseId,
      module_id: mcpWorkshop.course_module_id,
      title: `MoodlIA MCP Workshop Submission ${suffix}`,
      content: `<p>MoodlIA MCP workshop submission ${suffix}</p>`,
      content_format: 'html'
    });
    assertSubmission(mcpSubmission, {
      moduleId: mcpWorkshop.course_module_id,
      title: `MoodlIA MCP Workshop Submission ${suffix}`,
      contentPattern: new RegExp(`MCP workshop submission ${suffix}`)
    });

    const mcpGradesReport = await callMcpTool('get_workshop_grades_report', {
      course_id: courseId,
      module_id: mcpWorkshop.course_module_id,
      sort_by: 'submissiontitle',
      sort_direction: 'ASC',
      page: 0,
      per_page: 20
    });
    assertWorkshopGradesReport(mcpGradesReport, {
      courseId,
      moduleId: mcpWorkshop.course_module_id,
      workshopId: mcpWorkshop.instance_id,
      submissionId: mcpSubmission.submission_id,
      submissionTitle: `MoodlIA MCP Workshop Submission ${suffix}`
    });

    const updatedMcpSubmission = await callMcpTool('update_workshop_submission', {
      course_id: courseId,
      module_id: mcpWorkshop.course_module_id,
      submission_id: mcpSubmission.submission_id,
      title: `MoodlIA MCP Updated Workshop Submission ${suffix}`,
      content: `<p>MoodlIA MCP updated workshop submission ${suffix}</p>`,
      content_format: 'html'
    });
    assertSubmission(updatedMcpSubmission, {
      moduleId: mcpWorkshop.course_module_id,
      title: `MoodlIA MCP Updated Workshop Submission ${suffix}`,
      contentPattern: new RegExp(`MCP updated workshop submission ${suffix}`)
    });

    const mcpSubmissions = await callMcpTool('get_workshop_submissions', {
      course_id: courseId,
      module_id: mcpWorkshop.course_module_id
    });
    assert.equal(mcpSubmissions.submissions.some((submission) => submission.submission_id === mcpSubmission.submission_id), true);

    const mcpAssessmentPhase = await callMcpTool('set_workshop_phase', {
      course_id: courseId,
      module_id: mcpWorkshop.course_module_id,
      phase: 'assessment'
    });
    assert.equal(mcpAssessmentPhase.phase, 'assessment');

    const allocatedMcpAssessment = await callMcpTool('allocate_workshop_submission', {
      course_id: courseId,
      module_id: mcpWorkshop.course_module_id,
      submission_id: mcpSubmission.submission_id,
      reviewer_id: mcpUserPlan.user_id,
      weight: 1
    });
    assert.equal(allocatedMcpAssessment.submission_id, mcpSubmission.submission_id);
    assert.equal(allocatedMcpAssessment.reviewer_id, mcpUserPlan.user_id);
    assert.equal(allocatedMcpAssessment.created, true);

    const mcpReviewerAssessments = await callMcpTool('get_workshop_reviewer_assessments', {
      course_id: courseId,
      module_id: mcpWorkshop.course_module_id,
      user_id: mcpUserPlan.user_id
    });
    assertWorkshopAssessments(mcpReviewerAssessments, {
      courseId,
      moduleId: mcpWorkshop.course_module_id,
      workshopId: mcpWorkshop.instance_id,
      userId: mcpUserPlan.user_id
    });

    const mcpSubmissionAssessments = await callMcpTool('get_workshop_submission_assessments', {
      course_id: courseId,
      module_id: mcpWorkshop.course_module_id,
      submission_id: mcpSubmission.submission_id
    });
    assertWorkshopAssessments(mcpSubmissionAssessments, {
      courseId,
      moduleId: mcpWorkshop.course_module_id,
      workshopId: mcpWorkshop.instance_id,
      submissionId: mcpSubmission.submission_id
    });
    assert.ok(mcpSubmissionAssessments.assessments.length > 0, 'MCP workshop submission must expose at least one assessment.');
    const mcpAssessment = mcpSubmissionAssessments.assessments.find(
      (assessment) => assessment.assessment_id === allocatedMcpAssessment.assessment_id
    );
    assert.ok(mcpAssessment, 'MCP allocated assessment must be listed for the submission.');

    const mcpAssessmentForm = await callMcpTool('get_workshop_assessment_form_definition', {
      course_id: courseId,
      module_id: mcpWorkshop.course_module_id,
      assessment_id: mcpAssessment.assessment_id,
      mode: 'assessment'
    });
    assertWorkshopAssessmentForm(mcpAssessmentForm, {
      courseId,
      moduleId: mcpWorkshop.course_module_id,
      workshopId: mcpWorkshop.instance_id,
      assessmentId: mcpAssessment.assessment_id
    });

    const mcpAssessmentUpdate = await callMcpTool('update_workshop_assessment', {
      course_id: courseId,
      module_id: mcpWorkshop.course_module_id,
      assessment_id: mcpAssessment.assessment_id,
      data_json: JSON.stringify(assessmentUpdateDataFromForm(mcpAssessmentForm))
    });
    assert.equal(mcpAssessmentUpdate.assessment_id, mcpAssessment.assessment_id);
    assert.equal(typeof mcpAssessmentUpdate.raw_grade, 'number');
    assert.equal(Array.isArray(mcpAssessmentUpdate.warnings), true);

    const mcpAssessmentEvaluation = await callMcpTool('evaluate_workshop_assessment', {
      course_id: courseId,
      module_id: mcpWorkshop.course_module_id,
      assessment_id: mcpAssessment.assessment_id,
      feedback_text: `<p>MoodlIA MCP assessment feedback ${suffix}</p>`,
      feedback_format: 'html',
      weight: 1
    });
    assertWorkshopAssessmentEvaluation(mcpAssessmentEvaluation, {
      courseId,
      moduleId: mcpWorkshop.course_module_id,
      workshopId: mcpWorkshop.instance_id,
      assessmentId: mcpAssessment.assessment_id
    });

    const mcpBackToSubmissionPhase = await callMcpTool('set_workshop_phase', {
      course_id: courseId,
      module_id: mcpWorkshop.course_module_id,
      phase: 'submission'
    });
    assert.equal(mcpBackToSubmissionPhase.phase, 'submission');

    const deletedMcpSubmission = await callMcpTool('delete_workshop_submission', {
      course_id: courseId,
      module_id: mcpWorkshop.course_module_id,
      submission_id: mcpSubmission.submission_id
    });
    assert.equal(deletedMcpSubmission.deleted, true);

    const cliOptions = workshopOptions(suffix, { submission_grade: 70, assessment_grade: 30, max_submission_attachments: 1 });
    const cliWorkshop = await callCli([
      'create-module',
      '--course-id', String(courseId),
      '--section-number', String(section.section_number),
      '--module-type', 'workshop',
      '--name', `MoodlIA CLI Workshop ${suffix}`,
      '--options', JSON.stringify(cliOptions)
    ]);
    assert.equal(cliWorkshop.module_type, 'workshop');

    const cliDetails = await callCli([
      'get-module-details',
      '--course-id', String(courseId),
      '--module-id', String(cliWorkshop.course_module_id)
    ]);
    assertWorkshopDetails(cliDetails, cliWorkshop, cliOptions);

    const cliGradingForm = await callCli([
      'set-workshop-grading-form',
      '--course-id', String(courseId),
      '--module-id', String(cliWorkshop.course_module_id),
      '--strategy', 'accumulative',
      '--definition', JSON.stringify(workshopGradingFormDefinition(suffix))
    ]);
    assertWorkshopGradingForm(cliGradingForm, {
      courseId,
      moduleId: cliWorkshop.course_module_id,
      workshopId: cliWorkshop.instance_id,
      dimensionsCount: 2
    });

    const cliPhase = await callCli([
      'set-workshop-phase',
      '--course-id', String(courseId),
      '--module-id', String(cliWorkshop.course_module_id),
      '--phase', 'submission'
    ]);
    assert.equal(cliPhase.phase, 'submission');

    const cliUserPlan = await callCli([
      'get-workshop-user-plan',
      '--course-id', String(courseId),
      '--module-id', String(cliWorkshop.course_module_id)
    ]);
    assertWorkshopUserPlan(cliUserPlan, {
      courseId,
      moduleId: cliWorkshop.course_module_id,
      workshopId: cliWorkshop.instance_id,
      activePhase: 'submission'
    });

    const cliGrades = await callCli([
      'get-workshop-grades',
      '--course-id', String(courseId),
      '--module-id', String(cliWorkshop.course_module_id)
    ]);
    assertWorkshopGrades(cliGrades, {
      courseId,
      moduleId: cliWorkshop.course_module_id,
      workshopId: cliWorkshop.instance_id
    });

    const cliSubmission = await callCli([
      'create-workshop-submission',
      '--course-id', String(courseId),
      '--module-id', String(cliWorkshop.course_module_id),
      '--title', `MoodlIA CLI Workshop Submission ${suffix}`,
      '--content', `<p>MoodlIA CLI workshop submission ${suffix}</p>`,
      '--content-format', 'html'
    ]);
    assertSubmission(cliSubmission, {
      moduleId: cliWorkshop.course_module_id,
      title: `MoodlIA CLI Workshop Submission ${suffix}`,
      contentPattern: new RegExp(`CLI workshop submission ${suffix}`)
    });

    const cliGradesReport = await callCli([
      'get-workshop-grades-report',
      '--course-id', String(courseId),
      '--module-id', String(cliWorkshop.course_module_id),
      '--sort-by', 'submissiontitle',
      '--sort-direction', 'ASC',
      '--page', '0',
      '--per-page', '20'
    ]);
    assertWorkshopGradesReport(cliGradesReport, {
      courseId,
      moduleId: cliWorkshop.course_module_id,
      workshopId: cliWorkshop.instance_id,
      submissionId: cliSubmission.submission_id,
      submissionTitle: `MoodlIA CLI Workshop Submission ${suffix}`
    });

    const updatedCliSubmission = await callCli([
      'update-workshop-submission',
      '--course-id', String(courseId),
      '--module-id', String(cliWorkshop.course_module_id),
      '--submission-id', String(cliSubmission.submission_id),
      '--title', `MoodlIA CLI Updated Workshop Submission ${suffix}`,
      '--content', `<p>MoodlIA CLI updated workshop submission ${suffix}</p>`,
      '--content-format', 'html'
    ]);
    assertSubmission(updatedCliSubmission, {
      moduleId: cliWorkshop.course_module_id,
      title: `MoodlIA CLI Updated Workshop Submission ${suffix}`,
      contentPattern: new RegExp(`CLI updated workshop submission ${suffix}`)
    });

    const cliSubmissions = await callCli([
      'get-workshop-submissions',
      '--course-id', String(courseId),
      '--module-id', String(cliWorkshop.course_module_id)
    ]);
    assert.equal(cliSubmissions.submissions.some((submission) => submission.submission_id === cliSubmission.submission_id), true);

    const cliAssessmentPhase = await callCli([
      'set-workshop-phase',
      '--course-id', String(courseId),
      '--module-id', String(cliWorkshop.course_module_id),
      '--phase', 'assessment'
    ]);
    assert.equal(cliAssessmentPhase.phase, 'assessment');

    const allocatedCliAssessment = await callCli([
      'allocate-workshop-submission',
      '--course-id', String(courseId),
      '--module-id', String(cliWorkshop.course_module_id),
      '--submission-id', String(cliSubmission.submission_id),
      '--reviewer-id', String(cliUserPlan.user_id),
      '--weight', '1'
    ]);
    assert.equal(allocatedCliAssessment.submission_id, cliSubmission.submission_id);
    assert.equal(allocatedCliAssessment.reviewer_id, cliUserPlan.user_id);
    assert.equal(allocatedCliAssessment.created, true);

    const cliReviewerAssessments = await callCli([
      'get-workshop-reviewer-assessments',
      '--course-id', String(courseId),
      '--module-id', String(cliWorkshop.course_module_id),
      '--user-id', String(cliUserPlan.user_id)
    ]);
    assertWorkshopAssessments(cliReviewerAssessments, {
      courseId,
      moduleId: cliWorkshop.course_module_id,
      workshopId: cliWorkshop.instance_id,
      userId: cliUserPlan.user_id
    });

    const cliSubmissionAssessments = await callCli([
      'get-workshop-submission-assessments',
      '--course-id', String(courseId),
      '--module-id', String(cliWorkshop.course_module_id),
      '--submission-id', String(cliSubmission.submission_id)
    ]);
    assertWorkshopAssessments(cliSubmissionAssessments, {
      courseId,
      moduleId: cliWorkshop.course_module_id,
      workshopId: cliWorkshop.instance_id,
      submissionId: cliSubmission.submission_id
    });
    assert.ok(cliSubmissionAssessments.assessments.length > 0, 'CLI workshop submission must expose at least one assessment.');
    const cliAssessment = cliSubmissionAssessments.assessments.find(
      (assessment) => assessment.assessment_id === allocatedCliAssessment.assessment_id
    );
    assert.ok(cliAssessment, 'CLI allocated assessment must be listed for the submission.');

    const cliAssessmentForm = await callCli([
      'get-workshop-assessment-form-definition',
      '--course-id', String(courseId),
      '--module-id', String(cliWorkshop.course_module_id),
      '--assessment-id', String(cliAssessment.assessment_id),
      '--mode', 'assessment'
    ]);
    assertWorkshopAssessmentForm(cliAssessmentForm, {
      courseId,
      moduleId: cliWorkshop.course_module_id,
      workshopId: cliWorkshop.instance_id,
      assessmentId: cliAssessment.assessment_id
    });

    const cliAssessmentUpdate = await callCli([
      'update-workshop-assessment',
      '--course-id', String(courseId),
      '--module-id', String(cliWorkshop.course_module_id),
      '--assessment-id', String(cliAssessment.assessment_id),
      '--data-json', JSON.stringify(assessmentUpdateDataFromForm(cliAssessmentForm))
    ]);
    assert.equal(cliAssessmentUpdate.assessment_id, cliAssessment.assessment_id);
    assert.equal(typeof cliAssessmentUpdate.raw_grade, 'number');
    assert.equal(Array.isArray(cliAssessmentUpdate.warnings), true);

    const cliAssessmentEvaluation = await callCli([
      'evaluate-workshop-assessment',
      '--course-id', String(courseId),
      '--module-id', String(cliWorkshop.course_module_id),
      '--assessment-id', String(cliAssessment.assessment_id),
      '--feedback-text', `<p>MoodlIA CLI assessment feedback ${suffix}</p>`,
      '--feedback-format', 'html',
      '--weight', '1'
    ]);
    assertWorkshopAssessmentEvaluation(cliAssessmentEvaluation, {
      courseId,
      moduleId: cliWorkshop.course_module_id,
      workshopId: cliWorkshop.instance_id,
      assessmentId: cliAssessment.assessment_id
    });

    const cliBackToSubmissionPhase = await callCli([
      'set-workshop-phase',
      '--course-id', String(courseId),
      '--module-id', String(cliWorkshop.course_module_id),
      '--phase', 'submission'
    ]);
    assert.equal(cliBackToSubmissionPhase.phase, 'submission');

    const deletedCliSubmission = await callCli([
      'delete-workshop-submission',
      '--course-id', String(courseId),
      '--module-id', String(cliWorkshop.course_module_id),
      '--submission-id', String(cliSubmission.submission_id)
    ]);
    assert.equal(deletedCliSubmission.deleted, true);

    const deletedCliWorkshop = await callCli([
      'delete-module',
      '--course-id', String(courseId),
      '--module-id', String(cliWorkshop.course_module_id)
    ]);
    assert.equal(deletedCliWorkshop.deleted, true);
    cliWorkshopDeleted = true;

    const deletedMcpWorkshop = await callMcpTool('delete_module', {
      course_id: courseId,
      module_id: mcpWorkshop.course_module_id
    });
    assert.equal(deletedMcpWorkshop.deleted, true);
    mcpWorkshopDeleted = true;

    const deletedRestWorkshop = await callRestFunction(toRestFunctionName(contract, 'delete_module'), {
      course_id: courseId,
      module_id: restWorkshop.course_module_id
    });
    assert.equal(deletedRestWorkshop.deleted, true);
    restWorkshopDeleted = true;

    const deletedSection = await callRestFunction(toRestFunctionName(contract, 'delete_section'), {
      course_id: courseId,
      section_id: section.section_id
    });
    assert.equal(deletedSection.deleted, true);
    sectionDeleted = true;

    const deletedCourse = await callRestFunction(toRestFunctionName(contract, 'delete_course'), {
      course_id: courseId
    });
    assert.equal(deletedCourse.deleted, true);
    courseId = null;

    const deletedCategory = await callRestFunction(toRestFunctionName(contract, 'delete_course_category'), {
      category_id: categoryId
    });
    assert.equal(deletedCategory.deleted, true);
    categoryDeleted = true;
    categoryId = null;
  } catch (error) {
    if (courseId) {
      console.error(`Generated workshop course left in Moodle for inspection: ${courseId}`);
      if (!restWorkshopDeleted) {
        console.error('REST workshop cleanup was not attempted because the lifecycle failed before the success cleanup phase.');
      }
      if (!mcpWorkshopDeleted) {
        console.error('MCP workshop cleanup was not attempted because the lifecycle failed before the success cleanup phase.');
      }
      if (!cliWorkshopDeleted) {
        console.error('CLI workshop cleanup was not attempted because the lifecycle failed before the success cleanup phase.');
      }
      if (!sectionDeleted) {
        console.error('Workshop section cleanup was not attempted because the lifecycle failed before the success cleanup phase.');
      }
    }
    if (categoryId && !categoryDeleted) {
      console.error(`Generated workshop course category left in Moodle for inspection: ${categoryId}`);
    }
    throw error;
  }
});
