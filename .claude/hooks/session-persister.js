#!/usr/bin/env bun
// Session Persister Hook for Maestro
// Purpose: Saves session state before context compaction or session end
// Triggers: PreCompact, SubagentStop

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure sessions directory exists
const SESSIONS_DIR = join(__dirname, '..', 'sessions');
const CONTEXT_PATH = join(__dirname, '..', 'context.json');
const WORK_LOG_PATH = join(__dirname, '..', '..', '.maestro-work-log.txt');

function main() {
  // Read hook input from stdin
  let hookInput = {};
  try {
    const stdin = readFileSync(0, 'utf-8').trim();
    if (stdin) hookInput = JSON.parse(stdin);
  } catch (e) {
    // No stdin or invalid JSON, continue with empty input
  }

  const sessionId = hookInput.session_id || 'unknown-session';
  const eventName = hookInput.hook_event_name || 'manual';

  // Ensure sessions directory exists
  if (!existsSync(SESSIONS_DIR)) {
    mkdirSync(SESSIONS_DIR, { recursive: true });
  }

  // Read current context
  let context = {};
  try {
    context = JSON.parse(readFileSync(CONTEXT_PATH, 'utf-8'));
  } catch (e) {
    // No context file, create minimal state
  }

  // Read recent work log entries (last 20 lines)
  let recentWork = [];
  try {
    const workLog = readFileSync(WORK_LOG_PATH, 'utf-8');
    const lines = workLog.trim().split('\n');
    recentWork = lines.slice(-20);
  } catch (e) {
    // No work log
  }

  // Build session backup
  const backup = {
    sessionId: sessionId,
    savedAt: new Date().toISOString(),
    savedBy: eventName,
    context: context,
    recentWork: recentWork,
    summary: {
      promptCount: context.skillTracking?.promptCount || 0,
      sessionStart: context.skillTracking?.sessionStart,
      activeDomain: context.activeDomain || null,
      lastEditedFile: context.lastEditedFile || null,
      skillsRecommended: context.skillTracking?.recommended || [],
      pendingEvaluations: context.evaluationTracking?.skippedEvaluations || 0,
      evaluationCompliance: context.evaluationTracking?.complianceRate || '100'
    }
  };

  // Save to session backup file
  const backupPath = join(SESSIONS_DIR, `${sessionId}.backup.json`);
  try {
    writeFileSync(backupPath, JSON.stringify(backup, null, 2), 'utf-8');
  } catch (e) {
    console.error(`Failed to save session backup: ${e.message}`);
    process.exit(0);
  }

  // Output confirmation (only for PreCompact/SessionEnd, not SubagentStop)
  if (eventName === 'PreCompact' || eventName === 'SessionEnd') {
    console.log(`╔════════════════════════════════════════════════════════════╗`);
    console.log(`║ 💾 SESSION STATE SAVED                                     ║`);
    console.log(`╠════════════════════════════════════════════════════════════╣`);
    console.log(`║ Trigger: ${eventName.padEnd(49)} ║`);
    console.log(`║ Prompts: ${String(backup.summary.promptCount).padEnd(49)} ║`);
    console.log(`║ Pending evaluations: ${String(backup.summary.pendingEvaluations).padEnd(37)} ║`);
    console.log(`║                                                            ║`);
    console.log(`║ Session can be restored on next /maestro start.            ║`);
    console.log(`╚════════════════════════════════════════════════════════════╝`);
  }
}

main();
