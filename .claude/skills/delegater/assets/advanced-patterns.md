# Delegater: Advanced Patterns

Full worked examples, detailed dependency analysis, and data flow tracking. Load this when you need step-by-step implementation blueprints for real-world multi-agent workflows.

---

## Detailed Dependency Analysis

### Step-by-Step Process

**Step 1: List all tasks**
```
Tasks: fetch(url1), fetch(url2), compare, summarize
```

**Step 2: Map dependencies**
```
- fetch(url1): No dependencies
- fetch(url2): No dependencies
- compare: Needs fetch(url1) AND fetch(url2)
- summarize: Needs compare
```

**Step 3: Build execution levels**
```
Level 1 (parallel): fetch(url1), fetch(url2)
Level 2 (sequential): compare (waits for Level 1)
Level 3 (sequential): summarize (waits for Level 2)
```

**Step 4: Create execution plan**
```
Execute Level 1 → Wait for all → Execute Level 2 → Wait → Execute Level 3
```

---

## Data Flow Tracking

Track data state through each workflow step to avoid lost outputs:

```
Step 1: fetch returns content1, content2
  Data State: {content1: "...", content2: "..."}

Step 2: analyze(content1, content2) returns analysis
  Data State: {content1: "...", content2: "...", analysis: "..."}

Step 3: summarize(analysis) returns summary
  Data State: {content1: "...", content2: "...", analysis: "...", summary: "..."}

Final Return: summary
```

### Data Flow Patterns

**Direct Pass-Through**
```
Agent A output: "Result: X"
  ↓ (extract X)
Agent B input: "Process this: X"
```

**Multiple Inputs Aggregate**
```
Agent A output: result_A
Agent B output: result_B
  ↓ (combine)
Agent C input: "Compare result_A and result_B"
```

**Transform Before Passing**
```
Agent A output: "Complex data structure..."
  ↓ (extract relevant part)
Agent B input: "Just the core data needed"
```

---

## Real-World Example 1: Research Multiple Files and Synthesize

**Task:** "Research authentication patterns in auth.py, middleware.py, and routes.py, then synthesize findings"

**Dependency Analysis:**
- Research auth.py: Independent
- Research middleware.py: Independent
- Research routes.py: Independent
- Synthesize: Depends on ALL research tasks

**Execution Plan:**
```
Level 1 (parallel): Research all 3 files simultaneously
Level 2 (sequential): Synthesize findings from all 3
```

**Implementation:**
```
Step 1: Note execution plan in report:
  "Phase 1: Research 3 files — in progress"
  "Phase 2: Synthesize findings — pending"

Step 2: Parallel execution (one message, 3 Task calls):
  base-research(auth.py) → findings1
  base-research(middleware.py) → findings2
  base-research(routes.py) → findings3

Step 3: Collect results

Step 4: Note progress in report: "Phase 1 complete — research collected"

Step 5: Sequential execution:
  base-analysis("Synthesize: findings1, findings2, findings3") → synthesis

Step 6: Note progress in report: "Phase 2 complete — synthesis done"

Step 7: Return synthesis result
```

---

## Real-World Example 2: Fetch External Data and Process

**Task:** "Fetch data from API endpoint, validate schema, transform to CSV, store to file"

**Dependency Analysis:**
- Fetch: No dependencies
- Validate: Needs fetch output
- Transform: Needs validated data
- Store: Needs transformed data

**Execution Plan:**
```
Pipeline: fetch → validate → transform → store
(All sequential due to dependencies)
```

**Implementation:**
```
Step 1: Note execution plan in report:
  "Phase 1: Fetch from API — in progress"
  "Phase 2: Validate and transform — pending"
  "Phase 3: Store to file — pending"

Step 2: fetch agent → raw_data

Step 3: Note progress in report: "Phase 1 complete — data fetched"

Step 4: validate agent with raw_data → validated_data

Step 5: transform agent with validated_data → csv_data

Step 6: Note progress in report: "Phase 2 complete — validated and transformed"

Step 7: m-file-writer agent with csv_data → confirmation

Step 8: Note progress in report: "Phase 3 complete — all done"

Step 9: Return confirmation
```

---

## Error Handling Walkthroughs

### Strategy 1: Fail Fast (Critical Tasks)

When a task is critical and the workflow cannot proceed without it:

```
fetch(database_credentials) → FAIL
  ↓
STOP: Cannot proceed without credentials
Return error: "Critical task failed: fetch database credentials"
```

**Implementation:**
```
If critical agent fails:
  - Stop execution immediately
  - Return error with details
  - Don't proceed to dependent tasks
  - Report to Maestro for user notification
```

### Strategy 2: Continue with Partial Results (Optional Tasks)

When a task is optional and the workflow can produce useful output without it:

```
fetch(url1) → SUCCESS: content1
fetch(url2) → FAIL: timeout
  ↓
CONTINUE: Proceed with content1 only
analyze(content1) → analysis
Return: analysis + note("url2 fetch failed")
```

**Implementation:**
```
If optional agent fails:
  - Note the failure
  - Continue with available data
  - Include failure note in final result
  - Proceed with remaining tasks
```

### Strategy 3: Retry (Transient Failures)

When the failure appears transient (network timeout, temporary unavailability):

```
fetch(url) → FAIL: timeout
  ↓
Retry 1: fetch(url) → FAIL: timeout
  ↓
Retry 2: fetch(url) → SUCCESS: content
  ↓
Continue with content
```

**Implementation:**
```
If agent fails with transient error:
  - Retry up to 2 times with brief delay
  - If succeeds, continue normally
  - If still failing after 2 retries, apply Strategy 1 or 2
```
