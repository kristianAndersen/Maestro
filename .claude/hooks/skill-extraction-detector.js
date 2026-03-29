#!/usr/bin/env bun

import { readFileSync } from 'fs';

/**
 * Skill Extraction Detector Hook
 *
 * Purpose: Detects when a session produces an EXCELLENT 4D evaluation result
 *          and proposes extracting the successful pattern as a reusable skill.
 * Trigger: Stop hook (when conversation/task ends)
 * Output:  Suggestion banner with detected pattern, proposed skill name,
 *          and the command to create it via Harry.
 *
 * Design principles:
 * - Read-only: never writes files, never modifies state
 * - Low false-positive rate: better to miss than to spam
 * - Lightweight: no filesystem I/O beyond stdin, target <30ms
 * - Non-blocking: exits 0 regardless of outcome
 */

// --- Read stdin ---

let context = '';
try {
  context = readFileSync(0, 'utf-8').trim();
} catch {
  process.exit(0);
}

if (!context) {
  process.exit(0);
}

// --- Detection: EXCELLENT verdict ---

/**
 * Returns true when the conversation contains a confirmed EXCELLENT 4D verdict.
 * Mirrors the detection logic in enforce-4d-evaluation.js so both hooks agree
 * on what "a completed evaluation" looks like.
 */
function detectExcellentVerdict(ctx) {
  const hasEvaluationReport =
    /\b4D-EVALUATION REPORT\b/i.test(ctx) ||
    /\b4-D EVALUATION REPORT\b/i.test(ctx);

  const hasExcellentVerdict = /\bVERDICT:\s*EXCELLENT\b/i.test(ctx);

  const hasAllDiscernments =
    /\bProduct Discernment\b/i.test(ctx) &&
    /\bProcess Discernment\b/i.test(ctx) &&
    /\bPerformance Discernment\b/i.test(ctx);

  const has4dAgent =
    /subagent_type=["']4d-evaluation["']/i.test(ctx);

  return (hasEvaluationReport || has4dAgent) &&
         hasExcellentVerdict &&
         hasAllDiscernments;
}

// --- Detection: Novelty analysis ---

/**
 * Signals that indicate ROUTINE work — skip suggestion.
 * These are common, low-value, non-reusable operations.
 */
const ROUTINE_SIGNALS = [
  // Simple file operations
  /\bread(?:ing)?\s+(?:a\s+)?file/i,
  /\bbasic\s+(?:file|edit|read|write)\b/i,
  /\bgit\s+(?:commit|push|pull|status|log|diff|add|checkout|branch)\b/i,
  /\bstandard\s+(?:git|file|edit)\s+op/i,
  // Single-step tasks
  /\bsimple\s+(?:rename|move|copy|delete)\b/i,
  /\bformat(?:ting)?\s+(?:a\s+)?file/i,
  /\bfix(?:ing)?\s+(?:a\s+)?typo/i,
  /\bupdate(?:d)?\s+(?:a\s+)?(?:version|dependency|package)\b/i,
  // Boilerplate generation without methodology
  /\bscaffold(?:ing)?\s+(?:a\s+)?(?:new\s+)?(?:file|directory|folder)\b/i,
];

/**
 * Signals that indicate NOVEL, REUSABLE work — candidate for skill extraction.
 * Each match adds weight; we require a minimum score to suggest.
 */
const NOVELTY_SIGNALS = [
  // Multi-step workflows
  { pattern: /\bmulti[- ]?step\s+workflow\b/i, weight: 3 },
  { pattern: /\bphase\s+\d+/i, weight: 2 },
  { pattern: /\bstep\s+\d+\s+of\s+\d+/i, weight: 2 },
  { pattern: /\biterat(?:e|ed|ing|ion)\b/i, weight: 1 },
  // Custom analysis methodology
  { pattern: /\banalysis\s+methodology\b/i, weight: 3 },
  { pattern: /\bheuristic\b/i, weight: 2 },
  { pattern: /\bpattern\s+detection\b/i, weight: 2 },
  { pattern: /\bscoring\s+(?:system|criteria|rubric)\b/i, weight: 3 },
  { pattern: /\bevaluat(?:e|ed|ion)\s+(?:criteria|framework|rubric)\b/i, weight: 2 },
  // Domain-specific patterns
  { pattern: /\bdomain[- ]specific\b/i, weight: 3 },
  { pattern: /\breusable\s+(?:pattern|approach|methodology)\b/i, weight: 4 },
  { pattern: /\bnovel\s+approach\b/i, weight: 3 },
  // Reusable automation
  { pattern: /\bautomat(?:e|ed|ion)\b/i, weight: 2 },
  { pattern: /\bpipeline\b/i, weight: 2 },
  { pattern: /\borchestrat(?:e|ed|ion)\b/i, weight: 2 },
  { pattern: /\bcoordination\s+pattern\b/i, weight: 3 },
  // Delegation and quality patterns
  { pattern: /\bdelegation\s+(?:pattern|strategy|approach)\b/i, weight: 3 },
  { pattern: /\bquality\s+gate\b/i, weight: 2 },
  { pattern: /\biterative\s+refinement\b/i, weight: 2 },
  // Agent / skill / hook / command creation
  { pattern: /\bnew\s+(?:agent|skill|hook|command)\b/i, weight: 2 },
  { pattern: /\bcreated?\s+(?:a\s+)?(?:agent|skill|hook|command)\b/i, weight: 2 },
  // Architecture-level decisions
  { pattern: /\barchitectur(?:e|al)\s+(?:decision|pattern|approach)\b/i, weight: 3 },
  { pattern: /\bdesign\s+pattern\b/i, weight: 2 },
  { pattern: /\bsystem\s+design\b/i, weight: 2 },
  // Detection / classification systems
  { pattern: /\bdetect(?:ion|or)\b/i, weight: 1 },
  { pattern: /\bclassif(?:y|ication|ier)\b/i, weight: 2 },
  { pattern: /\bextract(?:ion|or)\b/i, weight: 1 },
];

const NOVELTY_THRESHOLD = 6; // minimum combined weight to suggest

/**
 * Compute a novelty score from the context.
 * Uses a window around the EXCELLENT verdict to focus on the relevant work.
 */
function computeNoveltyScore(ctx) {
  // Focus on a window around the EXCELLENT verdict — the 3000 chars before it
  // contain the task description and evaluation; that's where novel patterns appear.
  const excellentIndex = ctx.search(/\bVERDICT:\s*EXCELLENT\b/i);
  const window = excellentIndex > 0
    ? ctx.slice(Math.max(0, excellentIndex - 3000), excellentIndex + 500)
    : ctx;

  // Bail early if any routine signal matches
  if (ROUTINE_SIGNALS.some(p => p.test(window))) {
    return 0;
  }

  let score = 0;
  for (const { pattern, weight } of NOVELTY_SIGNALS) {
    if (pattern.test(window)) {
      score += weight;
    }
  }
  return score;
}

// --- Pattern and skill name extraction ---

/**
 * Extract a human-readable description of the detected pattern from the context.
 * Looks for Task description lines or the task section of the 4D report.
 */
function extractPatternDescription(ctx) {
  // Try to get the task description from 4D evaluation report
  const taskMatch = ctx.match(/\bTask:\s*([^\n]{10,120})/i);
  if (taskMatch) {
    return taskMatch[1].trim();
  }

  // Try "PRODUCT" section header common in 3P delegation format
  const productMatch = ctx.match(/\bPRODUCT\b[^\n]*\n[^\n]*Task:\s*([^\n]{10,120})/i);
  if (productMatch) {
    return productMatch[1].trim();
  }

  // Fallback: look for "created", "built", "implemented" near EXCELLENT
  const excellentIndex = ctx.search(/\bVERDICT:\s*EXCELLENT\b/i);
  if (excellentIndex > 0) {
    const snippet = ctx.slice(Math.max(0, excellentIndex - 800), excellentIndex);
    const actionMatch = snippet.match(/(?:created?|built|implemented?|designed?|established?)\s+(?:a\s+)?(?:new\s+)?([^\n.]{10,80})/i);
    if (actionMatch) {
      return actionMatch[1].trim();
    }
  }

  return 'multi-step workflow pattern';
}

/**
 * Derive a kebab-case skill name from the pattern description.
 * Strips filler words, lowercases, and joins with hyphens.
 */
function deriveSkillName(description) {
  const FILLER = /\b(?:a|an|the|for|with|using|via|to|of|and|or|in|on|at|by|from|into|that|this|which|was|were|has|have|had|been|be|is|are|it|its|my|our|new|create|created|build|built|implement|implemented|design|designed)\b/gi;

  const slug = description
    .toLowerCase()
    .replace(FILLER, ' ')       // remove filler
    .replace(/[^a-z0-9\s-]/g, '')  // strip punctuation
    .replace(/\s+/g, '-')       // spaces to hyphens
    .replace(/-{2,}/g, '-')     // collapse repeated hyphens
    .replace(/^-+|-+$/g, '')    // trim leading/trailing hyphens
    .slice(0, 40);              // max 40 chars

  // Safety: if slug is too short or empty, use generic name
  return slug.length >= 4 ? slug : 'workflow-pattern';
}

// --- Banner generation ---

function pad(text, width) {
  const visible = text.replace(/[^\x20-\x7E]/g, ''); // strip non-ASCII for width calc
  const padding = width - visible.length;
  return text + ' '.repeat(Math.max(0, padding));
}

function generateBanner(patternDescription, skillName) {
  const LINE_WIDTH = 60; // inner width between ║ and ║ (including one space each side)
  const INNER = LINE_WIDTH - 2; // content width

  const trunc = (s, max) => s.length > max ? s.slice(0, max - 1) + '…' : s;

  const descTrunc = trunc(patternDescription, INNER - 2);
  const nameTrunc = trunc(skillName, INNER - 2);
  const cmdTrunc = trunc(`/harry create skill ${skillName}`, INNER - 2);

  const lines = [];
  lines.push('');
  lines.push('╔' + '═'.repeat(LINE_WIDTH) + '╗');
  lines.push('║ ' + pad('SKILL EXTRACTION OPPORTUNITY', INNER - 1) + '║');
  lines.push('╠' + '═'.repeat(LINE_WIDTH) + '╣');
  lines.push('║ ' + pad('', INNER - 1) + '║');
  lines.push('║ ' + pad('A successful novel pattern was detected in this', INNER - 1) + '║');
  lines.push('║ ' + pad('session. Consider capturing it as a reusable skill.', INNER - 1) + '║');
  lines.push('║ ' + pad('', INNER - 1) + '║');
  lines.push('║ ' + pad('Pattern detected:', INNER - 1) + '║');
  lines.push('║   ' + pad(descTrunc, INNER - 3) + '║');
  lines.push('║ ' + pad('', INNER - 1) + '║');
  lines.push('║ ' + pad('Suggested skill name:', INNER - 1) + '║');
  lines.push('║   ' + pad(nameTrunc, INNER - 3) + '║');
  lines.push('║ ' + pad('', INNER - 1) + '║');
  lines.push('║ ' + pad('To create this skill, run:', INNER - 1) + '║');
  lines.push('║   ' + pad(cmdTrunc, INNER - 3) + '║');
  lines.push('║ ' + pad('', INNER - 1) + '║');
  lines.push('║ ' + pad('This is a suggestion only. The user decides.', INNER - 1) + '║');
  lines.push('╚' + '═'.repeat(LINE_WIDTH) + '╝');
  lines.push('');

  return lines.join('\n');
}

// --- Main execution ---

if (!detectExcellentVerdict(context)) {
  process.exit(0);
}

const noveltyScore = computeNoveltyScore(context);

if (noveltyScore < NOVELTY_THRESHOLD) {
  process.exit(0);
}

const patternDescription = extractPatternDescription(context);
const skillName = deriveSkillName(patternDescription);

console.log(generateBanner(patternDescription, skillName));

process.exit(0);
