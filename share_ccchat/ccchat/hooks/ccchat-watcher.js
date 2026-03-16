#!/usr/bin/env node
// Background watcher — stays connected to ccchat via WebSocket and writes
// a notification marker file when messages arrive for this agent.
// Started automatically when an agent joins. Runs until killed.
//
// Usage: node ccchat-watcher.js --name <agent-name> --rooms general,dev

import WebSocket from 'ws';
import { writeFileSync, mkdirSync, existsSync, readFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { SERVER_URL, PORT, isServerAlive, ensureServer } from '../client/ccchat-client.js';

const NOTIFY_DIR = join(homedir(), '.claude', 'ccchat');
const RECONNECT_DELAY = 5000;
const HEARTBEAT_INTERVAL = 30000;

// Parse args
const args = process.argv.slice(2);
function getArg(name) {
  const idx = args.indexOf(`--${name}`);
  if (idx === -1 || idx + 1 >= args.length) return null;
  return args[idx + 1];
}

const agentName = getArg('name');
const rooms = (getArg('rooms') || 'general').split(',');

if (!agentName) {
  console.error('Usage: ccchat-watcher.js --name <agent-name> [--rooms room1,room2]');
  process.exit(1);
}

function notifyPath() {
  return join(NOTIFY_DIR, `notify-${agentName}.json`);
}

function pidPath() {
  return join(NOTIFY_DIR, `watcher-${agentName}.pid`);
}

function writeNotification(message) {
  if (!existsSync(NOTIFY_DIR)) mkdirSync(NOTIFY_DIR, { recursive: true });

  // Read existing notifications
  let notifications = [];
  const p = notifyPath();
  if (existsSync(p)) {
    try {
      notifications = JSON.parse(readFileSync(p, 'utf8'));
    } catch { notifications = []; }
  }

  // Append new notification (keep last 20)
  notifications.push({
    from: message.from_agent || message.name || 'unknown',
    content: (message.content || '').slice(0, 100),
    type: message.type || 'message',
    room: message.room || 'general',
    timestamp: Date.now(),
  });
  if (notifications.length > 20) notifications = notifications.slice(-20);

  writeFileSync(p, JSON.stringify(notifications));
}

function writePid() {
  if (!existsSync(NOTIFY_DIR)) mkdirSync(NOTIFY_DIR, { recursive: true });
  writeFileSync(pidPath(), String(process.pid));
}

function cleanupPid() {
  try { unlinkSync(pidPath()); } catch {}
}

// Kill any existing watcher for this agent
function killExisting() {
  const p = pidPath();
  if (existsSync(p)) {
    try {
      const pid = parseInt(readFileSync(p, 'utf8').trim(), 10);
      if (!isNaN(pid) && pid !== process.pid) {
        process.kill(pid, 'SIGTERM');
      }
    } catch { /* already dead */ }
  }
}

async function connectAndWatch() {
  await ensureServer();

  const ws = new WebSocket(SERVER_URL);
  let heartbeat;

  ws.on('open', () => {
    // Join all rooms as a listener — doesn't register as agent or mark online
    for (const room of rooms) {
      ws.send(JSON.stringify({
        type: 'join',
        name: agentName,
        role: 'peer',
        room,
        silent: true,
        listener: true,
      }));
    }

    // Heartbeat to keep connection alive
    heartbeat = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, HEARTBEAT_INTERVAL);
  });

  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data.toString());
      // Only notify on real messages from OTHER agents (skip system join/leave noise)
      if (msg.type === 'deliver' && msg.message) {
        const m = msg.message;
        if (m.from_agent !== agentName && m.type !== 'system') {
          writeNotification(m);
        }
      }
    } catch { /* ignore parse errors */ }
  });

  ws.on('close', () => {
    clearInterval(heartbeat);
    // Reconnect after delay
    setTimeout(connectAndWatch, RECONNECT_DELAY);
  });

  ws.on('error', () => {
    clearInterval(heartbeat);
    ws.close();
  });
}

// Main
killExisting();
writePid();
process.on('SIGTERM', () => { cleanupPid(); process.exit(0); });
process.on('SIGINT', () => { cleanupPid(); process.exit(0); });

connectAndWatch().catch(() => {
  setTimeout(connectAndWatch, RECONNECT_DELAY);
});
