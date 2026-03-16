#!/usr/bin/env node
// All-in-one: join, send a response message, optionally vote on a question.
// Usage: node chat-respond.js --name agent --message "..." --room general [--question-id q-xxx --vote agree|disagree] [--project /path]

import { ensureServer, connect, request, close } from '../client/ccchat-client.js';

const args = process.argv.slice(2);
function getFlag(name) {
  const idx = args.indexOf(`--${name}`);
  if (idx === -1) return undefined;
  return args[idx + 1];
}

const name = getFlag('name') || `responder-${process.pid}`;
const message = getFlag('message');
const room = getFlag('room') || 'general';
const questionId = getFlag('question-id');
const vote = getFlag('vote');
const projectPath = getFlag('project') || process.cwd();

if (!message) {
  console.error('Usage: node chat-respond.js --name agent --message "..." --room room [--question-id q-xxx --vote agree|disagree]');
  process.exit(1);
}

async function main() {
  await ensureServer();
  const ws = await connect();

  // Join
  await request(ws, { type: 'join', name, role: 'peer', room, project_path: projectPath });

  // Send message
  const msgRes = await request(ws, { type: 'message', content: message, room });
  console.error(`Message sent to ${room}`);

  // Optionally vote
  if (questionId && vote && ['agree', 'disagree'].includes(vote)) {
    const voteRes = await request(ws, { type: vote, question_id: questionId, reason: message });
    console.error(`Voted ${vote} on ${questionId}`);
  }

  await close(ws);
  console.log('OK');
}

main().catch(e => { console.error(e.message); process.exit(1); });
