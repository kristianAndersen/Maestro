#!/usr/bin/env node
// SessionEnd hook — clean up when a Claude session exits.
// Removes the agent from the chat server and kills the background watcher.

import { isServerAlive, connect, request, close, getAgentIdentity } from '../client/ccchat-client.js';
import { stopWatcher } from './watcher-manager.js';
import { unlinkSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const NOTIFY_DIR = join(homedir(), '.claude', 'ccchat');

async function main() {
  // Read stdin (SessionEnd sends JSON with session info)
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  let input = {};
  try { input = JSON.parse(Buffer.concat(chunks).toString()); } catch {}

  const identity = getAgentIdentity(input.cwd || process.cwd());
  if (!identity) return;

  // Kill the background watcher
  stopWatcher(identity.name);

  // Clean up notification file
  const notifyPath = join(NOTIFY_DIR, `notify-${identity.name}.json`);
  if (existsSync(notifyPath)) {
    try { unlinkSync(notifyPath); } catch {}
  }

  // Tell the server to remove this agent
  if (!isServerAlive()) return;

  let ws;
  try {
    ws = await connect(2000);
  } catch {
    return;
  }

  try {
    await request(ws, { type: 'leave', name: identity.name });
  } finally {
    await close(ws);
  }
}

main().catch(() => {});
