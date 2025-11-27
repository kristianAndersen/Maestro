---
name: base-research
description: Activates for information gathering tasks; provides research methodology, source evaluation, and synthesis guidance
tools: Read, Grep, Glob, Bash, LS, WebSearch, WebFetch
---

# BaseResearch Skill

## Purpose

This skill provides comprehensive guidance for information gathering and research operations. It helps you discover sources, evaluate credibility, synthesize findings, and document research effectively.

## When to Use This Skill

This skill automatically activates when:

- Investigating unfamiliar topics or technologies
- Gathering information to make decisions
- Understanding how something works
- Finding documentation or examples
- Researching best practices or solutions

## Quick Start

For 80% of research operations, follow these principles:

1. **Start broad, then narrow** - Get overview first, then dive into specifics
2. **Use multiple sources** - Cross-reference to verify information
3. **Evaluate credibility** - Official docs > reputable blogs > forums
4. **Document as you go** - Capture sources and key findings
5. **Synthesize, don't just collect** - Understand and connect information

## Core Principles

### 1. **Structured Investigation**

Use systematic approach: define question → search → evaluate → synthesize.

### 2. **Source Diversity**

Use multiple types of sources: official docs, code examples, discussions, academic papers.

### 3. **Critical Evaluation**

Not all sources are equal. Verify authority, recency, and accuracy.

### 4. **Progressive Refinement**

Start with high-level understanding, progressively add detail.

### 5. **Evidence-Based Conclusions**

Base findings on concrete evidence, not assumptions.

## Research Methodology

### Phase 1: Define Question

```bash
# What exactly are you trying to learn?
question="How does authentication work in this framework?"

# Break into sub-questions:
# - What auth methods are supported?
# - How are credentials stored?
# - What's the session management approach?
```

### Phase 2: Identify Sources

```bash
# Official documentation
cat README.md
find . -name "*.md" -path "*/docs/*"

# Code examples
grep -r "auth\|login" examples/

# Tests (show usage)
grep -r "test.*auth" tests/

# Configuration
find . -name "*config*" -name "*.json" -o -name "*.yaml"
```

### Phase 3: Gather Information

```bash
# Read official docs first
cat docs/authentication.md

# Find code examples
grep -rn "authenticate\|login" src/

# Check tests for usage patterns
cat tests/test_auth.py

# Search discussions (if available)
grep -r "authentication" discussions/ issues/
```

### Phase 4: Evaluate and Synthesize

```markdown
# Research Findings: Authentication

## Sources

- docs/authentication.md (official, current)
- src/auth/login.py (implementation)
- tests/test_auth.py (usage examples)

## Key Findings

1. Supports JWT and session-based auth
2. Passwords hashed with bcrypt
3. Sessions stored in Redis
4. Token expiry: 24 hours

## Synthesis

Framework provides flexible auth with two methods...
```

## Source Evaluation

### Credibility Hierarchy

1. **Tier 1 (Highest):** Official documentation, source code
2. **Tier 2:** Well-maintained examples, official tutorials
3. **Tier 3:** Reputable blogs, established community resources
4. **Tier 4:** Forum posts, Stack Overflow (verify before trusting)
5. **Tier 5 (Lowest):** Random blogs, outdated tutorials

### Evaluation Criteria

```bash
# Check recency
stat -c%y file.md  # Last modified
git log -1 --format="%ai" file.md  # Last commit

# Check authority
# Is this official documentation?
# Is author credible/experienced?

# Check accuracy
# Does example actually work?
# Can you verify claims?
```

## Research Patterns

### Pattern: Technology Investigation

```bash
# 1. Find official docs
cat README.md docs/

# 2. Identify key concepts
grep -rn "Overview\|Introduction\|Getting Started" docs/

# 3. Find examples
find . -path "*/examples/*" -o -path "*/samples/*"

# 4. Check tests for patterns
grep -r "test" . | head -20

# 5. Synthesize understanding
# Document: What it is, what it does, how to use it
```

### Pattern: Problem-Solution Research

```bash
# 1. Define problem clearly
problem="Application crashes on startup"

# 2. Search error messages
grep -r "error message" logs/

# 3. Check known issues
grep -ri "crash\|startup" docs/ issues/

# 4. Find similar cases
# Search forums, discussions, issues

# 5. Try solutions and document results
```

### Pattern: Best Practices Research

```bash
# 1. Find official recommendations
grep -r "best practice\|recommended\|guideline" docs/

# 2. Study examples from maintainers
find . -path "*/examples/*" -name "*.py"

# 3. Check community consensus
# Review popular libraries/projects

# 4. Synthesize into guidelines
```

## Documentation Practices

### Capture Sources

```markdown
# Research Log

## Question

How to implement caching?

## Sources Consulted

- docs/caching.md (official docs)
- src/cache/redis.py (implementation)
- examples/cache-demo.py (example)
- https://redis.io/docs (Redis docs)

## Findings

[Document what you learned]
```

### Organize Findings

```markdown
# Caching Research

## Overview

[High-level summary]

## Key Concepts

- Cache invalidation
- TTL settings
- Cache backends

## Implementation Details

[Specific how-tos]

## Examples

[Code snippets]

## Gotchas

[Things to watch out for]
```

## Resources (Progressive Disclosure)

- **`resources/methodology.md`** - Advanced research strategies, source evaluation frameworks, synthesis techniques
- **`resources/patterns.md`** - Research workflow examples, documentation patterns, note-taking templates
- **`resources/troubleshooting.md`** - Handling conflicting sources, incomplete information, verification strategies

## Anti-Patterns

### ❌ Single Source Reliance

```bash
# BAD: Trust first result
info=$(grep "definition" first-file.md)

# GOOD: Cross-reference
official=$(cat docs/official.md)
examples=$(cat examples/demo.py)
# Verify consistency
```

### ❌ No Source Tracking

```bash
# BAD: Collect info without noting where from
echo "Feature X works like this..."

# GOOD: Document sources
echo "Feature X (per docs/features.md): works like this..."
```

### ❌ Assumption Over Evidence

```bash
# BAD: "This probably uses Redis"
conclusion="Uses Redis for caching"

# GOOD: Verify
grep -r "redis\|Redis" . && conclusion="Uses Redis (verified in code)"
```

## Quick Reference

```bash
# Research workflow
# 1. Define question clearly
# 2. Find official docs: cat README.md docs/
# 3. Check implementation: grep -r "topic" src/
# 4. Review examples: find . -path "*/examples/*"
# 5. Verify in tests: grep -r "test.*topic" tests/
# 6. Synthesize and document findings

# Source priority
# 1. Official docs
# 2. Source code
# 3. Tests/examples
# 4. Community resources

# Verification
# Cross-reference multiple sources
# Test examples yourself
# Check recency
# Evaluate authority
```
