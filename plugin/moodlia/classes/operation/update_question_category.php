<?php
// This file is part of Moodle - https://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

/**
 * Update question category operation.
 *
 * @package    local_moodlia
 * @copyright  2026
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace local_moodlia\operation;

defined('MOODLE_INTERNAL') || die();

/**
 * Updates a Moodle question category through Moodle question APIs.
 */
class update_question_category {
    /**
     * Execute the operation.
     *
     * @param int $categoryid Question category id.
     * @param string|null $name Category name.
     * @param string|null $description Category description.
     * @return array
     */
    public static function execute(int $categoryid, ?string $name = null, ?string $description = null): array {
        if ($name === null || trim($name) === '') {
            throw new \invalid_parameter_exception('name is required for the current update_question_category implementation.');
        }

        question_tools::category_manager()->update_category(
            $categoryid,
            '',
            trim($name),
            $description,
            FORMAT_HTML
        );

        return [
            'category_id' => $categoryid,
            'name' => trim($name),
        ];
    }
}
