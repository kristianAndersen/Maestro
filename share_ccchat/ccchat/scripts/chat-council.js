#!/usr/bin/env node
// All-in-one: start server, create council room, post question, spawn council, poll until consensus, print result.
// Usage: node chat-council.js --question "..." [--members 3] [--roles architect,pragmatist,critic] [--timeout 300]

import { ensureServer, connect, request, close, sleep } from '../client/ccchat-client.js';
import { spawn } from 'child_process';
import { randomUUID } from 'crypto';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const args = process.argv.slice(2);
function getFlag(name) {
  const idx = args.indexOf(`--${name}`);
  if (idx === -1) return undefined;
  return args[idx + 1];
}

const question = getFlag('question');
const roomOverride = getFlag('room');
const members = getFlag('members') || '3';
const roles = getFlag('roles') || 'architect,pragmatist,critic';
const pollTimeout = parseInt(getFlag('timeout') || '300', 10);

if (!question) {
  console.error('Usage: node chat-council.js --question "..." [--room general] [--members 3] [--roles architect,pragmatist,critic] [--timeout 300]');
  process.exit(1);
}

async function main() {
  await ensureServer();

  // Use specified room (hybrid mode — council in general chat) or create a private one
  const room = roomOverride || `council-${randomUUID().slice(0, 8)}`;
  const name = `requester-${process.pid}`;

  const ws = await connect();

  // Join council room
  await request(ws, { type: 'join', name, role: 'peer', room });
  console.error(`Council room: ${room}`);

  // Post question
  const qRes = await request(ws, { type: 'question', content: question, room, timeout_minutes: Math.ceil(pollTimeout / 60) });
  const qid = qRes.question_id;
  console.error(`Question: ${qid}`);

  // Spawn council
  const spawner = spawn('node', [
    join(__dirname, 'spawn-council.js'),
    '--question-id', qid,
    '--room', room,
    '--members', members,
    '--roles', roles,
  ], { stdio: ['ignore', 'pipe', 'pipe'] });

  let spawnOutput = '';
  spawner.stdout.on('data', d => spawnOutput += d);
  spawner.stderr.on('data', d => process.stderr.write(d));
  await new Promise(resolve => spawner.on('close', resolve));
  console.error(spawnOutput.trim());

  // Poll for consensus
  const deadline = Date.now() + pollTimeout * 1000;
  let lastSeq = 0;
  const allMessages = [];

  while (Date.now() < deadline) {
    await sleep(5000);

    const readRes = await request(ws, { type: 'read', room, since_seq: lastSeq, limit: 50 });
    for (const m of (readRes.messages || [])) {
      lastSeq = Math.max(lastSeq, m.seq);
      allMessages.push(m);
    }

    // Check consensus
    const statusRes = await request(ws, { type: 'status' });
    const c = (statusRes.consensus || []).find(q => q.question_id === qid);

    if (c && c.state === 'reached') {
      await close(ws);
      printResult(qid, question, room, 'reached', c.votes, allMessages);
      return;
    }
    if (c && c.state === 'timeout') {
      await close(ws);
      printResult(qid, question, room, 'timeout', c.votes, allMessages);
      return;
    }

    // If no consensus entry found and we have messages from council, they might have exited
    if (!c && allMessages.some(m => m.type === 'answer')) {
      await sleep(10000); // Give a bit more time
      const final = await request(ws, { type: 'read', room, since_seq: lastSeq, limit: 50 });
      for (const m of (final.messages || [])) allMessages.push(m);
      await close(ws);
      printResult(qid, question, room, 'partial', {}, allMessages);
      return;
    }
  }

  await close(ws);
  printResult(qid, question, room, 'poll_timeout', {}, allMessages);
}

function printResult(qid, question, room, state, votes, messages) {
  const discussion = messages
    .filter(m => m.type !== 'system')
    .map(m => ({
      from: m.from_agent,
      type: m.type,
      content: m.content,
    }));

  console.log(JSON.stringify({
    question_id: qid,
    question,
    room,
    consensus: state,
    votes,
    discussion,
  }, null, 2));
}

main().catch(e => { console.error(e.message); process.exit(1); });
