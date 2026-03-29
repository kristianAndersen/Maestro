#!/usr/bin/env bun
// Diary Capture Hook for Maestro
// Purpose: Stages session metadata for diary-writer to process on next session start
// Trigger: SessionEnd (MUST run before session-finalizer.js which resets context.json)

import { readFileSync, writeFileSync, appendFileSync, mkdirSync, existsSync, readdirSync, unlinkSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CONTEXT_PATH = join(__dirname, '..', 'context.json');
const WORK_LOG_PATH = join(__dirname, '..', '..', '.maestro-work-log.txt');
const STAGING_DIR = join(__dirname, '..', 'memory', 'diary', 'staging');
const CAPTURE_LOG = join(__dirname, '..', 'memory', 'diary', 'capture-log.jsonl');
const MIN_PROMPTS = 5;
const MAX_STAGING_FILES = 10;
const MAX_CAPTURE_LOG_LINES = 100;
const CAPTURE_LOG_KEEP = 50;

function logCapture(entry) {
  try {
    appendFileSync(CAPTURE_LOG, JSON.stringify(entry) + '\n', 'utf-8');

    // Rotate capture log if too large
    try {
      const lines = readFileSync(CAPTURE_LOG, 'utf-8').trim().split('\n');
      if (lines.length > MAX_CAPTURE_LOG_LINES) {
        writeFileSync(CAPTURE_LOG, lines.slice(-CAPTURE_LOG_KEEP).join('\n') + '\n', 'utf-8');
      }
    } catch { /* rotation is best-effort */ }
  } catch { /* logging is best-effort */ }
}

function parseWorkLog(sessionStart) {
  try {
    if (!existsSync(WORK_LOG_PATH)) return [];

    const content = readFileSync(WORK_LOG_PATH, 'utf-8');
    const lines = content.trim().split('\n').filter(Boolean);
    const sessionStartTime = new Date(sessionStart).getTime();
    const files = new Set();

    for (const line of lines) {
      const match = line.match(/^\[(.+?)\] (\w+): (.+)$/);
      if (!match) continue;

      const [, timestamp, , pathsStr] = match;
      const entryTime = new Date(timestamp).getTime();

      // Only include entries from this session
      if (entryTime < sessionStartTime) continue;

      const paths = pathsStr.split(', ').map(p => p.trim()).filter(Boolean);
      for (const p of paths) {
        files.add(p);
      }
    }

    return [...files];
  } catch {
    return [];
  }
}

function main() {
  // Read stdin (same pattern as session-finalizer.js)
  let hookInput = {};
  try {
    const stdin = readFileSync(0, 'utf-8').trim();
    if (stdin) hookInput = JSON.parse(stdin);
  } catch {
    // Continue with defaults
  }

  const now = new Date().toISOString();

  // Read context.json for session metadata
  let context;
  try {
    if (!existsSync(CONTEXT_PATH)) {
      logCapture({ timestamp: now, sessionId: hookInput.session_id || null, turnCount: 0, captured: false, reason: 'no-context' });
      process.exit(0);
    }
    context = JSON.parse(readFileSync(CONTEXT_PATH, 'utf-8'));
  } catch {
    logCapture({ timestamp: now, sessionId: hookInput.session_id || null, turnCount: 0, captured: false, reason: 'no-context' });
    process.exit(0);
  }

  const promptCount = context.skillTracking?.promptCount || 0;
  const sessionId = context.skillTracking?.sessionId || hookInput.session_id || 'unknown';
  const sessionStart = context.skillTracking?.sessionStart || null;
  const activeDomain = context.activeDomain || null;

  // Guard: detect hook reordering (promptCount missing/0 means session-finalizer may have run first)
  if (!promptCount) {
    logCapture({ timestamp: now, sessionId, turnCount: 0, captured: false, reason: 'context-missing-or-stale' });
    process.exit(0);
  }

  // Guard: below threshold
  if (promptCount < MIN_PROMPTS) {
    logCapture({ timestamp: now, sessionId, turnCount: promptCount, captured: false, reason: 'below-threshold' });
    process.exit(0);
  }

  // Parse work log for files modified this session
  const filesModified = sessionStart ? parseWorkLog(sessionStart) : [];

  // Build staging object
  const stagingData = {
    timestamp: now,
    turnCount: promptCount,
    sessionId,
    activeDomain,
    sessionStart,
    firstUserMessage: null, // SessionEnd stdin doesn't provide this
    filesModified,
    evaluationStats: {
      totalDelegations: context.evaluationTracking?.totalDelegations || 0,
      complianceRate: context.evaluationTracking?.complianceRate || null
    }
  };

  // Ensure staging directory exists
  mkdirSync(STAGING_DIR, { recursive: true });

  // Write staging file
  const sanitizedTimestamp = now.replace(/[:.]/g, '-');
  const stagingFile = `${sanitizedTimestamp}.json`;
  const stagingPath = join(STAGING_DIR, stagingFile);

  try {
    writeFileSync(stagingPath, JSON.stringify(stagingData, null, 2), 'utf-8');
  } catch {
    logCapture({ timestamp: now, sessionId, turnCount: promptCount, captured: false, reason: 'write-failed' });
    process.exit(0);
  }

  // Prune staging directory to max files (keep newest)
  try {
    const stagingFiles = readdirSync(STAGING_DIR)
      .filter(f => f.endsWith('.json'))
      .sort(); // ISO timestamps sort lexicographically — oldest first

    if (stagingFiles.length > MAX_STAGING_FILES) {
      const toDelete = stagingFiles.slice(0, stagingFiles.length - MAX_STAGING_FILES);
      for (const file of toDelete) {
        unlinkSync(join(STAGING_DIR, file));
      }
    }
  } catch { /* pruning is best-effort */ }

  // Log successful capture
  logCapture({ timestamp: now, sessionId, turnCount: promptCount, captured: true, stagingFile });

  // Silent exit — SessionEnd hooks don't produce UI output
}

main();
