#!/usr/bin/env node
// Stop hook - auto-detect unread messages after Claude finishes responding.
// First checks the watcher's notification marker file (instant, no network).
// Falls back to server query if watcher isn't running.

import { getAgentIdentity } from '../client/ccchat-client.js';
import { readFileSync, unlinkSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { startWatcher } from './watcher-manager.js';

const NOTIFY_DIR = join(homedir(), '.claude', 'ccchat');

function notifyPath(agentName) {
  return join(NOTIFY_DIR, `notify-${agentName}.json`);
}

function readAndClearNotifications(agentName) {
  const p = notifyPath(agentName);
  if (!existsSync(p)) return [];
  try {
    const data = JSON.parse(readFileSync(p, 'utf8'));
    unlinkSync(p); // Clear after reading
    return Array.isArray(data) ? data : [];
  } catch {
    try { unlinkSync(p); } catch {}
    return [];
  }
}

async function main() {
  // Read stdin for hook input
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  const input = JSON.parse(Buffer.concat(chunks).toString());

  // Loop prevention: if Stop hook already triggered this response, skip
  if (input.stop_hook_active) return;

  // Resolve identity by cwd (project path) so multi-agent setups don't collide
  const identity = getAgentIdentity(input.cwd || process.cwd());
  if (!identity) return;

  // Ensure watcher is running for this agent
  startWatcher(identity.name, identity.rooms || ['general']);

  // Check notification marker file (written by background watcher — instant)
  // Filter out system messages (join/leave) — only real messages and questions matter
  const notifications = readAndClearNotifications(identity.name).filter(n =>
    n.type !== 'system' && n.from !== identity.name
  );

  if (notifications.length > 0) {
    // Group by room
    const byRoom = {};
    for (const n of notifications) {
      const room = n.room || 'general';
      if (!byRoom[room]) byRoom[room] = [];
      byRoom[room].push(n);
    }

    const lines = [`CCCHAT: ${notifications.length} new message${notifications.length !== 1 ? 's' : ''} (auto-detected)`];
    let hasQuestion = false;
    for (const [room, msgs] of Object.entries(byRoom)) {
      const last = msgs[msgs.length - 1];
      const tag = last.type === 'question' ? ' (QUESTION)' : '';
      if (last.type === 'question') hasQuestion = true;
      lines.push(`  [${room}] ${last.from}${tag}: ${last.content}`);
    }
    if (hasQuestion) {
      lines.push(`  Use ccchat skill to read and respond.`);
    }

    console.log(JSON.stringify({ decision: 'block', reason: lines.join('\n') }));
    return;
  }

  // No watcher notifications — skip server fallback.
  // The watcher is the source of truth for new messages. If it's not running yet,
  // startWatcher() above just launched it. It'll catch the next message.
  // Doing a server query here causes false alarms for new agents (cursor=0 → sees all history).
}

main().catch(() => {});
