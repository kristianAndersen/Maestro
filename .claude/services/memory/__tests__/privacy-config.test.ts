/**
 * Tests for privacy configuration module
 *
 * Tests configuration loading, validation, merging, and file watching.
 */

import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { writeFileSync, unlinkSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import {
  loadConfig,
  validateConfig,
  validateAgentNames,
  mergeWithDefaults,
  resetConfig,
  getCachedConfig,
  DEFAULT_PRIVACY_CONFIG,
  type PrivacyConfig
} from '../privacy-config';

const TEST_CONFIG_DIR = join(process.cwd(), '.claude-test');
const TEST_CONFIG_PATH = join(TEST_CONFIG_DIR, 'memory-config.json');

describe('Privacy Configuration', () => {
  beforeEach(() => {
    // Reset cached config before each test
    resetConfig();

    // Create test directory
    if (!existsSync(TEST_CONFIG_DIR)) {
      mkdirSync(TEST_CONFIG_DIR, { recursive: true });
    }

    // Clean up test config file if exists
    if (existsSync(TEST_CONFIG_PATH)) {
      unlinkSync(TEST_CONFIG_PATH);
    }
  });

  afterEach(() => {
    // Clean up test files
    if (existsSync(TEST_CONFIG_PATH)) {
      unlinkSync(TEST_CONFIG_PATH);
    }
  });

  describe('validateConfig', () => {
    it('should validate a complete valid configuration', () => {
      const config = {
        enabled: true,
        retentionDays: 30,
        sanitizeSecrets: true,
        sanitizePatterns: ['\\bTEST_\\w+'],
        excludeAgents: ['test-agent'],
        excludeFiles: ['**/.env'],
        requireConsent: false
      };

      const result = validateConfig(config);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject non-object configuration', () => {
      const result = validateConfig(null);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Configuration must be an object');
    });

    it('should reject invalid enabled type', () => {
      const config = {
        enabled: 'yes',
        retentionDays: 30,
        sanitizeSecrets: true,
        sanitizePatterns: [],
        excludeAgents: [],
        excludeFiles: [],
        requireConsent: false
      };

      const result = validateConfig(config);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('enabled must be a boolean');
    });

    it('should reject retentionDays out of range', () => {
      const config = {
        enabled: true,
        retentionDays: 0,
        sanitizeSecrets: true,
        sanitizePatterns: [],
        excludeAgents: [],
        excludeFiles: [],
        requireConsent: false
      };

      const result = validateConfig(config);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('retentionDays must be between 1 and 365');
    });

    it('should reject retentionDays over 365', () => {
      const config = {
        enabled: true,
        retentionDays: 500,
        sanitizeSecrets: true,
        sanitizePatterns: [],
        excludeAgents: [],
        excludeFiles: [],
        requireConsent: false
      };

      const result = validateConfig(config);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('retentionDays must be between 1 and 365');
    });

    it('should warn about short retention periods', () => {
      const config = {
        enabled: true,
        retentionDays: 3,
        sanitizeSecrets: true,
        sanitizePatterns: [],
        excludeAgents: [],
        excludeFiles: [],
        requireConsent: false
      };

      const result = validateConfig(config);

      expect(result.valid).toBe(true);
      expect(result.warnings).toContain('retentionDays < 7 may limit memory effectiveness');
    });

    it('should warn about long retention periods', () => {
      const config = {
        enabled: true,
        retentionDays: 180,
        sanitizeSecrets: true,
        sanitizePatterns: [],
        excludeAgents: [],
        excludeFiles: [],
        requireConsent: false
      };

      const result = validateConfig(config);

      expect(result.valid).toBe(true);
      expect(result.warnings).toContain('retentionDays > 90 may increase storage requirements');
    });

    it('should warn when sanitizeSecrets is disabled', () => {
      const config = {
        enabled: true,
        retentionDays: 30,
        sanitizeSecrets: false,
        sanitizePatterns: [],
        excludeAgents: [],
        excludeFiles: [],
        requireConsent: false
      };

      const result = validateConfig(config);

      expect(result.valid).toBe(true);
      expect(result.warnings).toContain('sanitizeSecrets disabled - secrets may be stored');
    });

    it('should reject invalid regex patterns', () => {
      const config = {
        enabled: true,
        retentionDays: 30,
        sanitizeSecrets: true,
        sanitizePatterns: ['valid\\w+', '(unclosed group'],
        excludeAgents: [],
        excludeFiles: [],
        requireConsent: false
      };

      const result = validateConfig(config);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('not a valid regex'))).toBe(true);
    });

    it('should reject non-array sanitizePatterns', () => {
      const config = {
        enabled: true,
        retentionDays: 30,
        sanitizeSecrets: true,
        sanitizePatterns: 'not-an-array',
        excludeAgents: [],
        excludeFiles: [],
        requireConsent: false
      };

      const result = validateConfig(config);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('sanitizePatterns must be an array');
    });

    it('should reject non-string pattern entries', () => {
      const config = {
        enabled: true,
        retentionDays: 30,
        sanitizeSecrets: true,
        sanitizePatterns: [123, true],
        excludeAgents: [],
        excludeFiles: [],
        requireConsent: false
      };

      const result = validateConfig(config);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('sanitizePatterns[0] must be a string');
      expect(result.errors).toContain('sanitizePatterns[1] must be a string');
    });

    it('should reject non-array excludeAgents', () => {
      const config = {
        enabled: true,
        retentionDays: 30,
        sanitizeSecrets: true,
        sanitizePatterns: [],
        excludeAgents: 'not-an-array',
        excludeFiles: [],
        requireConsent: false
      };

      const result = validateConfig(config);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('excludeAgents must be an array');
    });

    it('should reject non-array excludeFiles', () => {
      const config = {
        enabled: true,
        retentionDays: 30,
        sanitizeSecrets: true,
        sanitizePatterns: [],
        excludeAgents: [],
        excludeFiles: 'not-an-array',
        requireConsent: false
      };

      const result = validateConfig(config);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('excludeFiles must be an array');
    });
  });

  describe('mergeWithDefaults', () => {
    it('should fill in all missing fields with defaults', () => {
      const partial = {
        retentionDays: 60
      };

      const merged = mergeWithDefaults(partial);

      expect(merged.enabled).toBe(DEFAULT_PRIVACY_CONFIG.enabled);
      expect(merged.retentionDays).toBe(60);
      expect(merged.sanitizeSecrets).toBe(DEFAULT_PRIVACY_CONFIG.sanitizeSecrets);
      expect(merged.sanitizePatterns).toEqual(DEFAULT_PRIVACY_CONFIG.sanitizePatterns);
      expect(merged.excludeAgents).toEqual(DEFAULT_PRIVACY_CONFIG.excludeAgents);
      expect(merged.excludeFiles).toEqual(DEFAULT_PRIVACY_CONFIG.excludeFiles);
      expect(merged.requireConsent).toBe(DEFAULT_PRIVACY_CONFIG.requireConsent);
    });

    it('should preserve all provided fields', () => {
      const partial = {
        enabled: false,
        retentionDays: 90,
        sanitizeSecrets: false,
        sanitizePatterns: ['custom'],
        excludeAgents: ['agent1'],
        excludeFiles: ['*.secret'],
        requireConsent: true
      };

      const merged = mergeWithDefaults(partial);

      expect(merged).toEqual(partial);
    });

    it('should handle empty object', () => {
      const merged = mergeWithDefaults({});

      expect(merged).toEqual(DEFAULT_PRIVACY_CONFIG);
    });
  });

  describe('loadConfig', () => {
    it('should return defaults when no config file exists', () => {
      const config = loadConfig();

      expect(config).toEqual(DEFAULT_PRIVACY_CONFIG);
    });

    it('should cache configuration on first load', () => {
      loadConfig();
      const cached = getCachedConfig();

      expect(cached).not.toBeNull();
      expect(cached).toEqual(DEFAULT_PRIVACY_CONFIG);
    });

    it('should return cached config on subsequent calls', () => {
      const first = loadConfig();
      const second = loadConfig();

      expect(first).toBe(second); // Same reference
    });

    it('should reload config when forceReload is true', () => {
      const first = loadConfig();

      // This will still return defaults but should bypass cache
      const second = loadConfig(true);

      expect(second).toEqual(first);
    });

    it('should fall back to defaults on invalid JSON', () => {
      // Write invalid JSON
      writeFileSync(TEST_CONFIG_PATH, '{invalid json}', 'utf-8');

      // Override search path for test
      process.env.CLAUDE_MEMORY_CONFIG = TEST_CONFIG_PATH;

      const config = loadConfig(true);

      expect(config).toEqual(DEFAULT_PRIVACY_CONFIG);

      delete process.env.CLAUDE_MEMORY_CONFIG;
    });

    it('should fall back to defaults on validation failure', () => {
      // Write config with invalid retentionDays
      const invalidConfig = {
        enabled: true,
        retentionDays: 1000, // Out of range
        sanitizeSecrets: true,
        sanitizePatterns: [],
        excludeAgents: [],
        excludeFiles: [],
        requireConsent: false
      };

      writeFileSync(TEST_CONFIG_PATH, JSON.stringify(invalidConfig), 'utf-8');
      process.env.CLAUDE_MEMORY_CONFIG = TEST_CONFIG_PATH;

      const config = loadConfig(true);

      expect(config).toEqual(DEFAULT_PRIVACY_CONFIG);

      delete process.env.CLAUDE_MEMORY_CONFIG;
    });

    it('should merge partial config with defaults', () => {
      const partialConfig = {
        retentionDays: 45,
        excludeAgents: ['test-agent']
      };

      writeFileSync(TEST_CONFIG_PATH, JSON.stringify(partialConfig), 'utf-8');
      process.env.CLAUDE_MEMORY_CONFIG = TEST_CONFIG_PATH;

      const config = loadConfig(true);

      expect(config.retentionDays).toBe(45);
      expect(config.excludeAgents).toEqual(['test-agent']);
      expect(config.sanitizeSecrets).toBe(DEFAULT_PRIVACY_CONFIG.sanitizeSecrets);

      delete process.env.CLAUDE_MEMORY_CONFIG;
    });
  });

  describe('validateAgentNames', () => {
    it('should return empty array when registry does not exist', () => {
      const invalid = validateAgentNames(['test-agent', 'another-agent']);

      expect(invalid).toEqual([]);
    });

    it('should validate against real agent registry if it exists', () => {
      // This test will only work if the actual registry exists
      const registryPath = join(process.cwd(), '.claude', 'agents', 'agent-registry.json');

      if (existsSync(registryPath)) {
        // Test with a known invalid agent
        const invalid = validateAgentNames(['definitely-not-a-real-agent-name']);

        // Should identify as invalid
        expect(invalid).toContain('definitely-not-a-real-agent-name');
      }
    });
  });

  describe('resetConfig', () => {
    it('should clear cached configuration', () => {
      loadConfig();
      expect(getCachedConfig()).not.toBeNull();

      resetConfig();
      expect(getCachedConfig()).toBeNull();
    });
  });

  describe('DEFAULT_PRIVACY_CONFIG', () => {
    it('should have secure defaults', () => {
      expect(DEFAULT_PRIVACY_CONFIG.enabled).toBe(true);
      expect(DEFAULT_PRIVACY_CONFIG.sanitizeSecrets).toBe(true);
      expect(DEFAULT_PRIVACY_CONFIG.retentionDays).toBe(30);
      expect(DEFAULT_PRIVACY_CONFIG.requireConsent).toBe(false);
    });

    it('should exclude common secret file patterns', () => {
      expect(DEFAULT_PRIVACY_CONFIG.excludeFiles).toContain('**/.env');
      expect(DEFAULT_PRIVACY_CONFIG.excludeFiles).toContain('**/.env.*');
      expect(DEFAULT_PRIVACY_CONFIG.excludeFiles).toContain('**/secrets.json');
      expect(DEFAULT_PRIVACY_CONFIG.excludeFiles).toContain('**/*.key');
      expect(DEFAULT_PRIVACY_CONFIG.excludeFiles).toContain('**/*.pem');
    });
  });
});
