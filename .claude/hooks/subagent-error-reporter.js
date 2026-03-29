#!/usr/bin/env bun

import { readFileSync, writeFileSync, appendFileSync, existsSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Subagent Error Reporter Hook
 *
 * Purpose: Captures subagent completion metadata and detects failures.
 *          Logs all runs to subagent-runs.jsonl for diagnostics.
 *          Outputs a banner when errors are detected so Maestro can investigate.
 *
 * Trigger: SubagentStop
 * Output: Warning banner on detected errors; silent on success
 * Log: .claude/logs/subagent-runs.jsonl
 */

const LOGS_DIR = join(__dirname, '..', 'logs');
const RUNS_LOG = join(LOGS_DIR, 'subagent-runs.jsonl');
const MAX_LOG_LINES = 500; // Rotate after this many entries
const DELEGATION_LOG = join(LOGS_DIR, 'delegation.jsonl');

// Error indicators in subagent output
const ERROR_PATTERNS = [
  /\bError\b.*:/i,
  /\bfailed\b/i,
  /\bcould not\b/i,
  /\bunable to\b/i,
  /\bexception\b/i,
  /\btimeout\b/i,
  /\bpermission denied\b/i,
  /\bnot found\b/i,
  /\bENOENT\b/,
  /\bEACCES\b/,
  /\bECONNREFUSED\b/,
  /\btool.*not available\b/i,
  /\btool.*failed\b/i,
  /\bERROR REPORT\b/,        // Structured error block from agents
  /\bESCALATION REQUIRED\b/, // Agent escalation protocol
];

// Success indicators — if these are present alongside error patterns,
// the error was likely handled/recovered
const SUCCESS_PATTERNS = [
  /\bEXCELLENT\b/,
  /\bcompleted successfully\b/i,
  /\btask complete\b/i,
  /\bdeliverable\b/i,
  /\b✅\b/,
];


/**
 * Resolve real agent name from delegation.jsonl using agent_id lookup.
 * Falls back to raw agent_type if log is missing or agent_id not found.
 */
function resolveAgentName(agentId, fallback) {
  try {
    if (!existsSync(DELEGATION_LOG)) return fallback;
    const lines = readFileSync(DELEGATION_LOG, 'utf-8').trim().split('\n').filter(Boolean);
    // Search from newest to oldest — most recent delegation wins
    for (let i = lines.length - 1; i >= 0; i--) {
      try {
        const entry = JSON.parse(lines[i]);
        if (entry.agentId === agentId && entry.agentName && entry.agentName !== 'unknown') {
          return entry.agentName;
        }
      } catch { /* skip malformed lines */ }
    }
  } catch { /* fail silently */ }
  return fallback;
}

function classifyOutcome(lastMessage) {
  if (!lastMessage || lastMessage.trim().length === 0) {
    return { status: 'empty', errors: ['Subagent returned empty response'], recovered: false };
  }

  const errors = [];
  for (const pattern of ERROR_PATTERNS) {
    const match = lastMessage.match(pattern);
    if (match) {
      // Extract surrounding context (up to 120 chars around the match)
      const idx = lastMessage.indexOf(match[0]);
      const start = Math.max(0, idx - 60);
      const end = Math.min(lastMessage.length, idx + match[0].length + 60);
      errors.push(lastMessage.slice(start, end).replace(/\n/g, ' ').trim());
    }
  }

  if (errors.length === 0) {
    return { status: 'success', errors: [], recovered: false };
  }

  // Check if errors were recovered
  const hasSuccessIndicator = SUCCESS_PATTERNS.some(p => p.test(lastMessage));
  if (hasSuccessIndicator) {
    return { status: 'recovered', errors, recovered: true };
  }

  return { status: 'error', errors, recovered: false };
}

function extractStructuredError(lastMessage) {
  // Look for structured ERROR REPORT blocks from agents
  const errorBlockMatch = lastMessage.match(
    /ERROR REPORT[\s\S]*?(?=\n#{1,3}\s|\n---|\Z)/i
  );
  if (errorBlockMatch) {
    return errorBlockMatch[0].slice(0, 500); // Cap at 500 chars
  }
  return null;
}

function rotateLog() {
  try {
    if (!existsSync(RUNS_LOG)) return;
    const content = readFileSync(RUNS_LOG, 'utf-8');
    const lines = content.trim().split('\n');
    if (lines.length > MAX_LOG_LINES) {
      // Keep last 400 lines
      const trimmed = lines.slice(-400).join('\n') + '\n';
      writeFileSync(RUNS_LOG, trimmed, 'utf-8');
    }
  } catch (e) {
    // Rotation failure is not critical
  }
}

function main() {
  // Read hook input from stdin
  let hookInput = {};
  try {
    const stdin = readFileSync(0, 'utf-8').trim();
    if (stdin) hookInput = JSON.parse(stdin);
  } catch (e) {
    // No stdin or invalid JSON — exit silently
    process.exit(0);
  }

  // Only process SubagentStop events
  if (hookInput.hook_event_name !== 'SubagentStop') {
    process.exit(0);
  }

  const agentId = hookInput.agent_id || 'unknown';
  const rawAgentType = hookInput.agent_type || 'unknown';
  const agentType = resolveAgentName(agentId, rawAgentType);
  const sessionId = hookInput.session_id || 'unknown';
  const lastMessage = hookInput.last_assistant_message || '';
  const transcriptPath = hookInput.agent_transcript_path || null;

  // Classify the outcome
  const outcome = classifyOutcome(lastMessage);
  const structuredError = outcome.status === 'error'
    ? extractStructuredError(lastMessage)
    : null;

  // Build log entry
  const logEntry = {
    timestamp: new Date().toISOString(),
    sessionId,
    agentId,
    agentType,
    status: outcome.status,
    recovered: outcome.recovered,
    errorCount: outcome.errors.length,
    errors: outcome.errors.slice(0, 5), // Cap at 5 error snippets
    structuredError: structuredError,
    transcriptPath: transcriptPath,
    responseLengthChars: lastMessage.length,
  };

  // Ensure logs directory exists
  if (!existsSync(LOGS_DIR)) {
    mkdirSync(LOGS_DIR, { recursive: true });
  }

  // Append to JSONL log
  try {
    appendFileSync(RUNS_LOG, JSON.stringify(logEntry) + '\n', 'utf-8');
  } catch (e) {
    // Log write failure — output to stderr but don't block
    console.error(`[subagent-error-reporter] Failed to write log: ${e.message}`);
  }

  // Rotate if needed
  rotateLog();

  // Output banner only on errors (not recovered, not success)
  if (outcome.status === 'error') {
    const errorPreview = outcome.errors[0]
      ? outcome.errors[0].slice(0, 80)
      : 'Unknown error';

    console.log(`╔════════════════════════════════════════════════════════════╗`);
    console.log(`║ ⚠️  SUBAGENT ERROR DETECTED                                ║`);
    console.log(`╠════════════════════════════════════════════════════════════╣`);
    console.log(`║ Agent: ${agentType.padEnd(51)} ║`);
    console.log(`║ ID: ${agentId.slice(0, 20).padEnd(54)} ║`);
    console.log(`║ Errors: ${String(outcome.errors.length).padEnd(50)} ║`);
    console.log(`║ Preview: ${errorPreview.slice(0, 48).padEnd(49)} ║`);
    console.log(`║                                                            ║`);
    console.log(`║ 📋 Full log: .claude/logs/subagent-runs.jsonl              ║`);
    if (transcriptPath) {
      console.log(`║ 📜 Transcript: ${transcriptPath.slice(-42).padEnd(43)} ║`);
    }
    console.log(`║                                                            ║`);
    console.log(`║ TIP: Review the error log to diagnose the failure.         ║`);
    console.log(`║ Run: cat .claude/logs/subagent-runs.jsonl | jq 'select(    ║`);
    console.log(`║   .status=="error")' | tail -5                             ║`);
    console.log(`╚════════════════════════════════════════════════════════════╝`);
  }

  // On empty response, also warn (subagent may have crashed)
  if (outcome.status === 'empty') {
    console.log(`╔════════════════════════════════════════════════════════════╗`);
    console.log(`║ ⚠️  SUBAGENT RETURNED EMPTY RESPONSE                       ║`);
    console.log(`╠════════════════════════════════════════════════════════════╣`);
    console.log(`║ Agent: ${agentType.padEnd(51)} ║`);
    console.log(`║ ID: ${agentId.slice(0, 20).padEnd(54)} ║`);
    console.log(`║                                                            ║`);
    console.log(`║ The subagent may have crashed or hit a context limit.      ║`);
    console.log(`║ Check transcript for details.                              ║`);
    console.log(`╚════════════════════════════════════════════════════════════╝`);
  }
}

main();
