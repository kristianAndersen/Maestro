#!/usr/bin/env node
// Usage: node status.js [--raw]

import { ensureServer, connect, request, close } from '../client/ccchat-client.js';

const raw = process.argv.includes('--raw');

async function main() {
  await ensureServer();
  const ws = await connect();

  const res = await request(ws, { type: 'status' });

  if (raw) {
    console.log(JSON.stringify(res, null, 2));
  } else {
    console.log('=== ccchat status ===');
    console.log(`\nAgents (${res.agents?.length || 0}):`);
    for (const a of (res.agents || [])) {
      const status = a.online ? 'connected' : 'recently active';
      const agentRooms = (() => { try { return JSON.parse(a.rooms).join(', '); } catch { return 'general'; } })();
      console.log(`  ${a.name} (${a.role}) [${status}] - rooms: ${agentRooms} - ${a.project_path || 'n/a'}`);
    }
    console.log(`\nActive rooms: ${(res.rooms || []).join(', ') || 'none'}`);
    console.log(`\nActive questions: ${res.consensus?.length || 0}`);
    for (const c of (res.consensus || [])) {
      console.log(`  ${c.question_id} [${c.state}] in ${c.room} - votes: ${JSON.stringify(c.votes)}`);
    }
  }

  await close(ws);
}

main().catch(e => { console.error(e.message); process.exit(1); });
