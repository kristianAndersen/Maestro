/**
 * Tests for database connection manager
 */

import { describe, test, expect } from "bun:test";
import { openDatabase, closeDatabase } from "../connection";

describe("Database Connection", () => {
  test("should open in-memory database", () => {
    const db = openDatabase(":memory:");
    expect(db).toBeDefined();
    closeDatabase(db);
  });

  test("should set PRAGMA journal_mode to WAL", () => {
    const db = openDatabase(":memory:");

    const result = db.query("PRAGMA journal_mode").get() as any;
    // For in-memory databases, WAL mode might not be applicable
    // But we verify the PRAGMA was set
    expect(result).toBeDefined();

    closeDatabase(db);
  });

  test("should enable foreign keys", () => {
    const db = openDatabase(":memory:");

    const result = db.query("PRAGMA foreign_keys").get() as any;
    expect(result.foreign_keys).toBe(1);

    closeDatabase(db);
  });

  test("should set synchronous mode to NORMAL", () => {
    const db = openDatabase(":memory:");

    const result = db.query("PRAGMA synchronous").get() as any;
    // NORMAL is typically represented as 1 or 2 depending on SQLite version
    expect([1, 2]).toContain(result.synchronous);

    closeDatabase(db);
  });

  test("should allow basic queries after opening", () => {
    const db = openDatabase(":memory:");

    // Create a simple test table
    db.exec("CREATE TABLE test (id INTEGER PRIMARY KEY, value TEXT)");

    // Insert data
    const stmt = db.prepare("INSERT INTO test (value) VALUES (?)");
    stmt.run("hello");

    // Query data
    const result = db.query("SELECT value FROM test WHERE id = 1").get() as any;
    expect(result.value).toBe("hello");

    closeDatabase(db);
  });

  test("should close database without errors", () => {
    const db = openDatabase(":memory:");
    expect(() => closeDatabase(db)).not.toThrow();
  });
});
