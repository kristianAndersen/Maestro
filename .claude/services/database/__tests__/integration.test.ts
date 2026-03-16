/**
 * Integration Tests for Maestro Memory Database
 *
 * These tests verify end-to-end workflows across all database modules:
 * - Initialize → Store → Search → Retrieve
 * - Performance benchmarks
 * - Data integrity through full round-trip
 */

import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { mkdtempSync, rmSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { initializeDatabase } from "../init";
import { storeConversation } from "../storage";
import { searchAll, searchMessages, searchDelegations } from "../search";
import {
  getRecentConversations,
  getConversationsByAgent,
  getConversationsBySkill,
  getConversationsByFile,
} from "../queries";
import { getConversationById, conversationExists, getMessageCount } from "../retrieval";
import { openDatabase, closeDatabase } from "../connection";
import type { ParsedConversation } from "../../memory/types";

describe("Database Integration Tests", () => {
  let tempDir: string;
  let dbPath: string;

  beforeEach(() => {
    // Create temporary directory for test database
    tempDir = mkdtempSync(join(tmpdir(), "maestro-db-test-"));
    dbPath = join(tempDir, "test.db");

    // Initialize database
    initializeDatabase(dbPath);
  });

  afterEach(() => {
    // Clean up temporary directory
    try {
      rmSync(tempDir, { recursive: true, force: true });
    } catch (err) {
      // Ignore cleanup errors
    }
  });

  /**
   * Helper function to create a sample conversation
   */
  function createSampleConversation(
    overrides?: Partial<ParsedConversation>
  ): ParsedConversation {
    const now = new Date().toISOString();

    return {
      metadata: {
        startTime: now,
        endTime: new Date(Date.now() + 60000).toISOString(),
        primaryAgent: "file-writer",
        skillsUsed: ["write", "read"],
        filesModified: [".claude/agents/test.md", "README.md"],
        messageCount: 3,
        duration: 60000,
        tokenUsage: { input: 1000, output: 500 },
      },
      messages: [
        {
          role: "user",
          content: "Create a new agent for handling database operations",
          timestamp: now,
          metadata: {},
        },
        {
          role: "assistant",
          content:
            "I'll create a comprehensive database agent with full CRUD operations",
          timestamp: new Date(Date.now() + 10000).toISOString(),
          metadata: {},
        },
        {
          role: "assistant",
          content: "Database agent created successfully at .claude/agents/database.md",
          timestamp: new Date(Date.now() + 50000).toISOString(),
          metadata: {},
        },
      ],
      delegations: [
        {
          agentName: "file-writer",
          product: "Create database agent with CRUD operations",
          process: "Use Write tool to create new agent file",
          performance: "Agent must include all database operations",
          timestamp: new Date(Date.now() + 5000).toISOString(),
          delegatedBy: "maestro",
        },
      ],
      evaluations: [
        {
          verdict: "EXCELLENT",
          dimensions: {
            productDiscernment: "Agent is complete and well-structured",
            processDiscernment: "Approach was sound and efficient",
            performanceDiscernment: "Meets all excellence criteria",
          },
          timestamp: new Date(Date.now() + 55000).toISOString(),
          evaluatedAgent: "file-writer",
        },
      ],
      toolCalls: [
        {
          toolName: "Write",
          parameters: { file_path: ".claude/agents/database.md" },
          result: "File created successfully",
          timestamp: new Date(Date.now() + 40000).toISOString(),
          success: true,
        },
      ],
      ...overrides,
    };
  }

  test("should complete full workflow: init → store → search → retrieve", () => {
    // 1. Store a conversation
    const conversation = createSampleConversation();
    const conversationId = storeConversation(dbPath, conversation);

    expect(conversationId).toBeDefined();
    expect(typeof conversationId).toBe("string");

    // 2. Verify conversation exists
    expect(conversationExists(dbPath, conversationId)).toBe(true);

    // 3. Search for conversation content
    const searchResults = searchAll(dbPath, "database operations");
    expect(searchResults.length).toBeGreaterThan(0);

    // Note: SearchResult has nested conversation.id, not top-level conversationId
    const foundConversation = searchResults.find(
      (r) => r.conversation.id === conversationId
    );
    expect(foundConversation).toBeDefined();

    // 4. Retrieve full conversation
    const retrieved = getConversationById(dbPath, conversationId);
    expect(retrieved).not.toBeNull();
    expect(retrieved!.messages.length).toBe(3);
    expect(retrieved!.delegations?.length).toBe(1);
    expect(retrieved!.evaluations?.length).toBe(1);
    expect(retrieved!.toolCalls?.length).toBe(1);

    // 5. Verify data integrity
    expect(retrieved!.metadata.primaryAgent).toBe("file-writer");
    expect(retrieved!.metadata.skillsUsed).toContain("write");
    expect(retrieved!.metadata.filesModified).toContain(".claude/agents/test.md");
  });

  test("should handle multiple conversations with correct isolation", () => {
    // Store multiple conversations
    const conv1 = createSampleConversation({
      metadata: {
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 60000).toISOString(),
        primaryAgent: "maestro",
        skillsUsed: ["orchestration"],
        filesModified: [],
        messageCount: 2,
        duration: 60000,
      },
      messages: [
        {
          role: "user",
          content: "Orchestrate a complex task",
          timestamp: new Date().toISOString(),
        },
        {
          role: "assistant",
          content: "I'll delegate this to specialized agents",
          timestamp: new Date(Date.now() + 30000).toISOString(),
        },
      ],
      delegations: [], // No delegations to avoid FK issues with minimal messages
      evaluations: [],
      toolCalls: [],
    });

    const conv2 = createSampleConversation({
      metadata: {
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 120000).toISOString(),
        primaryAgent: "base-research",
        skillsUsed: ["research", "fetch"],
        filesModified: [],
        messageCount: 2,
        duration: 120000,
      },
      messages: [
        {
          role: "user",
          content: "Research best practices for database design",
          timestamp: new Date().toISOString(),
        },
        {
          role: "assistant",
          content: "I'll gather information from multiple sources",
          timestamp: new Date(Date.now() + 60000).toISOString(),
        },
      ],
      delegations: [],
      evaluations: [],
      toolCalls: [],
    });

    const id1 = storeConversation(dbPath, conv1);
    const id2 = storeConversation(dbPath, conv2);

    expect(id1).not.toBe(id2);

    // Query by agent
    const maestroConvs = getConversationsByAgent(dbPath, "maestro");
    expect(maestroConvs.length).toBe(1);
    expect(maestroConvs[0].id).toBe(id1);

    const researchConvs = getConversationsByAgent(dbPath, "base-research");
    expect(researchConvs.length).toBe(1);
    expect(researchConvs[0].id).toBe(id2);

    // Query by skill
    const orchestrationConvs = getConversationsBySkill(dbPath, "orchestration");
    expect(orchestrationConvs.length).toBe(1);

    const fetchConvs = getConversationsBySkill(dbPath, "fetch");
    expect(fetchConvs.length).toBe(1);
  });

  test("should search across messages and delegations", () => {
    const conversation = createSampleConversation();
    const conversationId = storeConversation(dbPath, conversation);

    // Search in messages
    const messageResults = searchMessages(dbPath, "database operations");
    expect(messageResults.length).toBeGreaterThan(0);
    expect(messageResults[0].type).toBe("message");

    // Search in delegations
    const delegationResults = searchDelegations(dbPath, "CRUD operations");
    expect(delegationResults.length).toBeGreaterThan(0);
    expect(delegationResults[0].type).toBe("delegation");

    // Combined search
    const allResults = searchAll(dbPath, "database");
    expect(allResults.length).toBeGreaterThanOrEqual(2); // At least messages and delegations
  });

  test("should query conversations by file modifications", () => {
    const conv1 = createSampleConversation({
      metadata: {
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 60000).toISOString(),
        primaryAgent: "file-writer",
        skillsUsed: ["write"],
        filesModified: [".claude/agents/maestro.md"],
        messageCount: 1,
        duration: 60000,
      },
      messages: [
        {
          role: "user",
          content: "Update maestro agent",
          timestamp: new Date().toISOString(),
        },
      ],
      delegations: [],
      evaluations: [],
      toolCalls: [],
    });

    const conv2 = createSampleConversation({
      metadata: {
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 60000).toISOString(),
        primaryAgent: "file-writer",
        skillsUsed: ["write"],
        filesModified: ["README.md"],
        messageCount: 1,
        duration: 60000,
      },
      messages: [
        {
          role: "user",
          content: "Update README",
          timestamp: new Date().toISOString(),
        },
      ],
      delegations: [],
      evaluations: [],
      toolCalls: [],
    });

    const id1 = storeConversation(dbPath, conv1);
    const id2 = storeConversation(dbPath, conv2);

    // Query by specific file
    const maestroConvs = getConversationsByFile(dbPath, ".claude/agents/maestro.md");
    expect(maestroConvs.length).toBe(1);
    expect(maestroConvs[0].id).toBe(id1);

    const readmeConvs = getConversationsByFile(dbPath, "README.md");
    expect(readmeConvs.length).toBe(1);
    expect(readmeConvs[0].id).toBe(id2);
  });

  test("should maintain referential integrity on cascade delete", () => {
    const conversation = createSampleConversation();
    const conversationId = storeConversation(dbPath, conversation);

    // Verify all related data exists
    expect(conversationExists(dbPath, conversationId)).toBe(true);
    expect(getMessageCount(dbPath, conversationId)).toBe(3);

    const retrieved = getConversationById(dbPath, conversationId);
    expect(retrieved!.delegations?.length).toBe(1);
    expect(retrieved!.evaluations?.length).toBe(1);
    expect(retrieved!.toolCalls?.length).toBe(1);

    // Delete conversation
    const db = openDatabase(dbPath);
    db.query("DELETE FROM conversations WHERE id = ?").run(conversationId);
    closeDatabase(db);

    // Verify all related data is cascade deleted
    expect(conversationExists(dbPath, conversationId)).toBe(false);
    expect(getMessageCount(dbPath, conversationId)).toBeNull();

    const deletedConversation = getConversationById(dbPath, conversationId);
    expect(deletedConversation).toBeNull();
  });

  test("should handle transaction rollback on error", () => {
    const conversation = createSampleConversation();

    // Create invalid conversation (missing required fields)
    const invalidConversation = {
      ...conversation,
      messages: [], // Empty messages with delegations that reference non-existent message_id
    };

    // Attempt to store invalid conversation - should throw due to FK constraint
    expect(() => {
      storeConversation(dbPath, invalidConversation as any);
    }).toThrow();

    // Verify no partial data was stored
    const recentConvs = getRecentConversations(dbPath, 10);
    expect(recentConvs.length).toBe(0);
  });

  test("should measure search performance", () => {
    // Store multiple conversations for performance testing
    const conversations = Array.from({ length: 20 }, (_, i) =>
      createSampleConversation({
        messages: [
          {
            role: "user",
            content: `Test message ${i} with unique keyword test${i}`,
            timestamp: new Date().toISOString(),
          },
        ],
        delegations: [], // Avoid FK issues
        evaluations: [],
        toolCalls: [],
      })
    );

    // Store all conversations
    const startStore = Date.now();
    conversations.forEach((conv) => storeConversation(dbPath, conv));
    const storeTime = Date.now() - startStore;

    console.log(`\nPerformance Metrics:`);
    console.log(`  Store 20 conversations: ${storeTime}ms (${(storeTime / 20).toFixed(1)}ms avg)`);

    // Measure search performance
    const startSearch = Date.now();
    const results = searchAll(dbPath, "test message");
    const searchTime = Date.now() - startSearch;

    console.log(`  Search across all data: ${searchTime}ms`);
    console.log(`  Results found: ${results.length}`);

    // Measure retrieval performance
    const conversationId = results[0]?.conversation.id;
    if (conversationId) {
      const startRetrieve = Date.now();
      getConversationById(dbPath, conversationId);
      const retrieveTime = Date.now() - startRetrieve;

      console.log(`  Retrieve full conversation: ${retrieveTime}ms\n`);

      // Performance expectations (should be very fast)
      expect(searchTime).toBeLessThan(100); // Search should be < 100ms
      expect(retrieveTime).toBeLessThan(50); // Retrieval should be < 50ms
    }
  });

  test("should verify PRAGMA settings are applied", () => {
    const db = openDatabase(dbPath);

    // Verify all performance PRAGMA settings
    const cacheSize = (db.query("PRAGMA cache_size").get() as any).cache_size;
    expect(cacheSize).toBe(-64000);

    const tempStore = (db.query("PRAGMA temp_store").get() as any).temp_store;
    expect(tempStore).toBe(2); // 2 = MEMORY

    // Note: mmap_size may be limited by system settings, so we just verify it's set > 0
    const mmapSize = (db.query("PRAGMA mmap_size").get() as any).mmap_size;
    expect(mmapSize).toBeGreaterThan(0);
    // Note: System may limit this to less than requested 30GB (e.g., 1GB on some systems)

    const journalMode = (db.query("PRAGMA journal_mode").get() as any).journal_mode;
    expect(journalMode.toLowerCase()).toBe("wal");

    const synchronous = (db.query("PRAGMA synchronous").get() as any).synchronous;
    expect(synchronous).toBe(1); // 1 = NORMAL

    const foreignKeys = (db.query("PRAGMA foreign_keys").get() as any).foreign_keys;
    expect(foreignKeys).toBe(1); // 1 = ON

    closeDatabase(db);
  });

  test("should return recent conversations in correct order", () => {
    // Store conversations with different timestamps
    const conversations = [
      createSampleConversation({
        metadata: {
          startTime: new Date("2025-12-17T10:00:00Z").toISOString(),
          endTime: new Date("2025-12-17T10:05:00Z").toISOString(),
          primaryAgent: "agent1",
          skillsUsed: [],
          filesModified: [],
          messageCount: 1,
          duration: 300000,
        },
        messages: [
          {
            role: "user",
            content: "First conversation",
            timestamp: new Date("2025-12-17T10:00:00Z").toISOString(),
          },
        ],
        delegations: [],
        evaluations: [],
        toolCalls: [],
      }),
      createSampleConversation({
        metadata: {
          startTime: new Date("2025-12-17T11:00:00Z").toISOString(),
          endTime: new Date("2025-12-17T11:05:00Z").toISOString(),
          primaryAgent: "agent2",
          skillsUsed: [],
          filesModified: [],
          messageCount: 1,
          duration: 300000,
        },
        messages: [
          {
            role: "user",
            content: "Second conversation",
            timestamp: new Date("2025-12-17T11:00:00Z").toISOString(),
          },
        ],
        delegations: [],
        evaluations: [],
        toolCalls: [],
      }),
      createSampleConversation({
        metadata: {
          startTime: new Date("2025-12-17T12:00:00Z").toISOString(),
          endTime: new Date("2025-12-17T12:05:00Z").toISOString(),
          primaryAgent: "agent3",
          skillsUsed: [],
          filesModified: [],
          messageCount: 1,
          duration: 300000,
        },
        messages: [
          {
            role: "user",
            content: "Third conversation",
            timestamp: new Date("2025-12-17T12:00:00Z").toISOString(),
          },
        ],
        delegations: [],
        evaluations: [],
        toolCalls: [],
      }),
    ];

    conversations.forEach((conv) => storeConversation(dbPath, conv));

    // Get recent conversations (should be in reverse chronological order)
    const recent = getRecentConversations(dbPath, 10);

    expect(recent.length).toBe(3);
    expect(recent[0].primaryAgent).toBe("agent3"); // Most recent
    expect(recent[1].primaryAgent).toBe("agent2");
    expect(recent[2].primaryAgent).toBe("agent1"); // Oldest
  });
});
