#!/usr/bin/env node
// Session Initializer Hook for Maestro
// Purpose: Provides warm-up context when Maestro mode starts
// Trigger: UserPromptSubmit (when /maestro detected or Maestro mode active)

import { readFileSync, existsSync, readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function formatDuration(startTime) {
  const start = new Date(startTime);
  const now = new Date();
  const diffMs = now - start;

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m`;
  } else {
    return 'just started';
  }
}

function formatTimestamp(isoString) {
  const date = new Date(isoString);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

function parseWorkLog(logPath) {
  if (!existsSync(logPath)) {
    return [];
  }

  try {
    const content = readFileSync(logPath, 'utf-8');
    const lines = content.trim().split('\n');
    const entries = [];

    // Look for file modification entries (lines starting with "• " and containing file paths)
    for (const line of lines.reverse()) {
      if (entries.length >= 5) break; // Last 5 entries

      // Match patterns like "• .claude/hooks/file.js (action)"
      const fileMatch = line.match(/^•\s+([^\s]+\.[a-z]{2,4})/i);
      if (fileMatch) {
        entries.push(fileMatch[1]);
      }
    }

    return entries;
  } catch {
    return [];
  }
}

function findLatestBackup(sessionsDir) {
  if (!existsSync(sessionsDir)) return null;

  try {
    const files = readdirSync(sessionsDir)
      .filter(f => f.endsWith('.backup.json'))
      .sort()
      .reverse();

    if (files.length > 0) {
      const backupPath = join(sessionsDir, files[0]);
      const backup = JSON.parse(readFileSync(backupPath, 'utf-8'));

      // Validate backup structure - return null if malformed
      if (!backup || typeof backup !== 'object') return null;
      if (!backup.sessionId) return null;

      // Ensure summary exists with defaults
      backup.summary = backup.summary || {};
      backup.summary.promptCount = backup.summary.promptCount || 0;
      backup.summary.activeDomain = backup.summary.activeDomain || 'unknown';

      return backup;
    }
  } catch {
    return null;
  }
  return null;
}

function isMaestroActivation(prompt) {
  const lowerPrompt = prompt.toLowerCase();
  return lowerPrompt.includes('/maestro') ||
         lowerPrompt.includes('maestro mode') ||
         lowerPrompt.startsWith('maestro');
}

function main() {
  try {
    // Read user prompt from stdin
    let userPrompt = '';
    try {
      userPrompt = readFileSync(0, 'utf-8').trim();
    } catch {
      // Silent exit if stdin not available
      process.exit(0);
    }

    // Only proceed if Maestro activation detected
    if (!isMaestroActivation(userPrompt)) {
      process.exit(0);
    }

    // Read context.json
    const contextPath = join(__dirname, '..', 'context.json');
    if (!existsSync(contextPath)) {
      // No prior context - this is a fresh session, no warm-up needed
      process.exit(0);
    }

    let context;
    try {
      context = JSON.parse(readFileSync(contextPath, 'utf-8'));
    } catch {
      // Invalid context file - silent exit
      process.exit(0);
    }

    // Check if there's meaningful session data
    const hasSessionData = context.skillTracking?.sessionStart ||
                           context.skillTracking?.promptCount > 0 ||
                           context.evaluationTracking?.totalDelegations > 0;

    if (!hasSessionData) {
      // No meaningful data to show
      process.exit(0);
    }

    // Build the warm-up output
    const output = [];
    output.push('╔════════════════════════════════════════════════════════════╗');
    output.push('║ 🎼 MAESTRO SESSION WARM-UP                                 ║');
    output.push('╠════════════════════════════════════════════════════════════╣');

    // Session info
    const sessionStart = context.skillTracking?.sessionStart;
    const promptCount = context.skillTracking?.promptCount || 0;
    const duration = sessionStart ? formatDuration(sessionStart) : 'unknown';

    const sessionLine = `║ SESSION: ${duration} • ${promptCount} prompts so far`;
    output.push(sessionLine.padEnd(61) + '║');

    // Check for previous session backup
    const sessionsDir = join(__dirname, '..', 'sessions');
    const previousSession = findLatestBackup(sessionsDir);
    if (previousSession && previousSession.sessionId !== context.skillTracking?.sessionId) {
      output.push('║                                                            ║');
      output.push('║ 📂 PREVIOUS SESSION AVAILABLE:                             ║');
      const prevPrompts = previousSession.summary?.promptCount || 0;
      const prevDomain = previousSession.summary?.activeDomain || 'general';
      const prevLine = `║ • ${prevPrompts} prompts, domain: ${prevDomain}`;
      output.push(prevLine.padEnd(61) + '║');
    }

    // Domain info
    const activeDomain = context.activeDomain || 'No domain set';
    const domainLine = `║ DOMAIN: ${activeDomain}`;
    output.push(domainLine.padEnd(61) + '║');

    // Recent work
    const workLogPath = join(__dirname, '..', '..', '.maestro-work-log.txt');
    const recentFiles = parseWorkLog(workLogPath);

    if (recentFiles.length > 0) {
      output.push('║                                                            ║');
      output.push('║ RECENT WORK:                                               ║');

      for (const file of recentFiles.slice(0, 3)) { // Show max 3
        const timestamp = context.skillTracking?.lastPromptTime
          ? formatTimestamp(context.skillTracking.lastPromptTime)
          : '--:--';
        const fileLine = `║ • ${timestamp} ${file}`;
        output.push(fileLine.padEnd(61) + '║');
      }
    }

    // Skills loaded
    const recommendedSkills = context.skillTracking?.recommended || [];
    if (recommendedSkills.length > 0) {
      output.push('║                                                            ║');
      const skillsList = recommendedSkills.join(', ');
      const skillsLine = `║ SKILLS LOADED: ${skillsList}`;

      // Handle long skill lists by truncating
      if (skillsLine.length > 60) {
        const truncated = skillsList.substring(0, 35) + '...';
        output.push(`║ SKILLS LOADED: ${truncated}`.padEnd(61) + '║');
      } else {
        output.push(skillsLine.padEnd(61) + '║');
      }
    }

    // Pending evaluations
    const skippedEvals = context.evaluationTracking?.skippedEvaluations || 0;
    if (skippedEvals > 0) {
      output.push('║                                                            ║');
      const warningLine = `║ ⚠️  PENDING: ${skippedEvals} delegations not yet evaluated`;
      output.push(warningLine.padEnd(61) + '║');
    }

    output.push('╚════════════════════════════════════════════════════════════╝');

    // Output the warm-up box
    console.log(output.join('\n'));

  } catch {
    // Silent exit on any error
    process.exit(0);
  }
}

main();
