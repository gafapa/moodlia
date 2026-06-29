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

test('Forum posts can be deleted through REST, MCP, and CLI', { skip: !hasConfig }, async () => {
  const contract = await loadContract();
  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  let categoryId = null;
  let courseId = null;

  try {
    const category = await callRestFunction(toRestFunctionName(contract, 'create_course_category'), {
      name: `MoodlIA Forum Delete Category ${suffix}`,
      visible: 1
    });
    categoryId = category.category_id;

    const course = await callRestFunction(toRestFunctionName(contract, 'create_course'), {
      fullname: `MoodlIA Forum Delete Course ${suffix}`,
      shortname: `moodlia-forum-delete-${suffix}`,
      category_id: categoryId,
      visible: 0,
      summary: `<p>MoodlIA forum delete smoke course ${suffix}</p>`,
      summary_format: 'html',
      course_format: 'topics'
    });
    courseId = course.course_id;

    const section = await callRestFunction(toRestFunctionName(contract, 'create_section'), {
      course_id: courseId,
      name: `MoodlIA Forum Delete Section ${suffix}`
    });

    const forum = await callRestFunction(toRestFunctionName(contract, 'create_module'), {
      course_id: courseId,
      section_number: section.section_number,
      module_type: 'forum',
      name: `MoodlIA Forum Delete ${suffix}`,
      options: JSON.stringify({
        forum_type: 'general',
        intro: '<p>Forum delete smoke.</p>'
      })
    });

    const discussion = await callRestFunction(toRestFunctionName(contract, 'create_forum_discussion'), {
      course_id: courseId,
      module_id: forum.course_module_id,
      name: `MoodlIA Forum Delete Discussion ${suffix}`,
      message: '<p>First post used to verify discussion deletion.</p>'
    });

    const restReply = await callRestFunction(toRestFunctionName(contract, 'create_forum_discussion_post'), {
      course_id: courseId,
      module_id: forum.course_module_id,
      discussion_id: discussion.discussion_id,
      parent_post_id: discussion.first_post_id,
      subject: `MoodlIA REST delete reply ${suffix}`,
      message: '<p>Reply deleted through REST.</p>'
    });

    const mcpReply = await callMcpTool('create_forum_discussion_post', {
      course_id: courseId,
      module_id: forum.course_module_id,
      discussion_id: discussion.discussion_id,
      parent_post_id: discussion.first_post_id,
      subject: `MoodlIA MCP delete reply ${suffix}`,
      message: '<p>Reply deleted through MCP.</p>'
    });

    const cliReply = await callCli([
      'create-forum-discussion-post',
      '--course-id', String(courseId),
      '--module-id', String(forum.course_module_id),
      '--discussion-id', String(discussion.discussion_id),
      '--parent-post-id', String(discussion.first_post_id),
      '--subject', `MoodlIA CLI delete reply ${suffix}`,
      '--message', '<p>Reply deleted through CLI.</p>'
    ]);

    const restDeleted = await callRestFunction(toRestFunctionName(contract, 'delete_forum_discussion_post'), {
      course_id: courseId,
      module_id: forum.course_module_id,
      discussion_id: discussion.discussion_id,
      post_id: restReply.post_id
    });
    assert.equal(restDeleted.deleted, true);
    assert.equal(restDeleted.id, restReply.post_id);

    const mcpDeleted = await callMcpTool('delete_forum_discussion_post', {
      course_id: courseId,
      module_id: forum.course_module_id,
      discussion_id: discussion.discussion_id,
      post_id: mcpReply.post_id
    });
    assert.equal(mcpDeleted.deleted, true);
    assert.equal(mcpDeleted.id, mcpReply.post_id);

    const cliDeleted = await callCli([
      'delete-forum-discussion-post',
      '--course-id', String(courseId),
      '--module-id', String(forum.course_module_id),
      '--discussion-id', String(discussion.discussion_id),
      '--post-id', String(cliReply.post_id)
    ]);
    assert.equal(cliDeleted.deleted, true);
    assert.equal(cliDeleted.id, cliReply.post_id);

    const remainingPosts = await callRestFunction(toRestFunctionName(contract, 'get_forum_discussion_posts'), {
      course_id: courseId,
      module_id: forum.course_module_id,
      discussion_id: discussion.discussion_id
    });
    assert.deepEqual(
      remainingPosts.posts.map((post) => post.post_id).sort((left, right) => left - right),
      [discussion.first_post_id].sort((left, right) => left - right)
    );

    const deletedDiscussion = await callRestFunction(toRestFunctionName(contract, 'delete_forum_discussion_post'), {
      course_id: courseId,
      module_id: forum.course_module_id,
      discussion_id: discussion.discussion_id,
      post_id: discussion.first_post_id
    });
    assert.equal(deletedDiscussion.deleted, true);
    assert.equal(deletedDiscussion.id, discussion.first_post_id);

    const discussionsAfterDelete = await callRestFunction(toRestFunctionName(contract, 'get_forum_discussions'), {
      course_id: courseId,
      module_id: forum.course_module_id
    });
    assert.equal(
      discussionsAfterDelete.discussions.some((item) => item.discussion_id === discussion.discussion_id),
      false
    );

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
