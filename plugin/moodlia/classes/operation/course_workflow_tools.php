<?php
// This file is part of Moodle - https://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

/**
 * Course workflow helpers.
 *
 * @package    local_moodlia
 * @copyright  2026
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace local_moodlia\operation;

defined('MOODLE_INTERNAL') || die();

/**
 * High-level course workflow helpers built on canonical operations.
 */
class course_workflow_tools {
    /** @var array Supported publishing states. */
    public const PUBLISH_STATES = ['draft', 'ready', 'published', 'archived'];

    /** @var array Supported module types for course blueprints. */
    public const MODULE_TYPES = [
        'assign',
        'book',
        'choice',
        'data',
        'feedback',
        'lesson',
        'lti',
        'page',
        'folder',
        'forum',
        'glossary',
        'label',
        'qbank',
        'quiz',
        'resource',
        'subsection',
        'url',
        'wiki',
        'workshop',
    ];

    /** @var array Supported role archetypes for course workflow enrolments. */
    public const ROLE_ARCHETYPES = ['student', 'teacher', 'editingteacher'];

    /**
     * Decode a JSON object parameter.
     *
     * @param string $json JSON object.
     * @param string $name Parameter name.
     * @return array
     */
    public static function decode_object(string $json, string $name): array {
        $decoded = json_decode($json, true);
        if (!is_array($decoded) || array_is_list($decoded)) {
            throw new \invalid_parameter_exception($name . ' must be a JSON object.');
        }

        return $decoded;
    }

    /**
     * Decode a JSON array parameter.
     *
     * @param string $json JSON array.
     * @param string $name Parameter name.
     * @return array
     */
    public static function decode_array(string $json, string $name): array {
        $decoded = json_decode($json, true);
        if (!is_array($decoded) || !array_is_list($decoded)) {
            throw new \invalid_parameter_exception($name . ' must be a JSON array.');
        }

        return $decoded;
    }

    /**
     * Encode a response fragment as JSON.
     *
     * @param mixed $value Value to encode.
     * @return string
     */
    public static function encode_json($value): string {
        return json_encode($value, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    }

    /**
     * Create a course from a portable MoodlIA blueprint.
     *
     * @param array $blueprint Blueprint object.
     * @param callable|null $coursewritevalidator Optional validator called with the created course id before workflow writes.
     * @return array
     */
    public static function create_from_blueprint(array $blueprint, ?callable $coursewritevalidator = null): array {
        self::validate_blueprint($blueprint, true, true);
        $courseinput = self::course_input($blueprint);
        $publishstate = self::normalise_publish_state((string) ($blueprint['publish_state'] ?? 'draft'));
        $courseinput['visible'] = self::visible_for_state($publishstate, (bool) ($courseinput['visible'] ?? false));

        $course = create_course::execute(
            (string) $courseinput['fullname'],
            (string) $courseinput['shortname'],
            (int) ($courseinput['category_id'] ?? 0),
            (bool) $courseinput['visible'],
            (string) ($courseinput['summary'] ?? ''),
            (string) ($courseinput['summary_format'] ?? 'html'),
            (string) ($courseinput['course_format'] ?? 'topics'),
            (bool) ($courseinput['enable_completion'] ?? false),
            (int) ($courseinput['start_date'] ?? 0),
            (int) ($courseinput['end_date'] ?? 0)
        );

        $applied = [
            'sections' => [],
            'modules' => [],
            'groups' => [],
            'enrolments' => [],
            'warnings' => [],
        ];
        if (self::blueprint_has_workflow($blueprint)) {
            if ($coursewritevalidator !== null) {
                $coursewritevalidator((int) $course['course_id'], $blueprint);
            }
            $applied = self::apply_to_course((int) $course['course_id'], $blueprint);
        }
        $published = set_course_publish_state::execute((int) $course['course_id'], $publishstate);

        return [
            'course_id' => (int) $course['course_id'],
            'publish_state' => $publishstate,
            'course_json' => $published['course_json'],
            'sections_json' => self::encode_json($applied['sections']),
            'modules_json' => self::encode_json($applied['modules']),
            'groups_json' => self::encode_json($applied['groups']),
            'enrolments_json' => self::encode_json($applied['enrolments']),
            'warnings_json' => self::encode_json($applied['warnings']),
        ];
    }

    /**
     * Apply a portable blueprint to an existing course.
     *
     * @param int $courseid Moodle course id.
     * @param array $blueprint Blueprint object.
     * @return array
     */
    public static function apply_to_course(int $courseid, array $blueprint): array {
        course_tools::get_course($courseid);
        self::validate_blueprint($blueprint, false, false);

        $createdsections = [];
        $createdmodules = [];
        $createdgroups = [];
        $enrolments = [];
        $warnings = [];

        foreach (self::list_or_empty($blueprint['sections'] ?? []) as $section) {
            $sectionresponse = create_section::execute(
                $courseid,
                (string) ($section['name'] ?? 'Generated section'),
                (string) ($section['summary'] ?? ''),
                0,
                (bool) ($section['visible'] ?? true)
            );
            $createdsections[] = $sectionresponse;
            $sectionnumber = (int) $sectionresponse['section_number'];

            foreach (self::list_or_empty($section['modules'] ?? []) as $module) {
                try {
                    $createdmodules[] = create_module::execute(
                        $courseid,
                        $sectionnumber,
                        (string) ($module['module_type'] ?? ''),
                        (string) ($module['name'] ?? ''),
                        self::array_or_empty($module['options'] ?? [])
                    );
                } catch (\Throwable $error) {
                    $warnings[] = [
                        'type' => 'module',
                        'name' => (string) ($module['name'] ?? ''),
                        'module_type' => (string) ($module['module_type'] ?? ''),
                        'message' => $error->getMessage(),
                    ];
                }
            }
        }

        foreach (self::list_or_empty($blueprint['groups'] ?? []) as $group) {
            try {
                $createdgroups[] = create_group::execute(
                    $courseid,
                    (string) ($group['name'] ?? ''),
                    (string) ($group['description'] ?? ''),
                    (string) ($group['idnumber'] ?? '')
                );
            } catch (\Throwable $error) {
                $warnings[] = [
                    'type' => 'group',
                    'name' => (string) ($group['name'] ?? ''),
                    'message' => $error->getMessage(),
                ];
            }
        }

        foreach (self::list_or_empty($blueprint['enrolments'] ?? []) as $enrolment) {
            try {
                $enrolments[] = enrol_user::execute(
                    $courseid,
                    (int) ($enrolment['user_id'] ?? 0),
                    (string) ($enrolment['role_archetype'] ?? 'student')
                );
            } catch (\Throwable $error) {
                $warnings[] = [
                    'type' => 'enrolment',
                    'user_id' => (int) ($enrolment['user_id'] ?? 0),
                    'message' => $error->getMessage(),
                ];
            }
        }

        return [
            'course_id' => $courseid,
            'sections' => $createdsections,
            'modules' => $createdmodules,
            'groups' => $createdgroups,
            'enrolments' => $enrolments,
            'warnings' => $warnings,
        ];
    }

    /**
     * Export a course as a portable MoodlIA blueprint.
     *
     * @param int $courseid Moodle course id.
     * @param bool $includecontents Whether to include sections and module shells.
     * @param bool $includegroups Whether to include groups.
     * @return array
     */
    public static function export_blueprint(int $courseid, bool $includecontents = true, bool $includegroups = true): array {
        $course = course_tools::to_response(course_tools::get_course($courseid));
        $blueprint = [
            'version' => 1,
            'course' => [
                'fullname' => $course['fullname'],
                'shortname' => $course['shortname'],
                'category_id' => $course['category_id'],
                'visible' => $course['visible'],
                'summary' => $course['summary'],
                'summary_format' => $course['summary_format'],
                'course_format' => $course['format'],
                'enable_completion' => $course['enable_completion'],
                'start_date' => $course['start_date'],
                'end_date' => $course['end_date'],
            ],
            'publish_state' => self::state_from_course($course),
            'sections' => [],
            'groups' => [],
            'enrolments' => [],
        ];

        if ($includecontents) {
            $contents = get_course_contents::execute($courseid);
            foreach ($contents['sections'] as $section) {
                if ((int) $section['section_number'] === 0) {
                    continue;
                }
                $modules = [];
                foreach ($section['modules'] as $module) {
                    $modules[] = [
                        'module_type' => $module['module_type'],
                        'name' => $module['name'],
                        'options' => [
                            'visible' => (bool) $module['visible'],
                            'visible_on_course_page' => (bool) $module['visible_on_course_page'],
                        ],
                    ];
                }
                $blueprint['sections'][] = [
                    'name' => $section['name'],
                    'summary' => $section['summary'],
                    'visible' => (bool) $section['visible'],
                    'modules' => $modules,
                ];
            }
        }

        if ($includegroups) {
            foreach (get_groups::execute($courseid)['groups'] as $group) {
                $blueprint['groups'][] = [
                    'name' => $group['name'],
                    'description' => $group['description'],
                    'idnumber' => $group['idnumber'],
                ];
            }
        }

        return $blueprint;
    }

    /**
     * Return basic quality issues for a course.
     *
     * @param int $courseid Moodle course id.
     * @return array
     */
    public static function audit_course(int $courseid): array {
        $course = course_tools::to_response(course_tools::get_course($courseid));
        $contents = get_course_contents::execute($courseid);
        $enrolled = get_enrolled_users::execute($courseid);
        $issues = [];

        if (!$course['visible']) {
            $issues[] = self::issue('warning', 'course_hidden', 'Course is hidden.');
        }
        if (trim(strip_tags((string) $course['summary'])) === '') {
            $issues[] = self::issue('warning', 'course_summary_empty', 'Course summary is empty.');
        }
        if (!$course['enable_completion']) {
            $issues[] = self::issue('info', 'completion_disabled', 'Course completion tracking is disabled.');
        }
        if (empty($enrolled['users'])) {
            $issues[] = self::issue('warning', 'no_enrolled_users', 'Course has no enrolled users visible to this token.');
        }

        $activitycount = 0;
        $teachablesections = 0;
        foreach ($contents['sections'] as $section) {
            if ((int) $section['section_number'] === 0) {
                continue;
            }
            $teachablesections++;
            $modules = $section['modules'] ?? [];
            $activitycount += count($modules);
            if (count($modules) === 0) {
                $issues[] = self::issue(
                    'warning',
                    'section_empty',
                    'Section has no activities.',
                    ['section_number' => (int) $section['section_number']]
                );
            }
        }

        if ($teachablesections === 0) {
            $issues[] = self::issue('error', 'no_teachable_sections', 'Course has no teaching sections.');
        }
        if ($activitycount === 0) {
            $issues[] = self::issue('error', 'no_activities', 'Course has no activities.');
        }

        return [
            'course_id' => $courseid,
            'ready' => !array_filter($issues, static fn($issue) => $issue['severity'] === 'error'),
            'issue_count' => count($issues),
            'issues' => $issues,
        ];
    }

    /**
     * Convert a publish state to visibility.
     *
     * @param string $state Publish state.
     * @param bool $fallback Fallback visibility.
     * @return bool
     */
    public static function visible_for_state(string $state, bool $fallback = false): bool {
        $state = self::normalise_publish_state($state);
        if ($state === 'published') {
            return true;
        }
        if (in_array($state, ['draft', 'ready', 'archived'], true)) {
            return false;
        }
        return $fallback;
    }

    /**
     * Validate a publish state.
     *
     * @param string $state Publish state.
     * @return string
     */
    public static function normalise_publish_state(string $state): string {
        $state = clean_param(trim($state), PARAM_ALPHA);
        if (!in_array($state, self::PUBLISH_STATES, true)) {
            throw new \invalid_parameter_exception('publish_state must be one of: draft, ready, published, archived.');
        }

        return $state;
    }

    /**
     * Validate a portable course blueprint before applying side effects.
     *
     * @param array $blueprint Blueprint object.
     * @param bool $requirecourse Whether course metadata is required.
     * @param bool $allowemptyworkflow Whether sections, groups, and enrolments may all be empty.
     */
    public static function validate_blueprint(
        array $blueprint,
        bool $requirecourse = false,
        bool $allowemptyworkflow = false
    ): void {
        if ($requirecourse) {
            self::course_input($blueprint);
        }
        if (array_key_exists('publish_state', $blueprint)) {
            self::normalise_publish_state((string) $blueprint['publish_state']);
        }

        $sections = self::validated_list_field($blueprint, 'sections');
        $groups = self::validated_list_field($blueprint, 'groups');
        $enrolments = self::validated_list_field($blueprint, 'enrolments');
        $hasworkflow = !empty($sections) || !empty($groups) || !empty($enrolments);
        if (!$allowemptyworkflow && !$hasworkflow) {
            throw new \invalid_parameter_exception(
                'blueprint must include at least one section, group, or enrolment.'
            );
        }

        foreach ($sections as $sectionindex => $section) {
            if (!is_array($section) || array_is_list($section)) {
                throw new \invalid_parameter_exception(
                    'blueprint.sections[' . $sectionindex . '] must be a JSON object.'
                );
            }
            if (trim((string) ($section['name'] ?? '')) === '') {
                throw new \invalid_parameter_exception(
                    'blueprint.sections[' . $sectionindex . '].name is required.'
                );
            }
            if (array_key_exists('modules', $section)
                    && (!is_array($section['modules']) || !array_is_list($section['modules']))) {
                throw new \invalid_parameter_exception(
                    'blueprint.sections[' . $sectionindex . '].modules must be a JSON array.'
                );
            }

            foreach (self::list_or_empty($section['modules'] ?? []) as $moduleindex => $module) {
                self::validate_blueprint_module($module, $sectionindex, $moduleindex);
            }
        }

        foreach ($groups as $groupindex => $group) {
            if (!is_array($group) || array_is_list($group)) {
                throw new \invalid_parameter_exception(
                    'blueprint.groups[' . $groupindex . '] must be a JSON object.'
                );
            }
            if (trim((string) ($group['name'] ?? '')) === '') {
                throw new \invalid_parameter_exception('blueprint.groups[' . $groupindex . '].name is required.');
            }
        }

        self::validate_enrolments($enrolments, 'blueprint.enrolments');
    }

    /**
     * Validate enrolment payloads before attempting writes.
     *
     * @param array $enrolments Enrolment list.
     * @param string $prefix Error path prefix.
     */
    public static function validate_enrolments(array $enrolments, string $prefix = 'enrolments'): void {
        foreach ($enrolments as $index => $enrolment) {
            if (!is_array($enrolment) || array_is_list($enrolment)) {
                throw new \invalid_parameter_exception($prefix . '[' . $index . '] must be a JSON object.');
            }
            if (self::positive_integer_value($enrolment['user_id'] ?? null) === null) {
                throw new \invalid_parameter_exception($prefix . '[' . $index . '].user_id must be a positive integer.');
            }

            $role = (string) ($enrolment['role_archetype'] ?? 'student');
            if (!in_array($role, self::ROLE_ARCHETYPES, true)) {
                throw new \invalid_parameter_exception(
                    $prefix . '[' . $index . '].role_archetype must be one of: student, teacher, editingteacher.'
                );
            }
        }
    }

    /**
     * Infer the public state from course metadata.
     *
     * @param array $course Course response.
     * @return string
     */
    private static function state_from_course(array $course): string {
        if ((bool) $course['visible']) {
            return 'published';
        }
        if ((int) ($course['end_date'] ?? 0) > 0 && (int) $course['end_date'] < time()) {
            return 'archived';
        }
        return 'draft';
    }

    /**
     * Validate a blueprint module object.
     *
     * @param mixed $module Module value.
     * @param int $sectionindex Section index.
     * @param int $moduleindex Module index.
     */
    private static function validate_blueprint_module($module, int $sectionindex, int $moduleindex): void {
        $prefix = 'blueprint.sections[' . $sectionindex . '].modules[' . $moduleindex . ']';
        if (!is_array($module) || array_is_list($module)) {
            throw new \invalid_parameter_exception($prefix . ' must be a JSON object.');
        }

        $moduletype = clean_param((string) ($module['module_type'] ?? ''), PARAM_PLUGIN);
        if (!in_array($moduletype, self::MODULE_TYPES, true)) {
            throw new \invalid_parameter_exception($prefix . '.module_type is unsupported.');
        }
        if (trim((string) ($module['name'] ?? '')) === '') {
            throw new \invalid_parameter_exception($prefix . '.name is required.');
        }
        if (array_key_exists('options', $module)
                && (!is_array($module['options']) || array_is_list($module['options']))) {
            throw new \invalid_parameter_exception($prefix . '.options must be a JSON object.');
        }
    }

    /**
     * Return a validated list field from a blueprint.
     *
     * @param array $blueprint Blueprint object.
     * @param string $field Field name.
     * @return array
     */
    private static function validated_list_field(array $blueprint, string $field): array {
        if (!array_key_exists($field, $blueprint)) {
            return [];
        }
        if (!is_array($blueprint[$field]) || !array_is_list($blueprint[$field])) {
            throw new \invalid_parameter_exception('blueprint.' . $field . ' must be a JSON array.');
        }

        return $blueprint[$field];
    }

    /**
     * Return whether a blueprint contains writeable course workflow items.
     *
     * @param array $blueprint Blueprint object.
     * @return bool
     */
    private static function blueprint_has_workflow(array $blueprint): bool {
        return !empty(self::validated_list_field($blueprint, 'sections'))
            || !empty(self::validated_list_field($blueprint, 'groups'))
            || !empty(self::validated_list_field($blueprint, 'enrolments'));
    }

    /**
     * Return a positive integer value when the input is strictly integer-like.
     *
     * @param mixed $value Input value.
     * @return int|null
     */
    private static function positive_integer_value($value): ?int {
        if (is_int($value) && $value > 0) {
            return $value;
        }
        if (is_string($value) && preg_match('/^[1-9][0-9]*$/', trim($value))) {
            return (int) trim($value);
        }

        return null;
    }

    /**
     * Return course input from root or nested course key.
     *
     * @param array $blueprint Blueprint object.
     * @return array
     */
    private static function course_input(array $blueprint): array {
        $course = self::array_or_empty($blueprint['course'] ?? $blueprint);
        foreach (['fullname', 'shortname'] as $field) {
            if (trim((string) ($course[$field] ?? '')) === '') {
                throw new \invalid_parameter_exception('blueprint.course.' . $field . ' is required.');
            }
        }

        return $course;
    }

    /**
     * Return a list value or an empty list.
     *
     * @param mixed $value Input value.
     * @return array
     */
    private static function list_or_empty($value): array {
        return is_array($value) && array_is_list($value) ? $value : [];
    }

    /**
     * Return an object-like array or an empty array.
     *
     * @param mixed $value Input value.
     * @return array
     */
    private static function array_or_empty($value): array {
        return is_array($value) && !array_is_list($value) ? $value : [];
    }

    /**
     * Build an audit issue.
     *
     * @param string $severity Issue severity.
     * @param string $code Issue code.
     * @param string $message Human-readable message.
     * @param array $details Extra details.
     * @return array
     */
    private static function issue(string $severity, string $code, string $message, array $details = []): array {
        return [
            'severity' => $severity,
            'code' => $code,
            'message' => $message,
            'details' => $details,
        ];
    }
}
