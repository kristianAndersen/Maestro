# BaseAnalysis Skill: Methodology

Evaluation methodologies, assessment frameworks, and scoring techniques.

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
