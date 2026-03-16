/**
 * User Consent Tracking for claude-mem Integration
 *
 * This module handles user consent for conversation storage. It provides
 * functions to check consent status, prompt for consent, and persist
 * consent decisions to the configuration file.
 *
 * GDPR/Privacy Compliance:
 * - Explicit consent required before storing personal data
 * - Clear explanation of what data is collected
 * - Easy consent revocation
 * - Audit trail of consent status
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { loadConfig, resetConfig } from './privacy-config';
import type { PrivacyConfig } from './privacy-config';

/**
 * Consent status result
 *
 * @property hasConsent - Whether user has granted consent
 * @property consentDate - ISO timestamp of when consent was granted (if applicable)
 * @property needsPrompt - Whether user should be prompted for consent
 */
export interface ConsentStatus {
  hasConsent: boolean;
  consentDate?: string;
  needsPrompt: boolean;
}

/**
 * Consent explanation text
 */
const CONSENT_EXPLANATION = `
╔═══════════════════════════════════════════════════════════════════════════╗
║                    MAESTRO MEMORY SYSTEM - CONSENT                        ║
╚═══════════════════════════════════════════════════════════════════════════╝

The Maestro memory system stores conversation history to improve your
experience by providing context-aware assistance.

┌─────────────────────────────────────────────────────────────────────────┐
│ WHAT DATA IS STORED:                                                    │
├─────────────────────────────────────────────────────────────────────────┤
│ • Conversation messages (user prompts and assistant responses)          │
│ • Agent delegations (which specialized agents were used)                │
│ • Tool calls (commands executed, files accessed)                        │
│ • Evaluations (quality assessments of work)                             │
│ • Metadata (timestamps, agent names, skills used, files modified)       │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ PRIVACY CONTROLS AVAILABLE:                                             │
├─────────────────────────────────────────────────────────────────────────┤
│ • Retention Policy: Automatic deletion after configurable period        │
│ • Secret Sanitization: Automatic redaction of API keys, tokens, etc.    │
│ • File Exclusions: Sensitive files (.env, secrets.json) not stored      │
│ • Agent Exclusions: Exclude specific agents from storage                │
│ • Data Export: Download all stored data in JSON or Markdown format      │
│ • Data Deletion: Permanently delete all stored conversations            │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ YOUR DATA, YOUR CONTROL:                                                │
├─────────────────────────────────────────────────────────────────────────┤
│ • Data stored locally on your machine (not sent to external servers)    │
│ • You can revoke consent at any time                                    │
│ • You can export or delete all data at any time                         │
│ • Configuration file: .claude/memory-config.json                        │
└─────────────────────────────────────────────────────────────────────────┘

Learn more: .claude/services/memory/PRIVACY_README.md
`;

/**
 * Gets configuration file path
 *
 * Uses the same search logic as privacy-config.ts but returns the
 * write path (project-level config).
 *
 * @returns Absolute path to configuration file
 */
function getConfigFilePath(): string {
  // Check if env var override exists
  if (process.env.CLAUDE_MEMORY_CONFIG) {
    return process.env.CLAUDE_MEMORY_CONFIG;
  }

  // Default to project-level config
  return join(process.cwd(), '.claude', 'memory-config.json');
}

/**
 * Reads current configuration from file
 *
 * @returns Current configuration object or null if not found
 */
function readConfigFile(): Record<string, any> | null {
  const configPath = getConfigFilePath();

  if (!existsSync(configPath)) {
    return null;
  }

  try {
    const fileContent = readFileSync(configPath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error(`Failed to read config file at ${configPath}:`, error);
    return null;
  }
}

/**
 * Writes configuration to file
 *
 * Preserves existing fields and formatting as much as possible.
 * Adds consent-related fields without disrupting user customizations.
 *
 * @param config - Configuration object to write
 */
function writeConfigFile(config: Record<string, any>): void {
  const configPath = getConfigFilePath();

  try {
    const json = JSON.stringify(config, null, 2);
    writeFileSync(configPath, json, 'utf-8');
    console.log(`Configuration updated: ${configPath}`);
  } catch (error) {
    console.error(`Failed to write config file at ${configPath}:`, error);
    throw error;
  }
}

/**
 * Checks if user has granted consent
 *
 * Reads the configuration file and checks the requireConsent and
 * userConsent fields. If requireConsent is false, implicit consent
 * is assumed (returns true).
 *
 * @returns True if user has granted consent (explicit or implicit)
 *
 * @example
 * ```typescript
 * if (hasUserConsent()) {
 *   await storeConversation(data);
 * } else {
 *   console.log('Consent required before storing data');
 * }
 * ```
 */
export function hasUserConsent(): boolean {
  const config = loadConfig();

  // If requireConsent is false, implicit consent (default behavior)
  if (!config.requireConsent) {
    return true;
  }

  // Read config file to check for explicit userConsent field
  const configData = readConfigFile();
  if (!configData) {
    // No config file, check defaults
    return !config.requireConsent;
  }

  // Check for explicit consent field
  return configData.userConsent === true;
}

/**
 * Gets detailed consent status
 *
 * Provides comprehensive information about current consent state,
 * including whether a prompt is needed.
 *
 * @returns Consent status object
 *
 * @example
 * ```typescript
 * const status = getConsentStatus();
 * if (status.needsPrompt) {
 *   const granted = await promptForConsent();
 * }
 * ```
 */
export function getConsentStatus(): ConsentStatus {
  const config = loadConfig();
  const configData = readConfigFile();

  // If requireConsent is false, no prompt needed
  if (!config.requireConsent) {
    return {
      hasConsent: true,
      needsPrompt: false
    };
  }

  // Check for explicit consent
  if (configData && configData.userConsent === true) {
    return {
      hasConsent: true,
      consentDate: configData.consentDate,
      needsPrompt: false
    };
  }

  // Consent required but not granted
  return {
    hasConsent: false,
    needsPrompt: true
  };
}

/**
 * Checks if consent prompt is required
 *
 * Returns true if requireConsent is enabled but user hasn't granted consent yet.
 *
 * @returns True if consent prompt should be shown
 *
 * @example
 * ```typescript
 * if (requiresConsentPrompt()) {
 *   const granted = await promptForConsent();
 *   if (!granted) {
 *     console.log('Storage disabled - consent not granted');
 *     return;
 *   }
 * }
 * ```
 */
export function requiresConsentPrompt(): boolean {
  return getConsentStatus().needsPrompt;
}

/**
 * Prompts user for consent interactively
 *
 * Displays detailed explanation of what data is collected and what
 * privacy controls are available. Accepts yes/no response.
 *
 * This is an async function to support potential future interactive
 * prompts (though currently uses synchronous stdin).
 *
 * @returns Promise resolving to true if user grants consent, false otherwise
 *
 * @example
 * ```typescript
 * const granted = await promptForConsent();
 * if (granted) {
 *   console.log('Thank you! Memory system enabled.');
 * } else {
 *   console.log('Memory system will remain disabled.');
 * }
 * ```
 */
export async function promptForConsent(): Promise<boolean> {
  console.log(CONSENT_EXPLANATION);
  console.log('\nDo you consent to storing conversation history?');
  console.log('Answer (yes/no): ');

  // Read user input synchronously (Bun supports this)
  const response = await readUserInput();
  const normalized = response.toLowerCase().trim();

  const granted = normalized === 'yes' || normalized === 'y';

  // Store consent decision
  setConsent(granted);

  if (granted) {
    console.log('\n✓ Consent granted. Memory system enabled.');
    console.log('  You can revoke consent at any time by setting userConsent: false');
    console.log('  in .claude/memory-config.json or using the CLI tool.\n');
  } else {
    console.log('\n✗ Consent not granted. Memory system disabled.');
    console.log('  You can grant consent later by setting userConsent: true');
    console.log('  in .claude/memory-config.json or using the CLI tool.\n');
  }

  return granted;
}

/**
 * Reads user input from stdin
 *
 * Helper function for interactive consent prompt.
 * Uses Bun's synchronous stdin reading capabilities.
 *
 * @returns User input as string
 */
async function readUserInput(): Promise<string> {
  // Bun allows synchronous stdin reading
  const decoder = new TextDecoder();
  const buffer = new Uint8Array(1024);

  // Read from stdin (file descriptor 0)
  const stdin = Bun.file('/dev/stdin');
  const text = await stdin.text();

  // Get first line
  const firstLine = text.split('\n')[0];
  return firstLine || '';
}

/**
 * Sets user consent status
 *
 * Persists consent decision to configuration file along with timestamp.
 * Automatically reloads configuration cache after update.
 *
 * @param granted - True to grant consent, false to revoke
 *
 * @example
 * ```typescript
 * // Grant consent
 * setConsent(true);
 *
 * // Revoke consent
 * setConsent(false);
 * ```
 */
export function setConsent(granted: boolean): void {
  const configPath = getConfigFilePath();
  let configData = readConfigFile();

  // If no config file exists, create with defaults
  if (!configData) {
    configData = {
      "$schema": "https://json-schema.org/draft-07/schema#",
      "description": "Privacy and memory configuration for Maestro claude-mem integration",
      "enabled": true,
      "retentionDays": 30,
      "sanitizeSecrets": true,
      "sanitizePatterns": [],
      "excludeAgents": [],
      "excludeFiles": [
        "**/.env",
        "**/.env.*",
        "**/secrets.json",
        "**/credentials.json",
        "**/*.key",
        "**/*.pem",
        "**/*_rsa",
        "**/id_rsa",
        "**/id_dsa",
        "**/id_ecdsa",
        "**/id_ed25519"
      ],
      "requireConsent": true
    };
  }

  // Update consent fields
  configData.userConsent = granted;
  configData.consentDate = new Date().toISOString();
  configData.requireConsent = true; // Ensure requireConsent is set

  // Write updated config
  writeConfigFile(configData);

  // Reset config cache to reload new values
  resetConfig();

  console.log(`Consent ${granted ? 'granted' : 'revoked'} at ${configData.consentDate}`);
}

/**
 * Revokes user consent
 *
 * Convenience function equivalent to setConsent(false).
 * Also logs a notice about data retention.
 *
 * @example
 * ```typescript
 * revokeConsent();
 * // Future conversations will not be stored
 * // Existing data remains until manually deleted
 * ```
 */
export function revokeConsent(): void {
  setConsent(false);
  console.log('\nNote: Revoking consent prevents future storage.');
  console.log('Existing stored conversations remain until you delete them.');
  console.log('Use the CLI tool to export or delete existing data:\n');
  console.log('  bun .claude/services/memory/cli-privacy-tool.ts export json');
  console.log('  bun .claude/services/memory/cli-privacy-tool.ts delete-all --confirm\n');
}

/**
 * Grants user consent
 *
 * Convenience function equivalent to setConsent(true).
 *
 * @example
 * ```typescript
 * grantConsent();
 * // Memory system now enabled for future conversations
 * ```
 */
export function grantConsent(): void {
  setConsent(true);
}

/**
 * Displays current consent status
 *
 * Prints formatted consent information to console.
 * Useful for CLI tools and debugging.
 *
 * @example
 * ```typescript
 * displayConsentStatus();
 * // Output:
 * // Consent Status: GRANTED
 * // Consent Date: 2025-01-15T10:30:00.000Z
 * // Requires Consent: Yes
 * ```
 */
export function displayConsentStatus(): void {
  const status = getConsentStatus();
  const config = loadConfig();

  console.log('\n╔═══════════════════════════════════════════════════════╗');
  console.log('║          CONSENT STATUS                               ║');
  console.log('╚═══════════════════════════════════════════════════════╝\n');

  console.log(`Consent Status: ${status.hasConsent ? '✓ GRANTED' : '✗ NOT GRANTED'}`);

  if (status.consentDate) {
    const date = new Date(status.consentDate);
    console.log(`Consent Date: ${date.toLocaleString()}`);
  }

  console.log(`Requires Consent: ${config.requireConsent ? 'Yes' : 'No (implicit)'}`);
  console.log(`Memory System: ${config.enabled ? 'Enabled' : 'Disabled'}`);

  if (status.needsPrompt) {
    console.log('\n⚠ Consent prompt required before storing data.');
    console.log('  Run: bun .claude/services/memory/cli-privacy-tool.ts consent yes');
  }

  console.log('\n');
}
