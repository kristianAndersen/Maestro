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

// --- Read Inputs ---

// Read user prompt from stdin
let userPrompt = '';
try {
  userPrompt = readFileSync(0, 'utf-8').trim();
} catch (error) {
  // Stdin may not be available in all contexts
}

if (!userPrompt) {
  process.exit(0); // No prompt, no suggestion
}

// Load agent-registry.json
let registry;
try {
  const registryPath = join(__dirname, '..', 'agents', 'agent-registry.json');
  registry = JSON.parse(readFileSync(registryPath, 'utf-8'));
} catch (error) {
  console.error('Error loading agent-registry.json:', error.message);
  process.exit(1);
}

// Load project context from .claude/context.json
let projectContext = {};
try {
  const contextPath = join(__dirname, '..', 'context.json');
  projectContext = JSON.parse(readFileSync(contextPath, 'utf-8'));
} catch (error) {
  // context.json may not exist, proceed with empty context
}


// --- Scoring Functions ---

/**
 * Analyze prompt complexity.
 */
function analyzeComplexity(prompt) {
  const words = prompt.trim().split(/\s+/).length;
  if (words > 30) return 'complex';
  if (words >= 10) return 'medium';
  return 'simple';
}

/**
 * Match keywords with word boundary checking.
 */
function matchKeywords(prompt, keywords = []) {
  const lowerPrompt = prompt.toLowerCase();
  return keywords.some(kw => new RegExp(`\\b${kw.toLowerCase()}\\b`, 'i').test(lowerPrompt)) ? 10 : 0;
}

/**
 * Match synonyms with word boundary checking.
 */
function matchSynonyms(prompt, synonyms = []) {
  const lowerPrompt = prompt.toLowerCase();
  return synonyms.some(syn => new RegExp(`\\b${syn.toLowerCase()}\\b`, 'i').test(lowerPrompt)) ? 5 : 0;
}

/**
 * Match intent patterns using regex.
 */
function matchIntentPatterns(prompt, patterns = []) {
  return patterns.some(p => new RegExp(p, 'i').test(prompt)) ? 15 : 0;
}

/**
 * Match operation types.
 */
function matchOperations(prompt, operations = []) {
    const lowerPrompt = prompt.toLowerCase();
    return operations.some(op => lowerPrompt.includes(op.toLowerCase())) ? 8 : 0;
}

/**
 * Calculate complexity alignment bonus.
 */
function calculateComplexityBonus(prompt, agentComplexity) {
  return analyzeComplexity(prompt) === agentComplexity ? 5 : 0;
}

/**
 * Match agent domain with active project context.
 */
function matchContext(context, agentDomain) {
    if (context && context.activeDomain && context.activeDomain === agentDomain) {
        return 15;
    }
    return 0;
}

/**
 * Score all agents and return sorted results.
 */
function scoreAgents(prompt, registry, context) {
  const scores = [];
  for (const [agentName, agentData] of Object.entries(registry.agents)) {
    if (agentData.internal) continue;

    const triggers = agentData.triggers || {};
    const breakdown = {
      keywords: matchKeywords(prompt, triggers.keywords),
      synonyms: matchSynonyms(prompt, triggers.synonyms),
      intent: matchIntentPatterns(prompt, triggers.intentPatterns),
      operations: matchOperations(prompt, triggers.operations),
      complexity: calculateComplexityBonus(prompt, agentData.complexity),
      context: matchContext(context, agentData.domain)
    };

    // Questions signal research intent (finding/discovering information) - boost base-research for interrogatives
    if (agentName === 'base-research' && prompt.includes('?')) {
      breakdown.questionBonus = 3;
    }

    const totalScore = Object.values(breakdown).reduce((sum, val) => sum + val, 0);

    scores.push({ name: agentName, score: totalScore, breakdown });
  }
  return scores.sort((a, b) => b.score - a.score);
}


// --- Output Formatting ---

function capitalizeAgentName(name) {
  return name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
}

function formatBreakdown(breakdown) {
  const lines = [];
  if (breakdown.keywords > 0) lines.push(`║ • Keyword match (+${breakdown.keywords})`);
  if (breakdown.synonyms > 0) lines.push(`║ • Synonym match (+${breakdown.synonyms})`);
  if (breakdown.intent > 0) lines.push(`║ • Intent pattern (+${breakdown.intent})`);
  if (breakdown.operations > 0) lines.push(`║ • Operation match (+${breakdown.operations})`);
  if (breakdown.complexity > 0) lines.push(`║ • Complexity alignment (+${breakdown.complexity})`);
  if (breakdown.context > 0) lines.push(`║ • Context match (+${breakdown.context})`);
  if (breakdown.questionBonus > 0) lines.push(`║ • Question detected (+${breakdown.questionBonus})`);
  return lines;
}

function generateSuggestion(scoredAgents) {
  const topAgent = scoredAgents[0];
  if (!topAgent || topAgent.score < 10) return '';

  const maxScore = 100; // Adjusted for new context score
  const confidence = topAgent.score >= 40 ? 'High' : topAgent.score >= 25 ? 'Medium' : 'Low';
  const topAgentDisplay = capitalizeAgentName(topAgent.name);

  let output = [
    '╔════════════════════════════════════════════════════════════╗',
    '║ 🎯 MAESTRO AGENT SUGGESTION                                ║',
    '╠════════════════════════════════════════════════════════════╣',
    `║ RECOMMENDED AGENT: ${topAgentDisplay.padEnd(37)} ║`,
    `║ CONFIDENCE: ${confidence} (Score: ${topAgent.score}/${maxScore})`.padEnd(61) + '║',
    '║                                                            ║',
    '║ REASON:                                                    ║',
    ...formatBreakdown(topAgent.breakdown).map(line => line.padEnd(61) + '║'),
    '║                                                            ║',
    '║ 📋 DELEGATION REMINDER:                                    ║',
    `║ Use Task tool to delegate to ${topAgentDisplay} with 3P format`.padEnd(61) + '║',
    '║ (Product, Process, Performance)                            ║',
    '╚════════════════════════════════════════════════════════════╝'
  ];

  return output.join('\n');
}


// --- Main Execution ---
const scoredAgents = scoreAgents(userPrompt, registry, projectContext);
const suggestion = generateSuggestion(scoredAgents);

if (suggestion) {
  console.log(suggestion);
}
