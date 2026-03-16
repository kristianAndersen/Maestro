/**
 * Demonstration of sanitization capabilities
 *
 * Run with: bun demo-sanitization.ts
 */

import { sanitizeContent, getDefaultPatternsInfo } from './sanitizer';
import { loadConfig } from './privacy-config';

// Load configuration
const config = loadConfig();

console.log('=== Privacy Control Demo ===\n');
console.log(`Configuration:`);
console.log(`- Sanitization enabled: ${config.sanitizeSecrets}`);
console.log(`- Retention days: ${config.retentionDays}`);
console.log(`- Custom patterns: ${config.sanitizePatterns.length}`);
console.log(`- Excluded agents: ${config.excludeAgents.length}`);
console.log(`- Excluded files: ${config.excludeFiles.length}\n`);

// Display available patterns
const patternsInfo = getDefaultPatternsInfo();
console.log(`Available sanitization patterns (${patternsInfo.count}):`);
patternsInfo.descriptions.forEach((desc, i) => {
  console.log(`  ${i + 1}. ${desc}`);
});
console.log();

// Example 1: API Keys
console.log('--- Example 1: API Keys ---');
const example1 = 'My Stripe key is STRIPPED_TEST_KEY_1 and my GitHub token is ghp_AbCdEfGhIjKlMnOpQrStUvWxYz1234567890AbCd';
const result1 = sanitizeContent(example1, config);
console.log('Before:', example1);
console.log('After:', result1.sanitized);
console.log('Secrets found:', result1.foundSecrets);
console.log('Redactions:', result1.redactionCount);
console.log();

// Example 2: Credentials in URLs
console.log('--- Example 2: URLs with Authentication ---');
const example2 = 'Connect to https://admin:MyP@ssw0rd@api.example.com/data';
const result2 = sanitizeContent(example2, config);
console.log('Before:', example2);
console.log('After:', result2.sanitized);
console.log('Secrets found:', result2.foundSecrets);
console.log();

// Example 3: JWT Token
console.log('--- Example 3: JWT Token ---');
const example3 = 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
const result3 = sanitizeContent(example3, config);
console.log('Before:', example3.substring(0, 80) + '...');
console.log('After:', result3.sanitized);
console.log('Secrets found:', result3.foundSecrets);
console.log();

// Example 4: Private Key
console.log('--- Example 4: Private Key ---');
const example4 = `Here is the key:
-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA1234567890abcdefghij
klmnopqrstuvwxyz1234567890ABCDEFGHIJ
-----END RSA PRIVATE KEY-----`;
const result4 = sanitizeContent(example4, config);
console.log('Before: [Private key content...]');
console.log('After:', result4.sanitized);
console.log('Secrets found:', result4.foundSecrets);
console.log();

// Example 5: Mixed Content (Safe)
console.log('--- Example 5: Safe Content (No Secrets) ---');
const example5 = 'The meeting is scheduled for 2024-12-17 at 3:00 PM. Please bring your laptop.';
const result5 = sanitizeContent(example5, config);
console.log('Before:', example5);
console.log('After:', result5.sanitized);
console.log('Secrets found:', result5.foundSecrets);
console.log('Redactions:', result5.redactionCount);
console.log();

// Example 6: Performance Test
console.log('--- Example 6: Performance Test ---');
const largeContent = 'Normal conversation text. '.repeat(5000) +
  'Secret: STRIPPED_TEST_KEY_1';
const startTime = Date.now();
const result6 = sanitizeContent(largeContent, config);
const duration = Date.now() - startTime;
console.log(`Content size: ~${(largeContent.length / 1024).toFixed(1)}KB`);
console.log(`Processing time: ${duration}ms`);
console.log(`Secrets found: ${result6.foundSecrets}`);
console.log(`Performance: ${duration < 10 ? '✓ EXCELLENT' : duration < 50 ? '✓ GOOD' : '⚠ SLOW'}`);
console.log();

console.log('=== Demo Complete ===');
