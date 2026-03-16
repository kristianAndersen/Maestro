/**
 * Content sanitization for claude-mem integration
 *
 * This module provides comprehensive secret detection and sanitization
 * capabilities to prevent sensitive data from being stored in memory.
 * Implements pattern-based detection with performance optimizations.
 */

import type { PrivacyConfig } from './privacy-config.js';

/**
 * Secret type identifiers for redaction messages
 */
export type SecretType =
  | 'API_KEY'
  | 'JWT_TOKEN'
  | 'PRIVATE_KEY'
  | 'EMAIL'
  | 'URL_AUTH'
  | 'AWS_KEY'
  | 'PASSWORD'
  | 'BEARER_TOKEN'
  | 'GITHUB_TOKEN'
  | 'SLACK_TOKEN'
  | 'STRIPE_KEY'
  | 'SSH_KEY'
  | 'CUSTOM';

/**
 * Pattern definition for secret detection
 *
 * @property name - Human-readable name of the secret type
 * @property type - SecretType identifier for redaction messages
 * @property pattern - Regex pattern to detect the secret
 * @property description - Description of what this pattern detects
 */
export interface SanitizationPattern {
  name: string;
  type: SecretType;
  pattern: RegExp;
  description: string;
}

/**
 * Result of sanitization operation
 *
 * @property sanitized - The sanitized content with secrets redacted
 * @property foundSecrets - List of secret types that were detected and redacted
 * @property redactionCount - Total number of redactions made
 */
export interface SanitizationResult {
  sanitized: string;
  foundSecrets: SecretType[];
  redactionCount: number;
}

/**
 * Default sanitization patterns
 *
 * Comprehensive set of patterns to detect common secret types.
 * Patterns are ordered from most specific to least specific to avoid
 * false matches. More specific patterns (JWT, GitHub tokens) are checked
 * before generic patterns (generic API keys).
 */
export const DEFAULT_PATTERNS: SanitizationPattern[] = [
  // PRIVATE KEYS (most specific, multi-line patterns)
  {
    name: 'SSH Private Key',
    type: 'SSH_KEY',
    pattern: /-----BEGIN OPENSSH PRIVATE KEY-----[\s\S]*?-----END OPENSSH PRIVATE KEY-----/g,
    description: 'OpenSSH private key format'
  },
  {
    name: 'Private Key (PEM)',
    type: 'PRIVATE_KEY',
    pattern: /-----BEGIN[ A-Z]*PRIVATE KEY-----[\s\S]*?-----END[ A-Z]*PRIVATE KEY-----/g,
    description: 'PEM-formatted private keys (RSA, EC, etc.)'
  },

  // AUTHENTICATION TOKENS (highly specific formats)
  {
    name: 'JWT Token',
    type: 'JWT_TOKEN',
    pattern: /\beyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g,
    description: 'JSON Web Tokens (JWT)'
  },
  {
    name: 'Bearer Token',
    type: 'BEARER_TOKEN',
    pattern: /\bBearer\s+eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/gi,
    description: 'Bearer tokens in Authorization headers'
  },

  // SERVICE-SPECIFIC TOKENS (with prefixes/patterns)
  {
    name: 'GitHub Token',
    type: 'GITHUB_TOKEN',
    pattern: /\bgh[pousr]_[A-Za-z0-9]{36,}\b/g,
    description: 'GitHub personal access tokens'
  },
  {
    name: 'Slack Token',
    type: 'SLACK_TOKEN',
    pattern: /\bxox[baprs]-[0-9]{10,13}-[0-9]{10,13}-[A-Za-z0-9]{24,}\b/g,
    description: 'Slack API tokens'
  },
  {
    name: 'Stripe Key',
    type: 'STRIPE_KEY',
    pattern: /\b(sk|pk)_(test|live)_[A-Za-z0-9]{24,}\b/g,
    description: 'Stripe API keys'
  },
  {
    name: 'AWS Access Key',
    type: 'AWS_KEY',
    pattern: /\b(AKIA[0-9A-Z]{16})\b/g,
    description: 'AWS Access Key ID'
  },

  // URLS AND EMAILS (common patterns)
  {
    name: 'URL with Authentication',
    type: 'URL_AUTH',
    pattern: /(https?:\/\/[^/\s:]+:[^@\s]+@[^\s]+)/g,
    description: 'URLs containing username:password'
  },
  {
    name: 'Email Address',
    type: 'EMAIL',
    pattern: /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/g,
    description: 'Email addresses'
  },

  // PASSWORD ASSIGNMENTS (context-specific)
  {
    name: 'Password in Assignment',
    type: 'PASSWORD',
    pattern: /(password|passwd|pwd)\s*[=:]\s*['"]([^'"]{8,})['"]/gi,
    description: 'Password values in variable assignments'
  },

  // GENERIC PATTERNS (least specific, checked last)
  {
    name: 'AWS Secret Key',
    type: 'AWS_KEY',
    pattern: /\b[A-Za-z0-9/+=]{40}\b/g,
    description: 'AWS Secret Access Key (40 character base64)'
  },
  {
    name: 'Generic API Key',
    type: 'API_KEY',
    pattern: /\b(sk|pk|api|key)_[A-Za-z0-9_-]{32,}\b/gi,
    description: 'Generic API keys with common prefixes (sk_, pk_, api_, key_)'
  }
];

/**
 * Compiled pattern cache to avoid recompiling regexes
 */
const patternCache = new Map<string, RegExp>();

/**
 * Compiles and caches custom patterns
 *
 * Takes string patterns from configuration and compiles them into
 * RegExp objects. Caches compiled patterns for performance.
 *
 * @param patterns - Array of regex pattern strings
 * @returns Array of compiled RegExp objects
 */
function compileCustomPatterns(patterns: string[]): RegExp[] {
  const compiled: RegExp[] = [];

  for (const patternStr of patterns) {
    let regex = patternCache.get(patternStr);

    if (!regex) {
      try {
        // Ensure global flag for replacement
        regex = new RegExp(patternStr, 'g');
        patternCache.set(patternStr, regex);
      } catch (error) {
        console.error(`Invalid custom sanitization pattern: ${patternStr}`, error);
        continue;
      }
    }

    compiled.push(regex);
  }

  return compiled;
}

/**
 * Sanitizes content by detecting and redacting secrets
 *
 * Scans content using default patterns and custom patterns from configuration.
 * Replaces detected secrets with [REDACTED:<TYPE>] markers.
 * Patterns are applied in order from most specific to least specific.
 *
 * Performance: Optimized for <10ms on typical conversation content (~10KB).
 * Uses compiled regex patterns and early exits when sanitization is disabled.
 *
 * @param content - Content to sanitize (conversation text, file contents, etc.)
 * @param config - Privacy configuration with sanitization settings
 * @returns Sanitization result with redacted content and detection statistics
 */
export function sanitizeContent(content: string, config: PrivacyConfig): SanitizationResult {
  const result: SanitizationResult = {
    sanitized: content,
    foundSecrets: [],
    redactionCount: 0
  };

  // Early exit if sanitization is disabled
  if (!config.sanitizeSecrets) {
    return result;
  }

  // Early exit if content is empty or very short
  if (!content || content.length < 8) {
    return result;
  }

  let sanitized = content;
  const foundTypes = new Set<SecretType>();

  // Apply default patterns (in order from specific to generic)
  for (const pattern of DEFAULT_PATTERNS) {
    const matches = sanitized.match(pattern.pattern);
    if (matches && matches.length > 0) {
      foundTypes.add(pattern.type);
      result.redactionCount += matches.length;

      // Replace matches with redaction marker
      sanitized = sanitized.replace(pattern.pattern, `[REDACTED:${pattern.type}]`);
    }
  }

  // Apply custom patterns from configuration
  if (config.sanitizePatterns && config.sanitizePatterns.length > 0) {
    const customPatterns = compileCustomPatterns(config.sanitizePatterns);

    for (const pattern of customPatterns) {
      const matches = sanitized.match(pattern);
      if (matches && matches.length > 0) {
        foundTypes.add('CUSTOM');
        result.redactionCount += matches.length;

        // Replace matches with custom redaction marker
        sanitized = sanitized.replace(pattern, '[REDACTED:CUSTOM]');
      }
    }
  }

  result.sanitized = sanitized;
  result.foundSecrets = Array.from(foundTypes);

  return result;
}

/**
 * Checks if content contains secrets without sanitizing
 *
 * Useful for validation or warnings without modifying content.
 * More efficient than sanitizeContent when you only need detection.
 *
 * @param content - Content to check for secrets
 * @param config - Privacy configuration with sanitization settings
 * @returns True if any secrets were detected
 */
export function containsSecrets(content: string, config: PrivacyConfig): boolean {
  // Early exit if sanitization is disabled or content is too short
  if (!config.sanitizeSecrets || !content || content.length < 8) {
    return false;
  }

  // Check default patterns
  for (const pattern of DEFAULT_PATTERNS) {
    if (pattern.pattern.test(content)) {
      return true;
    }
  }

  // Check custom patterns
  if (config.sanitizePatterns && config.sanitizePatterns.length > 0) {
    const customPatterns = compileCustomPatterns(config.sanitizePatterns);

    for (const pattern of customPatterns) {
      if (pattern.test(content)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Validates sanitization patterns for ReDoS vulnerabilities
 *
 * Tests patterns against known problematic inputs to detect
 * catastrophic backtracking issues. This is a basic check and
 * may not catch all ReDoS vulnerabilities.
 *
 * @param pattern - Regex pattern to validate
 * @param timeoutMs - Maximum time to allow for test (default: 100ms)
 * @returns True if pattern appears safe, false if potential ReDoS detected
 */
export function validatePatternSafety(pattern: RegExp, timeoutMs: number = 100): boolean {
  // Test patterns known to trigger catastrophic backtracking
  const testInputs = [
    'a'.repeat(1000),
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaa!',
    'x'.repeat(100) + 'y',
    'abcdefghij'.repeat(50)
  ];

  for (const input of testInputs) {
    const startTime = Date.now();

    try {
      pattern.test(input);
      const duration = Date.now() - startTime;

      if (duration > timeoutMs) {
        console.warn(`Pattern may be vulnerable to ReDoS: ${pattern.source}`);
        return false;
      }
    } catch (error) {
      console.error(`Pattern test failed: ${pattern.source}`, error);
      return false;
    }
  }

  return true;
}

/**
 * Gets statistics about default sanitization patterns
 *
 * Useful for debugging and understanding what patterns are active.
 *
 * @returns Information about default patterns
 */
export function getDefaultPatternsInfo(): {
  count: number;
  types: SecretType[];
  descriptions: string[];
} {
  return {
    count: DEFAULT_PATTERNS.length,
    types: DEFAULT_PATTERNS.map(p => p.type),
    descriptions: DEFAULT_PATTERNS.map(p => `${p.name}: ${p.description}`)
  };
}

/**
 * Clears the pattern compilation cache
 *
 * Useful for testing or when memory needs to be reclaimed.
 * Next sanitization will recompile patterns.
 */
export function clearPatternCache(): void {
  patternCache.clear();
}
