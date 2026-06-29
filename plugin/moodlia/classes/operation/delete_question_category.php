<?php
// This file is part of Moodle - https://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

/**
 * Delete question category operation.
 *
 * @package    local_moodlia
 * @copyright  2026
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace local_moodlia\operation;

defined('MOODLE_INTERNAL') || die();

/**
 * Deletes a Moodle question category through Moodle question APIs.
 */
class delete_question_category {
    /**
     * Execute the operation.
     *
     * @param int $categoryid Question category id.
     * @param string $deletemode Delete mode.
     * @return array
     */
    public static function execute(int $categoryid, string $deletemode = 'delete'): array {
        if ($deletemode !== 'delete') {
            throw new \invalid_parameter_exception('Only delete_mode=delete is currently supported.');
        }

        question_tools::category_manager()->delete_category($categoryid);

        return [
            'deleted' => true,
            'id' => $categoryid,
        ];
    }
}
