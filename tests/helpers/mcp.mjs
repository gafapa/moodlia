import { getEnv, getTimeout } from './env.mjs';

let requestId = 1;

export async function callMcp(method, params = {}) {
  const payload = await callMcpRaw({ method, params });

  if (!payload.response.ok) {
    throw new Error(`MCP request failed with HTTP ${payload.response.status}: ${JSON.stringify(payload.body)}`);
  }

  if (payload.body.error) {
    throw new Error(`MCP error for ${method}: ${JSON.stringify(payload.body.error)}`);
  }

  return payload.body.result;
}

export async function callMcpRaw({ method, params = {}, token = getEnv('MOODLE_REST_TOKEN'), includeAuthorization = true } = {}) {
  return callMcpHttpRaw({
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: requestId++,
      method,
      params
    }),
    token,
    includeAuthorization
  });
}

export async function callMcpHttpRaw({
  method = 'POST',
  body = '',
  token = getEnv('MOODLE_REST_TOKEN'),
  includeAuthorization = true,
  contentType = 'application/json'
} = {}) {
  const configuredEndpoint = getEnv('MOODLE_MCP_ENDPOINT');
  const baseUrl = getEnv('MOODLE_BASE_URL');
  const endpoint = normalizeEndpoint(configuredEndpoint || new URL('/local/moodlia/mcp.php', baseUrl).toString());
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), getTimeout());
  const headers = {};

  if (contentType) {
    headers['Content-Type'] = contentType;
  }

  if (includeAuthorization) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(endpoint, {
      method,
      headers,
      body: method === 'GET' || method === 'HEAD' ? undefined : body,
      signal: controller.signal
    });

    const text = await response.text();
    const responseBody = text ? JSON.parse(text) : null;

    return {
      response,
      body: responseBody
    };
  } finally {
    clearTimeout(timeout);
  }
}

function normalizeEndpoint(endpoint) {
  return endpoint.replace(/\/mcp\/?$/, '/mcp.php');
}
