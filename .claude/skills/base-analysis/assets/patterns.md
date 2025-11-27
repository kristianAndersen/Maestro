# BaseAnalysis Skill: Patterns

Analysis patterns, evaluation templates, and scoring rubrics for different assessment contexts.

## Analysis Patterns by Context

### Pattern: Pull Request Review

```markdown
# PR Review: [PR Title]

## Changes Overview
[What was changed and why]

## Code Quality ✓/⚠️/✗
- Readability: ✓ Clear and well-structured
- Complexity: ⚠️ Some functions could be simplified
- Documentation: ✓ Adequate comments

## Testing ✓/⚠️/✗
- Tests added: ✓ Yes
- Coverage: ✓ 85%
- Edge cases: ⚠️ Missing null input test

## Security ✓/⚠️/✗
- Input validation: ✓ Present
- SQL injection: ✓ Using parameterized queries
- Secrets: ✓ No hardcoded credentials

## Recommendations
1. Simplify `process_data()` (line 45) - reduce nesting
2. Add test for null input
3. Extract magic numbers to constants

## Verdict
**APPROVED** with minor suggestions
```

### Pattern: Security Audit

```markdown
# Security Audit: [Component]

## Scope
[What was audited]

## Methodology
- OWASP Top 10 review
- Code pattern analysis
- Dependency scanning

## Findings

### Critical (Fix Immediately)
None

### High (Fix Soon)
- **SQL Injection Risk** (file.py:123)
  - Using string concatenation in query
  - Recommendation: Use parameterized queries

### Medium (Fix When Possible)
- **Weak Password Requirements**
  - Current: 6 chars minimum
  - Recommendation: 12 chars + complexity

### Low (Consider)
- Missing rate limiting on API endpoints

## Summary
[Overall security posture]
```

### Pattern: Technical Debt Assessment

```bash
#!/bin/bash
# Technical debt analysis

echo "=== Technical Debt Assessment ==="

# TODO/FIXME count
todos=$(grep -r "TODO\|FIXME" src | wc -l)
echo "TODOs/FIXMEs: $todos"

# Deprecated usage
deprecated=$(grep -r "@deprecated\|# deprecated" src | wc -l)
echo "Deprecated usage: $deprecated"

# Duplication
# (Manual review or use tool like jscpd)

# Complexity
find src -name "*.py" -exec wc -l {} \; | awk '$1 > 300 {print}'

# Test coverage
pytest --cov --cov-report=term-missing
```

## Evaluation Templates

### Template: Component Analysis

```markdown
# Component Analysis: [Name]

## Purpose
[What this component does]

## Assessment

### Functionality: [Score/10]
- ✓ Meets requirements
- ✓ Handles edge cases
- ⚠️ Error handling could be improved

### Quality: [Score/10]
- ✓ Well-structured
- ✗ Missing documentation
- ⚠️ Some functions too long

### Security: [Score/10]
- ✓ Input validation present
- ✓ No obvious vulnerabilities
- ✓ Dependencies up-to-date

### Maintainability: [Score/10]
- ⚠️ High complexity
- ✓ Good test coverage
- ⚠️ Some duplication

## Overall Score: [X/10]

## Action Items
1. [Specific improvement]
2. [Another improvement]
```

### Template: Architecture Review

```markdown
# Architecture Review

## System Overview
[High-level description]

## Architecture Assessment

### Structure: ✓/⚠️/✗
- Layer separation: ✓ Clear boundaries
- Module organization: ✓ Logical grouping
- Dependency direction: ✓ Proper flow

### Scalability: ✓/⚠️/✗
- Horizontal scaling: ✓ Stateless design
- Database design: ⚠️ Some N+1 queries
- Caching strategy: ✓ Well-implemented

### Maintainability: ✓/⚠️/✗
- Code organization: ✓ Clear structure
- Documentation: ⚠️ Needs API docs
- Testing: ✓ Good coverage

## Recommendations
[Prioritized improvements]

## Risk Assessment
[Potential issues and mitigation]
```

## Scoring Rubrics

### Code Quality Rubric

| Criterion | Excellent (5) | Good (4) | Fair (3) | Poor (2) | Very Poor (1) |
|-----------|---------------|----------|----------|----------|---------------|
| Readability | Crystal clear | Mostly clear | Somewhat clear | Confusing | Incomprehensible |
| Complexity | Very simple | Simple | Moderate | Complex | Very complex |
| Documentation | Comprehensive | Adequate | Basic | Minimal | None |
| Tests | >90% coverage | 70-90% | 50-70% | <50% | None |

### Security Rubric

| Risk Level | Criteria |
|------------|----------|
| Critical | Allows unauthorized access, data breach, or system compromise |
| High | Exposes sensitive data or enables privilege escalation |
| Medium | Security best practice violation, potential vulnerability |
| Low | Minor security improvement opportunity |
