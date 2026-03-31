#!/usr/bin/env bun
// Shared Intent Classifier for Maestro Hooks
// Purpose: Detects informational/conversational intent to suppress false-positive keyword triggers
// Consumers: maestro-agent-suggester.js, subagent-skill-discovery.js, and any future keyword-reactive hook
// Design: Single shared utility per Ludvig's architectural requirement — not bespoke per-hook
//
// False-positive baseline (2026-03-30): 44.9% before this classifier was introduced
// Target: <10% false-positive rate on the same 167-prompt test set

/**
 * Informational intent patterns — phrases that indicate the user is asking
 * ABOUT something rather than requesting it to be done.
 *
 * Covers English interrogative forms. Multi-language support (Korean, Japanese, Chinese)
 * can be added as additional pattern arrays if needed.
 */
const INFORMATIONAL_PATTERNS = [
  // Direct questions about concepts
  /^what\s+is\b/i,
  /^what\s+are\b/i,
  /^what\s+does\b/i,
  /^what\s+do\b/i,
  /^how\s+does\b/i,
  /^how\s+do\b/i,
  /^how\s+is\b/i,
  /^how\s+are\b/i,
  /^why\s+does\b/i,
  /^why\s+do\b/i,
  /^why\s+is\b/i,
  /^who\s+is\b/i,
  /^where\s+is\b/i,
  /^when\s+does\b/i,
  /^when\s+do\b/i,
  // Explicit informational requests
  /^explain\b/i,
  /^describe\b/i,
  /^tell\s+me\s+about\b/i,
  /^tell\s+me\s+how\b/i,
  /^tell\s+me\s+what\b/i,
  /^show\s+me\s+how\b/i,
  /^can\s+you\s+explain\b/i,
  /^could\s+you\s+explain\b/i,
  /^what('s|\s+is)\s+the\s+difference\b/i,
  /^how\s+can\s+i\b/i,
  /^do\s+you\s+know\b/i,
  // Question about a thing (mid-sentence)
  /\bwhat\s+is\s+(a|an|the)\b/i,
  /\bhow\s+does\s+(a|an|the|this|that|it)\b/i,
];

/**
 * Agent-directed modal openings — polite task requests that end in ? but are NOT informational.
 * "can you fix this?", "could you update X?", "would you refactor Y?" are task requests.
 */
const AGENT_MODAL_RE = /^(can|could|would|will|please)\s+you\b/i;

/**
 * Slash command detection — prompts starting with / are Claude Code commands,
 * not agent task requests. Pure slash commands get hard-suppressed;
 * embedded references (mentioning /command in prose) get informational penalty.
 */
const PURE_SLASH_COMMAND = /^\/[a-zA-Z][\w-]*/;

/**
 * Conversational patterns — non-task prompts that shouldn't trigger agent suggestions
 */
const CONVERSATIONAL_PATTERNS = [
  /^(yes|no|yeah|nah|yep|nope|sure|ok|okay|cool|thanks|thank you|got it|makes sense|good|great|nice|agreed|continue|go ahead|proceed|do it|ship it|lgtm)[\s!?.]*$/i,
  /^(morning|mornings|hey|hi|hello|sup|yo)[\s!,.]*/i,
];

/**
 * Determines if a prompt expresses informational intent rather than task intent.
 *
 * @param {string} prompt - The user's prompt text
 * @returns {{ isInformational: boolean, confidence: string, reason: string }}
 */
export function isInformationalIntent(prompt) {
  if (!prompt || typeof prompt !== 'string') {
    return { isInformational: false, confidence: 'none', reason: 'empty-prompt' };
  }

  const trimmed = prompt.trim();

  // Check conversational patterns first (short, non-task messages)
  for (const pattern of CONVERSATIONAL_PATTERNS) {
    if (pattern.test(trimmed)) {
      return { isInformational: true, confidence: 'high', reason: 'conversational' };
    }
  }

  // Check informational patterns
  for (const pattern of INFORMATIONAL_PATTERNS) {
    if (pattern.test(trimmed)) {
      return { isInformational: true, confidence: 'high', reason: 'interrogative-start' };
    }
  }

  // Heuristic: ends with ? and is short (likely a question, not a task with a question mark)
  // Exclude agent-directed modal openings — "can you fix this?" is a task request, not informational
  if (trimmed.endsWith('?') && trimmed.split(/\s+/).length <= 15 && !AGENT_MODAL_RE.test(trimmed)) {
    return { isInformational: true, confidence: 'medium', reason: 'short-question' };
  }

  return { isInformational: false, confidence: 'none', reason: 'task-intent' };
}

/**
 * Detects slash command prompts.
 * @param {string} prompt
 * @returns {{ isSlash: boolean, type: 'pure'|'embedded'|'none' }}
 */
export function isSlashCommand(prompt) {
  if (!prompt || typeof prompt !== 'string') return { isSlash: false, type: 'none' };
  const trimmed = prompt.trim();
  if (PURE_SLASH_COMMAND.test(trimmed)) {
    return { isSlash: true, type: 'pure' };
  }
  if (/\s\/[a-zA-Z][\w-]*/.test(trimmed)) {
    return { isSlash: true, type: 'embedded' };
  }
  return { isSlash: false, type: 'none' };
}

/**
 * Returns a score penalty for informational prompts.
 * Used by scoring hooks to raise the effective threshold for informational queries.
 *
 * When a prompt is informational, this returns a negative penalty that
 * effectively raises the minimum score needed to trigger a suggestion.
 *
 * Current calibration: -5 penalty means informational prompts need score >= 15
 * (instead of the default >= 10) to trigger. This eliminates single-match triggers
 * while preserving multi-signal matches.
 *
 * Slash commands are checked first: pure slash commands get -100 (hard suppress),
 * embedded references get -8 (same as high-confidence informational).
 *
 * @param {string} prompt - The user's prompt text
 * @returns {number} Score adjustment (0 or negative)
 */
export function getIntentPenalty(prompt) {
  const slashResult = isSlashCommand(prompt);
  if (slashResult.isSlash) {
    return slashResult.type === 'pure' ? -100 : -8;
  }
  const result = isInformationalIntent(prompt);
  if (result.isInformational) {
    return result.confidence === 'high' ? -8 : -5;
  }
  return 0;
}
