import { loadContract, toRestFunctionName } from '../tests/helpers/contract.mjs';
import { callRestFunction } from '../tests/helpers/moodle-rest.mjs';

const contract = await loadContract();
const fixtureNamePattern = /^MoodlIA Restricted Permission /;

function restName(operationName) {
  return toRestFunctionName(contract, operationName);
}

async function call(operationName, parameters = {}) {
  return callRestFunction(restName(operationName), parameters);
}

function normalizeCourse(course) {
  return {
    course_id: Number(course.course_id ?? course.id),
    fullname: String(course.fullname ?? course.full_name ?? course.name ?? ''),
    shortname: String(course.shortname ?? course.short_name ?? '')
  };
}

function normalizeCategory(category) {
  return {
    category_id: Number(category.category_id ?? category.id),
    name: String(category.name ?? ''),
    course_count: Number(category.course_count ?? category.coursecount ?? 0)
  };
}

const coursePayload = await call('get_courses');
const courses = (Array.isArray(coursePayload) ? coursePayload : coursePayload.courses ?? [])
  .map(normalizeCourse)
  .filter((course) => Number.isInteger(course.course_id) && course.course_id > 1)
  .filter((course) => fixtureNamePattern.test(course.fullname) || fixtureNamePattern.test(course.shortname));

const deletedCourses = [];
const failedCourses = [];

for (const course of courses) {
  try {
    const deleted = await call('delete_course', {
      course_id: course.course_id
    });
    deletedCourses.push({
      ...course,
      deleted: deleted.deleted === true
    });
  } catch (error) {
    failedCourses.push({
      ...course,
      error: error.message
    });
  }
}

const categoryPayload = await call('get_course_categories', {
  parent_id: -1
});
const categories = (categoryPayload.categories ?? [])
  .map(normalizeCategory)
  .filter((category) => Number.isInteger(category.category_id) && category.category_id > 0)
  .filter((category) => fixtureNamePattern.test(category.name));

const deletedCategories = [];
const failedCategories = [];

for (const category of categories) {
  try {
    const deleted = await call('delete_course_category', {
      category_id: category.category_id
    });
    deletedCategories.push({
      ...category,
      deleted: deleted.deleted === true
    });
  } catch (error) {
    failedCategories.push({
      ...category,
      error: error.message
    });
  }
}

console.log(JSON.stringify({
  matched_courses: courses.length,
  deleted_courses: deletedCourses,
  failed_courses: failedCourses,
  matched_categories: categories.length,
  deleted_categories: deletedCategories,
  failed_categories: failedCategories
}, null, 2));

if (failedCourses.length > 0 || failedCategories.length > 0) {
  process.exitCode = 1;
}
