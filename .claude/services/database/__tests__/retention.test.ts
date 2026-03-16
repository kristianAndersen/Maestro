/**
 * Tests for Retention Policy Enforcement
 */

import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { Database } from 'bun:sqlite';
import { unlinkSync, existsSync } from 'fs';
import { join } from 'path';
import {
  enforceRetentionPolicy,
  getExpiredConversationCount,
  getDatabaseSize,
  getRetentionStats,
  deleteConversations,
  deleteConversationsByAgent,
} from '../retention';
import type { PrivacyConfig } from '../../memory/privacy-config';

describe('retention', () => {
  const TEST_DB_PATH = join(process.cwd(), '.claude', 'services', 'database', '__tests__', 'test-retention.db');
  let db: Database;
  let testConfig: PrivacyConfig;

  beforeEach(() => {
    // Remove existing test database
    if (existsSync(TEST_DB_PATH)) {
      unlinkSync(TEST_DB_PATH);
    }

    // Create fresh database with schema
    db = new Database(TEST_DB_PATH);
    createSchema(db);

    // Default test config
    testConfig = {
      enabled: true,
      retentionDays: 30,
      sanitizeSecrets: true,
      sanitizePatterns: [],
      excludeAgents: [],
      excludeFiles: [],
      requireConsent: false,
    };
  });

  afterEach(() => {
    // Close database
    if (db) {
      db.close();
    }

    // Clean up test database
    if (existsSync(TEST_DB_PATH)) {
      unlinkSync(TEST_DB_PATH);
    }
  });

  describe('enforceRetentionPolicy', () => {
    it('deletes conversations older than retention period', async () => {
      // Insert test data
      const oldDate = getDateNDaysAgo(40).toISOString();
      const recentDate = getDateNDaysAgo(10).toISOString();

      insertTestConversation(db, 'old-conv-1', oldDate);
      insertTestConversation(db, 'old-conv-2', oldDate);
      insertTestConversation(db, 'recent-conv-1', recentDate);

      // Enforce policy (30 days)
      const deleted = await enforceRetentionPolicy(db, testConfig);

      // Should delete 2 old conversations
      expect(deleted).toBe(2);

      // Verify remaining conversations
      const remaining = db.query('SELECT COUNT(*) as count FROM conversations').get() as { count: number };
      expect(remaining.count).toBe(1);
    });

    it('preserves recent conversations', async () => {
      const recentDate = getDateNDaysAgo(5).toISOString();
      insertTestConversation(db, 'recent-conv-1', recentDate);
      insertTestConversation(db, 'recent-conv-2', recentDate);

      const deleted = await enforceRetentionPolicy(db, testConfig);

      expect(deleted).toBe(0);

      const remaining = db.query('SELECT COUNT(*) as count FROM conversations').get() as { count: number };
      expect(remaining.count).toBe(2);
    });

    it('deletes related child records (messages, delegations, evaluations, tool_calls)', async () => {
      const oldDate = getDateNDaysAgo(40).toISOString();
      const conversationId = 'old-conv-with-data';

      insertTestConversation(db, conversationId, oldDate);
      insertTestMessage(db, conversationId);
      insertTestDelegation(db, conversationId);
      insertTestEvaluation(db, conversationId);
      insertTestToolCall(db, conversationId);

      // Verify data exists
      expect(db.query('SELECT COUNT(*) as count FROM messages').get().count).toBe(1);
      expect(db.query('SELECT COUNT(*) as count FROM delegations').get().count).toBe(1);
      expect(db.query('SELECT COUNT(*) as count FROM evaluations').get().count).toBe(1);
      expect(db.query('SELECT COUNT(*) as count FROM tool_calls').get().count).toBe(1);

      // Enforce policy
      await enforceRetentionPolicy(db, testConfig);

      // Verify all related data deleted
      expect(db.query('SELECT COUNT(*) as count FROM conversations').get().count).toBe(0);
      expect(db.query('SELECT COUNT(*) as count FROM messages').get().count).toBe(0);
      expect(db.query('SELECT COUNT(*) as count FROM delegations').get().count).toBe(0);
      expect(db.query('SELECT COUNT(*) as count FROM evaluations').get().count).toBe(0);
      expect(db.query('SELECT COUNT(*) as count FROM tool_calls').get().count).toBe(0);
    });

    it('handles empty database', async () => {
      const deleted = await enforceRetentionPolicy(db, testConfig);
      expect(deleted).toBe(0);
    });

    it('handles database with no expired conversations', async () => {
      const recentDate = getDateNDaysAgo(10).toISOString();
      insertTestConversation(db, 'recent-1', recentDate);
      insertTestConversation(db, 'recent-2', recentDate);

      const deleted = await enforceRetentionPolicy(db, testConfig);
      expect(deleted).toBe(0);
    });

    it('respects different retention periods', async () => {
      const date20DaysAgo = getDateNDaysAgo(20).toISOString();
      const date40DaysAgo = getDateNDaysAgo(40).toISOString();

      insertTestConversation(db, 'conv-20', date20DaysAgo);
      insertTestConversation(db, 'conv-40', date40DaysAgo);

      // 30-day retention: should delete 40-day old only
      testConfig.retentionDays = 30;
      const deleted30 = await enforceRetentionPolicy(db, testConfig);
      expect(deleted30).toBe(1);

      // Reset database
      db.close();
      if (existsSync(TEST_DB_PATH)) {
        unlinkSync(TEST_DB_PATH);
      }
      db = new Database(TEST_DB_PATH);
      createSchema(db);

      insertTestConversation(db, 'conv-20', date20DaysAgo);
      insertTestConversation(db, 'conv-40', date40DaysAgo);

      // 15-day retention: should delete both
      testConfig.retentionDays = 15;
      const deleted15 = await enforceRetentionPolicy(db, testConfig);
      expect(deleted15).toBe(2);
    });
  });

  describe('getExpiredConversationCount', () => {
    it('returns count of expired conversations', () => {
      const oldDate = getDateNDaysAgo(40).toISOString();
      const recentDate = getDateNDaysAgo(10).toISOString();

      insertTestConversation(db, 'old-1', oldDate);
      insertTestConversation(db, 'old-2', oldDate);
      insertTestConversation(db, 'recent-1', recentDate);

      const count = getExpiredConversationCount(db, testConfig);
      expect(count).toBe(2);
    });

    it('returns 0 for empty database', () => {
      const count = getExpiredConversationCount(db, testConfig);
      expect(count).toBe(0);
    });

    it('returns 0 when no conversations expired', () => {
      const recentDate = getDateNDaysAgo(10).toISOString();
      insertTestConversation(db, 'recent-1', recentDate);

      const count = getExpiredConversationCount(db, testConfig);
      expect(count).toBe(0);
    });
  });

  describe('getDatabaseSize', () => {
    it('returns size in bytes', () => {
      const size = getDatabaseSize(TEST_DB_PATH);
      expect(size).toBeGreaterThan(0);
    });

    it('returns 0 for non-existent database', () => {
      const size = getDatabaseSize('/nonexistent/path/db.sqlite');
      expect(size).toBe(0);
    });

    it('size increases with data', async () => {
      const sizeBefore = getDatabaseSize(TEST_DB_PATH);

      // Insert significant amount of data to force database growth
      const date = new Date().toISOString();
      for (let i = 0; i < 100; i++) {
        insertTestConversation(db, `conv-${i}`, date);
        insertTestMessage(db, `conv-${i}`);
        insertTestDelegation(db, `conv-${i}`);
        insertTestEvaluation(db, `conv-${i}`);
      }

      // Force flush to disk
      db.close();
      await new Promise(resolve => setTimeout(resolve, 50));

      const sizeAfter = getDatabaseSize(TEST_DB_PATH);
      expect(sizeAfter).toBeGreaterThan(sizeBefore);

      // Reopen for cleanup
      db = new Database(TEST_DB_PATH);
    });
  });

  describe('getRetentionStats', () => {
    it('returns comprehensive statistics', () => {
      const oldDate = getDateNDaysAgo(40).toISOString();
      const recentDate = getDateNDaysAgo(10).toISOString();

      insertTestConversation(db, 'old-1', oldDate);
      insertTestConversation(db, 'old-2', oldDate);
      insertTestConversation(db, 'recent-1', recentDate);

      const stats = getRetentionStats(db, testConfig, TEST_DB_PATH);

      expect(stats.retentionDays).toBe(30);
      expect(stats.totalConversations).toBe(3);
      expect(stats.expiredConversations).toBe(2);
      expect(stats.activeConversations).toBe(1);
      expect(stats.databaseSizeBytes).toBeGreaterThan(0);
      expect(stats.databaseSizeMB).toBeGreaterThan(0);
      expect(stats.oldestConversation).toBe(oldDate);
      expect(stats.newestConversation).toBe(recentDate);
    });

    it('handles empty database', () => {
      const stats = getRetentionStats(db, testConfig, TEST_DB_PATH);

      expect(stats.totalConversations).toBe(0);
      expect(stats.expiredConversations).toBe(0);
      expect(stats.activeConversations).toBe(0);
      expect(stats.oldestConversation).toBeNull();
      expect(stats.newestConversation).toBeNull();
    });
  });

  describe('deleteConversations', () => {
    it('deletes specific conversations by ID', () => {
      const date = new Date().toISOString();
      insertTestConversation(db, 'conv-1', date);
      insertTestConversation(db, 'conv-2', date);
      insertTestConversation(db, 'conv-3', date);

      const deleted = deleteConversations(db, ['conv-1', 'conv-3']);

      expect(deleted).toBe(2);

      const remaining = db.query('SELECT id FROM conversations').all();
      expect(remaining.length).toBe(1);
      expect(remaining[0].id).toBe('conv-2');
    });

    it('handles empty array', () => {
      const deleted = deleteConversations(db, []);
      expect(deleted).toBe(0);
    });

    it('handles non-existent IDs', () => {
      const deleted = deleteConversations(db, ['non-existent-id']);
      expect(deleted).toBe(0);
    });

    it('deletes related child records', () => {
      const date = new Date().toISOString();
      insertTestConversation(db, 'conv-1', date);
      insertTestMessage(db, 'conv-1');
      insertTestDelegation(db, 'conv-1');

      deleteConversations(db, ['conv-1']);

      expect(db.query('SELECT COUNT(*) as count FROM messages').get().count).toBe(0);
      expect(db.query('SELECT COUNT(*) as count FROM delegations').get().count).toBe(0);
    });
  });

  describe('deleteConversationsByAgent', () => {
    it('deletes all conversations for specific agent', () => {
      const date = new Date().toISOString();
      insertTestConversation(db, 'conv-1', date, 'file-writer');
      insertTestConversation(db, 'conv-2', date, 'file-writer');
      insertTestConversation(db, 'conv-3', date, 'maestro');

      const deleted = deleteConversationsByAgent(db, 'file-writer');

      expect(deleted).toBe(2);

      const remaining = db.query('SELECT * FROM conversations').all();
      expect(remaining.length).toBe(1);
      expect(remaining[0].primary_agent).toBe('maestro');
    });

    it('returns 0 when agent has no conversations', () => {
      const deleted = deleteConversationsByAgent(db, 'non-existent-agent');
      expect(deleted).toBe(0);
    });

    it('deletes related child records', () => {
      const date = new Date().toISOString();
      insertTestConversation(db, 'conv-1', date, 'test-agent');
      insertTestMessage(db, 'conv-1');

      deleteConversationsByAgent(db, 'test-agent');

      expect(db.query('SELECT COUNT(*) as count FROM messages').get().count).toBe(0);
    });
  });
});

// Helper functions

function createSchema(db: Database): void {
  db.run(`
    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      timestamp TEXT NOT NULL,
      duration_ms INTEGER,
      message_count INTEGER,
      primary_agent TEXT,
      skills_used TEXT,
      files_modified TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      metadata TEXT,
      FOREIGN KEY (conversation_id) REFERENCES conversations(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS delegations (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL,
      message_id TEXT NOT NULL,
      agent_name TEXT NOT NULL,
      product TEXT NOT NULL,
      process TEXT NOT NULL,
      performance TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      FOREIGN KEY (conversation_id) REFERENCES conversations(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS evaluations (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL,
      message_id TEXT NOT NULL,
      verdict TEXT NOT NULL,
      product_score INTEGER,
      process_score INTEGER,
      performance_score INTEGER,
      refinement_needed TEXT,
      timestamp TEXT NOT NULL,
      FOREIGN KEY (conversation_id) REFERENCES conversations(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS tool_calls (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL,
      message_id TEXT NOT NULL,
      tool_name TEXT NOT NULL,
      parameters TEXT NOT NULL,
      result TEXT,
      success INTEGER NOT NULL,
      timestamp TEXT NOT NULL,
      FOREIGN KEY (conversation_id) REFERENCES conversations(id)
    )
  `);
}

function insertTestConversation(db: Database, id: string, timestamp: string, primaryAgent: string = 'test-agent'): void {
  db.run(
    'INSERT INTO conversations (id, timestamp, duration_ms, message_count, primary_agent) VALUES (?, ?, ?, ?, ?)',
    [id, timestamp, 300000, 5, primaryAgent]
  );
}

function insertTestMessage(db: Database, conversationId: string): void {
  const messageId = `msg-${conversationId}`;
  db.run(
    'INSERT INTO messages (id, conversation_id, role, content, timestamp) VALUES (?, ?, ?, ?, ?)',
    [messageId, conversationId, 'user', 'Test message', new Date().toISOString()]
  );
}

function insertTestDelegation(db: Database, conversationId: string): void {
  const delegationId = `del-${conversationId}`;
  const messageId = `msg-${conversationId}`;
  db.run(
    'INSERT INTO delegations (id, conversation_id, message_id, agent_name, product, process, performance, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [delegationId, conversationId, messageId, 'test-agent', 'Product', 'Process', 'Performance', new Date().toISOString()]
  );
}

function insertTestEvaluation(db: Database, conversationId: string): void {
  const evaluationId = `eval-${conversationId}`;
  const messageId = `msg-${conversationId}`;
  db.run(
    'INSERT INTO evaluations (id, conversation_id, message_id, verdict, timestamp) VALUES (?, ?, ?, ?, ?)',
    [evaluationId, conversationId, messageId, 'EXCELLENT', new Date().toISOString()]
  );
}

function insertTestToolCall(db: Database, conversationId: string): void {
  const toolCallId = `tool-${conversationId}`;
  const messageId = `msg-${conversationId}`;
  db.run(
    'INSERT INTO tool_calls (id, conversation_id, message_id, tool_name, parameters, success, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [toolCallId, conversationId, messageId, 'Read', '{}', 1, new Date().toISOString()]
  );
}

function getDateNDaysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}
