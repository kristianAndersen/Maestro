#!/usr/bin/env node
// Usage: node read.js [--since seq] [--room room] [--limit n] [--raw]

import { ensureServer, connect, request, close, getAgentIdentity } from '../client/ccchat-client.js';

const args = process.argv.slice(2);
function getFlag(name) {
  const idx = args.indexOf(`--${name}`);
  if (idx === -1) return undefined;
  return args[idx + 1];
}

async function main() {
  await ensureServer();
  const ws = await connect();

  const room = getFlag('room') || 'general';
  const name = getFlag('name') || null;

  // Join so we can read - use provided name, identity, or fallback
  const identity = getAgentIdentity();
  const agentName = name || identity?.name || `reader-${process.pid}`;
  const role = identity?.role || 'peer';
  const projectPath = identity?.projectPath || process.cwd();
  await request(ws, { type: 'join', name: agentName, role, room, project_path: projectPath, silent: true });

  const since_seq = getFlag('since') !== undefined ? parseInt(getFlag('since'), 10) : undefined;
  const limit = getFlag('limit') ? parseInt(getFlag('limit'), 10) : 50;

  const payload = { type: 'read', room, limit };
  if (since_seq !== undefined) payload.since_seq = since_seq;

  const res = await request(ws, payload);

  if (args.includes('--raw')) {
    console.log(JSON.stringify(res));
  } else {
    if (res.messages && res.messages.length > 0) {
      for (const m of res.messages) {
        const ts = m.timestamp ? new Date(m.timestamp).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }) : '';
        const prefix = m.type === 'question' ? '? ' : m.type === 'answer' ? 'A ' : m.type === 'system' ? '* ' : '  ';
        const qid = m.question_id ? ` [${m.question_id}]` : '';
        console.log(`${prefix}[${ts}] ${m.from_agent || 'system'}: ${m.content}${qid}`);
      }
      if (res.has_more) console.log('  ... more messages available');
    } else {
      console.log('No new messages.');
    }
  }

  await close(ws);
}

main().catch(e => { console.error(e.message); process.exit(1); });
