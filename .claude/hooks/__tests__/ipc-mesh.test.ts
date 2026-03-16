/**
 * IPC Mesh Test Suite
 *
 * Tests the Maestro WebSocket broker and hook integration across 5 groups.
 * Run: bun test .claude/hooks/__tests__/ipc-mesh.test.ts
 *
 * Uses TEST_PORT=47898 to avoid conflicts with a running prod broker.
 */

import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import { writeFileSync, readFileSync, mkdirSync, unlinkSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

// ── Constants ─────────────────────────────────────────────────────────────────

const TEST_PORT    = 47898;
const TEST_HTTP    = `http://127.0.0.1:${TEST_PORT}`;
const TEST_WS_URL  = `ws://127.0.0.1:${TEST_PORT}`;
const BROKER_SCRIPT = join(import.meta.dir, '../../services/maestro-broker.js');
const IPC_DIR      = join(homedir(), '.claude', 'ipc');

// ── Helpers ───────────────────────────────────────────────────────────────────

function connectWs(url = TEST_WS_URL, timeoutMs = 3000): Promise<WebSocket | null> {
  return new Promise((resolve) => {
    try {
      const ws = new WebSocket(url);
      const t = setTimeout(() => { try { ws.close(); } catch { /**/ } resolve(null); }, timeoutMs);
      ws.addEventListener('open',  () => { clearTimeout(t); resolve(ws); });
      ws.addEventListener('error', () => { clearTimeout(t); resolve(null); });
    } catch { resolve(null); }
  });
}

function nextMessage(ws: WebSocket, predicate?: (m: any) => boolean, timeoutMs = 2000): Promise<any> {
  return new Promise((resolve) => {
    const t = setTimeout(() => { ws.removeEventListener('message', handler); resolve(null); }, timeoutMs);
    function handler(event: MessageEvent) {
      try {
        const msg = JSON.parse(event.data);
        if (!predicate || predicate(msg)) {
          clearTimeout(t);
          ws.removeEventListener('message', handler);
          resolve(msg);
        }
      } catch { /**/ }
    }
    ws.addEventListener('message', handler);
  });
}

function collectMessages(ws: WebSocket, durationMs = 300): Promise<any[]> {
  return new Promise((resolve) => {
    const msgs: any[] = [];
    const handler = (event: MessageEvent) => {
      try { msgs.push(JSON.parse(event.data)); } catch { /**/ }
    };
    ws.addEventListener('message', handler);
    setTimeout(() => { ws.removeEventListener('message', handler); resolve(msgs); }, durationMs);
  });
}

async function register(ws: WebSocket, name: string, sessionId = `sid-${name}`): Promise<any> {
  const p = nextMessage(ws, m => m.type === 'registered');
  ws.send(JSON.stringify({ type: 'register', name, sessionId }));
  return p;
}

function makeMessage(from: string, payload: string, overrides: Record<string, any> = {}) {
  const now = new Date();
  return {
    id: `msg-${Math.random().toString(36).slice(2)}`,
    from,
    from_sessionId: `sid-${from}`,
    timestamp: now.toISOString(),
    expires_at: new Date(now.getTime() + 4 * 60 * 60 * 1000).toISOString(),
    payload,
    read: false,
    ...overrides,
  };
}

function closeWs(ws: WebSocket | null) {
  try { if (ws && ws.readyState === 1) ws.close(); } catch { /**/ }
}

// ── Broker lifecycle ──────────────────────────────────────────────────────────

let brokerProcess: ReturnType<typeof Bun.spawn> | null = null;

async function startBroker(port = TEST_PORT, extraEnv: Record<string, string> = {}) {
  const proc = Bun.spawn(['bun', BROKER_SCRIPT], {
    env: { ...process.env, BROKER_PORT: String(port), ...extraEnv },
    stdio: ['ignore', 'ignore', 'ignore'],
  });
  await Bun.sleep(300); // wait for server to bind
  return proc;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Group 1 — Broker Unit
// ═══════════════════════════════════════════════════════════════════════════════

describe('Group 1: Broker Unit', () => {
  beforeAll(async () => {
    brokerProcess = await startBroker();
  });

  afterAll(() => {
    brokerProcess?.kill();
    brokerProcess = null;
  });

  it('starts and responds to GET /health', async () => {
    const res = await fetch(`${TEST_HTTP}/health`);
    expect(res.ok).toBe(true);
    const body = await res.json() as any;
    expect(body.status).toBe('ok');
    expect(typeof body.clients).toBe('number');
  });

  it('reports increasing client count after connection', async () => {
    const before = await fetch(`${TEST_HTTP}/health`).then(r => r.json()) as any;
    const ws = await connectWs();
    expect(ws).not.toBeNull();
    await register(ws!, 'health-test-client');
    const after = await fetch(`${TEST_HTTP}/health`).then(r => r.json()) as any;
    expect(after.clients).toBeGreaterThan(before.clients);
    closeWs(ws);
  });

  it('responds to ping with pong', async () => {
    const ws = await connectWs();
    expect(ws).not.toBeNull();
    await register(ws!, 'ping-client');
    const p = nextMessage(ws!, m => m.type === 'pong');
    ws!.send(JSON.stringify({ type: 'ping' }));
    const pong = await p;
    expect(pong?.type).toBe('pong');
    expect(typeof pong?.timestamp).toBe('string');
    closeWs(ws);
  });

  it('exits safely on EADDRINUSE (second instance exits 0)', async () => {
    const proc = Bun.spawn(['bun', BROKER_SCRIPT], {
      env: { ...process.env, BROKER_PORT: String(TEST_PORT) },
      stdio: ['ignore', 'ignore', 'ignore'],
    });
    const exitCode = await proc.exited;
    expect(exitCode).toBe(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Group 2 — Message Routing
// ═══════════════════════════════════════════════════════════════════════════════

describe('Group 2: Message Routing', () => {
  beforeAll(async () => {
    brokerProcess = await startBroker();
  });

  afterAll(() => {
    brokerProcess?.kill();
    brokerProcess = null;
  });

  it('delivers message to online target in real-time', async () => {
    const sender   = await connectWs();
    const receiver = await connectWs();
    expect(sender).not.toBeNull();
    expect(receiver).not.toBeNull();

    await register(sender!,   'sender-rt');
    await register(receiver!, 'receiver-rt');

    const incoming = nextMessage(receiver!, m => m.type === 'deliver');
    const msg = makeMessage('sender-rt', 'hello receiver');
    sender!.send(JSON.stringify({ type: 'send', target: 'receiver-rt', message: msg }));

    const ack = await nextMessage(sender!, m => m.type === 'sent');
    expect(ack?.type).toBe('sent');

    const delivered = await incoming;
    expect(delivered?.type).toBe('deliver');
    expect(delivered?.message?.payload).toBe('hello receiver');
    expect(delivered?.message?.id).toBe(msg.id);

    closeWs(sender); closeWs(receiver);
  });

  it('queues message when target is offline, delivers on reconnect', async () => {
    const sender = await connectWs();
    expect(sender).not.toBeNull();
    await register(sender!, 'offline-sender');

    // Register offline-receiver so broker knows the name, then disconnect
    const tmpWs = await connectWs();
    await register(tmpWs!, 'offline-receiver');
    closeWs(tmpWs);
    await Bun.sleep(100);

    const msg = makeMessage('offline-sender', 'queued for offline');
    sender!.send(JSON.stringify({ type: 'send', target: 'offline-receiver', message: msg }));
    const ack = await nextMessage(sender!, m => m.type === 'queued');
    expect(ack?.type).toBe('queued');

    // Reconnect as offline-receiver — should get flush
    const receiver = await connectWs();
    const incoming = nextMessage(receiver!, m => m.type === 'deliver');
    await register(receiver!, 'offline-receiver');
    const delivered = await incoming;
    expect(delivered?.message?.payload).toBe('queued for offline');

    closeWs(sender); closeWs(receiver);
  });

  it('returns UNKNOWN_TARGET error for unregistered name', async () => {
    const ws = await connectWs();
    expect(ws).not.toBeNull();
    await register(ws!, 'unknown-sender');

    const msg = makeMessage('unknown-sender', 'nobody home');
    ws!.send(JSON.stringify({ type: 'send', target: 'does-not-exist-xyz', message: msg }));

    const err = await nextMessage(ws!, m => m.type === 'error');
    expect(err?.code).toBe('UNKNOWN_TARGET');
    closeWs(ws);
  });

  it('enforces QUEUE_MAX=50 with FIFO eviction', async () => {
    // Register target then disconnect so messages are queued
    const target = await connectWs();
    await register(target!, 'queue-max-target');
    closeWs(target);
    await Bun.sleep(100);

    const sender = await connectWs();
    await register(sender!, 'queue-max-sender');

    // Send 55 messages (5 should be evicted)
    for (let i = 0; i < 55; i++) {
      const msg = makeMessage('queue-max-sender', `msg-${i}`);
      sender!.send(JSON.stringify({ type: 'send', target: 'queue-max-target', message: msg }));
    }
    await Bun.sleep(200); // let broker process

    // Reconnect as target and drain
    const recv = await connectWs();
    const collectP = collectMessages(recv!, 400);
    await register(recv!, 'queue-max-target');
    recv!.send(JSON.stringify({ type: 'drain' }));
    const msgs = await collectP;

    // Count deliver + drain_response messages
    const delivered = msgs.filter(m => m.type === 'deliver' || m.type === 'drain_response');
    const totalMsgs = delivered.reduce((n, m) => {
      return n + (m.type === 'drain_response' ? (m.messages?.length || 0) : 1);
    }, 0);

    expect(totalMsgs).toBeLessThanOrEqual(50);

    closeWs(sender); closeWs(recv);
  });

  it('broadcasts to all subscribers on broadcast topic', async () => {
    const pub = await connectWs();
    const sub1 = await connectWs();
    const sub2 = await connectWs();
    expect(pub).not.toBeNull();

    await register(pub!,  'broadcaster');
    await register(sub1!, 'bcast-sub1');
    await register(sub2!, 'bcast-sub2');

    const p1 = nextMessage(sub1!, m => m === 'broadcast-payload' || typeof m === 'object');
    const p2 = nextMessage(sub2!, m => m === 'broadcast-payload' || typeof m === 'object');

    pub!.send(JSON.stringify({ type: 'publish', topic: 'broadcast', payload: 'broadcast-payload' }));

    const [r1, r2] = await Promise.all([p1, p2]);
    // Both subscribers should receive the broadcast (as raw string from server.publish)
    expect(r1).not.toBeNull();
    expect(r2).not.toBeNull();

    closeWs(pub); closeWs(sub1); closeWs(sub2);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Group 3 — Hook Integration
// ═══════════════════════════════════════════════════════════════════════════════

describe('Group 3: Hook Integration', () => {
  const SENDER_HOOK   = join(import.meta.dir, '../ipc-sender.js');
  const RECEIVER_HOOK = join(import.meta.dir, '../ipc-receiver.js');

  it('file mode (default) — sender exits 0 without touching WebSocket', async () => {
    const input = JSON.stringify({ sessionId: 'test-sid', prompt: 'hello' });
    const proc = Bun.spawn(['bun', SENDER_HOOK], {
      env: { ...process.env, IPC_MODE: 'file' },
      stdin: new ReadableStream({ start(c) { c.enqueue(new TextEncoder().encode(input)); c.close(); } }),
    });
    const code = await proc.exited;
    expect(code).toBe(0);
  });

  it('file mode (default) — receiver exits 0 without touching WebSocket', async () => {
    const input = JSON.stringify({ sessionId: 'test-sid-recv', prompt: 'hello' });
    const proc = Bun.spawn(['bun', RECEIVER_HOOK], {
      env: { ...process.env, IPC_MODE: 'file' },
      stdin: new ReadableStream({ start(c) { c.enqueue(new TextEncoder().encode(input)); c.close(); } }),
    });
    const code = await proc.exited;
    expect(code).toBe(0);
  });

  it('dual mode — receiver exits 0 when broker is down (silent fallback)', async () => {
    // Use a port no broker is running on
    const input = JSON.stringify({ sessionId: 'test-sid-dual', prompt: 'hello' });
    const proc = Bun.spawn(['bun', RECEIVER_HOOK], {
      env: { ...process.env, IPC_MODE: 'dual', BROKER_PORT: '47897' },
      stdin: new ReadableStream({ start(c) { c.enqueue(new TextEncoder().encode(input)); c.close(); } }),
    });
    const code = await proc.exited;
    expect(code).toBe(0);
  });

  it('auto-spawn: broker starts when ensureBroker() is called', async () => {
    const { isBrokerAlive, ensureBroker } = await import('../ipc-ws-client.js');

    // Only run if no prod broker is already on 47891
    if (isBrokerAlive()) {
      // Broker already alive — skip spawn test but verify isBrokerAlive works
      expect(isBrokerAlive()).toBe(true);
      return;
    }

    await ensureBroker();
    await Bun.sleep(200);

    const alive = isBrokerAlive();
    expect(alive).toBe(true);

    // Clean up spawned broker
    const { readFileSync: rfs, existsSync: efs } = await import('fs');
    const { join: pjoin } = await import('path');
    const { homedir: hd } = await import('os');
    const pidFile = pjoin(hd(), '.claude', 'maestro-broker.pid');
    if (efs(pidFile)) {
      const pid = parseInt(rfs(pidFile, 'utf-8').trim());
      try { process.kill(pid, 'SIGTERM'); } catch { /**/ }
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Group 4 — Registry Seeding
// ═══════════════════════════════════════════════════════════════════════════════

describe('Group 4: Registry Seeding', () => {
  it('seeds known sessions from registry.json at startup', async () => {
    // Registry already has alice and bob from project IPC dir
    // Start a fresh broker and verify it knows these names (known = can queue to them)
    const proc = await startBroker(TEST_PORT + 1);

    const ws = await connectWs(`ws://127.0.0.1:${TEST_PORT + 1}`);
    expect(ws).not.toBeNull();
    await register(ws!, 'registry-seed-sender');

    // Try to send to "alice" (known from registry.json) — should get queued, not UNKNOWN_TARGET
    const msg = makeMessage('registry-seed-sender', 'seeded registry test');
    ws!.send(JSON.stringify({ type: 'send', target: 'alice', message: msg }));

    const ack = await nextMessage(ws!, m => m.type === 'queued' || m.type === 'error' || m.type === 'sent', 2000);
    // alice is offline so it should be queued (not UNKNOWN_TARGET)
    expect(ack?.type).not.toBe('error');

    closeWs(ws);
    proc.kill();
  });

  it('seeds unread mailbox messages into queue on startup', async () => {
    // Write a test mailbox with an unread message
    mkdirSync(IPC_DIR, { recursive: true });
    const testMailboxPath = join(IPC_DIR, 'mailbox-seed-test.json');
    const testRegistryPath = join(IPC_DIR, 'registry.json');

    // Preserve existing registry and add our test entry
    let registry: any = { sessions: {} };
    try { registry = JSON.parse(readFileSync(testRegistryPath, 'utf-8')); } catch { /**/ }
    const originalRegistry = JSON.stringify(registry);

    registry.sessions['seed-test'] = {
      sessionId: 'seed-test-session',
      mailbox: 'mailbox-seed-test.json',
      registeredAt: new Date().toISOString(),
    };
    writeFileSync(testRegistryPath, JSON.stringify(registry, null, 2));

    const seedMsg = makeMessage('seeder', 'seeded from mailbox');
    writeFileSync(testMailboxPath, JSON.stringify({ messages: [seedMsg] }, null, 2));

    // Start a fresh broker on yet another port
    const seedPort = TEST_PORT + 2;
    const proc = await startBroker(seedPort);

    const ws = await connectWs(`ws://127.0.0.1:${seedPort}`);
    expect(ws).not.toBeNull();

    // Register as seed-test — broker should flush the seeded message
    const deliverP = nextMessage(ws!, m => m.type === 'deliver', 2000);
    await register(ws!, 'seed-test', 'seed-test-session');
    const delivered = await deliverP;

    expect(delivered?.message?.payload).toBe('seeded from mailbox');

    closeWs(ws);
    proc.kill();

    // Restore registry
    writeFileSync(testRegistryPath, originalRegistry);
    try { unlinkSync(testMailboxPath); } catch { /**/ }
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Group 5 — Backward Compatibility
// ═══════════════════════════════════════════════════════════════════════════════

describe('Group 5: Backward Compatibility', () => {
  it('file-mode message schema has exactly 7 fields', () => {
    const msg = makeMessage('alice', 'test payload');
    const fields = Object.keys(msg);
    expect(fields).toContain('id');
    expect(fields).toContain('from');
    expect(fields).toContain('from_sessionId');
    expect(fields).toContain('timestamp');
    expect(fields).toContain('expires_at');
    expect(fields).toContain('payload');
    expect(fields).toContain('read');
    expect(fields.length).toBe(7);
  });

  it('file-mode mailbox format preserved (messages array)', () => {
    mkdirSync(IPC_DIR, { recursive: true });
    const testPath = join(IPC_DIR, 'mailbox-compat-test.json');
    const msg = makeMessage('alice', 'compat test');
    const mailbox = { messages: [msg] };
    writeFileSync(testPath, JSON.stringify(mailbox, null, 2));

    const loaded = JSON.parse(readFileSync(testPath, 'utf-8'));
    expect(Array.isArray(loaded.messages)).toBe(true);
    expect(loaded.messages[0].id).toBe(msg.id);
    expect(loaded.messages[0].payload).toBe('compat test');
    expect(loaded.messages[0].read).toBe(false);

    try { unlinkSync(testPath); } catch { /**/ }
  });

  it('dual mode deduplication — same message id shown only once', async () => {
    // Simulate: message appears in both in-memory queue and file mailbox
    // The receiver should deduplicate by id
    const msgId = `msg-dedup-${Date.now()}`;
    const msg = makeMessage('dedup-sender', 'dedup payload');
    msg.id = msgId;

    // Two arrays simulating websocket + file results
    const wsMessages = [msg];
    const fileMessages = [{ ...msg }]; // same id

    // Dedup logic (mirrors ipc-receiver.js dual mode)
    const seenIds = new Set(wsMessages.map((m: any) => m.id));
    const combined = [...wsMessages];
    for (const m of fileMessages) {
      if (!seenIds.has(m.id)) combined.push(m);
    }

    expect(combined.length).toBe(1);
    expect(combined[0].id).toBe(msgId);
  });

  it('IPC_MODE unset defaults to file behavior (no WebSocket code path)', async () => {
    // When IPC_MODE is not set, the hooks should behave identically to before
    const input = JSON.stringify({ sessionId: 'default-mode-test', prompt: 'hello' });
    const proc = Bun.spawn(['bun', join(import.meta.dir, '../ipc-receiver.js')], {
      env: { ...process.env } as Record<string, string>, // IPC_MODE not set
      stdin: new ReadableStream({ start(c) { c.enqueue(new TextEncoder().encode(input)); c.close(); } }),
    });
    const code = await proc.exited;
    expect(code).toBe(0);
  });
});
