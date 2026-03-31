#!/usr/bin/env bun
/**
 * regression-warning.js — PostToolUse hook
 * Warns when routing-critical files are modified, reminding to run regression before committing.
 */

import { readFileSync } from 'fs';

const WATCHED_FILES = [
  'agent-registry.json',
  'maestro-agent-suggester.js'
];

try {
  const input = JSON.parse(readFileSync('/dev/stdin', 'utf8'));
  const toolName = input.tool_name || '';
  const filePath = input.tool_input?.file_path || input.tool_input?.path || '';

  // Only care about write operations
  if (!['Write', 'Edit', 'write_file', 'replace'].includes(toolName)) {
    process.exit(0);
  }

  // Check if the modified file is one we watch
  const isWatched = WATCHED_FILES.some(f => filePath.endsWith(f));

  if (isWatched) {
    const fileName = filePath.split('/').pop();
    console.log(`⚠️  ROUTING-CRITICAL FILE MODIFIED: ${fileName}`);
    console.log(`   Run regression before committing: bun .claude/hooks/run-regression.js`);
    console.log(`   Pre-commit hook will also gate this automatically.`);
  }
} catch (e) {
  // Silent failure — don't block on hook errors
}

process.exit(0);
