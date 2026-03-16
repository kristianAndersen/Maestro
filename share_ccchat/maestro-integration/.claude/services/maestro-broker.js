#!/usr/bin/env bun

/**
 * Maestro WebSocket Broker
 *
 * Real-time pub/sub message routing between agent sessions.
 * Preserves full backward compatibility — only active when IPC_MODE=dual|websocket.
 *
 * Port:   47891 (localhost only, overridable via BROKER_PORT env)
 * Topics: broadcast, agent.<name>, context, maestro
 *
 * Start:  bun .claude/services/maestro-broker.js
 * Health: curl http://127.0.0.1:47891/health
 * Stop:   kill $(cat ~/.claude/maestro-broker.pid)
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, renameSync, unlinkSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const BROKER_PORT = parseInt(process.env.BROKER_PORT || '47891');
const BROKER_HOST = '127.0.0.1';
const PID_FILE = join(homedir(), '.claude', 'maestro-broker.pid');
const IPC_DIR = join(homedir(), '.claude', 'ipc');
const REGISTRY_PATH = join(IPC_DIR, 'registry.json');
const QUEUE_MAX = 50;

// ── In-memory state ──────────────────────────────────────────────────────────
const clients    = new Map(); // name → { ws, sessionId, connectedAt }
const queues     = new Map(); // name → Message[]
const agentReg   = new Map(); // name → entry (seeded from registry.json)
const knownNames = new Set(); // all names ever seen (for offline queuing)
const wsToName   = new WeakMap(); // ws → agentName

let server = null; // assigned after Bun.serve()

// ── Helpers ──────────────────────────────────────────────────────────────────

function loadJSON(filePath, defaultValue = {}) {
  try { return JSON.parse(readFileSync(filePath, 'utf-8')); }
  catch { return defaultValue; }
}

function atomicWrite(filePath, data) {
  const tmp = filePath + '.tmp';
  writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf-8');
  renameSync(tmp, filePath);
}

function sendWs(ws, obj) {
  try { ws.send(JSON.stringify(obj)); } catch { /* disconnected */ }
}

// ── 1.1  loadRegistry ────────────────────────────────────────────────────────

function loadRegistry() {
  const data = loadJSON(REGISTRY_PATH, { sessions: {} });
  for (const [name, entry] of Object.entries(data.sessions || {})) {
    agentReg.set(name, entry);
    knownNames.add(name);
  }
}

// ── 1.2  seedQueuesFromMailboxes ─────────────────────────────────────────────

function seedQueuesFromMailboxes() {
  if (!existsSync(IPC_DIR)) return;
  const now = new Date();
  for (const [name] of agentReg) {
    const mailboxPath = join(IPC_DIR, `mailbox-${name}.json`);
    if (!existsSync(mailboxPath)) continue;
    const mailbox = loadJSON(mailboxPath, { messages: [] });
    const unread = (mailbox.messages || []).filter(
      m => !m.read && new Date(m.expires_at) > now
    );
    if (unread.length > 0) {
      queues.set(name, unread.slice(-QUEUE_MAX));
    }
  }
}

// ── 1.3  handleRegister ──────────────────────────────────────────────────────

function handleRegister(ws, data) {
  const { name, sessionId } = data;
  if (!name) {
    sendWs(ws, { type: 'error', code: 'MISSING_NAME', message: 'name required' });
    return;
  }

  wsToName.set(ws, name);
  clients.set(name, { ws, sessionId: sessionId || null, connectedAt: new Date().toISOString() });
  knownNames.add(name);

  ws.subscribe('broadcast');
  ws.subscribe(`agent.${name}`);
  ws.subscribe('context');
  ws.subscribe('maestro');

  const queuedCount = (queues.get(name) || []).length;
  sendWs(ws, { type: 'registered', name, queuedCount });

  // 1.6 — flush queued messages immediately
  flushQueue(name, ws);
}

// ── 1.4  handleSend ──────────────────────────────────────────────────────────

function handleSend(ws, data) {
  const { target, message } = data;
  if (!target || !message) {
    sendWs(ws, { type: 'error', code: 'MISSING_FIELDS', message: 'target and message required' });
    return;
  }

  if (!knownNames.has(target)) {
    sendWs(ws, { type: 'error', code: 'UNKNOWN_TARGET', target });
    return;
  }

  const client = clients.get(target);
  if (client) {
    // Online — deliver live
    sendWs(client.ws, { type: 'deliver', message });
    sendWs(ws, { type: 'sent', target, id: message.id });
  } else {
    // Offline — enqueue + persist to mailbox
    enqueue(target, message);
    sendWs(ws, { type: 'queued', target, id: message.id });
  }
}

// ── 1.5  enqueue ─────────────────────────────────────────────────────────────

function enqueue(name, message) {
  const q = queues.get(name) || [];
  q.push(message);
  if (q.length > QUEUE_MAX) q.shift(); // FIFO eviction
  queues.set(name, q);

  // Also write to mailbox file for dual-mode compat
  mkdirSync(IPC_DIR, { recursive: true });
  const mailboxPath = join(IPC_DIR, `mailbox-${name}.json`);
  const mailbox = loadJSON(mailboxPath, { messages: [] });
  const existingIds = new Set((mailbox.messages || []).map(m => m.id));
  if (!existingIds.has(message.id)) {
    mailbox.messages = [...(mailbox.messages || []), message];
    try { atomicWrite(mailboxPath, mailbox); } catch { /* non-fatal */ }
  }
}

// ── 1.6  flushQueue ──────────────────────────────────────────────────────────

function flushQueue(name, ws) {
  const q = queues.get(name);
  if (!q || q.length === 0) return;
  for (const msg of q) {
    sendWs(ws, { type: 'deliver', message: msg });
  }
  queues.delete(name);
}

// ── handleDrain ──────────────────────────────────────────────────────────────

function handleDrain(ws) {
  const name = wsToName.get(ws);
  if (!name) {
    sendWs(ws, { type: 'drain_response', messages: [] });
    return;
  }
  const messages = queues.get(name) || [];
  queues.delete(name);
  sendWs(ws, { type: 'drain_response', messages });
}

// ── 1.7  handleDisconnect ────────────────────────────────────────────────────

function handleDisconnect(ws) {
  const name = wsToName.get(ws);
  if (name) clients.delete(name);
}

// ── 1.8  expireMessages ──────────────────────────────────────────────────────

function expireMessages() {
  const now = new Date();
  for (const [name, q] of queues) {
    const filtered = q.filter(m => new Date(m.expires_at) > now);
    if (filtered.length === 0) {
      queues.delete(name);
    } else if (filtered.length !== q.length) {
      queues.set(name, filtered);
    }
  }
}

// ── 1.9  handlePublish ───────────────────────────────────────────────────────

function handlePublish(ws, data) {
  const { topic, payload } = data;
  if (!topic || payload === undefined) {
    sendWs(ws, { type: 'error', code: 'MISSING_FIELDS', message: 'topic and payload required' });
    return;
  }
  if (server) {
    // Wrap in a typed envelope so clients can JSON.parse consistently
    server.publish(topic, JSON.stringify({ type: 'published', topic, payload }));
  }
}

function handleSubscribe(ws, data) {
  const { topic } = data;
  if (topic) ws.subscribe(topic);
}

function handlePing(ws) {
  sendWs(ws, { type: 'pong', timestamp: new Date().toISOString() });
}

// ── Message dispatcher ───────────────────────────────────────────────────────

function handleMessage(ws, rawData) {
  let data;
  try { data = JSON.parse(typeof rawData === 'string' ? rawData : rawData.toString()); }
  catch { return; }

  switch (data.type) {
    case 'register':  handleRegister(ws, data); break;
    case 'send':      handleSend(ws, data);     break;
    case 'drain':     handleDrain(ws);          break;
    case 'publish':   handlePublish(ws, data);  break;
    case 'subscribe': handleSubscribe(ws, data); break;
    case 'ping':      handlePing(ws);           break;
  }
}

// ── 1.10  PID file ───────────────────────────────────────────────────────────

function writePid() {
  mkdirSync(join(homedir(), '.claude'), { recursive: true });
  writeFileSync(PID_FILE, String(process.pid), 'utf-8');
}

function removePid() {
  try {
    if (existsSync(PID_FILE)) {
      const pid = parseInt(readFileSync(PID_FILE, 'utf-8').trim());
      if (pid === process.pid) unlinkSync(PID_FILE);
    }
  } catch { /* ignore */ }
}

function gracefulShutdown() {
  // Flush in-memory queues to mailbox files before exit
  for (const [name, q] of queues) {
    if (q.length === 0) continue;
    const mailboxPath = join(IPC_DIR, `mailbox-${name}.json`);
    const mailbox = loadJSON(mailboxPath, { messages: [] });
    const existingIds = new Set((mailbox.messages || []).map(m => m.id));
    const newMsgs = q.filter(m => !existingIds.has(m.id));
    if (newMsgs.length > 0) {
      mailbox.messages = [...(mailbox.messages || []), ...newMsgs];
      try { atomicWrite(mailboxPath, mailbox); } catch { /* non-fatal */ }
    }
  }
  removePid();
  process.exit(0);
}

// ── 1.11  main ───────────────────────────────────────────────────────────────

function main() {
  loadRegistry();
  seedQueuesFromMailboxes();

  try {
    server = Bun.serve({
      port: BROKER_PORT,
      hostname: BROKER_HOST,

      fetch(req, srv) {
        const url = new URL(req.url);

        if (url.pathname === '/health') {
          return Response.json({ status: 'ok', clients: clients.size });
        }

        // Upgrade WebSocket connections
        if (srv.upgrade(req)) return;

        return new Response('Not Found', { status: 404 });
      },

      websocket: {
        open(_ws)         { /* nothing until register */ },
        message(ws, data) { handleMessage(ws, data); },
        close(ws)         { handleDisconnect(ws); },
      },
    });
  } catch (err) {
    // EADDRINUSE — another broker is already running, exit cleanly
    if (err?.code === 'EADDRINUSE') process.exit(0);
    process.exit(1);
  }

  writePid();
  setInterval(expireMessages, 60_000);

  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT',  gracefulShutdown);
  process.on('exit',    removePid);
}

main();
