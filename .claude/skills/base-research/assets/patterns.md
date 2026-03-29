# base-research Skill: Patterns

Concrete research workflow examples and documentation templates.

## Research Patterns

### Pattern: Technology Investigation

```
# 1. Find official docs
Read(file_path: "README.md")
Glob(pattern: "docs/**/*.md")

# 2. Identify key concepts
Grep(pattern: "Overview|Introduction|Getting Started", path: "docs")

# 3. Find examples
Glob(pattern: "**/examples/**")
Glob(pattern: "**/samples/**")

# 4. Check tests for patterns
Grep(pattern: "test", path: ".")

# 5. Synthesize understanding
# Document: What it is, what it does, how to use it
```

### Pattern: Problem-Solution Research

```
# 1. Define problem clearly
problem="Application crashes on startup"

# 2. Search error messages
Grep(pattern: "error message", path: "logs")

# 3. Check known issues
Grep(pattern: "crash|startup", path: "docs")

# 4. Find similar cases
# Search forums, discussions, issues

# 5. Try solutions and document results
```

### Pattern: Best Practices Research

```
# 1. Find official recommendations
Grep(pattern: "best practice|recommended|guideline", path: "docs")

# 2. Study examples from maintainers
Glob(pattern: "**/examples/**/*.py")

# 3. Check community consensus
# Review popular libraries/projects

# 4. Synthesize into guidelines
```

---

## Research Workflows

### Workflow: New Technology Research
```bash
#!/bin/bash
topic="GraphQL"

echo "=== Phase 1: Overview ==="
curl -s https://graphql.org/learn/ | grep -oP "(?<=<title>).*(?=</title>)"

echo "=== Phase 2: Core Concepts ==="
grep -r "query\|mutation\|subscription" docs/

echo "=== Phase 3: Examples ==="
find . -name "*graphql*" -path "*/examples/*"

echo "=== Phase 4: Best Practices ==="
grep -r "best practice\|recommended" docs/

echo "=== Phase 5: Synthesis ==="
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
error="NullPointerException in UserService"

# 1. Capture error context
grep -C 10 "$error" logs/application.log > error-context.txt

# 2. Find relevant code
grep -rn "UserService" src/

# 3. Check for known issues
grep -ri "NullPointer" docs/ issues/

# 4. Research solutions via git history
git log --all --grep="NullPointer"

# 5. Document investigation
```

---

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

### Organized Findings Template
```markdown
# [Topic] Research

## Overview
[High-level summary]

## Key Concepts
- [Concept 1]
- [Concept 2]

## Implementation Details
[Specific how-tos]

## Examples
[Code snippets]

## Gotchas
[Things to watch out for]
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
