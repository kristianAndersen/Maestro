#!/usr/bin/env node
// UserPromptSubmit hook - lightweight check for unread messages.
// Checks watcher notification file first (instant), falls back to server query.

import { getAgentIdentity } from '../client/ccchat-client.js';
import { readFileSync, existsSync, unlinkSync } from 'fs';
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
    unlinkSync(p);
    return Array.isArray(data) ? data : [];
  } catch {
    try { unlinkSync(p); } catch {}
    return [];
  }
}

async function main() {
  const identity = getAgentIdentity(process.cwd());
  if (!identity) return;

  // Ensure watcher is running
  startWatcher(identity.name, identity.rooms || ['general']);

  // Check notification file first (instant) — filter out system messages (join/leave)
  const notifications = readAndClearNotifications(identity.name).filter(n =>
    n.type !== 'system' && n.from !== identity.name
  );
  if (notifications.length > 0) {
    const byRoom = {};
    for (const n of notifications) {
      const room = n.room || 'general';
      if (!byRoom[room]) byRoom[room] = [];
      byRoom[room].push(n);
    }

    const lines = [`CCCHAT: ${notifications.length} new message${notifications.length !== 1 ? 's' : ''}`];
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
    console.error(lines.join('\n'));
    return;
  }

  // No watcher notifications — nothing new. The watcher is the source of truth.
  // Avoid server fallback which causes false alarms for new agents (cursor=0).
}

main().catch(() => {});
