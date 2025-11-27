#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const CONTEXT_FILE_PATH = join(__dirname, '..', 'context.json');

/**
 * Reads data from stdin.
 * @returns {Promise<string>}
 */
async function readStdin() {
  return new Promise((resolve) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', chunk => (data += chunk));
    process.stdin.on('end', () => resolve(data.trim()));
  });
}

/**
 * Determines the project domain based on a file path.
 * Maps file paths to Maestro framework domains.
 * @param {string} filePath - The path of the file that was modified.
 * @returns {string} The determined domain.
 */
function getDomain(filePath) {
    if (!filePath) return 'unknown';

    // Normalize path separators for cross-platform compatibility
    const normalizedPath = filePath.replace(/\\/g, '/');

    // Maestro framework domain mapping (order matters - most specific first)
    if (normalizedPath.match(/\.claude\/agents\/.*\.md$/)) {
        return 'agents';
    }
    if (normalizedPath.includes('.claude/skills/')) {
        return 'skills';
    }
    if (normalizedPath.includes('.claude/hooks/')) {
        return 'hooks';
    }
    if (normalizedPath.includes('.claude/commands/')) {
        return 'commands';
    }

    // Testing domain (check before development to avoid false positives)
    if (normalizedPath.includes('test/') ||
        normalizedPath.includes('__tests__/') ||
        normalizedPath.match(/\.(test|spec)\.(js|jsx|ts|tsx|py)$/)) {
        return 'testing';
    }

    // Documentation domain
    if (normalizedPath.includes('docs/') || normalizedPath.endsWith('.md')) {
        return 'documentation';
    }

    // Application development domains
    if (normalizedPath.includes('src/') ||
        normalizedPath.includes('lib/') ||
        normalizedPath.match(/\.(js|jsx|ts|tsx|py|go|rs|java|rb|php|c|cpp|h|hpp)$/)) {
        return 'development';
    }

    // Configuration files
    if (normalizedPath.match(/\.(json|yaml|yml|toml|ini|conf|config)$/)) {
        return 'configuration';
    }

    return 'unknown';
}

/**
 * Main function to track context.
 */
async function main() {
  const input = await readStdin();
  if (!input) {
    process.exit(0);
  }

  try {
    const toolData = JSON.parse(input);
    const toolName = toolData.tool;
    const filePath = toolData.file_path || toolData.file;

    // Only track context for file modification tools.
    const modifyingTools = ['Write', 'Edit', 'write_file', 'replace'];
    if (!modifyingTools.includes(toolName) || !filePath) {
      process.exit(0);
    }

    // Determine the domain from the file path.
    const activeDomain = getDomain(filePath);

    // Read existing context or create a new one.
    let context = {};
    try {
      const currentContext = readFileSync(CONTEXT_FILE_PATH, 'utf8');
      context = JSON.parse(currentContext);
    } catch (e) {
      // context.json doesn't exist or is invalid, start fresh.
      context = {};
    }

    // Update the context.
    context.activeDomain = activeDomain;
    context.lastEditedFile = filePath;
    context.lastUpdated = new Date().toISOString();

    // Write the updated context back to the file.
    writeFileSync(CONTEXT_FILE_PATH, JSON.stringify(context, null, 2), 'utf8');

  } catch (error) {
    // Fail silently if JSON is malformed or there are other errors.
    process.exit(0);
  }
}

main();
