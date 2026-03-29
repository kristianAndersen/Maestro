# base-analysis Skill: Methodology

Evaluation methodologies, assessment frameworks, scoring techniques, and analysis bash patterns. Load this asset when you need systematic review protocols, security scan patterns, or architecture analysis scripts.

## Evaluation Methodologies

### Methodology: Systematic Code Review

**Phase 1: Understand**
- Read documentation
- Understand requirements
- Identify key components

**Phase 2: Assess**
- Check functionality
- Evaluate quality
- Review security
- Measure complexity

**Phase 3: Synthesize**
- Identify patterns
- Prioritize issues
- Form recommendations

**Phase 4: Report**
- Document findings
- Provide evidence
- Suggest improvements

### Methodology: Risk-Based Assessment

Focus on high-risk areas:
1. Authentication/authorization
2. Data validation/sanitization
3. Sensitive data handling
4. External integrations
5. Critical business logic

### Methodology: Comparative Analysis

Compare against:
- Project requirements
- Industry standards
- Similar systems
- Previous versions
- Best practices

## Scoring Frameworks

### Framework: Weighted Criteria

```bash
# Calculate quality score
functionality_score=85  # 40% weight
quality_score=70        # 30% weight
security_score=90       # 20% weight
maintainability=75      # 10% weight

total=$(awk "BEGIN {print ($functionality_score*0.4 + $quality_score*0.3 + $security_score*0.2 + $maintainability*0.1)}")
echo "Overall score: $total"
```

### Framework: Pass/Fail Criteria

**Must Pass:**
- All tests pass
- No critical security issues
- Meets functional requirements

**Should Pass:**
- Code quality standards
- Adequate documentation
- Reasonable complexity

**Nice to Have:**
- Excellent test coverage
- Zero technical debt
- Perfect documentation

## Assessment Techniques

### Technique: Metric-Based Evaluation

```bash
# Collect metrics
lines=$(find src -name "*.py" -exec wc -l {} + | tail -1 | awk '{print $1}')
functions=$(grep -r "^def " src | wc -l)
tests=$(find tests -name "*.py" -exec wc -l {} + | tail -1 | awk '{print $1}')

# Calculate ratios
test_ratio=$(awk "BEGIN {print $tests/$lines}")
echo "Test/Code ratio: $test_ratio"
[ $(awk "BEGIN {print ($test_ratio >= 0.5)}") -eq 1 ] && echo "✓ Good test coverage"
```

### Technique: Pattern Detection

Look for anti-patterns:
- God objects (too many responsibilities)
- Spaghetti code (unclear flow)
- Copy-paste duplication
- Tight coupling
- Missing error handling

### Technique: Dependency Analysis

```bash
# Check coupling
for file in src/*.py; do
  imports=$(grep -c "^import\|^from" "$file")
  echo "$file: $imports dependencies"
done | sort -t: -k2 -rn | head -5
```

## Security Assessment

### OWASP Top 10 Check

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
grep -rn "eval\|exec" .             # Code injection
grep -rn "password.*=\|api_key.*=" . # Hardcoded secrets
grep -rn "SELECT.*+\|DELETE.*+" .    # SQL injection
grep -rn "innerHTML\|dangerouslySetInnerHTML" . # XSS
```

## Analysis Script Patterns

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
