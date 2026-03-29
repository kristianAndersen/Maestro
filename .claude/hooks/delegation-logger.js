#!/usr/bin/env bun

import { readFileSync, writeFileSync, appendFileSync, existsSync, mkdirSync } from 'fs';
import { createHash } from 'crypto';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Delegation Logger Hook
 *
 * Purpose: Records Task tool dispatches so subagent-error-reporter can resolve
 *          real agent names at SubagentStop time (Claude Code always sends
 *          agent_type as 'general-purpose', making logs useless for debugging).
 *
 * Trigger: PostToolUse (matcher: "Task")
 * Output:  .claude/logs/delegation.jsonl — one line per Task dispatch:
 *          { timestamp, sessionId, agentId, agentName, taskSummary }
 *
 * v2: Extend with fuller delegation context (feeds items #7 and #9 of proposal).
 */

const LOGS_DIR = join(__dirname, '..', 'logs');
const DELEGATION_LOG = join(LOGS_DIR, 'delegation.jsonl');
const MAX_LOG_LINES = 1000;

function rotateLog() {
  try {
    if (!existsSync(DELEGATION_LOG)) return;
    const content = readFileSync(DELEGATION_LOG, 'utf-8');
    const lines = content.trim().split('\n');
    if (lines.length > MAX_LOG_LINES) {
      const trimmed = lines.slice(-800).join('\n') + '\n';
      writeFileSync(DELEGATION_LOG, trimmed, 'utf-8');
    }
  } catch {
    // Rotation failure is not critical
  }
}

/**
 * Generate a short hash from the task summary for correlating
 * dispatch (PreToolUse) and completion (PostToolUse) log entries.
 */
function taskHash(prompt) {
  const summary = (prompt || '').slice(0, 200).replace(/\s+/g, ' ').trim();
  return createHash('sha256').update(summary).digest('hex').slice(0, 12);
}

/**
 * Extract agent name from Task tool input.
 * Claude Code passes Task tool input as JSON with an 'agent' field.
 * Falls back to parsing the prompt for a known agent name pattern.
 */
function extractAgentName(toolInput) {
  if (!toolInput) return 'unknown';

  // Try structured field first
  if (toolInput.agent) return toolInput.agent;
  if (toolInput.agent_name) return toolInput.agent_name;

  // Parse known agent names from prompt text
  const prompt = toolInput.prompt || toolInput.description || JSON.stringify(toolInput);
  const knownAgents = [
    'm-file-writer', 'file-writer', 'file-reader', 'base-research', 'base-analysis',
    'fetch', 'gemini-brain', 'harry', 'agent-refactorer', 'diary-writer', 'reflector',
    'excel', 'agent-creator', 'delegater', '4d-evaluation', 'list', 'open',
    'create-agent', 'create-commands', 'create-hooks', 'create-subagents',
    'hook-auditor', 'skill-auditor', 'subagent-auditor', 'maestro'
  ];

  const promptLower = prompt.toLowerCase();
  for (const agent of knownAgents) {
    if (promptLower.includes(agent)) return agent;
  }

  return 'unknown';
}

function main() {
  let hookInput = {};
  try {
    const stdin = readFileSync(0, 'utf-8').trim();
    if (stdin) hookInput = JSON.parse(stdin);
  } catch {
    process.exit(0);
  }

  // Only process Task tool PostToolUse events
  const toolName = hookInput.tool_name || hookInput.tool || '';
  if (toolName !== 'Agent') {
    process.exit(0);
  }

  const agentId = hookInput.agent_id || hookInput.subagent_id || 'unknown';
  const sessionId = hookInput.session_id || 'unknown';
  const toolInput = hookInput.tool_input || hookInput.input || null;
  const agentName = extractAgentName(toolInput);

  // Brief task summary (first 120 chars of prompt)
  const prompt = toolInput?.prompt || toolInput?.description || '';
  const taskSummary = prompt.slice(0, 120).replace(/\n/g, ' ');

  const hash = taskHash(prompt);

  const entry = {
    timestamp: new Date().toISOString(),
    phase: 'completion',
    taskHash: hash,
    sessionId,
    agentId,
    agentName,
    taskSummary,
  };

  // Ensure logs directory exists
  if (!existsSync(LOGS_DIR)) {
    mkdirSync(LOGS_DIR, { recursive: true });
  }

  try {
    appendFileSync(DELEGATION_LOG, JSON.stringify(entry) + '\n', 'utf-8');
  } catch (e) {
    console.error(`[delegation-logger] Failed to write log: ${e.message}`);
  }
}

main();
