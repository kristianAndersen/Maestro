#!/usr/bin/env bun

/**
 * Asset Builder Hook
 * 
 * Trigger: PostToolUse (Read)
 * Purpose: Detects when an agent tries to read a missing skill asset file,
 *          then flags it for research, verification, and creation.
 * 
 * Ported from MCM framework, adapted for Maestro's assets/ convention.
 * 
 * Flow:
 * 1. Agent reads SKILL.md -> sees "See assets/xyz.md"
 * 2. Agent tries to Read assets/xyz.md -> file not found
 * 3. This hook detects the missing asset
 * 4. Outputs a banner telling the agent to research and create it
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname, basename } from 'path';
import { execSync } from 'child_process';

// Read hook input from stdin
let hookInput = '';
try {
  hookInput = readFileSync(0, 'utf-8').trim();
} catch {
  process.exit(0);
}

if (!hookInput) process.exit(0);

let parsed;
try {
  parsed = JSON.parse(hookInput);
} catch {
  process.exit(0);
}

// Only trigger on Read tool
const toolName = parsed.tool_name || '';
if (toolName !== 'Read') process.exit(0);

// Check if the read was for an asset or reference file that doesn't exist
const filePath = parsed.tool_input?.file_path || '';
const isSkillFile = (filePath.includes('/assets/') || filePath.includes('/reference/')) && filePath.endsWith('.md');
if (!isSkillFile) process.exit(0);

// Check if the file exists — if it does, nothing to do
if (existsSync(filePath)) process.exit(0);

// Extract context
const assetName = basename(filePath, '.md');
const skillDir = dirname(dirname(filePath)); // Go up from assets/ or reference/ to skill dir
const skillName = basename(skillDir);

// Find which file references this asset
let referencedFrom = 'unknown';
let searchContext = '';

try {
  // Search for the asset name in skill files (may be referenced as assets/ or reference/)
  const searchDir = join(skillDir, 'assets');
  const altSearchDir = join(skillDir, 'reference');
  const targetDir = existsSync(searchDir) ? searchDir : (existsSync(altSearchDir) ? altSearchDir : skillDir);
  
  const grepResult = execSync(
    `grep -rl "${assetName}.md" "${skillDir}" 2>/dev/null | head -1`,
    { encoding: 'utf-8' }
  ).trim();

  if (grepResult) {
    referencedFrom = basename(grepResult, '.md');
    const grepLine = execSync(
      `grep "${assetName}.md" "${grepResult}" 2>/dev/null | head -1`,
      { encoding: 'utf-8' }
    ).trim();
    searchContext = grepLine;
  }
} catch {
  // grep failed, that's ok
}

// Output banner
const banner = `
╔════════════════════════════════════════════════════════════╗
║ 📝 MISSING ASSET — RESEARCH & CREATE                      ║
╠════════════════════════════════════════════════════════════╣
║ Asset: ${assetName}.md
║ Skill: ${skillName}
║ Referenced from: ${referencedFrom}
║ Context: ${searchContext.substring(0, 60)}
║                                                            ║
║ ACTION REQUIRED:                                           ║
║ 1. Research this topic from OFFICIAL sources               ║
║    (MDN, W3C specs, framework docs, RFCs)                  ║
║ 2. Verify every claim against documentation                ║
║ 3. Include only factual, verifiable content                ║
║ 4. Write to: ${filePath}
║ 5. Keep under 500 lines                                    ║
║                                                            ║
║ DO NOT hallucinate. If uncertain, state uncertainty.        ║
║ Every code example must be tested/testable.                 ║
║ Every API reference must cite the official source.          ║
╚════════════════════════════════════════════════════════════╝`;

console.log(banner);
