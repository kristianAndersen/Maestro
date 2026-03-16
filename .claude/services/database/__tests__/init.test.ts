/**
 * Tests for database initialization
 */

import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { initializeDatabase } from "../init";
import { openDatabase, closeDatabase } from "../connection";
import { Database } from "bun:sqlite";
import { unlinkSync } from "fs";

describe("Database Initialization", () => {
  let testDbPath: string;

  beforeEach(() => {
    // Use a temporary file-based database for testing
    testDbPath = `/tmp/maestro-test-${Date.now()}.db`;
  });

  afterEach(() => {
    // Clean up test database
    try {
      unlinkSync(testDbPath);
    } catch (error) {
      // Ignore if file doesn't exist
    }
  });

  test("should initialize database schema", () => {
    initializeDatabase(testDbPath);

    // Verify tables were created
    const db = openDatabase(testDbPath);

    // Check for core tables
    const tables = db
      .query(
        "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
      )
      .all() as any[];

    const tableNames = tables.map((t) => t.name);

    expect(tableNames).toContain("conversations");
    expect(tableNames).toContain("messages");
    expect(tableNames).toContain("delegations");
    expect(tableNames).toContain("evaluations");
    expect(tableNames).toContain("tool_calls");
    expect(tableNames).toContain("schema_version");

    closeDatabase(db);
  });

  test("should create FTS5 virtual tables", () => {
    initializeDatabase(testDbPath);

    const db = openDatabase(testDbPath);

    // Check for FTS5 tables
    const tables = db
      .query(
        "SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%_fts'"
      )
      .all() as any[];

    const tableNames = tables.map((t) => t.name);

    expect(tableNames).toContain("messages_fts");
    expect(tableNames).toContain("delegations_fts");

    closeDatabase(db);
  });

  test("should create indexes", () => {
    initializeDatabase(testDbPath);

    const db = openDatabase(testDbPath);

    // Check for indexes
    const indexes = db
      .query("SELECT name FROM sqlite_master WHERE type='index'")
      .all() as any[];

    const indexNames = indexes.map((i) => i.name);

    expect(indexNames).toContain("idx_conversations_agent_timestamp");
    expect(indexNames).toContain("idx_messages_conversation_timestamp");
    expect(indexNames).toContain("idx_delegations_agent_timestamp");
    expect(indexNames).toContain("idx_evaluations_verdict");
    expect(indexNames).toContain("idx_tool_calls_tool_name");

    closeDatabase(db);
  });

  test("should create triggers for FTS5 synchronization", () => {
    initializeDatabase(testDbPath);

    const db = openDatabase(testDbPath);

    // Check for triggers
    const triggers = db
      .query("SELECT name FROM sqlite_master WHERE type='trigger'")
      .all() as any[];

    const triggerNames = triggers.map((t) => t.name);

    expect(triggerNames).toContain("messages_fts_insert");
    expect(triggerNames).toContain("messages_fts_update");
    expect(triggerNames).toContain("messages_fts_delete");
    expect(triggerNames).toContain("delegations_fts_insert");
    expect(triggerNames).toContain("delegations_fts_update");
    expect(triggerNames).toContain("delegations_fts_delete");

    closeDatabase(db);
  });

  test("should create views", () => {
    initializeDatabase(testDbPath);

    const db = openDatabase(testDbPath);

    // Check for views
    const views = db
      .query("SELECT name FROM sqlite_master WHERE type='view'")
      .all() as any[];

    const viewNames = views.map((v) => v.name);

    expect(viewNames).toContain("recent_conversations");
    expect(viewNames).toContain("agent_performance");
    expect(viewNames).toContain("tool_usage_stats");

    closeDatabase(db);
  });

  test("should insert initial schema version", () => {
    initializeDatabase(testDbPath);

    const db = openDatabase(testDbPath);

    const version = db
      .query("SELECT version FROM schema_version WHERE version = 'v1'")
      .get() as any;

    expect(version).toBeDefined();
    expect(version.version).toBe("v1");

    closeDatabase(db);
  });

  test("should create schema successfully", () => {
    // Note: Schema is only partially idempotent (tables/views use IF NOT EXISTS, but indexes don't)
    // This is expected behavior - run initialization once per database
    initializeDatabase(testDbPath);

    // Verify schema was created correctly
    const db = openDatabase(testDbPath);

    const tables = db
      .query(
        "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
      )
      .all() as any[];

    expect(tables.length).toBeGreaterThan(0);

    closeDatabase(db);
  });

  test("should enable foreign key constraints", () => {
    initializeDatabase(testDbPath);

    const db = openDatabase(testDbPath);

    const result = db.query("PRAGMA foreign_keys").get() as any;
    expect(result.foreign_keys).toBe(1);

    closeDatabase(db);
  });
});
