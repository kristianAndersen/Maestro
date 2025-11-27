# Multi-Agent Coordination

This document provides detailed guidance on coordinating multiple agents, passing context between agents, managing dependencies, and handling complex multi-agent workflows.

## Passing Context Between Agents

### Pattern: Explicit Context Handoff

The fundamental principle of multi-agent coordination is explicit context passing. Never assume agents have access to previous work.

**Structure:**
```markdown
Agent 1 completes task → produces results

Agent 2 receives:
**Context from Agent 1:**
- Finding 1
- Finding 2
- Key insight

**Your Task:**
Build on Agent 1's findings to...
```

### Example: Research → Analysis Handoff

```markdown
Step 1: @base-research
**PRODUCT:** Find all authentication files

**Results:**
Found 5 authentication files:
- src/auth/login.py
- src/auth/session.py
- src/auth/validators.py
- config/auth.yaml
- config/security.yaml

↓

@4d-evaluation → EXCELLENT

↓

Step 2: @file-reader
**PRODUCT:** Read and analyze authentication files for security

**Context from base-research:**
Files identified:
- src/auth/login.py
- src/auth/session.py
- src/auth/validators.py
- config/auth.yaml
- config/security.yaml

**Your Task:**
Read and analyze THESE FIVE FILES for security issues.
Focus on: authentication logic, password handling, session management.

[Agent has explicit context from previous step]
```

### Context Handoff Checklist

When passing context between agents:
- [ ] Include specific files/data from previous step
- [ ] Summarize key findings relevant to next agent
- [ ] Explicitly state what to do with the context
- [ ] Reference previous agent by name
- [ ] Make dependencies clear

## Coordinating Parallel Operations

### Pattern: Parallel with Barrier

When multiple agents work independently, coordinate with a synchronization barrier before proceeding.

**Structure:**
```markdown
Fork to N agents → All complete → Barrier → Synthesize

Example:
User: "Analyze entire codebase for quality"

Parallel:
├─ @base-analysis (Security focus)
├─ @base-analysis (Performance focus)
├─ @base-analysis (Maintainability focus)
└─ @base-analysis (Testing focus)

Barrier: Wait for all to complete and pass evaluation

Synthesize:
- Combine all reports
- Identify patterns
- Prioritize recommendations
- Create unified action plan
```

### Example: Multi-Domain Analysis

```markdown
User: "Complete API audit"

Parallel Delegation:

Branch A: @base-analysis
**PRODUCT:** Security analysis of API endpoints
**PROCESS:** OWASP Top 10, input validation, authentication, authorization
**PERFORMANCE:** Security report with CRITICAL/HIGH/MEDIUM/LOW findings

Branch B: @base-analysis
**PRODUCT:** Performance analysis of API endpoints
**PROCESS:** Query efficiency, N+1 problems, caching opportunities, bottlenecks
**PERFORMANCE:** Performance report with metrics and recommendations

Branch C: @base-analysis
**PRODUCT:** Code quality analysis of API endpoints
**PROCESS:** Maintainability, documentation, test coverage, complexity
**PERFORMANCE:** Quality report with scores and improvement areas

Branch D: @base-analysis
**PRODUCT:** Error handling analysis of API endpoints
**PROCESS:** Exception handling, logging, monitoring, alerting
**PERFORMANCE:** Error handling report with gaps and recommendations

↓

BARRIER: Evaluate all four branches

├─ @4d-evaluation (Branch A: Security)
├─ @4d-evaluation (Branch B: Performance)
├─ @4d-evaluation (Branch C: Quality)
└─ @4d-evaluation (Branch D: Error handling)

↓

All EXCELLENT → Proceed

↓

SYNTHESIS:
Combine all four reports:

**Critical Issues (Across all domains):**
- [Security] SQL injection in login endpoint
- [Performance] N+1 query in user list (500ms)
- [Error Handling] No logging on payment failures

**High Priority:**
- [Security] Missing rate limiting
- [Performance] Missing cache on profile endpoint
- [Quality] Test coverage only 45%

**Patterns Identified:**
- Input validation inconsistent across endpoints
- Error responses lack structure
- No performance monitoring

**Unified Recommendations (Prioritized):**
1. Fix SQL injection (CRITICAL, security)
2. Add payment failure logging (CRITICAL, error handling)
3. Fix N+1 query issue (HIGH, performance)
...

Deliver comprehensive audit report to user
```

### Parallel Coordination Patterns

**Pattern 1: Independent Parallel**
```markdown
Fork → Work independently → Evaluate each → Combine

No inter-agent communication needed
Each agent has complete information
Results combined at end
```

**Pattern 2: Shared Context Parallel**
```markdown
Gather context → Fork with context → Work independently → Combine

Common setup phase first
Each agent uses same base context
Different focus areas
```

**Pattern 3: Progressive Parallel**
```markdown
Phase 1 parallel → Barrier → Phase 2 parallel → Barrier

Multiple waves of parallelism
Each wave builds on previous
Synchronization between waves
```

## Managing Dependencies

### Dependency Graph Pattern

**Rule:** When Task B depends on Task A's output, they must run sequentially.

**Structure:**
```markdown
When Task B depends on Task A:
  Task A → Evaluate A → Task B (with A's results)

When Tasks B and C both depend on A:
  Task A → Evaluate A → Fork to B and C (both get A's results)

When Task D depends on both B and C:
  Tasks B and C (parallel) → Both evaluated → Task D (with B and C results)
```

### Example: Simple Dependency Chain

```markdown
User: "Add logging to the authentication flow"

Task A: @base-research
**PRODUCT:** Find all authentication files

↓ @4d-evaluation

Results:
- src/auth/login.py
- src/auth/session.py

↓ (B depends on A)

Task B: @file-reader
**PRODUCT:** Understand authentication flow

**Context from Task A:**
Files to read: login.py, session.py

↓ @4d-evaluation

Understanding:
- Login happens in login.py:authenticate()
- Session created in session.py:create_session()
- No logging currently

↓ (C depends on B)

Task C: @file-writer
**PRODUCT:** Add comprehensive logging

**Context from Task B:**
- Add logging to login.py:authenticate() (line 45)
- Add logging to session.py:create_session() (line 23)
- Log: login attempts, success/failure, session creation

↓ @4d-evaluation

Deliver
```

### Example: Diamond Dependency

```markdown
User: "Optimize the user profile endpoint"

       Task A: Research
            │
    ┌───────┴───────┐
    │               │
Task B: Read     Task C: Benchmark
    │               │
    └───────┬───────┘
            │
       Task D: Optimize


Task A: @base-research
**PRODUCT:** Find profile-related code

↓ @4d-evaluation

Results: 3 files found

↓ (B and C both depend on A - can run parallel)

Parallel:
├─ Task B: @file-reader
│  **PRODUCT:** Understand profile code
│  **Context from A:** Files found
│
└─ Task C: @base-analysis
   **PRODUCT:** Performance benchmark
   **Context from A:** Files found

↓ Evaluate both

Task B results: Profile loads user + posts + friends
Task C results: Takes 800ms, 15 DB queries

↓ (D depends on both B and C)

Task D: @file-writer
**PRODUCT:** Optimize profile endpoint

**Context from Task B:**
- Profile structure: user + posts + friends
- Current implementation in profile.py:get_profile()

**Context from Task C:**
- Current performance: 800ms
- Problem: 15 DB queries (N+1 issue)

**Optimization:**
- Add eager loading for posts and friends
- Reduce to 3 queries
- Target: <200ms

↓ @4d-evaluation

Deliver optimized implementation
```

### Example: Complex Dependency Graph

```markdown
User: "Migrate authentication from sessions to JWT"

Dependency map:
A: Research current implementation
├─ B: Understand session code (depends on A)
├─ C: Understand auth flow (depends on A)
└─ D: Find all session usage (depends on A)

E: Design JWT implementation (depends on B, C, D)
├─ F: Implement JWT service (depends on E)
├─ G: Update auth endpoints (depends on E)
└─ H: Update middleware (depends on E)

I: Migration strategy (depends on F, G, H)
J: Execute migration (depends on I)


Execution plan:

Phase 1: Task A (research)
↓
Phase 2: Tasks B, C, D (parallel - all depend on A)
↓
Phase 3: Task E (design - depends on B, C, D)
↓
Phase 4: Tasks F, G, H (parallel - all depend on E)
↓
Phase 5: Task I (strategy - depends on F, G, H)
↓
Phase 6: Task J (execute - depends on I)
```

## Coordination Strategies

### Strategy 1: Divide and Conquer

**When to use:** Large task that can be split into independent subtasks

**Pattern:**
```markdown
1. Analyze task
2. Identify natural divisions
3. Fork to specialists
4. Synthesize results
```

**Example:**
```markdown
User: "Review all 50 files for quality"

1. Divide files by domain:
   - Authentication (10 files)
   - API routes (15 files)
   - Database (12 files)
   - Utilities (8 files)
   - Tests (5 files)

2. Parallel delegation:
   ├─ @base-analysis: Review auth files
   ├─ @base-analysis: Review API files
   ├─ @base-analysis: Review DB files
   ├─ @base-analysis: Review utility files
   └─ @base-analysis: Review test files

3. Evaluate all

4. Synthesize: Combined quality report
```

### Strategy 2: Pipeline with Parallel Stages

**When to use:** Sequential phases where each phase has parallel work

**Pattern:**
```markdown
Stage 1 → Barrier → Stage 2 (parallel) → Barrier → Stage 3
```

**Example:**
```markdown
User: "Add caching layer to all API endpoints"

Stage 1 (Sequential):
@base-research: Find all API endpoints
↓ @4d-evaluation
Result: 25 endpoints found

Stage 2 (Parallel):
Group endpoints by domain
├─ @file-reader: Understand user endpoints (8 endpoints)
├─ @file-reader: Understand content endpoints (10 endpoints)
└─ @file-reader: Understand admin endpoints (7 endpoints)
↓ Evaluate all

Stage 3 (Parallel):
├─ @file-writer: Add caching to user endpoints
├─ @file-writer: Add caching to content endpoints
└─ @file-writer: Add caching to admin endpoints
↓ Evaluate all

Deliver: Caching implemented across all 25 endpoints
```

### Strategy 3: Incremental Parallel Expansion

**When to use:** Start with subset, expand based on findings

**Pattern:**
```markdown
Sample → Analyze → If patterns found → Expand to full set
```

**Example:**
```markdown
User: "Check all 100 components for accessibility issues"

Phase 1: Sample (5 components)
@base-analysis: Analyze 5 representative components
↓ @4d-evaluation

Finding: 3 common patterns found:
- Missing alt text on images
- Insufficient color contrast
- Missing ARIA labels

Phase 2: Expand (parallel on remaining 95)
Group into 10 batches
├─ @base-analysis: Batch 1 (10 components)
├─ @base-analysis: Batch 2 (10 components)
├─ @base-analysis: Batch 3 (10 components)
...
└─ @base-analysis: Batch 10 (5 components)

Each batch checks for the 3 known patterns
↓ Evaluate all

Synthesize: Complete accessibility report
```

## Coordination Anti-Patterns

### ❌ Anti-Pattern: Lost Context

**Problem:** Agent doesn't receive context from previous step

```markdown
# BAD
Step 1: @base-research → Finds files A, B, C

Step 2: @base-analysis
**PRODUCT:** Analyze the files

[Which files? Agent doesn't know]
```

**Solution:** Explicit context handoff

```markdown
# GOOD
Step 1: @base-research → Finds files A, B, C

Step 2: @base-analysis
**PRODUCT:** Analyze authentication files

**Context from Step 1:**
Files found: A, B, C

Analyze THESE THREE FILES
```

### ❌ Anti-Pattern: Duplicate Work

**Problem:** Multiple agents doing same work

```markdown
# BAD
@base-research: Find auth files
→ Result: file1.py, file2.py

@base-analysis: Analyze auth
→ [Searches for files again]
→ [Duplicates research work]
```

**Solution:** Pass findings forward

```markdown
# GOOD
@base-research: Find auth files
→ Result: file1.py, file2.py

@base-analysis: Analyze auth
**Context:** Files are file1.py, file2.py
→ [Uses provided files, no duplicate search]
```

### ❌ Anti-Pattern: Broken Dependencies

**Problem:** Running dependent tasks in parallel

```markdown
# BAD - B depends on A, but running parallel
Parallel:
├─ Task A: Research
└─ Task B: Analyze (needs A's results)

[B starts before A completes]
[B lacks necessary context]
```

**Solution:** Respect dependencies

```markdown
# GOOD - Sequential when dependent
Task A: Research
↓ Complete
Task B: Analyze (with A's results)
```

### ❌ Anti-Pattern: Sequential When Parallel Possible

**Problem:** Running independent tasks sequentially

```markdown
# BAD - Independent tasks run sequentially
@base-analysis: Security audit
[Wait]
@base-analysis: Performance audit
[Wait]
@base-analysis: Quality audit
```

**Solution:** Parallelize independent work

```markdown
# GOOD - Independent tasks run parallel
Parallel:
├─ @base-analysis: Security
├─ @base-analysis: Performance
└─ @base-analysis: Quality
```

## Context Tracking Templates

### Template: Simple Sequential Context

```markdown
Step N: @agent
**PRODUCT:** [Deliverable]

↓ @4d-evaluation

**Results from Step N:**
- Key finding 1
- Key finding 2
- Key data

↓

Step N+1: @agent
**Context from Step N:**
- [Relevant results]

**Your Task:**
[Build on Step N results]
```

### Template: Parallel to Sequential Context

```markdown
Parallel Phase:
├─ Branch A: @agent → Results A
├─ Branch B: @agent → Results B
└─ Branch C: @agent → Results C

↓ Evaluate all

**Combined Context:**
- From Branch A: [Results A]
- From Branch B: [Results B]
- From Branch C: [Results C]

↓

Sequential Phase:
@agent
**Context from Parallel Phase:**
[All results from A, B, C]

**Your Task:**
[Synthesize or build on combined results]
```

### Template: Diamond Pattern Context

```markdown
Initial: @agent
**Results:** [Shared context]

↓

Parallel (both use shared context):
├─ Branch A: @agent (focus X) → Results A
└─ Branch B: @agent (focus Y) → Results B

↓

Final: @agent
**Context from Initial:** [Shared context]
**Context from Branch A:** [Results A]
**Context from Branch B:** [Results B]

**Your Task:**
[Integrate all contexts]
```

## Summary

**Key Principles:**
1. **Explicit Context:** Always pass context explicitly between agents
2. **Respect Dependencies:** Sequential for dependent tasks, parallel for independent
3. **Barrier Synchronization:** Wait for all parallel branches before proceeding
4. **Avoid Duplication:** Pass results forward, don't re-do work
5. **Track Provenance:** Note which agent produced which results

**Context Handoff Pattern:**
```markdown
**Context from [Agent Name]:**
- Specific finding/data
- Relevant results
- Key insights

**Your Task:**
[What to do with the context]
```

**Dependency Rules:**
- Task B needs Task A output → Sequential (A then B)
- Tasks B and C both need Task A → A, then parallel B & C
- Task D needs B and C → Parallel B & C, then D
- Tasks B and C independent → Parallel B & C

**Coordination Strategies:**
- **Divide and Conquer:** Split large task into independent subtasks
- **Pipeline with Parallel Stages:** Sequential phases, each with parallel work
- **Incremental Expansion:** Sample → Analyze patterns → Expand

**Quality Control:**
- Evaluate each agent's output before using as context
- Verify context completeness before next step
- Track which agent produced which results
- Document dependencies explicitly
