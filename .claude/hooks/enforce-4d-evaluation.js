#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
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
 * Tracking: Updates context.json with evaluation compliance metrics
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
try {
  projectContext = JSON.parse(readFileSync(contextPath, 'utf-8'));
} catch (error) {
  // context.json may not exist, initialize empty
  projectContext = {};
}

// --- Detection Functions ---

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
    // Delegation markers
    /\bDelegating to.*agent\b/i,
    /\bTask tool to delegate\b/i,
    // Subagent invocation patterns
    /\bsubagent_type=/i,
  ];

  return taskPatterns.some(pattern => pattern.test(context));
}

/**
 * Check if 4-D evaluation was performed
 * Look for comprehensive patterns indicating proper evaluation:
 * - "4D-EVALUATION REPORT" (formal report header)
 * - "VERDICT: EXCELLENT" or "VERDICT: NEEDS REFINEMENT" (explicit verdicts)
 * - Task tool call with subagent_type="4d-evaluation"
 * - All three discernment dimensions present (Product, Process, Performance)
 * @param {string} context - Conversation context
 * @returns {boolean} True if comprehensive 4-D evaluation detected
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
  return (hasEvaluationReport || has4dEvaluationAgent) && hasVerdict && hasAllDiscernments;
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

  // Write updated context back to file
  try {
    writeFileSync(contextPath, JSON.stringify(projectContext, null, 2), 'utf-8');
  } catch (error) {
    // Fail gracefully - don't break workflow if context can't be updated
  }
}

// --- Main Execution ---

const taskUsed = detectTaskToolUsage(conversationContext);
const evaluationPerformed = detectEvaluationPerformed(conversationContext);

// Update compliance tracking
updateComplianceTracking(taskUsed, evaluationPerformed);

// Output warning if Task tool was used but evaluation is missing
if (taskUsed && !evaluationPerformed) {
  console.log(generateWarning());
}

// Exit silently if no warning needed (successful compliance or no Task usage)
process.exit(0);
