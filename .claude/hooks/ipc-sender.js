#!/usr/bin/env bun

/**
 * IPC Sender Hook
 *
 * Purpose: Extract [IPC:<name>:<message>] markers from Claude responses and
 *          deliver them to the target session's mailbox
 * Trigger: Stop hook (reads full conversation transcript from stdin)
 *
 * Marker format: [IPC:targetName:message payload here]
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, renameSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { connectBroker, registerWithBroker, sendToBroker, closeBroker, ensureBroker } from './ipc-ws-client.js';

const IPC_MODE = process.env.IPC_MODE || 'file';

const IPC_DIR = join(homedir(), '.claude', 'ipc');
const REGISTRY_PATH = join(IPC_DIR, 'registry.json');
// Per-session state file keyed by parent PID — same key used by ipc-receiver.js
const SESSION_STATE_PATH = join(IPC_DIR, `.ppid-${process.ppid}.json`);

const IPC_MARKER_RE = /\[IPC:([a-zA-Z0-9_-]+):([^\]]+)\]/g;
const MESSAGE_TTL_MS = 4 * 60 * 60 * 1000; // 4 hours

/**
 * Atomic write: write to .tmp then rename (safe on POSIX)
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
 * Read stdin synchronously (Stop hook pattern)
 */
function readStdinSync() {
  try {
    return readFileSync(0, 'utf-8').trim();
  } catch {
    return '';
  }
}

/**
 * Get this session's ID.
 * Priority: .current-session.json (vanilla + Maestro) → context.json (Maestro fallback)
 */
function getSessionId() {
  // Read from per-session state file written by ipc-receiver.js on every UserPromptSubmit
  const state = loadJSON(SESSION_STATE_PATH, {});
  return state.sessionId || null;
}

/**
 * Get this session's registered name from registry
 */
function getSenderName(registry) {
  try {
    const sessionId = getSessionId();
    if (!sessionId) return 'unknown';
    const entry = Object.entries(registry.sessions || {}).find(
      ([, e]) => e.sessionId === sessionId
    );
    return entry ? entry[0] : 'unknown';
  } catch {
    return 'unknown';
  }
}

/**
 * Send IPC markers via WebSocket broker.
 * Returns true on success, false on any failure (caller falls back to file mode).
 */
async function sendViaWebSocket(markers, senderName, senderSessionId) {
  try {
    await ensureBroker();
    const ws = await connectBroker();
    if (!ws) return false;

    const reg = await registerWithBroker(ws, senderName, senderSessionId);
    if (!reg) { closeBroker(ws); return false; }

    const now = new Date();
    for (const { target, payload } of markers) {
      const message = {
        id: `msg-${crypto.randomUUID()}`,
        from: senderName,
        from_sessionId: senderSessionId,
        timestamp: now.toISOString(),
        expires_at: new Date(now.getTime() + MESSAGE_TTL_MS).toISOString(),
        payload,
        read: false,
      };
      await sendToBroker(ws, { type: 'send', target, message });
    }

    closeBroker(ws);
    return true;
  } catch {
    return false;
  }
}

/**
 * Send IPC markers via file-based mailboxes (original behavior).
 */
function sendViaFile(markers, senderName, senderSessionId) {
  // Ensure IPC dir exists
  mkdirSync(IPC_DIR, { recursive: true });

  // Load registry — if missing, nothing to do
  if (!existsSync(REGISTRY_PATH)) return;
  const registry = loadJSON(REGISTRY_PATH, { sessions: {} });

  const now = new Date();

  for (const { target, payload } of markers) {
    const targetEntry = registry.sessions?.[target];
    if (!targetEntry) continue; // Unknown target — skip silently

    const mailboxFile = targetEntry.mailbox || `mailbox-${target}.json`;
    const mailboxPath = join(IPC_DIR, mailboxFile);

    const mailbox = loadJSON(mailboxPath, { messages: [] });

    const newMessage = {
      id: `msg-${crypto.randomUUID()}`,
      from: senderName,
      from_sessionId: senderSessionId,
      timestamp: now.toISOString(),
      expires_at: new Date(now.getTime() + MESSAGE_TTL_MS).toISOString(),
      payload,
      read: false,
    };

    mailbox.messages = [...(mailbox.messages || []), newMessage];
    atomicWrite(mailboxPath, mailbox);
  }
}

async function main() {
  try {
    // Read full conversation from stdin (stays sync — Stop hook constraint)
    const transcript = readStdinSync();
    if (!transcript) process.exit(0);

    // Extract all IPC markers
    const markers = [];
    let match;
    while ((match = IPC_MARKER_RE.exec(transcript)) !== null) {
      markers.push({ target: match[1], payload: match[2].trim() });
    }

    if (markers.length === 0) process.exit(0);

    // Load registry for sender name resolution
    mkdirSync(IPC_DIR, { recursive: true });
    const registry = existsSync(REGISTRY_PATH)
      ? loadJSON(REGISTRY_PATH, { sessions: {} })
      : { sessions: {} };

    const senderName = getSenderName(registry);
    const senderSessionId = getSessionId() || 'unknown';

    if (IPC_MODE === 'websocket') {
      await sendViaWebSocket(markers, senderName, senderSessionId);
    } else if (IPC_MODE === 'dual') {
      await sendViaWebSocket(markers, senderName, senderSessionId);
      sendViaFile(markers, senderName, senderSessionId);
    } else {
      // 'file' (default) — original behavior, zero WebSocket involvement
      sendViaFile(markers, senderName, senderSessionId);
    }

    process.exit(0);
  } catch {
    // Silent exit on any error — never break the hook chain
    process.exit(0);
  }
}

main().catch(() => process.exit(0));
