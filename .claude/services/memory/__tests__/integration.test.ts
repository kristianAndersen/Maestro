/**
 * Integration tests for privacy controls
 *
 * Tests the complete privacy control flow: config loading + sanitization
 */

import { describe, it, expect, beforeEach } from 'bun:test';
import { loadConfig, resetConfig, DEFAULT_PRIVACY_CONFIG } from '../privacy-config';
import { sanitizeContent } from '../sanitizer';

describe('Privacy Controls Integration', () => {
  beforeEach(() => {
    resetConfig();
  });

  it('should load config and sanitize with default settings', () => {
    const config = loadConfig();
    const content = 'API Key: STRIPPED_TEST_KEY_1 Email: user@example.com';

    const result = sanitizeContent(content, config);

    expect(result.sanitized).not.toContain('STRIPPED_TEST_KEY_1');
    expect(result.sanitized).not.toContain('user@example.com');
    expect(result.foundSecrets.length).toBeGreaterThan(0);
  });

  it('should respect sanitization disabled setting', () => {
    const config = { ...DEFAULT_PRIVACY_CONFIG, sanitizeSecrets: false };
    const content = 'API Key: STRIPPED_TEST_KEY_1';

    const result = sanitizeContent(content, config);

    expect(result.sanitized).toBe(content);
    expect(result.foundSecrets).toHaveLength(0);
  });

  it('should apply custom patterns from config', () => {
    const config = {
      ...DEFAULT_PRIVACY_CONFIG,
      sanitizePatterns: ['ACME_SECRET_\\w+']
    };
    const content = 'Token: ACME_SECRET_ABC123';

    const result = sanitizeContent(content, config);

    expect(result.sanitized).toContain('[REDACTED:CUSTOM]');
    expect(result.sanitized).not.toContain('ACME_SECRET_ABC123');
    expect(result.foundSecrets).toContain('CUSTOM');
  });

  it('should handle real-world AWS credentials', () => {
    const config = loadConfig();
    const content = `
      export AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
      export AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
    `;

    const result = sanitizeContent(content, config);

    expect(result.sanitized).not.toContain('AKIAIOSFODNN7EXAMPLE');
    expect(result.sanitized).not.toContain('wJalrXUtnFEMI');
    expect(result.foundSecrets).toContain('AWS_KEY');
  });

  it('should handle JWT tokens correctly', () => {
    const config = loadConfig();
    const jwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
    const content = `Authorization: Bearer ${jwt}`;

    const result = sanitizeContent(content, config);

    expect(result.sanitized).toContain('[REDACTED:');
    expect(result.sanitized).not.toContain('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');
    expect(result.redactionCount).toBeGreaterThan(0);
  });

  it('should handle multiple secrets in conversation', () => {
    const config = loadConfig();
    const content = `
      User: I need help with my API.
      Assistant: Sure! What's your API key?
      User: It's STRIPPED_LIVE_KEY_1
      Assistant: I'll help you configure that.
      User: My email is john.doe@company.com
    `;

    const result = sanitizeContent(content, config);

    expect(result.sanitized).not.toContain('sk_live_');
    expect(result.sanitized).not.toContain('john.doe@company.com');
    expect(result.foundSecrets.length).toBeGreaterThan(1);
    expect(result.redactionCount).toBeGreaterThan(1);
  });

  it('should not redact normal conversation text', () => {
    const config = loadConfig();
    const content = `
      User: What is the weather today?
      Assistant: The weather is sunny with a high of 75 degrees.
      User: Thank you!
    `;

    const result = sanitizeContent(content, config);

    expect(result.sanitized).toBe(content);
    expect(result.foundSecrets).toHaveLength(0);
    expect(result.redactionCount).toBe(0);
  });

  it('should handle private keys correctly', () => {
    const config = loadConfig();
    const content = `-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA1234567890abcdefghij
klmnopqrstuvwxyz1234567890ABCDEFGHIJ
-----END RSA PRIVATE KEY-----`;

    const result = sanitizeContent(content, config);

    expect(result.sanitized).toContain('[REDACTED:PRIVATE_KEY]');
    expect(result.sanitized).not.toContain('BEGIN RSA PRIVATE KEY');
    expect(result.foundSecrets).toContain('PRIVATE_KEY');
  });

  it('should perform efficiently on large content', () => {
    const config = loadConfig();
    const largeContent = 'Normal conversation text. '.repeat(1000) +
      'API Key: STRIPPED_TEST_KEY_1';

    const startTime = Date.now();
    const result = sanitizeContent(largeContent, config);
    const duration = Date.now() - startTime;

    expect(duration).toBeLessThan(50); // Should be fast even on large content
    expect(result.sanitized).not.toContain('STRIPPED_TEST_KEY_1');
  });
});
