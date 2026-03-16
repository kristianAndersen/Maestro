#!/usr/bin/env node
// All-in-one: join, ask a question, poll for responses, print summary.
// Usage: node chat-ask.js --name agent --question "..." [--room general] [--timeout 120] [--project /path]

import { ensureServer, connect, request, close, sleep } from '../client/ccchat-client.js';

const args = process.argv.slice(2);
function getFlag(name) {
  const idx = args.indexOf(`--${name}`);
  if (idx === -1) return undefined;
  return args[idx + 1];
}

const name = getFlag('name') || `ask-${process.pid}`;
const question = getFlag('question');
const room = getFlag('room') || 'general';
const pollTimeout = parseInt(getFlag('timeout') || '120', 10);
const projectPath = getFlag('project') || process.cwd();

if (!question) {
  console.error('Usage: node chat-ask.js --question "..." [--name agent] [--room room] [--timeout 120]');
  process.exit(1);
}

async function main() {
  await ensureServer();
  const ws = await connect();

  // Join
  await request(ws, { type: 'join', name, role: 'peer', room, project_path: projectPath });

  // Ask
  const qRes = await request(ws, { type: 'question', content: question, room, timeout_minutes: Math.ceil(pollTimeout / 60) });
  const qid = qRes.question_id;
  console.error(`Question posted: ${qid}`);

  // Poll for responses
  const deadline = Date.now() + pollTimeout * 1000;
  let lastSeq = 0;
  const responses = [];
  let consensusState = null;

  while (Date.now() < deadline) {
    await sleep(3000);

    const readRes = await request(ws, { type: 'read', room, since_seq: lastSeq, limit: 50 });
    for (const m of (readRes.messages || [])) {
      lastSeq = Math.max(lastSeq, m.seq);
      if (m.from_agent !== name && ['message', 'answer', 'agree', 'disagree'].includes(m.type)) {
        responses.push(m);
      }
    }

    // Check consensus
    const statusRes = await request(ws, { type: 'status' });
    const c = (statusRes.consensus || []).find(q => q.question_id === qid);
    if (c && (c.state === 'reached' || c.state === 'timeout')) {
      consensusState = c;
      break;
    }
    // If no active consensus and we have responses, wait a bit more then stop
    if (!c && responses.length > 0) {
      await sleep(5000);
      // One more read
      const final = await request(ws, { type: 'read', room, since_seq: lastSeq, limit: 50 });
      for (const m of (final.messages || [])) {
        if (m.from_agent !== name && ['message', 'answer', 'agree', 'disagree'].includes(m.type)) {
          responses.push(m);
        }
      }
      break;
    }
  }

  await close(ws);

  // Print summary to stdout (this is what the subagent returns)
  const summary = {
    question_id: qid,
    question,
    room,
    consensus: consensusState ? consensusState.state : 'none',
    votes: consensusState?.votes || {},
    responses: responses.map(m => ({
      from: m.from_agent,
      type: m.type,
      content: m.content,
    })),
  };

  console.log(JSON.stringify(summary, null, 2));
}

main().catch(e => { console.error(e.message); process.exit(1); });
