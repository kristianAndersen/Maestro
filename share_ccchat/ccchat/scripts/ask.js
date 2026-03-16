#!/usr/bin/env node
// Usage: node ask.js "question" [--room room] [--timeout minutes] [--participants a,b,c]

import { ensureServer, connect, request, close, getAgentIdentity } from '../client/ccchat-client.js';

const args = process.argv.slice(2);
function getFlag(name) {
  const idx = args.indexOf(`--${name}`);
  if (idx === -1) return undefined;
  return args[idx + 1];
}

async function main() {
  const question = args.find((a, i) => !a.startsWith('--') && (i === 0 || !args[i - 1].startsWith('--')));
  if (!question) {
    console.error('Usage: node ask.js "question" [--room room] [--timeout minutes]');
    process.exit(1);
  }

  await ensureServer();
  const ws = await connect();

  const identity = getAgentIdentity();
  const room = getFlag('room') || 'general';

  if (identity) {
    await request(ws, { type: 'join', name: identity.name, role: identity.role, room, project_path: identity.projectPath });
  }

  const payload = {
    type: 'question',
    content: question,
    room,
    timeout_minutes: parseInt(getFlag('timeout') || '5', 10),
  };

  const participants = getFlag('participants');
  if (participants) {
    payload.participants = participants.split(',').map(p => p.trim());
  }

  const res = await request(ws, payload);
  console.log(JSON.stringify(res));

  await close(ws);
}

main().catch(e => { console.error(e.message); process.exit(1); });
