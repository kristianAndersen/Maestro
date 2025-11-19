# Registry Discovery Optimization Guide

**For**: Skill Developers
**Purpose**: Maximize skill discoverability in Maestro Marketplace
**Focus**: Semantic search optimization

---

## How Discovery Works

### Registry Search Flow

```
User Request: "Check my code for security issues"
  ↓
Maestro queries registry: search({ intent: "Check my code for security issues" })
  ↓
Registry performs:
  1. Keyword extraction: ["check", "code", "security", "issues"]
  2. Semantic matching against:
     - description field (weighted 50%)
     - capabilities array (weighted 30%)
     - name field (weighted 20%)
  3. Scoring using Jaccard similarity
  4. Ranking by score
  ↓
Returns: [
  { name: "code-analysis", score: 48, reason: "Matched: security, code, issues" },
  { name: "data-validation", score: 12, reason: "Matched: check" }
]
  ↓
Maestro selects: code-analysis (highest score)
```

---

## Optimization Strategy

### 1. Description Field (Highest Impact)

**Weight**: 50% of match score
**Character Limit**: 100-1000 chars
**First 100 chars**: Most critical (shown in search results)

**Formula**:
```
[Primary Action] [Domain] [Objects] [Use Cases] Keywords: [Search Terms]
```

**Example (code-analysis)**:
```json
"description": "Analyzes JavaScript/TypeScript codebases for quality issues, code smells, and refactoring opportunities. Provides security audits (OWASP Top 10), complexity analysis (cyclomatic complexity), and best practices validation (SOLID principles). Use when reviewing code quality, detecting vulnerabilities, or assessing maintainability. Keywords: code review, security audit, static analysis, linting, refactoring."
```

**Why it works**:
- ✅ First 100 chars: "Analyzes JavaScript/TypeScript codebases for quality issues, code smells, and refactoring opportunities"
- ✅ Specific technologies: JavaScript, TypeScript
- ✅ Concrete use cases: quality issues, code smells, refactoring, security audits
- ✅ Domain terms: OWASP Top 10, cyclomatic complexity, SOLID principles
- ✅ Explicit keywords section for common searches

**Common Queries This Matches**:
- "analyze code quality" → Matched: analyze, code, quality
- "check security vulnerabilities" → Matched: security, vulnerabilities (via "audits")
- "refactor my code" → Matched: refactor, code
- "code review tools" → Matched: code, review

---

### 2. Capabilities Array (Medium Impact)

**Weight**: 30% of match score
**Recommended Count**: 5-10 tags
**Format**: lowercase-with-hyphens

**Strategy**:
```
[Primary] + [Domain Terms] + [Use Cases] + [Synonyms] + [Related]
```

**Example (code-analysis)**:
```json
"capabilities": [
  "code-analysis",              // Primary (exact match queries)
  "security-audit",             // Domain term
  "quality-assessment",         // Domain term
  "vulnerability-scanning",     // Use case (user language)
  "refactoring-recommendations", // Use case
  "code-smell-detection",       // Specific capability
  "complexity-analysis",        // Specific capability
  "best-practices",             // General term (common search)
  "static-analysis",            // Synonym for code-analysis
  "code-review"                 // Synonym (user language)
]
```

**Match Examples**:
- Query "security audit" → Direct match on "security-audit" (high score)
- Query "find code smells" → Match on "code-smell-detection" (high score)
- Query "check best practices" → Match on "best-practices" (medium score)

---

### 3. Name Field (Lower Impact)

**Weight**: 20% of match score
**Format**: lowercase-with-hyphens

**Strategy**:
- Keep concise (2-3 words)
- Use primary capability
- Match common search patterns

**Examples**:
```json
✅ "code-analysis"       // Matches "code" and "analysis" queries
✅ "content-analysis"    // Matches "content" and "analysis" queries
✅ "data-validation"     // Matches "data" and "validation" queries
✅ "read-file"          // Matches "read" and "file" queries

❌ "tool-v2"           // Generic, no semantic value
❌ "helper"            // Too vague
❌ "codeanalysis"      // No separation, harder to match
```

---

## Testing Discovery

### Manual Testing

```bash
cd registry
npm test -- --grep "semantic search"
```

### Test Scenarios for Your Skill

Create test file: `registry/skill-registry.test.ts`

```typescript
describe('Skill Discovery - [your-skill-name]', () => {
  test('finds skill for primary use case', async () => {
    const results = await registry.search({
      intent: 'your primary use case in natural language'
    });

    const found = results.skills.find(s => s.name === 'your-skill-name');
    expect(found).toBeDefined();
    expect(found.score).toBeGreaterThan(20);  // Threshold for good match
  });

  test('finds skill for alternative phrasing', async () => {
    const results = await registry.search({
      intent: 'different way users might ask'
    });

    const found = results.skills.find(s => s.name === 'your-skill-name');
    expect(found).toBeDefined();
  });

  test('does not match irrelevant queries', async () => {
    const results = await registry.search({
      intent: 'completely unrelated query'
    });

    const found = results.skills.find(s => s.name === 'your-skill-name');
    expect(found).toBeUndefined();  // Should not appear
  });
});
```

---

## Common Search Patterns by Domain

### Code/Software Engineering

**User Queries**:
- "analyze code quality"
- "check for security vulnerabilities"
- "find code smells"
- "refactor my code"
- "code review"
- "static analysis"

**Optimization**:
```json
"description": "Analyzes [language] code for quality, security, complexity...",
"capabilities": [
  "code-analysis", "security-audit", "quality-assessment",
  "refactoring", "code-review", "static-analysis"
]
```

---

### Marketing/Content

**User Queries**:
- "check brand voice"
- "analyze content quality"
- "SEO optimization"
- "improve readability"
- "check tone"

**Optimization**:
```json
"description": "Analyzes content for brand voice, SEO, readability, engagement...",
"capabilities": [
  "content-analysis", "brand-voice-audit", "seo-optimization",
  "readability", "tone-detection", "messaging"
]
```

---

### Data/Analytics

**User Queries**:
- "validate data quality"
- "check dataset completeness"
- "find data anomalies"
- "data integrity check"

**Optimization**:
```json
"description": "Validates data quality across completeness, consistency, accuracy dimensions...",
"capabilities": [
  "data-validation", "quality-check", "anomaly-detection",
  "completeness-check", "integrity-validation"
]
```

---

## Debugging Poor Discovery

### Problem: Skill Not Found for Expected Queries

**Debug Steps**:

1. **Check manifest exists**:
   ```bash
   ls .claude/skills/your-skill/your-skill.skill.json
   ```

2. **Verify registry scans it**:
   ```bash
   cd registry && npm test
   # Look for your skill in output
   ```

3. **Test direct capability match**:
   ```javascript
   registry.search({ capability: "your-exact-capability" })
   ```

4. **Examine search with debug**:
   ```javascript
   const results = await registry.search({
     intent: "your query",
     debug: true  // If implemented
   });
   console.log(results.debug.matchDetails);
   ```

**Common Causes**:
- ❌ Missing keywords in description
- ❌ Generic capabilities (not specific enough)
- ❌ Description too short (< 100 chars)
- ❌ No overlap between user language and skill terms

---

### Problem: Skill Found But Low Score

**Symptoms**: Skill appears in results but ranked below others

**Fixes**:

1. **Move keywords earlier in description**:
   ```json
   ❌ "A comprehensive tool for businesses that analyzes code quality"
   ✅ "Analyzes code quality for businesses. Comprehensive security, complexity, best practices..."
   ```

2. **Add more capabilities**:
   ```json
   ❌ "capabilities": ["code-analysis", "security"]  // Only 2
   ✅ "capabilities": ["code-analysis", "security-audit", "quality-assessment",
                       "vulnerability-scanning", "code-review", "static-analysis"]  // 6
   ```

3. **Use exact user language**:
   ```json
   ❌ "Performs static code examination"  // Technical
   ✅ "Analyzes code quality"            // User language
   ```

4. **Add synonyms to capabilities**:
   ```json
   "capabilities": [
     "code-analysis",     // Formal term
     "code-review",       // Synonym (user says this)
     "static-analysis",   // Technical synonym
     "linting",           // Tool users know
     "code-quality"       // Common phrase
   ]
   ```

---

## Optimization Checklist

Before finalizing skill:

**Description**:
- [ ] 100-1000 characters
- [ ] First 100 chars include primary keywords
- [ ] Mentions specific technologies/domains
- [ ] Lists concrete use cases
- [ ] Includes "Keywords:" section
- [ ] Uses language users would search with

**Capabilities**:
- [ ] 5-10 tags total
- [ ] Primary capability included
- [ ] Domain terms included
- [ ] Use case keywords included
- [ ] Synonyms included
- [ ] User language (not just technical terms)

**Name**:
- [ ] Descriptive (not generic)
- [ ] 2-3 words
- [ ] Matches primary capability
- [ ] lowercase-with-hyphens

**Testing**:
- [ ] Registry finds skill
- [ ] Score > 20 for primary use case
- [ ] Found for alternative phrasings
- [ ] Not found for irrelevant queries
- [ ] Ranked higher than unrelated skills

---

## Real-World Examples

### code-analysis (Score: 48 for "check code security")

**Why High Score**:
```json
"description": "Analyzes JavaScript/TypeScript codebases for quality issues, code smells, and refactoring opportunities. Provides security audits (OWASP Top 10)..."

Match breakdown:
- "check" → not in description (0 points)
- "code" → in description 3x, capabilities 2x (10 points)
- "security" → in description "security audits", capability "security-audit" (20 points)
- Total: 30 points from keywords + 18 bonus = 48
```

### read-file (Score: 117 for "read file")

**Why Very High Score**:
```json
"name": "read-file"
"description": "Reads file contents from disk..."
"capabilities": ["file-operations", "read", "load-file", "file-io"]

Match breakdown:
- "read" → exact match in name (40 points)
- "file" → exact match in name (40 points)
- "read" → exact match in capabilities (20 points)
- "file" → in description multiple times (17 points)
- Total: 117 points (near-perfect match)
```

---

**Document Status**: Discovery Optimization Guide
**For**: Skill Developers
**Version**: 1.0
**Last Updated**: 2025-11-13
