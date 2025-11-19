# BaseResearch Skill: Patterns

Concrete research workflow examples and documentation templates.

## Research Workflows

### Workflow: New Technology Research
```bash
#!/bin/bash
# Research new technology

topic="GraphQL"

echo "=== Phase 1: Overview ==="
# Find official docs
curl -s https://graphql.org/learn/ | grep -oP "(?<=<title>).*(?=</title>)"

echo "=== Phase 2: Core Concepts ==="
# Identify key terms
grep -r "query\|mutation\|subscription" docs/

echo "=== Phase 3: Examples ==="
# Find working examples
find . -name "*graphql*" -path "*/examples/*"

echo "=== Phase 4: Best Practices ==="
# Look for recommendations
grep -r "best practice\|recommended" docs/

echo "=== Phase 5: Synthesis ==="
# Document understanding
cat > research-notes.md << 'EOF'
# GraphQL Research Notes

## What it is
[Definition and purpose]

## Key Concepts
- Queries
- Mutations
- Subscriptions

## How to Use
[Basic usage patterns]

## Best Practices
[Recommendations from docs]
EOF
```

### Workflow: Problem Investigation
```bash
# Investigate specific problem
error="NullPointerException in UserService"

# 1. Capture error context
grep -C 10 "$error" logs/application.log > error-context.txt

# 2. Find relevant code
grep -rn "UserService" src/

# 3. Check for known issues
grep -ri "NullPointer" docs/ issues/

# 4. Research solutions
# Check similar errors in codebase history
git log --all --grep="NullPointer"

# 5. Document investigation
```

## Documentation Templates

### Research Log Template
```markdown
# Research Log: [Topic]

**Date:** YYYY-MM-DD
**Question:** [What are you trying to learn?]

## Sources Consulted
1. [Source name] - [URL/path] - [Brief note]
2. [Source name] - [URL/path] - [Brief note]

## Key Findings
- [Finding 1]
- [Finding 2]

## Open Questions
- [Question 1]
- [Question 2]

## Next Steps
- [Action 1]
- [Action 2]
```

### Technology Evaluation Template
```markdown
# [Technology Name] Evaluation

## Overview
[What it is, what it does]

## Pros
- [Advantage 1]
- [Advantage 2]

## Cons
- [Limitation 1]
- [Limitation 2]

## Use Cases
- [Good fit for...]
- [Not good for...]

## Decision
[Recommendation with rationale]

## Sources
- [Source 1]
- [Source 2]
```
