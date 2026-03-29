#!/usr/bin/env bun

import { readFileSync, existsSync, appendFileSync, mkdirSync } from 'fs';
import { createHash } from 'crypto';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Pre-Delegation Validator Hook
 *
 * Purpose: Structural enforcement of delegation quality before Task tool fires.
 *          Replaces soft enforcement (maestro.md instructions) with a real hook.
 *
 * Trigger: PreToolUse (matcher: "Task")
 * Output:  Warning banner if validation fails. Does NOT block execution —
 *          surfaces the issue so the conductor can self-correct.
 *
 * Validates against: .claude/schemas/delegation-context.json
 *
 * History:
 *   v1: Soft enforcement via maestro.md instructions (item #3)
 *   v2: This hook — structural enforcement (item #8)
 */

const SCHEMA_PATH = join(__dirname, '..', 'schemas', 'delegation-context.json');
const REGISTRY_PATH = join(__dirname, '..', 'agents', 'agent-registry.json');
const LOGS_DIR = join(__dirname, '..', 'logs');
const DELEGATION_LOG = join(LOGS_DIR, 'delegation.jsonl');

/**
 * Load delegation context schema
 */
function loadSchema() {
  try {
    if (existsSync(SCHEMA_PATH)) {
      return JSON.parse(readFileSync(SCHEMA_PATH, 'utf-8'));
    }
  } catch (e) {
    console.error(`[pre-delegation-validator] Could not load schema: ${e.message}`);
  }
  // Fallback minimal schema
  return {
    requiredFields: ['prompt', 'description'],
    maxPromptLength: 50000,
    minPromptLength: 20,
    requireSubagentType: true
  };
}

/**
 * Load known agent names from registry
 */
function loadKnownAgents() {
  try {
    if (existsSync(REGISTRY_PATH)) {
      const registry = JSON.parse(readFileSync(REGISTRY_PATH, 'utf-8'));
      return Object.keys(registry.agents || {});
    }
  } catch {
    // Fall through to fallback
  }
  // Hardcoded fallback if registry is unreadable
  return [
    'm-file-writer', 'file-writer', 'file-reader', 'base-research', 'base-analysis',
    'fetch', 'gemini-brain', 'harry', 'agent-refactorer', 'diary-writer', 'reflector',
    'excel', 'agent-creator', 'delegater', '4d-evaluation', 'list', 'open',
    'create-subagents', 'create-commands', 'create-hooks', 'create-meta-prompts',
    'hook-auditor', 'skill-auditor', 'subagent-auditor', 'slash-command-auditor',
    'maestro', 'ccchat', 'communicator', 'ui-ux-designer', 'ai-pulse',
    'emilio', 'ludvig', 'nicola'
  ];
}

/**
 * Validate Task tool input against schema
 * Returns array of validation issues (empty = valid)
 */
function validate(toolInput, schema, knownAgents) {
  const issues = [];

  if (!toolInput || typeof toolInput !== 'object') {
    issues.push('Task tool input is empty or not an object');
    return issues;
  }

  const prompt = toolInput.prompt || '';
  const description = toolInput.description || '';
  const subagentType = toolInput.subagent_type || toolInput.agent || '';

  // 1. Required fields check
  if (!prompt || prompt.trim().length === 0) {
    issues.push('Missing required field: prompt (the delegation instructions)');
  }

  if (!description || description.trim().length === 0) {
    issues.push('Missing required field: description (short task summary)');
  }

  // 2. Prompt length bounds
  if (prompt.length > 0 && prompt.length < (schema.minPromptLength || 20)) {
    issues.push(`Prompt too short (${prompt.length} chars) — likely insufficient context for subagent`);
  }

  if (prompt.length > (schema.maxPromptLength || 50000)) {
    issues.push(`Prompt too long (${prompt.length} chars) — likely context pollution. Max: ${schema.maxPromptLength || 50000}`);
  }

  // 3. Subagent type validation
  if (schema.requireSubagentType !== false) {
    if (!subagentType) {
      // Not blocking — general-purpose agent is valid fallback
      // Just note it for observability
    } else if (knownAgents.length > 0 && !knownAgents.includes(subagentType)) {
      issues.push(`Unknown subagent_type: "${subagentType}" — not found in agent-registry.json`);
    }
  }

  // 4. 3P structure detection (advisory, not blocking)
  if (prompt.length > 100) {
    const has3P = /\bPRODUCT\b/i.test(prompt) && 
                  /\bPROCESS\b/i.test(prompt) && 
                  /\bPERFORMANCE\b/i.test(prompt);
    if (!has3P) {
      // Advisory only — some delegations legitimately don't use full 3P
      // (e.g., simple read/list operations)
    }
  }

  // 5. Context pollution signals
  const pollutionPatterns = [
    { pattern: /4D-EVALUATION REPORT/i, signal: 'Contains 4D evaluation report — should not be in delegation context' },
    { pattern: /SUBAGENT REPORT[\s\S]{2000,}/i, signal: 'Contains large subagent report — likely context pollution' },
    { pattern: /━{20,}[\s\S]{5000,}━{20,}/i, signal: 'Contains large embedded work product — delegation context should be lean' },
  ];

  for (const { pattern, signal } of pollutionPatterns) {
    if (pattern.test(prompt)) {
      issues.push(signal);
    }
  }

  return issues;
}

/**
 * Format validation issues as a warning banner
 */
function formatWarning(issues) {
  const lines = [];
  lines.push('');
  lines.push('╔════════════════════════════════════════════════════════════╗');
  lines.push('║ ⚠️  PRE-DELEGATION VALIDATION WARNING                      ║');
  lines.push('╠════════════════════════════════════════════════════════════╣');
  lines.push('║                                                            ║');

  for (const issue of issues) {
    // Wrap long lines
    const wrapped = issue.length > 54 
      ? issue.slice(0, 54) + '…'
      : issue;
    lines.push(`║ • ${wrapped.padEnd(56)}║`);
  }

  lines.push('║                                                            ║');
  lines.push('║ 📋 Consider fixing before proceeding with delegation.      ║');
  lines.push('║    Corrupt context propagates failures downstream.         ║');
  lines.push('║                                                            ║');
  lines.push('╚════════════════════════════════════════════════════════════╝');
  lines.push('');

  return lines.join('\n');
}


/**
 * Generate a short hash from the task summary for correlating
 * dispatch (PreToolUse) and completion (PostToolUse) log entries.
 */
function taskHash(prompt) {
  const summary = (prompt || '').slice(0, 200).replace(/\s+/g, ' ').trim();
  return createHash('sha256').update(summary).digest('hex').slice(0, 12);
}

// --- Main ---
function main() {
  let hookInput = {};
  try {
    const stdin = readFileSync(0, 'utf-8').trim();
    if (stdin) hookInput = JSON.parse(stdin);
  } catch {
    process.exit(0);
  }

  // Only validate Task tool calls
  const toolName = hookInput.tool_name || hookInput.tool || '';
  if (toolName !== 'Agent') {
    process.exit(0);
  }

  const toolInput = hookInput.tool_input || hookInput.input || null;
  const schema = loadSchema();
  const knownAgents = loadKnownAgents();
  const issues = validate(toolInput, schema, knownAgents);

  if (issues.length > 0) {
    console.log(formatWarning(issues));
  }


  // --- Dispatch Timestamp Logging ---
  // Write a dispatch-phase entry to delegation.jsonl for latency measurement.
  // The PostToolUse hook (delegation-logger.js) writes the completion-phase entry.
  // Both share a taskHash for correlation.
  try {
    const prompt = toolInput?.prompt || toolInput?.description || '';
    const subagentType = toolInput?.subagent_type || toolInput?.agent || 'general-purpose';
    const summary = prompt.slice(0, 120).replace(/\n/g, ' ');
    const hash = taskHash(prompt);

    if (!existsSync(LOGS_DIR)) {
      mkdirSync(LOGS_DIR, { recursive: true });
    }

    const entry = {
      timestamp: new Date().toISOString(),
      phase: 'dispatch',
      taskHash: hash,
      agentName: subagentType,
      taskSummary: summary,
    };

    appendFileSync(DELEGATION_LOG, JSON.stringify(entry) + '\n', 'utf-8');
  } catch {
    // Fail gracefully — logging must not block delegation
  }

  // Always exit 0 — validation is advisory, not blocking
  // Blocking would require user to dismiss errors for every delegation
  process.exit(0);
}

main();
