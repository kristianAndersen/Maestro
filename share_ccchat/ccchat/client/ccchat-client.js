import WebSocket from 'ws';
import { spawn } from 'child_process';
import { readFileSync, existsSync, writeFileSync, mkdirSync, readdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const PORT = parseInt(process.env.CCCHAT_PORT || '3737', 10);
export const SERVER_URL = `ws://127.0.0.1:${PORT}`;
export const HTTP_URL = `http://127.0.0.1:${PORT}`;
const PID_DIR = join(homedir(), '.claude', 'ccchat');
const PID_FILE = join(PID_DIR, 'server.pid');
const SERVER_SCRIPT = join(__dirname, '..', 'server', 'index.js');

export function isServerAlive() {
  if (!existsSync(PID_FILE)) return false;
  const pid = parseInt(readFileSync(PID_FILE, 'utf8').trim(), 10);
  if (isNaN(pid)) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

export async function ensureServer() {
  if (isServerAlive()) return true;

  // Spawn server detached
  const child = spawn('node', [SERVER_SCRIPT], {
    detached: true,
    stdio: 'ignore',
    env: { ...process.env, CCCHAT_PORT: String(PORT) },
  });
  child.unref();

  // Wait for server to be ready
  for (let i = 0; i < 30; i++) {
    await sleep(200);
    try {
      const res = await fetch(`${HTTP_URL}/health`);
      if (res.ok) return true;
    } catch { /* not ready yet */ }
  }
  throw new Error('Server failed to start within 6 seconds');
}

export function connect(timeoutMs = 5000) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(SERVER_URL);
    const timer = setTimeout(() => {
      ws.close();
      reject(new Error('Connection timeout'));
    }, timeoutMs);

    ws.on('open', () => {
      clearTimeout(timer);
      resolve(ws);
    });
    ws.on('error', (err) => {
      clearTimeout(timer);
      reject(err);
    });
  });
}

export function request(ws, payload, timeoutMs = 10000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      ws.off('message', handler);
      reject(new Error('Request timeout'));
    }, timeoutMs);
    const expectedType = RESPONSE_MAP[payload.type];
    const handler = (data) => {
      const msg = JSON.parse(data.toString());
      // Only resolve on the exact expected response type, or an error
      if (msg.type === expectedType || msg.type === 'error') {
        ws.off('message', handler);
        clearTimeout(timer);
        resolve(msg);
      }
      // Ignore everything else (stray delivers, broadcasts, etc.)
    };
    ws.on('message', handler);
    ws.send(JSON.stringify(payload));
  });
}

const RESPONSE_MAP = {
  join: 'joined',
  leave: 'left',
  read: 'read_response',
  status: 'status_response',
  question: 'question_created',
  ping: 'pong',
  message: 'message_sent',
  answer: 'deliver',
  agree: 'consensus_update',
  disagree: 'consensus_update',
};

export function close(ws) {
  return new Promise((resolve) => {
    ws.on('close', resolve);
    ws.close();
  });
}

export function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// Agent identity
// Stores a single identity file per agent name, plus a "last used" pointer.
const IDENTITY_DIR = PID_DIR;

export function getAgentIdentityPath(name) {
  if (name) return join(IDENTITY_DIR, `agent-${name}.json`);
  // Fallback: check for a "last used" pointer
  return join(IDENTITY_DIR, 'agent-current.json');
}

export function getAgentIdentity(forProjectPath) {
  // If a project path is given, find the identity that matches it
  if (forProjectPath) {
    const resolved = forProjectPath.replace(/\/+$/, '');
    try {
      const files = readdirSync(IDENTITY_DIR).filter(f => f.startsWith('agent-') && f.endsWith('.json') && f !== 'agent-current.json');
      for (const f of files) {
        try {
          const data = JSON.parse(readFileSync(join(IDENTITY_DIR, f), 'utf8'));
          if (data.projectPath && data.projectPath.replace(/\/+$/, '') === resolved) {
            return data;
          }
        } catch { /* skip */ }
      }
    } catch { /* fall through */ }
  }

  // Fallback: try the "current" pointer
  const currentPath = join(IDENTITY_DIR, 'agent-current.json');
  if (existsSync(currentPath)) {
    try {
      return JSON.parse(readFileSync(currentPath, 'utf8'));
    } catch { /* fall through */ }
  }
  return null;
}

export function saveAgentIdentity(identity) {
  if (!existsSync(IDENTITY_DIR)) mkdirSync(IDENTITY_DIR, { recursive: true });
  // Save both a named file and the "current" pointer
  const data = JSON.stringify(identity, null, 2);
  writeFileSync(join(IDENTITY_DIR, `agent-${identity.name}.json`), data);
  writeFileSync(join(IDENTITY_DIR, 'agent-current.json'), data);
}
