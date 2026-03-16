/**
 * Full-Text Search Module for Maestro Memory System
 *
 * This module provides FTS5-powered full-text search across messages and delegations.
 * Uses BM25 ranking algorithm for relevance scoring.
 */

import { openDatabase, closeDatabase } from "./connection";

/**
 * Represents a search result with context and relevance score
 */
export interface SearchResult {
  /** Type of search result */
  type: "message" | "delegation";
  /** The matched content */
  content: string;
  /** BM25 relevance score (higher is more relevant) */
  score: number;
  /** Highlighted snippet showing match context */
  snippet: string;
  /** Conversation context */
  conversation: {
    id: string;
    timestamp: string;
    primaryAgent?: string;
  };
  /** Additional metadata based on type */
  metadata: MessageMetadata | DelegationMetadata;
}

/**
 * Metadata specific to message search results
 */
export interface MessageMetadata {
  messageId: string;
  role: string;
  timestamp: string;
}

/**
 * Metadata specific to delegation search results
 */
export interface DelegationMetadata {
  delegationId: string;
  agentName: string;
  timestamp: string;
  /** Which field matched: product, process, or performance */
  matchedField: "product" | "process" | "performance" | "agent_name";
}

/**
 * Searches for messages matching the query using FTS5 full-text search
 *
 * Uses BM25 ranking algorithm to score relevance. Higher scores indicate better matches.
 * Searches across all message content regardless of role (user or assistant).
 *
 * @param dbPath - Absolute path to the SQLite database file
 * @param query - Search query (supports FTS5 MATCH syntax: AND, OR, NOT, phrases)
 * @param limit - Maximum number of results to return (default: 20)
 * @returns Array of search results ordered by relevance (highest score first)
 *
 * @example
 * ```typescript
 * // Simple keyword search
 * const results = searchMessages("/path/to/maestro.db", "delegation");
 *
 * // Phrase search
 * const results = searchMessages("/path/to/maestro.db", '"file writer"');
 *
 * // Boolean search
 * const results = searchMessages("/path/to/maestro.db", "search AND database");
 * ```
 */
export function searchMessages(
  dbPath: string,
  query: string,
  limit: number = 20
): SearchResult[] {
  const db = openDatabase(dbPath);

  try {
    const stmt = db.prepare(`
      SELECT
        m.id AS message_id,
        m.role,
        m.content,
        m.timestamp AS message_timestamp,
        c.id AS conversation_id,
        c.timestamp AS conversation_timestamp,
        c.primary_agent,
        bm25(messages_fts) AS score,
        snippet(messages_fts, 1, '<mark>', '</mark>', '...', 64) AS snippet
      FROM messages_fts
      JOIN messages m ON messages_fts.message_id = m.id
      JOIN conversations c ON m.conversation_id = c.id
      WHERE messages_fts MATCH ?
      ORDER BY score ASC
      LIMIT ?
    `);

    const rows = stmt.all(query, limit) as any[];

    return rows.map((row) => ({
      type: "message" as const,
      content: row.content,
      score: Math.abs(row.score), // BM25 returns negative scores, convert to positive
      snippet: row.snippet,
      conversation: {
        id: row.conversation_id,
        timestamp: row.conversation_timestamp,
        primaryAgent: row.primary_agent,
      },
      metadata: {
        messageId: row.message_id,
        role: row.role,
        timestamp: row.message_timestamp,
      } as MessageMetadata,
    }));
  } catch (error) {
    console.error("Failed to search messages:", error);
    throw error;
  } finally {
    closeDatabase(db);
  }
}

/**
 * Searches for delegations matching the query using FTS5 full-text search
 *
 * Searches across agent_name, product, process, and performance fields.
 * Uses BM25 ranking for relevance scoring.
 *
 * @param dbPath - Absolute path to the SQLite database file
 * @param query - Search query (supports FTS5 MATCH syntax and field-specific searches)
 * @param limit - Maximum number of results to return (default: 20)
 * @returns Array of search results ordered by relevance (highest score first)
 *
 * @example
 * ```typescript
 * // Search all delegation fields
 * const results = searchDelegations("/path/to/maestro.db", "file-writer");
 *
 * // Search specific field
 * const results = searchDelegations("/path/to/maestro.db", "product:schema");
 *
 * // Complex query
 * const results = searchDelegations("/path/to/maestro.db",
 *   "agent_name:file-writer AND product:database");
 * ```
 */
export function searchDelegations(
  dbPath: string,
  query: string,
  limit: number = 20
): SearchResult[] {
  const db = openDatabase(dbPath);

  try {
    const stmt = db.prepare(`
      SELECT
        d.id AS delegation_id,
        d.agent_name,
        d.product,
        d.process,
        d.performance,
        d.timestamp AS delegation_timestamp,
        c.id AS conversation_id,
        c.timestamp AS conversation_timestamp,
        c.primary_agent,
        bm25(delegations_fts) AS score,
        snippet(delegations_fts, 2, '<mark>', '</mark>', '...', 64) AS product_snippet,
        snippet(delegations_fts, 3, '<mark>', '</mark>', '...', 64) AS process_snippet,
        snippet(delegations_fts, 4, '<mark>', '</mark>', '...', 64) AS performance_snippet
      FROM delegations_fts
      JOIN delegations d ON delegations_fts.delegation_id = d.id
      JOIN conversations c ON d.conversation_id = c.id
      WHERE delegations_fts MATCH ?
      ORDER BY score ASC
      LIMIT ?
    `);

    const rows = stmt.all(query, limit) as any[];

    return rows.map((row) => {
      // Determine which field had the best match for snippet
      const snippets = [
        { field: "product" as const, text: row.product_snippet },
        { field: "process" as const, text: row.process_snippet },
        { field: "performance" as const, text: row.performance_snippet },
      ];

      // Find snippet with <mark> tags (indicates match)
      const matchedSnippet = snippets.find((s) => s.text.includes("<mark>")) || snippets[0];

      // Combine all 3P sections for content
      const content = `PRODUCT: ${row.product}\n\nPROCESS: ${row.process}\n\nPERFORMANCE: ${row.performance}`;

      return {
        type: "delegation" as const,
        content,
        score: Math.abs(row.score),
        snippet: matchedSnippet.text,
        conversation: {
          id: row.conversation_id,
          timestamp: row.conversation_timestamp,
          primaryAgent: row.primary_agent,
        },
        metadata: {
          delegationId: row.delegation_id,
          agentName: row.agent_name,
          timestamp: row.delegation_timestamp,
          matchedField: matchedSnippet.field,
        } as DelegationMetadata,
      };
    });
  } catch (error) {
    console.error("Failed to search delegations:", error);
    throw error;
  } finally {
    closeDatabase(db);
  }
}

/**
 * Searches across both messages and delegations, returning combined results
 *
 * Useful for broad searches where you want to find mentions across all conversation content.
 * Results are sorted by relevance score across both types.
 *
 * @param dbPath - Absolute path to the SQLite database file
 * @param query - Search query (supports FTS5 MATCH syntax)
 * @param limit - Maximum number of results per type (default: 10 each, 20 total max)
 * @returns Combined array of search results ordered by relevance
 *
 * @example
 * ```typescript
 * const results = searchAll("/path/to/maestro.db", "database schema");
 * // Returns messages AND delegations mentioning "database schema"
 * ```
 */
export function searchAll(
  dbPath: string,
  query: string,
  limit: number = 10
): SearchResult[] {
  // Search both types
  const messageResults = searchMessages(dbPath, query, limit);
  const delegationResults = searchDelegations(dbPath, query, limit);

  // Combine and sort by score (higher is more relevant)
  const combined = [...messageResults, ...delegationResults];
  combined.sort((a, b) => b.score - a.score);

  // Return top results up to limit * 2
  return combined.slice(0, limit * 2);
}
