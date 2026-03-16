/**
 * Tests for retrieval module
 *
 * Tests conversation retrieval and round-trip storage/retrieval
 */

import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { unlinkSync } from "fs";
import { initializeDatabase } from "../init";
import { storeConversation } from "../storage";
import {
  getConversationById,
  getConversationsByIds,
  conversationExists,
  getMessageCount,
} from "../retrieval";
import type { ParsedConversation } from "../../memory/types";

const dbPath = `/tmp/maestro-retrieval-test-${Math.random().toString(36).slice(2)}.db`;

describe("Retrieval Module", () => {
  
  let storedConversationId: string;

  beforeAll(() => {
    // Initialize database schema
    initializeDatabase(dbPath);

    // Store a comprehensive conversation for testing
    const testConversation: ParsedConversation = {
      messages: [
        {
          role: "user",
          content: "Create a database schema",
          timestamp: "2025-12-16T10:00:00.000Z",
        },
        {
          role: "assistant",
          content: "I'll create a comprehensive database schema",
          timestamp: "2025-12-16T10:01:00.000Z",
          metadata: {
            tokensUsed: 150,
            model: "claude-sonnet-4-5",
          },
        },
        {
          role: "user",
          content: "Add full-text search support",
          timestamp: "2025-12-16T10:02:00.000Z",
        },
      ],
      delegations: [
        {
          agentName: "file-writer",
          product: "Create database schema with FTS5 support",
          process: "Design tables, add indexes, implement triggers",
          performance: "Schema must support millions of rows with fast queries",
          timestamp: "2025-12-16T10:01:30.000Z",
          delegatedBy: "maestro",
        },
        {
          agentName: "file-reader",
          product: "Read existing schema files",
          process: "Analyze structure and patterns",
          performance: "Complete understanding of schema design",
          timestamp: "2025-12-16T10:01:45.000Z",
        },
      ],
      toolCalls: [
        {
          toolName: "Write",
          parameters: {
            file_path: "/path/to/schema.sql",
            content: "CREATE TABLE users...",
          },
          result: { success: true },
          timestamp: "2025-12-16T10:03:00.000Z",
          success: true,
        },
        {
          toolName: "Read",
          parameters: {
            file_path: "/path/to/existing.sql",
          },
          result: { content: "CREATE TABLE..." },
          timestamp: "2025-12-16T10:01:50.000Z",
          success: true,
        },
      ],
      evaluations: [
        {
          verdict: "EXCELLENT",
          dimensions: {
            delegation: "Clear and well-structured delegation",
            description: "Complete implementation with all requirements",
            productDiscernment: "9/10 - Excellent schema design",
            processDiscernment: "8/10 - Thorough analysis and implementation",
            performanceDiscernment: "9/10 - Meets all performance criteria",
          },
          timestamp: "2025-12-16T10:05:00.000Z",
          evaluatedAgent: "file-writer",
        },
        {
          verdict: "NEEDS_REFINEMENT",
          dimensions: {
            productDiscernment: "6/10 - Missing some edge cases",
            processDiscernment: "7/10 - Good approach but needs more testing",
            performanceDiscernment: "6/10 - Performance optimization needed",
          },
          refinementNeeded: "Add more comprehensive error handling and test coverage",
          timestamp: "2025-12-16T10:06:00.000Z",
          evaluatedAgent: "file-reader",
        },
      ],
      metadata: {
        startTime: "2025-12-16T10:00:00.000Z",
        endTime: "2025-12-16T10:10:00.000Z",
        primaryAgent: "file-writer",
        skillsUsed: ["write", "read", "base-analysis"],
        filesModified: ["/path/to/schema.sql", "/path/to/migration.ts"],
        messageCount: 3,
        duration: 600000,
        tokenUsage: {
          total: 5000,
          input: 2000,
          output: 3000,
        },
      },
    };

    storedConversationId = storeConversation(dbPath, testConversation);
  });

  afterAll(() => {
    try {
      unlinkSync(dbPath);
    } catch (error) {
      // Ignore if file doesn't exist
    }
  });

  // ===== Basic Retrieval Tests =====

  test("getConversationById: retrieves existing conversation", () => {
    const conversation = getConversationById(dbPath, storedConversationId);

    expect(conversation).not.toBeNull();
    expect(conversation!.messages.length).toBeGreaterThan(0);
  });

  test("getConversationById: returns null for non-existent conversation", () => {
    const conversation = getConversationById(
      dbPath,
      "00000000-0000-0000-0000-000000000000"
    );

    expect(conversation).toBeNull();
  });

  // ===== Messages Round-Trip Tests =====

  test("getConversationById: retrieves all messages in order", () => {
    const conversation = getConversationById(dbPath, storedConversationId);

    expect(conversation).not.toBeNull();
    expect(conversation!.messages.length).toBe(3);

    // Verify chronological order
    const timestamps = conversation!.messages.map((m) => m.timestamp);
    for (let i = 1; i < timestamps.length; i++) {
      expect(timestamps[i - 1] <= timestamps[i]).toBe(true);
    }
  });

  test("getConversationById: preserves message roles and content", () => {
    const conversation = getConversationById(dbPath, storedConversationId);

    expect(conversation).not.toBeNull();

    const firstMessage = conversation!.messages[0];
    expect(firstMessage.role).toBe("user");
    expect(firstMessage.content).toContain("database schema");

    const secondMessage = conversation!.messages[1];
    expect(secondMessage.role).toBe("assistant");
    expect(secondMessage.content).toContain("comprehensive");
  });

  test("getConversationById: preserves message metadata", () => {
    const conversation = getConversationById(dbPath, storedConversationId);

    expect(conversation).not.toBeNull();

    const secondMessage = conversation!.messages[1];
    expect(secondMessage.metadata).toBeDefined();
    expect(secondMessage.metadata?.tokensUsed).toBe(150);
    expect(secondMessage.metadata?.model).toBe("claude-sonnet-4-5");
  });

  // ===== Delegations Round-Trip Tests =====

  test("getConversationById: retrieves all delegations in order", () => {
    const conversation = getConversationById(dbPath, storedConversationId);

    expect(conversation).not.toBeNull();
    expect(conversation!.delegations.length).toBe(2);

    // Verify chronological order
    const timestamps = conversation!.delegations.map((d) => d.timestamp);
    for (let i = 1; i < timestamps.length; i++) {
      expect(timestamps[i - 1] <= timestamps[i]).toBe(true);
    }
  });

  test("getConversationById: preserves delegation 3P structure", () => {
    const conversation = getConversationById(dbPath, storedConversationId);

    expect(conversation).not.toBeNull();

    const firstDelegation = conversation!.delegations[0];
    expect(firstDelegation.agentName).toBe("file-writer");
    expect(firstDelegation.product).toContain("FTS5");
    expect(firstDelegation.process).toContain("indexes");
    expect(firstDelegation.performance).toContain("millions");
  });

  // ===== Tool Calls Round-Trip Tests =====

  test("getConversationById: retrieves all tool calls in order", () => {
    const conversation = getConversationById(dbPath, storedConversationId);

    expect(conversation).not.toBeNull();
    expect(conversation!.toolCalls.length).toBe(2);

    // Verify chronological order
    const timestamps = conversation!.toolCalls.map((t) => t.timestamp);
    for (let i = 1; i < timestamps.length; i++) {
      expect(timestamps[i - 1] <= timestamps[i]).toBe(true);
    }
  });

  test("getConversationById: preserves tool call parameters and results", () => {
    const conversation = getConversationById(dbPath, storedConversationId);

    expect(conversation).not.toBeNull();

    const writeCall = conversation!.toolCalls.find((t) => t.toolName === "Write");
    expect(writeCall).toBeDefined();
    expect(writeCall!.parameters.file_path).toBe("/path/to/schema.sql");
    expect(writeCall!.result.success).toBe(true);
    expect(writeCall!.success).toBe(true);
  });

  // ===== Evaluations Round-Trip Tests =====

  test("getConversationById: retrieves all evaluations in order", () => {
    const conversation = getConversationById(dbPath, storedConversationId);

    expect(conversation).not.toBeNull();
    expect(conversation!.evaluations.length).toBe(2);

    // Verify chronological order
    const timestamps = conversation!.evaluations.map((e) => e.timestamp);
    for (let i = 1; i < timestamps.length; i++) {
      expect(timestamps[i - 1] <= timestamps[i]).toBe(true);
    }
  });

  test("getConversationById: preserves evaluation verdicts and scores", () => {
    const conversation = getConversationById(dbPath, storedConversationId);

    expect(conversation).not.toBeNull();

    const excellent = conversation!.evaluations.find(
      (e) => e.verdict === "EXCELLENT"
    );
    expect(excellent).toBeDefined();
    expect(excellent!.dimensions.productDiscernment).toContain("9/10");

    const needsRefinement = conversation!.evaluations.find(
      (e) => e.verdict === "NEEDS_REFINEMENT"
    );
    expect(needsRefinement).toBeDefined();
    expect(needsRefinement!.refinementNeeded).toContain("error handling");
  });

  // ===== Metadata Round-Trip Tests =====

  test("getConversationById: preserves conversation metadata", () => {
    const conversation = getConversationById(dbPath, storedConversationId);

    expect(conversation).not.toBeNull();

    const metadata = conversation!.metadata;
    expect(metadata.startTime).toBe("2025-12-16T10:00:00.000Z");
    expect(metadata.primaryAgent).toBe("file-writer");
    expect(metadata.messageCount).toBe(3);
    expect(metadata.duration).toBe(600000);
  });

  test("getConversationById: preserves skills and files arrays", () => {
    const conversation = getConversationById(dbPath, storedConversationId);

    expect(conversation).not.toBeNull();

    const metadata = conversation!.metadata;
    expect(metadata.skillsUsed).toEqual(["write", "read", "base-analysis"]);
    expect(metadata.filesModified.length).toBe(2);
    expect(metadata.filesModified).toContain("/path/to/schema.sql");
  });

  // ===== Batch Retrieval Tests =====

  test("getConversationsByIds: retrieves multiple conversations", () => {
    // Store another conversation
    const conversation2: ParsedConversation = {
      messages: [
        {
          role: "user",
          content: "Test message",
          timestamp: "2025-12-17T10:00:00.000Z",
        },
      ],
      delegations: [],
      toolCalls: [],
      evaluations: [],
      metadata: {
        startTime: "2025-12-17T10:00:00.000Z",
        endTime: "2025-12-17T10:01:00.000Z",
        primaryAgent: "maestro",
        skillsUsed: [],
        filesModified: [],
        messageCount: 1,
        duration: 60000,
      },
    };

    const id2 = storeConversation(dbPath, conversation2);

    const conversations = getConversationsByIds(dbPath, [
      storedConversationId,
      id2,
    ]);

    expect(conversations.length).toBe(2);
    expect(conversations[0].messages.length).toBeGreaterThan(0);
    expect(conversations[1].messages.length).toBeGreaterThan(0);
  });

  test("getConversationsByIds: skips non-existent IDs", () => {
    const conversations = getConversationsByIds(dbPath, [
      storedConversationId,
      "00000000-0000-0000-0000-000000000000",
    ]);

    expect(conversations.length).toBe(1);
    expect(conversations[0].messages.length).toBeGreaterThan(0);
  });

  test("getConversationsByIds: returns empty array for all non-existent IDs", () => {
    const conversations = getConversationsByIds(dbPath, [
      "00000000-0000-0000-0000-000000000001",
      "00000000-0000-0000-0000-000000000002",
    ]);

    expect(conversations).toEqual([]);
  });

  // ===== Utility Function Tests =====

  test("conversationExists: returns true for existing conversation", () => {
    const exists = conversationExists(dbPath, storedConversationId);

    expect(exists).toBe(true);
  });

  test("conversationExists: returns false for non-existent conversation", () => {
    const exists = conversationExists(
      dbPath,
      "00000000-0000-0000-0000-000000000000"
    );

    expect(exists).toBe(false);
  });

  test("getMessageCount: returns correct count for existing conversation", () => {
    const count = getMessageCount(dbPath, storedConversationId);

    expect(count).toBe(3);
  });

  test("getMessageCount: returns null for non-existent conversation", () => {
    const count = getMessageCount(
      dbPath,
      "00000000-0000-0000-0000-000000000000"
    );

    expect(count).toBeNull();
  });

  // ===== Complete Round-Trip Test =====

  test("Complete round-trip: stored data matches retrieved data", () => {
    // Create a fresh conversation
    const original: ParsedConversation = {
      messages: [
        {
          role: "user",
          content: "Round-trip test",
          timestamp: "2025-12-18T12:00:00.000Z",
        },
      ],
      delegations: [
        {
          agentName: "test-agent",
          product: "Test product",
          process: "Test process",
          performance: "Test performance",
          timestamp: "2025-12-18T12:00:30.000Z",
        },
      ],
      toolCalls: [
        {
          toolName: "TestTool",
          parameters: { key: "value" },
          result: { output: "test" },
          timestamp: "2025-12-18T12:01:00.000Z",
          success: true,
        },
      ],
      evaluations: [
        {
          verdict: "EXCELLENT",
          dimensions: {
            productDiscernment: "10/10",
          },
          timestamp: "2025-12-18T12:02:00.000Z",
        },
      ],
      metadata: {
        startTime: "2025-12-18T12:00:00.000Z",
        endTime: "2025-12-18T12:05:00.000Z",
        primaryAgent: "test-agent",
        skillsUsed: ["test-skill"],
        filesModified: ["test.ts"],
        messageCount: 1,
        duration: 300000,
      },
    };

    // Store and retrieve
    const id = storeConversation(dbPath, original);
    const retrieved = getConversationById(dbPath, id);

    expect(retrieved).not.toBeNull();

    // Verify all sections match
    expect(retrieved!.messages.length).toBe(original.messages.length);
    expect(retrieved!.delegations.length).toBe(original.delegations.length);
    expect(retrieved!.toolCalls.length).toBe(original.toolCalls.length);
    expect(retrieved!.evaluations.length).toBe(original.evaluations.length);

    // Verify metadata
    expect(retrieved!.metadata.primaryAgent).toBe(original.metadata.primaryAgent);
    expect(retrieved!.metadata.messageCount).toBe(original.metadata.messageCount);
    expect(retrieved!.metadata.skillsUsed).toEqual(original.metadata.skillsUsed);
  });
});
