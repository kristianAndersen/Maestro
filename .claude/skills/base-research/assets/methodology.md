# base-research Skill: Methodology

Advanced research strategies and systematic investigation approaches.

## 4-Phase Research Methodology

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

```
# Official documentation
Read(file_path: "README.md")
Glob(pattern: "**/*.md", path: "docs")

# Code examples
Grep(pattern: "auth|login", path: "examples")

# Tests (show usage)
Grep(pattern: "test.*auth", path: "tests")

# Configuration
Glob(pattern: "**/*config*.json")
Glob(pattern: "**/*config*.yaml")
```

### Phase 3: Gather Information

```
# Read official docs first
Read(file_path: "docs/authentication.md")

# Find code examples
Grep(pattern: "authenticate|login", path: "src")

# Check tests for usage patterns
Read(file_path: "tests/test_auth.py")

# Search discussions (if available)
Grep(pattern: "authentication", path: "discussions")
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

---

## Research Frameworks

### Framework: 5-Step Investigation
1. **Define:** Clearly state research question
2. **Discover:** Find relevant sources
3. **Evaluate:** Assess source credibility
4. **Synthesize:** Connect and understand information
5. **Document:** Record findings and sources

### Framework: Breadth-First vs Depth-First

**Breadth-First (start here):**
- Get overview from multiple sources
- Understand scope and key concepts
- Identify areas needing deep dive

**Depth-First (once focused):**
- Deep dive into specific area
- Understand implementation details
- Master specific topic

## Source Evaluation

### CRAAP Test
- **Currency:** Is information current?
- **Relevance:** Does it answer your question?
- **Authority:** Is source credible?
- **Accuracy:** Is information correct?
- **Purpose:** Why was it created?

### Evaluation Commands

```bash
# Check recency
stat -c%y file.md         # Last modified
git log -1 --format="%ai" file.md  # Last commit

# Check authority
# Is this official documentation?
# Is author credible/experienced?

# Check accuracy
# Does example actually work?
# Can you verify claims?
```

### Red Flags
- No author/date
- Conflicts with official docs
- No examples or evidence
- Overly promotional
- Outdated (check last update)

## Synthesis Techniques

### Progressive Summarization
1. Highlight key points while reading
2. Summarize highlights in own words
3. Create executive summary
4. Extract actionable insights

### Concept Mapping
Connect related ideas visually:
- Authentication → Sessions → Storage
- API → Endpoints → Methods → Parameters

### Comparative Analysis
Compare approaches across sources:
- What do all sources agree on?
- Where do they differ?
- Which is most authoritative?
