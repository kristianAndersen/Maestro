/**
 * File/Agent Exclusion Filters for Maestro Memory System
 *
 * This module provides filtering logic to determine if conversations should be
 * stored based on privacy configuration rules (agent names and file patterns).
 */

import { PrivacyConfig } from './privacy-config';
import { ParsedConversation, ConversationMessage } from './types';
import { minimatch } from 'minimatch';

/**
 * Determine if a conversation should be stored based on privacy filters
 *
 * Checks against agent exclusions and file pattern exclusions.
 * Returns false (don't store) if ANY exclusion rule matches.
 *
 * @param parsed - Parsed conversation data
 * @param config - Privacy configuration with exclusion rules
 * @returns true if conversation should be stored, false if it should be filtered out
 */
export function shouldStoreConversation(
  parsed: ParsedConversation,
  config: PrivacyConfig
): boolean {
  // If memory disabled, don't store anything
  if (!config.enabled) {
    return false;
  }

  // Check if primary agent is excluded
  if (parsed.metadata.primaryAgent) {
    if (isAgentExcluded(parsed.metadata.primaryAgent, config)) {
      console.log(`[filters] Excluding conversation: agent '${parsed.metadata.primaryAgent}' is in excludeAgents list`);
      return false;
    }
  }

  // Check if any modified files match exclusion patterns
  if (parsed.metadata.filesModified && parsed.metadata.filesModified.length > 0) {
    if (hasExcludedFiles(parsed.metadata.filesModified, config)) {
      console.log(`[filters] Excluding conversation: modified files match exclusion patterns`);
      return false;
    }
  }

  // Check delegations for excluded agents
  for (const delegation of parsed.delegations) {
    if (isAgentExcluded(delegation.agentName, config)) {
      console.log(`[filters] Excluding conversation: delegated to excluded agent '${delegation.agentName}'`);
      return false;
    }
  }

  return true;
}

/**
 * Check if agent name is in exclusion list
 *
 * Performs case-sensitive string comparison against configured excludeAgents list.
 *
 * @param agentName - Name of the agent to check
 * @param config - Privacy configuration with excludeAgents list
 * @returns true if agent should be excluded, false otherwise
 */
export function isAgentExcluded(
  agentName: string,
  config: PrivacyConfig
): boolean {
  return config.excludeAgents.includes(agentName);
}

/**
 * Check if any files match exclusion patterns
 *
 * Uses minimatch for glob pattern matching. Supports patterns like **\/.env, .claude/secrets/**, *.key, etc.
 *
 * @param filePaths - Array of file paths to check
 * @param config - Privacy configuration with excludeFiles patterns
 * @returns true if ANY file matches ANY exclusion pattern, false otherwise
 */
export function hasExcludedFiles(
  filePaths: string[],
  config: PrivacyConfig
): boolean {
  for (const filePath of filePaths) {
    for (const pattern of config.excludeFiles) {
      if (minimatch(filePath, pattern, { dot: true, matchBase: true })) {
        console.log(`[filters] File '${filePath}' matches exclusion pattern '${pattern}'`);
        return true;
      }
    }
  }
  return false;
}

/**
 * Filter messages to remove those containing excluded file references
 *
 * Scans message content for file path patterns and removes messages that
 * reference files matching exclusion patterns. Useful for sanitizing
 * conversation history before storage.
 *
 * @param messages - Array of conversation messages
 * @param config - Privacy configuration with excludeFiles patterns
 * @returns Filtered array of messages (excludes messages with forbidden file refs)
 */
export function filterMessages(
  messages: ConversationMessage[],
  config: PrivacyConfig
): ConversationMessage[] {
  return messages.filter((msg) => {
    // Extract file paths from message content
    const filePaths = extractFilePaths(msg.content);

    // Keep message if NO file paths match exclusion patterns
    return !hasExcludedFiles(filePaths, config);
  });
}

/**
 * Extract file paths from message content
 *
 * Looks for common file path patterns in text
 *
 * @param content - Message content text to scan
 * @returns Array of extracted file paths (may be empty)
 */
export function extractFilePaths(content: string): string[] {
  const filePaths: string[] = [];

  // Pattern 1: Standard file paths (absolute, relative, home)
  // Matches: /path/to/file.ext, ./relative/file.ext, ~/home/file.ext
  const pathRegex = /(?:^|\s)((?:~|\.{0,2})?\/[^\s:;,'"()[\]{}]+\.[a-zA-Z0-9]+)/g;
  const pathMatches = content.matchAll(pathRegex);
  for (const match of pathMatches) {
    filePaths.push(match[1]);
  }

  // Pattern 2: Windows-style paths
  // Matches: C:\path\to\file.ext
  const windowsPathRegex = /(?:^|\s)([A-Z]:\\[^\s:;,'"()[\]{}]+\.[a-zA-Z0-9]+)/gi;
  const windowsMatches = content.matchAll(windowsPathRegex);
  for (const match of windowsMatches) {
    filePaths.push(match[1]);
  }

  // Pattern 3: File paths in markdown code blocks
  // Matches: path/to/file.ext in backticks
  const markdownPathRegex = /`([~./]?[^\s`]+\.[a-zA-Z0-9]+)`/g;
  const markdownMatches = content.matchAll(markdownPathRegex);
  for (const match of markdownMatches) {
    filePaths.push(match[1]);
  }

  return filePaths;
}

/**
 * Get exclusion statistics for a conversation
 *
 * Analyzes a conversation against privacy filters and returns detailed
 * statistics about what would be excluded and why.
 *
 * @param parsed - Parsed conversation data
 * @param config - Privacy configuration
 * @returns Statistics about exclusions
 */
export interface ExclusionStats {
  wouldExclude: boolean;
  reason?: string;
  excludedFilesCount: number;
  excludedFiles: string[];
  excludedAgents: string[];
  excludedMessagesCount: number;
  totalFilesModified: number;
  totalMessages: number;
}

export function getExclusionStats(
  parsed: ParsedConversation,
  config: PrivacyConfig
): ExclusionStats {
  const stats: ExclusionStats = {
    wouldExclude: false,
    excludedFilesCount: 0,
    excludedFiles: [],
    excludedAgents: [],
    excludedMessagesCount: 0,
    totalFilesModified: parsed.metadata.filesModified.length,
    totalMessages: parsed.messages.length,
  };

  // Check if memory disabled
  if (!config.enabled) {
    stats.wouldExclude = true;
    stats.reason = 'Memory system disabled';
    return stats;
  }

  // Check primary agent
  if (parsed.metadata.primaryAgent && isAgentExcluded(parsed.metadata.primaryAgent, config)) {
    stats.wouldExclude = true;
    stats.reason = `Primary agent '${parsed.metadata.primaryAgent}' is excluded`;
    stats.excludedAgents.push(parsed.metadata.primaryAgent);
  }

  // Check delegated agents
  for (const delegation of parsed.delegations) {
    if (isAgentExcluded(delegation.agentName, config)) {
      if (!stats.wouldExclude) {
        stats.wouldExclude = true;
        stats.reason = `Delegated agent '${delegation.agentName}' is excluded`;
      }
      if (!stats.excludedAgents.includes(delegation.agentName)) {
        stats.excludedAgents.push(delegation.agentName);
      }
    }
  }

  // Check modified files
  for (const filePath of parsed.metadata.filesModified) {
    for (const pattern of config.excludeFiles) {
      if (minimatch(filePath, pattern, { dot: true, matchBase: true })) {
        if (!stats.wouldExclude) {
          stats.wouldExclude = true;
          stats.reason = `Modified file '${filePath}' matches exclusion pattern '${pattern}'`;
        }
        stats.excludedFilesCount++;
        stats.excludedFiles.push(filePath);
        break; // Don't count same file multiple times
      }
    }
  }

  // Check messages for excluded file references
  const filteredMessages = filterMessages(parsed.messages, config);
  stats.excludedMessagesCount = parsed.messages.length - filteredMessages.length;

  return stats;
}
