#!/usr/bin/env node
// Usage:
//   node send.js "message" [--to agent] [--room room] [--name agent-name] [--parent id]
//   node send.js --join name role [--room room] [--project /path]

import { ensureServer, connect, request, close, saveAgentIdentity, getAgentIdentity } from '../client/ccchat-client.js';
import { startWatcher } from '../hooks/watcher-manager.js';

const args = process.argv.slice(2);

function getFlag(name) {
  const idx = args.indexOf(`--${name}`);
  if (idx === -1) return undefined;
  return args[idx + 1];
}

function hasFlag(name) {
  return args.includes(`--${name}`);
}

async function main() {
  await ensureServer();
  const ws = await connect();

  if (hasFlag('join')) {
    const name = getFlag('join');
    const role = args[args.indexOf('--join') + 2] || 'peer';
    const room = getFlag('room') || 'general';
    const project_path = getFlag('project') || process.cwd();

    const res = await request(ws, { type: 'join', name, role, room, project_path });
    console.log(JSON.stringify(res));

    // Save identity (keyed by name so all scripts can find it)
    saveAgentIdentity({ name, role, rooms: [room], projectPath: project_path });

    // Start background watcher for real-time message notifications
    startWatcher(name, [room]);
  } else {
    // Send a message — find the content (first non-flag arg)
    let message = null;
    for (let i = 0; i < args.length; i++) {
      if (!args[i].startsWith('--')) {
        if (i === 0 || !args[i - 1].startsWith('--')) {
          message = args[i];
          break;
        }
      }
    }

    if (!message) {
      console.error('Usage: node send.js "message" [--to agent] [--room room] [--name agent-name]');
      console.error('       node send.js --join name role [--room room] [--project /path]');
      process.exit(1);
    }

    const room = getFlag('room') || 'general';
    const to = getFlag('to') || null;
    const parent_id = getFlag('parent') || null;

    // Resolve agent name: --name flag > saved identity > fallback
    const identity = getAgentIdentity();
    const agentName = getFlag('name') || identity?.name || `anon-${process.pid}`;
    const role = identity?.role || 'peer';
    const projectPath = identity?.projectPath || process.cwd();

    // Silent join — just for auth, don't announce
    await request(ws, { type: 'join', name: agentName, role, room, project_path: projectPath, silent: true });

    const res = await request(ws, { type: 'message', content: message, room, to, parent_id });
    console.log(JSON.stringify(res));
  }

  await close(ws);
}

main().catch(e => { console.error(e.message); process.exit(1); });
