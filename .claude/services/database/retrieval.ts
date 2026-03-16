/**
 * Conversation Retrieval Module for Maestro Memory System
 *
 * This module handles retrieving complete conversations from the database
 * and reconstructing them into the ParsedConversation format.
 */

import { openDatabase, closeDatabase } from "./connection";
import type {
  ParsedConversation,
  ConversationMessage,
  AgentDelegation,
  EvaluationResult,
  ToolCall,
  ConversationMetadata,
} from "../memory/types";

/**
 * Retrieves a complete conversation by ID
 *
 * Reconstructs the full ParsedConversation object including:
 * - All messages in chronological order
 * - All delegations
 * - All evaluations
 * - All tool calls
 * - Conversation metadata
 *
 * @param dbPath - Absolute path to the SQLite database file
 * @param id - Conversation ID (UUID)
 * @returns ParsedConversation object or null if not found
 *
 * @example
 * ```typescript
 * const conversation = getConversationById(
 *   "/path/to/maestro.db",
 *   "550e8400-e29b-41d4-a716-446655440000"
 * );
 *
 * if (conversation) {
 *   console.log(`Retrieved conversation with ${conversation.messages.length} messages`);
 * }
 * ```
 */
export function getConversationById(
  dbPath: string,
  id: string
): ParsedConversation | null {
  const db = openDatabase(dbPath);

  try {
    // 1. Get conversation metadata
    const conversationStmt = db.prepare(`
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
      WHERE id = ?
    `);

    const conversationRow = conversationStmt.get(id) as any;
    if (!conversationRow) {
      return null; // Conversation not found
    }

    // 2. Get all messages (ordered by timestamp)
    const messagesStmt = db.prepare(`
      SELECT
        id,
        role,
        content,
        timestamp,
        metadata
      FROM messages
      WHERE conversation_id = ?
      ORDER BY timestamp ASC
    `);

    const messageRows = messagesStmt.all(id) as any[];
    const messages: ConversationMessage[] = messageRows.map((row) => ({
      role: row.role,
      content: row.content,
      timestamp: row.timestamp,
      metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
    }));

    // 3. Get all delegations (ordered by timestamp)
    const delegationsStmt = db.prepare(`
      SELECT
        id,
        agent_name,
        product,
        process,
        performance,
        timestamp
      FROM delegations
      WHERE conversation_id = ?
      ORDER BY timestamp ASC
    `);

    const delegationRows = delegationsStmt.all(id) as any[];
    const delegations: AgentDelegation[] = delegationRows.map((row) => ({
      agentName: row.agent_name,
      product: row.product,
      process: row.process,
      performance: row.performance,
      timestamp: row.timestamp,
    }));

    // 4. Get all evaluations (ordered by timestamp)
    const evaluationsStmt = db.prepare(`
      SELECT
        id,
        verdict,
        product_score,
        process_score,
        performance_score,
        refinement_needed,
        timestamp
      FROM evaluations
      WHERE conversation_id = ?
      ORDER BY timestamp ASC
    `);

    const evaluationRows = evaluationsStmt.all(id) as any[];
    const evaluations: EvaluationResult[] = evaluationRows.map((row) => ({
      verdict: row.verdict as "EXCELLENT" | "NEEDS REFINEMENT",
      dimensions: {
        productDiscernment: row.product_score
          ? `${row.product_score}/10`
          : undefined,
        processDiscernment: row.process_score
          ? `${row.process_score}/10`
          : undefined,
        performanceDiscernment: row.performance_score
          ? `${row.performance_score}/10`
          : undefined,
      },
      refinementNeeded: row.refinement_needed || undefined,
      timestamp: row.timestamp,
    }));

    // 5. Get all tool calls (ordered by timestamp)
    const toolCallsStmt = db.prepare(`
      SELECT
        id,
        tool_name,
        parameters,
        result,
        success,
        timestamp
      FROM tool_calls
      WHERE conversation_id = ?
      ORDER BY timestamp ASC
    `);

    const toolCallRows = toolCallsStmt.all(id) as any[];
    const toolCalls: ToolCall[] = toolCallRows.map((row) => ({
      toolName: row.tool_name,
      parameters: JSON.parse(row.parameters),
      result: JSON.parse(row.result),
      timestamp: row.timestamp,
      success: row.success === 1,
    }));

    // 6. Reconstruct metadata
    const skillsUsed = conversationRow.skills_used
      ? JSON.parse(conversationRow.skills_used)
      : [];
    const filesModified = conversationRow.files_modified
      ? JSON.parse(conversationRow.files_modified)
      : [];

    // Calculate end time from duration (if available)
    let endTime = conversationRow.timestamp;
    if (conversationRow.duration_ms) {
      const startTimestamp = new Date(conversationRow.timestamp).getTime();
      endTime = new Date(
        startTimestamp + conversationRow.duration_ms
      ).toISOString();
    }

    const metadata: ConversationMetadata = {
      startTime: conversationRow.timestamp,
      endTime,
      primaryAgent: conversationRow.primary_agent || undefined,
      skillsUsed,
      filesModified,
      messageCount: conversationRow.message_count,
      duration: conversationRow.duration_ms || 0,
    };

    // 7. Return reconstructed ParsedConversation
    return {
      messages,
      delegations,
      toolCalls,
      evaluations,
      metadata,
    };
  } catch (error) {
    console.error("Failed to retrieve conversation:", error);
    throw error;
  } finally {
    closeDatabase(db);
  }
}

/**
 * Retrieves multiple conversations by IDs
 *
 * More efficient than calling getConversationById multiple times.
 *
 * @param dbPath - Absolute path to the SQLite database file
 * @param ids - Array of conversation IDs (UUIDs)
 * @returns Array of ParsedConversation objects (skips IDs not found)
 *
 * @example
 * ```typescript
 * const conversations = getConversationsByIds(
 *   "/path/to/maestro.db",
 *   ["id1", "id2", "id3"]
 * );
 * console.log(`Retrieved ${conversations.length} conversations`);
 * ```
 */
export function getConversationsByIds(
  dbPath: string,
  ids: string[]
): ParsedConversation[] {
  const conversations: ParsedConversation[] = [];

  for (const id of ids) {
    const conversation = getConversationById(dbPath, id);
    if (conversation) {
      conversations.push(conversation);
    }
  }

  return conversations;
}

/**
 * Checks if a conversation exists in the database
 *
 * Lightweight check without retrieving full conversation data.
 *
 * @param dbPath - Absolute path to the SQLite database file
 * @param id - Conversation ID (UUID)
 * @returns True if conversation exists, false otherwise
 *
 * @example
 * ```typescript
 * if (conversationExists("/path/to/maestro.db", conversationId)) {
 *   console.log("Conversation found!");
 * }
 * ```
 */
export function conversationExists(dbPath: string, id: string): boolean {
  const db = openDatabase(dbPath);

  try {
    const stmt = db.prepare(`
      SELECT 1 FROM conversations WHERE id = ? LIMIT 1
    `);

    const result = stmt.get(id);
    return result !== undefined && result !== null;
  } catch (error) {
    console.error("Failed to check conversation existence:", error);
    throw error;
  } finally {
    closeDatabase(db);
  }
}

/**
 * Gets message count for a conversation
 *
 * Lightweight way to check conversation size before retrieval.
 *
 * @param dbPath - Absolute path to the SQLite database file
 * @param id - Conversation ID (UUID)
 * @returns Message count or null if conversation not found
 *
 * @example
 * ```typescript
 * const count = getMessageCount("/path/to/maestro.db", conversationId);
 * if (count && count > 100) {
 *   console.log("Large conversation detected!");
 * }
 * ```
 */
export function getMessageCount(dbPath: string, id: string): number | null {
  const db = openDatabase(dbPath);

  try {
    const stmt = db.prepare(`
      SELECT message_count FROM conversations WHERE id = ?
    `);

    const result = stmt.get(id) as any;
    return result ? result.message_count : null;
  } catch (error) {
    console.error("Failed to get message count:", error);
    throw error;
  } finally {
    closeDatabase(db);
  }
}
