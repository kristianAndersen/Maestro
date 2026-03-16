/**
 * Tests for queries module
 *
 * Tests metadata filtering and conversation queries
 */

import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { unlinkSync } from "fs";
import { initializeDatabase } from "../init";
import { storeConversation } from "../storage";
import {
  getConversationsByAgent,
  getConversationsByDateRange,
  getConversationsBySkill,
  getRecentConversations,
  getConversationsByFile,
  getConversationStatsByDate,
} from "../queries";
import type { ParsedConversation } from "../../memory/types";

const dbPath = `/tmp/maestro-queries-test-${Math.random().toString(36).slice(2)}.db`;

describe("Queries Module", () => {
  

  beforeAll(() => {
    // Initialize database schema
    initializeDatabase(dbPath);

    // Insert sample conversations with various attributes
    const conversation1: ParsedConversation = {
      messages: [
        {
          role: "user",
          content: "Create database schema",
          timestamp: "2025-12-15T10:00:00.000Z",
        },
        {
          role: "assistant",
          content: "Creating schema...",
          timestamp: "2025-12-15T10:01:00.000Z",
        },
      ],
      delegations: [],
      toolCalls: [],
      evaluations: [
        {
          verdict: "EXCELLENT",
          dimensions: {
            productDiscernment: "9/10",
            processDiscernment: "8/10",
            performanceDiscernment: "9/10",
          },
          timestamp: "2025-12-15T10:02:00.000Z",
        },
      ],
      metadata: {
        startTime: "2025-12-15T10:00:00.000Z",
        endTime: "2025-12-15T10:05:00.000Z",
        primaryAgent: "file-writer",
        skillsUsed: ["write", "read"],
        filesModified: ["schema.sql", "database/init.ts"],
        messageCount: 2,
        duration: 300000,
      },
    };

    const conversation2: ParsedConversation = {
      messages: [
        {
          role: "user",
          content: "Implement search",
          timestamp: "2025-12-16T09:00:00.000Z",
        },
        {
          role: "assistant",
          content: "Implementing search...",
          timestamp: "2025-12-16T09:01:00.000Z",
        },
      ],
      delegations: [],
      toolCalls: [],
      evaluations: [
        {
          verdict: "NEEDS_REFINEMENT",
          dimensions: {
            productDiscernment: "6/10",
            processDiscernment: "7/10",
            performanceDiscernment: "6/10",
          },
          refinementNeeded: "Add more test coverage",
          timestamp: "2025-12-16T09:02:00.000Z",
        },
      ],
      metadata: {
        startTime: "2025-12-16T09:00:00.000Z",
        endTime: "2025-12-16T09:10:00.000Z",
        primaryAgent: "file-writer",
        skillsUsed: ["write"],
        filesModified: ["search.ts"],
        messageCount: 2,
        duration: 600000,
      },
    };

    const conversation3: ParsedConversation = {
      messages: [
        {
          role: "user",
          content: "Read configuration file",
          timestamp: "2025-12-17T08:00:00.000Z",
        },
        {
          role: "assistant",
          content: "Reading config...",
          timestamp: "2025-12-17T08:01:00.000Z",
        },
      ],
      delegations: [],
      toolCalls: [],
      evaluations: [],
      metadata: {
        startTime: "2025-12-17T08:00:00.000Z",
        endTime: "2025-12-17T08:02:00.000Z",
        primaryAgent: "file-reader",
        skillsUsed: ["read"],
        filesModified: [],
        messageCount: 2,
        duration: 120000,
      },
    };

    const conversation4: ParsedConversation = {
      messages: [
        {
          role: "user",
          content: "Analyze codebase",
          timestamp: "2025-12-17T14:00:00.000Z",
        },
        {
          role: "assistant",
          content: "Analyzing...",
          timestamp: "2025-12-17T14:01:00.000Z",
        },
      ],
      delegations: [],
      toolCalls: [],
      evaluations: [
        {
          verdict: "EXCELLENT",
          dimensions: {
            productDiscernment: "10/10",
            processDiscernment: "9/10",
            performanceDiscernment: "10/10",
          },
          timestamp: "2025-12-17T14:02:00.000Z",
        },
      ],
      metadata: {
        startTime: "2025-12-17T14:00:00.000Z",
        endTime: "2025-12-17T14:10:00.000Z",
        primaryAgent: "base-analysis",
        skillsUsed: ["base-analysis", "read"],
        filesModified: ["analysis.md"],
        messageCount: 2,
        duration: 600000,
      },
    };

    storeConversation(dbPath, conversation1);
    storeConversation(dbPath, conversation2);
    storeConversation(dbPath, conversation3);
    storeConversation(dbPath, conversation4);
  });

  afterAll(() => {
    try {
      unlinkSync(dbPath);
    } catch (error) {
      // Ignore if file doesn't exist
    }
  });

  // ===== Agent Query Tests =====

  test("getConversationsByAgent: finds conversations by agent", () => {
    const conversations = getConversationsByAgent(dbPath, "file-writer");

    expect(conversations.length).toBe(2);
    conversations.forEach((c) => {
      expect(c.primaryAgent).toBe("file-writer");
    });
  });

  test("getConversationsByAgent: returns empty array for non-existent agent", () => {
    const conversations = getConversationsByAgent(dbPath, "non-existent-agent");

    expect(conversations).toEqual([]);
  });

  test("getConversationsByAgent: includes evaluation statistics", () => {
    const conversations = getConversationsByAgent(dbPath, "file-writer");

    expect(conversations.length).toBeGreaterThan(0);

    const firstConv = conversations[0];
    expect(firstConv.evaluationCount).toBeGreaterThan(0);
    expect(firstConv.excellentCount).toBeGreaterThanOrEqual(0);
    expect(firstConv.refinementCount).toBeGreaterThanOrEqual(0);
  });

  test("getConversationsByAgent: includes skills and files", () => {
    const conversations = getConversationsByAgent(dbPath, "file-writer");

    expect(conversations.length).toBeGreaterThan(0);

    const firstConv = conversations[0];
    expect(Array.isArray(firstConv.skillsUsed)).toBe(true);
    expect(Array.isArray(firstConv.filesModified)).toBe(true);
  });

  test("getConversationsByAgent: orders by timestamp descending", () => {
    const conversations = getConversationsByAgent(dbPath, "file-writer");

    expect(conversations.length).toBeGreaterThan(1);

    // Verify descending order
    for (let i = 1; i < conversations.length; i++) {
      expect(conversations[i - 1].timestamp >= conversations[i].timestamp).toBe(true);
    }
  });

  // ===== Date Range Query Tests =====

  test("getConversationsByDateRange: finds conversations in range", () => {
    const conversations = getConversationsByDateRange(
      dbPath,
      "2025-12-16T00:00:00.000Z",
      "2025-12-16T23:59:59.999Z"
    );

    expect(conversations.length).toBe(1);
    expect(conversations[0].timestamp).toContain("2025-12-16");
  });

  test("getConversationsByDateRange: finds all conversations with wide range", () => {
    const conversations = getConversationsByDateRange(
      dbPath,
      "2025-12-01T00:00:00.000Z",
      "2025-12-31T23:59:59.999Z"
    );

    expect(conversations.length).toBeGreaterThan(0);
  });

  test("getConversationsByDateRange: returns empty array for no matches", () => {
    const conversations = getConversationsByDateRange(
      dbPath,
      "2025-01-01T00:00:00.000Z",
      "2025-01-31T23:59:59.999Z"
    );

    expect(conversations).toEqual([]);
  });

  test("getConversationsByDateRange: orders by timestamp descending", () => {
    const conversations = getConversationsByDateRange(
      dbPath,
      "2025-12-15T00:00:00.000Z",
      "2025-12-17T23:59:59.999Z"
    );

    expect(conversations.length).toBeGreaterThan(1);

    // Verify descending order
    for (let i = 1; i < conversations.length; i++) {
      expect(conversations[i - 1].timestamp >= conversations[i].timestamp).toBe(true);
    }
  });

  // ===== Skill Query Tests =====

  test("getConversationsBySkill: finds conversations using skill", () => {
    const conversations = getConversationsBySkill(dbPath, "write");

    expect(conversations.length).toBeGreaterThan(0);
    conversations.forEach((c) => {
      expect(c.skillsUsed).toContain("write");
    });
  });

  test("getConversationsBySkill: returns empty array for unused skill", () => {
    const conversations = getConversationsBySkill(dbPath, "non-existent-skill");

    expect(conversations).toEqual([]);
  });

  test("getConversationsBySkill: handles multiple skills per conversation", () => {
    const conversations = getConversationsBySkill(dbPath, "read");

    expect(conversations.length).toBeGreaterThan(0);
    conversations.forEach((c) => {
      expect(c.skillsUsed).toContain("read");
    });
  });

  test("getConversationsBySkill: includes complete conversation summary", () => {
    const conversations = getConversationsBySkill(dbPath, "write");

    expect(conversations.length).toBeGreaterThan(0);

    const firstConv = conversations[0];
    expect(firstConv.id).toBeDefined();
    expect(firstConv.timestamp).toBeDefined();
    expect(firstConv.messageCount).toBeGreaterThan(0);
  });

  // ===== Recent Conversations Tests =====

  test("getRecentConversations: returns recent conversations", () => {
    const conversations = getRecentConversations(dbPath, 10);

    expect(conversations.length).toBeGreaterThan(0);
    expect(conversations.length).toBeLessThanOrEqual(10);
  });

  test("getRecentConversations: orders by timestamp descending", () => {
    const conversations = getRecentConversations(dbPath, 10);

    expect(conversations.length).toBeGreaterThan(1);

    // Verify descending order
    for (let i = 1; i < conversations.length; i++) {
      expect(conversations[i - 1].timestamp >= conversations[i].timestamp).toBe(true);
    }
  });

  test("getRecentConversations: respects limit parameter", () => {
    const conversations = getRecentConversations(dbPath, 2);

    expect(conversations.length).toBeLessThanOrEqual(2);
  });

  test("getRecentConversations: includes all summary fields", () => {
    const conversations = getRecentConversations(dbPath, 1);

    expect(conversations.length).toBe(1);

    const conv = conversations[0];
    expect(conv.id).toBeDefined();
    expect(conv.timestamp).toBeDefined();
    expect(conv.messageCount).toBeGreaterThan(0);
    expect(conv.evaluationCount).toBeGreaterThanOrEqual(0);
    expect(conv.excellentCount).toBeGreaterThanOrEqual(0);
    expect(conv.refinementCount).toBeGreaterThanOrEqual(0);
  });

  // ===== File Query Tests =====

  test("getConversationsByFile: finds conversations modifying file", () => {
    const conversations = getConversationsByFile(dbPath, "schema.sql");

    expect(conversations.length).toBeGreaterThan(0);
    conversations.forEach((c) => {
      const hasFile = c.filesModified.some((f) => f.includes("schema.sql"));
      expect(hasFile).toBe(true);
    });
  });

  test("getConversationsByFile: supports partial path matching", () => {
    const conversations = getConversationsByFile(dbPath, "database");

    expect(conversations.length).toBeGreaterThan(0);
    conversations.forEach((c) => {
      const hasMatch = c.filesModified.some((f) => f.includes("database"));
      expect(hasMatch).toBe(true);
    });
  });

  test("getConversationsByFile: returns empty array for non-existent file", () => {
    const conversations = getConversationsByFile(dbPath, "non-existent-file.xyz");

    expect(conversations).toEqual([]);
  });

  test("getConversationsByFile: includes complete conversation summary", () => {
    const conversations = getConversationsByFile(dbPath, "search.ts");

    expect(conversations.length).toBeGreaterThan(0);

    const firstConv = conversations[0];
    expect(firstConv.id).toBeDefined();
    expect(firstConv.primaryAgent).toBeDefined();
    expect(Array.isArray(firstConv.filesModified)).toBe(true);
  });

  // ===== Statistics Query Tests =====

  test("getConversationStatsByDate: returns daily statistics", () => {
    const stats = getConversationStatsByDate(
      dbPath,
      "2025-12-15",
      "2025-12-17"
    );

    expect(stats.length).toBeGreaterThan(0);

    const firstStat = stats[0];
    expect(firstStat.date).toBeDefined();
    expect(firstStat.conversationCount).toBeGreaterThan(0);
    expect(firstStat.totalMessages).toBeGreaterThan(0);
  });

  test("getConversationStatsByDate: orders by date descending", () => {
    const stats = getConversationStatsByDate(
      dbPath,
      "2025-12-15",
      "2025-12-17"
    );

    expect(stats.length).toBeGreaterThan(1);

    // Verify descending order
    for (let i = 1; i < stats.length; i++) {
      expect(stats[i - 1].date >= stats[i].date).toBe(true);
    }
  });

  test("getConversationStatsByDate: calculates correct counts", () => {
    const stats = getConversationStatsByDate(
      dbPath,
      "2025-12-17",
      "2025-12-17"
    );

    expect(stats.length).toBeGreaterThan(0);

    const dec17Stats = stats[0];
    expect(dec17Stats.conversationCount).toBe(2); // file-reader and base-analysis
    expect(dec17Stats.totalMessages).toBe(4); // 2 messages each
  });

  test("getConversationStatsByDate: returns empty array for no matches", () => {
    const stats = getConversationStatsByDate(
      dbPath,
      "2025-01-01",
      "2025-01-31"
    );

    expect(stats).toEqual([]);
  });

  test("getConversationStatsByDate: includes average duration", () => {
    const stats = getConversationStatsByDate(
      dbPath,
      "2025-12-15",
      "2025-12-17"
    );

    expect(stats.length).toBeGreaterThan(0);

    const firstStat = stats[0];
    // avgDurationMs can be null if no conversations have duration
    if (firstStat.avgDurationMs !== null) {
      expect(firstStat.avgDurationMs).toBeGreaterThan(0);
    }
  });
});
