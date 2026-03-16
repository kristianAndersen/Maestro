#!/usr/bin/env node
// Usage: node vote.js <question-id> agree|disagree [reason]

import { ensureServer, connect, request, close, getAgentIdentity } from '../client/ccchat-client.js';

const args = process.argv.slice(2);

async function main() {
  const qid = args[0];
  const vote = args[1];
  const reason = args.slice(2).join(' ') || undefined;

  if (!qid || !['agree', 'disagree'].includes(vote)) {
    console.error('Usage: node vote.js <question-id> agree|disagree [reason]');
    process.exit(1);
  }

  await ensureServer();
  const ws = await connect();

  const identity = getAgentIdentity();
  if (identity) {
    await request(ws, { type: 'join', name: identity.name, role: identity.role, room: 'general', project_path: identity.projectPath });
  }

  const res = await request(ws, { type: vote, question_id: qid, reason });
  console.log(JSON.stringify(res));

  await close(ws);
}

main().catch(e => { console.error(e.message); process.exit(1); });
