// src/example/claude-server.ts
// Minimal example server (Node 18+) showing how to expose a server endpoint
// that uses src/lib/claude.ts. This file uses the built-in Fetch available in
// modern Node and the native HTTP server for simplicity.

import { createServer } from 'http';
import { callClaude } from '../lib/claude';

const PORT = Number(process.env.PORT) || 4000;

const server = createServer(async (req, res) => {
  if (req.method === 'POST' && req.url === '/api/claude') {
    let body = '';
    for await (const chunk of req) body += chunk;
    try {
      const { prompt } = JSON.parse(body || '{}');
      if (!prompt) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'prompt is required' }));
        return;
      }

      const resp = await callClaude(prompt, {
        endpoint: 'https://api.anthropic.com/v1/complete',
        anthropicVersion: '2023-06-01',
        model: undefined,
      });

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(resp.data));
    } catch (err: any) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // default
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'not found' }));
});

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Claude example server running on http://localhost:${PORT}`);
});
