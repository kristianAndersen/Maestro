#!/usr/bin/env bun

/**
 * IPC WebSocket Client Utilities
 *
 * Shared module used by ipc-sender.js and ipc-receiver.js.
 * NOT a hook — not registered in settings.json.
 *
 * Exports: connectBroker, registerWithBroker, sendToBroker, closeBroker,
 *          isBrokerAlive, spawnBroker, ensureBroker
 */

import { existsSync, readFileSync, writeFileSync, statSync, unlinkSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const BROKER_PORT = parseInt(process.env.BROKER_PORT || '47891');
const BROKER_URL  = `ws://127.0.0.1:${BROKER_PORT}`;
const PID_FILE    = join(homedir(), '.claude', 'maestro-broker.pid');
const LOCK_FILE   = join(homedir(), '.claude', 'maestro-broker.lock');
const BROKER_PATH = join(import.meta.dir, '..', 'services', 'maestro-broker.js');
const LOCK_MAX_AGE_MS = 5000;

// ── isBrokerAlive ─────────────────────────────────────────────────────────────

export function isBrokerAlive() {
  try {
    if (!existsSync(PID_FILE)) return false;
    const pid = parseInt(readFileSync(PID_FILE, 'utf-8').trim());
    if (!pid || isNaN(pid)) return false;
    process.kill(pid, 0); // throws ESRCH if process doesn't exist
    return true;
  } catch {
    return false;
  }
}

// ── spawnBroker ──────────────────────────────────────────────────────────────

export async function spawnBroker() {
  try {
    // Lock file prevents concurrent spawn races
    if (existsSync(LOCK_FILE)) {
      const age = Date.now() - statSync(LOCK_FILE).mtimeMs;
      if (age < LOCK_MAX_AGE_MS) return; // another hook is spawning, skip
      // Stale lock (> 5s) — overwrite and spawn
    }

    writeFileSync(LOCK_FILE, String(process.pid), 'utf-8');

    if (existsSync(BROKER_PATH)) {
      const proc = Bun.spawn(['bun', BROKER_PATH], {
        detached: true,
        stdio: ['ignore', 'ignore', 'ignore'],
        env: { ...process.env },
      });
      proc.unref();
    }

    await Bun.sleep(50);
  } catch { /* silent */ } finally {
    try {
      if (existsSync(LOCK_FILE)) {
        const content = readFileSync(LOCK_FILE, 'utf-8').trim();
        if (content === String(process.pid)) unlinkSync(LOCK_FILE);
      }
    } catch { /* non-fatal */ }
  }
}

// ── ensureBroker ──────────────────────────────────────────────────────────────

export async function ensureBroker() {
  if (!isBrokerAlive()) await spawnBroker();
}

// ── connectBroker ─────────────────────────────────────────────────────────────

export function connectBroker(timeoutMs = 2000) {
  return new Promise((resolve) => {
    try {
      const ws = new WebSocket(BROKER_URL);
      const timer = setTimeout(() => { try { ws.close(); } catch { /**/ } resolve(null); }, timeoutMs);
      ws.addEventListener('open',  () => { clearTimeout(timer); resolve(ws); });
      ws.addEventListener('error', () => { clearTimeout(timer); resolve(null); });
    } catch {
      resolve(null);
    }
  });
}

// ── registerWithBroker ────────────────────────────────────────────────────────

export function registerWithBroker(ws, name, sessionId, timeoutMs = 2000) {
  return new Promise((resolve) => {
    const timer = setTimeout(() => { ws.removeEventListener('message', handler); resolve(null); }, timeoutMs);

    function handler(event) {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'registered') {
          clearTimeout(timer);
          ws.removeEventListener('message', handler);
          resolve({ queuedCount: msg.queuedCount || 0 });
        }
      } catch { /* ignore parse errors */ }
    }

    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ type: 'register', name, sessionId }));
  });
}

// ── sendToBroker ──────────────────────────────────────────────────────────────
// Sends a JSON payload and awaits the broker ack (sent / queued / error).

export function sendToBroker(ws, payload, timeoutMs = 1000) {
  return new Promise((resolve) => {
    if (!ws || ws.readyState !== 1 /* OPEN */) { resolve(null); return; }

    const timer = setTimeout(() => { ws.removeEventListener('message', handler); resolve(null); }, timeoutMs);

    function handler(event) {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'sent' || msg.type === 'queued' || msg.type === 'error') {
          clearTimeout(timer);
          ws.removeEventListener('message', handler);
          resolve(msg);
        }
      } catch { /* ignore */ }
    }

    ws.addEventListener('message', handler);
    try {
      ws.send(JSON.stringify(payload));
    } catch {
      clearTimeout(timer);
      ws.removeEventListener('message', handler);
      resolve(null);
    }
  });
}

// ── closeBroker ───────────────────────────────────────────────────────────────

export function closeBroker(ws) {
  try { if (ws && ws.readyState === 1) ws.close(); } catch { /* ignore */ }
}
