// Shared utility to start/check the background watcher process.
// Used by both Stop and UserPromptSubmit hooks.

import { spawn } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { homedir } from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const NOTIFY_DIR = join(homedir(), '.claude', 'ccchat');

function pidPath(agentName) {
  return join(NOTIFY_DIR, `watcher-${agentName}.pid`);
}

function isWatcherRunning(agentName) {
  const p = pidPath(agentName);
  if (!existsSync(p)) return false;
  try {
    const pid = parseInt(readFileSync(p, 'utf8').trim(), 10);
    if (isNaN(pid)) return false;
    process.kill(pid, 0); // Check if alive
    return true;
  } catch {
    return false;
  }
}

export function startWatcher(agentName, rooms) {
  if (isWatcherRunning(agentName)) return;

  const watcherScript = join(__dirname, 'ccchat-watcher.js');
  const child = spawn('node', [
    watcherScript,
    '--name', agentName,
    '--rooms', (rooms || ['general']).join(','),
  ], {
    detached: true,
    stdio: 'ignore',
  });
  child.unref();
}

export function stopWatcher(agentName) {
  const p = pidPath(agentName);
  if (!existsSync(p)) return;
  try {
    const pid = parseInt(readFileSync(p, 'utf8').trim(), 10);
    if (!isNaN(pid)) process.kill(pid, 'SIGTERM');
  } catch { /* already dead */ }
}
