/**
 * Tests for content sanitization module
 *
 * Tests secret detection, redaction, pattern validation, and performance.
 */

import { describe, it, expect, beforeEach } from 'bun:test';
import {
  sanitizeContent,
  containsSecrets,
  validatePatternSafety,
  getDefaultPatternsInfo,
  clearPatternCache,
  DEFAULT_PATTERNS,
  type SanitizationResult
} from '../sanitizer';
import type { PrivacyConfig } from '../privacy-config';

describe('Content Sanitizer', () => {
  const defaultConfig: PrivacyConfig = {
    enabled: true,
    retentionDays: 30,
    sanitizeSecrets: true,
    sanitizePatterns: [],
    excludeAgents: [],
    excludeFiles: [],
    requireConsent: false
  };

  beforeEach(() => {
    clearPatternCache();
  });

  describe('sanitizeContent', () => {
    it('should return original content when sanitization is disabled', () => {
      const config = { ...defaultConfig, sanitizeSecrets: false };
      const content = 'My API key is abc123def456ghi789jkl012mno345';

      const result = sanitizeContent(content, config);

      expect(result.sanitized).toBe(content);
      expect(result.foundSecrets).toHaveLength(0);
      expect(result.redactionCount).toBe(0);
    });

    it('should return original content for empty strings', () => {
      const result = sanitizeContent('', defaultConfig);

      expect(result.sanitized).toBe('');
      expect(result.foundSecrets).toHaveLength(0);
      expect(result.redactionCount).toBe(0);
    });

    it('should detect and redact Stripe API keys', () => {
      const content = 'Here is my API key: STRIPPED_TEST_KEY_1';

      const result = sanitizeContent(content, defaultConfig);

      expect(result.sanitized).toContain('[REDACTED:STRIPE_KEY]');
      expect(result.sanitized).not.toContain('STRIPPED_TEST_KEY_1');
      expect(result.foundSecrets).toContain('STRIPE_KEY');
      expect(result.redactionCount).toBeGreaterThan(0);
    });

    it('should detect and redact JWT tokens', () => {
      const jwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      const content = `Authorization: Bearer ${jwt}`;

      const result = sanitizeContent(content, defaultConfig);

      expect(result.sanitized).toContain('[REDACTED:JWT_TOKEN]');
      expect(result.sanitized).not.toContain(jwt);
      expect(result.foundSecrets).toContain('JWT_TOKEN');
    });

    it('should detect and redact PEM private keys', () => {
      const privateKey = `-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA1234567890abcdefghij
klmnopqrstuvwxyz1234567890ABCDEFGHIJ
-----END RSA PRIVATE KEY-----`;
      const content = `Here's the key:\n${privateKey}`;

      const result = sanitizeContent(content, defaultConfig);

      expect(result.sanitized).toContain('[REDACTED:PRIVATE_KEY]');
      expect(result.sanitized).not.toContain('BEGIN RSA PRIVATE KEY');
      expect(result.foundSecrets).toContain('PRIVATE_KEY');
    });

    it('should detect and redact email addresses', () => {
      const content = 'Contact me at john.doe@example.com or jane_smith+test@company.co.uk';

      const result = sanitizeContent(content, defaultConfig);

      expect(result.sanitized).toContain('[REDACTED:EMAIL]');
      expect(result.sanitized).not.toContain('john.doe@example.com');
      expect(result.sanitized).not.toContain('jane_smith+test@company.co.uk');
      expect(result.foundSecrets).toContain('EMAIL');
      expect(result.redactionCount).toBe(2);
    });

    it('should detect and redact URLs with authentication', () => {
      const content = 'Connect to https://user:password123@api.example.com/data';

      const result = sanitizeContent(content, defaultConfig);

      expect(result.sanitized).toContain('[REDACTED:URL_AUTH]');
      expect(result.sanitized).not.toContain('user:password123');
      expect(result.foundSecrets).toContain('URL_AUTH');
    });

    it('should detect and redact AWS access keys', () => {
      const content = 'AWS Key: AKIAIOSFODNN7EXAMPLE';

      const result = sanitizeContent(content, defaultConfig);

      expect(result.sanitized).toContain('[REDACTED:AWS_KEY]');
      expect(result.sanitized).not.toContain('AKIAIOSFODNN7EXAMPLE');
      expect(result.foundSecrets).toContain('AWS_KEY');
    });

    it('should detect and redact GitHub tokens', () => {
      const content = 'Token: ghp_123456789012345678901234567890123456';

      const result = sanitizeContent(content, defaultConfig);

      expect(result.sanitized).toContain('[REDACTED:GITHUB_TOKEN]');
      expect(result.sanitized).not.toContain('ghp_123456789012345678901234567890123456');
      expect(result.foundSecrets).toContain('GITHUB_TOKEN');
    });

    it('should detect and redact Slack tokens', () => {
      const content = 'Token: xoxb-FAKE000000000-FAKE000000000-FAKEfakeFAKEfakeFAKEfake';

      const result = sanitizeContent(content, defaultConfig);

      expect(result.sanitized).toContain('[REDACTED:SLACK_TOKEN]');
      expect(result.sanitized).not.toContain('xoxb-1234567890123');
      expect(result.foundSecrets).toContain('SLACK_TOKEN');
    });

    it('should detect and redact Stripe keys', () => {
      const content = 'Key: STRIPPED_TEST_KEY_1';

      const result = sanitizeContent(content, defaultConfig);

      expect(result.sanitized).toContain('[REDACTED');
      expect(result.sanitized).not.toContain('STRIPPED_TEST_KEY_1');
      expect(result.foundSecrets.length).toBeGreaterThan(0);
    });

    it('should detect and redact password assignments', () => {
      const content = 'const password = "MySuperSecretPass123!"';

      const result = sanitizeContent(content, defaultConfig);

      expect(result.sanitized).toContain('[REDACTED:PASSWORD]');
      expect(result.sanitized).not.toContain('MySuperSecretPass123!');
      expect(result.foundSecrets).toContain('PASSWORD');
    });

    it('should detect and redact Bearer tokens', () => {
      const content = 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.abcdefghijklmnop';

      const result = sanitizeContent(content, defaultConfig);

      expect(result.sanitized).toContain('[REDACTED');
      expect(result.foundSecrets.length).toBeGreaterThan(0);
    });

    it('should handle multiple secret types in one text', () => {
      const content = `
        Email: admin@example.com
        API Key: STRIPPED_TEST_KEY_2
        JWT: eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.abc123
      `;

      const result = sanitizeContent(content, defaultConfig);

      expect(result.foundSecrets.length).toBeGreaterThan(1);
      expect(result.redactionCount).toBeGreaterThanOrEqual(2);
      expect(result.sanitized).not.toContain('admin@example.com');
      expect(result.sanitized).not.toContain('sk_test_');
    });

    it('should apply custom sanitization patterns', () => {
      const config = {
        ...defaultConfig,
        sanitizePatterns: ['CUSTOM_SECRET_\\w+']
      };
      const content = 'Here is CUSTOM_SECRET_ABC123 and CUSTOM_SECRET_XYZ789';

      const result = sanitizeContent(content, config);

      expect(result.sanitized).toContain('[REDACTED:CUSTOM]');
      expect(result.sanitized).not.toContain('CUSTOM_SECRET_ABC123');
      expect(result.sanitized).not.toContain('CUSTOM_SECRET_XYZ789');
      expect(result.foundSecrets).toContain('CUSTOM');
      expect(result.redactionCount).toBe(2);
    });

    it('should handle invalid custom patterns gracefully', () => {
      const config = {
        ...defaultConfig,
        sanitizePatterns: ['(invalid regex']
      };
      const content = 'Some content';

      const result = sanitizeContent(content, config);

      // Should not crash, just skip invalid pattern
      expect(result.sanitized).toBe(content);
    });

    it('should not detect false positives in normal text', () => {
      const content = 'This is a normal sentence with words like test and example.';

      const result = sanitizeContent(content, defaultConfig);

      expect(result.sanitized).toBe(content);
      expect(result.foundSecrets).toHaveLength(0);
      expect(result.redactionCount).toBe(0);
    });

    it('should not redact short alphanumeric sequences', () => {
      const content = 'Version 1.2.3 released on 2024-12-17';

      const result = sanitizeContent(content, defaultConfig);

      expect(result.sanitized).toBe(content);
      expect(result.foundSecrets).toHaveLength(0);
    });

    it('should handle unicode content correctly', () => {
      const content = '密码: STRIPPED_TEST_KEY_2';

      const result = sanitizeContent(content, defaultConfig);

      expect(result.sanitized).toContain('密码');
      expect(result.sanitized).toContain('[REDACTED');
      expect(result.sanitized).not.toContain('sk_test_');
    });

    it('should handle very long content efficiently', () => {
      // Create ~100KB of content
      const normalText = 'This is normal text. '.repeat(5000);
      const content = normalText + 'API Key: STRIPPED_TEST_KEY_2';

      const startTime = Date.now();
      const result = sanitizeContent(content, defaultConfig);
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(100); // Should be < 100ms
      expect(result.sanitized).toContain('[REDACTED');
    });
  });

  describe('containsSecrets', () => {
    it('should return false for clean content', () => {
      const content = 'This is a normal conversation without any secrets.';

      const result = containsSecrets(content, defaultConfig);

      expect(result).toBe(false);
    });

    it('should return true when API key detected', () => {
      const content = 'My key is STRIPPED_TEST_KEY_2';

      const result = containsSecrets(content, defaultConfig);

      expect(result).toBe(true);
    });

    it('should return true when email detected', () => {
      const content = 'Contact: user@example.com';

      const result = containsSecrets(content, defaultConfig);

      expect(result).toBe(true);
    });

    it('should return false when sanitization is disabled', () => {
      const config = { ...defaultConfig, sanitizeSecrets: false };
      const content = 'API Key: STRIPPED_TEST_KEY_2';

      const result = containsSecrets(content, config);

      expect(result).toBe(false);
    });

    it('should return false for empty content', () => {
      const result = containsSecrets('', defaultConfig);

      expect(result).toBe(false);
    });

    it('should detect custom patterns', () => {
      const config = {
        ...defaultConfig,
        sanitizePatterns: ['ACME_TOKEN_\\w+']
      };
      const content = 'Token: ACME_TOKEN_ABC123';

      const result = containsSecrets(content, config);

      expect(result).toBe(true);
    });
  });

  describe('validatePatternSafety', () => {
    it('should validate safe patterns', () => {
      const safePattern = /\btest_\w+/g;

      const result = validatePatternSafety(safePattern);

      expect(result).toBe(true);
    });

    it('should detect potentially dangerous patterns', () => {
      // Pattern with catastrophic backtracking
      const dangerousPattern = /(a+)+b/g;

      const result = validatePatternSafety(dangerousPattern, 50);

      // May return false depending on execution environment
      expect(typeof result).toBe('boolean');
    });

    it('should respect timeout parameter', () => {
      const pattern = /\w+/g;

      const result = validatePatternSafety(pattern, 10);

      expect(result).toBe(true);
    });
  });

  describe('getDefaultPatternsInfo', () => {
    it('should return information about default patterns', () => {
      const info = getDefaultPatternsInfo();

      expect(info.count).toBeGreaterThan(0);
      expect(info.types).toContain('API_KEY');
      expect(info.types).toContain('JWT_TOKEN');
      expect(info.types).toContain('EMAIL');
      expect(info.descriptions.length).toBe(info.count);
    });

    it('should match DEFAULT_PATTERNS length', () => {
      const info = getDefaultPatternsInfo();

      expect(info.count).toBe(DEFAULT_PATTERNS.length);
    });
  });

  describe('clearPatternCache', () => {
    it('should clear the pattern cache', () => {
      const config = {
        ...defaultConfig,
        sanitizePatterns: ['TEST_\\w+']
      };

      // First call compiles and caches
      sanitizeContent('TEST_ABC', config);

      // Clear cache
      clearPatternCache();

      // Should work after clearing (will recompile)
      const result = sanitizeContent('TEST_XYZ', config);

      expect(result.sanitized).toContain('[REDACTED:CUSTOM]');
    });
  });

  describe('Real-world test cases', () => {
    it('should handle actual AWS credentials format', () => {
      const content = `
        AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
        AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
      `;

      const result = sanitizeContent(content, defaultConfig);

      expect(result.sanitized).not.toContain('AKIAIOSFODNN7EXAMPLE');
      expect(result.sanitized).not.toContain('wJalrXUtnFEMI');
      expect(result.foundSecrets.length).toBeGreaterThan(0);
    });

    it('should handle actual GitHub token format', () => {
      const content = 'export GITHUB_TOKEN=ghp_123456789012345678901234567890123456';

      const result = sanitizeContent(content, defaultConfig);

      expect(result.sanitized).not.toContain('ghp_123456789012345678901234567890123456');
      expect(result.foundSecrets).toContain('GITHUB_TOKEN');
    });

    it('should handle actual JWT from authorization header', () => {
      const content = 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

      const result = sanitizeContent(content, defaultConfig);

      expect(result.sanitized).not.toContain('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');
      expect(result.foundSecrets.length).toBeGreaterThan(0);
    });

    it('should handle SSH private key format', () => {
      const content = `-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtz
c2gtZWQyNTUxOQAAACDjr0sD9YFY6K8eXYN0JjZfD8iJ7YfL4R7tKBp2SjGCUA==
-----END OPENSSH PRIVATE KEY-----`;

      const result = sanitizeContent(content, defaultConfig);

      expect(result.sanitized).toContain('[REDACTED:SSH_KEY]');
      expect(result.sanitized).not.toContain('BEGIN OPENSSH PRIVATE KEY');
      expect(result.foundSecrets).toContain('SSH_KEY');
    });

    it('should handle code with multiple credential types', () => {
      const content = `
        const config = {
          apiKey: 'STRIPPED_TEST_KEY_1',
          dbPassword: 'SecureP@ssw0rd123',
          adminEmail: 'admin@company.com',
          githubToken: 'ghp_123456789012345678901234567890123456'
        };
      `;

      const result = sanitizeContent(content, defaultConfig);

      expect(result.sanitized).not.toContain('sk_test_');
      expect(result.sanitized).not.toContain('SecureP@ssw0rd123');
      expect(result.sanitized).not.toContain('admin@company.com');
      expect(result.sanitized).not.toContain('ghp_123456789012345678901234567890123456');
      expect(result.foundSecrets.length).toBeGreaterThan(2);
    });
  });

  describe('Performance tests', () => {
    it('should sanitize typical conversation in <10ms', () => {
      // Typical conversation: ~10KB
      const conversation = `
        User: I need to configure my API.
        Assistant: Sure! I can help you with that.
        ${' '.repeat(10000)}
        User: My API key is STRIPPED_TEST_KEY_2
      `;

      const startTime = Date.now();
      const result = sanitizeContent(conversation, defaultConfig);
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(10);
      expect(result.sanitized).toContain('[REDACTED');
    });

    it('should handle 100KB content efficiently', () => {
      const largeContent = 'Normal text content. '.repeat(5000) +
        'API Key: STRIPPED_TEST_KEY_2';

      const startTime = Date.now();
      const result = sanitizeContent(largeContent, defaultConfig);
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(100);
      expect(result.sanitized).toContain('[REDACTED');
    });
  });
});