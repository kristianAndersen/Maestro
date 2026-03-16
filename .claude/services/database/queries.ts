/**
 * Metadata Query Module for Maestro Memory System
 *
 * This module provides functions for querying conversations by metadata filters
 * such as agent, date range, skill, and other attributes.
 */

import { openDatabase, closeDatabase } from "./connection";

/**
 * Summary information about a conversation
 */
export interface ConversationSummary {
  /** Conversation ID (UUID) */
  id: string;
  /** ISO 8601 timestamp when conversation started */
  timestamp: string;
  /** Duration in milliseconds */
  durationMs: number | null;
  /** Total number of messages in conversation */
  messageCount: number;
  /** Primary agent used (e.g., 'maestro', 'file-writer') */
  primaryAgent: string | null;
  /** Array of skill names used during conversation */
  skillsUsed: string[];
  /** Array of file paths modified during conversation */
  filesModified: string[];
  /** Number of evaluations performed */
  evaluationCount: number;
  /** Number of EXCELLENT verdicts */
  excellentCount: number;
  /** Number of NEEDS_REFINEMENT verdicts */
  refinementCount: number;
}

/**
 * Gets conversations where a specific agent was the primary agent
 *
 * Useful for analyzing agent performance and finding previous work by specific agents.
 *
 * @param dbPath - Absolute path to the SQLite database file
 * @param agentName - Name of the agent to filter by (e.g., 'file-writer', 'maestro')
 * @returns Array of conversation summaries ordered by timestamp (newest first)
 *
 * @example
 * ```typescript
 * const conversations = getConversationsByAgent("/path/to/maestro.db", "file-writer");
 * console.log(`Found ${conversations.length} conversations with file-writer agent`);
 * ```
 */
export function getConversationsByAgent(
  dbPath: string,
  agentName: string
): ConversationSummary[] {
  const db = openDatabase(dbPath);

  try {
    const stmt = db.prepare(`
      SELECT
        c.id,
        c.timestamp,
        c.duration_ms,
        c.message_count,
        c.primary_agent,
        c.skills_used,
        c.files_modified,
        COUNT(DISTINCT e.id) AS evaluation_count,
        SUM(CASE WHEN e.verdict = 'EXCELLENT' THEN 1 ELSE 0 END) AS excellent_count,
        SUM(CASE WHEN e.verdict = 'NEEDS_REFINEMENT' THEN 1 ELSE 0 END) AS refinement_count
      FROM conversations c
      LEFT JOIN evaluations e ON c.id = e.conversation_id
      WHERE c.primary_agent = ?
      GROUP BY c.id
      ORDER BY c.timestamp DESC
    `);

    const rows = stmt.all(agentName) as any[];
    return rows.map(rowToSummary);
  } catch (error) {
    console.error("Failed to get conversations by agent:", error);
    throw error;
  } finally {
    closeDatabase(db);
  }
}

/**
 * Gets conversations within a specific date range
 *
 * @param dbPath - Absolute path to the SQLite database file
 * @param startDate - Start of date range (ISO 8601 format: YYYY-MM-DD or full timestamp)
 * @param endDate - End of date range (ISO 8601 format: YYYY-MM-DD or full timestamp)
 * @returns Array of conversation summaries ordered by timestamp (newest first)
 *
 * @example
 * ```typescript
 * // Get conversations from December 2025
 * const conversations = getConversationsByDateRange(
 *   "/path/to/maestro.db",
 *   "2025-12-01",
 *   "2025-12-31"
 * );
 * ```
 */
export function getConversationsByDateRange(
  dbPath: string,
  startDate: string,
  endDate: string
): ConversationSummary[] {
  const db = openDatabase(dbPath);

  try {
    const stmt = db.prepare(`
      SELECT
        c.id,
        c.timestamp,
        c.duration_ms,
        c.message_count,
        c.primary_agent,
        c.skills_used,
        c.files_modified,
        COUNT(DISTINCT e.id) AS evaluation_count,
        SUM(CASE WHEN e.verdict = 'EXCELLENT' THEN 1 ELSE 0 END) AS excellent_count,
        SUM(CASE WHEN e.verdict = 'NEEDS_REFINEMENT' THEN 1 ELSE 0 END) AS refinement_count
      FROM conversations c
      LEFT JOIN evaluations e ON c.id = e.conversation_id
      WHERE c.timestamp >= ? AND c.timestamp <= ?
      GROUP BY c.id
      ORDER BY c.timestamp DESC
    `);

    const rows = stmt.all(startDate, endDate) as any[];
    return rows.map(rowToSummary);
  } catch (error) {
    console.error("Failed to get conversations by date range:", error);
    throw error;
  } finally {
    closeDatabase(db);
  }
}

/**
 * Gets conversations where a specific skill was used
 *
 * Searches the skills_used JSON array for the specified skill name.
 *
 * @param dbPath - Absolute path to the SQLite database file
 * @param skillName - Name of the skill to search for (e.g., 'write', 'read')
 * @returns Array of conversation summaries ordered by timestamp (newest first)
 *
 * @example
 * ```typescript
 * const conversations = getConversationsBySkill("/path/to/maestro.db", "write");
 * console.log(`Found ${conversations.length} conversations using 'write' skill`);
 * ```
 */
export function getConversationsBySkill(
  dbPath: string,
  skillName: string
): ConversationSummary[] {
  const db = openDatabase(dbPath);

  try {
    // Use LIKE with JSON array search pattern
    // skills_used is stored as JSON array: ["skill1", "skill2"]
    const searchPattern = `%"${skillName}"%`;

    const stmt = db.prepare(`
      SELECT
        c.id,
        c.timestamp,
        c.duration_ms,
        c.message_count,
        c.primary_agent,
        c.skills_used,
        c.files_modified,
        COUNT(DISTINCT e.id) AS evaluation_count,
        SUM(CASE WHEN e.verdict = 'EXCELLENT' THEN 1 ELSE 0 END) AS excellent_count,
        SUM(CASE WHEN e.verdict = 'NEEDS_REFINEMENT' THEN 1 ELSE 0 END) AS refinement_count
      FROM conversations c
      LEFT JOIN evaluations e ON c.id = e.conversation_id
      WHERE c.skills_used LIKE ?
      GROUP BY c.id
      ORDER BY c.timestamp DESC
    `);

    const rows = stmt.all(searchPattern) as any[];
    return rows.map(rowToSummary);
  } catch (error) {
    console.error("Failed to get conversations by skill:", error);
    throw error;
  } finally {
    closeDatabase(db);
  }
}

/**
 * Gets the most recent conversations
 *
 * Uses the recent_conversations view which includes evaluation statistics.
 *
 * @param dbPath - Absolute path to the SQLite database file
 * @param limit - Maximum number of conversations to return (default: 20)
 * @returns Array of conversation summaries ordered by timestamp (newest first)
 *
 * @example
 * ```typescript
 * const recent = getRecentConversations("/path/to/maestro.db", 10);
 * console.log(`Latest 10 conversations:`);
 * recent.forEach(c => console.log(`- ${c.timestamp} (${c.primaryAgent})`));
 * ```
 */
export function getRecentConversations(
  dbPath: string,
  limit: number = 20
): ConversationSummary[] {
  const db = openDatabase(dbPath);

  try {
    const stmt = db.prepare(`
      SELECT
        id,
        timestamp,
        duration_ms,
        message_count,
        primary_agent,
        skills_used,
        files_modified,
        evaluation_count,
        excellent_count,
        refinement_count
      FROM recent_conversations
      LIMIT ?
    `);

    const rows = stmt.all(limit) as any[];
    return rows.map(rowToSummary);
  } catch (error) {
    console.error("Failed to get recent conversations:", error);
    throw error;
  } finally {
    closeDatabase(db);
  }
}

/**
 * Gets conversations where specific files were modified
 *
 * Searches the files_modified JSON array for the specified file path.
 * Supports partial path matching (e.g., searching for "database" will match ".claude/services/database/schema.ts").
 *
 * @param dbPath - Absolute path to the SQLite database file
 * @param filePath - File path or partial path to search for
 * @returns Array of conversation summaries ordered by timestamp (newest first)
 *
 * @example
 * ```typescript
 * // Find conversations that modified database files
 * const conversations = getConversationsByFile("/path/to/maestro.db", "database");
 * ```
 */
export function getConversationsByFile(
  dbPath: string,
  filePath: string
): ConversationSummary[] {
  const db = openDatabase(dbPath);

  try {
    // Use LIKE with JSON array search pattern
    const searchPattern = `%"${filePath}%`;

    const stmt = db.prepare(`
      SELECT
        c.id,
        c.timestamp,
        c.duration_ms,
        c.message_count,
        c.primary_agent,
        c.skills_used,
        c.files_modified,
        COUNT(DISTINCT e.id) AS evaluation_count,
        SUM(CASE WHEN e.verdict = 'EXCELLENT' THEN 1 ELSE 0 END) AS excellent_count,
        SUM(CASE WHEN e.verdict = 'NEEDS_REFINEMENT' THEN 1 ELSE 0 END) AS refinement_count
      FROM conversations c
      LEFT JOIN evaluations e ON c.id = e.conversation_id
      WHERE c.files_modified LIKE ?
      GROUP BY c.id
      ORDER BY c.timestamp DESC
    `);

    const rows = stmt.all(searchPattern) as any[];
    return rows.map(rowToSummary);
  } catch (error) {
    console.error("Failed to get conversations by file:", error);
    throw error;
  } finally {
    closeDatabase(db);
  }
}

/**
 * Gets statistics about conversation activity by date
 *
 * Aggregates conversation counts and metrics by day.
 *
 * @param dbPath - Absolute path to the SQLite database file
 * @param startDate - Start of date range (ISO 8601: YYYY-MM-DD)
 * @param endDate - End of date range (ISO 8601: YYYY-MM-DD)
 * @returns Array of daily statistics ordered by date (newest first)
 *
 * @example
 * ```typescript
 * const stats = getConversationStatsByDate(
 *   "/path/to/maestro.db",
 *   "2025-12-01",
 *   "2025-12-31"
 * );
 * stats.forEach(day => {
 *   console.log(`${day.date}: ${day.conversationCount} conversations`);
 * });
 * ```
 */
export function getConversationStatsByDate(
  dbPath: string,
  startDate: string,
  endDate: string
): Array<{
  date: string;
  conversationCount: number;
  totalMessages: number;
  avgDurationMs: number | null;
}> {
  const db = openDatabase(dbPath);

  try {
    const stmt = db.prepare(`
      SELECT
        DATE(timestamp) AS date,
        COUNT(*) AS conversation_count,
        SUM(message_count) AS total_messages,
        AVG(duration_ms) AS avg_duration_ms
      FROM conversations
      WHERE DATE(timestamp) >= ? AND DATE(timestamp) <= ?
      GROUP BY DATE(timestamp)
      ORDER BY date DESC
    `);

    const rows = stmt.all(startDate, endDate) as any[];
    return rows.map((row) => ({
      date: row.date,
      conversationCount: row.conversation_count,
      totalMessages: row.total_messages,
      avgDurationMs: row.avg_duration_ms,
    }));
  } catch (error) {
    console.error("Failed to get conversation stats by date:", error);
    throw error;
  } finally {
    closeDatabase(db);
  }
}

/**
 * Helper function to convert database row to ConversationSummary
 */
function rowToSummary(row: any): ConversationSummary {
  return {
    id: row.id,
    timestamp: row.timestamp,
    durationMs: row.duration_ms,
    messageCount: row.message_count,
    primaryAgent: row.primary_agent,
    skillsUsed: row.skills_used ? JSON.parse(row.skills_used) : [],
    filesModified: row.files_modified ? JSON.parse(row.files_modified) : [],
    evaluationCount: row.evaluation_count || 0,
    excellentCount: row.excellent_count || 0,
    refinementCount: row.refinement_count || 0,
  };
}
