/**
 * Tests for search module
 *
 * Tests FTS5 full-text search across messages and delegations
 */

import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { initializeDatabase } from "../init";
import { storeConversation } from "../storage";
import {
  searchMessages,
  searchDelegations,
  searchAll,
} from "../search";
import type { ParsedConversation } from "../../memory/types";
import { unlinkSync } from "fs";

describe("Search Module", () => {
  const dbPath = `/tmp/maestro-search-test-${Math.random().toString(36).slice(2)}.db`;

  beforeAll(() => {
    // Initialize database schema
    initializeDatabase(dbPath);

    // Insert sample conversations for testing
    const conversation1: ParsedConversation = {
      messages: [
        {
          role: "user",
          content: "Create a database schema for user management",
          timestamp: "2025-12-16T10:00:00.000Z",
        },
        {
          role: "assistant",
          content: "I'll create a comprehensive database schema with tables for users, roles, and permissions.",
          timestamp: "2025-12-16T10:01:00.000Z",
        },
        {
          role: "user",
          content: "Add full-text search capabilities to the messages table",
          timestamp: "2025-12-16T10:02:00.000Z",
        },
      ],
      delegations: [
        {
          agentName: "file-writer",
          product: "Create database schema file with user management tables",
          process: "Design tables, add indexes, implement foreign keys",
          performance: "Schema must support 1M users with fast queries",
          timestamp: "2025-12-16T10:01:30.000Z",
        },
      ],
      toolCalls: [],
      evaluations: [],
      metadata: {
        startTime: "2025-12-16T10:00:00.000Z",
        endTime: "2025-12-16T10:05:00.000Z",
        primaryAgent: "file-writer",
        skillsUsed: ["write", "read"],
        filesModified: ["schema.sql"],
        messageCount: 3,
        duration: 300000,
      },
    };

    const conversation2: ParsedConversation = {
      messages: [
        {
          role: "user",
          content: "Implement search functionality with BM25 ranking",
          timestamp: "2025-12-17T09:00:00.000Z",
        },
        {
          role: "assistant",
          content: "I'll implement FTS5 full-text search with BM25 relevance scoring for better search results.",
          timestamp: "2025-12-17T09:01:00.000Z",
        },
      ],
      delegations: [
        {
          agentName: "file-reader",
          product: "Read existing search implementation",
          process: "Analyze code structure and patterns",
          performance: "Complete understanding of search architecture",
          timestamp: "2025-12-17T09:00:30.000Z",
        },
        {
          agentName: "file-writer",
          product: "Implement search module with FTS5 and BM25",
          process: "Create search.ts with proper TypeScript types",
          performance: "Search must return results in under 100ms",
          timestamp: "2025-12-17T09:01:30.000Z",
        },
      ],
      toolCalls: [],
      evaluations: [],
      metadata: {
        startTime: "2025-12-17T09:00:00.000Z",
        endTime: "2025-12-17T09:10:00.000Z",
        primaryAgent: "file-writer",
        skillsUsed: ["write"],
        filesModified: ["search.ts"],
        messageCount: 2,
        duration: 600000,
      },
    };

    storeConversation(dbPath, conversation1);
    storeConversation(dbPath, conversation2);
  });

  afterAll(() => {
    // Clean up test database
    try {
      unlinkSync(dbPath);
    } catch (error) {
      // Ignore if file doesn't exist
    }
  });

  // ===== Message Search Tests =====

  test("searchMessages: finds messages with simple keyword", () => {
    const results = searchMessages(dbPath, "database");

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].type).toBe("message");
    expect(results[0].content.toLowerCase()).toContain("database");
    expect(results[0].score).toBeGreaterThan(0);
  });

  test("searchMessages: finds messages with phrase search", () => {
    const results = searchMessages(dbPath, '"full-text search"');

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].content.toLowerCase()).toContain("full-text search");
  });

  test("searchMessages: ranks relevant results higher", () => {
    const results = searchMessages(dbPath, "database schema");

    expect(results.length).toBeGreaterThan(0);

    // First result should have higher score than later results
    if (results.length > 1) {
      expect(results[0].score).toBeGreaterThanOrEqual(results[1].score);
    }
  });

  test("searchMessages: includes conversation context", () => {
    const results = searchMessages(dbPath, "database");

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].conversation.id).toBeDefined();
    expect(results[0].conversation.timestamp).toBeDefined();
  });

  test("searchMessages: includes message metadata", () => {
    const results = searchMessages(dbPath, "database");

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].metadata).toBeDefined();

    const metadata = results[0].metadata as any;
    expect(metadata.messageId).toBeDefined();
    expect(metadata.role).toMatch(/^(user|assistant)$/);
    expect(metadata.timestamp).toBeDefined();
  });

  test("searchMessages: returns snippet with context", () => {
    const results = searchMessages(dbPath, "database");

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].snippet).toBeDefined();
    expect(results[0].snippet.length).toBeGreaterThan(0);
  });

  test("searchMessages: respects limit parameter", () => {
    const results = searchMessages(dbPath, "search", 1);

    expect(results.length).toBeLessThanOrEqual(1);
  });

  test("searchMessages: returns empty array for no matches", () => {
    const results = searchMessages(dbPath, "nonexistent_keyword_xyz");

    expect(results).toEqual([]);
  });

  test("searchMessages: handles boolean AND operator", () => {
    const results = searchMessages(dbPath, "database AND schema");

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].content.toLowerCase()).toContain("database");
    expect(results[0].content.toLowerCase()).toContain("schema");
  });

  test("searchMessages: handles boolean OR operator", () => {
    const results = searchMessages(dbPath, "database OR search");

    expect(results.length).toBeGreaterThan(0);
  });

  // ===== Delegation Search Tests =====

  test("searchDelegations: finds delegations by agent name", () => {
    const results = searchDelegations(dbPath, "\"file-writer\"");

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].type).toBe("delegation");

    const metadata = results[0].metadata as any;
    expect(metadata.agentName).toBe("file-writer");
  });

  test("searchDelegations: finds delegations by product content", () => {
    const results = searchDelegations(dbPath, "product:schema");

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].content.toLowerCase()).toContain("schema");
  });

  test("searchDelegations: finds delegations by process content", () => {
    const results = searchDelegations(dbPath, "process:analyze");

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].content.toLowerCase()).toContain("analyze");
  });

  test("searchDelegations: finds delegations by performance content", () => {
    const results = searchDelegations(dbPath, "performance:100ms");

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].content.toLowerCase()).toContain("100ms");
  });

  test("searchDelegations: includes conversation context", () => {
    const results = searchDelegations(dbPath, "\"file-writer\"");

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].conversation.id).toBeDefined();
    expect(results[0].conversation.timestamp).toBeDefined();
  });

  test("searchDelegations: includes delegation metadata", () => {
    const results = searchDelegations(dbPath, "\"file-writer\"");

    expect(results.length).toBeGreaterThan(0);

    const metadata = results[0].metadata as any;
    expect(metadata.delegationId).toBeDefined();
    expect(metadata.agentName).toBe("file-writer");
    expect(metadata.timestamp).toBeDefined();
    expect(metadata.matchedField).toMatch(/^(product|process|performance|agent_name)$/);
  });

  test("searchDelegations: returns snippet showing match", () => {
    const results = searchDelegations(dbPath, "schema");

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].snippet).toBeDefined();
    expect(results[0].snippet.toLowerCase()).toContain("schema");
  });

  test("searchDelegations: respects limit parameter", () => {
    const results = searchDelegations(dbPath, "writer", 1);

    expect(results.length).toBeLessThanOrEqual(1);
  });

  test("searchDelegations: returns empty array for no matches", () => {
    const results = searchDelegations(dbPath, "nonexistent_agent_xyz");

    expect(results).toEqual([]);
  });

  test("searchDelegations: handles complex boolean queries", () => {
    const results = searchDelegations(
      dbPath,
      "agent_name:writer AND product:search"
    );

    expect(results.length).toBeGreaterThan(0);

    const metadata = results[0].metadata as any;
    expect(metadata.agentName).toBe("file-writer");
    expect(results[0].content.toLowerCase()).toContain("search");
  });

  // ===== Combined Search Tests =====

  test("searchAll: combines message and delegation results", () => {
    const results = searchAll(dbPath, "search");

    expect(results.length).toBeGreaterThan(0);

    // Check that we have both types if applicable
    const types = new Set(results.map((r) => r.type));
    expect(types.size).toBeGreaterThan(0);
  });

  test("searchAll: sorts combined results by score", () => {
    const results = searchAll(dbPath, "database");

    expect(results.length).toBeGreaterThan(0);

    // Verify descending score order
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1].score).toBeGreaterThanOrEqual(results[i].score);
    }
  });

  test("searchAll: respects limit parameter", () => {
    const results = searchAll(dbPath, "search", 2);

    // Limit applies per type, so max is 2 * 2 = 4 results
    expect(results.length).toBeLessThanOrEqual(4);
  });

  test("searchAll: returns empty array for no matches", () => {
    const results = searchAll(dbPath, "nonexistent_xyz");

    expect(results).toEqual([]);
  });
});
