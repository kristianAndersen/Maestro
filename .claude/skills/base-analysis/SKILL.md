---
name: base-analysis
description: Activates for evaluation tasks; provides frameworks for assessing quality, security, maintainability, and performance
---

# BaseAnalysis Skill

## Purpose

This skill provides comprehensive guidance for analyzing and evaluating code, systems, and deliverables. It helps you assess quality, identify issues, evaluate security, measure maintainability, and provide constructive feedback.

## When to Use This Skill

This skill automatically activates when:
- Evaluating code quality or architecture
- Performing security assessments
- Reviewing pull requests or changes
- Analyzing system performance or scalability
- Assessing technical debt or maintainability

## Quick Start

For 80% of analysis operations, follow these principles:

1. **Use objective criteria** - Base judgments on measurable standards
2. **Look for patterns** - Identify systemic issues, not just symptoms
3. **Consider context** - Requirements and constraints matter
4. **Provide evidence** - Support conclusions with specific examples
5. **Be constructive** - Focus on improvement, not just criticism

## Core Principles

### 1. **Evidence-Based Assessment**
Base conclusions on concrete evidence: code snippets, metrics, test results.

### 2. **Holistic Evaluation**
Consider multiple dimensions: functionality, quality, security, maintainability, performance.

### 3. **Context Awareness**
Evaluate against project requirements and constraints, not idealized standards.

### 4. **Actionable Feedback**
Provide specific, implementable recommendations, not vague critiques.

### 5. **Balanced Perspective**
Acknowledge strengths and weaknesses; avoid purely positive or negative assessments.

## Analysis Frameworks

### Framework: Quality Dimensions

**Functionality:**
- Does it work correctly?
- Does it meet requirements?
- Are edge cases handled?

**Readability:**
- Is code clear and understandable?
- Are names descriptive?
- Is structure logical?

**Maintainability:**
- Can it be easily modified?
- Is it well-documented?
- Are dependencies manageable?

**Testability:**
- Can it be tested?
- Are tests present?
- Is test coverage adequate?

**Security:**
- Are inputs validated?
- Are credentials protected?
- Are common vulnerabilities avoided?

### Framework: Code Review Checklist

```bash
# 1. Functionality
grep -n "TODO\|FIXME\|BUG" file.py  # Incomplete work?
pytest tests/  # Do tests pass?

# 2. Code Quality
wc -l file.py  # Function length reasonable?
grep -c "^def \|^class " file.py  # Complexity manageable?

# 3. Security
grep -n "eval\|exec\|system" file.py  # Dangerous functions?
grep -n "password\|secret\|key" file.py  # Hardcoded secrets?

# 4. Best Practices
grep -n "^import" file.py  # Proper imports?
grep -n "# type:" file.py  # Type hints present?
```

### Framework: Security Assessment

**OWASP Top 10 Check:**
1. Injection (SQL, command, XSS)
2. Broken authentication
3. Sensitive data exposure
4. XML external entities
5. Broken access control
6. Security misconfiguration
7. Cross-site scripting
8. Insecure deserialization
9. Using components with known vulnerabilities
10. Insufficient logging

```bash
# Security scan
grep -rn "eval\|exec" .  # Code injection
grep -rn "password.*=\|api_key.*=" .  # Hardcoded secrets
grep -rn "SELECT.*+\|DELETE.*+" .  # SQL injection
grep -rn "innerHTML\|dangerouslySetInnerHTML" .  # XSS
```

## Analysis Patterns

### Pattern: Code Quality Analysis

```bash
#!/bin/bash
# Analyze code quality

file="$1"

echo "=== Code Quality Analysis: $file ==="

# Size metrics
lines=$(wc -l < "$file")
echo "Lines: $lines"
[ $lines -gt 300 ] && echo "⚠️  Large file (>300 lines)"

# Complexity indicators
functions=$(grep -c "^def \|^function " "$file")
echo "Functions: $functions"

# Documentation
docstrings=$(grep -c '"""' "$file")
echo "Docstrings: $docstrings"
[ $docstrings -lt $functions ] && echo "⚠️  Missing docstrings"

# Code smells
long_lines=$(awk 'length > 100' "$file" | wc -l)
[ $long_lines -gt 0 ] && echo "⚠️  $long_lines lines exceed 100 chars"

todos=$(grep -c "TODO\|FIXME" "$file")
[ $todos -gt 0 ] && echo "⚠️  $todos TODO/FIXME comments"

# Test coverage
test_file="tests/test_$(basename $file)"
[ ! -f "$test_file" ] && echo "⚠️  No test file found"
```

### Pattern: Security Analysis

```bash
#!/bin/bash
# Security analysis

echo "=== Security Analysis ==="

# Check for secrets
echo "Checking for hardcoded secrets..."
grep -rn "password\s*=\|api_key\s*=\|secret\s*=" . | grep -v "test\|example"

# Check for dangerous functions
echo "Checking for dangerous functions..."
grep -rn "eval(\|exec(\|system(" .

# Check for SQL injection
echo "Checking for SQL injection risks..."
grep -rn "SELECT.*%s\|DELETE.*%s" .

# Check dependencies
echo "Checking for vulnerable dependencies..."
# Use safety, snyk, or similar tools
```

### Pattern: Architecture Analysis

```bash
#!/bin/bash
# Analyze architecture

echo "=== Architecture Analysis ==="

# Layer separation
echo "Checking layer structure..."
find . -type d -name "controllers" -o -name "services" -o -name "models"

# Dependency direction
echo "Checking dependencies..."
for file in src/**/*.py; do
  imports=$(grep "^from\|^import" "$file" | wc -l)
  [ $imports -gt 15 ] && echo "⚠️  $file has $imports imports (high coupling)"
done

# Circular dependencies (manual review needed)
echo "Check for circular dependencies manually"
```

## Evaluation Criteria

### Code Quality Scoring

**Excellent (90-100%):**
- Clear, well-documented code
- Comprehensive tests
- No code smells
- Follows best practices

**Good (70-89%):**
- Generally clear code
- Adequate tests
- Minor code smells
- Mostly follows best practices

**Needs Improvement (50-69%):**
- Some unclear code
- Limited tests
- Notable code smells
- Some best practices violated

**Poor (<50%):**
- Unclear, complex code
- Minimal/no tests
- Significant code smells
- Many best practices violated

### Assessment Template

```markdown
# Code Analysis: [Component Name]

## Summary
[One paragraph overview of assessment]

## Strengths
- [Specific positive aspect with example]
- [Another strength]

## Issues Identified

### Critical (Fix Immediately)
- [Issue with severity justification]
  - Location: file.py:123
  - Impact: [Why it matters]
  - Recommendation: [How to fix]

### Important (Fix Soon)
- [Issue]

### Minor (Consider Fixing)
- [Issue]

## Metrics
- Lines of code: X
- Test coverage: Y%
- Complexity score: Z

## Recommendations
1. [Actionable recommendation]
2. [Another recommendation]

## Verdict
[APPROVED | NEEDS WORK | BLOCKED]
```

## Resources (Progressive Disclosure)

- **`resources/methodology.md`** - Deep dive into evaluation methodologies, scoring frameworks, assessment techniques
- **`resources/patterns.md`** - Analysis patterns for different contexts, evaluation templates, scoring rubrics
- **`resources/troubleshooting.md`** - Handling subjective criteria, conflicting standards, incomplete information

## Anti-Patterns

### ❌ Analysis Without Evidence
```bash
# BAD: Vague criticism
"This code is bad"

# GOOD: Specific with evidence
"Function complexity is high (file.py:45) - 50 lines with 5 levels of nesting"
```

### ❌ Ignoring Context
```bash
# BAD: Rigid standards
"This violates clean code principles"

# GOOD: Context-aware
"Given performance requirements, optimization trades readability (acceptable)"
```

### ❌ Only Finding Problems
```markdown
# BAD: Pure criticism
Problems:
- Issue 1
- Issue 2

# GOOD: Balanced
Strengths:
- Well-tested
Issues:
- Issue 1 (with fix suggestion)
```

## Quick Reference

```bash
# Quick analysis workflow
# 1. Understand purpose: cat README.md
# 2. Check structure: tree -L 2
# 3. Review code quality: grep patterns
# 4. Check tests: pytest --cov
# 5. Security scan: grep dangerous patterns
# 6. Synthesize findings
# 7. Provide actionable feedback

# Quality checks
wc -l file.py  # Size
grep -c "^def " file.py  # Complexity
grep "TODO\|FIXME" file.py  # Incomplete work
pytest --cov  # Test coverage

# Security checks
grep "eval\|exec\|system" .  # Dangerous functions
grep "password.*=\|key.*=" .  # Secrets
grep "SELECT.*+" .  # SQL injection
```
