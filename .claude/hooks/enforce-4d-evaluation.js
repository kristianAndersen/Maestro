#!/usr/bin/env bun

import { readFileSync, writeFileSync, renameSync, appendFileSync, existsSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


/**
 * Enforce 4-D Evaluation Hook
 *
 * Purpose: Implements mandatory quality gates for Maestro subagent delegation
 * Trigger: Stop hook (when conversation/task ends)
 * Output: WARNING if Task tool was used but 4-D evaluation is missing
 * Tracking:
 *   - Updates context.json with evaluation compliance metrics
 *   - Appends evaluation outcomes to .claude/memory/evaluation-history.jsonl
 */

// --- Read Inputs ---

// Read conversation context from stdin
let conversationContext = '';
try {
  conversationContext = readFileSync(0, 'utf-8').trim();
} catch (error) {
  // Error reading stdin, exit silently (fail gracefully)
  process.exit(0);
}

if (!conversationContext) {
  // No context provided, exit silently
  process.exit(0);
}

// Load project context from .claude/context.json
let projectContext = {};
const contextPath = join(__dirname, '..', 'context.json');
const DELEGATION_LOG = join(__dirname, '..', 'logs', 'delegation.jsonl');
const RUNS_LOG_PATH = join(__dirname, '..', 'logs', 'subagent-runs.jsonl');
// Look back this many minutes for log-based Task/evaluation detection
const DETECTION_WINDOW_MS = 90 * 60 * 1000; // 90 minutes

// --- Anti-Rationalization Table ---
// Known patterns where LLMs rationalize skipping 4D evaluation.
// Each entry: the excuse Claude generates, and the rebuttal that counters it.
// Referenced in warning output to pre-empt compliance shortcuts.
const ANTI_RATIONALIZATION_TABLE = [
  {
    excuse: 'I already evaluated informally / I reviewed it mentally',
    rebuttal: 'Informal evaluation is not structured evaluation. The 4D framework catches issues across three dimensions (Product, Process, Performance) that informal review systematically misses. "I looked at it" is not a quality gate.',
  },
  {
    excuse: 'This task is too simple to need evaluation',
    rebuttal: 'Simple tasks are where quality shortcuts compound. If the task is truly simple, evaluation takes seconds. If you are wrong about it being simple, skipping evaluation lets the error through. The cost of evaluating a simple task is low; the cost of not evaluating a complex task you misjudged is high.',
  },
  {
    excuse: 'The subagent output looks correct / The work is obviously fine',
    rebuttal: '"Looks correct" and "is correct" are different claims. The 4D gate checks process and performance, not just product. An output can look right while the approach is fragile, incomplete, or non-idiomatic. You cannot assess what you have not structured-evaluated.',
  },
  {
    excuse: "I'll evaluate the next one / I'll be more thorough next time",
    rebuttal: 'Skipping once normalizes skipping. There is no "next one" exception — every delegation requires evaluation. Deferred compliance is non-compliance.',
  },
  {
    excuse: 'The user is waiting / Time pressure / Need to respond quickly',
    rebuttal: 'A wrong answer delivered fast costs more than a correct answer delivered with evaluation. The user asked for quality (by using Maestro). Evaluation IS the service, not overhead on top of it.',
  },
  {
    excuse: 'The subagent already self-assessed its work',
    rebuttal: 'Agent self-assessment is not independent evaluation. The entire point of 4D is external quality checking by a separate agent with fresh context. Self-assessment is input to evaluation, not a substitute for it.',
  },
  {
    excuse: 'I need to evaluate multiple outputs together / I will batch them',
    rebuttal: 'Each delegation gets its own evaluation. Batching evaluations means the first outputs are accepted without review while waiting for later ones. Evaluate as you go, not after the fact.',
  },
  {
    excuse: 'The 4D evaluation agent will just say EXCELLENT anyway',
    rebuttal: 'If you are confident the work is excellent, evaluation costs nothing — it confirms your assessment in 10 seconds. If the work is NOT excellent, you just tried to skip the one process that would have caught it. Either way, run the evaluation.',
  },
];

try {
  projectContext = JSON.parse(readFileSync(contextPath, 'utf-8'));
} catch (error) {
  // context.json may not exist, initialize empty
  projectContext = {};
}

// --- Detection Functions ---


/**
 * Query delegation.jsonl to detect Task tool invocations in the current session.
 * More reliable than string-matching conversation context (which changes format
 * across Claude Code versions). Uses a time window to scope to the current turn.
 *
 * @returns {{ used: boolean, agentNames: string[] }}
 */
function detectTaskFromDelegationLog() {
  try {
    if (!existsSync(DELEGATION_LOG)) return { used: false, agentNames: [], taskHashes: [] };
    const cutoff = Date.now() - DETECTION_WINDOW_MS;
    const lines = readFileSync(DELEGATION_LOG, 'utf-8').trim().split('\n').filter(Boolean);
    const recent = [];
    const hashes = [];
    for (const line of lines) {
      try {
        const entry = JSON.parse(line);
        if (new Date(entry.timestamp).getTime() >= cutoff) {
          recent.push(entry.agentName || 'unknown');
          if (entry.taskHash) hashes.push(entry.taskHash);
        }
      } catch { /* skip malformed */ }
    }
    return { used: recent.length > 0, agentNames: recent, taskHashes: hashes };
  } catch {
    return { used: false, agentNames: [], taskHashes: [] };
  }
}

/**
 * Query subagent-runs.jsonl to detect whether a 4d-evaluation agent ran
 * in the current session window.
 *
 * @returns {boolean}
 */
function detect4dEvaluationFromRunsLog() {
  try {
    if (!existsSync(RUNS_LOG_PATH)) return false;
    const cutoff = Date.now() - DETECTION_WINDOW_MS;
    const lines = readFileSync(RUNS_LOG_PATH, 'utf-8').trim().split('\n').filter(Boolean);
    for (let i = lines.length - 1; i >= 0; i--) {
      try {
        const entry = JSON.parse(lines[i]);
        if (new Date(entry.timestamp).getTime() < cutoff) break; // past window
        if (entry.agentType && entry.agentType.toLowerCase().includes('4d-evaluation')) {
          return true;
        }
      } catch { /* skip */ }
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Check if Task tool was used in the conversation
 * Look for patterns indicating Task tool invocation:
 * - <invoke name="Task">
 * - Task tool usage markers
 * - Subagent delegation patterns
 * @param {string} context - Conversation context
 * @returns {boolean} True if Task tool was used
 */
function detectTaskToolUsage(context) {
  const taskPatterns = [
    /<invoke name="Task">/i,
    /<invoke name="task">/i,
    // Look for Task tool in function results
    /<function_results>[\s\S]*?<name>Task<\/name>/i,
    // Delegation markers - specific structural patterns only (avoid conversational false positives)
    /📤\s*Delegating to/,
    /subagent_type\s*[:=]/i,
    /\bAgent tool.*to launch\b/i,
    // Subagent invocation patterns
    /\bsubagent_type=/i,
  ];

  return taskPatterns.some(pattern => pattern.test(context));
}

/**
 * Check if 4-D evaluation was performed and extract details
 * Look for comprehensive patterns indicating proper evaluation:
 * - "4D-EVALUATION REPORT" (formal report header)
 * - "VERDICT: EXCELLENT" or "VERDICT: NEEDS REFINEMENT" (explicit verdicts)
 * - Task tool call with subagent_type="4d-evaluation"
 * - All three discernment dimensions present (Product, Process, Performance)
 * @param {string} context - Conversation context
 * @returns {object} { performed: boolean, evaluations: array } - evaluation detection and details
 */
function detectEvaluationPerformed(context) {
  // Check for formal 4-D evaluation report markers
  const hasEvaluationReport = /\b4D-EVALUATION REPORT\b/i.test(context) ||
                              /\b4-D EVALUATION REPORT\b/i.test(context);

  // Check for explicit verdict
  const hasVerdict = /\bVERDICT:\s*(EXCELLENT|NEEDS REFINEMENT)\b/i.test(context);

  // Check for Task tool invocation of 4d-evaluation agent
  const has4dEvaluationAgent = /subagent_type="4d-evaluation"/i.test(context) ||
                               /subagent_type='4d-evaluation'/i.test(context);

  // Check for all three discernment dimensions
  const hasProductDiscernment = /\bProduct Discernment\b/i.test(context);
  const hasProcessDiscernment = /\bProcess Discernment\b/i.test(context);
  const hasPerformanceDiscernment = /\bPerformance Discernment\b/i.test(context);
  const hasAllDiscernments = hasProductDiscernment && hasProcessDiscernment && hasPerformanceDiscernment;

  // Evaluation is considered complete if:
  // 1. Has formal report header OR 4d-evaluation agent was invoked, AND
  // 2. Has explicit verdict, AND
  // 3. Has all three discernment dimensions
  const performed = (hasEvaluationReport || has4dEvaluationAgent) && hasVerdict && hasAllDiscernments;

  // Extract evaluation details for logging
  const evaluations = [];
  if (performed) {
    // Try to extract evaluation details from context
    const verdictMatches = context.matchAll(/\bVERDICT:\s*(EXCELLENT|NEEDS REFINEMENT)\b/gi);
    for (const match of verdictMatches) {
      const verdict = match[1].toUpperCase();

      // Try to find associated agent and task context around the verdict
      const contextWindow = context.slice(Math.max(0, match.index - 500), match.index + 500);

      // Extract agent name if present
      const agentMatch = contextWindow.match(/(?:evaluating|assessing|reviewing)\s+(?:the\s+)?(\w+(?:-\w+)?)\s+agent/i) ||
                        contextWindow.match(/agent:\s*(\w+(?:-\w+)?)/i) ||
                        contextWindow.match(/subagent_type=['"]?(\w+(?:-\w+)?)/i);
      const agentUsed = agentMatch ? agentMatch[1] : 'unknown';

      // Try to detect task type from context
      const taskMatch = contextWindow.match(/Task:\s*([^\n]+)/i);
      const taskType = taskMatch ? taskMatch[1].slice(0, 100) : 'unknown';

      // Try to detect iteration count
      const iterationMatch = contextWindow.match(/iteration\s+(\d+)/i) ||
                            contextWindow.match(/attempt\s+(\d+)/i);
      const iterationCount = iterationMatch ? parseInt(iterationMatch[1]) : 1;

      // Check if coaching was applied
      const coachingApplied = /coaching|refinement|feedback|improvements/i.test(contextWindow);

      evaluations.push({
        verdict,
        agentUsed,
        taskType,
        iterationCount,
        coachingApplied
      });
    }
  }

  return { performed, evaluations };
}

/**
 * Check if Maestro did self-assessment after 4d-evaluation (VIOLATION)
 * Look for forbidden patterns like "My Assessment", "However, reviewing...", etc.
 * @param {string} context - Conversation context
 * @returns {boolean} True if self-assessment violation detected
 */
function detectSelfAssessmentAfterEvaluation(context) {
  // Check if evaluation was performed first
  const evaluationIndex = context.search(/\b4D-EVALUATION REPORT\b/i);
  if (evaluationIndex === -1) {
    return false; // No evaluation, so no violation possible
  }

  // Look for self-assessment patterns AFTER evaluation
  const afterEvaluation = context.slice(evaluationIndex);

  const forbiddenPatterns = [
    /\bMy Assessment:/i,
    /\bHowever,?\s+reviewing\s+(?:the|this)\s+(?:work|code|output|phase)\s+(?:directly|myself)/i,
    /\bBut\s+(?:looking|reviewing|checking)\s+(?:at|the)\s+(?:work|code|output)\s+(?:directly|myself)/i,
    /\bUpon\s+(?:direct\s+)?review/i,
    /\bReviewing\s+the\s+(?:Phase|work|code|output)\s+\d+\s+work\s+directly/i,
    /\bI\s+(?:believe|think|assess|conclude)\s+(?:the\s+work|it)\s+is\s+(?:acceptable|complete|fine|good|thorough)/i,
    /\bThe\s+(?:\w+\s+)?agent\s+DID\s+complete/i // Pattern like "The base-analysis agent DID complete"
  ];

  return forbiddenPatterns.some(pattern => pattern.test(afterEvaluation));
}

/**
 * Check if work product was properly embedded in 4d-evaluation delegation
 * @param {string} context - Conversation context
 * @returns {boolean} True if proper embedding detected
 */
function detectProperWorkProductEmbedding(context) {
  // Look for Task tool invocation to 4d-evaluation
  const has4dEvalInvocation = /subagent_type=["']4d-evaluation["']/i.test(context);
  if (!has4dEvalInvocation) {
    return true; // No 4d-evaluation used, no violation
  }

  // Look for proper embedding markers (visual separators with WORK PRODUCT text)
  const hasEmbeddingMarkers = /━{10,}[\s\S]{0,200}?(?:WORK PRODUCT|AGENT.*PRODUCT)[\s\S]{0,2000}?━{10,}/i.test(context);

  // Look for comprehensive work product sections
  const hasTaskSection = /Task:\s*[^\n]+/i.test(context);
  const hasActionsSection = /Actions Taken:/i.test(context);
  const hasEvidenceSection = /Evidence:/i.test(context);

  // Consider it properly embedded only if has markers AND key sections
  return hasEmbeddingMarkers && hasTaskSection && hasActionsSection && hasEvidenceSection;
}

/**
 * Generate warning message for missing evaluation
 * @returns {string} Formatted warning
 */
function generateWarning() {
  const output = [];

  output.push('');
  output.push('╔════════════════════════════════════════════════════════════╗');
  output.push('║ ⚠️  WARNING: MISSING 4-D EVALUATION                        ║');
  output.push('╠════════════════════════════════════════════════════════════╣');
  output.push('║                                                            ║');
  output.push('║ Task tool was used, but 4-D evaluation is MISSING.         ║');
  output.push('║                                                            ║');
  output.push('║ 🚨 MANDATORY QUALITY GATE SKIPPED                          ║');
  output.push('║                                                            ║');
  output.push('║ The Maestro framework requires ALL subagent outputs        ║');
  output.push('║ to pass through 4-D evaluation before acceptance.          ║');
  output.push('║                                                            ║');
  output.push('║ 📋 REQUIRED ACTION:                                        ║');
  output.push('║                                                            ║');
  output.push('║ 1. Use Task tool to delegate to "4d-evaluation" agent      ║');
  output.push('║ 2. Provide the subagent output for evaluation              ║');
  output.push('║ 3. Wait for evaluation verdict:                            ║');
  output.push('║    • EXCELLENT → Accept and deliver                        ║');
  output.push('║    • NEEDS REFINEMENT → Re-delegate with coaching          ║');
  output.push('║                                                            ║');
  output.push('║ 🎯 EVALUATION CRITERIA (4-D Framework):                    ║');
  output.push('║                                                            ║');
  output.push('║ 1️⃣  Product Discernment:                                   ║');
  output.push('║    ✓ Correctness (logic, edge cases)                       ║');
  output.push('║    ✓ Elegance (simple yet powerful)                        ║');
  output.push('║    ✓ Completeness (no missing pieces)                      ║');
  output.push('║    ✓ Problem-solving (addresses real need)                 ║');
  output.push('║                                                            ║');
  output.push('║ 2️⃣  Process Discernment:                                   ║');
  output.push('║    ✓ Sound reasoning (logical approach)                    ║');
  output.push('║    ✓ Thoroughness (no gaps or shortcuts)                   ║');
  output.push('║    ✓ Appropriate techniques used                           ║');
  output.push('║                                                            ║');
  output.push('║ 3️⃣  Performance Discernment:                               ║');
  output.push('║    ✓ Excellence standards (no "good enough")               ║');
  output.push('║    ✓ Elegant simplicity (power through subtraction)        ║');
  output.push('║    ✓ Codebase philosophy alignment                         ║');
  output.push('║                                                            ║');
  output.push('║ ⚠️  DO NOT accept subagent work without evaluation         ║');
  output.push('║ 🔄 Iterate until EXCELLENT verdict achieved                ║');
  output.push('║                                                            ║');
  output.push('║ 🛡️  ANTI-RATIONALIZATION GUARD:                            ║');
  output.push('║                                                            ║');
  output.push('║ If you are thinking of skipping evaluation, check if       ║');
  output.push('║ your reasoning matches a known rationalization pattern:    ║');
  output.push('║                                                            ║');
  for (const entry of ANTI_RATIONALIZATION_TABLE) {
    // Show excuse (truncated to fit) + full rebuttal (word-wrapped)
    const excuse = entry.excuse.length > 54 ? entry.excuse.slice(0, 53) + '…' : entry.excuse;
    output.push(`║ ❌ "${excuse.padEnd(54)}" ║`);
    // Word-wrap rebuttal into 52-char lines with ↳ prefix
    const words = entry.rebuttal.split(' ');
    const rebLines = [];
    let cur = '';
    for (const word of words) {
      if ((cur + (cur ? ' ' : '') + word).length <= 52) {
        cur = cur + (cur ? ' ' : '') + word;
      } else {
        if (cur) rebLines.push(cur);
        cur = word;
      }
    }
    if (cur) rebLines.push(cur);
    rebLines.forEach((line, i) => {
      const prefix = i === 0 ? '  ↳ ' : '    ';
      output.push(`║ ${(prefix + line).padEnd(60)}║`);
    });
    output.push('║                                                            ║');
  }
  output.push('║                                                            ║');
  output.push('║ ALL of the above are known failure patterns.               ║');
  output.push('║ If your reason matches ANY of them — run the evaluation.   ║');
  output.push('║                                                            ║');
    output.push('╚════════════════════════════════════════════════════════════╝');
  output.push('');

  return output.join('\n');
}

/**
 * Generate warning for self-assessment violation (cheating)
 * @returns {string} Formatted warning
 */
function generateSelfAssessmentWarning() {
  const output = [];

  output.push('');
  output.push('╔════════════════════════════════════════════════════════════╗');
  output.push('║ 🚨 CRITICAL VIOLATION: SELF-ASSESSMENT AFTER EVALUATION    ║');
  output.push('╠════════════════════════════════════════════════════════════╣');
  output.push('║                                                            ║');
  output.push('║ ⛔ Maestro performed DIRECT EVALUATION after delegating    ║');
  output.push('║    to 4d-evaluation agent.                                 ║');
  output.push('║                                                            ║');
  output.push('║ 🎯 VIOLATION DETECTED:                                     ║');
  output.push('║                                                            ║');
  output.push('║ Forbidden patterns found after 4d-evaluation:              ║');
  output.push('║ • "My Assessment:"                                         ║');
  output.push('║ • "However, reviewing the work directly..."                ║');
  output.push('║ • "The [agent] DID complete..."                            ║');
  output.push('║                                                            ║');
  output.push('║ 📋 WHY THIS IS WRONG:                                      ║');
  output.push('║                                                            ║');
  output.push('║ 1. Violates "NEVER execute work directly" (maestro.md:54) ║');
  output.push('║ 2. Overrides quality gate verdict (maestro.md:260-284)    ║');
  output.push('║ 3. Breaks pure delegation model (maestro.md:10-18)        ║');
  output.push('║ 4. Sets "good enough" precedent (maestro.md:58)           ║');
  output.push('║                                                            ║');
  output.push('║ ✅ CORRECT BEHAVIOR:                                       ║');
  output.push('║                                                            ║');
  output.push('║ When 4d-evaluation returns verdict:                        ║');
  output.push('║ • EXCELLENT → Accept immediately, mark complete            ║');
  output.push('║ • NEEDS REFINEMENT → Apply coaching, re-delegate           ║');
  output.push('║                                                            ║');
  output.push('║ NEVER add "My Assessment" or override the verdict!         ║');
  output.push('║                                                            ║');
  output.push('║ 🎼 REMEMBER: You are a CONDUCTOR, not an EVALUATOR        ║');
  output.push('║    Trust your specialized agents completely.               ║');
  output.push('║                                                            ║');
  output.push('║ 📖 See maestro.md:286-380 for anti-pattern examples       ║');
  output.push('║                                                            ║');
  output.push('╚════════════════════════════════════════════════════════════╝');
  output.push('');

  return output.join('\n');
}

/**
 * Generate warning for incomplete work product embedding
 * @returns {string} Formatted warning
 */
function generateIncompleteEmbeddingWarning() {
  const output = [];

  output.push('');
  output.push('╔════════════════════════════════════════════════════════════╗');
  output.push('║ ⚠️  WARNING: INCOMPLETE WORK PRODUCT DELEGATION            ║');
  output.push('╠════════════════════════════════════════════════════════════╣');
  output.push('║                                                            ║');
  output.push('║ 4d-evaluation was invoked, but the complete work product   ║');
  output.push('║ was NOT properly embedded in the delegation.               ║');
  output.push('║                                                            ║');
  output.push('║ 🚨 PROTOCOL VIOLATION                                      ║');
  output.push('║                                                            ║');
  output.push('║ The 4d-evaluation agent CANNOT assess quality without      ║');
  output.push('║ seeing the complete subagent work product.                 ║');
  output.push('║                                                            ║');
  output.push('║ ❌ INSUFFICIENT (What you did):                            ║');
  output.push('║                                                            ║');
  output.push('║ • Referenced agent by ID: "See agentId abc123"             ║');
  output.push('║ • Provided only metadata: "File modified: X"               ║');
  output.push('║ • Summarized work: "Agent completed task successfully"     ║');
  output.push('║                                                            ║');
  output.push('║ ✅ REQUIRED (What you must do):                            ║');
  output.push('║                                                            ║');
  output.push('║ 1. Use visual separators (━━━━) to delineate work product ║');
  output.push('║ 2. Embed COMPLETE subagent report between separators:     ║');
  output.push('║    • Task description                                      ║');
  output.push('║    • Skills used                                           ║');
  output.push('║    • Actions taken                                         ║');
  output.push('║    • Evidence (code snippets, file paths, line numbers)    ║');
  output.push('║    • Verification results                                  ║');
  output.push('║    • Agent self-assessment                                 ║');
  output.push('║                                                            ║');
  output.push('║ 📖 REFERENCE:                                              ║');
  output.push('║                                                            ║');
  output.push('║ • maestro.md:159-233 (delegation format with examples)     ║');
  output.push('║ • 4d-evaluation.md:340-388 (embedding requirements)        ║');
  output.push('║                                                            ║');
  output.push('║ 💡 TIP: Cannot evaluate quality without seeing the work!   ║');
  output.push('║                                                            ║');
  output.push('╚════════════════════════════════════════════════════════════╝');
  output.push('');

  return output.join('\n');
}

/**
 * Update context.json with evaluation compliance tracking
 * @param {boolean} taskUsed - Whether Task tool was used
 * @param {boolean} evaluationPerformed - Whether evaluation was performed
 */
function updateComplianceTracking(taskUsed, evaluationPerformed) {
  // Initialize evaluation tracking structure if not present
  if (!projectContext.evaluationTracking) {
    projectContext.evaluationTracking = {
      totalDelegations: 0,
      evaluatedDelegations: 0,
      skippedEvaluations: 0,
      complianceRate: 100.0
    };
  }

  const tracking = projectContext.evaluationTracking;

  // Update metrics if Task tool was used
  if (taskUsed) {
    tracking.totalDelegations += 1;

    if (evaluationPerformed) {
      tracking.evaluatedDelegations += 1;
    } else {
      tracking.skippedEvaluations += 1;
    }

    // Calculate compliance rate
    tracking.complianceRate = tracking.totalDelegations > 0
      ? ((tracking.evaluatedDelegations / tracking.totalDelegations) * 100).toFixed(1)
      : 100.0;

    // Update last check timestamp
    tracking.lastChecked = new Date().toISOString();
  }

  // Write updated context back to file (atomic: tmp + rename prevents race conditions).
  try {
    const tmpPath = contextPath + '.tmp';
    writeFileSync(tmpPath, JSON.stringify(projectContext, null, 2), 'utf-8');
    renameSync(tmpPath, contextPath);
  } catch (error) {
    // Fail gracefully - don't break workflow if context can't be updated
  }
}

/**
 * Log evaluation outcomes to evaluation-history.jsonl
 * @param {array} evaluations - Array of evaluation detail objects
 */
function logEvaluationHistory(evaluations, taskHashes) {
  if (!evaluations || evaluations.length === 0) {
    return; // Nothing to log
  }

  // Ensure memory directory exists
  const memoryDir = join(__dirname, '..', 'memory');
  if (!existsSync(memoryDir)) {
    try {
      mkdirSync(memoryDir, { recursive: true });
    } catch (error) {
      // Fail gracefully - don't break workflow
      return;
    }
  }

  // Path to evaluation history file
  const evaluationHistoryPath = join(memoryDir, 'evaluation-history.jsonl');

  // Get current session ID from context if available
  const sessionId = projectContext.skillTracking?.sessionId ||
                   projectContext.lastSessionId ||
                   'unknown';

  // Append each evaluation as a JSONL entry
  try {
    for (const evaluation of evaluations) {
      // Use the most recent taskHash for correlation with delegation logs
      const taskHash = taskHashes.length > 0 ? taskHashes[taskHashes.length - 1] : null;

      const logEntry = {
        timestamp: new Date().toISOString(),
        sessionId,
        taskHash,
        agentUsed: evaluation.agentUsed,
        taskType: evaluation.taskType,
        verdict: evaluation.verdict,
        iterationCount: evaluation.iterationCount,
        coachingApplied: evaluation.coachingApplied
      };

      // Append as single-line JSON followed by newline
      appendFileSync(evaluationHistoryPath, JSON.stringify(logEntry) + '\n', 'utf-8');
    }
  } catch (error) {
    // Fail gracefully - don't break workflow if logging fails
  }
}

/**
 * Check if subagent properly activated skills or delegated to Harry
 * Look for patterns indicating skill activation:
 * - Skill tool invocation: <invoke name="Skill">
 * - "Skills Used:" field in report with skill name (not "None")
 * - Delegation to Harry for missing skills
 * @param {string} context - Conversation context
 * @returns {object} { skillActivated: boolean, delegatedToHarry: boolean, violationDetected: boolean }
 */
function detectSkillUsage(context) {
  // Check if Skill tool was invoked
  const skillToolUsed = /<invoke name="Skill">/i.test(context) ||
                        /<invoke name="skill">/i.test(context) ||
                        /Skill\(skill:\s*['"]/i.test(context);

  // Check if Skills Used field shows actual skill (not "None")
  const skillsUsedPattern = /\*\*Skills Used:\*\*\s*([^\n]+)/gi;
  const skillsUsedMatches = [...context.matchAll(skillsUsedPattern)];

  let properSkillDocumented = false;
  if (skillsUsedMatches.length > 0) {
    properSkillDocumented = skillsUsedMatches.some(match => {
      const skillsLine = match[1].toLowerCase();
      // Check if it mentions an actual skill (not "none", not empty)
      return !skillsLine.includes('none - worked directly') &&
             !skillsLine.includes('none - ') &&
             !skillsLine.trim().startsWith('[') && // Not just template
             skillsLine.length > 10; // Has substance
    });
  }

  // Check if delegated to Harry for missing skill
  const delegatedToHarry = /subagent_type=['"]harry['"]/i.test(context) ||
                           /Delegating to Harry/i.test(context) ||
                           /Task tool with subagent_type='harry'/i.test(context);

  // Violation detected if:
  // - Task tool was used (subagent spawned)
  // - But NO skill activation AND NO delegation to Harry AND NO proper skill documentation
  const taskUsed = detectTaskToolUsage(context);
  const violationDetected = taskUsed &&
                            !skillToolUsed &&
                            !delegatedToHarry &&
                            !properSkillDocumented;

  return {
    skillActivated: skillToolUsed || properSkillDocumented,
    delegatedToHarry,
    violationDetected
  };
}

/**
 * Generate warning for missing skill activation
 */
function generateSkillUsageWarning() {
  return `
╔════════════════════════════════════════════════════════════╗
║ ⚠️  SKILL ACTIVATION VIOLATION DETECTED                    ║
╠════════════════════════════════════════════════════════════╣
║ ISSUE: Subagent worked without activating required skill  ║
║                                                            ║
║ VIOLATION:                                                 ║
║ • Task tool was used to spawn subagent                     ║
║ • Subagent did NOT activate skill using Skill tool         ║
║ • Subagent did NOT delegate to Harry for missing skill     ║
║ • Report shows "None - worked directly" or no skill        ║
║                                                            ║
║ FRAMEWORK REQUIREMENT:                                     ║
║ All agents MUST activate their primary skill before work   ║
║                                                            ║
║ CORRECT WORKFLOW:                                          ║
║ 1. Agent receives delegation from Maestro                  ║
║ 2. Agent FIRST uses Skill tool: Skill(skill: "name")       ║
║ 3. If skill not found → delegate to Harry to create it     ║
║ 4. After skill loaded → apply patterns from skill          ║
║ 5. Report "Skills Used: [skill-name] - Applied section..." ║
║                                                            ║
║ WHY THIS MATTERS:                                          ║
║ • Skills contain tested patterns, not improvisation        ║
║ • "None - worked directly" violates delegation principle   ║
║ • Framework ensures consistency and quality                ║
║                                                            ║
║ ACTION REQUIRED:                                           ║
║ Update agent to activate skill or delegate to Harry        ║
╚════════════════════════════════════════════════════════════╝
`;
}

// --- Main Execution ---

// Primary: log-based detection (reliable, format-independent)
const logTaskResult = detectTaskFromDelegationLog();
const logEvalPerformed = detect4dEvaluationFromRunsLog();

// Fallback: string-matching on conversation context (legacy, kept for sessions
// where delegation-logger wasn't running or logs are absent)
const stringTaskUsed = detectTaskToolUsage(conversationContext);
const evaluationResult = detectEvaluationPerformed(conversationContext);
const stringEvalPerformed = evaluationResult.performed;
const evaluations = evaluationResult.evaluations;

// Merge: log-based wins when available, string-match is the fallback
const taskUsed = logTaskResult.used || stringTaskUsed;
const evaluationPerformed = logTaskResult.used
  ? logEvalPerformed   // log-based: use log result
  : stringEvalPerformed; // no log data: fall back to string matching

// NEW: Check for protocol violations
const selfAssessmentDetected = detectSelfAssessmentAfterEvaluation(conversationContext);
const properEmbedding = detectProperWorkProductEmbedding(conversationContext);
const skillUsageResult = detectSkillUsage(conversationContext);

// Update compliance tracking
updateComplianceTracking(taskUsed, evaluationPerformed);

// Log evaluation outcomes to history file
if (evaluationPerformed && evaluations.length > 0) {
  logEvaluationHistory(evaluations, logTaskResult.taskHashes);
}

// Output warnings for violations (in priority order)

// Priority 1: Missing evaluation entirely (most critical)
if (taskUsed && !evaluationPerformed) {
  console.log(generateWarning());
}

// Priority 2: Skill activation violation (critical - breaks delegation principle)
if (skillUsageResult.violationDetected) {
  console.log(generateSkillUsageWarning());
}

// Priority 3: Self-assessment violation (cheating - critical)
if (selfAssessmentDetected) {
  console.log(generateSelfAssessmentWarning());
}

// Priority 4: Incomplete embedding (important but less severe)
if (evaluationPerformed && !properEmbedding) {
  console.log(generateIncompleteEmbeddingWarning());
}

// Exit silently if no warnings needed (successful compliance)
process.exit(0);
