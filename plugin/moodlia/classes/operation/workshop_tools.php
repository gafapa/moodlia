<?php
// This file is part of Moodle - https://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

/**
 * Shared workshop helpers.
 *
 * @package    local_moodlia
 * @copyright  2026
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace local_moodlia\operation;

defined('MOODLE_INTERNAL') || die();

/**
 * Helper methods for Moodle Workshop operations.
 */
class workshop_tools {
    /**
     * Load Moodle workshop APIs.
     */
    public static function require_workshop_api(): void {
        global $CFG;

        require_once($CFG->dirroot . '/mod/workshop/lib.php');
        require_once($CFG->dirroot . '/mod/workshop/locallib.php');
        require_once($CFG->dirroot . '/mod/workshop/classes/external.php');
    }

    /**
     * Verify that a course module belongs to a workshop activity.
     *
     * @param \stdClass $course Moodle course.
     * @param int $cmid Course module id.
     * @return \cm_info
     */
    public static function get_workshop_module(\stdClass $course, int $cmid): \cm_info {
        $cm = module_tools::get_course_module($course, $cmid);
        if ($cm->modname !== 'workshop') {
            throw new \invalid_parameter_exception('module_id must reference a workshop activity.');
        }

        return $cm;
    }

    /**
     * Return workshop instance data exposed through Moodle's workshop external API.
     *
     * @param \stdClass $course Moodle course.
     * @param \cm_info $cm Workshop course module.
     * @return array
     */
    public static function get_workshop_instance_data(\stdClass $course, \cm_info $cm): array {
        self::require_workshop_api();

        $result = \mod_workshop_external::get_workshops_by_courses([(int) $course->id]);
        foreach (($result['workshops'] ?? []) as $workshop) {
            $workshop = (array) $workshop;
            if (
                (int) ($workshop['id'] ?? 0) === (int) $cm->instance ||
                (int) ($workshop['coursemodule'] ?? $workshop['cmid'] ?? $workshop['coursemoduleid'] ?? 0) === (int) $cm->id
            ) {
                return $workshop;
            }
        }

        throw new \invalid_parameter_exception('module_id must reference a visible workshop activity in the selected course.');
    }

    /**
     * Return a workshop domain object.
     *
     * @param \stdClass $course Moodle course.
     * @param \cm_info $cm Workshop course module.
     * @return \workshop
     */
    public static function get_workshop_object(\stdClass $course, \cm_info $cm): \workshop {
        self::require_workshop_api();

        $data = (object) self::get_workshop_instance_data($course, $cm);
        $data->id = (int) $cm->instance;
        $data->course = (int) $course->id;
        $cmrecord = get_coursemodule_from_id('workshop', (int) $cm->id, (int) $course->id, false, MUST_EXIST);

        return new \workshop($data, $cmrecord, $course);
    }

    /**
     * Prepare Moodle page globals required by Workshop form component APIs.
     *
     * @param \stdClass $course Moodle course.
     * @param \cm_info $cm Workshop course module.
     * @return \stdClass Course-module record.
     */
    public static function prepare_page_context(\stdClass $course, \cm_info $cm): \stdClass {
        global $PAGE;

        $cmrecord = get_coursemodule_from_id('workshop', (int) $cm->id, (int) $course->id, false, MUST_EXIST);
        $PAGE->set_course($course);
        $PAGE->set_cm($cmrecord, $course);

        return $cmrecord;
    }

    /**
     * Decode and validate an accumulative grading-form definition.
     *
     * @param string $definitionjson JSON object with a dimensions array.
     * @return array
     */
    public static function decode_accumulative_definition(string $definitionjson): array {
        $decoded = json_decode($definitionjson, true);
        if (!is_array($decoded) || !isset($decoded['dimensions']) || !is_array($decoded['dimensions'])) {
            throw new \invalid_parameter_exception('definition must be a JSON object with a dimensions array.');
        }
        if (count($decoded['dimensions']) === 0) {
            throw new \invalid_parameter_exception('definition.dimensions must contain at least one dimension.');
        }

        $dimensions = [];
        foreach ($decoded['dimensions'] as $dimension) {
            if (!is_array($dimension)) {
                throw new \invalid_parameter_exception('Each dimension must be an object.');
            }
            $description = trim((string) ($dimension['description'] ?? ''));
            if ($description === '') {
                throw new \invalid_parameter_exception('Each dimension description must be non-empty.');
            }
            $grade = (float) ($dimension['grade'] ?? 0);
            if ($grade <= 0) {
                throw new \invalid_parameter_exception('Each dimension grade must be greater than zero.');
            }
            $weight = (float) ($dimension['weight'] ?? 1);
            if ($weight < 0) {
                throw new \invalid_parameter_exception('Each dimension weight must be zero or greater.');
            }

            $dimensions[] = [
                'description' => $description,
                'grade' => $grade,
                'weight' => $weight,
            ];
        }

        return $dimensions;
    }

    /**
     * Build form-shaped data for Workshop accumulative strategy saving.
     *
     * @param \workshop $workshop Workshop domain object.
     * @param array $dimensions New dimension rows.
     * @param array $existing Existing dimension info keyed by id.
     * @return \stdClass
     */
    public static function accumulative_edit_form_data(\workshop $workshop, array $dimensions, array $existing = []): \stdClass {
        $data = new \stdClass();
        $data->workshopid = (int) $workshop->id;
        $data->norepeats = count($existing) + count($dimensions);

        $index = 0;
        foreach (array_keys($existing) as $dimensionid) {
            $data->{'dimensionid__idx_' . $index} = (int) $dimensionid;
            $data->{'description__idx_' . $index . '_editor'} = [
                'text' => '',
                'format' => FORMAT_HTML,
                'itemid' => 0,
            ];
            $data->{'grade__idx_' . $index} = 0;
            $data->{'weight__idx_' . $index} = 0;
            $index++;
        }

        foreach ($dimensions as $dimension) {
            $data->{'dimensionid__idx_' . $index} = 0;
            $data->{'description__idx_' . $index . '_editor'} = [
                'text' => $dimension['description'],
                'format' => FORMAT_HTML,
                'itemid' => 0,
            ];
            $data->{'grade__idx_' . $index} = $dimension['grade'];
            $data->{'weight__idx_' . $index} = $dimension['weight'];
            $index++;
        }

        return $data;
    }

    /**
     * Convert a public phase name to a Moodle workshop phase constant.
     *
     * @param string $phase Public phase.
     * @return int
     */
    public static function phase_to_constant(string $phase): int {
        self::require_workshop_api();

        $phase = clean_param(strtolower(trim($phase)), PARAM_ALPHA);
        $map = [
            'setup' => \workshop::PHASE_SETUP,
            'submission' => \workshop::PHASE_SUBMISSION,
            'assessment' => \workshop::PHASE_ASSESSMENT,
            'evaluation' => \workshop::PHASE_EVALUATION,
            'closed' => \workshop::PHASE_CLOSED,
        ];

        if (!array_key_exists($phase, $map)) {
            throw new \invalid_parameter_exception('phase must be one of: setup, submission, assessment, evaluation, closed.');
        }

        return (int) $map[$phase];
    }

    /**
     * Convert a Moodle workshop phase constant to a public phase name.
     *
     * @param int $phase Moodle phase constant.
     * @return string
     */
    public static function phase_from_constant(int $phase): string {
        self::require_workshop_api();

        $map = [
            \workshop::PHASE_SETUP => 'setup',
            \workshop::PHASE_SUBMISSION => 'submission',
            \workshop::PHASE_ASSESSMENT => 'assessment',
            \workshop::PHASE_EVALUATION => 'evaluation',
            \workshop::PHASE_CLOSED => 'closed',
        ];

        return $map[$phase] ?? 'unknown';
    }

    /**
     * Convert a public content format name to a Moodle format constant.
     *
     * @param string $format Public format.
     * @return int
     */
    public static function format_to_constant(string $format): int {
        $format = clean_param($format ?: 'html', PARAM_ALPHA);
        if ($format === 'html') {
            return FORMAT_HTML;
        }
        if ($format === 'plain') {
            return FORMAT_PLAIN;
        }

        throw new \invalid_parameter_exception('content_format must be one of: html, plain.');
    }

    /**
     * Convert a Moodle format constant to a public format name.
     *
     * @param int $format Moodle format.
     * @return string
     */
    public static function format_from_constant(int $format): string {
        return $format === FORMAT_PLAIN ? 'plain' : 'html';
    }

    /**
     * Return a canonical workshop submission response.
     *
     * @param \cm_info $cm Workshop course module.
     * @param array|\stdClass $submission Moodle submission payload.
     * @return array
     */
    public static function submission_to_response(\cm_info $cm, $submission): array {
        $submission = (array) $submission;

        return [
            'submission_id' => (int) ($submission['id'] ?? 0),
            'workshop_id' => (int) ($submission['workshopid'] ?? $cm->instance),
            'module_id' => (int) $cm->id,
            'author_id' => (int) ($submission['authorid'] ?? 0),
            'title' => (string) ($submission['title'] ?? ''),
            'content' => (string) ($submission['content'] ?? ''),
            'content_format' => self::format_from_constant((int) ($submission['contentformat'] ?? FORMAT_HTML)),
            'grade' => self::optional_float($submission, 'grade'),
            'grade_over' => self::optional_float($submission, 'gradeover'),
            'grade_over_by' => (int) ($submission['gradeoverby'] ?? 0),
            'published' => (bool) ($submission['published'] ?? false),
            'late' => (bool) ($submission['late'] ?? false),
            'time_created' => (int) ($submission['timecreated'] ?? 0),
            'time_modified' => (int) ($submission['timemodified'] ?? 0),
        ];
    }

    /**
     * Return a submission and ensure it belongs to the selected module.
     *
     * @param \cm_info $cm Workshop course module.
     * @param int $submissionid Submission id.
     * @return array
     */
    public static function get_submission(\cm_info $cm, int $submissionid): array {
        self::require_workshop_api();

        $result = \mod_workshop_external::get_submission($submissionid);
        $submission = (array) ($result['submission'] ?? []);
        if ((int) ($submission['workshopid'] ?? 0) !== (int) $cm->instance) {
            throw new \invalid_parameter_exception('submission_id must reference a submission in the selected workshop module.');
        }

        return self::submission_to_response($cm, $submission);
    }

    /**
     * Return an assessment and ensure it belongs to the selected module.
     *
     * @param \cm_info $cm Workshop course module.
     * @param int $assessmentid Assessment id.
     * @return array
     */
    public static function get_assessment(\cm_info $cm, int $assessmentid): array {
        self::require_workshop_api();

        $result = \mod_workshop_external::get_assessment($assessmentid);
        $assessment = (array) ($result['assessment'] ?? []);
        if (array_key_exists('workshopid', $assessment) && (int) $assessment['workshopid'] !== (int) $cm->instance) {
            throw new \invalid_parameter_exception('assessment_id must reference an assessment in the selected workshop module.');
        }
        if (!array_key_exists('workshopid', $assessment)) {
            $submissionid = (int) ($assessment['submissionid'] ?? 0);
            if ($submissionid <= 0) {
                throw new \invalid_parameter_exception('assessment_id must reference an assessment in the selected workshop module.');
            }
            self::get_submission($cm, $submissionid);
        }

        return self::assessment_to_response($cm, $assessment);
    }

    /**
     * Return a canonical workshop assessment response.
     *
     * @param \cm_info $cm Workshop course module.
     * @param array|\stdClass $assessment Moodle assessment payload.
     * @return array
     */
    public static function assessment_to_response(\cm_info $cm, $assessment): array {
        $assessment = (array) $assessment;

        return [
            'assessment_id' => (int) ($assessment['id'] ?? 0),
            'workshop_id' => (int) ($assessment['workshopid'] ?? $cm->instance),
            'module_id' => (int) $cm->id,
            'submission_id' => (int) ($assessment['submissionid'] ?? 0),
            'reviewer_id' => (int) ($assessment['reviewerid'] ?? 0),
            'weight' => (int) ($assessment['weight'] ?? 0),
            'grade' => self::optional_float($assessment, 'grade'),
            'grading_grade' => self::optional_float($assessment, 'gradinggrade'),
            'grading_grade_over' => self::optional_float($assessment, 'gradinggradeover'),
            'grading_grade_over_by' => (int) ($assessment['gradinggradeoverby'] ?? 0),
            'feedback_author' => (string) ($assessment['feedbackauthor'] ?? ''),
            'feedback_author_format' => self::format_from_constant((int) ($assessment['feedbackauthorformat'] ?? FORMAT_HTML)),
            'feedback_reviewer' => (string) ($assessment['feedbackreviewer'] ?? ''),
            'feedback_reviewer_format' => self::format_from_constant((int) ($assessment['feedbackreviewerformat'] ?? FORMAT_HTML)),
            'time_created' => (int) ($assessment['timecreated'] ?? 0),
            'time_modified' => (int) ($assessment['timemodified'] ?? 0),
        ];
    }

    /**
     * Return canonical workshop assessment response rows.
     *
     * @param \cm_info $cm Workshop course module.
     * @param mixed $assessments Moodle assessment rows.
     * @return array
     */
    public static function assessments_to_response(\cm_info $cm, $assessments): array {
        $items = [];
        foreach ((array) $assessments as $assessment) {
            $items[] = self::assessment_to_response($cm, $assessment);
        }

        return $items;
    }

    /**
     * Convert Moodle warning rows to the canonical response shape.
     *
     * @param mixed $warnings Moodle warning rows.
     * @return array
     */
    public static function warnings_to_response($warnings): array {
        $items = [];
        foreach ((array) $warnings as $warning) {
            $warning = (array) $warning;
            $items[] = [
                'item' => (string) ($warning['item'] ?? ''),
                'item_id' => (int) ($warning['itemid'] ?? $warning['item_id'] ?? 0),
                'warning_code' => (string) ($warning['warningcode'] ?? $warning['warning_code'] ?? ''),
                'message' => (string) ($warning['message'] ?? ''),
            ];
        }

        return $items;
    }

    /**
     * Encode flexible Moodle payloads as stable JSON strings.
     *
     * @param mixed $value Raw value.
     * @return string
     */
    public static function json_value($value): string {
        $encoded = json_encode($value, JSON_UNESCAPED_SLASHES);
        return $encoded === false ? '[]' : $encoded;
    }

    /**
     * Return a canonical workshop user plan response.
     *
     * @param \cm_info $cm Workshop course module.
     * @param int $userid User id.
     * @param array $result Moodle workshop external result.
     * @return array
     */
    public static function user_plan_to_response(\cm_info $cm, int $userid, array $result): array {
        $userplan = (array) ($result['userplan'] ?? []);
        $phases = [];
        foreach (($userplan['phases'] ?? []) as $phase) {
            $phase = (array) $phase;
            $tasks = [];
            foreach (($phase['tasks'] ?? []) as $task) {
                $task = (array) $task;
                $tasks[] = [
                    'code' => (string) ($task['code'] ?? ''),
                    'title' => (string) ($task['title'] ?? ''),
                    'link' => (string) ($task['link'] ?? ''),
                    'details' => (string) ($task['details'] ?? ''),
                    'completed' => self::completed_to_string($task['completed'] ?? ''),
                ];
            }

            $actions = [];
            foreach (($phase['actions'] ?? []) as $action) {
                $action = (array) $action;
                $actions[] = [
                    'type' => (string) ($action['type'] ?? ''),
                    'label' => (string) ($action['label'] ?? ''),
                    'url' => (string) ($action['url'] ?? ''),
                    'method' => (string) ($action['method'] ?? ''),
                ];
            }

            $phases[] = [
                'code' => (int) ($phase['code'] ?? 0),
                'title' => (string) ($phase['title'] ?? ''),
                'phase' => self::phase_from_constant((int) ($phase['code'] ?? 0)),
                'active' => (bool) ($phase['active'] ?? false),
                'task_count' => count($tasks),
                'tasks' => $tasks,
                'action_count' => count($actions),
                'actions' => $actions,
            ];
        }

        $examples = [];
        foreach (($userplan['examples'] ?? []) as $example) {
            $example = (array) $example;
            $examples[] = [
                'submission_id' => (int) ($example['id'] ?? 0),
                'title' => (string) ($example['title'] ?? ''),
                'assessment_id' => (int) ($example['assessmentid'] ?? 0),
                'grade' => self::optional_float($example, 'grade'),
                'grading_grade' => self::optional_float($example, 'gradinggrade'),
            ];
        }

        return [
            'module_id' => (int) $cm->id,
            'workshop_id' => (int) $cm->instance,
            'user_id' => (int) $userid,
            'phase_count' => count($phases),
            'phases' => $phases,
            'example_count' => count($examples),
            'examples' => $examples,
        ];
    }

    /**
     * Return a canonical workshop grades response.
     *
     * @param \cm_info $cm Workshop course module.
     * @param int $userid User id.
     * @param array $result Moodle workshop external result.
     * @return array
     */
    public static function grades_to_response(\cm_info $cm, int $userid, array $result): array {
        return [
            'module_id' => (int) $cm->id,
            'workshop_id' => (int) $cm->instance,
            'user_id' => (int) $userid,
            'submission_raw_grade' => self::optional_float($result, 'submissionrawgrade'),
            'submission_grade' => (string) ($result['submissionlongstrgrade'] ?? ''),
            'submission_grade_hidden' => (bool) ($result['submissiongradehidden'] ?? false),
            'assessment_raw_grade' => self::optional_float($result, 'assessmentrawgrade'),
            'assessment_grade' => (string) ($result['assessmentlongstrgrade'] ?? ''),
            'assessment_grade_hidden' => (bool) ($result['assessmentgradehidden'] ?? false),
        ];
    }

    /**
     * Return a canonical workshop grades report response.
     *
     * @param \cm_info $cm Workshop course module.
     * @param array $result Moodle workshop external result.
     * @param int $groupid Resolved group id.
     * @param string $sortby Sort field.
     * @param string $sortdirection Sort direction.
     * @param int $page Page number.
     * @param int $perpage Page size.
     * @return array
     */
    public static function grades_report_to_response(
        \cm_info $cm,
        array $result,
        int $groupid,
        string $sortby,
        string $sortdirection,
        int $page,
        int $perpage
    ): array {
        $report = (array) ($result['report'] ?? []);
        $grades = [];
        foreach (($report['grades'] ?? []) as $grade) {
            $grade = (array) $grade;
            $grades[] = [
                'user_id' => (int) ($grade['userid'] ?? 0),
                'submission_id' => (int) ($grade['submissionid'] ?? 0),
                'submission_title' => (string) ($grade['submissiontitle'] ?? ''),
                'submission_modified' => (int) ($grade['submissionmodified'] ?? 0),
                'submission_grade' => self::optional_float($grade, 'submissiongrade'),
                'grading_grade' => self::optional_float($grade, 'gradinggrade'),
                'submission_grade_over' => self::optional_float($grade, 'submissiongradeover'),
                'submission_grade_over_by' => (int) ($grade['submissiongradeoverby'] ?? 0),
                'submission_published' => (bool) ($grade['submissionpublished'] ?? false),
                'reviewed_by' => self::report_reviews_to_response($grade['reviewedby'] ?? []),
                'reviewer_of' => self::report_reviews_to_response($grade['reviewerof'] ?? []),
            ];
        }

        return [
            'module_id' => (int) $cm->id,
            'workshop_id' => (int) $cm->instance,
            'group_id' => (int) $groupid,
            'sort_by' => $sortby,
            'sort_direction' => $sortdirection,
            'page' => (int) $page,
            'per_page' => (int) $perpage,
            'total_count' => (int) ($report['totalcount'] ?? count($grades)),
            'count' => count($grades),
            'grades' => $grades,
        ];
    }

    /**
     * Return an optional float response value.
     *
     * @param array $data Payload.
     * @param string $key Key.
     * @return float
     */
    public static function optional_float(array $data, string $key): float {
        return isset($data[$key]) && is_scalar($data[$key]) ? (float) $data[$key] : 0.0;
    }

    /**
     * Return Moodle's flexible completion value as a stable string.
     *
     * @param mixed $completed Completion payload.
     * @return string
     */
    private static function completed_to_string($completed): string {
        if (is_bool($completed)) {
            return $completed ? 'true' : 'false';
        }
        if (is_scalar($completed)) {
            return (string) $completed;
        }

        return '';
    }

    /**
     * Return canonical assessment review rows for a grades report row.
     *
     * @param mixed $reviews Moodle review rows.
     * @return array
     */
    private static function report_reviews_to_response($reviews): array {
        $items = [];
        foreach ((array) $reviews as $review) {
            $review = (array) $review;
            $items[] = [
                'user_id' => (int) ($review['userid'] ?? 0),
                'assessment_id' => (int) ($review['assessmentid'] ?? 0),
                'submission_id' => (int) ($review['submissionid'] ?? 0),
                'grade' => self::optional_float($review, 'grade'),
                'grading_grade' => self::optional_float($review, 'gradinggrade'),
                'grading_grade_over' => self::optional_float($review, 'gradinggradeover'),
                'weight' => (int) ($review['weight'] ?? 0),
            ];
        }

        return $items;
    }
}
