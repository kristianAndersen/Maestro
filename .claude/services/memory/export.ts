/**
 * Data Export and Deletion for claude-mem Integration
 *
 * This module provides functionality to export conversation history
 * in multiple formats (JSON, Markdown) and safely delete all stored data.
 *
 * Privacy Compliance:
 * - GDPR Article 20: Right to data portability (export)
 * - GDPR Article 17: Right to erasure (deletion)
 * - User-friendly data format options
 */

import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { openDatabase, closeDatabase } from '../database/connection';
import type { ParsedConversation } from './types';

/**
 * Export format options
 */
export type ExportFormat = 'json' | 'markdown';

/**
 * Export result
 *
 * @property success - Whether export completed successfully
 * @property filePath - Absolute path to exported file
 * @property conversationCount - Number of conversations exported
 * @property totalMessages - Total number of messages across all conversations
 * @property fileSize - Size of exported file in bytes
 * @property error - Error message if export failed
 */
export interface ExportResult {
  success: boolean;
  filePath?: string;
  conversationCount: number;
  totalMessages: number;
  fileSize?: number;
  error?: string;
}

/**
 * Deletion result
 *
 * @property success - Whether deletion completed successfully
 * @property conversationsDeleted - Number of conversations deleted
 * @property messagesDeleted - Number of messages deleted
 * @property delegationsDeleted - Number of delegations deleted
 * @property evaluationsDeleted - Number of evaluations deleted
 * @property toolCallsDeleted - Number of tool calls deleted
 * @property error - Error message if deletion failed
 */
export interface DeletionResult {
  success: boolean;
  conversationsDeleted: number;
  messagesDeleted: number;
  delegationsDeleted: number;
  evaluationsDeleted: number;
  toolCallsDeleted: number;
  error?: string;
}

/**
 * Gets default database path
 *
 * @returns Absolute path to database file
 */
function getDefaultDbPath(): string {
  return join(process.cwd(), '.claude', 'memory', 'maestro.db');
}

/**
 * Gets export directory path
 *
 * Ensures directory exists before returning path.
 *
 * @returns Absolute path to export directory
 */
function getExportDirectory(): string {
  const exportDir = join(process.cwd(), '.claude', 'memory', 'exports');

  if (!existsSync(exportDir)) {
    mkdirSync(exportDir, { recursive: true });
  }

  return exportDir;
}

/**
 * Retrieves all conversations from database
 *
 * @param dbPath - Absolute path to database file
 * @returns Array of conversation objects with metadata
 */
function getAllConversations(dbPath: string): any[] {
  const db = openDatabase(dbPath);

  try {
    const conversationsStmt = db.prepare(`
      SELECT
        id,
        timestamp,
        duration_ms,
        message_count,
        primary_agent,
        skills_used,
        files_modified,
        created_at
      FROM conversations
      ORDER BY timestamp DESC
    `);

    const conversations = conversationsStmt.all() as any[];

    // Retrieve messages, delegations, evaluations, tool calls for each conversation
    const messagesStmt = db.prepare(`
      SELECT id, role, content, timestamp, metadata
      FROM messages
      WHERE conversation_id = ?
      ORDER BY timestamp ASC
    `);

    const delegationsStmt = db.prepare(`
      SELECT id, agent_name, product, process, performance, timestamp
      FROM delegations
      WHERE conversation_id = ?
      ORDER BY timestamp ASC
    `);

    const evaluationsStmt = db.prepare(`
      SELECT id, verdict, product_score, process_score, performance_score, refinement_needed, timestamp
      FROM evaluations
      WHERE conversation_id = ?
      ORDER BY timestamp ASC
    `);

    const toolCallsStmt = db.prepare(`
      SELECT id, tool_name, parameters, result, success, timestamp
      FROM tool_calls
      WHERE conversation_id = ?
      ORDER BY timestamp ASC
    `);

    // Enrich each conversation with its related data
    return conversations.map(conv => {
      const messages = messagesStmt.all(conv.id);
      const delegations = delegationsStmt.all(conv.id);
      const evaluations = evaluationsStmt.all(conv.id);
      const toolCalls = toolCallsStmt.all(conv.id);

      return {
        id: conv.id,
        timestamp: conv.timestamp,
        durationMs: conv.duration_ms,
        messageCount: conv.message_count,
        primaryAgent: conv.primary_agent,
        skillsUsed: conv.skills_used ? JSON.parse(conv.skills_used) : [],
        filesModified: conv.files_modified ? JSON.parse(conv.files_modified) : [],
        createdAt: conv.created_at,
        messages: messages.map((m: any) => ({
          role: m.role,
          content: m.content,
          timestamp: m.timestamp,
          metadata: m.metadata ? JSON.parse(m.metadata) : undefined
        })),
        delegations: delegations.map((d: any) => ({
          agentName: d.agent_name,
          product: d.product,
          process: d.process,
          performance: d.performance,
          timestamp: d.timestamp
        })),
        evaluations: evaluations.map((e: any) => ({
          verdict: e.verdict,
          productScore: e.product_score,
          processScore: e.process_score,
          performanceScore: e.performance_score,
          refinementNeeded: e.refinement_needed,
          timestamp: e.timestamp
        })),
        toolCalls: toolCalls.map((t: any) => ({
          toolName: t.tool_name,
          parameters: JSON.parse(t.parameters),
          result: JSON.parse(t.result),
          success: t.success === 1,
          timestamp: t.timestamp
        }))
      };
    });
  } catch (error) {
    console.error('Failed to retrieve conversations:', error);
    throw error;
  } finally {
    closeDatabase(db);
  }
}

/**
 * Exports conversations to JSON format
 *
 * Creates a complete, pretty-printed JSON export of all conversations
 * with full metadata and related data.
 *
 * @param conversations - Array of conversation objects
 * @returns JSON string (pretty-printed)
 */
function exportToJSON(conversations: any[]): string {
  const exportData = {
    exportDate: new Date().toISOString(),
    conversationCount: conversations.length,
    totalMessages: conversations.reduce((sum, c) => sum + c.messageCount, 0),
    conversations: conversations
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Exports conversations to Markdown format
 *
 * Creates a human-readable Markdown document with table of contents,
 * formatted conversations, and metadata.
 *
 * @param conversations - Array of conversation objects
 * @returns Markdown string
 */
function exportToMarkdown(conversations: any[]): string {
  let markdown = '# Maestro Conversation History Export\n\n';
  markdown += `**Export Date:** ${new Date().toLocaleString()}\n\n`;
  markdown += `**Total Conversations:** ${conversations.length}\n\n`;

  const totalMessages = conversations.reduce((sum, c) => sum + c.messageCount, 0);
  markdown += `**Total Messages:** ${totalMessages}\n\n`;

  markdown += '---\n\n';

  // Table of Contents
  markdown += '## Table of Contents\n\n';
  conversations.forEach((conv, index) => {
    const date = new Date(conv.timestamp).toLocaleString();
    const agent = conv.primaryAgent || 'Unknown';
    markdown += `${index + 1}. [${date} - ${agent}](#conversation-${index + 1})\n`;
  });
  markdown += '\n---\n\n';

  // Individual Conversations
  conversations.forEach((conv, index) => {
    markdown += `## Conversation ${index + 1}\n\n`;
    markdown += `**ID:** ${conv.id}\n\n`;
    markdown += `**Date:** ${new Date(conv.timestamp).toLocaleString()}\n\n`;
    markdown += `**Primary Agent:** ${conv.primaryAgent || 'Unknown'}\n\n`;

    if (conv.durationMs) {
      const seconds = (conv.durationMs / 1000).toFixed(1);
      markdown += `**Duration:** ${seconds}s\n\n`;
    }

    if (conv.skillsUsed && conv.skillsUsed.length > 0) {
      markdown += `**Skills Used:** ${conv.skillsUsed.join(', ')}\n\n`;
    }

    if (conv.filesModified && conv.filesModified.length > 0) {
      markdown += `**Files Modified:** ${conv.filesModified.length}\n\n`;
      conv.filesModified.forEach((file: string) => {
        markdown += `  - ${file}\n`;
      });
      markdown += '\n';
    }

    // Messages
    if (conv.messages && conv.messages.length > 0) {
      markdown += '### Messages\n\n';
      conv.messages.forEach((msg: any, msgIndex: number) => {
        const time = new Date(msg.timestamp).toLocaleTimeString();
        markdown += `**${msgIndex + 1}. ${msg.role}** (${time})\n\n`;
        markdown += '```\n';
        markdown += msg.content.trim();
        markdown += '\n```\n\n';
      });
    }

    // Delegations
    if (conv.delegations && conv.delegations.length > 0) {
      markdown += '### Delegations\n\n';
      conv.delegations.forEach((del: any, delIndex: number) => {
        const time = new Date(del.timestamp).toLocaleTimeString();
        markdown += `**${delIndex + 1}. ${del.agentName}** (${time})\n\n`;
        markdown += `**Product:** ${del.product}\n\n`;
        markdown += `**Process:** ${del.process}\n\n`;
        markdown += `**Performance:** ${del.performance}\n\n`;
      });
    }

    // Evaluations
    if (conv.evaluations && conv.evaluations.length > 0) {
      markdown += '### Evaluations\n\n';
      conv.evaluations.forEach((evaluation: any, evalIndex: number) => {
        const time = new Date(evaluation.timestamp).toLocaleTimeString();
        markdown += `**${evalIndex + 1}. Verdict: ${evaluation.verdict}** (${time})\n\n`;

        if (evaluation.productScore) {
          markdown += `  - Product Discernment: ${evaluation.productScore}/10\n`;
        }
        if (evaluation.processScore) {
          markdown += `  - Process Discernment: ${evaluation.processScore}/10\n`;
        }
        if (evaluation.performanceScore) {
          markdown += `  - Performance Discernment: ${evaluation.performanceScore}/10\n`;
        }

        if (evaluation.refinementNeeded) {
          markdown += `\n**Refinement Needed:** ${evaluation.refinementNeeded}\n`;
        }
        markdown += '\n';
      });
    }

    // Tool Calls
    if (conv.toolCalls && conv.toolCalls.length > 0) {
      markdown += '### Tool Calls\n\n';
      markdown += `Total: ${conv.toolCalls.length}\n\n`;

      const toolCounts: Record<string, number> = {};
      conv.toolCalls.forEach((tc: any) => {
        toolCounts[tc.toolName] = (toolCounts[tc.toolName] || 0) + 1;
      });

      markdown += '| Tool | Count |\n';
      markdown += '|------|-------|\n';
      Object.entries(toolCounts).forEach(([tool, count]) => {
        markdown += `| ${tool} | ${count} |\n`;
      });
      markdown += '\n';
    }

    markdown += '---\n\n';
  });

  return markdown;
}

/**
 * Exports all conversations to specified format
 *
 * Retrieves all conversations from database, formats them according to
 * the specified format, and writes to a timestamped file.
 *
 * @param format - Export format ('json' or 'markdown')
 * @param dbPath - Optional database path (defaults to standard location)
 * @returns Export result with file path and statistics
 *
 * @example
 * ```typescript
 * // Export as JSON
 * const result = await exportConversations('json');
 * console.log(`Exported to: ${result.filePath}`);
 *
 * // Export as Markdown
 * const result = await exportConversations('markdown');
 * console.log(`${result.conversationCount} conversations exported`);
 * ```
 */
export async function exportConversations(
  format: ExportFormat,
  dbPath?: string
): Promise<ExportResult> {
  const result: ExportResult = {
    success: false,
    conversationCount: 0,
    totalMessages: 0
  };

  try {
    const db = dbPath || getDefaultDbPath();

    // Check if database exists
    if (!existsSync(db)) {
      result.error = `Database not found: ${db}`;
      console.error(result.error);
      return result;
    }

    console.log(`Retrieving conversations from database...`);
    const conversations = getAllConversations(db);

    if (conversations.length === 0) {
      result.error = 'No conversations found in database';
      console.warn(result.error);
      return result;
    }

    console.log(`Found ${conversations.length} conversations`);

    // Format data
    let content: string;
    let extension: string;

    if (format === 'json') {
      content = exportToJSON(conversations);
      extension = 'json';
    } else if (format === 'markdown') {
      content = exportToMarkdown(conversations);
      extension = 'md';
    } else {
      result.error = `Unsupported format: ${format}`;
      console.error(result.error);
      return result;
    }

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `maestro-export-${timestamp}.${extension}`;
    const exportDir = getExportDirectory();
    const filePath = join(exportDir, filename);

    // Write to file
    console.log(`Writing export to: ${filePath}`);
    writeFileSync(filePath, content, 'utf-8');

    // Calculate statistics
    const fileSize = Buffer.byteLength(content, 'utf-8');
    const totalMessages = conversations.reduce((sum, c) => sum + c.messageCount, 0);

    result.success = true;
    result.filePath = filePath;
    result.conversationCount = conversations.length;
    result.totalMessages = totalMessages;
    result.fileSize = fileSize;

    console.log(`✓ Export complete!`);
    console.log(`  Conversations: ${result.conversationCount}`);
    console.log(`  Messages: ${result.totalMessages}`);
    console.log(`  File size: ${(fileSize / 1024).toFixed(1)} KB`);
    console.log(`  Location: ${filePath}`);

    return result;

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    result.error = `Export failed: ${errorMsg}`;
    console.error(result.error, error);
    return result;
  }
}

/**
 * Deletes all conversations from database
 *
 * Permanently removes all stored conversation data including messages,
 * delegations, evaluations, and tool calls. Requires explicit confirmation.
 *
 * CAUTION: This operation is irreversible. Consider exporting data first.
 *
 * @param confirmation - Must be true to proceed (safety check)
 * @param dbPath - Optional database path (defaults to standard location)
 * @returns Deletion result with statistics
 *
 * @example
 * ```typescript
 * // WRONG - will not delete (safety check)
 * await deleteAllConversations(false);
 *
 * // CORRECT - explicit confirmation required
 * await deleteAllConversations(true);
 * ```
 */
export async function deleteAllConversations(
  confirmation: boolean,
  dbPath?: string
): Promise<DeletionResult> {
  const result: DeletionResult = {
    success: false,
    conversationsDeleted: 0,
    messagesDeleted: 0,
    delegationsDeleted: 0,
    evaluationsDeleted: 0,
    toolCallsDeleted: 0
  };

  // Safety check: require explicit confirmation
  if (confirmation !== true) {
    result.error = 'Deletion requires explicit confirmation (pass true as first argument)';
    console.error(result.error);
    return result;
  }

  try {
    const db = dbPath || getDefaultDbPath();

    // Check if database exists
    if (!existsSync(db)) {
      result.error = `Database not found: ${db}`;
      console.warn(result.error);
      // Not really an error if DB doesn't exist - nothing to delete
      result.success = true;
      return result;
    }

    const database = openDatabase(db);

    try {
      console.log('Counting records before deletion...');

      // Count records before deletion
      const countConvStmt = database.prepare('SELECT COUNT(*) as count FROM conversations');
      const countMsgStmt = database.prepare('SELECT COUNT(*) as count FROM messages');
      const countDelStmt = database.prepare('SELECT COUNT(*) as count FROM delegations');
      const countEvalStmt = database.prepare('SELECT COUNT(*) as count FROM evaluations');
      const countToolStmt = database.prepare('SELECT COUNT(*) as count FROM tool_calls');

      result.conversationsDeleted = (countConvStmt.get() as any).count;
      result.messagesDeleted = (countMsgStmt.get() as any).count;
      result.delegationsDeleted = (countDelStmt.get() as any).count;
      result.evaluationsDeleted = (countEvalStmt.get() as any).count;
      result.toolCallsDeleted = (countToolStmt.get() as any).count;

      if (result.conversationsDeleted === 0) {
        console.log('No conversations to delete.');
        result.success = true;
        return result;
      }

      console.log(`Deleting ${result.conversationsDeleted} conversations...`);

      // Begin transaction for atomicity
      database.exec('BEGIN TRANSACTION');

      try {
        // Delete all records (foreign keys will cascade)
        // Delete in reverse order of dependencies
        database.exec('DELETE FROM tool_calls');
        database.exec('DELETE FROM evaluations');
        database.exec('DELETE FROM delegations');
        database.exec('DELETE FROM messages');
        database.exec('DELETE FROM conversations');

        // Clear FTS5 virtual tables
        database.exec('DELETE FROM messages_fts');
        database.exec('DELETE FROM delegations_fts');

        // Commit transaction
        database.exec('COMMIT');

        console.log('Running VACUUM to reclaim space...');
        database.exec('VACUUM');

        result.success = true;

        console.log('✓ All conversations deleted successfully!');
        console.log(`  Conversations: ${result.conversationsDeleted}`);
        console.log(`  Messages: ${result.messagesDeleted}`);
        console.log(`  Delegations: ${result.delegationsDeleted}`);
        console.log(`  Evaluations: ${result.evaluationsDeleted}`);
        console.log(`  Tool Calls: ${result.toolCallsDeleted}`);

      } catch (error) {
        // Rollback on error
        database.exec('ROLLBACK');
        throw error;
      }

    } finally {
      closeDatabase(database);
    }

    return result;

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    result.error = `Deletion failed: ${errorMsg}`;
    console.error(result.error, error);
    return result;
  }
}
