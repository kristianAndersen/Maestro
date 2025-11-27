#!/usr/bin/env node
// Session Finalizer Hook for Maestro
// Purpose: Archives session data and cleans up when session ends
// Trigger: SessionEnd

import { readFileSync, writeFileSync, mkdirSync, existsSync, renameSync, readdirSync, unlinkSync, statSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SESSIONS_DIR = join(__dirname, '..', 'sessions');
const ARCHIVES_DIR = join(SESSIONS_DIR, 'archives');
const CONTEXT_PATH = join(__dirname, '..', 'context.json');

function main() {
  // EMPIRICAL LOGGING: Test if SessionEnd actually fires
  const logPath = join(__dirname, 'session-finalizer.log');
  const timestamp = new Date().toISOString();

  // Read hook input from stdin
  let hookInput = {};
  try {
    const stdin = readFileSync(0, 'utf-8').trim();
    if (stdin) hookInput = JSON.parse(stdin);
  } catch {
    // Continue with defaults
  }

  const sessionId = hookInput.session_id || 'unknown-session';

  // Log execution evidence
  try {
    const logEntry = `[${timestamp}] SessionEnd FIRED - sessionId: ${sessionId}\n`;
    writeFileSync(logPath, logEntry, { flag: 'a' });
  } catch (logErr) {
    // Logging failed, but continue
  }

  // Ensure archives directory exists
  if (!existsSync(ARCHIVES_DIR)) {
    mkdirSync(ARCHIVES_DIR, { recursive: true });
  }

  // Move backup to archives if it exists
  const backupPath = join(SESSIONS_DIR, `${sessionId}.backup.json`);

  if (existsSync(backupPath)) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const archivePath = join(ARCHIVES_DIR, `${sessionId}-${timestamp}.json`);

    try {
      renameSync(backupPath, archivePath);
    } catch (err) {
      // Log error and attempt copy+delete as fallback
      console.error(`Archive rename failed: ${err.message}, attempting copy`);
      try {
        const backupData = readFileSync(backupPath, 'utf-8');
        writeFileSync(archivePath, backupData, 'utf-8');
        unlinkSync(backupPath);
      } catch (copyErr) {
        console.error(`Archive copy also failed: ${copyErr.message}`);
        // Leave backup in place for manual recovery
      }
    }
  }

  // Clean up old archives (keep last 10 by modification time, delete oldest)
  try {
    const archives = readdirSync(ARCHIVES_DIR)
      .filter(f => f.endsWith('.json'))
      .map(f => ({
        name: f,
        path: join(ARCHIVES_DIR, f),
        mtime: statSync(join(ARCHIVES_DIR, f)).mtime.getTime()
      }))
      .sort((a, b) => b.mtime - a.mtime); // Newest first by modification time

    if (archives.length > 10) {
      const toDelete = archives.slice(10); // Delete oldest (beyond first 10)
      for (const file of toDelete) {
        unlinkSync(file.path);
      }
    }
  } catch (err) {
    // Log cleanup errors but don't fail
    console.error(`Archive cleanup warning: ${err.message}`);
  }

  // Reset context for next session (preserve only essential data)
  try {
    const contextBefore = readFileSync(CONTEXT_PATH, 'utf-8');
    const context = JSON.parse(contextBefore);

    // Log state before reset
    try {
      const logEntry = `[${timestamp}] BEFORE RESET - context keys: ${Object.keys(context).join(', ')}\n`;
      writeFileSync(logPath, logEntry, { flag: 'a' });
    } catch {}

    // Create fresh context preserving only cross-session data
    const freshContext = {
      lastSessionId: sessionId,
      lastSessionEnd: new Date().toISOString(),
      // Preserve cumulative metrics
      historicalMetrics: {
        totalSessions: (context.historicalMetrics?.totalSessions || 0) + 1,
        totalDelegations: context.evaluationTracking?.totalDelegations || 0,
        averageCompliance: context.evaluationTracking?.complianceRate || '100'
      }
    };

    writeFileSync(CONTEXT_PATH, JSON.stringify(freshContext, null, 2), 'utf-8');

    // Log successful reset
    try {
      const logEntry = `[${timestamp}] AFTER RESET - fresh context written with ${Object.keys(freshContext).length} keys\n`;
      writeFileSync(logPath, logEntry, { flag: 'a' });
    } catch {}
  } catch (resetErr) {
    // Context reset failed, not critical - but LOG IT
    try {
      const logEntry = `[${timestamp}] RESET FAILED - Error: ${resetErr.message}\n`;
      writeFileSync(logPath, logEntry, { flag: 'a' });
    } catch {}
  }

  // Silent exit - SessionEnd shouldn't show UI
}

main();
