# Workflow Patterns

This document provides detailed guidance on the 6 core orchestration workflow patterns: Simple Linear, Sequential Pipeline, Parallel Fanout, Conditional Branch, Iterative Refinement Loop, and Gather-Analyze-Act.

## Pattern 1: Simple Linear (Single Agent)

### When to Use

- Single, well-defined operation
- No dependencies on other operations
- Straightforward task

### Structure

```markdown
Delegate → Evaluate → Deliver

@agent
**PRODUCT:** [clear deliverable]
**PROCESS:** [steps]
**PERFORMANCE:** [criteria]

↓

@4d-evaluation
**PRODUCT:** Evaluate @agent output

↓

If EXCELLENT → Deliver
If NEEDS REFINEMENT → Re-delegate with coaching
```

### Examples

**Example 1: Simple File Reading**
```markdown
User: "Show me the authentication config file"

@open
**PRODUCT:** Display contents of config/auth.yaml
**PROCESS:** Read and format the file
**PERFORMANCE:** Complete, readable output

↓

@4d-evaluation (quick check)

↓

If EXCELLENT → Deliver to user
```

**Example 2: File Listing**
```markdown
User: "List all Python files in the project"

@list
**PRODUCT:** List all .py files in project
**PROCESS:** Use glob pattern **/*.py
**PERFORMANCE:** Complete file paths, sorted

↓

(Simple task, can skip evaluation)

↓

Deliver to user
```

**Example 3: Pattern Search**
```markdown
User: "Find all TODO comments"

@base-research
**PRODUCT:** Locate all TODO comments in codebase
**PROCESS:**
1. Search for pattern: TODO
2. List file:line for each occurrence
**PERFORMANCE:** Complete list with context

↓

@4d-evaluation

↓

If EXCELLENT → Deliver
```

## Pattern 2: Sequential Pipeline

### When to Use

- Multiple steps where each depends on previous
- Output of step N feeds into step N+1
- Cannot parallelize

### Structure

```markdown
Step 1 → Eval 1 → Step 2 → Eval 2 → Step 3 → Eval 3 → Deliver

@agent-1
**PRODUCT:** [deliverable-1]

↓ (evaluate)

@agent-2
**PRODUCT:** [deliverable-2]
**Context:** Use results from agent-1

↓ (evaluate)

@agent-3
**PRODUCT:** [deliverable-3]
**Context:** Use results from agent-2
```

### Example: Code Modification

```markdown
User: "Add validation to the user registration endpoint"

Step 1: @file-reader
**PRODUCT:** Understand current user registration implementation

**PROCESS:**
1. Read src/routes/register.py
2. Identify current validation logic
3. Map out data flow

**PERFORMANCE:** Complete understanding with code structure

↓

@4d-evaluation → EXCELLENT

↓

Step 2: @file-writer
**PRODUCT:** Add comprehensive input validation

**Context from Step 1:**
- Current file: src/routes/register.py
- Existing validation: email format only
- Missing: password strength, username length, SQL injection protection

**PROCESS:**
1. Add validation utilities
2. Update register endpoint
3. Add error messages

**PERFORMANCE:** Working validation with tests

↓

@4d-evaluation → EXCELLENT

↓

Deliver to user
```

### Example: Research → Analysis → Report

```markdown
User: "Analyze authentication security"

Step 1: @base-research
**PRODUCT:** Find all authentication-related code

↓ @4d-evaluation

Results: 5 files found

↓

Step 2: @file-reader
**PRODUCT:** Understand authentication implementation

**Context:** Files from Step 1

↓ @4d-evaluation

Understanding documented

↓

Step 3: @base-analysis
**PRODUCT:** Security assessment

**Context:** Understanding from Step 2

↓ @4d-evaluation

↓

Deliver security report
```

## Pattern 3: Parallel Fanout

### When to Use

- Multiple independent operations
- No dependencies between operations
- Results combined at end

### Structure

```markdown
        Fanout
          │
    ┌─────┼─────┐
    ▼     ▼     ▼
  Task1 Task2 Task3
    │     │     │
  Eval1 Eval2 Eval3
    │     │     │
    └─────┼─────┘
          │
      Combine/Synthesize
```

### Example: Multi-Domain Analysis

```markdown
User: "Analyze the API for security and performance issues"

Parallel Delegation:

Branch A: @base-analysis
**PRODUCT:** Security analysis of API
**PROCESS:** Check OWASP Top 10, input validation, auth
**PERFORMANCE:** Security report with vulnerabilities

Branch B: @base-analysis
**PRODUCT:** Performance analysis of API
**PROCESS:** Query efficiency, N+1, caching, bottlenecks
**PERFORMANCE:** Performance report with metrics

↓ (evaluate both)

@4d-evaluation (Branch A)
@4d-evaluation (Branch B)

↓ (both EXCELLENT)

Synthesize:
- Combine both reports
- Identify overlapping concerns
- Prioritize recommendations
- Deliver unified analysis
```

### Example: Parallel File Analysis

```markdown
User: "Review these 5 modules for quality"

Parallel:
├─ @base-analysis: Review auth module
├─ @base-analysis: Review user module
├─ @base-analysis: Review payment module
├─ @base-analysis: Review notification module
└─ @base-analysis: Review logging module

↓ Evaluate all

├─ @4d-evaluation (auth)
├─ @4d-evaluation (user)
├─ @4d-evaluation (payment)
├─ @4d-evaluation (notification)
└─ @4d-evaluation (logging)

↓ All EXCELLENT

Synthesize findings into unified quality report
```

## Pattern 4: Conditional Branch

### When to Use

- Next step depends on outcome of previous
- Different paths based on findings
- Decision points in workflow

### Structure

```markdown
Initial Task → Evaluate → Decision Point
                              │
                    ┌─────────┼─────────┐
                    ▼         ▼         ▼
              Condition1  Condition2  Condition3
                    │         │         │
                 Task A    Task B    Task C
```

### Example: Context-Dependent Modification

```markdown
User: "Fix the authentication bug"

Step 1: @base-research
**PRODUCT:** Find all authentication-related code

↓

@4d-evaluation → EXCELLENT

↓

Decision: How many files found?

┌─────────────────┬─────────────────┬─────────────────┐
│                 │                 │                 │
▼ (1-2 files)     ▼ (3-5 files)     ▼ (6+ files)
Branch A          Branch B          Branch C

Branch A (Simple):
  @file-reader → understand → @file-writer → fix

Branch B (Medium):
  @file-reader → understand all
  @base-analysis → identify bug location
  @file-writer → targeted fix

Branch C (Complex):
  @base-research → narrow down to likely files
  @file-reader → deep dive on suspects
  @base-analysis → root cause analysis
  @file-writer → comprehensive fix
```

### Example: Severity-Based Response

```markdown
User: "Check if the API has security issues"

Step 1: @base-analysis
**PRODUCT:** Security scan of API

↓

@4d-evaluation → EXCELLENT

↓

Decision: What severity issues found?

If CRITICAL issues:
  → Immediate detailed report
  → Prioritize fixes
  → @file-writer: Implement urgent fixes
  → Deliver with WARNING

If HIGH/MEDIUM issues:
  → Detailed report with recommendations
  → Prioritize by severity
  → Deliver with guidance

If LOW/NONE issues:
  → Summary report
  → Note good practices observed
  → Deliver with approval
```

## Pattern 5: Iterative Refinement Loop

### When to Use

- Output needs progressive improvement
- Multiple refinement cycles expected
- Coaching to improve quality

### Structure

```markdown
┌─────────────────┐
│  Delegate Task  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    Evaluate     │
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
EXCELLENT    NEEDS
    │      REFINEMENT
    │         │
    │    ┌────┴────┐
    │    │ Analyze │
    │    │ Issues  │
    │    └────┬────┘
    │         │
    │         ▼
    │    ┌────────────┐
    │    │   Coach &  │
    │    │ Re-delegate│
    │    └────┬───────┘
    │         │
    └─────────┘
       Accept
```

### Example: Analysis Refinement

```markdown
User: "Analyze authentication security"

Iteration 1:
@base-analysis
**PRODUCT:** Security analysis

↓

@4d-evaluation → NEEDS REFINEMENT
Issues:
- Missing file references
- No severity ratings
- Vague recommendations

↓

Iteration 2:
@base-analysis
**PRODUCT:** Security analysis (revised)
**Coaching:**
- Add file:line for every finding
- Rate severity: CRITICAL, HIGH, MEDIUM, LOW
- Provide specific fix steps

↓

@4d-evaluation → NEEDS REFINEMENT
Issues:
- Good on references
- Still missing OWASP framework check

↓

Iteration 3:
@base-analysis
**PRODUCT:** Security analysis (revised again)
**Coaching:**
- Apply OWASP Top 10 explicitly
- Map each finding to OWASP category

↓

@4d-evaluation → EXCELLENT

↓

Accept and deliver
```

### Example: Code Quality Improvement

```markdown
User: "Write a user authentication service"

Iteration 1:
@file-writer
**PRODUCT:** Authentication service

↓

@4d-evaluation → NEEDS REFINEMENT
Issues:
- Missing error handling
- No input validation
- Hardcoded values

↓

Iteration 2:
@file-writer (REFINEMENT)
**Coaching:**
1. Add try/catch for all external calls
2. Validate all inputs before use
3. Move hardcoded values to config

↓

@4d-evaluation → NEEDS REFINEMENT
Issues:
- Error handling added ✓
- Validation added ✓
- Still has hardcoded values in tests

↓

Iteration 3:
@file-writer (REFINEMENT)
**Coaching:**
Remove hardcoded values from test fixtures too

↓

@4d-evaluation → EXCELLENT

↓

Accept and deliver
```

## Pattern 6: Gather-Analyze-Act

### When to Use

- Common three-phase workflow
- Information → Understanding → Action
- Most complex user requests follow this

### Structure

```markdown
Phase 1: GATHER
  @base-research or @fetch
  → Collect information

Phase 2: ANALYZE
  @file-reader or @base-analysis
  → Understand/evaluate information

Phase 3: ACT
  @file-writer or deliver findings
  → Take action or report
```

### Example: Feature Addition

```markdown
User: "Add caching to the user profile endpoint"

Phase 1: GATHER
@base-research
**PRODUCT:** Find all profile-related code
**Files:** routes/profile.py, services/user.py, models/user.py

↓ @4d-evaluation → EXCELLENT

Phase 2: ANALYZE
@file-reader
**PRODUCT:** Understand current profile endpoint implementation
**Focus:** Data flow, DB queries, response format

↓ @4d-evaluation → EXCELLENT

@base-analysis
**PRODUCT:** Identify caching opportunities
**Analysis:**
- DB query on every request (slow)
- User data rarely changes
- Good candidate for Redis cache

↓ @4d-evaluation → EXCELLENT

Phase 3: ACT
@file-writer
**PRODUCT:** Implement Redis caching for profile endpoint
**PROCESS:**
1. Add cache decorator
2. Update profile route
3. Add cache invalidation on user update
**Context:** Based on analysis, cache user data for 5 minutes

↓ @4d-evaluation → EXCELLENT

Deliver to user
```

### Example: Bug Investigation and Fix

```markdown
User: "Users report login is slow"

Phase 1: GATHER
@base-research
**PRODUCT:** Find all login-related code and logs

↓ @4d-evaluation

Files found + log analysis

Phase 2: ANALYZE
@file-reader
**PRODUCT:** Understand login flow

↓ @4d-evaluation

@base-analysis
**PRODUCT:** Identify performance bottlenecks
**Findings:**
- Database query not indexed (500ms)
- Session creation synchronous (200ms)
- Password hashing too many rounds (300ms)
Total: ~1000ms login time

↓ @4d-evaluation

Phase 3: ACT
@file-writer
**PRODUCT:** Implement performance improvements
1. Add database index on username column
2. Make session creation async
3. Reduce bcrypt rounds from 15 to 12

↓ @4d-evaluation

↓

Deliver: Login time reduced from ~1000ms to ~150ms
```

## Hybrid Workflows

### Combining Patterns

**Sequential + Parallel:**
```markdown
Step 1 (Sequential): @base-research
Find all relevant files

↓

Step 2 (Parallel): Analyze each domain
├─ @base-analysis: Security
├─ @base-analysis: Performance
└─ @base-analysis: Quality

↓

Step 3 (Sequential): Synthesize findings
```

**Gather-Analyze-Act + Refinement:**
```markdown
Gather → Analyze → Act
           ↓
       (if NEEDS REFINEMENT)
           ↓
       Refine Analyze
           ↓
       Re-Act
```

**Conditional + Parallel:**
```markdown
Initial Assessment → Decision

If Complex:
  Parallel branches for different aspects
If Simple:
  Single sequential path
```

## Workflow Selection Guide

### Quick Decision Matrix

| Request Type | Primary Pattern | Secondary Pattern |
|--------------|----------------|-------------------|
| Single operation | Simple Linear | - |
| Multi-step dependent | Sequential Pipeline | - |
| Multi-aspect independent | Parallel Fanout | - |
| Outcome-dependent | Conditional Branch | - |
| Needs iteration | Refinement Loop | - |
| Complex feature | Gather-Analyze-Act | + Refinement |

### Complexity Indicators

**Use Simple Linear when:**
- Single agent can handle
- No complexity
- No dependencies
- Quick task

**Use Sequential Pipeline when:**
- 2-4 dependent steps
- Each step needs previous output
- Linear dependency chain

**Use Parallel Fanout when:**
- 2+ independent tasks
- No dependencies
- Can run simultaneously
- Speed matters

**Use Conditional Branch when:**
- Decision points exist
- Different paths based on findings
- Context-dependent approach

**Use Refinement Loop when:**
- Quality iteration expected
- Complex requirements
- Excellence takes multiple attempts

**Use Gather-Analyze-Act when:**
- Full feature/fix workflow
- Need understanding before action
- Most "add/fix/improve" requests

## Workflow Templates

### Template: Research Task

```markdown
@base-research
**PRODUCT:** Find all [X] in the codebase

**PROCESS:**
1. Search for [patterns]
2. List all relevant files
3. Categorize findings

**PERFORMANCE:**
- Complete file paths
- Categorized by type/purpose
- No false positives

↓

@4d-evaluation
**PRODUCT:** Evaluate research completeness

↓

If EXCELLENT:
  Deliver findings to user or pass to next agent
```

### Template: Analysis Task

```markdown
@base-analysis
**PRODUCT:** Analyze [component] for [aspect]

**PROCESS:**
1. Activate base-analysis skill
2. Read relevant files
3. Apply [framework/checklist]
4. Document findings with evidence

**PERFORMANCE:**
- Evidence: file:line references
- Severity/priority ratings
- Actionable recommendations
- Structured report format

↓

@4d-evaluation
**PRODUCT:** Evaluate analysis quality

↓

If NEEDS REFINEMENT:
  Coach on specific gaps and re-delegate
If EXCELLENT:
  Accept and deliver
```

### Template: Modification Task

```markdown
Step 1: @file-reader
**PRODUCT:** Understand current [component] implementation

**PERFORMANCE:** Complete structural understanding

↓ @4d-evaluation

Step 2: @file-writer
**PRODUCT:** [Modify/Create] [component] to [goal]

**Context from Step 1:** [Key findings]

**PERFORMANCE:**
- Working code
- Preserves existing functionality
- Evidence: file paths, line numbers

↓ @4d-evaluation

If EXCELLENT → Deliver
```

### Template: Multi-Phase Complex Task

```markdown
Phase 1: GATHER
@base-research: Find all relevant [X]
↓ @4d-evaluation

Phase 2: ANALYZE (Parallel)
├─ @base-analysis: [Aspect A]
├─ @base-analysis: [Aspect B]
└─ @base-analysis: [Aspect C]
↓ Evaluate all

Phase 3: SYNTHESIZE
Combine findings, identify patterns, prioritize

Phase 4: ACT
@file-writer: Implement changes based on analysis
↓ @4d-evaluation

Deliver comprehensive results
```

## Summary

**The Six Core Patterns:**

1. **Simple Linear** - Single agent → Evaluate → Deliver
2. **Sequential Pipeline** - Step 1 → Step 2 → Step 3 (dependent)
3. **Parallel Fanout** - Multiple independent agents → Synthesize
4. **Conditional Branch** - Assess → Choose path → Execute
5. **Iterative Refinement** - Delegate → Evaluate → Coach → Repeat
6. **Gather-Analyze-Act** - Research → Understand → Implement

**Pattern Selection:**
- Simple task → Simple Linear
- Dependent steps → Sequential Pipeline
- Independent tasks → Parallel Fanout
- Decision points → Conditional Branch
- Needs improvement → Refinement Loop
- Full feature → Gather-Analyze-Act

**Key Principles:**
- Choose pattern based on dependencies
- Combine patterns for complex workflows
- Always evaluate between major steps
- Pass context explicitly between steps
- Iterate until excellent
- Optimize for both speed and quality
