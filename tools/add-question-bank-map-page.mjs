import { loadContract, toRestFunctionName } from '../tests/helpers/contract.mjs';
import { callRestFunction } from '../tests/helpers/moodle-rest.mjs';

const contract = await loadContract();

function option(name, fallback = null) {
  const prefix = `--${name}=`;
  const argument = process.argv.find((value) => value.startsWith(prefix));
  return argument ? argument.slice(prefix.length) : fallback;
}

const courseId = Number(option('course-id'));
const sectionNumber = Number(option('section-number'));
const sharedCmid = Number(option('shared-cmid'));
const sharedCategory = Number(option('shared-category'));
const sharedContext = Number(option('shared-context'));
const quizCmid = Number(option('quiz-cmid'));
const privateCategory = Number(option('private-category'));
const privateContext = Number(option('private-context'));

for (const [name, value] of Object.entries({
  courseId,
  sectionNumber,
  sharedCmid,
  sharedCategory,
  sharedContext,
  quizCmid,
  privateCategory,
  privateContext
})) {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${name} must be a positive integer.`);
  }
}

const content = [
  '<h3>MoodlIA question bank map</h3>',
  '<p>These links show where each generated question is stored.</p>',
  '<ul>',
  `<li><a href="/question/edit.php?cmid=${sharedCmid}&category=${sharedCategory},${sharedContext}">Course shared question bank: MoodlIA Generated Questions</a></li>`,
  `<li><a href="/question/edit.php?cmid=${quizCmid}&category=${privateCategory},${privateContext}">Quiz private question bank: MoodlIA Quiz Private Questions</a></li>`,
  `<li><a href="/mod/quiz/edit.php?cmid=${quizCmid}">Quiz questions page: questions used by the quiz</a></li>`,
  '</ul>',
  '<p>The quiz questions page shows all questions used by the quiz, even when a question is stored in the course shared bank.</p>'
].join('');

const created = await callRestFunction(toRestFunctionName(contract, 'create_module'), {
  course_id: courseId,
  section_number: sectionNumber,
  module_type: 'page',
  name: 'MoodlIA Question Bank Map',
  options: JSON.stringify({ content })
});

console.log(JSON.stringify(created, null, 2));
