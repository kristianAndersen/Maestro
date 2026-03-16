#!/usr/bin/env bun

import { readFileSync } from 'fs';

/**
 * Evaluation Reminder Hook
 *
 * Purpose: Implements Diligence from 4-D methodology
 * Trigger: Stop hook (after Maestro stops responding)
 * Output: Reminder to run 4-D evaluation if subagent returned but not yet evaluated
 */

// Read conversation context from stdin
let conversationContext = '';
try {
  conversationContext = readFileSync(0, 'utf-8').trim();
} catch (error) {
  // Error reading stdin, exit silently
  process.exit(0);
}

if (!conversationContext) {
  // No context provided, exit silently
  process.exit(0);
}

/**
 * Detect if subagent just returned output
 * Look for patterns indicating subagent completion:
 * - "REPORT" markers (structured reports)
 * - "Task Complete" or "TASK COMPLETE"
 * - "STRUCTURED REPORT"
 * - function_results tags (from Task tool)
 * - "EVIDENCE:" sections
 * - "VERIFICATION:" sections
 * @param {string} context - Conversation context
 * @returns {boolean} True if subagent output detected
 */
function detectSubagentCompletion(context) {
  const completionPatterns = [
    /\bREPORT\b/i,
    /\bTask Complete\b/i,
    /\bSTRUCTURED REPORT\b/i,
    /<function_results>/i,
    /\bEVIDENCE:/i,
    /\bVERIFICATION:/i,
    /\bFINDINGS:/i,
    /\bIMPLEMENTATION:/i,
    // Subagent return markers
    /\bReturning to Maestro\b/i,
    /\bDelegating back to Maestro\b/i,
    // Task tool completion indicators
    /<\/function_results>/i,
  ];

  return completionPatterns.some(pattern => pattern.test(context));
}

/**
 * Check if evaluation already performed
 * Look for patterns indicating 4-D evaluation was done:
 * - "4-D EVALUATION"
 * - "VERDICT"
 * - "EXCELLENT" or "NEEDS REFINEMENT"
 * - "Product Discernment"
 * - "Process Discernment"
 * - "Performance Discernment"
 * @param {string} context - Conversation context
 * @returns {boolean} True if evaluation already present
 */
function checkEvaluationPerformed(context) {
  const evaluationPatterns = [
    /\b4-D EVALUATION\b/i,
    /\bVERDICT\b/i,
    /\bEXCELLENT\b/i,
    /\bNEEDS REFINEMENT\b/i,
    /\bProduct Discernment\b/i,
    /\bProcess Discernment\b/i,
    /\bPerformance Discernment\b/i,
    // Evaluation agent markers
    /\b4D-Evaluation\b/,
    /\b4d-evaluation\b/,
    // Evaluation verdict markers
    /\b✓.*Product.*What was built\b/i,
    /\b✓.*Process.*How it was built\b/i,
  ];

  return evaluationPatterns.some(pattern => pattern.test(context));
}

/**
 * Generate evaluation reminder output
 * @returns {string} Formatted reminder
 */
function generateReminder() {
  const output = [];

  output.push('╔════════════════════════════════════════════════════════════╗');
  output.push('║ 🔍 EVALUATION REMINDER                                     ║');
  output.push('╠════════════════════════════════════════════════════════════╣');
  output.push('║                                                            ║');
  output.push('║ Subagent output received. Before accepting:                ║');
  output.push('║                                                            ║');
  output.push('║ ⚠️  REQUIRED: Run 4-D evaluation                           ║');
  output.push('║                                                            ║');
  output.push('║ 📋 ACTION:                                                 ║');
  output.push('║ • Use Task tool to delegate to 4D-Evaluation agent         ║');
  output.push('║ • Provide subagent output for evaluation                   ║');
  output.push('║                                                            ║');
  output.push('║ 🎯 CRITERIA TO EVALUATE:                                   ║');
  output.push('║                                                            ║');
  output.push('║ Product Discernment (What was built):                      ║');
  output.push('║   ✓ Is it correct? (logic sound, edge cases handled)       ║');
  output.push('║   ✓ Is it elegant? (simple yet powerful)                   ║');
  output.push('║   ✓ Is it complete? (no missing pieces)                    ║');
  output.push('║   ✓ Does it solve the real problem?                        ║');
  output.push('║                                                            ║');
  output.push('║ Process Discernment (How it was built):                    ║');
  output.push('║   ✓ Was the reasoning sound? (logical approach)            ║');
  output.push('║   ✓ Any gaps or shortcuts? (thoroughness check)            ║');
  output.push('║   ✓ Were appropriate techniques used?                      ║');
  output.push('║                                                            ║');
  output.push('║ Performance Discernment (quality/excellence):              ║');
  output.push('║   ✓ Meets excellence standards? (no "good enough")         ║');
  output.push('║   ✓ Simple yet powerful? (elegance through subtraction)    ║');
  output.push('║   ✓ Fits codebase philosophy?                              ║');
  output.push('║                                                            ║');
  output.push('║ ⚠️  Only accept output after evaluation PASSES             ║');
  output.push('║ 🔄 Refine if issues found (iterate until excellent)        ║');
  output.push('║                                                            ║');
  output.push('╚════════════════════════════════════════════════════════════╝');

  return output.join('\n');
}

// Main execution
const hasSubagentOutput = detectSubagentCompletion(conversationContext);
const hasEvaluation = checkEvaluationPerformed(conversationContext);

// Only show reminder if:
// 1. Subagent output was detected AND
// 2. Evaluation has NOT been performed yet
if (hasSubagentOutput && !hasEvaluation) {
  console.log(generateReminder());
}

// Exit silently if no reminder needed
