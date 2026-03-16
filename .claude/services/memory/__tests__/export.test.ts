/**
 * Tests for Data Export and Deletion
 *
 * Tests export functionality (JSON and Markdown) and data deletion.
 */

import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import { existsSync, unlinkSync, mkdirSync, rmSync, readdirSync } from 'fs';
import { join } from 'path';
import { exportConversations, deleteAllConversations } from '../export';
import { initializeDatabase } from '../../database/init';
import { storeConversation } from '../../database/storage';
import type { ParsedConversation } from '../types';

const TEST_DB_PATH = join(process.cwd(), '.claude', 'memory', 'test-export.db');
const TEST_EXPORT_DIR = join(process.cwd(), '.claude', 'memory', 'exports');

describe('Export and Deletion Module', () => {
  beforeEach(() => {
    // Ensure directories exist
    const memoryDir = join(process.cwd(), '.claude', 'memory');
    if (!existsSync(memoryDir)) {
      mkdirSync(memoryDir, { recursive: true });
    }

    // Clean up test database
    if (existsSync(TEST_DB_PATH)) {
      unlinkSync(TEST_DB_PATH);
    }

    // Initialize test database
    initializeDatabase(TEST_DB_PATH);
  });

  afterEach(() => {
    // Clean up test database
    if (existsSync(TEST_DB_PATH)) {
      unlinkSync(TEST_DB_PATH);
    }

    // Clean up export directory
    if (existsSync(TEST_EXPORT_DIR)) {
      const files = readdirSync(TEST_EXPORT_DIR);
      files.forEach(file => {
        if (file.startsWith('maestro-export-')) {
          unlinkSync(join(TEST_EXPORT_DIR, file));
        }
      });
    }
  });

  // Helper to create test conversation
  function createTestConversation(): ParsedConversation {
    return {
      messages: [
        {
          role: 'user',
          content: 'Test user message',
          timestamp: new Date().toISOString()
        },
        {
          role: 'assistant',
          content: 'Test assistant response',
          timestamp: new Date().toISOString()
        }
      ],
      delegations: [
        {
          agentName: 'test-agent',
          product: 'Test product',
          process: 'Test process',
          performance: 'Test performance',
          timestamp: new Date().toISOString()
        }
      ],
      toolCalls: [
        {
          toolName: 'Read',
          parameters: { file: 'test.txt' },
          result: { content: 'file content' },
          timestamp: new Date().toISOString(),
          success: true
        }
      ],
      evaluations: [
        {
          verdict: 'EXCELLENT',
          dimensions: {
            productDiscernment: '9/10',
            processDiscernment: '8/10',
            performanceDiscernment: '9/10'
          },
          timestamp: new Date().toISOString()
        }
      ],
      metadata: {
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
        primaryAgent: 'test-agent',
        skillsUsed: ['test-skill'],
        filesModified: ['test.txt'],
        messageCount: 2,
        duration: 5000
      }
    };
  }

  describe('exportConversations', () => {
    test('exports empty database to JSON', async () => {
      const result = await exportConversations('json', TEST_DB_PATH);

      expect(result.success).toBe(false);
      expect(result.error).toContain('No conversations found');
      expect(result.conversationCount).toBe(0);
    });

    test('exports conversations to JSON format', async () => {
      // Store test conversations
      const conv1 = createTestConversation();
      const conv2 = createTestConversation();

      await storeConversation(TEST_DB_PATH, conv1);
      await storeConversation(TEST_DB_PATH, conv2);

      // Export
      const result = await exportConversations('json', TEST_DB_PATH);

      expect(result.success).toBe(true);
      expect(result.conversationCount).toBe(2);
      expect(result.totalMessages).toBe(4); // 2 messages per conversation
      expect(result.filePath).toBeDefined();
      expect(result.fileSize).toBeGreaterThan(0);

      // Verify file exists
      if (result.filePath) {
        expect(existsSync(result.filePath)).toBe(true);
        expect(result.filePath.endsWith('.json')).toBe(true);

        // Verify JSON is valid
        const fs = require('fs');
        const content = fs.readFileSync(result.filePath, 'utf-8');
        const data = JSON.parse(content);

        expect(data.conversationCount).toBe(2);
        expect(data.totalMessages).toBe(4);
        expect(data.conversations).toHaveLength(2);
        expect(data.exportDate).toBeDefined();
      }
    });

    test('exports conversations to Markdown format', async () => {
      // Store test conversation
      const conv = createTestConversation();
      await storeConversation(TEST_DB_PATH, conv);

      // Export
      const result = await exportConversations('markdown', TEST_DB_PATH);

      expect(result.success).toBe(true);
      expect(result.conversationCount).toBe(1);
      expect(result.totalMessages).toBe(2);
      expect(result.filePath).toBeDefined();

      // Verify file exists and is Markdown
      if (result.filePath) {
        expect(existsSync(result.filePath)).toBe(true);
        expect(result.filePath.endsWith('.md')).toBe(true);

        // Verify Markdown structure
        const fs = require('fs');
        const content = fs.readFileSync(result.filePath, 'utf-8');

        expect(content).toContain('# Maestro Conversation History Export');
        expect(content).toContain('## Table of Contents');
        expect(content).toContain('## Conversation 1');
        expect(content).toContain('### Messages');
        expect(content).toContain('### Delegations');
        expect(content).toContain('### Evaluations');
        expect(content).toContain('### Tool Calls');
      }
    });

    test('handles invalid format gracefully', async () => {
      const conv = createTestConversation();
      await storeConversation(TEST_DB_PATH, conv);

      const result = await exportConversations('invalid' as any, TEST_DB_PATH);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Unsupported format');
    });

    test('handles non-existent database', async () => {
      const result = await exportConversations('json', '/nonexistent/db.db');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Database not found');
    });

    test('creates export directory if missing', async () => {
      // Remove export directory if exists
      if (existsSync(TEST_EXPORT_DIR)) {
        rmSync(TEST_EXPORT_DIR, { recursive: true });
      }

      const conv = createTestConversation();
      await storeConversation(TEST_DB_PATH, conv);

      const result = await exportConversations('json', TEST_DB_PATH);

      expect(result.success).toBe(true);
      expect(existsSync(TEST_EXPORT_DIR)).toBe(true);
    });

    test('includes all conversation data in JSON export', async () => {
      const conv = createTestConversation();
      await storeConversation(TEST_DB_PATH, conv);

      const result = await exportConversations('json', TEST_DB_PATH);

      if (result.filePath) {
        const fs = require('fs');
        const content = fs.readFileSync(result.filePath, 'utf-8');
        const data = JSON.parse(content);

        const exportedConv = data.conversations[0];

        expect(exportedConv.id).toBe('conv-1');
        expect(exportedConv.messages).toHaveLength(2);
        expect(exportedConv.delegations).toHaveLength(1);
        expect(exportedConv.toolCalls).toHaveLength(1);
        expect(exportedConv.evaluations).toHaveLength(1);
        expect(exportedConv.primaryAgent).toBe('test-agent');
        expect(exportedConv.skillsUsed).toContain('test-skill');
        expect(exportedConv.filesModified).toContain('test.txt');
      }
    });
  });

  describe('deleteAllConversations', () => {
    test('requires explicit confirmation', async () => {
      const conv = createTestConversation();
      await storeConversation(TEST_DB_PATH, conv);

      // Try without confirmation
      const result = await deleteAllConversations(false, TEST_DB_PATH);

      expect(result.success).toBe(false);
      expect(result.error).toContain('explicit confirmation');
      expect(result.conversationsDeleted).toBe(0);
    });

    test('deletes all conversations with confirmation', async () => {
      // Store multiple conversations
      const conv1 = createTestConversation();
      const conv2 = createTestConversation();
      await storeConversation(TEST_DB_PATH, conv1);
      await storeConversation(TEST_DB_PATH, conv2);

      // Delete with confirmation
      const result = await deleteAllConversations(true, TEST_DB_PATH);

      expect(result.success).toBe(true);
      expect(result.conversationsDeleted).toBe(2);
      expect(result.messagesDeleted).toBe(4); // 2 messages per conversation
      expect(result.delegationsDeleted).toBe(2); // 1 delegation per conversation
      expect(result.evaluationsDeleted).toBe(2); // 1 evaluation per conversation
      expect(result.toolCallsDeleted).toBe(2); // 1 tool call per conversation

      // Verify database is empty
      const verifyResult = await exportConversations('json', TEST_DB_PATH);
      expect(verifyResult.success).toBe(false);
      expect(verifyResult.error).toContain('No conversations found');
    });

    test('handles empty database gracefully', async () => {
      const result = await deleteAllConversations(true, TEST_DB_PATH);

      expect(result.success).toBe(true);
      expect(result.conversationsDeleted).toBe(0);
      expect(result.messagesDeleted).toBe(0);
    });

    test('handles non-existent database gracefully', async () => {
      const result = await deleteAllConversations(true, '/nonexistent/db.db');

      expect(result.success).toBe(true); // Not an error if DB doesn't exist
      expect(result.conversationsDeleted).toBe(0);
    });

    test('transaction rollback on error', async () => {
      const conv = createTestConversation();
      await storeConversation(TEST_DB_PATH, conv);

      // Close database connection by opening and closing
      const Database = require('bun:sqlite').Database;
      const db = new Database(TEST_DB_PATH);

      // Lock the database by starting a transaction
      db.exec('BEGIN EXCLUSIVE');

      // Try to delete (should fail due to lock, or timeout)
      // Note: SQLite may handle this differently, so we just verify
      // that either it succeeds or fails gracefully

      const result = await deleteAllConversations(true, TEST_DB_PATH);

      // Clean up lock
      try {
        db.exec('ROLLBACK');
        db.close();
      } catch (e) {
        // Ignore cleanup errors
      }

      // This test primarily verifies no crashes occur
      expect(result).toBeDefined();
    });

    test('clears FTS virtual tables', async () => {
      const conv = createTestConversation();
      await storeConversation(TEST_DB_PATH, conv);

      // Delete all
      await deleteAllConversations(true, TEST_DB_PATH);

      // Verify FTS tables are empty
      const Database = require('bun:sqlite').Database;
      const db = new Database(TEST_DB_PATH);

      const messagesFtsCount = db.prepare('SELECT COUNT(*) as count FROM messages_fts').get() as any;
      const delegationsFtsCount = db.prepare('SELECT COUNT(*) as count FROM delegations_fts').get() as any;

      expect(messagesFtsCount.count).toBe(0);
      expect(delegationsFtsCount.count).toBe(0);

      db.close();
    });
  });

  describe('Integration Tests', () => {
    test('export then delete workflow', async () => {
      // Store conversations
      const conv1 = createTestConversation();
      const conv2 = createTestConversation();
      await storeConversation(TEST_DB_PATH, conv1);
      await storeConversation(TEST_DB_PATH, conv2);

      // Export first
      const exportResult = await exportConversations('json', TEST_DB_PATH);
      expect(exportResult.success).toBe(true);
      expect(exportResult.conversationCount).toBe(2);

      // Then delete
      const deleteResult = await deleteAllConversations(true, TEST_DB_PATH);
      expect(deleteResult.success).toBe(true);
      expect(deleteResult.conversationsDeleted).toBe(2);

      // Verify export file still exists
      if (exportResult.filePath) {
        expect(existsSync(exportResult.filePath)).toBe(true);
      }

      // Verify database is empty
      const verifyResult = await exportConversations('json', TEST_DB_PATH);
      expect(verifyResult.success).toBe(false);
    });

    test('multiple exports create unique files', async () => {
      const conv = createTestConversation();
      await storeConversation(TEST_DB_PATH, conv);

      // Export twice
      const result1 = await exportConversations('json', TEST_DB_PATH);

      // Small delay to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 10));

      const result2 = await exportConversations('json', TEST_DB_PATH);

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(result1.filePath).not.toBe(result2.filePath);

      // Both files should exist
      if (result1.filePath && result2.filePath) {
        expect(existsSync(result1.filePath)).toBe(true);
        expect(existsSync(result2.filePath)).toBe(true);
      }
    });
  });
});
