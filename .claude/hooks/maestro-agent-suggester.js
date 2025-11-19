#!/usr/bin/env node

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Maestro Agent Suggester Hook
 *
 * Purpose: Implements Delegation Discernment from 4-D methodology
 * Trigger: UserPromptSubmit hook
 * Output: Formatted agent suggestion with scoring breakdown
 */

// Read user prompt from stdin
let userPrompt = '';
try {
  userPrompt = readFileSync(0, 'utf-8').trim();
} catch (error) {
  console.error('Error reading user prompt from stdin:', error.message);
  process.exit(1);
}

if (!userPrompt) {
  // No prompt provided, exit silently
  process.exit(0);
}

// Load agent-registry.json
let registry;
try {
  const registryPath = join(__dirname, '..', 'agents', 'agent-registry.json');
  const registryContent = readFileSync(registryPath, 'utf-8');
  registry = JSON.parse(registryContent);
} catch (error) {
  console.error('Error loading agent-registry.json:', error.message);
  process.exit(1);
}

/**
 * Analyze prompt complexity
 * @param {string} prompt - User prompt
 * @returns {'simple'|'medium'|'complex'} Complexity level
 */
function analyzeComplexity(prompt) {
  const words = prompt.trim().split(/\s+/).length;
  const hasConjunctions = /\b(and|also|then|plus|additionally)\b/i.test(prompt);
  const hasSequence = /\b(first|second|then|after|next|before)\b/i.test(prompt);
  const fileReferences = (prompt.match(/\b\w+\.\w+\b/g) || []).length;

  // Complex: > 30 words, or multiple steps indicated
  if (words > 30 || hasSequence) {
    return 'complex';
  }

  // Medium: 10-30 words, or has conjunctions, or multiple files
  if (words >= 10 || hasConjunctions || fileReferences > 1) {
    return 'medium';
  }

  // Simple: < 10 words, single file reference, no conjunctions
  return 'simple';
}

/**
 * Match keywords with word boundary checking
 * @param {string} prompt - User prompt
 * @param {string[]} keywords - Agent keywords
 * @returns {number} Score (capped at 20)
 */
function matchKeywords(prompt, keywords = []) {
  let score = 0;
  const lowerPrompt = prompt.toLowerCase();

  for (const keyword of keywords) {
    const regex = new RegExp(`\\b${keyword.toLowerCase()}\\b`, 'i');
    if (regex.test(lowerPrompt)) {
      score += 10;
    }
  }

  return Math.min(score, 20);
}

/**
 * Match intent patterns using regex
 * @param {string} prompt - User prompt
 * @param {string[]} patterns - Intent pattern regexes
 * @returns {number} Score (capped at 30)
 */
function matchIntentPatterns(prompt, patterns = []) {
  let score = 0;

  for (const pattern of patterns) {
    try {
      const regex = new RegExp(pattern, 'i');
      if (regex.test(prompt)) {
        score += 15;
      }
    } catch (error) {
      // Invalid regex pattern, skip
      continue;
    }
  }

  return Math.min(score, 30);
}

/**
 * Match operation types
 * @param {string} prompt - User prompt
 * @param {string[]} operations - Agent operations
 * @returns {number} Score (capped at 16)
 */
function matchOperations(prompt, operations = []) {
  let score = 0;
  const lowerPrompt = prompt.toLowerCase();

  for (const operation of operations) {
    if (lowerPrompt.includes(operation.toLowerCase())) {
      score += 8;
    }
  }

  return Math.min(score, 16);
}

/**
 * Calculate complexity alignment bonus
 * @param {string} prompt - User prompt
 * @param {string} agentComplexity - Agent complexity level
 * @returns {number} Score (5 if match, 0 otherwise)
 */
function calculateComplexityBonus(prompt, agentComplexity) {
  const promptComplexity = analyzeComplexity(prompt);
  return promptComplexity === agentComplexity ? 5 : 0;
}

/**
 * Score all agents and return sorted results
 * @param {string} prompt - User prompt
 * @param {object} registry - Agent registry
 * @returns {Array} Scored agents sorted by score
 */
function scoreAgents(prompt, registry) {
  const scores = [];

  for (const [agentName, agentData] of Object.entries(registry.agents)) {
    // Skip internal agents (used only by Maestro)
    if (agentData.internal) {
      continue;
    }

    const triggers = agentData.triggers || {};

    const keywordScore = matchKeywords(prompt, triggers.keywords);
    const intentScore = matchIntentPatterns(prompt, triggers.intentPatterns);
    const operationScore = matchOperations(prompt, triggers.operations);
    const complexityBonus = calculateComplexityBonus(prompt, agentData.complexity);

    const totalScore = keywordScore + intentScore + operationScore + complexityBonus;

    scores.push({
      name: agentName,
      score: totalScore,
      breakdown: {
        keywords: keywordScore,
        intent: intentScore,
        operations: operationScore,
        complexity: complexityBonus
      }
    });
  }

  // Sort by score descending
  scores.sort((a, b) => b.score - a.score);

  return scores;
}

/**
 * Capitalize agent name for display
 * @param {string} name - Agent name (e.g., 'base-research')
 * @returns {string} Capitalized name (e.g., 'BaseResearch')
 */
function capitalizeAgentName(name) {
  return name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

/**
 * Format score breakdown for output
 * @param {object} breakdown - Score breakdown
 * @returns {string[]} Formatted lines
 */
function formatBreakdown(breakdown) {
  const lines = [];

  if (breakdown.keywords > 0) {
    lines.push(`║ • Keyword match (+${breakdown.keywords})`);
  }
  if (breakdown.intent > 0) {
    lines.push(`║ • Intent pattern (+${breakdown.intent})`);
  }
  if (breakdown.operations > 0) {
    lines.push(`║ • Operation match (+${breakdown.operations})`);
  }
  if (breakdown.complexity > 0) {
    lines.push(`║ • Complexity alignment (+${breakdown.complexity})`);
  }

  return lines;
}

/**
 * Generate formatted suggestion output
 * @param {Array} scoredAgents - Scored agents
 * @returns {string} Formatted output
 */
function generateSuggestion(scoredAgents) {
  const topAgent = scoredAgents[0];
  const secondAgent = scoredAgents[1] || null;

  // No suggestion if top score < 10
  if (topAgent.score < 10) {
    return ''; // Silent exit, no suggestion
  }

  const maxScore = 75; // 20 + 30 + 16 + 5 + 4 (buffer)
  const confidence = topAgent.score >= 30 ? 'High' : topAgent.score >= 20 ? 'Medium' : 'Low';

  // Check for tie-breaking (within 10 points)
  // Only consider it a tie if BOTH agents have substantive matches (not just complexity)
  const topHasSubstantiveMatch = topAgent.breakdown.keywords > 0 ||
                                 topAgent.breakdown.intent > 0 ||
                                 topAgent.breakdown.operations > 0;
  const secondHasSubstantiveMatch = secondAgent && (
                                     secondAgent.breakdown.keywords > 0 ||
                                     secondAgent.breakdown.intent > 0 ||
                                     secondAgent.breakdown.operations > 0);

  // Count match diversity (how many different scoring categories contributed)
  const countMatchTypes = (breakdown) => {
    let count = 0;
    if (breakdown.keywords > 0) count++;
    if (breakdown.intent > 0) count++;
    if (breakdown.operations > 0) count++;
    return count;
  };

  const topMatchDiversity = countMatchTypes(topAgent.breakdown);
  const secondMatchDiversity = secondAgent ? countMatchTypes(secondAgent.breakdown) : 0;

  // Only consider it a tie if:
  // 1. Both have substantive matches AND
  // 2. Within 10 points AND
  // 3. Have same match diversity (prevents keyword-only from tying with keyword+operation)
  const isTie = secondAgent &&
                (topAgent.score - secondAgent.score <= 10) &&
                topHasSubstantiveMatch &&
                secondHasSubstantiveMatch &&
                topMatchDiversity === secondMatchDiversity;

  let output = [];
  output.push('╔════════════════════════════════════════════════════════════╗');
  output.push('║ 🎯 MAESTRO AGENT SUGGESTION                                ║');
  output.push('╠════════════════════════════════════════════════════════════╣');

  const topAgentDisplay = capitalizeAgentName(topAgent.name);
  const secondAgentDisplay = secondAgent ? capitalizeAgentName(secondAgent.name) : '';

  if (isTie) {
    output.push(`║ RECOMMENDED AGENTS: ${topAgentDisplay.padEnd(37)} ║`);
    output.push(`║                     ${secondAgentDisplay.padEnd(37)} ║`);
    output.push(`║ CONFIDENCE: ${confidence} (Scores: ${topAgent.score}, ${secondAgent.score})`.padEnd(61) + '║');
    output.push('║                                                            ║');
    output.push('║ REASON (Top Agent):                                        ║');
    formatBreakdown(topAgent.breakdown).forEach(line => {
      output.push(line.padEnd(61) + '║');
    });
    output.push('║                                                            ║');
    output.push('║ NOTE: Close scores - consider context for final choice    ║');
  } else {
    output.push(`║ RECOMMENDED AGENT: ${topAgentDisplay.padEnd(37)} ║`);
    output.push(`║ CONFIDENCE: ${confidence} (Score: ${topAgent.score}/${maxScore})`.padEnd(61) + '║');
    output.push('║                                                            ║');
    output.push('║ REASON:                                                    ║');
    formatBreakdown(topAgent.breakdown).forEach(line => {
      output.push(line.padEnd(61) + '║');
    });
  }

  output.push('║                                                            ║');
  output.push('║ 📋 DELEGATION REMINDER:                                    ║');
  output.push(`║ Use Task tool to delegate to ${capitalizeAgentName(topAgent.name)} agent with 3P format`.padEnd(61) + '║');
  output.push('║ (Product, Process, Performance)                            ║');
  output.push('╚════════════════════════════════════════════════════════════╝');

  return output.join('\n');
}

// Main execution
const scoredAgents = scoreAgents(userPrompt, registry);
const suggestion = generateSuggestion(scoredAgents);

if (suggestion) {
  console.log(suggestion);
}
