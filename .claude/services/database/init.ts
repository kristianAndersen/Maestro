/**
 * Database Initialization for Maestro Memory System
 *
 * This module handles database schema initialization by reading and executing
 * the schema.sql file. It is idempotent (safe to run multiple times).
 */

import { openDatabase, closeDatabase } from "./connection";
import { join } from "path";
import { readFileSync } from "fs";

/**
 * Initializes the database schema from schema.sql
 *
 * This function is idempotent - it can be safely run multiple times
 * because the schema uses IF NOT EXISTS clauses.
 *
 * Steps:
 * 1. Opens database connection
 * 2. Reads schema.sql from same directory
 * 3. Executes all SQL statements
 * 4. Closes connection
 *
 * @param dbPath - Absolute path to the SQLite database file
 * @throws Error if schema file cannot be read or SQL execution fails
 *
 * @example
 * ```typescript
 * initializeDatabase("/Users/me/.claude/memory/maestro.db");
 * ```
 */
export function initializeDatabase(dbPath: string): void {
  const db = openDatabase(dbPath);

  try {
    // Read schema.sql from the same directory as this file
    const schemaPath = join(import.meta.dir, "schema.sql");
    const schemaSQL = readFileSync(schemaPath, "utf-8");

    // Execute the entire schema (Bun SQLite supports multi-statement execution)
    db.exec(schemaSQL);

    console.log(`Database initialized successfully at: ${dbPath}`);
  } catch (error) {
    console.error("Failed to initialize database:", error);
    throw error;
  } finally {
    closeDatabase(db);
  }
}
