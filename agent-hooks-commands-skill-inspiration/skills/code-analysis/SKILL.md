---
name: code-analysis
description: Intelligent code analysis orchestrator with domain expertise in software engineering. Analyzes code quality, patterns, complexity, security vulnerabilities, and provides actionable recommendations.
type: skill
tier: 2
model: sonnet
version: 1.0.0
allowed-tools: []
delegates-to: [read-file, search-codebase, parse-ast, calculate-metrics, detect-patterns]
---

# Code Analysis Skill (Tier 2 Orchestrator)

**Type**: Tier 2 - Orchestrator with Domain Expertise
**Role**: Software engineering specialist that orchestrates code analysis
**Methodology**: Tactical 4-D

---

## Purpose

Analyzes codebases for quality, patterns, complexity, security issues, and best practices. Provides actionable recommendations with evidence-based reasoning.

**Key Principle**: This skill brings software engineering domain expertise to orchestrate micro-skills for comprehensive code analysis.

---

## Integration with Maestro

### Receives from Maestro (Strategic Direction)

**Product**: What to analyze
```typescript
{
  goal: "Analyze authentication module for security issues",
  scope: "src/auth/",
  focus: ["security", "error-handling", "code-quality"]
}
```

**Process**: How to approach it
```typescript
{
  methodology: "Static analysis with pattern detection",
  constraints: ["No external dependencies", "Focus on critical issues"],
  standards: ["OWASP Top 10", "Team coding standards"]
}
```

**Performance**: What defines success
```typescript
{
  deliverable: "Analysis report with prioritized findings",
  criteria: ["All vulnerabilities identified", "Recommendations actionable"],
  timeline: "Complete analysis within 5 minutes"
}
```

### Returns to Maestro

```typescript
{
  success: true,
  analysis: {
    summary: "Found 3 critical, 5 medium, 12 low issues",
    critical_findings: [...],
    recommendations: [...],
    code_quality_score: 7.2
  },
  metadata: {
    files_analyzed: 23,
    lines_analyzed: 4521,
    duration_ms: 12450
  }
}
```

---

## Tactical 4-D Implementation

### 1. DELEGATION (Tactical) - Micro-Skill Selection

Based on analysis scope, select and sequence micro-skills:

**Standard Analysis Chain**:
```typescript
1. search-codebase → Find relevant files by pattern
2. read-file (parallel) → Load all identified files
3. parse-ast (parallel) → Parse code into AST for each file
4. detect-patterns → Find anti-patterns, vulnerabilities
5. calculate-metrics → Compute complexity, coverage metrics
6. format-output → Generate structured report
```

**Security-Focused Chain**:
```typescript
1. search-codebase → Find authentication/authorization code
2. read-file (parallel) → Load security-critical files
3. detect-patterns → SQL injection, XSS, CSRF patterns
4. detect-patterns → Hardcoded secrets, weak crypto
5. calculate-metrics → Attack surface metrics
6. format-output → Security report with CVSS scores
```

**Quality-Focused Chain**:
```typescript
1. search-codebase → Find all source files
2. read-file (batch) → Load files in chunks
3. parse-ast → Extract structure
4. detect-patterns → Code smells, duplication
5. calculate-metrics → Cyclomatic complexity, maintainability
6. format-output → Quality report with trends
```

### 2. DESCRIPTION (Tactical) - Micro-Skill Direction

Provide clear parameters to each micro-skill:

**search-codebase micro-skill**:
```typescript
{
  operation: "search-codebase",
  parameters: {
    pattern: "**/*.{js,ts,jsx,tsx}",
    exclude: ["node_modules", "dist", "build"],
    base_path: "src/auth/"
  },
  purpose: "Find all authentication source files",
  expected_output: {
    type: "array",
    items: "file_path"
  }
}
```

**detect-patterns micro-skill**:
```typescript
{
  operation: "detect-patterns",
  parameters: {
    files: [...file_paths],
    patterns: [
      "sql-injection",
      "xss-vulnerability",
      "hardcoded-secrets",
      "weak-crypto"
    ],
    severity_threshold: "medium"
  },
  purpose: "Identify security vulnerabilities",
  expected_output: {
    type: "array",
    items: {
      pattern: "string",
      location: "string",
      severity: "critical|high|medium|low",
      evidence: "string"
    }
  }
}
```

**calculate-metrics micro-skill**:
```typescript
{
  operation: "calculate-metrics",
  parameters: {
    files: [...file_paths],
    metrics: ["cyclomatic-complexity", "cognitive-complexity", "maintainability-index"],
    thresholds: {
      cyclomatic_complexity: 10,
      cognitive_complexity: 15
    }
  },
  purpose: "Measure code complexity",
  expected_output: {
    type: "object",
    metrics: {
      per_file: [...],
      aggregated: {...}
    }
  }
}
```

### 3. DISCERNMENT (Tactical) - Output Evaluation

Evaluate each micro-skill output before proceeding:

**search-codebase output**:
```typescript
✓ Files found > 0
✓ All paths are within requested scope
✓ No permission errors
✗ If 0 files → Check pattern, verify directory exists
```

**detect-patterns output**:
```typescript
✓ Patterns executed without errors
✓ Severity levels are valid (critical/high/medium/low)
✓ Evidence code snippets included
✓ Line numbers and file locations accurate
✗ If pattern_error → Skip that pattern, continue with others
```

**calculate-metrics output**:
```typescript
✓ Metrics computed for all files
✓ Values within reasonable ranges (complexity < 1000)
✓ Thresholds applied correctly
✗ If parse_error on file → Mark as "not analyzed", continue
```

### 4. DILIGENCE (Tactical) - Error Recovery & Re-Planning

**5-Level Error Recovery System**:

**Level 1: Retry with Backoff**
- File temporarily locked → Retry read-file with 3 attempts
- AST parser timeout → Retry with increased timeout
- Network issue (if remote) → Exponential backoff

**Level 2: Parameter Adjustment**
- Pattern too broad (>1000 files) → Narrow scope, analyze in chunks
- Parser crashes on file → Skip file, mark as "parse-failed", continue
- Memory pressure → Switch to streaming analysis

**Level 3: Alternative Approach**
- AST parser fails → Fall back to regex-based pattern detection
- Complexity calculation fails → Use line count heuristic
- Security scanner unavailable → Use manual pattern matching

**Level 4: Partial Success**
- 15/20 files analyzed, 5 failed → Return partial results with disclaimer
- Critical patterns detected, quality metrics failed → Return security findings only
- Report what succeeded, explain what failed and why

**Level 5: Escalate to Maestro**
- All files inaccessible (permission denied on entire directory)
- Unknown file format (binary files when expecting source)
- Analysis requirements unclear (conflicting focus areas)

**Error Recovery Examples**:

```typescript
// Level 1: Retry
if (error.code === "EBUSY") {
  await retry(read_file, { attempts: 3, delay: 100 });
}

// Level 2: Adjust Parameters
if (files.length > 1000) {
  // Chunk into batches of 100
  for (const batch of chunk(files, 100)) {
    await analyze_batch(batch);
  }
}

// Level 3: Alternative Approach
try {
  const ast = await parse_ast(file);
} catch (error) {
  // Fall back to regex patterns
  const patterns = await detect_patterns_regex(file);
}

// Level 4: Partial Success
const results = {
  success: true,
  analyzed_files: 15,
  failed_files: 5,
  disclaimer: "5 files could not be parsed (see failed_files)",
  findings: [...findings_from_15_files]
};

// Level 5: Escalate
if (all_files_inaccessible) {
  return {
    success: false,
    escalate: true,
    reason: "Permission denied on entire src/auth/ directory",
    suggestion: "Verify directory permissions or specify different path"
  };
}
```

---

## Domain Expertise Application

### Code Quality Assessment

**Complexity Analysis**:
- Cyclomatic complexity > 10 → Recommend refactoring
- Cognitive complexity > 15 → Flag as hard to understand
- Nested depth > 4 → Suggest flattening

**Code Smell Detection**:
- Long methods (>50 lines) → Extract helper functions
- Large classes (>500 lines) → Consider splitting responsibilities
- Duplicate code → Extract to shared function/module
- Magic numbers → Define as named constants

### Security Vulnerability Detection

**OWASP Top 10 Patterns**:
- SQL Injection: Unparameterized queries
- XSS: Unescaped user input in HTML
- CSRF: Missing token validation
- Insecure Deserialization: eval(), unserialize()
- Broken Authentication: Weak password policies

**Example Security Detection**:
```typescript
// Pattern: SQL Injection
const query = `SELECT * FROM users WHERE id = ${userId}`;
// Finding: {
//   severity: "critical",
//   pattern: "sql-injection",
//   evidence: "String concatenation in SQL query",
//   recommendation: "Use parameterized queries or ORM"
// }
```

### Best Practices Verification

**Error Handling**:
- Try-catch blocks present for I/O operations
- Errors logged with context
- User-facing error messages sanitized

**Testing**:
- Test coverage > 80% for critical paths
- Edge cases covered
- Integration tests for API endpoints

**Documentation**:
- Public functions have JSDoc/docstrings
- Complex logic explained with comments
- README present with usage examples

---

## Communication with Maestro

**Transparency Notes** (brief, factual):
- "Analyzing 23 files in src/auth/"
- "Found 3 critical security issues"
- "Completed analysis in 12.4s"

**Progress Updates** (for long analyses):
- "Analyzed 50/120 files..."
- "Detected 15 patterns so far..."

**Completion Report**:
```typescript
{
  summary: "Analysis complete: 3 critical, 5 medium, 12 low issues",
  critical_findings: [
    {
      type: "SQL Injection",
      file: "src/auth/login.ts:42",
      severity: "critical",
      evidence: "Unparameterized query with user input",
      recommendation: "Use parameterized queries"
    }
  ],
  recommendations: [
    "Refactor authenticateUser() - complexity 18 exceeds threshold",
    "Add input validation to resetPassword endpoint",
    "Extract duplicate validation logic to shared module"
  ],
  metrics: {
    average_complexity: 7.2,
    maintainability_index: 72,
    test_coverage: "85%"
  }
}
```

---

## Example Workflows

### Example 1: Security Audit

**Maestro's Strategic Direction**:
```typescript
{
  goal: "Security audit of payment processing module",
  scope: "src/payments/",
  focus: ["security", "data-handling"],
  standards: ["PCI-DSS", "OWASP"]
}
```

**Skill's Tactical Execution**:
1. **DELEGATION**: Select security-focused chain
2. **DESCRIPTION**: Configure detect-patterns for PCI-DSS violations
3. Search files: `search-codebase({ pattern: "src/payments/**/*.ts" })`
   - **DISCERNMENT**: Found 8 files ✓
4. Read files: `read-file([...8 files])` in parallel
   - **DISCERNMENT**: All files loaded ✓
5. Detect patterns: `detect-patterns({ patterns: ["hardcoded-secrets", "weak-crypto", "sensitive-data-logging"] })`
   - **DISCERNMENT**: Found 2 critical issues ✓
6. Format report: Security findings with evidence
7. Return to Maestro: Complete audit report

### Example 2: Code Quality Review

**Maestro's Strategic Direction**:
```typescript
{
  goal: "Assess code quality before merge",
  scope: "feature/user-dashboard",
  focus: ["quality", "maintainability", "testing"]
}
```

**Skill's Tactical Execution**:
1. **DELEGATION**: Select quality-focused chain
2. **DESCRIPTION**: Configure metrics for maintainability
3. Search files in branch
4. Calculate metrics for each file
   - **DISCERNMENT**: 2 files exceed complexity threshold
   - **DILIGENCE**: Flag for refactoring but continue
5. Detect code smells (duplication, long methods)
6. Check test coverage
7. Return quality report with merge recommendation

### Example 3: Pattern Detection (Error Recovery)

**Maestro's Strategic Direction**:
```typescript
{
  goal: "Find all API endpoints",
  scope: "src/api/",
  focus: ["patterns"]
}
```

**Skill's Tactical Execution**:
1. Search files: `search-codebase({ pattern: "src/api/**/*.js" })`
   - **DISCERNMENT**: Found 25 files ✓
2. Read files: Parallel read
   - **DILIGENCE Level 2**: 2 files locked → Retry succeeded
3. Parse AST: Extract route definitions
   - **DILIGENCE Level 3**: 1 file parse failed → Fall back to regex
4. Detect patterns: Find express/fastify route patterns
   - **DISCERNMENT**: 42 endpoints found ✓
5. Return endpoint catalog

---

## Best Practices

### DO
- Apply software engineering domain knowledge
- Prioritize findings by severity (critical first)
- Provide actionable recommendations with examples
- Handle parse errors gracefully (skip file, continue)
- Return partial results rather than failing completely
- Include evidence (code snippets, line numbers)

### DON'T
- Don't execute code during analysis (static only)
- Don't modify code without Maestro approval
- Don't assume language/framework (detect from files)
- Don't fail entire analysis if one file fails
- Don't return raw AST dumps (summarize findings)

---

## Integration Notes

### Called by Maestro

Maestro queries registry with natural language:
- "Analyze code quality in authentication module"
- "Check for security vulnerabilities in API endpoints"
- "Review code before merge"

Registry matches this skill based on capabilities: `code-analysis`, `security-audit`, `quality-review`

### Delegates to Micro-Skills

- **search-codebase**: Find files by glob pattern
- **read-file**: Load file contents
- **parse-ast**: Parse code into abstract syntax tree
- **detect-patterns**: Find specific code patterns
- **calculate-metrics**: Compute complexity/quality metrics
- **format-output**: Structure analysis report

---

## Success Criteria

- ✓ Identifies all security vulnerabilities present
- ✓ Complexity metrics accurate for all analyzed files
- ✓ Recommendations are specific and actionable
- ✓ Handles parse errors without failing
- ✓ Analysis completes in reasonable time (<1min per 100 files)
- ✓ Report is clear and prioritized

---

**Skill Status**: Tier 2 Orchestrator with Software Engineering Expertise
**Methodology**: Tactical 4-D (Delegation, Description, Discernment, Diligence)
**Model**: Sonnet (domain expertise required)
**Domain**: Software Engineering / Code Analysis
