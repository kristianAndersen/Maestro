/**
 * Database Storage Module for Maestro Memory System
 *
 * This module handles storing parsed conversations into the SQLite database.
 * It uses transactions for atomicity and batch inserts for performance.
 */

import { openDatabase, closeDatabase } from "./connection";
import type {
  ParsedConversation,
  ConversationMessage,
  AgentDelegation,
  EvaluationResult,
  ToolCall,
} from "../memory/types";

/**
 * Stores a parsed conversation into the database
 *
 * This function stores all conversation data in a single atomic transaction:
 * - Conversation metadata
 * - All messages
 * - All delegations
 * - All evaluations
 * - All tool calls
 *
 * If any part fails, the entire transaction is rolled back.
 *
 * @param dbPath - Absolute path to the SQLite database file
 * @param parsed - Parsed conversation data from parser
 * @returns The generated conversation ID (UUID)
 * @throws Error if storage fails (transaction will be rolled back)
 *
 * @example
 * ```typescript
 * const parsed = parseConversation(sessionData);
 * const conversationId = storeConversation("/path/to/maestro.db", parsed);
 * console.log(`Stored conversation: ${conversationId}`);
 * ```
 */
export function storeConversation(
  dbPath: string,
  parsed: ParsedConversation
): string {
  const db = openDatabase(dbPath);
  const conversationId = crypto.randomUUID();

  try {
    // Use transaction for atomicity (all-or-nothing)
    const transaction = db.transaction(() => {
      // 1. Insert conversation metadata
      insertConversation(db, conversationId, parsed);

      // 2. Batch insert messages and get their IDs
      const messageIds = insertMessages(db, conversationId, parsed.messages);

      // Use first message ID as a fallback for foreign key relationships
      // In real implementation, we'd parse which message contained the delegation/evaluation/tool call
      const fallbackMessageId = messageIds.length > 0 ? messageIds[0] : crypto.randomUUID();

      // 3. Batch insert delegations
      insertDelegations(db, conversationId, fallbackMessageId, parsed.delegations);

      // 4. Batch insert evaluations
      insertEvaluations(db, conversationId, fallbackMessageId, parsed.evaluations);

      // 5. Batch insert tool calls
      insertToolCalls(db, conversationId, fallbackMessageId, parsed.toolCalls);
    });

    // Execute transaction
    transaction();

    return conversationId;
  } catch (error) {
    console.error("Failed to store conversation:", error);
    throw error;
  } finally {
    closeDatabase(db);
  }
}

/**
 * Inserts conversation metadata into conversations table
 */
function insertConversation(
  db: any,
  conversationId: string,
  parsed: ParsedConversation
): void {
  const stmt = db.prepare(`
    INSERT INTO conversations (
      id,
      timestamp,
      duration_ms,
      message_count,
      primary_agent,
      skills_used,
      files_modified
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    conversationId,
    parsed.metadata.startTime,
    parsed.metadata.duration,
    parsed.metadata.messageCount,
    parsed.metadata.primaryAgent || null,
    JSON.stringify(parsed.metadata.skillsUsed),
    JSON.stringify(parsed.metadata.filesModified)
  );
}

/**
 * Batch inserts messages into messages table
 * Returns array of generated message IDs
 */
function insertMessages(
  db: any,
  conversationId: string,
  messages: ConversationMessage[]
): string[] {
  const messageIds: string[] = [];

  if (messages.length === 0) return messageIds;

  const stmt = db.prepare(`
    INSERT INTO messages (
      id,
      conversation_id,
      role,
      content,
      timestamp,
      metadata
    ) VALUES (?, ?, ?, ?, ?, ?)
  `);

  for (const message of messages) {
    const messageId = crypto.randomUUID();
    messageIds.push(messageId);

    stmt.run(
      messageId,
      conversationId,
      message.role,
      message.content,
      message.timestamp,
      message.metadata ? JSON.stringify(message.metadata) : null
    );
  }

  return messageIds;
}

/**
 * Batch inserts delegations into delegations table
 */
function insertDelegations(
  db: any,
  conversationId: string,
  messageId: string,
  delegations: AgentDelegation[]
): void {
  if (delegations.length === 0) return;

  const stmt = db.prepare(`
    INSERT INTO delegations (
      id,
      conversation_id,
      message_id,
      agent_name,
      product,
      process,
      performance,
      timestamp
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const delegation of delegations) {
    const delegationId = crypto.randomUUID();

    stmt.run(
      delegationId,
      conversationId,
      messageId,
      delegation.agentName,
      delegation.product,
      delegation.process,
      delegation.performance,
      delegation.timestamp
    );
  }
}

/**
 * Batch inserts evaluations into evaluations table
 */
function insertEvaluations(
  db: any,
  conversationId: string,
  messageId: string,
  evaluations: EvaluationResult[]
): void {
  if (evaluations.length === 0) return;

  const stmt = db.prepare(`
    INSERT INTO evaluations (
      id,
      conversation_id,
      message_id,
      verdict,
      product_score,
      process_score,
      performance_score,
      refinement_needed,
      timestamp
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const evaluation of evaluations) {
    const evaluationId = crypto.randomUUID();

    // Extract scores from dimensions (default to null if not provided)
    const productScore = extractScore(evaluation.dimensions.productDiscernment);
    const processScore = extractScore(evaluation.dimensions.processDiscernment);
    const performanceScore = extractScore(
      evaluation.dimensions.performanceDiscernment
    );

    stmt.run(
      evaluationId,
      conversationId,
      messageId,
      evaluation.verdict,
      productScore,
      processScore,
      performanceScore,
      evaluation.refinementNeeded || null,
      evaluation.timestamp
    );
  }
}

/**
 * Batch inserts tool calls into tool_calls table
 */
function insertToolCalls(
  db: any,
  conversationId: string,
  messageId: string,
  toolCalls: ToolCall[]
): void {
  if (toolCalls.length === 0) return;

  const stmt = db.prepare(`
    INSERT INTO tool_calls (
      id,
      conversation_id,
      message_id,
      tool_name,
      parameters,
      result,
      success,
      timestamp
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const toolCall of toolCalls) {
    const toolCallId = crypto.randomUUID();

    stmt.run(
      toolCallId,
      conversationId,
      messageId,
      toolCall.toolName,
      JSON.stringify(toolCall.parameters),
      JSON.stringify(toolCall.result),
      toolCall.success ? 1 : 0,
      toolCall.timestamp
    );
  }
}

/**
 * Extracts numeric score from dimension text (e.g., "8/10" -> 8)
 * Returns null if score cannot be parsed
 */
function extractScore(dimensionText: string | undefined): number | null {
  if (!dimensionText) return null;

  // Match patterns like "8/10", "8 / 10", "Score: 8"
  const match = dimensionText.match(/(\d+)\s*\/\s*10|Score:\s*(\d+)/i);
  if (match) {
    const score = parseInt(match[1] || match[2], 10);
    return score >= 1 && score <= 10 ? score : null;
  }

  return null;
}
