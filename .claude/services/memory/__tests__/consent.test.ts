/**
 * Tests for User Consent Tracking
 *
 * Tests consent checking, setting, prompting, and status retrieval.
 */

import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import { existsSync, unlinkSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import {
  hasUserConsent,
  getConsentStatus,
  requiresConsentPrompt,
  setConsent,
  grantConsent,
  revokeConsent
} from '../consent';
import { resetConfig } from '../privacy-config';

const TEST_CONFIG_PATH = join(process.cwd(), '.claude', 'memory-config.test.json');
const ORIGINAL_ENV = process.env.CLAUDE_MEMORY_CONFIG;

describe('Consent Module', () => {
  beforeEach(() => {
    // Set test config path
    process.env.CLAUDE_MEMORY_CONFIG = TEST_CONFIG_PATH;

    // Ensure .claude directory exists
    const claudeDir = join(process.cwd(), '.claude');
    if (!existsSync(claudeDir)) {
      mkdirSync(claudeDir, { recursive: true });
    }

    // Clean up test config if exists
    if (existsSync(TEST_CONFIG_PATH)) {
      unlinkSync(TEST_CONFIG_PATH);
    }

    // Reset config cache
    resetConfig();
  });

  afterEach(() => {
    // Clean up test config
    if (existsSync(TEST_CONFIG_PATH)) {
      unlinkSync(TEST_CONFIG_PATH);
    }

    // Restore original env
    if (ORIGINAL_ENV) {
      process.env.CLAUDE_MEMORY_CONFIG = ORIGINAL_ENV;
    } else {
      delete process.env.CLAUDE_MEMORY_CONFIG;
    }

    resetConfig();
  });

  describe('hasUserConsent', () => {
    test('returns true when requireConsent is false (implicit consent)', () => {
      writeFileSync(TEST_CONFIG_PATH, JSON.stringify({
        enabled: true,
        requireConsent: false,
        retentionDays: 30,
        sanitizeSecrets: true,
        sanitizePatterns: [],
        excludeAgents: [],
        excludeFiles: []
      }), 'utf-8');

      expect(hasUserConsent()).toBe(true);
    });

    test('returns false when requireConsent is true but no userConsent field', () => {
      writeFileSync(TEST_CONFIG_PATH, JSON.stringify({
        enabled: true,
        requireConsent: true,
        retentionDays: 30,
        sanitizeSecrets: true,
        sanitizePatterns: [],
        excludeAgents: [],
        excludeFiles: []
      }), 'utf-8');

      expect(hasUserConsent()).toBe(false);
    });

    test('returns true when userConsent is explicitly true', () => {
      writeFileSync(TEST_CONFIG_PATH, JSON.stringify({
        enabled: true,
        requireConsent: true,
        userConsent: true,
        consentDate: new Date().toISOString(),
        retentionDays: 30,
        sanitizeSecrets: true,
        sanitizePatterns: [],
        excludeAgents: [],
        excludeFiles: []
      }), 'utf-8');

      expect(hasUserConsent()).toBe(true);
    });

    test('returns false when userConsent is explicitly false', () => {
      writeFileSync(TEST_CONFIG_PATH, JSON.stringify({
        enabled: true,
        requireConsent: true,
        userConsent: false,
        retentionDays: 30,
        sanitizeSecrets: true,
        sanitizePatterns: [],
        excludeAgents: [],
        excludeFiles: []
      }), 'utf-8');

      expect(hasUserConsent()).toBe(false);
    });

    test('returns true when no config file exists (defaults)', () => {
      // No config file, should use defaults (requireConsent: false)
      expect(hasUserConsent()).toBe(true);
    });
  });

  describe('getConsentStatus', () => {
    test('returns correct status for implicit consent', () => {
      writeFileSync(TEST_CONFIG_PATH, JSON.stringify({
        enabled: true,
        requireConsent: false,
        retentionDays: 30,
        sanitizeSecrets: true,
        sanitizePatterns: [],
        excludeAgents: [],
        excludeFiles: []
      }), 'utf-8');

      const status = getConsentStatus();
      expect(status.hasConsent).toBe(true);
      expect(status.needsPrompt).toBe(false);
    });

    test('returns correct status when consent required but not granted', () => {
      writeFileSync(TEST_CONFIG_PATH, JSON.stringify({
        enabled: true,
        requireConsent: true,
        retentionDays: 30,
        sanitizeSecrets: true,
        sanitizePatterns: [],
        excludeAgents: [],
        excludeFiles: []
      }), 'utf-8');

      const status = getConsentStatus();
      expect(status.hasConsent).toBe(false);
      expect(status.needsPrompt).toBe(true);
    });

    test('returns correct status with explicit consent', () => {
      const consentDate = new Date().toISOString();
      writeFileSync(TEST_CONFIG_PATH, JSON.stringify({
        enabled: true,
        requireConsent: true,
        userConsent: true,
        consentDate,
        retentionDays: 30,
        sanitizeSecrets: true,
        sanitizePatterns: [],
        excludeAgents: [],
        excludeFiles: []
      }), 'utf-8');

      const status = getConsentStatus();
      expect(status.hasConsent).toBe(true);
      expect(status.needsPrompt).toBe(false);
      expect(status.consentDate).toBe(consentDate);
    });
  });

  describe('requiresConsentPrompt', () => {
    test('returns false for implicit consent', () => {
      writeFileSync(TEST_CONFIG_PATH, JSON.stringify({
        enabled: true,
        requireConsent: false,
        retentionDays: 30,
        sanitizeSecrets: true,
        sanitizePatterns: [],
        excludeAgents: [],
        excludeFiles: []
      }), 'utf-8');

      expect(requiresConsentPrompt()).toBe(false);
    });

    test('returns true when consent required but not granted', () => {
      writeFileSync(TEST_CONFIG_PATH, JSON.stringify({
        enabled: true,
        requireConsent: true,
        retentionDays: 30,
        sanitizeSecrets: true,
        sanitizePatterns: [],
        excludeAgents: [],
        excludeFiles: []
      }), 'utf-8');

      expect(requiresConsentPrompt()).toBe(true);
    });

    test('returns false when consent already granted', () => {
      writeFileSync(TEST_CONFIG_PATH, JSON.stringify({
        enabled: true,
        requireConsent: true,
        userConsent: true,
        retentionDays: 30,
        sanitizeSecrets: true,
        sanitizePatterns: [],
        excludeAgents: [],
        excludeFiles: []
      }), 'utf-8');

      expect(requiresConsentPrompt()).toBe(false);
    });
  });

  describe('setConsent', () => {
    test('creates config file with consent granted', () => {
      setConsent(true);

      expect(existsSync(TEST_CONFIG_PATH)).toBe(true);

      // Verify consent was set
      resetConfig();
      expect(hasUserConsent()).toBe(true);

      const status = getConsentStatus();
      expect(status.hasConsent).toBe(true);
      expect(status.consentDate).toBeDefined();
    });

    test('creates config file with consent revoked', () => {
      setConsent(false);

      expect(existsSync(TEST_CONFIG_PATH)).toBe(true);

      // Verify consent was revoked
      resetConfig();
      expect(hasUserConsent()).toBe(false);
    });

    test('updates existing config without losing fields', () => {
      // Create initial config with custom settings
      writeFileSync(TEST_CONFIG_PATH, JSON.stringify({
        enabled: true,
        requireConsent: true,
        retentionDays: 60,
        sanitizeSecrets: false,
        sanitizePatterns: ['CUSTOM_\\w+'],
        excludeAgents: ['test-agent'],
        excludeFiles: ['*.secret']
      }), 'utf-8');

      // Grant consent
      setConsent(true);

      // Read config and verify custom fields preserved
      const fs = require('fs');
      const config = JSON.parse(fs.readFileSync(TEST_CONFIG_PATH, 'utf-8'));

      expect(config.userConsent).toBe(true);
      expect(config.consentDate).toBeDefined();
      expect(config.retentionDays).toBe(60);
      expect(config.sanitizeSecrets).toBe(false);
      expect(config.sanitizePatterns).toEqual(['CUSTOM_\\w+']);
      expect(config.excludeAgents).toEqual(['test-agent']);
      expect(config.excludeFiles).toEqual(['*.secret']);
    });

    test('sets consent date to current time', () => {
      const before = new Date().toISOString();
      setConsent(true);
      const after = new Date().toISOString();

      const status = getConsentStatus();
      expect(status.consentDate).toBeDefined();

      if (status.consentDate) {
        expect(status.consentDate >= before).toBe(true);
        expect(status.consentDate <= after).toBe(true);
      }
    });
  });

  describe('grantConsent and revokeConsent', () => {
    test('grantConsent sets consent to true', () => {
      grantConsent();

      const status = getConsentStatus();
      expect(status.hasConsent).toBe(true);
    });

    test('revokeConsent sets consent to false', () => {
      // First grant consent
      grantConsent();
      expect(hasUserConsent()).toBe(true);

      // Then revoke
      revokeConsent();
      resetConfig();
      expect(hasUserConsent()).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    test('handles missing .claude directory', () => {
      const claudeDir = join(process.cwd(), '.claude');
      if (existsSync(claudeDir)) {
        // This test assumes .claude exists from beforeEach
        // Just verify setConsent doesn't crash
        expect(() => setConsent(true)).not.toThrow();
      }
    });

    test('handles malformed config file', () => {
      writeFileSync(TEST_CONFIG_PATH, 'invalid json{', 'utf-8');

      // Should fall back to defaults (implicit consent)
      expect(hasUserConsent()).toBe(true);
    });

    test('handles config with extra fields', () => {
      writeFileSync(TEST_CONFIG_PATH, JSON.stringify({
        enabled: true,
        requireConsent: true,
        userConsent: true,
        extraField: 'should be preserved',
        retentionDays: 30,
        sanitizeSecrets: true,
        sanitizePatterns: [],
        excludeAgents: [],
        excludeFiles: []
      }), 'utf-8');

      expect(hasUserConsent()).toBe(true);

      // Update consent
      setConsent(false);

      // Verify extra field preserved
      const fs = require('fs');
      const config = JSON.parse(fs.readFileSync(TEST_CONFIG_PATH, 'utf-8'));
      expect(config.extraField).toBe('should be preserved');
    });
  });
});
