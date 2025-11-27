# Agent Selection Decision Trees

This document provides comprehensive decision trees, matrices, and selection strategies for choosing the right agent for any task.

## Level 1: Operation Type Classification

```
┌─────────────────────────────────────────────────────────────┐
│                    User Request Analysis                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    Is it a file operation?
                              │
            ┌─────────────────┴─────────────────┐
           Yes                                   No
            │                                     │
            ▼                                     ▼
    ┌──────────────┐                    Is it information gathering?
    │ File Domain  │                              │
    └──────────────┘                  ┌──────────┴──────────┐
            │                        Yes                    No
            ▼                         │                      │
    See File Operations              ▼                      ▼
                            ┌─────────────────┐    Is it evaluation/analysis?
                            │ Research Domain │             │
                            └─────────────────┘   ┌─────────┴─────────┐
                                    │            Yes                  No
                                    ▼             │                    │
                            See Research         ▼                    ▼
                                          ┌──────────────┐    Is it modification?
                                          │Analysis Domain│           │
                                          └──────────────┘  ┌────────┴────────┐
                                                  │        Yes               No
                                                  ▼         │                 │
                                          See Analysis     ▼                 ▼
                                                   ┌──────────────┐   Complex/Custom
                                                   │Writer Domain │   Multi-agent
                                                   └──────────────┘
                                                          │
                                                          ▼
                                                   See Modification
```

## Level 2: File Operations Domain

```
File Operation Request
        │
        ▼
Is it just listing/showing?
        │
    ┌───┴───┐
   Yes      No
    │        │
    ▼        ▼
  @list   Is it reading?
            │
        ┌───┴───┐
       Yes      No
        │        │
        ▼        ▼
    Single    Modifying?
    file?         │
      │       ┌───┴───┐
   ┌──┴──┐  Yes      No
  Yes   No   │
   │     │   ▼
   ▼     ▼  @file-writer
 @open @file-reader
```

### Decision Factors

**Use @list when:**
- "show directory contents"
- "list files in folder"
- "what files are in..."
- Just needs paths/names, not contents

**Use @open when:**
- "show me [single file]"
- "display contents of..."
- Quick viewing of one file
- No deep analysis needed

**Use @file-reader when:**
- "understand how [code] works"
- Multiple files involved
- Need structural analysis
- Comprehension required before action

**Use @file-writer when:**
- "create [file]"
- "add [feature] to [file]"
- "modify [file] to..."
- Any write/modify operation

## Level 3: Research Domain

```
Information Gathering Request
            │
            ▼
        Internal or external data?
            │
    ┌───────┴───────┐
Internal          External
    │                 │
    ▼                 ▼
Is it finding      @fetch
patterns/files?
    │
┌───┴───┐
Yes     No (understanding)
 │           │
 ▼           ▼
@base-    @file-reader
research
```

**Use @base-research when:**
- "find all files that..."
- "search for patterns"
- "locate where [X] is used"
- "research how [X] works in codebase"
- Exploratory investigation

**Use @fetch when:**
- "get data from [URL]"
- "download [external resource]"
- "call [API]"
- External data needed

**Use @file-reader when:**
- "understand this module"
- "explain how [code] works"
- Deep comprehension of existing code
- Not searching, but understanding

## Level 4: Analysis Domain

```
Evaluation/Analysis Request
            │
            ▼
    Is it evaluating subagent output?
            │
        ┌───┴───┐
       Yes      No
        │        │
        ▼        ▼
   @4d-      Is it quality/security/
evaluation  performance assessment?
                 │
             ┌───┴───┐
            Yes      No
             │
             ▼
        @base-analysis
```

**Use @4d-evaluation when:**
- Evaluating any subagent output (MANDATORY)
- Quality gate checkpoint
- Determining if work is excellent
- Deciding to accept or refine

**Use @base-analysis when:**
- "analyze code quality"
- "security assessment"
- "review this for..."
- "evaluate performance"
- Quality/security/maintainability evaluation

## Level 5: Modification Domain

```
Modification Request
        │
        ▼
Do you understand current state?
        │
    ┌───┴───┐
   Yes      No
    │        │
    ▼        ▼
@file-   First: @file-reader
writer   Then: @file-writer
```

### Pattern: Always Understand Before Modifying

**Bad:**
```markdown
User: "Add rate limiting to login"
→ @file-writer: Add rate limiting
```

**Good:**
```markdown
User: "Add rate limiting to login"
→ @file-reader: Understand current login implementation
→ @4d-evaluation: Verify understanding is complete
→ @file-writer: Add rate limiting (with context from reader)
```

## Agent Selection Matrices

### Agent Capability Matrix

| Task Type | Primary Agent | Secondary Agent | Evaluation Agent |
|-----------|--------------|-----------------|------------------|
| List files | list | - | (simple, skip eval) |
| Read single file | open | - | (simple, skip eval) |
| Understand code | file-reader | read skill | 4d-evaluation |
| Find patterns | base-research | - | 4d-evaluation |
| Analyze quality | base-analysis | - | 4d-evaluation |
| Security assessment | base-analysis | - | 4d-evaluation |
| Create/modify files | file-writer | write skill | 4d-evaluation |
| External data | fetch | - | 4d-evaluation |
| Evaluate output | 4d-evaluation | - | (is the evaluator) |

### Complexity Decision Matrix

| Complexity | Agent Count | Evaluation Count | Pattern |
|------------|-------------|------------------|---------|
| Simple | 1 | 0-1 | Single agent |
| Medium | 2-3 | 2-3 | Sequential pipeline |
| Complex | 4-6 | 4-6 | Parallel + sequential |
| Very Complex | 7+ | 7+ | Hybrid workflows |

### When to Escalate to User

| Situation | Action |
|-----------|--------|
| Ambiguous requirements | Ask for clarification |
| 5+ refinement iterations | Explain challenge, ask guidance |
| Impossible task | Explain why, suggest alternatives |
| Multiple valid approaches | Present options, ask preference |
| Missing information | Ask for needed details |
| External dependencies | Explain blockers, ask for resolution |

## Agent Capability Reference

### File Operations Agents

**list**
- **Capabilities:** Directory listings, file path enumeration
- **Use for:** "Show me files in...", "List all..."
- **Don't use for:** Reading contents, analysis, modification
- **Tools:** Glob, Bash (ls)

**open**
- **Capabilities:** Single file display
- **Use for:** "Show me [file]", quick viewing
- **Don't use for:** Multiple files, deep analysis, modification
- **Tools:** Read tool

**file-reader**
- **Capabilities:** Deep code comprehension, multi-file analysis
- **Use for:** Understanding structure, analyzing relationships
- **Don't use for:** Simple display, writing/modifying
- **Tools:** Read, Grep, comprehension skills
- **Activates:** read skill

**file-writer**
- **Capabilities:** File creation, modification, code generation
- **Use for:** Creating/editing files, implementing features
- **Don't use for:** Reading-only, research, analysis
- **Tools:** Write tool
- **Activates:** write skill

### Research & Analysis Agents

**base-research**
- **Capabilities:** Pattern finding, file searching, information gathering
- **Use for:** "Find all...", "Search for...", "Locate where..."
- **Don't use for:** Deep analysis, evaluation, modification
- **Tools:** Grep, Glob, Read
- **Activates:** base-research skill

**base-analysis**
- **Capabilities:** Quality evaluation, security assessment, performance analysis
- **Use for:** Code review, security audit, quality checks
- **Don't use for:** Finding files, simple reading, modification
- **Tools:** Read, Grep, analysis frameworks
- **Activates:** base-analysis skill

**4d-evaluation**
- **Capabilities:** Subagent output evaluation, quality gates
- **Use for:** Every subagent output (MANDATORY)
- **Don't use for:** Primary work (only for evaluation)
- **Tools:** Analysis frameworks
- **Activates:** 4d-evaluation skill

### External Data Agent

**fetch**
- **Capabilities:** External API calls, downloading data, web requests
- **Use for:** Getting external resources, API integration
- **Don't use for:** Local file operations, analysis
- **Tools:** Bash (curl, wget), API clients

## Agent Selection Anti-Patterns

### ❌ Anti-Pattern 1: Wrong Specialist

**Problem:** Using an agent outside its domain

```markdown
# BAD
@list: Analyze this code for security issues

# GOOD
@base-analysis: Analyze this code for security issues
```

**Why it's wrong:**
- `list` only shows directory contents
- No analysis capabilities
- Will fail or produce poor results

### ❌ Anti-Pattern 2: Over-Decomposition

**Problem:** Breaking simple tasks into too many steps

```markdown
# BAD
@list: Show directory
@open: Read file1
@open: Read file2
@open: Read file3

# GOOD
@file-reader: Read and analyze file1, file2, file3
```

**Why it's wrong:**
- Creates unnecessary context switches
- More evaluation overhead
- Harder to maintain context

### ❌ Anti-Pattern 3: Modify Without Understanding

**Problem:** Writing code without reading first

```markdown
# BAD
User: "Add validation to login"
@file-writer: Add validation to src/auth/login.py

# GOOD
User: "Add validation to login"
@file-reader: Understand current login implementation
@file-writer: Add validation based on understanding
```

**Why it's wrong:**
- May break existing code
- Duplicate existing validation
- Miss integration points

### ❌ Anti-Pattern 4: Serial When Parallel Possible

**Problem:** Running independent tasks sequentially

```markdown
# BAD (Takes 3x as long)
@base-analysis: Security analysis
@base-analysis: Performance analysis
@base-analysis: Maintainability analysis

# GOOD (Parallel)
Parallel:
├─ @base-analysis: Security
├─ @base-analysis: Performance
└─ @base-analysis: Maintainability
```

**Why it's wrong:**
- Wastes time
- No dependency between tasks
- Could complete faster

### ❌ Anti-Pattern 5: Skipping Evaluation

**Problem:** Accepting output without quality gate

```markdown
# BAD
@agent: Do task
[Accept output without evaluation]

# GOOD
@agent: Do task
@4d-evaluation: Evaluate output
[Accept only if EXCELLENT]
```

**Why it's wrong:**
- No quality control
- May deliver poor work
- Violates Maestro core principle

## Optimization Strategies

### When to Batch Operations

**Batch when:**
- Same agent type
- Same domain
- Related files/targets
- No dependencies between items

**Example:**
```markdown
# Instead of:
@open: Read file1
@open: Read file2
@open: Read file3

# Do:
@file-reader: Read and analyze file1, file2, file3
```

### When to Split Operations

**Split when:**
- Different domains (research vs analysis)
- Different specialties (security vs performance)
- Parallel execution possible
- Each part is complex enough

**Example:**
```markdown
# Instead of:
@base-analysis: Do security AND performance AND maintainability

# Do:
Parallel:
├─ @base-analysis: Security (detailed)
├─ @base-analysis: Performance (detailed)
└─ @base-analysis: Maintainability (detailed)
```

### Caching and Context Reuse

**Pattern: Store and Reuse**

```markdown
Step 1: @base-research
Finds: Files A, B, C

Step 2a: @file-reader (uses files A, B, C)
Step 2b: @base-analysis (uses files A, B, C)
Step 2c: @file-writer (uses files A, B, C)

Don't re-search in each step - pass the file list forward
```

## Quick Reference

### Agent Selection Flowchart

```
1. What type of operation?
   ├─ File operation → File agents (list/open/reader/writer)
   ├─ Research → Research agents (base-research/fetch)
   ├─ Analysis → Analysis agents (base-analysis)
   ├─ Evaluation → 4d-evaluation (mandatory for all subagents)
   └─ Complex → Multi-agent workflow

2. Within file operations:
   ├─ List only → list
   ├─ Read single → open
   ├─ Understand/analyze → file-reader
   └─ Modify/create → file-writer (after file-reader)

3. Within research:
   ├─ Find patterns/files → base-research
   ├─ External data → fetch
   └─ Understand code → file-reader

4. Within analysis:
   ├─ Subagent output → 4d-evaluation
   └─ Quality/security/performance → base-analysis
```

## Summary

**Key Principles:**
1. Select agents based on operation type and domain
2. Use decision trees to clarify agent choice
3. Understand before modifying (read → write)
4. Parallelize independent operations
5. Sequence dependent operations
6. Pass context explicitly between agents
7. Always evaluate outputs
8. Batch related operations
9. Split complex operations appropriately
10. Escalate blockers to user

**Decision Framework:**
- Simple task → Single agent → Evaluate → Done
- Medium task → Sequential pipeline → Evaluate each → Done
- Complex task → Parallel + sequential → Evaluate all → Synthesize → Done

**Quality Control:**
- Every output evaluated through 4d-evaluation
- Select appropriate agent for each task
- Use agents within their capability domains
- Optimize for both speed and quality
