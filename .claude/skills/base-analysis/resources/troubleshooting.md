# BaseAnalysis Skill: Troubleshooting

Handling analysis challenges, subjective criteria, and verification issues.

## Common Challenges

### Challenge: Subjective Criteria

**Problem:** "Clean code" means different things to different people.

**Solutions:**
- Use objective metrics when possible (lines, complexity, coverage)
- Reference specific standards (PEP 8, Airbnb style guide)
- Provide concrete examples of issues
- Focus on impact, not aesthetics

### Challenge: Conflicting Standards

**Problem:** Project standards differ from general best practices.

**Solutions:**
- Evaluate against project standards, not universal ideals
- Note when project deviates from best practices (with context)
- Respect established patterns unless clearly problematic
- Suggest improvements without demanding compliance

### Challenge: Incomplete Information

**Problem:** Can't fully assess without running code/tests.

**Solutions:**
```bash
# Try to run tests
pytest tests/ || echo "Tests cannot run - note in assessment"

# Check what's testable
grep -r "def test_" tests/ | wc -l

# Review what's available
# Make assessment based on available evidence
# Note limitations in report
```

### Challenge: Time Constraints

**Problem:** Full audit would take too long.

**Solutions:**
- Focus on high-risk areas first
- Use automated tools for initial scan
- Sample representative code
- Note scope limitations

## Verification Strategies

### Verify Code Quality Claims

```bash
# Claim: "Has good test coverage"
pytest --cov --cov-report=term
# Check actual percentage

# Claim: "Follows style guide"
pylint src/
flake8 src/
# Check violations

# Claim: "No security issues"
bandit -r src/
# Run security scanner
```

### Verify Functionality Claims

```bash
# Claim: "All features work"
pytest tests/ -v
# Do all tests pass?

# Claim: "Handles edge cases"
grep -r "test.*edge\|test.*boundary" tests/
# Are edge cases actually tested?
```

## Quality Judgment Guidelines

### When Code is "Good Enough"

Consider acceptable if:
- Meets functional requirements
- No critical security issues
- Adequate test coverage (>70%)
- Reasonable maintainability
- Technical debt is manageable

### When Code Needs Work

Requires improvement if:
- Fails functional tests
- Has critical security vulnerabilities
- No tests or very low coverage
- High complexity/poor maintainability
- Significant technical debt

### When Unsure

If uncertain:
- Focus on objective metrics
- Provide evidence for concerns
- Note uncertainty in assessment
- Suggest further investigation
- Get second opinion if critical

## Balanced Assessment

### Avoid Extremes

```markdown
# Too harsh
"This code is terrible and needs complete rewrite"

# Too lenient
"Everything looks perfect, no issues"

# Balanced
"Code is functional and adequately tested. Main concerns:
security (hardcoded secrets) and complexity (main function
too large). Recommend addressing security immediately,
refactoring when time permits."
```

### Constructive Feedback Formula

1. Acknowledge strengths
2. Identify specific issues with evidence
3. Explain impact/why it matters
4. Provide actionable recommendations
5. Prioritize (critical vs nice-to-have)
