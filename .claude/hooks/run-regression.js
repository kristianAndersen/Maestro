#!/usr/bin/env bun

import { readFileSync } from 'fs';
import { execSync } from 'child_process';
import { join } from 'path';

const CWD = process.env.MAESTRO_ROOT || process.cwd();
const HOOK_PATH = '.claude/hooks/maestro-agent-suggester.js';
const DATASET_PATH = '.claude/hooks/test-prompts.json';

// Agents marked internal: true in registry — hook skips them so "no suggestion" is correct
const INTERNAL_AGENTS = new Set(['4d-evaluation', 'delegater']);

// Normalize agent name to kebab-case lowercase for comparison
// e.g. "MFileWriter" -> "m-file-writer", "BaseResearch" -> "base-research"
function normalizeAgentName(name) {
  if (!name) return '';
  // Insert dash before uppercase letters (handles CamelCase -> kebab-case)
  return name
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
}

// Parse expected field: may contain "/" for multiple valid agents
function parseExpected(expected) {
  if (!expected) return [];
  return expected.split('/').map(s => s.trim().toLowerCase());
}

// Extract recommended agent from hook stdout
function extractAgentFromOutput(output) {
  const match = output.match(/║ RECOMMENDED AGENT:\s+(\S+)/);
  if (!match) return null;
  return normalizeAgentName(match[1].trim());
}

// Escape single quotes in prompt for shell safety
function escapePrompt(prompt) {
  return prompt.replace(/'/g, "'\\''");
}

// Run one prompt through the hook, return { agent: string|null, raw: string }
function runPrompt(prompt) {
  try {
    const escaped = escapePrompt(prompt);
    const cmd = `echo '${escaped}' | bun ${HOOK_PATH}`;
    const raw = execSync(cmd, {
      cwd: CWD,
      encoding: 'utf-8',
      timeout: 15000,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    const agent = extractAgentFromOutput(raw);
    return { agent, raw };
  } catch (err) {
    // Non-zero exit or timeout — treat as no suggestion
    const raw = (err.stdout || '') + (err.stderr || '');
    const agent = extractAgentFromOutput(raw);
    return { agent, raw };
  }
}

// Classify result
function classify(expected, gotAgent) {
  const expectedAgents = parseExpected(expected);
  const isAmbiguous = expectedAgents.includes('ambiguous');
  const isNone = expectedAgents.includes('none');
  const isInternal = expectedAgents.every(e => INTERNAL_AGENTS.has(e));

  if (isInternal) {
    // Internal agents are skipped by hook — no suggestion is correct behavior
    return gotAgent ? 'INTERNAL_TRIGGERED' : 'INTERNAL_SILENT';
  }

  if (isAmbiguous) {
    return gotAgent ? 'AMBIGUOUS_TRIGGERED' : 'AMBIGUOUS_SILENT';
  }

  if (isNone) {
    return gotAgent ? 'FALSE_POSITIVE' : 'TRUE_NEGATIVE';
  }

  // Expected a specific agent (or one of several)
  if (!gotAgent) {
    return 'FALSE_NEGATIVE';
  }
  if (expectedAgents.includes(gotAgent)) {
    return 'TRUE_POSITIVE';
  }
  return 'WRONG_AGENT';
}

// Load dataset
const dataset = JSON.parse(readFileSync(join(CWD, DATASET_PATH), 'utf-8'));

const counts = {
  TRUE_POSITIVE: 0,
  TRUE_NEGATIVE: 0,
  FALSE_POSITIVE: 0,
  FALSE_NEGATIVE: 0,
  WRONG_AGENT: 0,
  AMBIGUOUS_TRIGGERED: 0,
  AMBIGUOUS_SILENT: 0,
  INTERNAL_TRIGGERED: 0,
  INTERNAL_SILENT: 0
};

const failures = {
  FP: [],  // { prompt, gotAgent, expected }
  WA: [],  // { prompt, gotAgent, expected }
  FN: []   // { prompt, expected }
};

console.log(`Running regression on ${dataset.length} prompts...\n`);

let i = 0;
for (const item of dataset) {
  i++;
  if (i % 50 === 0) process.stderr.write(`  Progress: ${i}/${dataset.length}\n`);

  const { agent, raw } = runPrompt(item.prompt);
  const result = classify(item.expected, agent);
  counts[result]++;

  if (result === 'FALSE_POSITIVE') {
    failures.FP.push({ prompt: item.prompt, gotAgent: agent, expected: item.expected });
  } else if (result === 'WRONG_AGENT') {
    failures.WA.push({ prompt: item.prompt, gotAgent: agent, expected: item.expected });
  } else if (result === 'FALSE_NEGATIVE') {
    failures.FN.push({ prompt: item.prompt, expected: item.expected });
  }
}

// Compute metrics
const total = dataset.length;
const TP = counts.TRUE_POSITIVE;
const TN = counts.TRUE_NEGATIVE;
const FP = counts.FALSE_POSITIVE;
const FN = counts.FALSE_NEGATIVE;
const WA = counts.WRONG_AGENT;
const AMB_T = counts.AMBIGUOUS_TRIGGERED;
const AMB_S = counts.AMBIGUOUS_SILENT;
const INT_T = counts.INTERNAL_TRIGGERED;
const INT_S = counts.INTERNAL_SILENT;

const fpRate = (FP + TN) > 0 ? (FP / (FP + TN) * 100).toFixed(1) : 'N/A';
const fnRate = (FN + TP) > 0 ? (FN / (FN + TP) * 100).toFixed(1) : 'N/A';
const waRate = (WA + TP) > 0 ? (WA / (WA + TP) * 100).toFixed(1) : 'N/A';
const precision = (TP + FP + WA) > 0 ? (TP / (TP + FP + WA) * 100).toFixed(1) : 'N/A';
const recall = (TP + FN) > 0 ? (TP / (TP + FN) * 100).toFixed(1) : 'N/A';

// Output report
console.log('═══════════════════════════════════════════════════════════');
console.log('  MAESTRO AGENT SUGGESTER — REGRESSION REPORT');
console.log('═══════════════════════════════════════════════════════════');
console.log(`\n  Total prompts tested: ${total}`);
console.log('\n  CLASSIFICATION BREAKDOWN');
console.log('  ─────────────────────────────────────────────────────────');
console.log(`  TRUE_POSITIVE        (TP): ${TP}`);
console.log(`  TRUE_NEGATIVE        (TN): ${TN}`);
console.log(`  FALSE_POSITIVE       (FP): ${FP}`);
console.log(`  FALSE_NEGATIVE       (FN): ${FN}`);
console.log(`  WRONG_AGENT          (WA): ${WA}`);
console.log(`  AMBIGUOUS_TRIGGERED      : ${AMB_T}`);
console.log(`  AMBIGUOUS_SILENT         : ${AMB_S}`);
console.log(`  INTERNAL_TRIGGERED       : ${INT_T}`);
console.log(`  INTERNAL_SILENT          : ${INT_S}`);
console.log('\n  KEY METRICS');
console.log('  ─────────────────────────────────────────────────────────');
console.log(`  FP rate          = FP / (FP + TN)      = ${fpRate}%`);
console.log(`  FN rate          = FN / (FN + TP)      = ${fnRate}%`);
console.log(`  Wrong-agent rate = WA / (WA + TP)      = ${waRate}%`);
console.log(`  Precision        = TP / (TP + FP + WA) = ${precision}%`);
console.log(`  Recall           = TP / (TP + FN)      = ${recall}%`);

if (failures.FP.length > 0) {
  console.log('\n  FALSE POSITIVES — expected "none", got an agent');
  console.log('  ─────────────────────────────────────────────────────────');
  for (const f of failures.FP) {
    console.log(`  [FP] Prompt   : "${f.prompt}"`);
    console.log(`       Got      : ${f.gotAgent}`);
    console.log(`       Expected : ${f.expected}`);
    console.log();
  }
} else {
  console.log('\n  FALSE POSITIVES: none');
}

if (failures.WA.length > 0) {
  console.log('\n  WRONG AGENT — expected a specific agent, got a different one');
  console.log('  ─────────────────────────────────────────────────────────');
  for (const f of failures.WA) {
    console.log(`  [WA] Prompt   : "${f.prompt}"`);
    console.log(`       Got      : ${f.gotAgent}`);
    console.log(`       Expected : ${f.expected}`);
    console.log();
  }
} else {
  console.log('\n  WRONG AGENT: none');
}

if (failures.FN.length > 0) {
  console.log('\n  FALSE NEGATIVES — expected an agent, got no suggestion');
  console.log('  ─────────────────────────────────────────────────────────');
  for (const f of failures.FN) {
    console.log(`  [FN] Prompt   : "${f.prompt}"`);
    console.log(`       Expected : ${f.expected}`);
    console.log();
  }
} else {
  console.log('\n  FALSE NEGATIVES: none');
}

console.log('\n═══════════════════════════════════════════════════════════\n');

// Threshold gates
const FP_THRESHOLD = 0;
const PRECISION_THRESHOLD = 85.0;

const fpRateNum = parseFloat(fpRate);
const precisionNum = parseFloat(precision);

// NaN means the metric couldn't be computed (empty denominator) — treat as pass
// since there's no evidence of failure, but warn about it
const fpPassed = isNaN(fpRateNum) || fpRateNum <= FP_THRESHOLD;
const precisionPassed = isNaN(precisionNum) || precisionNum >= PRECISION_THRESHOLD;
const passed = fpPassed && precisionPassed;

if (isNaN(fpRateNum)) console.log('\n  ⚠️  FP rate could not be computed (no negative-class prompts in corpus)');
if (isNaN(precisionNum)) console.log('  ⚠️  Precision could not be computed (no positive-class prompts in corpus)');

console.log('');
if (!passed) {
  console.log('  ❌ REGRESSION FAILED — thresholds not met');
  if (!fpPassed) console.log(`     FP rate ${fpRate}% exceeds threshold ${FP_THRESHOLD}%`);
  if (!precisionPassed) console.log(`     Precision ${precision}% below threshold ${PRECISION_THRESHOLD}%`);
  console.log('');
  process.exit(1);
} else {
  console.log('  ✅ REGRESSION PASSED');
  console.log('');
  process.exit(0);
}
