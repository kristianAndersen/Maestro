#!/usr/bin/env bun

/**
 * Memory Retention Cleanup Hook
 *
 * Runs once per day to enforce retention policy by deleting old conversations.
 * Triggered on PostToolUse event but rate-limited to daily execution.
 *
 * This hook:
 * - Checks if 24 hours have passed since last run
 * - Loads privacy configuration
 * - Enforces retention policy (deletes old conversations)
 * - Logs results to retention.log
 * - Updates last run timestamp
 *
 * Event: PostToolUse (but throttled to once per day)
 */

import { Database } from 'bun:sqlite';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync, mkdirSync, readFileSync, writeFileSync, appendFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const LAST_RUN_FILE = join(__dirname, '..', 'memory', '.last-retention-cleanup');
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Main execution function
 */
async function main() {
  try {
    // Check if we should run (once per day)
    if (!shouldRunCleanup()) {
      return; // Not time yet, exit silently
    }

    // Dynamically import TypeScript modules (only when cleanup actually runs)
    const { loadConfig } = await import('../services/memory/privacy-config.ts');
    const { enforceRetentionPolicy, getDatabaseSize } = await import('../services/database/retention.ts');

    console.log('[memory-retention] Starting daily retention cleanup');

    // Load privacy config
    const config = loadConfig();

    // If memory disabled or retention not configured, skip
    if (!config.enabled) {
      console.log('[memory-retention] Memory system disabled, skipping cleanup');
      updateLastRunTimestamp(); // set rate limit even when disabled
      return;
    }

    if (config.retentionDays <= 0) {
      console.log('[memory-retention] Retention policy not configured (retentionDays <= 0), skipping cleanup');
      return;
    }

    // Open database
    const dbPath = join(__dirname, '..', 'memory', 'conversations.db');
    if (!existsSync(dbPath)) {
      console.warn('[memory-retention] Database not found, skipping cleanup');
      updateLastRunTimestamp(); // prevent re-running until next day
      return;
    }

    const db = new Database(dbPath);

    // Get size before cleanup
    const sizeBefore = getDatabaseSize(dbPath);

    // Enforce retention policy
    const deletedCount = await enforceRetentionPolicy(db, config);

    // Close database
    db.close();

    // Get size after cleanup
    const sizeAfter = getDatabaseSize(dbPath);
    const spaceReclaimed = sizeBefore - sizeAfter;

    // Log results
    const logPath = join(__dirname, '..', 'logs', 'retention.log');
    const logEntry = `${new Date().toISOString()} | Deleted ${deletedCount} conversations | Reclaimed ${formatBytes(spaceReclaimed)} | Retention: ${config.retentionDays} days\n`;

    appendLog(logPath, logEntry);

    console.log(`[memory-retention] Cleanup complete: deleted ${deletedCount} conversations, reclaimed ${formatBytes(spaceReclaimed)}`);

    // Update last run timestamp
    updateLastRunTimestamp();

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('[memory-retention] Cleanup failed:', errorMsg);

    // Log error
    const logPath = join(__dirname, '..', 'logs', 'retention.log');
    const logEntry = `${new Date().toISOString()} | ERROR: ${errorMsg}\n`;
    try {
      appendLog(logPath, logEntry);
    } catch (logError) {
      // If we can't log, at least we tried
      console.error('[memory-retention] Failed to log error:', logError);
    }
  }
}

/**
 * Check if cleanup should run
 *
 * Returns true if:
 * - Last run file doesn't exist (never run before)
 * - 24 hours have passed since last run
 */
function shouldRunCleanup() {
  if (!existsSync(LAST_RUN_FILE)) {
    console.log('[memory-retention] No previous run detected, will execute cleanup');
    return true; // Never run before
  }

  try {
    const lastRunTimestamp = parseInt(readFileSync(LAST_RUN_FILE, 'utf-8'));
    const now = Date.now();
    const timeSinceLastRun = now - lastRunTimestamp;

    if (timeSinceLastRun >= ONE_DAY_MS) {
      console.log(`[memory-retention] Last run was ${formatDuration(timeSinceLastRun)} ago, will execute cleanup`);
      return true;
    } else {
      const timeUntilNext = ONE_DAY_MS - timeSinceLastRun;
      console.log(`[memory-retention] Last run was ${formatDuration(timeSinceLastRun)} ago, next run in ${formatDuration(timeUntilNext)}`);
      return false;
    }
  } catch (error) {
    console.warn('[memory-retention] Failed to read last run timestamp, will execute cleanup');
    return true; // If we can't read, assume we should run
  }
}

/**
 * Update last run timestamp
 */
function updateLastRunTimestamp() {
  const dir = join(__dirname, '..', 'memory');

  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  writeFileSync(LAST_RUN_FILE, String(Date.now()));
}

/**
 * Append entry to log file
 */
function appendLog(logPath, entry) {
  const logDir = join(__dirname, '..', 'logs');

  if (!existsSync(logDir)) {
    mkdirSync(logDir, { recursive: true });
  }

  appendFileSync(logPath, entry);
}

/**
 * Format bytes into human-readable string
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  if (bytes < 0) return '0 B'; // Handle negative (if size increased)

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Format milliseconds into human-readable duration
 */
function formatDuration(ms) {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));

  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return `${days}d ${remainingHours}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}

// Run main function
main().catch((error) => {
  console.error('[memory-retention] Unexpected error:', error);
  process.exit(1);
});
