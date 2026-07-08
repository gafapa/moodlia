import assert from 'node:assert/strict';
import test from 'node:test';
import {
  MoodleClientError,
  RestTransport,
  buildContractParameters,
  createMoodleClient,
  createMoodleRestClient,
  normalizeClientError,
  toRestFunctionName,
  validateContractResponse
} from '../../client/moodle-rest-client.mjs';

const contract = {
  restPrefix: 'local_moodlia',
  operations: [
    {
      name: 'get_courses',
      transports: ['rest', 'mcp', 'cli'],
      parameters: {
        limit: { type: 'integer', required: false },
        visible: { type: 'boolean', required: false }
      },
      returns: {
        courses: 'array'
      }
    },
    {
      name: 'create_module',
      transports: ['rest', 'mcp', 'cli'],
      parameters: {
        course_id: { type: 'integer', required: true },
        section_number: { type: 'integer', required: true },
        module_type: {
          type: 'string',
          required: true,
          enum: ['page', 'quiz']
        },
        name: { type: 'string', required: true },
        options: { type: 'object', required: false }
      },
      returns: {
        module_id: 'integer',
        name: 'string'
      }
    }
  ]
};

test('shared REST client calls canonical Moodle function names', async () => {
  const calls = [];
  const client = createMoodleRestClient({
    baseUrl: 'https://moodle.example.test/',
    token: 'test-token',
    contract,
    timeoutMs: 0,
    fetchImplementation: async (url, options) => {
      calls.push({ url, options });
      return new Response(JSON.stringify({ courses: [] }), {
        status: 200,
        headers: {
          'content-type': 'application/json'
        }
      });
    }
  });

  const payload = await client.callOperation('get_courses', {
    limit: 5,
    visible: false,
    ignored_null: null
  });

  assert.deepEqual(payload, { courses: [] });
  assert.equal(String(calls[0].url), 'https://moodle.example.test/webservice/rest/server.php');
  assert.equal(calls[0].options.method, 'POST');
  assert.equal(calls[0].options.body.get('wstoken'), 'test-token');
  assert.equal(calls[0].options.body.get('wsfunction'), 'local_moodlia_get_courses');
  assert.equal(calls[0].options.body.get('moodlewsrestformat'), 'json');
  assert.equal(calls[0].options.body.get('limit'), '5');
  assert.equal(calls[0].options.body.get('visible'), '0');
  assert.equal(calls[0].options.body.has('ignored_null'), false);
});

test('MoodleClient facade exposes only canonical snake_case operation methods', async () => {
  const calls = [];
  const client = createMoodleClient({
    baseUrl: 'https://moodle.example.test/',
    token: 'test-token',
    contract,
    timeoutMs: 0,
    fetchImplementation: async (url, options) => {
      calls.push({ url, options });
      const functionName = options.body.get('wsfunction');
      return new Response(JSON.stringify(
        functionName === 'local_moodlia_get_courses'
          ? { courses: [] }
          : { module_id: 10, name: 'Generated page' }
      ), { status: 200 });
    }
  });

  assert.deepEqual(client.operationNames(), ['get_courses', 'create_module']);
  assert.equal(typeof client.get_courses, 'function');
  assert.equal(client.getCourses, undefined);

  assert.deepEqual(await client.get_courses({ limit: '2' }), { courses: [] });
  assert.equal(calls.at(-1).options.body.get('wsfunction'), 'local_moodlia_get_courses');
  assert.equal(calls.at(-1).options.body.get('limit'), '2');

  assert.deepEqual(await client.create_module({
    course_id: '42',
    section_number: 1,
    module_type: 'page',
    name: 'Generated page',
    options: {
      content: '<p>Hello</p>'
    }
  }), { module_id: 10, name: 'Generated page' });
  assert.equal(calls.at(-1).options.body.get('wsfunction'), 'local_moodlia_create_module');
  assert.equal(calls.at(-1).options.body.get('course_id'), '42');
  assert.equal(calls.at(-1).options.body.get('options'), '{"content":"<p>Hello</p>"}');
});

test('shared contract parameter builder strictly validates numbers, ranges, and objects', () => {
  const operation = {
    name: 'strict_validation',
    parameters: {
      count: { type: 'integer', required: true, minimum: 1, maximum: 10 },
      ratio: { type: 'number', required: false, minimum: 0, maximum: 1 },
      options: { type: 'object', required: false }
    }
  };

  assert.deepEqual(buildContractParameters(operation, {
    count: '5',
    ratio: '.75',
    options: { enabled: true }
  }), {
    count: 5,
    ratio: 0.75,
    options: '{"enabled":true}'
  });

  assert.throws(
    () => buildContractParameters(operation, { count: '5abc' }),
    /count must be an integer/
  );
  assert.throws(
    () => buildContractParameters(operation, { count: '0' }),
    /count must be at least 1/
  );
  assert.throws(
    () => buildContractParameters(operation, { count: '5', ratio: '1.5' }),
    /ratio must be at most 1/
  );
  assert.throws(
    () => buildContractParameters(operation, { count: '5', options: '[]' }),
    /options must be a JSON object/
  );
});

test('shared response validator checks contract return shape', () => {
  const operation = {
    name: 'get_example',
    returns: {
      course_id: 'integer',
      name: 'string',
      enabled: 'boolean',
      items: [
        {
          item_id: 'integer'
        }
      ]
    }
  };

  const payload = {
    course_id: 7,
    name: 'Example',
    enabled: true,
    items: [
      {
        item_id: 3,
        extra: 'allowed'
      }
    ],
    extra: 'allowed'
  };

  assert.equal(validateContractResponse(operation, payload), payload);
  assert.throws(
    () => validateContractResponse(operation, { ...payload, course_id: '7' }),
    /get_example.course_id must be an integer/
  );
  assert.throws(
    () => validateContractResponse(operation, { ...payload, items: [{ item_id: '3' }] }),
    /get_example.items\[0\].item_id must be an integer/
  );
});

test('shared response validator accepts nullable response fields', () => {
  const operation = {
    name: 'get_nullable_example',
    returns: {
      item_id: 'integer',
      owner_id: 'integer|null',
      children: [
        {
          child_id: 'integer',
          parent_id: 'integer|null'
        }
      ]
    }
  };

  const payload = {
    item_id: 7,
    owner_id: null,
    children: [
      {
        child_id: 3,
        parent_id: null
      }
    ]
  };

  assert.equal(validateContractResponse(operation, payload), payload);
});

test('MoodleClient can skip response validation for raw automation output', async () => {
  const client = createMoodleClient({
    baseUrl: 'https://moodle.example.test/',
    token: 'test-token',
    contract,
    validateResponses: false,
    timeoutMs: 0,
    fetchImplementation: async () => new Response(JSON.stringify({ courses: null }), { status: 200 })
  });

  assert.deepEqual(await client.get_courses({}), { courses: null });
});

test('MoodleClient validates operation parameters against the contract', async () => {
  const client = createMoodleClient({
    baseUrl: 'https://moodle.example.test/',
    token: 'test-token',
    contract,
    timeoutMs: 0,
    fetchImplementation: async () => new Response(JSON.stringify({ courses: [] }), { status: 200 })
  });

  await assert.rejects(
    () => client.create_module({
      course_id: 42,
      section_number: 1,
      module_type: 'unsupported',
      name: 'Invalid module'
    }),
    /module_type must be one of: page, quiz/
  );

  await assert.rejects(
    () => client.create_module({
      course_id: 42,
      module_type: 'page',
      name: 'Missing section'
    }),
    /Missing required parameter section_number/
  );

  await assert.rejects(
    () => client.get_courses({ unexpected: true }),
    /Unknown parameter\(s\) for get_courses: unexpected/
  );
});

test('Lesson page parameter validation rejects invalid question payload shapes early', () => {
  const operation = {
    name: 'create_lesson_page',
    parameters: {
      course_id: { type: 'integer', required: true },
      module_id: { type: 'integer', required: true },
      title: { type: 'string', required: true },
      content: { type: 'string', required: true },
      branches: { type: 'object', required: false },
      page_type: { type: 'string', required: false, enum: ['content', 'multichoice', 'numerical', 'shortanswer', 'truefalse'] },
      answers: { type: 'object', required: false }
    }
  };

  assert.deepEqual(
    buildContractParameters(operation, {
      course_id: 42,
      module_id: 7,
      title: 'Check',
      content: '<p>Check this.</p>',
      page_type: 'truefalse',
      answers: {
        correct: { answer: 'True', jump_to: 'next_page', score: 1 },
        wrong: { answer: 'False', jump_to: 'this_page', score: 0 }
      }
    }),
    {
      course_id: 42,
      module_id: 7,
      title: 'Check',
      content: '<p>Check this.</p>',
      page_type: 'truefalse',
      answers: '{"correct":{"answer":"True","jump_to":"next_page","score":1},"wrong":{"answer":"False","jump_to":"this_page","score":0}}'
    }
  );

  assert.throws(
    () => buildContractParameters(operation, {
      course_id: 42,
      module_id: 7,
      title: 'Check',
      content: '<p>Check this.</p>',
      page_type: 'essay'
    }),
    /page_type must be one of: content, multichoice, numerical, shortanswer, truefalse/
  );

  assert.throws(
    () => buildContractParameters(operation, {
      course_id: 42,
      module_id: 7,
      title: 'Check',
      content: '<p>Check this.</p>',
      page_type: 'truefalse',
      answers: []
    }),
    /answers must be a JSON object/
  );
});

test('shared REST client reports Moodle REST payload errors', async () => {
  const transport = new RestTransport({
    baseUrl: 'https://moodle.example.test/',
    token: 'test-token',
    timeoutMs: 0,
    fetchImplementation: async () => new Response(JSON.stringify({
      exception: 'moodle_exception',
      errorcode: 'invalidparameter',
      message: 'Invalid parameter value detected'
    }), { status: 200 })
  });

  await assert.rejects(
    () => transport.callFunction('local_moodlia_get_courses'),
    (error) => {
      assert.ok(error instanceof MoodleClientError);
      assert.equal(error.code, 'invalid_parameters');
      assert.equal(error.details.function_name, 'local_moodlia_get_courses');
      assert.equal(error.details.moodle_errorcode, 'invalidparameter');
      return true;
    }
  );
});

test('client errors serialize to canonical JSON payloads', () => {
  const error = normalizeClientError(new Error('Plain failure'), 'transport_error', {
    operation: 'get_courses'
  });

  assert.ok(error instanceof MoodleClientError);
  assert.deepEqual(error.toJSON(), {
    error: true,
    code: 'transport_error',
    message: 'Plain failure',
    details: {
      operation: 'get_courses'
    }
  });
});

test('REST function names come from the canonical contract prefix', () => {
  assert.equal(
    toRestFunctionName({ restPrefix: 'local_moodlia' }, 'get_current_user'),
    'local_moodlia_get_current_user'
  );
});

test('client rejects non-canonical operation names', async () => {
  const client = createMoodleClient({
    baseUrl: 'https://moodle.example.test/',
    token: 'test-token',
    contract,
    timeoutMs: 0,
    fetchImplementation: async () => new Response(JSON.stringify({ courses: [] }), { status: 200 })
  });

  await assert.rejects(
    () => client.callOperation('getCourses', {}),
    /Unknown operation: getCourses/
  );
});
