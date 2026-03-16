/**
 * Database Connection Manager for Maestro Memory System
 *
 * This module provides simple helper functions for opening and closing
 * SQLite database connections using Bun's built-in SQLite support.
 *
 * Key features:
 * - WAL mode for concurrent reads and writes
 * - NORMAL synchronous mode for performance without sacrificing durability
 * - Foreign key enforcement enabled
 * - Performance optimizations for read-heavy workloads
 */

import { Database } from "bun:sqlite";

/**
 * Opens a SQLite database connection with optimized settings
 *
 * PRAGMA settings applied:
 * - journal_mode=WAL: Write-Ahead Logging for better concurrency
 * - synchronous=NORMAL: Good balance of performance and safety
 * - foreign_keys=ON: Enforce referential integrity
 *
 * Performance optimizations:
 * - cache_size=-64000: 64MB page cache for frequently accessed data
 * - temp_store=MEMORY: Store temporary tables and indexes in memory
 * - mmap_size=30000000000: Memory-mapped I/O for faster reads (30GB)
 *
 * @param dbPath - Absolute path to the SQLite database file (or ":memory:" for in-memory)
 * @returns Database instance ready for queries
 * @throws Error if database cannot be opened
 *
 * @example
 * ```typescript
 * const db = openDatabase("/path/to/maestro.db");
 * // Use database...
 * closeDatabase(db);
 * ```
 */
export function openDatabase(dbPath: string): Database {
  const db = new Database(dbPath);

  // Enable WAL mode for better concurrency (readers don't block writers)
  db.exec("PRAGMA journal_mode = WAL;");

  // Set synchronous to NORMAL (good performance while maintaining durability)
  db.exec("PRAGMA synchronous = NORMAL;");

  // Enable foreign key constraints
  db.exec("PRAGMA foreign_keys = ON;");

  // Performance optimization: Increase page cache to 64MB
  // Negative value means cache size in KB (-64000 = 64MB)
  // This keeps frequently accessed pages in memory for faster queries
  db.exec("PRAGMA cache_size = -64000;");

  // Performance optimization: Store temporary tables/indexes in memory
  // Reduces disk I/O for operations like sorting, grouping, and temp views
  db.exec("PRAGMA temp_store = MEMORY;");

  // Performance optimization: Enable memory-mapped I/O for faster reads
  // Maps database file into process memory space (30GB limit)
  // Significantly speeds up read operations on larger databases
  db.exec("PRAGMA mmap_size = 30000000000;");

  return db;
}

/**
 * Closes a SQLite database connection
 *
 * Always call this when done with the database to ensure all
 * changes are flushed and resources are released.
 *
 * @param db - Database instance to close
 *
 * @example
 * ```typescript
 * const db = openDatabase("/path/to/maestro.db");
 * try {
 *   // Use database...
 * } finally {
 *   closeDatabase(db);
 * }
 * ```
 */
export function closeDatabase(db: Database): void {
  db.close();
}
