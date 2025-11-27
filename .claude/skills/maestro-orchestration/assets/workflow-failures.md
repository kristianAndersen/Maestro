# Workflow and Context Anti-Patterns

This document catalogs common mistakes in workflow design and context management, their symptoms, why they're problematic, and how to correct them.

## Category 3: Workflow Failures

### Anti-Pattern 3.1: Modify Without Understanding

**What it looks like:**
```markdown
User: "Add rate limiting to the login endpoint"

# BAD - Writing without reading
@file-writer

**PRODUCT:** Add rate limiting to src/auth/login.py

[Writer modifies code without understanding it]
[Breaks existing functionality]
[Misses integration points]
```

**Why it's wrong:**
- Risk breaking existing code
- May duplicate existing functionality
- Miss important context
- Poor integration
- Creates bugs

**Correct approach:**
```markdown
User: "Add rate limiting to the login endpoint"

# GOOD - Understand first
Step 1: @file-reader

**PRODUCT:** Understand current login endpoint implementation

**PROCESS:**
1. Read src/auth/login.py
2. Identify current authentication flow
3. Check for existing rate limiting
4. Document entry points and dependencies

**PERFORMANCE:** Complete understanding of current structure

↓

@4d-evaluation → EXCELLENT

↓

Step 2: @file-writer

**PRODUCT:** Add rate limiting to login endpoint

**Context from Step 1:**
- Current file: src/auth/login.py
- Entry point: POST /auth/login (line 45)
- No existing rate limiting
- Uses Flask framework
- Returns JWT token on success

**PROCESS:**
1. Add rate limiting decorator
2. Apply to login endpoint
3. Set limit: 5 attempts per minute
4. Return 429 status on limit exceeded

**PERFORMANCE:** Working rate limiting, preserves existing functionality
```

**Rule:** Always understand before modifying (read → write pattern).

**Symptoms:**
- Broken functionality after changes
- Duplicate features
- Poor integration
- Need to revert changes

**Fix:**
1. Before any modification: understand current state
2. Use @file-reader to comprehend code
3. Document findings
4. Then use @file-writer with context

### Anti-Pattern 3.2: Serial When Parallel Possible

**What it looks like:**
```markdown
User: "Analyze the API for security, performance, and maintainability"

# BAD - Sequential independent tasks
@base-analysis
**PRODUCT:** Security analysis
[Wait for completion]

@base-analysis
**PRODUCT:** Performance analysis
[Wait for completion]

@base-analysis
**PRODUCT:** Maintainability analysis
[Wait for completion]
```

**Why it's wrong:**
- Wastes time (3x longer)
- No dependencies between tasks
- Inefficient resource use
- Poor user experience (slow)

**Correct approach:**
```markdown
User: "Analyze the API for security, performance, and maintainability"

# GOOD - Parallel independent tasks
Parallel Delegation:

Branch A: @base-analysis
**PRODUCT:** Security analysis of API endpoints
**PROCESS:** Check OWASP Top 10, input validation, auth
**PERFORMANCE:** Security report with findings

Branch B: @base-analysis
**PRODUCT:** Performance analysis of API endpoints
**PROCESS:** Query efficiency, N+1 issues, caching opportunities
**PERFORMANCE:** Performance report with bottlenecks

Branch C: @base-analysis
**PRODUCT:** Maintainability analysis of API endpoints
**PROCESS:** Code quality, documentation, test coverage
**PERFORMANCE:** Maintainability report with recommendations

↓

Evaluate all three in parallel:
├─ @4d-evaluation (Branch A)
├─ @4d-evaluation (Branch B)
└─ @4d-evaluation (Branch C)

↓

Synthesize results into unified report
```

**Decision rule:**
- No dependencies between tasks → Parallel
- Task B needs Task A's results → Sequential

**Symptoms:**
- Long execution times
- Independent tasks run sequentially
- User waiting unnecessarily
- Inefficient workflow

**Fix:**
1. Identify independent tasks
2. Launch all in parallel
3. Evaluate each independently
4. Synthesize results at end

### Anti-Pattern 3.3: Parallel When Serial Required

**What it looks like:**
```markdown
User: "Find authentication files and analyze them for security issues"

# BAD - Parallel when there's a dependency
Parallel:
├─ @base-research: Find auth files
└─ @base-analysis: Analyze auth files

[Analysis starts before research completes]
[Analysis doesn't know which files to analyze]
```

**Why it's wrong:**
- Task B depends on Task A's output
- Creates race condition
- Analysis has no files to work with
- Must re-do work

**Correct approach:**
```markdown
User: "Find authentication files and analyze them for security issues"

# GOOD - Sequential when dependent
Step 1: @base-research
**PRODUCT:** Find all authentication-related files

↓

@4d-evaluation → EXCELLENT

Step 1 Results:
- src/auth/login.py
- src/auth/session.py
- src/auth/validators.py

↓

Step 2: @base-analysis
**PRODUCT:** Security analysis of authentication files

**Context from Step 1:**
Files to analyze:
- src/auth/login.py
- src/auth/session.py
- src/auth/validators.py

[Analysis uses the file list from Step 1]
```

**Decision rule:**
- Task B needs Task A output → Sequential (A then B)
- Task B independent of Task A → Parallel

**Symptoms:**
- Missing context in later steps
- Tasks failing due to lack of inputs
- Need to re-run tasks
- Incomplete results

**Fix:**
1. Identify dependencies between tasks
2. Create dependency graph
3. Sequential for dependencies
4. Parallel for independent branches

### Anti-Pattern 3.4: Stuck Refinement Loop

**What it looks like:**
```markdown
Iteration 1: @agent → @4d-evaluation → NEEDS REFINEMENT
Iteration 2: @agent → @4d-evaluation → NEEDS REFINEMENT
Iteration 3: @agent → @4d-evaluation → NEEDS REFINEMENT
Iteration 4: @agent → @4d-evaluation → NEEDS REFINEMENT
Iteration 5: @agent → @4d-evaluation → NEEDS REFINEMENT
Iteration 6: @agent → @4d-evaluation → NEEDS REFINEMENT
[Continues indefinitely...]
```

**Why it's wrong:**
- Not making progress
- Same issues recurring
- Wrong agent or impossible task
- Wastes resources
- Frustrates user

**Correct approach:**
```markdown
Iteration 1: @agent → NEEDS REFINEMENT
Iteration 2: @agent → NEEDS REFINEMENT
Iteration 3: @agent → NEEDS REFINEMENT

# Circuit breaker at 3 iterations
Analyze: Why isn't this working?
- Is coaching specific enough?
- Is the right agent selected?
- Is the task actually possible?
- Is something missing/ambiguous?

If coaching is vague:
  → Improve coaching specificity

If wrong agent:
  → Switch to correct agent

If task impossible/ambiguous:
  → Escalate to user for clarification

Iteration 4: [With corrections] → @4d-evaluation

Iteration 5: Still stuck?

# Circuit breaker at 5 iterations
Escalate to user:
"I've attempted to [task] 5 times but facing persistent challenges:
- Issue 1: [specific problem]
- Issue 2: [specific problem]

To proceed, I need:
- Clarification on [X]
- Or: Alternative approach [Y]
- Or: Accept current state with known limitations [Z]

How would you like me to proceed?"
```

**Circuit breaker rules:**
- After 3 iterations: Analyze root cause and adjust
- After 5 iterations: Escalate to user
- Never: Continue indefinitely without intervention

**Symptoms:**
- Same issues in every iteration
- No convergence toward EXCELLENT
- Evaluation feedback not changing
- Apparent infinite loop

**Fix:**
1. Implement circuit breaker at 3 iterations
2. Analyze why not converging:
   - Vague coaching? Make specific
   - Wrong agent? Switch agents
   - Impossible task? Simplify or escalate
3. Hard stop at 5 iterations
4. Escalate to user with explanation

## Category 4: Context Management Failures

### Anti-Pattern 4.1: Context Pollution (Heavy Work in Conductor)

**What it looks like:**
```markdown
# BAD - Maestro doing heavy work
User: "Analyze these 20 files"

[Maestro reads all 20 files directly]
[Maestro analyzes each file]
[Maestro synthesizes results]
[Context window full of file contents]
```

**Why it's wrong:**
- Pollutes conductor context
- Reduces available context for orchestration
- Defeats purpose of delegation
- Can't track as many parallel operations

**Correct approach:**
```markdown
# GOOD - Delegate heavy work
User: "Analyze these 20 files"

@file-reader

**PRODUCT:** Read and analyze these 20 files for [purpose]

**Files:** [list of 20 files]

**PROCESS:**
1. Read each file
2. Analyze for [criteria]
3. Summarize findings

**PERFORMANCE:** Structured summary with key findings

[Heavy work happens in subagent context]
[Maestro context stays clean]
```

**Rule:** Maestro orchestrates, doesn't execute. Heavy processing happens in subagent contexts.

**Symptoms:**
- Long files in conductor context
- Maestro performing analysis directly
- Context window limitations hit
- Reduced orchestration capacity

**Fix:**
1. Delegate heavy operations to agents
2. Keep conductor context minimal
3. Focus on orchestration, not execution

### Anti-Pattern 4.2: Lost Context Between Steps

**What it looks like:**
```markdown
Step 1: @base-research
Finds: file1.py, file2.py, file3.py

↓

Step 2: @base-analysis
**PRODUCT:** Analyze the authentication files

# BAD - No context passed
[Which files? Agent doesn't know]
[Has to search again]
```

**Why it's wrong:**
- Wastes work from previous step
- Agent lacks necessary context
- Duplicate effort
- May analyze wrong files

**Correct approach:**
```markdown
Step 1: @base-research
**PRODUCT:** Find authentication files

Results:
- file1.py
- file2.py
- file3.py

↓

Step 2: @base-analysis
**PRODUCT:** Analyze authentication files for security

**Context from Step 1:**
Files identified by base-research:
- file1.py
- file2.py
- file3.py

Your task: Analyze THESE THREE FILES for security issues

[Agent has explicit context]
```

**Pattern: Explicit Context Handoff**
```markdown
Step N completes with results → Step N+1 receives:
**Context from Step N:**
[Relevant results from previous step]

**Your Task:**
[Build on those results]
```

**Symptoms:**
- Agents asking "which files?"
- Duplicate work
- Missing information
- Poor integration between steps

**Fix:**
1. Capture results from each step
2. Pass relevant results to next step
3. Make context explicit in delegation
4. Don't assume agents remember previous steps

## Summary

**Workflow Anti-Patterns:**
1. Modify Without Understanding - Writing code without reading first
2. Serial When Parallel Possible - Running independent tasks sequentially
3. Parallel When Serial Required - Parallelizing dependent tasks
4. Stuck Refinement Loop - Infinite iterations without progress

**Context Management Anti-Patterns:**
1. Context Pollution - Maestro doing heavy work instead of delegating
2. Lost Context Between Steps - Not passing results forward

**Key Principles:**
- Understand before modifying (read → write)
- Parallelize independent tasks
- Sequence dependent tasks
- Implement circuit breakers (3 and 5 iterations)
- Delegate heavy work to agents
- Pass context explicitly between steps
- Respect dependencies in workflows
- Escalate when stuck
