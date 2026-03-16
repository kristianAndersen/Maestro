#!/usr/bin/env bun

/**
 * IPC Receiver Hook
 *
 * Purpose: Inject cross-session messages as context banners at prompt submission
 * Trigger: UserPromptSubmit
 *
 * Behavior:
 * - Reads sessionId from stdin JSON
 * - Checks registry.json for this session's name
 * - If unnamed and banner not yet shown: prints registration prompt (once)
 * - If registered: reads mailbox, injects unread messages as banners
 * - Marks messages as read (atomic write)
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, renameSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { connectBroker, registerWithBroker, closeBroker, ensureBroker } from './ipc-ws-client.js';

const IPC_MODE = process.env.IPC_MODE || 'file';

const IPC_DIR = join(homedir(), '.claude', 'ipc');
const REGISTRY_PATH = join(IPC_DIR, 'registry.json');

// Per-session state file keyed by parent PID (stable across all hooks in one terminal)
const SESSION_STATE_PATH = join(IPC_DIR, `.ppid-${process.ppid}.json`);

/**
 * Read stdin to get session metadata (UserPromptSubmit format)
 */
async function readStdin() {
  return new Promise((resolve) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', chunk => (data += chunk));
    process.stdin.on('end', () => resolve(data.trim()));
  });
}

/**
 * Atomic write: write to .tmp then rename
 */
function atomicWrite(targetPath, data) {
  const tmpPath = targetPath + '.tmp';
  writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf-8');
  renameSync(tmpPath, targetPath);
}

/**
 * Load JSON file safely, returning defaultValue on any error
 */
function loadJSON(path, defaultValue = {}) {
  try {
    return JSON.parse(readFileSync(path, 'utf-8'));
  } catch {
    return defaultValue;
  }
}

/**
 * Format a banner line padded to fixed width
 */
function bannerLine(text, width = 62) {
  const padded = text.padEnd(width);
  return `║ ${padded} ║`;
}

/**
 * Build the unread messages banner
 */
function buildMessagesBanner(messages) {
  const lines = [];
  lines.push('╔════════════════════════════════════════════════════════════════╗');
  for (const msg of messages) {
    const ts = new Date(msg.timestamp).toISOString().replace('T', ' ').slice(0, 16);
    lines.push(bannerLine(`📬 CROSS-SESSION MESSAGE (from ${msg.from} @ ${ts})`));
    // Word-wrap payload at 62 chars
    const words = msg.payload.split(' ');
    let line = '';
    for (const word of words) {
      if ((line + ' ' + word).trim().length <= 62) {
        line = (line + ' ' + word).trim();
      } else {
        lines.push(bannerLine(line));
        line = word;
      }
    }
    if (line) lines.push(bannerLine(line));
  }
  lines.push('╚════════════════════════════════════════════════════════════════╝');
  return lines.join('\n');
}

/**
 * Build the unnamed-session registration prompt banner
 */
function buildUnnamedBanner() {
  const lines = [];
  lines.push('╔════════════════════════════════════════════════════════════════╗');
  lines.push(bannerLine('📡 IPC: This session has no name yet.'));
  lines.push(bannerLine('To enable cross-session messaging, ask the user to name'));
  lines.push(bannerLine('this session. Use: Communicator agent, action: register'));
  lines.push('╚════════════════════════════════════════════════════════════════╝');
  return lines.join('\n');
}

/**
 * Receive messages via WebSocket broker (real-time drain).
 * Returns an array of Message objects (may be empty).
 */
async function receiveViaWebSocket(sessionName, sessionId) {
  try {
    await ensureBroker();
    const ws = await connectBroker();
    if (!ws) return [];

    const reg = await registerWithBroker(ws, sessionName, sessionId);
    if (!reg) { closeBroker(ws); return []; }

    // Collect deliver events that arrive during registration flush
    const delivered = [];
    function collectDelivers(event) {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'deliver') delivered.push(msg.message);
      } catch { /* ignore */ }
    }
    ws.addEventListener('message', collectDelivers);

    // Send drain and await drain_response (2s timeout)
    const drainMessages = await new Promise((resolve) => {
      const timer = setTimeout(() => {
        ws.removeEventListener('message', drainHandler);
        resolve([]);
      }, 2000);

      function drainHandler(event) {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'drain_response') {
            clearTimeout(timer);
            ws.removeEventListener('message', drainHandler);
            resolve(msg.messages || []);
          }
        } catch { /* ignore */ }
      }

      ws.addEventListener('message', drainHandler);
      ws.send(JSON.stringify({ type: 'drain' }));
    });

    ws.removeEventListener('message', collectDelivers);
    closeBroker(ws);

    // Merge: flush deliveries + drain (deduplicate by id)
    const seenIds = new Set(delivered.map(m => m.id));
    for (const m of drainMessages) {
      if (!seenIds.has(m.id)) delivered.push(m);
    }

    return delivered;
  } catch {
    return [];
  }
}

async function main() {
  try {
    // Ensure IPC directory exists
    mkdirSync(IPC_DIR, { recursive: true });

    // Read stdin for session metadata
    const stdinData = await readStdin();
    let sessionId = null;
    try {
      const data = JSON.parse(stdinData);
      sessionId = data.sessionId || null;
    } catch {
      // Not JSON — skip
    }

    if (!sessionId) process.exit(0);

    // Persist sessionId to per-session state file (keyed by ppid — stable across hooks in one terminal)
    const state = loadJSON(SESSION_STATE_PATH, {});
    if (state.sessionId !== sessionId) {
      atomicWrite(SESSION_STATE_PATH, { sessionId, namedPromptShown: false });
    }

    // Load registry
    const registry = loadJSON(REGISTRY_PATH, { sessions: {} });

    // Find this session in registry by sessionId
    const sessionEntry = Object.entries(registry.sessions || {}).find(
      ([, entry]) => entry.sessionId === sessionId
    );

    if (!sessionEntry) {
      // Session is unnamed — show banner once per session
      const current = loadJSON(SESSION_STATE_PATH, {});
      if (!current.namedPromptShown) {
        console.log(buildUnnamedBanner());
        atomicWrite(SESSION_STATE_PATH, { ...current, namedPromptShown: true });
      }
      process.exit(0);
    }

    const [sessionName, entry] = sessionEntry;

    // ── WebSocket mode ──────────────────────────────────────────────────────
    if (IPC_MODE === 'websocket') {
      const wsMessages = await receiveViaWebSocket(sessionName, sessionId);
      if (wsMessages.length > 0) console.log(buildMessagesBanner(wsMessages));
      process.exit(0);
    }

    if (IPC_MODE === 'dual') {
      // WebSocket primary + file fallback with deduplication
      const wsMessages = await receiveViaWebSocket(sessionName, sessionId);

      const mailboxPath = join(IPC_DIR, entry.mailbox || `mailbox-${sessionName}.json`);
      const now = new Date();
      let fileMessages = [];

      if (existsSync(mailboxPath)) {
        const mailbox = loadJSON(mailboxPath, { messages: [] });
        fileMessages = (mailbox.messages || []).filter(
          msg => !msg.read && new Date(msg.expires_at) > now
        );
      }

      // Deduplicate: file messages not already received via WebSocket
      const seenIds = new Set(wsMessages.map(m => m.id));
      const combined = [...wsMessages];
      for (const m of fileMessages) {
        if (!seenIds.has(m.id)) combined.push(m);
      }

      if (combined.length > 0) {
        console.log(buildMessagesBanner(combined));

        // Mark file mailbox as read
        if (existsSync(mailboxPath)) {
          const mailbox = loadJSON(mailboxPath, { messages: [] });
          mailbox.messages = (mailbox.messages || []).map(msg => ({ ...msg, read: true }));
          atomicWrite(mailboxPath, mailbox);
        }
      }

      process.exit(0);
    }

    // ── File mode (default) — original behavior ─────────────────────────────
    const mailboxPath = join(IPC_DIR, entry.mailbox || `mailbox-${sessionName}.json`);

    if (!existsSync(mailboxPath)) process.exit(0);

    const mailbox = loadJSON(mailboxPath, { messages: [] });
    const now = new Date();

    // Filter: unread and not expired
    const unread = (mailbox.messages || []).filter(
      msg => !msg.read && new Date(msg.expires_at) > now
    );

    if (unread.length === 0) process.exit(0);

    // Print banner
    console.log(buildMessagesBanner(unread));

    // Mark all messages as read (atomic write)
    mailbox.messages = (mailbox.messages || []).map(msg => ({ ...msg, read: true }));
    atomicWrite(mailboxPath, mailbox);

    process.exit(0);
  } catch {
    // Silent exit on any error — never break the hook chain
    process.exit(0);
  }
}

main();
