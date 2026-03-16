/**
 * Retention Policy Enforcement for Maestro Memory System
 *
 * This module handles automated cleanup of old conversations based on
 * retention policy settings. Uses SQLite transactions for atomicity
 * and VACUUM to reclaim disk space.
 */

import { Database } from 'bun:sqlite';
import { PrivacyConfig } from '../memory/privacy-config';
import { statSync } from 'fs';

/**
 * Enforce retention policy by deleting conversations older than cutoff
 *
 * Deletes all conversations and related data (messages, delegations, evaluations,
 * tool calls) that are older than the configured retention period.
 *
 * Uses a transaction to ensure atomicity - either all deletions succeed or none do.
 * Maintains referential integrity by deleting child records first.
 * Runs VACUUM after deletion to reclaim disk space.
 *
 * @param db - Bun SQLite database instance
 * @param config - Privacy configuration with retentionDays setting
 * @returns Number of conversations deleted
 *
 * @example
 * ```typescript
 * const db = new Database('conversations.db');
 * const config = loadConfig();
 * const deleted = await enforceRetentionPolicy(db, config);
 * console.log(`Deleted ${deleted} old conversations`);
 * db.close();
 * ```
 */
export async function enforceRetentionPolicy(
  db: Database,
  config: PrivacyConfig
): Promise<number> {
  // Calculate cutoff timestamp (current time - retentionDays)
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - config.retentionDays);
  const cutoffTimestamp = cutoffDate.toISOString();

  console.log(`[retention] Enforcing retention policy: deleting conversations older than ${cutoffTimestamp}`);

  // Use transaction for atomic deletion
  const transaction = db.transaction(() => {
    // Get count before deletion (for reporting)
    const countResult = db.query('SELECT COUNT(*) as count FROM conversations WHERE timestamp < ?')
      .get(cutoffTimestamp) as { count: number };
    const conversationsToDelete = countResult.count;

    if (conversationsToDelete === 0) {
      console.log('[retention] No conversations to delete');
      return 0;
    }

    console.log(`[retention] Deleting ${conversationsToDelete} conversations and related data`);

    // Delete from child tables first (maintains referential integrity)
    // Order matters: delete from tables with foreign keys pointing to conversations

    // 1. Delete evaluations
    const evalResult = db.run(
      'DELETE FROM evaluations WHERE conversation_id IN (SELECT id FROM conversations WHERE timestamp < ?)',
      [cutoffTimestamp]
    );
    console.log(`[retention] Deleted ${evalResult.changes} evaluations`);

    // 2. Delete delegations
    const delegResult = db.run(
      'DELETE FROM delegations WHERE conversation_id IN (SELECT id FROM conversations WHERE timestamp < ?)',
      [cutoffTimestamp]
    );
    console.log(`[retention] Deleted ${delegResult.changes} delegations`);

    // 3. Delete tool calls
    const toolResult = db.run(
      'DELETE FROM tool_calls WHERE conversation_id IN (SELECT id FROM conversations WHERE timestamp < ?)',
      [cutoffTimestamp]
    );
    console.log(`[retention] Deleted ${toolResult.changes} tool calls`);

    // 4. Delete messages
    const msgResult = db.run(
      'DELETE FROM messages WHERE conversation_id IN (SELECT id FROM conversations WHERE timestamp < ?)',
      [cutoffTimestamp]
    );
    console.log(`[retention] Deleted ${msgResult.changes} messages`);

    // 5. Finally, delete from parent table (conversations)
    const convResult = db.run('DELETE FROM conversations WHERE timestamp < ?', [cutoffTimestamp]);
    console.log(`[retention] Deleted ${convResult.changes} conversations`);

    return conversationsToDelete;
  });

  // Execute transaction
  const deletedCount = transaction();

  // VACUUM database to reclaim space (only if we deleted something)
  if (deletedCount > 0) {
    console.log('[retention] Running VACUUM to reclaim disk space...');
    db.run('VACUUM');
    console.log('[retention] VACUUM complete');
  }

  return deletedCount;
}

/**
 * Get count of conversations older than retention policy
 *
 * Returns the number of conversations that would be deleted if
 * retention policy were enforced right now. Useful for reporting
 * and monitoring.
 *
 * @param db - Bun SQLite database instance
 * @param config - Privacy configuration with retentionDays setting
 * @returns Count of expired conversations
 *
 * @example
 * ```typescript
 * const db = new Database('conversations.db');
 * const config = loadConfig();
 * const count = getExpiredConversationCount(db, config);
 * console.log(`${count} conversations ready for cleanup`);
 * ```
 */
export function getExpiredConversationCount(
  db: Database,
  config: PrivacyConfig
): number {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - config.retentionDays);
  const cutoffTimestamp = cutoffDate.toISOString();

  const result = db.query('SELECT COUNT(*) as count FROM conversations WHERE timestamp < ?')
    .get(cutoffTimestamp) as { count: number };

  return result.count;
}

/**
 * Get database size in bytes
 *
 * Returns the current size of the database file on disk.
 * Useful for monitoring storage usage and measuring VACUUM effectiveness.
 *
 * @param dbPath - Absolute path to SQLite database file
 * @returns Size in bytes
 *
 * @example
 * ```typescript
 * const sizeBefore = getDatabaseSize('/path/to/db.sqlite');
 * await enforceRetentionPolicy(db, config);
 * const sizeAfter = getDatabaseSize('/path/to/db.sqlite');
 * console.log(`Reclaimed ${sizeBefore - sizeAfter} bytes`);
 * ```
 */
export function getDatabaseSize(dbPath: string): number {
  try {
    const stats = statSync(dbPath);
    return stats.size;
  } catch (error) {
    console.error(`[retention] Failed to get database size: ${error}`);
    return 0;
  }
}

/**
 * Get retention policy statistics
 *
 * Returns comprehensive statistics about the retention policy and
 * database state. Useful for monitoring and reporting.
 *
 * @param db - Bun SQLite database instance
 * @param config - Privacy configuration
 * @param dbPath - Path to database file (for size calculation)
 * @returns Retention statistics
 *
 * @example
 * ```typescript
 * const db = new Database(dbPath);
 * const stats = getRetentionStats(db, config, dbPath);
 * console.log(JSON.stringify(stats, null, 2));
 * ```
 */
export interface RetentionStats {
  retentionDays: number;
  cutoffDate: string;
  totalConversations: number;
  expiredConversations: number;
  activeConversations: number;
  databaseSizeBytes: number;
  databaseSizeMB: number;
  oldestConversation: string | null;
  newestConversation: string | null;
}

export function getRetentionStats(
  db: Database,
  config: PrivacyConfig,
  dbPath: string
): RetentionStats {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - config.retentionDays);
  const cutoffTimestamp = cutoffDate.toISOString();

  // Get total conversation count
  const totalResult = db.query('SELECT COUNT(*) as count FROM conversations')
    .get() as { count: number };

  // Get expired conversation count
  const expiredResult = db.query('SELECT COUNT(*) as count FROM conversations WHERE timestamp < ?')
    .get(cutoffTimestamp) as { count: number };

  // Get oldest conversation timestamp
  const oldestResult = db.query('SELECT MIN(timestamp) as oldest FROM conversations')
    .get() as { oldest: string | null };

  // Get newest conversation timestamp
  const newestResult = db.query('SELECT MAX(timestamp) as newest FROM conversations')
    .get() as { newest: string | null };

  // Get database size
  const sizeBytes = getDatabaseSize(dbPath);

  return {
    retentionDays: config.retentionDays,
    cutoffDate: cutoffTimestamp,
    totalConversations: totalResult.count,
    expiredConversations: expiredResult.count,
    activeConversations: totalResult.count - expiredResult.count,
    databaseSizeBytes: sizeBytes,
    databaseSizeMB: parseFloat((sizeBytes / (1024 * 1024)).toFixed(2)),
    oldestConversation: oldestResult.oldest,
    newestConversation: newestResult.newest,
  };
}

/**
 * Delete specific conversations by ID
 *
 * Deletes one or more conversations and all related data.
 * Useful for manual cleanup or privacy requests.
 *
 * @param db - Bun SQLite database instance
 * @param conversationIds - Array of conversation IDs to delete
 * @returns Number of conversations deleted
 *
 * @example
 * ```typescript
 * const db = new Database('conversations.db');
 * const deleted = deleteConversations(db, ['uuid-1', 'uuid-2']);
 * console.log(`Deleted ${deleted} conversations`);
 * ```
 */
export function deleteConversations(
  db: Database,
  conversationIds: string[]
): number {
  if (conversationIds.length === 0) {
    return 0;
  }

  console.log(`[retention] Deleting ${conversationIds.length} specific conversations`);

  const transaction = db.transaction(() => {
    let totalDeleted = 0;

    for (const conversationId of conversationIds) {
      // Delete child records first
      db.run('DELETE FROM evaluations WHERE conversation_id = ?', [conversationId]);
      db.run('DELETE FROM delegations WHERE conversation_id = ?', [conversationId]);
      db.run('DELETE FROM tool_calls WHERE conversation_id = ?', [conversationId]);
      db.run('DELETE FROM messages WHERE conversation_id = ?', [conversationId]);

      // Delete conversation
      const result = db.run('DELETE FROM conversations WHERE id = ?', [conversationId]);
      totalDeleted += result.changes;
    }

    return totalDeleted;
  });

  const deletedCount = transaction();

  // VACUUM to reclaim space
  if (deletedCount > 0) {
    console.log('[retention] Running VACUUM after manual deletion...');
    db.run('VACUUM');
  }

  return deletedCount;
}

/**
 * Delete conversations by agent name
 *
 * Deletes all conversations where the primary agent matches the given name.
 * Useful for privacy or cleanup operations targeting specific agents.
 *
 * @param db - Bun SQLite database instance
 * @param agentName - Name of the agent whose conversations to delete
 * @returns Number of conversations deleted
 *
 * @example
 * ```typescript
 * const db = new Database('conversations.db');
 * const deleted = deleteConversationsByAgent(db, 'file-writer');
 * console.log(`Deleted ${deleted} file-writer conversations`);
 * ```
 */
export function deleteConversationsByAgent(
  db: Database,
  agentName: string
): number {
  console.log(`[retention] Deleting all conversations for agent: ${agentName}`);

  const transaction = db.transaction(() => {
    // Get count before deletion
    const countResult = db.query('SELECT COUNT(*) as count FROM conversations WHERE primary_agent = ?')
      .get(agentName) as { count: number };

    if (countResult.count === 0) {
      return 0;
    }

    // Delete child records
    db.run('DELETE FROM evaluations WHERE conversation_id IN (SELECT id FROM conversations WHERE primary_agent = ?)', [agentName]);
    db.run('DELETE FROM delegations WHERE conversation_id IN (SELECT id FROM conversations WHERE primary_agent = ?)', [agentName]);
    db.run('DELETE FROM tool_calls WHERE conversation_id IN (SELECT id FROM conversations WHERE primary_agent = ?)', [agentName]);
    db.run('DELETE FROM messages WHERE conversation_id IN (SELECT id FROM conversations WHERE primary_agent = ?)', [agentName]);

    // Delete conversations
    const result = db.run('DELETE FROM conversations WHERE primary_agent = ?', [agentName]);
    return result.changes;
  });

  const deletedCount = transaction();

  // VACUUM to reclaim space
  if (deletedCount > 0) {
    console.log('[retention] Running VACUUM after agent-specific deletion...');
    db.run('VACUUM');
  }

  return deletedCount;
}
