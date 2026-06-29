<?php
// This file is part of Moodle - https://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

/**
 * Shared feedback helpers.
 *
 * @package    local_moodlia
 * @copyright  2026
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace local_moodlia\operation;

defined('MOODLE_INTERNAL') || die();

/**
 * Helper methods for Moodle Feedback operations.
 */
class feedback_tools {
    /**
     * Load Moodle feedback APIs.
     */
    public static function require_feedback_api(): void {
        global $CFG;

        require_once($CFG->dirroot . '/mod/feedback/lib.php');
        require_once($CFG->dirroot . '/mod/feedback/classes/external.php');
    }

    /**
     * Verify that a course module belongs to a feedback activity.
     *
     * @param \stdClass $course Moodle course.
     * @param int $cmid Course module id.
     * @return \cm_info
     */
    public static function get_feedback_module(\stdClass $course, int $cmid): \cm_info {
        $cm = module_tools::get_course_module($course, $cmid);
        if ($cm->modname !== 'feedback') {
            throw new \invalid_parameter_exception('module_id must reference a feedback activity.');
        }

        return $cm;
    }

    /**
     * Return feedback items exposed through Moodle's feedback external API.
     *
     * @param \cm_info $cm Feedback course module.
     * @return array
     */
    public static function get_items(\cm_info $cm): array {
        self::require_feedback_api();

        $result = \mod_feedback_external::get_items((int) $cm->instance, 0);
        $items = [];
        foreach (($result['items'] ?? []) as $item) {
            $items[] = self::item_to_response($cm, (array) $item);
        }

        return $items;
    }

    /**
     * Return one feedback page through Moodle's external API.
     *
     * @param \cm_info $cm Feedback course module.
     * @param int $page Zero-based page number.
     * @return array
     */
    public static function get_page_items(\cm_info $cm, int $page): array {
        self::require_feedback_api();

        if ($page < 0) {
            throw new \invalid_parameter_exception('page must be zero or greater.');
        }

        $result = \mod_feedback_external::get_page_items((int) $cm->instance, $page, 0);
        return self::page_items_to_response($cm, $page, $result);
    }

    /**
     * Return feedback analysis through Moodle's external API.
     *
     * @param \cm_info $cm Feedback course module.
     * @param int $groupid Moodle group id.
     * @return array
     */
    public static function get_analysis(\cm_info $cm, int $groupid = 0): array {
        self::require_feedback_api();

        $groupid = max(0, $groupid);
        $result = \mod_feedback_external::get_analysis((int) $cm->instance, $groupid, 0);
        return self::analysis_to_response($cm, $groupid, $result);
    }

    /**
     * Return current user's finished feedback responses through Moodle's external API.
     *
     * @param \cm_info $cm Feedback course module.
     * @return array
     */
    public static function get_finished_responses(\cm_info $cm): array {
        self::require_feedback_api();

        $result = \mod_feedback_external::get_finished_responses((int) $cm->instance, 0);
        return self::finished_responses_to_response($cm, $result);
    }

    /**
     * Return one feedback item visible in a course module.
     *
     * @param \cm_info $cm Feedback course module.
     * @param int $itemid Feedback item id.
     * @return array
     */
    public static function get_item(\cm_info $cm, int $itemid): array {
        if ($itemid <= 0) {
            throw new \invalid_parameter_exception('item_id must be a positive integer.');
        }

        foreach (self::get_items($cm) as $item) {
            if ((int) $item['item_id'] === $itemid) {
                return $item;
            }
        }

        throw new \moodle_exception('invaliditemid', 'feedback');
    }

    /**
     * Convert Moodle external warnings to the canonical response shape.
     *
     * @param array $warnings Moodle warnings.
     * @return array
     */
    public static function warnings_to_response(array $warnings): array {
        $items = [];
        foreach ($warnings as $warning) {
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
     * Convert a Moodle feedback summary payload to the canonical response shape.
     *
     * @param array $feedback Moodle feedback summary payload.
     * @return array
     */
    public static function summary_to_response(array $feedback): array {
        $moduleid = (int) ($feedback['coursemodule'] ?? $feedback['cmid'] ?? 0);
        $url = $moduleid > 0 ? (new \moodle_url('/mod/feedback/view.php', ['id' => $moduleid]))->out(false) : '';

        return [
            'feedback_id' => (int) ($feedback['id'] ?? 0),
            'module_id' => $moduleid,
            'course_id' => (int) ($feedback['course'] ?? 0),
            'name' => (string) ($feedback['name'] ?? ''),
            'intro' => (string) ($feedback['intro'] ?? ''),
            'intro_format' => (int) ($feedback['introformat'] ?? FORMAT_MOODLE),
            'language' => (string) ($feedback['lang'] ?? ''),
            'anonymous' => (int) ($feedback['anonymous'] ?? 0),
            'email_notification' => (bool) ($feedback['email_notification'] ?? false),
            'multiple_submit' => (bool) ($feedback['multiple_submit'] ?? false),
            'auto_numbering' => (bool) ($feedback['autonumbering'] ?? false),
            'site_after_submit' => (string) ($feedback['site_after_submit'] ?? ''),
            'page_after_submit' => (string) ($feedback['page_after_submit'] ?? ''),
            'page_after_submit_format' => (int) ($feedback['page_after_submitformat'] ?? FORMAT_MOODLE),
            'publish_stats' => (bool) ($feedback['publish_stats'] ?? false),
            'time_open' => (int) ($feedback['timeopen'] ?? 0),
            'time_close' => (int) ($feedback['timeclose'] ?? 0),
            'time_modified' => (int) ($feedback['timemodified'] ?? 0),
            'completion_submit' => (bool) ($feedback['completionsubmit'] ?? false),
            'url' => $url,
        ];
    }

    /**
     * Convert Moodle feedback course listing to the canonical response shape.
     *
     * @param \stdClass $course Moodle course.
     * @param array $result Moodle external result.
     * @return array
     */
    public static function course_feedbacks_to_response(\stdClass $course, array $result): array {
        $items = [];
        foreach (($result['feedbacks'] ?? []) as $feedback) {
            $summary = self::summary_to_response((array) $feedback);
            if ((int) $summary['course_id'] === (int) $course->id) {
                $items[] = $summary;
            }
        }

        return [
            'course_id' => (int) $course->id,
            'count' => count($items),
            'feedbacks' => $items,
            'warnings' => self::warnings_to_response($result['warnings'] ?? []),
        ];
    }

    /**
     * Convert Moodle feedback access information to the canonical response shape.
     *
     * @param \cm_info $cm Feedback course module.
     * @param array $result Moodle external result.
     * @return array
     */
    public static function access_to_response(\cm_info $cm, array $result): array {
        return [
            'feedback_id' => (int) $cm->instance,
            'module_id' => (int) $cm->id,
            'can_view_analysis' => (bool) ($result['canviewanalysis'] ?? false),
            'can_complete' => (bool) ($result['cancomplete'] ?? false),
            'can_submit' => (bool) ($result['cansubmit'] ?? false),
            'can_delete_submissions' => (bool) ($result['candeletesubmissions'] ?? false),
            'can_view_reports' => (bool) ($result['canviewreports'] ?? false),
            'can_edit_items' => (bool) ($result['canedititems'] ?? false),
            'is_empty' => (bool) ($result['isempty'] ?? false),
            'is_open' => (bool) ($result['isopen'] ?? false),
            'is_already_submitted' => (bool) ($result['isalreadysubmitted'] ?? false),
            'is_anonymous' => (bool) ($result['isanonymous'] ?? false),
            'warnings' => self::warnings_to_response($result['warnings'] ?? []),
        ];
    }

    /**
     * Convert a Moodle feedback item payload to the canonical response shape.
     *
     * @param \cm_info $cm Feedback course module.
     * @param array $item Moodle feedback item payload.
     * @return array
     */
    public static function item_to_response(\cm_info $cm, array $item): array {
        return [
            'item_id' => (int) ($item['id'] ?? 0),
            'feedback_id' => (int) $cm->instance,
            'module_id' => (int) $cm->id,
            'name' => (string) ($item['name'] ?? ''),
            'name_format' => (int) ($item['nameformat'] ?? FORMAT_HTML),
            'label' => (string) ($item['label'] ?? ''),
            'presentation' => (string) ($item['presentation'] ?? ''),
            'presentation_format' => (int) ($item['presentationformat'] ?? FORMAT_HTML),
            'type' => (string) ($item['typ'] ?? ''),
            'has_value' => (bool) ($item['hasvalue'] ?? false),
            'position' => (int) ($item['position'] ?? 0),
            'item_number' => (int) ($item['itemnumber'] ?? 0),
            'required' => (bool) ($item['required'] ?? false),
            'depend_item_id' => (int) ($item['dependitem'] ?? 0),
            'depend_value' => (string) ($item['dependvalue'] ?? ''),
            'options' => (string) ($item['options'] ?? ''),
            'other_data' => self::string_value($item['otherdata'] ?? ''),
        ];
    }

    /**
     * Convert a Moodle feedback page payload to the canonical response shape.
     *
     * @param \cm_info $cm Feedback course module.
     * @param int $page Zero-based page number.
     * @param array $result Moodle page items result.
     * @return array
     */
    public static function page_items_to_response(\cm_info $cm, int $page, array $result): array {
        $items = [];
        foreach (($result['items'] ?? []) as $item) {
            $items[] = self::item_to_response($cm, (array) $item);
        }

        return [
            'feedback_id' => (int) $cm->instance,
            'module_id' => (int) $cm->id,
            'page' => max(0, $page),
            'count' => count($items),
            'has_previous_page' => (bool) ($result['hasprevpage'] ?? false),
            'has_next_page' => (bool) ($result['hasnextpage'] ?? false),
            'items' => $items,
            'warnings' => self::warnings_to_response($result['warnings'] ?? []),
        ];
    }

    /**
     * Convert a Moodle feedback analysis payload to the canonical response shape.
     *
     * @param \cm_info $cm Feedback course module.
     * @param int $groupid Moodle group id.
     * @param array $result Moodle analysis result.
     * @return array
     */
    public static function analysis_to_response(\cm_info $cm, int $groupid, array $result): array {
        $items = [];
        foreach (($result['itemsdata'] ?? []) as $entry) {
            $entry = (array) $entry;
            $items[] = [
                'item' => self::item_to_response($cm, (array) ($entry['item'] ?? [])),
                'data_json' => self::json_value($entry['data'] ?? []),
            ];
        }

        return [
            'feedback_id' => (int) $cm->instance,
            'module_id' => (int) $cm->id,
            'group_id' => max(0, $groupid),
            'completed_count' => (int) ($result['completedcount'] ?? 0),
            'items_count' => (int) ($result['itemscount'] ?? 0),
            'items_data' => $items,
            'warnings' => self::warnings_to_response($result['warnings'] ?? []),
        ];
    }

    /**
     * Convert Moodle feedback response values to the canonical response shape.
     *
     * @param \cm_info $cm Feedback course module.
     * @param array $result Moodle finished responses result.
     * @return array
     */
    public static function finished_responses_to_response(\cm_info $cm, array $result): array {
        $responses = [];
        foreach (($result['responses'] ?? []) as $response) {
            $item = (array) $response;
            $responses[] = [
                'response_id' => (int) ($item['id'] ?? 0),
                'name' => (string) ($item['name'] ?? ''),
                'print_value' => (string) ($item['printval'] ?? ''),
                'raw_value' => (string) ($item['rawval'] ?? ''),
            ];
        }

        return [
            'feedback_id' => (int) $cm->instance,
            'module_id' => (int) $cm->id,
            'count' => count($responses),
            'responses' => $responses,
            'warnings' => self::warnings_to_response($result['warnings'] ?? []),
        ];
    }

    /**
     * Convert a Moodle value to a stable string response.
     *
     * @param mixed $value Moodle value.
     * @return string
     */
    private static function string_value($value): string {
        if (is_scalar($value) || $value === null) {
            return (string) $value;
        }

        $encoded = json_encode($value, JSON_UNESCAPED_SLASHES);
        return $encoded === false ? '' : $encoded;
    }

    /**
     * Encode flexible Moodle payloads as stable JSON strings.
     *
     * @param mixed $value Raw value.
     * @return string
     */
    private static function json_value($value): string {
        $encoded = json_encode($value, JSON_UNESCAPED_SLASHES);
        return $encoded === false ? '[]' : $encoded;
    }
}
