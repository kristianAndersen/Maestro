#!/usr/bin/env bun

import { readFileSync, writeFileSync, appendFileSync, existsSync, mkdirSync } from 'fs';
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

  // Write updated context back to file
  try {
    writeFileSync(contextPath, JSON.stringify(projectContext, null, 2), 'utf-8');
  } catch (error) {
    // Fail gracefully - don't break workflow if context can't be updated
  }
}

/**
 * Log evaluation outcomes to evaluation-history.jsonl
 * @param {array} evaluations - Array of evaluation detail objects
 */
function logEvaluationHistory(evaluations) {
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
      const logEntry = {
        timestamp: new Date().toISOString(),
        sessionId,
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

const taskUsed = detectTaskToolUsage(conversationContext);
const evaluationResult = detectEvaluationPerformed(conversationContext);
const evaluationPerformed = evaluationResult.performed;
const evaluations = evaluationResult.evaluations;

// NEW: Check for protocol violations
const selfAssessmentDetected = detectSelfAssessmentAfterEvaluation(conversationContext);
const properEmbedding = detectProperWorkProductEmbedding(conversationContext);
const skillUsageResult = detectSkillUsage(conversationContext);

// Update compliance tracking
updateComplianceTracking(taskUsed, evaluationPerformed);

// Log evaluation outcomes to history file
if (evaluationPerformed && evaluations.length > 0) {
  logEvaluationHistory(evaluations);
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
