#!/usr/bin/env node
// All-in-one: join, read unread messages across rooms, print summary.
// Usage: node chat-read.js --name agent [--rooms general,migration] [--project /path]

import { ensureServer, connect, request, close } from '../client/ccchat-client.js';

const args = process.argv.slice(2);
function getFlag(name) {
  const idx = args.indexOf(`--${name}`);
  if (idx === -1) return undefined;
  return args[idx + 1];
}

const name = getFlag('name') || `reader-${process.pid}`;
const roomList = (getFlag('rooms') || 'general').split(',').map(r => r.trim());
const projectPath = getFlag('project') || process.cwd();

async function main() {
  await ensureServer();
  const ws = await connect();

  const result = { rooms: {} };

  for (const room of roomList) {
    await request(ws, { type: 'join', name, role: 'peer', room, project_path: projectPath, silent: true });
    const res = await request(ws, { type: 'read', room, limit: 20 });
    const msgs = (res.messages || []).filter(m => m.from_agent !== name && m.type !== 'system');
    if (msgs.length > 0) {
      result.rooms[room] = msgs.map(m => ({
        from: m.from_agent,
        type: m.type,
        content: m.content,
        question_id: m.question_id || undefined,
        timestamp: m.timestamp,
      }));
    }
  }

  // Also get active questions
  const statusRes = await request(ws, { type: 'status' });
  result.active_questions = (statusRes.consensus || []).map(c => ({
    question_id: c.question_id,
    room: c.room,
    state: c.state,
    votes: c.votes,
  }));

  await close(ws);

  const totalUnread = Object.values(result.rooms).reduce((sum, msgs) => sum + msgs.length, 0);
  if (totalUnread === 0 && result.active_questions.length === 0) {
    console.log('{"unread":0}');
  } else {
    console.log(JSON.stringify(result, null, 2));
  }
}

main().catch(e => { console.error(e.message); process.exit(1); });
