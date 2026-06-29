<?php
// This file is part of Moodle - https://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

/**
 * Shared gradebook helpers.
 *
 * @package    local_moodlia
 * @copyright  2026
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace local_moodlia\operation;

defined('MOODLE_INTERNAL') || die();

/**
 * Helper methods for Moodle gradebook operations.
 */
class gradebook_tools {
    /**
     * Load Moodle gradebook APIs.
     */
    public static function require_gradebook_api(): void {
        global $CFG;

        require_once($CFG->libdir . '/gradelib.php');
    }

    /**
     * Convert Moodle grade item data to the canonical response shape.
     *
     * @param mixed $item Moodle grade item payload.
     * @return array
     */
    public static function grade_item_to_response($item): array {
        $item = self::to_array($item);

        return [
            'item_id' => (int) ($item['id'] ?? 0),
            'name' => (string) ($item['itemname'] ?? ''),
            'category' => (string) ($item['category'] ?? ''),
        ];
    }

    /**
     * Convert Moodle user grade item data to the canonical response shape.
     *
     * @param mixed $item Moodle user grade item payload.
     * @return array
     */
    public static function user_grade_item_to_response($item): array {
        $item = self::to_array($item);
        $graderaw = $item['graderaw'] ?? null;

        return [
            'item_id' => (int) ($item['id'] ?? 0),
            'name' => (string) ($item['itemname'] ?? ''),
            'item_type' => (string) ($item['itemtype'] ?? ''),
            'item_module' => (string) ($item['itemmodule'] ?? ''),
            'item_instance' => (int) ($item['iteminstance'] ?? 0),
            'course_module_id' => (int) ($item['cmid'] ?? 0),
            'grade_raw' => $graderaw === null ? 0.0 : (float) $graderaw,
            'grade_formatted' => (string) ($item['gradeformatted'] ?? ''),
            'grade_min' => (float) ($item['grademin'] ?? 0),
            'grade_max' => (float) ($item['grademax'] ?? 0),
            'range_formatted' => (string) ($item['rangeformatted'] ?? ''),
            'percentage_formatted' => (string) ($item['percentageformatted'] ?? ''),
            'feedback' => (string) ($item['feedback'] ?? ''),
            'hidden' => (bool) ($item['gradeishidden'] ?? false),
            'locked' => (bool) ($item['gradeislocked'] ?? false),
        ];
    }

    /**
     * Throw when Moodle returns external API warnings.
     *
     * @param array $warnings Moodle warning payloads.
     */
    public static function fail_on_warnings(array $warnings): void {
        if (empty($warnings)) {
            return;
        }

        $warning = self::to_array(reset($warnings));
        $message = (string) ($warning['message'] ?? $warning['warningcode'] ?? 'Moodle gradebook operation returned warnings.');
        throw new \moodle_exception('error', 'local_moodlia', '', null, $message);
    }

    /**
     * Convert objects and nested arrays to arrays.
     *
     * @param mixed $value Value to convert.
     * @return array
     */
    private static function to_array($value): array {
        if (is_array($value)) {
            return array_map(static function($item) {
                return is_object($item) || is_array($item) ? self::to_array($item) : $item;
            }, $value);
        }

        if (is_object($value)) {
            return self::to_array(get_object_vars($value));
        }

        return [];
    }
}
