# Dependency Analysis - Advanced Patterns

Deep dive into detecting and analyzing dependencies between tasks for optimal execution planning.

## Dependency Types

### 1. Data Dependency
Task B needs output data from Task A

**Example:**
```
fetch(url) → content
analyze(content) → analysis
```
B (analyze) depends on A (fetch) for data

### 2. Ordering Dependency
Task B must happen after Task A, even without data exchange

**Example:**
```
validate_config() → ok
start_server() → running
```
B (start) must wait for A (validate) to complete first

### 3. Resource Dependency
Tasks compete for same resource

**Example:**
```
write_file_A() →
write_file_B() →
```
Both modify filesystem, may need sequential execution

### 4. No Dependency
Tasks are completely independent

**Example:**
```
fetch(url1) → content1
fetch(url2) → content2
```
Can run in parallel

## Detection Patterns

### Pattern 1: Output → Input Analysis

Check if any task's output becomes another task's input:

```
Task A outputs: X
Task B inputs: Y
Does Y depend on X?
  Yes → Sequential (A then B)
  No → Can be parallel
```

### Pattern 2: Keyword Analysis

Look for dependency keywords in task descriptions:

**Sequential Keywords:**
- "then", "after", "once", "when complete"
- "using the result", "with the output"
- "based on", "from the previous"

**Parallel Keywords:**
- "and", "also", "additionally"
- "at the same time", "in parallel"
- "both", "all"

### Pattern 3: Verb Analysis

**Sequential Verbs:**
- "fetch THEN analyze" → dependency
- "transform THEN validate" → dependency
- "get THEN process" → dependency

**Parallel Verbs:**
- "fetch AND fetch" → independent
- "analyze AND summarize" (same input) → parallel possible

## Dependency Graph Construction

### Step 1: List All Tasks
```
Tasks: [A, B, C, D]
```

### Step 2: Identify Dependencies
```
A → no dependencies
B → depends on A
C → depends on A
D → depends on B and C
```

### Step 3: Build Graph
```
    A
   / \
  B   C
   \ /
    D
```

### Step 4: Determine Execution Levels
```
Level 1: [A]           (no dependencies)
Level 2: [B, C]        (depend on A, parallel)
Level 3: [D]           (depends on B and C)
```

## Complex Scenarios

### Scenario 1: Diamond Dependency

```
      A
     / \
    B   C
     \ /
      D
```

**Execution:**
1. Run A
2. Run B and C in parallel (both need A)
3. Run D (needs both B and C)

### Scenario 2: Partial Dependencies

```
Tasks: [fetch1, fetch2, analyze1, analyze2, compare]

Dependencies:
- analyze1 needs fetch1
- analyze2 needs fetch2
- compare needs analyze1 and analyze2
```

**Execution:**
1. fetch1 and fetch2 in parallel
2. analyze1 and analyze2 in parallel (once their fetches complete)
3. compare (once both analyses complete)

### Scenario 3: Conditional Dependencies

```
fetch() → if success → analyze()
       → if fail → retry()
```

**Execution:**
1. Run fetch
2. Check result
3. Branch to next task based on outcome

## Decision Algorithm

```python
function canRunInParallel(taskA, taskB):
  if taskB.inputs.dependsOn(taskA.outputs):
    return false  // Sequential required

  if taskA.inputs.dependsOn(taskB.outputs):
    return false  // Sequential required

  if taskA.resource == taskB.resource:
    return false  // Resource conflict

  return true  // Can run in parallel
```

## Optimization Strategies

### Strategy 1: Maximize Parallelism

Group all independent tasks at each level:

```
Level 1: All tasks with no dependencies
Level 2: All tasks depending only on Level 1
Level 3: All tasks depending only on Level 1-2
...
```

### Strategy 2: Critical Path First

Identify the longest chain of dependencies:

```
Path A: fetch → transform → validate (3 steps)
Path B: fetch → analyze (2 steps)

Critical path: A (3 steps)
→ Prioritize starting Path A first
```

### Strategy 3: Early Start

Start independent tasks as early as possible:

```
Don't wait: Start all Level 1 tasks immediately
Don't delay: Start Level 2 tasks as soon as their dependencies complete
```

## Real-World Examples

### Example 1: Multi-Source Data Pipeline

**Request:** "Fetch from API1 and API2, combine, then analyze"

**Dependency Analysis:**
```
fetch_api1 → data1
fetch_api2 → data2
combine(data1, data2) → combined
analyze(combined) → result
```

**Execution Plan:**
```
Level 1 (parallel): [fetch_api1, fetch_api2]
Level 2 (sequential): [combine]
Level 3 (sequential): [analyze]
```

### Example 2: Content Processing

**Request:** "Fetch page, extract text, translate, and summarize"

**Dependency Analysis:**
```
fetch → html
extract(html) → text
translate(text) → translated
summarize(text) → summary
```

**Execution Plan:**
```
Sequential: fetch → extract → [translate, summarize in parallel]
```
Note: translate and summarize both need extract, but independent of each other

### Example 3: Comparison Task

**Request:** "Compare example.com and github.com"

**Dependency Analysis:**
```
fetch(example.com) → content1
fetch(github.com) → content2
compare(content1, content2) → comparison
```

**Execution Plan:**
```
Level 1 (parallel): [fetch example, fetch github]
Level 2 (sequential): [compare]
```

## Troubleshooting

### Issue: Unnecessary Sequential Execution

**Symptom:** Tasks running one-by-one when they could be parallel

**Solution:** Re-analyze dependencies, look for false dependencies

### Issue: Deadlock

**Symptom:** Task A waits for B, B waits for A

**Solution:** Circular dependency detected, redesign task flow

### Issue: Missing Data

**Symptom:** Task fails because input data not available

**Solution:** Dependency not detected, add explicit dependency
