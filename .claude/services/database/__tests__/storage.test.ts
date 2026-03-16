/**
 * Tests for database storage operations
 */

import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { storeConversation } from "../storage";
import { initializeDatabase } from "../init";
import { openDatabase, closeDatabase } from "../connection";
import type { ParsedConversation } from "../../memory/types";
import { unlinkSync } from "fs";

// Sample parsed conversation for testing
const sampleConversation: ParsedConversation = {
  messages: [
    {
      role: "user",
      content: "Create a new file reader agent",
      timestamp: "2025-12-16T10:00:00.000Z",
      metadata: { tokens: 15 },
    },
    {
      role: "assistant",
      content: "I'll create the file reader agent with proper delegation.",
      timestamp: "2025-12-16T10:00:05.000Z",
      metadata: { tokens: 25 },
    },
  ],
  delegations: [
    {
      agentName: "file-writer",
      product: "Create file-reader.md agent definition",
      process: "Use write skill, follow agent template",
      performance: "Complete agent with all sections and evidence",
      timestamp: "2025-12-16T10:00:10.000Z",
      delegatedBy: "maestro",
    },
  ],
  toolCalls: [
    {
      toolName: "Write",
      parameters: {
        file_path: "/path/to/file-reader.md",
        content: "# File Reader Agent\n...",
      },
      result: { success: true },
      timestamp: "2025-12-16T10:00:15.000Z",
      success: true,
    },
    {
      toolName: "Grep",
      parameters: {
        pattern: "agent-registry",
        path: ".claude/agents",
      },
      result: { matches: [] },
      timestamp: "2025-12-16T10:00:20.000Z",
      success: false,
      errorMessage: "No matches found",
    },
  ],
  evaluations: [
    {
      verdict: "EXCELLENT",
      dimensions: {
        productDiscernment: "Complete and correct (9/10)",
        processDiscernment: "Sound methodology (8/10)",
        performanceDiscernment: "High quality implementation (9/10)",
      },
      timestamp: "2025-12-16T10:00:25.000Z",
      evaluatedAgent: "file-writer",
    },
  ],
  metadata: {
    startTime: "2025-12-16T10:00:00.000Z",
    endTime: "2025-12-16T10:00:30.000Z",
    primaryAgent: "maestro",
    skillsUsed: ["write", "4d-evaluation"],
    filesModified: ["/path/to/file-reader.md"],
    messageCount: 2,
    duration: 30000,
    tokenUsage: {
      total: 40,
      input: 15,
      output: 25,
    },
  },
};

describe("Database Storage", () => {
  let dbPath: string;

  beforeEach(() => {
    // Use a temporary file-based database for testing
    dbPath = `/tmp/maestro-storage-test-${Date.now()}.db`;
    initializeDatabase(dbPath);
  });

  afterEach(() => {
    // Clean up test database
    try {
      unlinkSync(dbPath);
    } catch (error) {
      // Ignore if file doesn't exist
    }
  });

  test("should store conversation and return UUID", () => {
    const conversationId = storeConversation(dbPath, sampleConversation);

    expect(conversationId).toBeDefined();
    expect(conversationId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
    );
  });

  test("should store conversation metadata", () => {
    const conversationId = storeConversation(dbPath, sampleConversation);

    const db = openDatabase(dbPath);
    const result = db
      .query("SELECT * FROM conversations WHERE id = ?")
      .get(conversationId) as any;

    expect(result).toBeDefined();
    expect(result.timestamp).toBe("2025-12-16T10:00:00.000Z");
    expect(result.duration_ms).toBe(30000);
    expect(result.message_count).toBe(2);
    expect(result.primary_agent).toBe("maestro");

    const skillsUsed = JSON.parse(result.skills_used);
    expect(skillsUsed).toEqual(["write", "4d-evaluation"]);

    const filesModified = JSON.parse(result.files_modified);
    expect(filesModified).toEqual(["/path/to/file-reader.md"]);

    closeDatabase(db);
  });

  test("should store messages", () => {
    const conversationId = storeConversation(dbPath, sampleConversation);

    const db = openDatabase(dbPath);
    const messages = db
      .query("SELECT * FROM messages WHERE conversation_id = ? ORDER BY timestamp")
      .all(conversationId) as any[];

    expect(messages).toHaveLength(2);

    expect(messages[0].role).toBe("user");
    expect(messages[0].content).toBe("Create a new file reader agent");
    expect(messages[0].timestamp).toBe("2025-12-16T10:00:00.000Z");

    expect(messages[1].role).toBe("assistant");
    expect(messages[1].content).toContain("file reader agent");

    closeDatabase(db);
  });

  test("should store delegations", () => {
    const conversationId = storeConversation(dbPath, sampleConversation);

    const db = openDatabase(dbPath);
    const delegations = db
      .query("SELECT * FROM delegations WHERE conversation_id = ?")
      .all(conversationId) as any[];

    expect(delegations).toHaveLength(1);

    expect(delegations[0].agent_name).toBe("file-writer");
    expect(delegations[0].product).toBe("Create file-reader.md agent definition");
    expect(delegations[0].process).toBe("Use write skill, follow agent template");
    expect(delegations[0].performance).toBe(
      "Complete agent with all sections and evidence"
    );

    closeDatabase(db);
  });

  test("should store evaluations with scores", () => {
    const conversationId = storeConversation(dbPath, sampleConversation);

    const db = openDatabase(dbPath);
    const evaluations = db
      .query("SELECT * FROM evaluations WHERE conversation_id = ?")
      .all(conversationId) as any[];

    expect(evaluations).toHaveLength(1);

    expect(evaluations[0].verdict).toBe("EXCELLENT");
    expect(evaluations[0].product_score).toBe(9);
    expect(evaluations[0].process_score).toBe(8);
    expect(evaluations[0].performance_score).toBe(9);

    closeDatabase(db);
  });

  test("should store tool calls with success status", () => {
    const conversationId = storeConversation(dbPath, sampleConversation);

    const db = openDatabase(dbPath);
    const toolCalls = db
      .query("SELECT * FROM tool_calls WHERE conversation_id = ? ORDER BY timestamp")
      .all(conversationId) as any[];

    expect(toolCalls).toHaveLength(2);

    // First tool call (successful)
    expect(toolCalls[0].tool_name).toBe("Write");
    expect(toolCalls[0].success).toBe(1);
    const params0 = JSON.parse(toolCalls[0].parameters);
    expect(params0.file_path).toBe("/path/to/file-reader.md");

    // Second tool call (failed)
    expect(toolCalls[1].tool_name).toBe("Grep");
    expect(toolCalls[1].success).toBe(0);

    closeDatabase(db);
  });

  test("should use transaction for atomicity", () => {
    // Create conversation with invalid data that should cause rollback
    const invalidConversation: ParsedConversation = {
      ...sampleConversation,
      evaluations: [
        {
          verdict: "INVALID_VERDICT" as any, // This should violate CHECK constraint
          dimensions: {},
          timestamp: "2025-12-16T10:00:25.000Z",
        },
      ],
    };

    // Should throw error and rollback transaction
    expect(() => storeConversation(dbPath, invalidConversation)).toThrow();

    // Verify nothing was inserted
    const db = openDatabase(dbPath);
    const count = db.query("SELECT COUNT(*) as count FROM conversations").get() as any;
    expect(count.count).toBe(0);

    closeDatabase(db);
  });

  test("should handle empty delegations array", () => {
    const conversationWithoutDelegations: ParsedConversation = {
      ...sampleConversation,
      delegations: [],
    };

    const conversationId = storeConversation(
      dbPath,
      conversationWithoutDelegations
    );

    const db = openDatabase(dbPath);
    const delegations = db
      .query("SELECT * FROM delegations WHERE conversation_id = ?")
      .all(conversationId) as any[];

    expect(delegations).toHaveLength(0);

    closeDatabase(db);
  });

  test("should handle empty tool calls array", () => {
    const conversationWithoutTools: ParsedConversation = {
      ...sampleConversation,
      toolCalls: [],
    };

    const conversationId = storeConversation(dbPath, conversationWithoutTools);

    const db = openDatabase(dbPath);
    const toolCalls = db
      .query("SELECT * FROM tool_calls WHERE conversation_id = ?")
      .all(conversationId) as any[];

    expect(toolCalls).toHaveLength(0);

    closeDatabase(db);
  });

  test("should populate FTS5 tables via triggers", () => {
    const conversationId = storeConversation(dbPath, sampleConversation);

    const db = openDatabase(dbPath);

    // Check messages_fts
    const messagesFts = db
      .query("SELECT COUNT(*) as count FROM messages_fts")
      .get() as any;
    expect(messagesFts.count).toBe(2);

    // Check delegations_fts
    const delegationsFts = db
      .query("SELECT COUNT(*) as count FROM delegations_fts")
      .get() as any;
    expect(delegationsFts.count).toBe(1);

    closeDatabase(db);
  });

  test("should handle evaluation without scores", () => {
    const conversationWithNoScores: ParsedConversation = {
      ...sampleConversation,
      evaluations: [
        {
          verdict: "NEEDS_REFINEMENT",
          dimensions: {
            productDiscernment: "Missing tests",
            processDiscernment: "Incomplete analysis",
          },
          refinementNeeded: "Add unit tests",
          timestamp: "2025-12-16T10:00:25.000Z",
        },
      ],
    };

    const conversationId = storeConversation(dbPath, conversationWithNoScores);

    const db = openDatabase(dbPath);
    const evaluations = db
      .query("SELECT * FROM evaluations WHERE conversation_id = ?")
      .all(conversationId) as any[];

    expect(evaluations).toHaveLength(1);
    expect(evaluations[0].verdict).toBe("NEEDS_REFINEMENT");
    expect(evaluations[0].product_score).toBeNull();
    expect(evaluations[0].refinement_needed).toBe("Add unit tests");

    closeDatabase(db);
  });
});
