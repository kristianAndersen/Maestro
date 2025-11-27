#!/usr/bin/env node

/**
 * Subagent Skill Discovery Hook
 *
 * Triggered: UserPromptSubmit (when spawning subagent)
 * Purpose: Analyze subagent task and suggest relevant skills
 * Output: Formatted skill recommendations injected into subagent context
 *
 * Phase 1 defer_loading: Outputs minimal skill references for 30%+ token reduction
 * Phase 2 smart caching: Session-aware output with 40-60% cumulative token reduction
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { minimatch } from 'minimatch';
import { isEnabled } from '../lib/feature-flags.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Read stdin asynchronously
 */
async function readStdin() {
  return new Promise((resolve, reject) => {
    let data = '';
    process.stdin.setEncoding('utf8');

    process.stdin.on('data', chunk => {
      data += chunk;
    });

    process.stdin.on('end', () => {
      resolve(data.trim());
    });

    process.stdin.on('error', reject);
  });
}

/**
 * Load skill-rules.json
 */
function loadSkillRules() {
  try {
    const skillRulesPath = join(__dirname, '../skills/skill-rules.json');
    const content = readFileSync(skillRulesPath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`# Skill Discovery Error\n\nCould not load skill-rules.json: ${error.message}\n`);
    process.exit(1);
  }
}

/**
 * Load project context with skill tracking
 */
function loadProjectContext() {
  try {
    const contextPath = join(__dirname, '..', 'context.json');
    const content = readFileSync(contextPath, 'utf-8');
    const context = JSON.parse(content);

    // Initialize skill tracking if missing
    if (!context.skillTracking) {
      context.skillTracking = {
        recommended: [],
        used: [],
        sessionStart: new Date().toISOString(),
        sessionId: generateSessionId(),
        lastPromptTime: new Date().toISOString(),
        promptCount: 0,
        domainHistory: []
      };
    }

    return context;
  } catch {
    // No context file, return empty context
    return {
      skillTracking: {
        recommended: [],
        used: [],
        sessionStart: new Date().toISOString(),
        sessionId: generateSessionId(),
        lastPromptTime: new Date().toISOString(),
        promptCount: 0,
        domainHistory: []
      }
    };
  }
}

/**
 * Generate a unique session ID
 */
function generateSessionId() {
  return `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Detect if this is a new session (Phase 2)
 * Returns:
 *   true - Full reset (new session)
 *   'domain-switch' - Partial reset (domain changed)
 *   false - Normal update (continue session)
 */
function detectNewSession(context, currentDomain) {
  const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes idle time

  // Check for missing session tracking (first run or corrupted context)
  if (!context.skillTracking?.sessionId || !context.skillTracking?.lastPromptTime) {
    return true; // New session
  }

  // Check for 30-minute idle timeout
  const lastPromptTime = new Date(context.skillTracking.lastPromptTime);
  const now = new Date();
  const idleTime = now - lastPromptTime;

  if (idleTime > SESSION_TIMEOUT_MS) {
    return true; // New session due to timeout
  }

  // Check for domain switch
  const domainHistory = context.skillTracking.domainHistory || [];
  const lastDomain = domainHistory[domainHistory.length - 1];

  if (currentDomain && lastDomain && currentDomain !== lastDomain) {
    return 'domain-switch'; // Partial reset
  }

  return false; // Continue current session
}

/**
 * Cleanup domainHistory array to prevent unbounded growth
 *
 * Keeps only the last N entries (most recent) to prevent memory bloat
 * in long-running sessions or projects with frequent domain switches.
 *
 * @param {Array} domainHistory - The domain history array to cleanup
 * @param {number} maxEntries - Maximum number of entries to keep (default: 100)
 * @returns {Array} - Cleaned array with only the last maxEntries items
 */
function cleanupDomainHistory(domainHistory, maxEntries = 100) {
  if (!Array.isArray(domainHistory) || domainHistory.length <= maxEntries) {
    return domainHistory;
  }

  // Keep only the last maxEntries items (most recent)
  return domainHistory.slice(-maxEntries);
}

/**
 * Update skill tracking in context.json (Phase 2 enhanced)
 */
function updateSkillTracking(context, recommendedSkills, sessionStatus, currentDomain) {
  try {
    const contextPath = join(__dirname, '..', 'context.json');

    context.skillTracking = context.skillTracking || {};

    if (sessionStatus === true) {
      // Full reset - new session
      context.skillTracking = {
        recommended: recommendedSkills,
        used: [],
        sessionStart: new Date().toISOString(),
        sessionId: generateSessionId(),
        lastPromptTime: new Date().toISOString(),
        promptCount: 1,
        domainHistory: currentDomain ? [currentDomain] : []
      };
    } else if (sessionStatus === 'domain-switch') {
      // Partial reset - keep skills, update domain
      const existingRecommended = context.skillTracking.recommended || [];
      context.skillTracking.recommended = [
        ...new Set([...existingRecommended, ...recommendedSkills])
      ];
      context.skillTracking.lastPromptTime = new Date().toISOString();
      context.skillTracking.promptCount = (context.skillTracking.promptCount || 0) + 1;

      // Update domain history
      const domainHistory = context.skillTracking.domainHistory || [];
      if (currentDomain && !domainHistory.includes(currentDomain)) {
        context.skillTracking.domainHistory = [...domainHistory, currentDomain];
      }
    } else {
      // Normal update - append skills
      const existingRecommended = context.skillTracking.recommended || [];
      context.skillTracking.recommended = [
        ...new Set([...existingRecommended, ...recommendedSkills])
      ];
      context.skillTracking.lastPromptTime = new Date().toISOString();
      context.skillTracking.promptCount = (context.skillTracking.promptCount || 0) + 1;

      // Update domain history if needed
      const domainHistory = context.skillTracking.domainHistory || [];
      if (currentDomain && !domainHistory.includes(currentDomain)) {
        context.skillTracking.domainHistory = [...domainHistory, currentDomain];
      }
    }

    // Cleanup domain history to prevent unbounded growth
    context.skillTracking.domainHistory = cleanupDomainHistory(
      context.skillTracking.domainHistory,
      100
    );

    // Update timestamp
    context.lastUpdated = new Date().toISOString();

    // Write back to context.json
    writeFileSync(contextPath, JSON.stringify(context, null, 2), 'utf-8');
  } catch {
    // Fail silently, tracking is optional
  }
}

/**
 * Calculate priority score for sorting
 */
function getPriorityScore(priority) {
  const scores = {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1
  };
  return scores[priority] || 0;
}

/**
 * Match skill against task and context
 */
function matchSkill(skillConfig, task, context = {}) {
  const matches = {
    keyword: false,
    synonym: false,
    intent: false,
    file: false,
    context: false,
    score: 0
  };

  const taskLower = task.toLowerCase();
  const { promptTriggers, fileTriggers, domain } = skillConfig;

  // Keyword matching
  if (promptTriggers?.keywords) {
    matches.keyword = promptTriggers.keywords.some(k => taskLower.includes(k.toLowerCase()));
  }

  // Synonym matching
  if (promptTriggers?.synonyms) {
    matches.synonym = promptTriggers.synonyms.some(s => taskLower.includes(s.toLowerCase()));
  }

  // Intent pattern matching
  if (promptTriggers?.intentPatterns) {
    matches.intent = promptTriggers.intentPatterns.some(p => new RegExp(p, 'i').test(task));
  }

  // File pattern matching
  if (fileTriggers?.pathPatterns && context.files?.length > 0) {
    matches.file = context.files.some(f => fileTriggers.pathPatterns.some(p => minimatch(f, p, { nocase: true })));
  }

  // Context domain matching
  if (context.activeDomain && domain && context.activeDomain === domain) {
      matches.context = true;
  }

  // Calculate score
  if (matches.keyword || matches.synonym || matches.intent || matches.file || matches.context) {
    const priorityScore = getPriorityScore(skillConfig.priority);
    let matchScore = 0;

    if (matches.keyword) matchScore += 2;
    if (matches.synonym) matchScore += 1;
    if (matches.intent) matchScore += 3;
    if (matches.file) matchScore += 1;
    if (matches.context) matchScore += 5; // Add context score

    matches.score = (priorityScore * 10) + matchScore;
  }

  return matches;
}

/**
 * Find relevant skills for task
 */
function findRelevantSkills(skillRules, task, context = {}) {
  const matches = [];
  const recommended = context.skillTracking?.recommended || [];

  for (const [skillName, skillConfig] of Object.entries(skillRules.skills)) {
    // Skip if already recommended in this session (unless forcing)
    if (recommended.includes(skillName) && !context.forceRecommend) {
      continue;
    }

    const match = matchSkill(skillConfig, task, context);

    if (match.score > 0) {
      matches.push({
        name: skillName,
        config: skillConfig,
        match,
        score: match.score
      });
    }
  }

  // Sort by score (highest first)
  matches.sort((a, b) => b.score - a.score);

  return matches;
}

/**
 * Get short description from defer_loading config
 */
function getShortDescription(skillConfig) {
  // Check for nested defer_loading object with short_description
  if (skillConfig.defer_loading && typeof skillConfig.defer_loading === 'object') {
    return skillConfig.defer_loading.short_description || 'Skill guidance available';
  }

  // Fallback for legacy boolean defer_loading or missing config
  return 'Skill guidance available';
}

/**
 * Check if defer_loading is enabled (globally and per-skill)
 */
function isDeferLoadingEnabled(skillConfig) {
  // Check global feature flag first
  if (!isEnabled('DEFER_LOADING')) {
    return false; // Global flag disabled - no defer_loading
  }

  // Check for nested defer_loading object
  if (skillConfig.defer_loading && typeof skillConfig.defer_loading === 'object') {
    return skillConfig.defer_loading.enabled === true;
  }

  // Check for legacy boolean defer_loading
  return skillConfig.defer_loading === true;
}

/**
 * Format a single skill reference (helper for Phase 2)
 */
function formatSkillReference(name, config, compact = false) {
  const priorityIcon = {
    critical: '🔴',
    high: '🟠',
    medium: '🟡',
    low: '🟢'
  }[config.priority] || '⚪';

  const isDeferred = isDeferLoadingEnabled(config);

  if (compact) {
    // Compact format: "🟠 write, 🟡 read"
    return `${priorityIcon} ${name}`;
  } else {
    // Full format with brief and activate
    let output = `## ${priorityIcon} ${name} (${config.priority} priority)\n`;

    if (isDeferred) {
      const brief = getShortDescription(config);
      output += `Brief: ${brief}\n`;
      output += `Activate: Skill(skill: "${name}")\n\n`;
    } else {
      const description = config.description || 'Skill guidance available';
      output += `When to use: ${description}\n\n`;
    }

    return output;
  }
}

/**
 * Generate smart skill suggestions (Phase 2: Three-format strategy)
 */
function generateSuggestions(matches, context = {}, sessionStatus = false) {
  if (matches.length === 0) {
    return ''; // No suggestions
  }

  const newSkills = matches.map(m => m.name);
  const allRecommended = context.skillTracking?.recommended || [];
  const previouslyRecommended = allRecommended.filter(s => !newSkills.includes(s));

  // Determine output format based on session status and content
  const isNewSession = sessionStatus === true;
  const hasNewSkills = newSkills.length > 0;
  const hasPreviousSkills = previouslyRecommended.length > 0;

  // Format 1: Full discovery (new session or explicit request)
  if (isNewSession || context.forceRecommend) {
    let output = '\n# Skill Recommendations\n\n';
    output += 'Based on your task, the following skills may be helpful:\n\n';

    for (const match of matches) {
      output += formatSkillReference(match.name, match.config, false);
    }

    output += '## Using Skills\n\n';
    output += 'To activate a skill, use the Skill tool with the skill name shown above.\n';
    output += 'Skills provide progressive guidance - start with SKILL.md, then load assets/* as needed.\n\n';

    return output;
  }

  // Format 2: Incremental (new skills + compact reminder)
  if (hasNewSkills && hasPreviousSkills) {
    let output = '\n# New Skills Available\n\n';

    for (const match of matches) {
      output += formatSkillReference(match.name, match.config, false);
    }

    // Compact reminder of previous skills
    const compactList = previouslyRecommended.map(name => {
      const skillConfig = context.skillRules?.skills?.[name];
      if (skillConfig) {
        return formatSkillReference(name, skillConfig, true);
      }
      return name;
    }).join(', ');

    output += `Previously recommended: ${compactList}\n\n`;
    output += 'Use Skill(skill: "name") to activate.\n\n';

    return output;
  }

  // Format 3: All cached (compact list only)
  if (!hasNewSkills && hasPreviousSkills) {
    const compactList = allRecommended.map(name => {
      const skillConfig = context.skillRules?.skills?.[name];
      if (skillConfig) {
        return formatSkillReference(name, skillConfig, true);
      }
      return name;
    }).join(', ');

    let output = '\n# Skills Available\n\n';
    output += `${compactList}\n\n`;
    output += 'Use Skill(skill: "name") to activate.\n\n';

    return output;
  }

  // Format 1 fallback for new skills only
  let output = '\n# Skill Recommendations\n\n';
  output += 'Based on your task, the following skills may be helpful:\n\n';

  for (const match of matches) {
    output += formatSkillReference(match.name, match.config, false);
  }

  output += '## Using Skills\n\n';
  output += 'To activate a skill, use the Skill tool with the skill name shown above.\n';
  output += 'Skills provide progressive guidance - start with SKILL.md, then load assets/* as needed.\n\n';

  return output;
}

/**
 * Extract file paths from a task string
 */
function extractFilePaths(task) {
  // This regex looks for path-like strings (e.g., dir/file.ext) or file names with extensions.
  const filePathRegex = /(?:[a-zA-Z0-9_.-]+\/)+[a-zA-Z0-9_.-]+|[a-zA-Z0-9_.-]+\.[a-zA-Z]{2,}/g;
  const matches = task.match(filePathRegex);
  // Filter out any potential false positives that are just numbers or very short strings.
  return (matches || []).filter(path => path.length > 2 && isNaN(path));
}

/**
 * Detect explicit skill discovery requests
 */
function isExplicitSkillRequest(task) {
  const explicitPatterns = [
    /what\s+skills/i,
    /show\s+skills/i,
    /list\s+skills/i,
    /available\s+skills/i,
    /which\s+skills/i,
    /recommend\s+skills/i
  ];

  return explicitPatterns.some(pattern => pattern.test(task));
}

/**
 * Main execution
 */
async function main() {
  try {
    const input = await readStdin();
    if (!input) {
      process.exit(0);
    }

    const skillRules = loadSkillRules();

    // Load project context with skill tracking
    const projectContext = loadProjectContext();

    const task = input;
    const files = extractFilePaths(task);

    // Detect current domain from context
    const currentDomain = projectContext.activeDomain || null;

    // Phase 2: Detect session status
    const sessionStatus = detectNewSession(projectContext, currentDomain);

    // Detect explicit skill requests
    const isExplicitRequest = isExplicitSkillRequest(task);
    const forceRecommend = isExplicitRequest || sessionStatus === true;

    // Combine file and project context
    const context = {
      files,
      ...projectContext,
      forceRecommend,
      skillRules // Pass skillRules for compact formatting
    };

    const matches = findRelevantSkills(skillRules, task, context);
    const suggestions = generateSuggestions(matches, context, sessionStatus);

    if (suggestions) {
      console.log(suggestions);
    }

    // Update tracking after generating output
    const recommendedSkills = matches.map(m => m.name);
    updateSkillTracking(projectContext, recommendedSkills, sessionStatus, currentDomain);

  } catch (error) {
    console.error(`# Skill Discovery Error\n\n${error.message}\n`);
    process.exit(1);
  }
}

main();
