/**
 * src/lib/claude.ts
 *
 * Server-side helper to call Claude with both an API key and a session key.
 * - Reads CLAUDE_API_KEY and CLAUDE_SESSION_KEY from environment variables.
 * - Supports sending the session key as a Cookie or as a custom header (x-session-token).
 *
 * Note: Adjust CLAUDE_ENDPOINT and the request body to match the exact Claude/Anthropic
 * API you are targeting. If your runtime doesn't provide a global `fetch`, either
 * upgrade to Node 18+ or install `node-fetch` and import it.
 */

export type CallClaudeOptions = {
  endpoint?: string; // full URL to the Claude/Anthropic endpoint
  useCookie?: boolean; // send session as Cookie when true, otherwise as x-session-token header
  model?: string; // provider model name
  extraBody?: Record<string, any>; // additional fields to include in the request body
};

export async function callClaude(prompt: string, opts: CallClaudeOptions = {}) {
  const API_KEY = process.env.CLAUDE_API_KEY;
  const SESSION_KEY = process.env.CLAUDE_SESSION_KEY;

  if (!API_KEY) throw new Error('CLAUDE_API_KEY environment variable is required');
  if (!SESSION_KEY) throw new Error('CLAUDE_SESSION_KEY environment variable is required');

  const CLAUDE_ENDPOINT = opts.endpoint ?? 'https://api.example.com/v1/claude/generate';
  const model = opts.model ?? 'claude-2';

  const headers: Record<string, string> = {
    Authorization: `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
  };

  if (opts.useCookie) {
    // common cookie name: session, session_key, or auth_token — change if your provider expects a different name
    headers['Cookie'] = `session=${SESSION_KEY}`;
  } else {
    // fallback: send session in a custom header. Change header name if your provider expects another one.
    headers['x-session-token'] = SESSION_KEY;
  }

  const body = {
    model,
    prompt,
    ...opts.extraBody,
  } as Record<string, any>;

  // If your runtime doesn't have global fetch (Node < 18), install node-fetch and import it here.
  const res = await fetch(CLAUDE_ENDPOINT, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Claude request failed: ${res.status} ${text}`);
  }

  return res.json();
}
