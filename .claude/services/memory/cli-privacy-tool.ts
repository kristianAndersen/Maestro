#!/usr/bin/env bun

/**
 * CLI Privacy Tool for Maestro Memory System
 *
 * Provides command-line interface for managing privacy settings,
 * testing sanitization, running retention policies, exporting data,
 * and managing user consent.
 *
 * Usage:
 *   bun cli-privacy-tool.ts <command> [options]
 *
 * Commands:
 *   config                    - Show current privacy configuration
 *   sanitize <text>          - Test sanitization on provided text
 *   retention                - Run retention policy enforcement now
 *   export <format>          - Export all conversations (json or markdown)
 *   delete-all --confirm     - Delete all conversations (requires --confirm)
 *   consent [yes|no]         - Set or view consent status
 *   help                     - Show this help message
 */

import { loadConfig } from './privacy-config';
import { sanitizeContent, getDefaultPatternsInfo } from './sanitizer';
import { enforceRetentionPolicy } from '../database/retention';
import { exportConversations, deleteAllConversations } from './export';
import {
  hasUserConsent,
  getConsentStatus,
  setConsent,
  displayConsentStatus,
  promptForConsent
} from './consent';
import { join } from 'path';

/**
 * ANSI color codes for terminal output
 */
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

/**
 * Formats text with color
 */
function color(text: string, colorCode: string): string {
  return `${colorCode}${text}${colors.reset}`;
}

/**
 * Prints success message
 */
function success(message: string): void {
  console.log(color('✓ ', colors.green) + message);
}

/**
 * Prints error message
 */
function error(message: string): void {
  console.error(color('✗ ', colors.red) + message);
}

/**
 * Prints warning message
 */
function warn(message: string): void {
  console.warn(color('⚠ ', colors.yellow) + message);
}

/**
 * Prints info message
 */
function info(message: string): void {
  console.log(color('ℹ ', colors.blue) + message);
}

/**
 * Prints section header
 */
function header(text: string): void {
  console.log('\n' + color(text, colors.bright + colors.cyan));
  console.log(color('='.repeat(text.length), colors.cyan) + '\n');
}

/**
 * Shows help message
 */
function showHelp(): void {
  console.log(color('\nMaestro Privacy Tool', colors.bright + colors.cyan));
  console.log(color('='.repeat(60), colors.cyan) + '\n');

  console.log(color('USAGE:', colors.bright));
  console.log('  bun cli-privacy-tool.ts <command> [options]\n');

  console.log(color('COMMANDS:', colors.bright));
  console.log('  ' + color('config', colors.green));
  console.log('    Show current privacy configuration from memory-config.json\n');

  console.log('  ' + color('sanitize <text>', colors.green));
  console.log('    Test sanitization on provided text');
  console.log('    Example: bun cli-privacy-tool.ts sanitize "My API key is STRIPPED_TEST_KEY_4"\n');

  console.log('  ' + color('retention', colors.green));
  console.log('    Run retention policy enforcement immediately');
  console.log('    Deletes conversations older than configured retention period\n');

  console.log('  ' + color('export <format>', colors.green));
  console.log('    Export all conversations to file');
  console.log('    Formats: json, markdown');
  console.log('    Example: bun cli-privacy-tool.ts export json\n');

  console.log('  ' + color('delete-all --confirm', colors.green));
  console.log('    Delete ALL conversations permanently (requires --confirm flag)');
  console.log('    Example: bun cli-privacy-tool.ts delete-all --confirm\n');

  console.log('  ' + color('consent [yes|no]', colors.green));
  console.log('    View or set user consent status');
  console.log('    Examples:');
  console.log('      bun cli-privacy-tool.ts consent         (view status)');
  console.log('      bun cli-privacy-tool.ts consent yes     (grant consent)');
  console.log('      bun cli-privacy-tool.ts consent no      (revoke consent)\n');

  console.log('  ' + color('help', colors.green));
  console.log('    Show this help message\n');

  console.log(color('EXAMPLES:', colors.bright));
  console.log('  # Check current configuration');
  console.log('  bun cli-privacy-tool.ts config\n');

  console.log('  # Test sanitization');
  console.log('  bun cli-privacy-tool.ts sanitize "Bearer eyJ..."\n');

  console.log('  # Export data');
  console.log('  bun cli-privacy-tool.ts export json\n');

  console.log('  # Grant consent');
  console.log('  bun cli-privacy-tool.ts consent yes\n');

  console.log(color('FILES:', colors.bright));
  console.log('  Config: .claude/memory-config.json');
  console.log('  Database: .claude/memory/maestro.db');
  console.log('  Exports: .claude/memory/exports/\n');
}

/**
 * Shows current configuration
 */
function showConfig(): void {
  header('Privacy Configuration');

  const config = loadConfig();

  console.log(color('Master Settings:', colors.bright));
  console.log(`  Enabled: ${config.enabled ? color('Yes', colors.green) : color('No', colors.red)}`);
  console.log(`  Require Consent: ${config.requireConsent ? color('Yes', colors.yellow) : color('No', colors.green)}`);
  console.log('');

  console.log(color('Data Retention:', colors.bright));
  console.log(`  Retention Period: ${color(String(config.retentionDays), colors.cyan)} days`);
  console.log('');

  console.log(color('Sanitization:', colors.bright));
  console.log(`  Sanitize Secrets: ${config.sanitizeSecrets ? color('Yes', colors.green) : color('No', colors.red)}`);

  if (config.sanitizePatterns && config.sanitizePatterns.length > 0) {
    console.log(`  Custom Patterns: ${color(String(config.sanitizePatterns.length), colors.cyan)}`);
    config.sanitizePatterns.forEach((pattern, i) => {
      console.log(`    ${i + 1}. ${pattern}`);
    });
  } else {
    console.log(`  Custom Patterns: ${color('None', colors.dim)}`);
  }

  const patternsInfo = getDefaultPatternsInfo();
  console.log(`  Default Patterns: ${color(String(patternsInfo.count), colors.cyan)}`);
  console.log('');

  console.log(color('Exclusions:', colors.bright));
  if (config.excludeAgents && config.excludeAgents.length > 0) {
    console.log(`  Excluded Agents: ${color(String(config.excludeAgents.length), colors.cyan)}`);
    config.excludeAgents.forEach(agent => {
      console.log(`    - ${agent}`);
    });
  } else {
    console.log(`  Excluded Agents: ${color('None', colors.dim)}`);
  }
  console.log('');

  if (config.excludeFiles && config.excludeFiles.length > 0) {
    console.log(`  Excluded File Patterns: ${color(String(config.excludeFiles.length), colors.cyan)}`);
    config.excludeFiles.slice(0, 5).forEach(pattern => {
      console.log(`    - ${pattern}`);
    });
    if (config.excludeFiles.length > 5) {
      console.log(`    ... and ${config.excludeFiles.length - 5} more`);
    }
  } else {
    console.log(`  Excluded File Patterns: ${color('None', colors.dim)}`);
  }
  console.log('');

  console.log(color('Configuration File:', colors.bright));
  const configPath = join(process.cwd(), '.claude', 'memory-config.json');
  console.log(`  ${configPath}`);
  console.log('');
}

/**
 * Tests sanitization on provided text
 */
function testSanitization(text: string): void {
  header('Sanitization Test');

  const config = loadConfig();

  if (!config.sanitizeSecrets) {
    warn('Sanitization is currently disabled in configuration');
    console.log('');
  }

  console.log(color('Original Text:', colors.bright));
  console.log(color(text, colors.dim));
  console.log('');

  const result = sanitizeContent(text, config);

  console.log(color('Sanitized Text:', colors.bright));
  console.log(result.sanitized);
  console.log('');

  console.log(color('Detection Results:', colors.bright));
  if (result.foundSecrets.length > 0) {
    console.log(`  Secrets Found: ${color(String(result.foundSecrets.length), colors.red)} types`);
    result.foundSecrets.forEach(secretType => {
      console.log(`    - ${color(secretType, colors.red)}`);
    });
    console.log(`  Redactions Made: ${color(String(result.redactionCount), colors.yellow)}`);
  } else {
    success('No secrets detected');
  }
  console.log('');
}

/**
 * Runs retention policy enforcement
 */
async function runRetention(): Promise<void> {
  header('Retention Policy Enforcement');

  const config = loadConfig();
  const dbPath = join(process.cwd(), '.claude', 'memory', 'maestro.db');

  console.log(`Retention Period: ${color(String(config.retentionDays), colors.cyan)} days`);
  console.log(`Database: ${dbPath}`);
  console.log('');

  try {
    info('Running retention policy...');
    const result = await enforceRetentionPolicy(dbPath, config.retentionDays);

    if (result.conversationsDeleted > 0) {
      success(`Deleted ${result.conversationsDeleted} old conversations`);
      console.log(`  Messages: ${result.messagesDeleted}`);
      console.log(`  Delegations: ${result.delegationsDeleted}`);
      console.log(`  Evaluations: ${result.evaluationsDeleted}`);
      console.log(`  Tool Calls: ${result.toolCallsDeleted}`);
    } else {
      info('No conversations exceeded retention period');
    }
    console.log('');

  } catch (err) {
    error(`Retention policy failed: ${err}`);
    console.log('');
  }
}

/**
 * Exports conversations
 */
async function runExport(format: string): Promise<void> {
  header(`Export Conversations (${format.toUpperCase()})`);

  if (format !== 'json' && format !== 'markdown') {
    error(`Unsupported format: ${format}`);
    console.log('Supported formats: json, markdown');
    console.log('');
    return;
  }

  const dbPath = join(process.cwd(), '.claude', 'memory', 'maestro.db');

  try {
    info('Starting export...');
    const result = await exportConversations(format as 'json' | 'markdown', dbPath);

    if (result.success && result.filePath) {
      success('Export completed successfully!');
      console.log('');
      console.log(color('Export Statistics:', colors.bright));
      console.log(`  Conversations: ${color(String(result.conversationCount), colors.cyan)}`);
      console.log(`  Messages: ${color(String(result.totalMessages), colors.cyan)}`);
      if (result.fileSize) {
        const sizeKB = (result.fileSize / 1024).toFixed(1);
        console.log(`  File Size: ${color(sizeKB + ' KB', colors.cyan)}`);
      }
      console.log('');
      console.log(color('Export File:', colors.bright));
      console.log(`  ${result.filePath}`);
    } else {
      error(`Export failed: ${result.error || 'Unknown error'}`);
    }
    console.log('');

  } catch (err) {
    error(`Export failed: ${err}`);
    console.log('');
  }
}

/**
 * Deletes all conversations
 */
async function runDeleteAll(confirmed: boolean): Promise<void> {
  header('Delete All Conversations');

  if (!confirmed) {
    error('Deletion requires --confirm flag for safety');
    console.log('');
    console.log('This operation will permanently delete ALL stored conversations.');
    console.log('This action cannot be undone.');
    console.log('');
    console.log('To proceed, run:');
    console.log(color('  bun cli-privacy-tool.ts delete-all --confirm', colors.yellow));
    console.log('');
    console.log('To export data before deleting:');
    console.log(color('  bun cli-privacy-tool.ts export json', colors.cyan));
    console.log('');
    return;
  }

  const dbPath = join(process.cwd(), '.claude', 'memory', 'maestro.db');

  warn('WARNING: This will permanently delete all conversations!');
  console.log('');
  console.log('This action cannot be undone.');
  console.log('Consider exporting data first.');
  console.log('');

  try {
    info('Deleting all conversations...');
    const result = await deleteAllConversations(true, dbPath);

    if (result.success) {
      success('All conversations deleted successfully!');
      console.log('');
      console.log(color('Deletion Statistics:', colors.bright));
      console.log(`  Conversations: ${color(String(result.conversationsDeleted), colors.cyan)}`);
      console.log(`  Messages: ${color(String(result.messagesDeleted), colors.cyan)}`);
      console.log(`  Delegations: ${color(String(result.delegationsDeleted), colors.cyan)}`);
      console.log(`  Evaluations: ${color(String(result.evaluationsDeleted), colors.cyan)}`);
      console.log(`  Tool Calls: ${color(String(result.toolCallsDeleted), colors.cyan)}`);
    } else {
      error(`Deletion failed: ${result.error || 'Unknown error'}`);
    }
    console.log('');

  } catch (err) {
    error(`Deletion failed: ${err}`);
    console.log('');
  }
}

/**
 * Manages consent
 */
async function manageConsent(action?: string): Promise<void> {
  if (!action) {
    // Show current status
    displayConsentStatus();
    return;
  }

  const normalized = action.toLowerCase().trim();

  if (normalized === 'yes' || normalized === 'y' || normalized === 'grant') {
    header('Grant Consent');
    setConsent(true);
    success('Consent granted!');
    console.log('Memory system will now store future conversations.');
    console.log('');
  } else if (normalized === 'no' || normalized === 'n' || normalized === 'revoke') {
    header('Revoke Consent');
    setConsent(false);
    warn('Consent revoked');
    console.log('Memory system will NOT store future conversations.');
    console.log('');
    console.log('Note: Existing data remains until you delete it.');
    console.log('To delete existing data, run:');
    console.log(color('  bun cli-privacy-tool.ts delete-all --confirm', colors.yellow));
    console.log('');
  } else if (normalized === 'prompt') {
    // Interactive prompt
    await promptForConsent();
  } else {
    error(`Invalid consent action: ${action}`);
    console.log('Valid actions: yes, no, prompt');
    console.log('');
  }
}

/**
 * Main CLI entry point
 */
async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    showHelp();
    return;
  }

  const command = args[0].toLowerCase();

  switch (command) {
    case 'config':
      showConfig();
      break;

    case 'sanitize':
      if (args.length < 2) {
        error('Missing text argument');
        console.log('Usage: bun cli-privacy-tool.ts sanitize <text>');
        console.log('');
      } else {
        const text = args.slice(1).join(' ');
        testSanitization(text);
      }
      break;

    case 'retention':
      await runRetention();
      break;

    case 'export':
      if (args.length < 2) {
        error('Missing format argument');
        console.log('Usage: bun cli-privacy-tool.ts export <format>');
        console.log('Formats: json, markdown');
        console.log('');
      } else {
        await runExport(args[1]);
      }
      break;

    case 'delete-all':
      const confirmed = args.includes('--confirm');
      await runDeleteAll(confirmed);
      break;

    case 'consent':
      await manageConsent(args[1]);
      break;

    case 'help':
    case '--help':
    case '-h':
      showHelp();
      break;

    default:
      error(`Unknown command: ${command}`);
      console.log('Run "bun cli-privacy-tool.ts help" for usage information');
      console.log('');
  }
}

// Run CLI
main().catch((err) => {
  error(`Fatal error: ${err}`);
  console.error(err);
  process.exit(1);
});
