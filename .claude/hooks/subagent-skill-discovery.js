#!/usr/bin/env node

/**
 * Subagent Skill Discovery Hook
 *
 * Triggered: UserPromptSubmit (when spawning subagent)
 * Purpose: Analyze subagent task and suggest relevant skills
 * Output: Formatted skill recommendations injected into subagent context
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { minimatch } from 'minimatch';

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
function matchSkill(skillName, skillConfig, task, context = {}) {
  const matches = {
    keyword: false,
    intent: false,
    file: false,
    score: 0
  };

  const taskLower = task.toLowerCase();
  const { promptTriggers, fileTriggers } = skillConfig;

  // Keyword matching (case-insensitive)
  if (promptTriggers?.keywords) {
    matches.keyword = promptTriggers.keywords.some(keyword =>
      taskLower.includes(keyword.toLowerCase())
    );
  }

  // Intent pattern matching (regex)
  if (promptTriggers?.intentPatterns) {
    matches.intent = promptTriggers.intentPatterns.some(pattern => {
      try {
        const regex = new RegExp(pattern, 'i');
        return regex.test(task);
      } catch (e) {
        return false;
      }
    });
  }

  // File pattern matching (if file paths in context)
  if (fileTriggers?.pathPatterns && context.files && context.files.length > 0) {
    matches.file = context.files.some(filePath =>
      fileTriggers.pathPatterns.some(pattern =>
        minimatch(filePath, pattern, { nocase: true })
      )
    );
  }

  // Calculate score based on matches and priority
  if (matches.keyword || matches.intent || matches.file) {
    const priorityScore = getPriorityScore(skillConfig.priority);
    let matchScore = 0;

    if (matches.keyword) matchScore += 2;
    if (matches.intent) matchScore += 3;
    if (matches.file) matchScore += 1;

    matches.score = (priorityScore * 10) + matchScore;
  }

  return matches;
}

/**
 * Find relevant skills for task
 */
function findRelevantSkills(skillRules, task, context = {}) {
  const matches = [];

  for (const [skillName, skillConfig] of Object.entries(skillRules.skills)) {
    const match = matchSkill(skillName, skillConfig, task, context);

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
 * Extract skill descriptions from agent files
 */
function getSkillDescription(skillName) {
  const descriptions = {
    'list': 'Directory and file listing operations with tool selection and filtering guidance',
    'open': 'File reading operations with guidance on partial vs full reads and context preservation',
    'read': 'Deep file and codebase analysis with pattern recognition and systematic methodology',
    'write': 'Code and file modifications with guidance on Edit vs Write tool selection and safety checks',
    'fetch': 'External data retrieval with error handling, retry logic, and validation',
    'base-research': 'Information gathering and research with methodology and source evaluation',
    'base-analysis': 'Code and system evaluation for quality, security, maintainability, and performance',
    '4d-evaluation': 'Quality assessment using 4-D methodology (Delegation, Description, Discernment, Diligence)'
  };

  return descriptions[skillName] || `Guidance for ${skillName} operations`;
}

/**
 * Generate formatted skill suggestions
 */
function generateSuggestions(matches) {
  if (matches.length === 0) {
    return ''; // No suggestions
  }

  let output = '\n# Skill Recommendations\n\n';
  output += 'Based on your task, the following skills may be helpful:\n\n';

  for (const match of matches) {
    const { name, config } = match;
    const priorityIcon = {
      critical: '🔴',
      high: '🟠',
      medium: '🟡',
      low: '🟢'
    }[config.priority] || '⚪';

    const description = getSkillDescription(name);

    output += `## ${priorityIcon} ${name} (${config.priority} priority)\n`;
    output += `**When to use:** ${description}\n\n`;
  }

  output += '## Using Skills\n\n';
  output += 'To activate a skill, use the Skill tool:\n';
  output += '```\n';
  output += 'Skill(skill: "skill-name")\n';
  output += '```\n\n';
  output += 'Skills provide progressive guidance - start with SKILL.md, then load resources/* as needed.\n\n';

  return output;
}

/**
 * Main execution
 */
async function main() {
  try {
    // Read subagent task from stdin
    const input = await readStdin();

    if (!input) {
      // No input, no suggestions
      process.exit(0);
    }

    // Load skill rules
    const skillRules = loadSkillRules();

    // Parse input (could be enhanced to extract file context)
    const task = input;
    const context = {}; // Could extract file paths from task in future

    // Find relevant skills
    const matches = findRelevantSkills(skillRules, task, context);

    // Generate and output suggestions
    const suggestions = generateSuggestions(matches);

    if (suggestions) {
      console.log(suggestions);
    }

  } catch (error) {
    console.error(`# Skill Discovery Error\n\n${error.message}\n`);
    process.exit(1);
  }
}

main();
