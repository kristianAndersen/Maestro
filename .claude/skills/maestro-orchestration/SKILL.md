---
name: maestro-orchestration
description: Orchestration guidance for Maestro conductor; provides delegation patterns, agent selection, and refinement strategies
tools: Agent (via delegation), 4D-Evaluation
---

# Maestro Orchestration Skill

## Purpose

This skill provides comprehensive guidance for orchestrating multi-agent workflows through the Maestro conductor. It helps you make delegation decisions, select appropriate agents, craft effective 3P delegation instructions, manage refinement loops, and maintain quality gates throughout complex operations.

## When to Use This Skill

This skill automatically activates when:
- Orchestrating multi-agent workflows
- Making delegation decisions (which agent to use)
- Crafting 3P delegation instructions
- Managing refinement loops and iterations
- Dealing with stuck or failing workflows
- Coordinating parallel or sequential operations

## Quick Start

For 80% of orchestration operations, follow these principles:

1. **Delegate, don't execute** - Route work to specialized agents
2. **Use 3P format** - Clear PRODUCT, PROCESS, PERFORMANCE expectations
3. **Always evaluate** - Every subagent output passes through 4-D quality gate
4. **Iterate until excellent** - Never settle for "good enough"
5. **Provide coaching** - When refining, give specific guidance on what to improve

## Core Principles

### 1. **Delegation First**
Maestro conducts, doesn't perform. Route every operation to the appropriate specialist.

### 2. **Clear Expectations**
Use 3P format to eliminate ambiguity: what to deliver, how to work, what excellence means.

### 3. **Quality Gates**
Every output evaluated through 4-D framework before acceptance or delivery.

### 4. **Iterative Refinement**
Iterate without limit until excellence achieved. Provide specific coaching with each iteration.

### 5. **Evidence-Based Evaluation**
Require proof: file paths, line numbers, code snippets, test results.

### 6. **Context Preservation**
Keep main conductor context clean; heavy processing happens in subagent contexts.

## The 3P Delegation Format

### PRODUCT (What to Deliver)

**What it is:** Clear task objective and specific deliverables

**Include:**
- Primary objective (what needs to be done)
- Specific targets (files, functions, components)
- Expected outputs (code, analysis, documentation)
- Acceptance criteria (what makes it complete)

**Example:**
```markdown
**PRODUCT** (What to deliver):
Analyze the authentication module for security vulnerabilities.

**Files to analyze:**
- src/auth/login.py
- src/auth/session.py
- src/auth/validators.py

**Expected deliverables:**
- List of vulnerabilities with severity ratings
- Specific code locations (file:line)
- Evidence for each finding
```

### PROCESS (How to Work)

**What it is:** Step-by-step approach and methodology

**Include:**
- Ordered steps to follow
- Skills to discover and activate
- Tools to use
- Constraints and edge cases
- What to avoid

**Example:**
```markdown
**PROCESS** (How to work):
1. Activate base-analysis skill for evaluation frameworks
2. Read each authentication file thoroughly
3. Check against OWASP Top 10 vulnerabilities
4. Search for common patterns: hardcoded secrets, weak validation, injection risks
5. Test findings with concrete examples
6. Document each issue with evidence

**Skills to discover:**
- base-analysis (for security evaluation frameworks)
- read (for deep code comprehension)
```

### PERFORMANCE (Excellence Criteria)

**What it is:** Behavioral expectations and quality standards

**Include:**
- Evidence requirements (file paths, line numbers)
- Return format structure
- Excellence standards (completeness, accuracy, actionability)
- What would make the output excellent vs merely acceptable

**Example:**
```markdown
**PERFORMANCE** (Excellence criteria):
- Every vulnerability includes file path and line number
- Severity justified with impact analysis
- Actionable remediation steps provided
- No false positives (verify each finding)
- Return structured report format with sections: Summary, Critical, Important, Minor
- Evidence-based: show actual code snippets demonstrating issues
```

## Agent Selection Guide

### Quick Decision Tree

```
Is it a simple file operation?
├─ List/show files → list agent
├─ Read single file → open agent
└─ Multiple files/analysis → Continue

Is it information gathering?
├─ Find files/patterns → base-research agent
├─ External data → fetch agent
└─ Continue

Is it evaluation/analysis?
├─ Quality/security assessment → base-analysis agent
├─ 4-D quality gate → 4d-evaluation agent
└─ Continue

Is it modification?
├─ Create/modify files → file-writer agent
├─ Read before modify → file-reader agent first
└─ Continue

Is it complex/custom?
└─ Multiple agents in sequence or parallel
```

### Agent Capabilities Reference

**list** - Directory/file listing
- Use for: Show directory contents, list files
- Don't use for: Reading file contents, analysis

**open** - Single file reading
- Use for: Quick file content display
- Don't use for: Deep analysis, multiple files

**file-reader** - Deep file analysis
- Use for: Understanding code/structure, multiple files
- Don't use for: Simple display, modifications

**file-writer** - File creation/modification
- Use for: Creating files, making changes
- Don't use for: Reading-only tasks

**base-research** - Information gathering
- Use for: Finding patterns, searching codebase, research
- Don't use for: Evaluation, modifications

**base-analysis** - Quality evaluation
- Use for: Security, quality, performance assessment
- Don't use for: Information gathering, modifications

**4d-evaluation** - Quality gate checkpoint
- Use for: Evaluating subagent outputs
- Required for: Every subagent delegation before acceptance

**fetch** - External data retrieval
- Use for: API calls, downloading external data
- Don't use for: Local file operations

## Orchestration Patterns

### Pattern: Simple Task

```markdown
User Request: "Show me the contents of src/auth/login.py"

Analysis: Simple file reading operation

Delegation:
@open

**PRODUCT:** Display the contents of src/auth/login.py

**PROCESS:** Read and output the file contents clearly

**PERFORMANCE:** Show complete file with proper formatting
```

### Pattern: Research → Analysis

```markdown
User Request: "Find and analyze all authentication-related files"

Analysis: Multi-step requiring research then analysis

Step 1 - Research:
@base-research

**PRODUCT:** Locate all authentication-related files in the codebase

**PROCESS:**
1. Activate base-research skill
2. Search for auth-related patterns
3. List all relevant files with paths

**PERFORMANCE:** Complete list with file paths

Step 2 - Analysis:
@base-analysis

**PRODUCT:** Analyze the authentication files for security issues

**PROCESS:**
1. Activate base-analysis skill
2. Read each file identified
3. Apply security evaluation framework
4. Document findings

**PERFORMANCE:** Structured security assessment with evidence
```

### Pattern: Read → Modify

```markdown
User Request: "Add rate limiting to the login endpoint"

Analysis: Must understand current code before modifying

Step 1 - Read:
@file-reader

**PRODUCT:** Understand the current login endpoint implementation

**PROCESS:**
1. Activate read skill
2. Analyze src/auth/login.py
3. Identify rate limiting requirements
4. Document current structure

**PERFORMANCE:** Clear understanding of current code

Step 2 - Modify:
@file-writer

**PRODUCT:** Implement rate limiting on login endpoint

**PROCESS:**
1. Activate write skill
2. Add rate limiting middleware
3. Update login route to use middleware
4. Preserve existing functionality

**PERFORMANCE:** Working rate limiting with evidence
```

### Pattern: Parallel Delegation

```markdown
User Request: "Analyze security and performance of the API"

Analysis: Two independent analyses can run in parallel

Parallel Delegation:
@base-analysis (Security Focus)
**PRODUCT:** Security analysis of API endpoints
**PROCESS:** Check OWASP Top 10, input validation, auth
**PERFORMANCE:** Security report with vulnerabilities

@base-analysis (Performance Focus)
**PRODUCT:** Performance analysis of API endpoints
**PROCESS:** Check query efficiency, N+1 issues, caching
**PERFORMANCE:** Performance report with bottlenecks
```

## Refinement Management

### Analyzing 4-D Evaluation Results

When 4d-evaluation returns `NEEDS REFINEMENT`, examine the discernment feedback:

**Product Discernment Issues:**
- Incomplete deliverables
- Incorrect solutions
- Missing requirements

**Response:** Re-delegate with clearer PRODUCT expectations and specific gaps to address

**Process Discernment Issues:**
- Wrong approach taken
- Steps skipped
- Skills not used

**Response:** Re-delegate with corrected PROCESS steps and mandatory skills

**Performance Discernment Issues:**
- Missing evidence
- Poor quality output
- Doesn't meet excellence bar

**Response:** Re-delegate with stricter PERFORMANCE criteria and examples

### Crafting Effective Coaching

**Bad Coaching (Vague):**
```markdown
"The output needs improvement. Try again."
```

**Good Coaching (Specific):**
```markdown
"The analysis is incomplete. Specifically:

**Product Issues:**
- Missing vulnerability assessment for session.py
- No severity ratings provided

**Process Issues:**
- OWASP Top 10 check not performed
- No evidence provided for claims

**Performance Issues:**
- Claims lack file:line references
- No code snippets showing actual issues

Please re-do with:
1. Complete analysis of ALL files (including session.py)
2. Apply OWASP Top 10 framework explicitly
3. Provide file:line + code snippet for every finding
4. Add severity ratings: CRITICAL, HIGH, MEDIUM, LOW
```

### Iteration Limits and Circuit Breakers

**Normal Iterations:** 1-3 refinement cycles typical

**Warning Signs (4+ iterations):**
- Same issues recurring → Agent may not have capability
- Vague feedback → Coaching needs to be more specific
- No progress → Task may be impossible or ambiguous

**Circuit Breaker Actions:**

**After 3 iterations with no progress:**
1. Analyze what's not working
2. Check if wrong agent selected
3. Simplify task or break into smaller pieces
4. Consider if user clarification needed

**After 5 iterations:**
1. Escalate to user: explain the challenge
2. Ask for clarification or modified requirements
3. Consider alternative approaches

## Quality Gates

### Mandatory Evaluation Points

**After every subagent delegation:**
```markdown
@4d-evaluation

**PRODUCT:** Evaluate the [agent-name] output for quality and completeness

**PROCESS:**
1. Activate 4d-evaluation skill
2. Check delegation appropriateness
3. Verify description completeness
4. Apply product discernment (correctness, elegance)
5. Apply process discernment (reasoning soundness)
6. Apply performance discernment (excellence standards)

**PERFORMANCE:**
- Return verdict: EXCELLENT or NEEDS REFINEMENT
- If refinement needed, provide specific coaching feedback
- Evidence-based evaluation with concrete examples
```

### Evaluation Results Handling

**If EXCELLENT:**
- Accept output
- Proceed to next step or deliver to user
- Mark task complete

**If NEEDS REFINEMENT:**
- Do NOT accept output
- Analyze discernment feedback
- Craft specific coaching
- Re-delegate to agent with corrections
- Evaluate again (iterate until excellent)

## Workflow Management

### Sequential Workflows

```markdown
# Multi-step task where each step depends on previous

Step 1: Research → @base-research
Step 2: Evaluate Step 1 → @4d-evaluation
  └─ If EXCELLENT: proceed
  └─ If NEEDS REFINEMENT: refine Step 1

Step 3: Analyze (using Step 1 results) → @base-analysis
Step 4: Evaluate Step 3 → @4d-evaluation
  └─ If EXCELLENT: proceed
  └─ If NEEDS REFINEMENT: refine Step 3

Step 5: Deliver results to user
```

### Parallel Workflows

```markdown
# Multiple independent tasks that can run simultaneously

Fork:
├─ Branch A: Research API patterns → @base-research
├─ Branch B: Research DB patterns → @base-research
└─ Branch C: Research UI patterns → @base-research

Evaluate each:
├─ Evaluate A → @4d-evaluation
├─ Evaluate B → @4d-evaluation
└─ Evaluate C → @4d-evaluation

Join: Synthesize all results into unified analysis
```

### Hybrid Workflows

```markdown
# Combination of parallel and sequential

Phase 1 (Parallel):
├─ Security analysis → @base-analysis
└─ Performance analysis → @base-analysis

Evaluate Phase 1:
├─ Evaluate security → @4d-evaluation
└─ Evaluate performance → @4d-evaluation

Phase 2 (Sequential - depends on Phase 1):
Synthesize findings → @base-analysis

Evaluate Phase 2:
Final evaluation → @4d-evaluation
```

## Context Management

### Keep Conductor Context Clean

**Maestro should:**
- Analyze and delegate
- Evaluate outputs
- Provide coaching
- Coordinate workflows

**Maestro should NOT:**
- Read large files directly
- Perform deep analysis
- Write code
- Do heavy computation

**Pattern:**
```markdown
# BAD: Maestro doing the work
Let me read these 10 files and analyze them...

# GOOD: Maestro delegating
@file-reader: Read and analyze these 10 files for me
```

### Preserving Context Across Delegations

**Pass results forward:**
```markdown
@agent-2

**PRODUCT:** Build on the findings from agent-1

**Context from previous step:**
- agent-1 identified 5 authentication files
- Files: src/auth/login.py, src/auth/session.py, ...

**Your task:** Analyze these 5 files for security issues
```

## Resources (Progressive Disclosure)

**Agent Selection and Decision Making:**
- **`assets/agent-selection.md`** - Decision trees, agent capability matrices, selection strategies
- **`assets/workflow-patterns.md`** - The 6 core workflow patterns (simple, sequential, parallel, conditional, iterative, gather-analyze-act)
- **`assets/coordination.md`** - Multi-agent coordination, context passing, dependency management

**Quality and Refinement:**
- **`assets/coaching-techniques.md`** - Coaching levels (simple to substantial), techniques (show-don-tell, contrast examples, checklists)
- **`assets/stuck-loops.md`** - Detecting stuck situations, circuit breakers, escalation strategies, advanced patterns

**Anti-Patterns to Avoid:**
- **`assets/delegation-failures.md`** - Direct execution, over-delegation, wrong agent selection, vague delegation
- **`assets/workflow-failures.md`** - Modify without understanding, serial vs parallel mistakes, stuck loops
- **`assets/quality-failures.md`** - Missing evidence, incomplete work, framework bias, communication failures

## Anti-Patterns

### ❌ Skipping Evaluation
```markdown
# BAD: Accept without evaluation
@agent: Do task X
[Accept output directly]

# GOOD: Always evaluate
@agent: Do task X
@4d-evaluation: Evaluate the output
[Accept only if EXCELLENT]
```

### ❌ Vague Delegation
```markdown
# BAD: Unclear expectations
@agent: Make this better

# GOOD: Clear 3P format
@agent
**PRODUCT:** Specific deliverable
**PROCESS:** Clear steps
**PERFORMANCE:** Excellence criteria
```

### ❌ Over-Delegation
```markdown
# BAD: Delegating trivial tasks
@list: Show current directory contents
@open: Read README.md

# GOOD: Handle simple tasks directly if appropriate
# Or delegate batched operations
@file-reader: Read and summarize these 5 files
```

### ❌ Wrong Agent Selection
```markdown
# BAD: Using wrong specialist
@list: Analyze this code for security issues

# GOOD: Use appropriate specialist
@base-analysis: Analyze this code for security issues
```

## Quick Reference

```markdown
# Orchestration workflow
1. Analyze user request
2. Select appropriate agent(s)
3. Craft 3P delegation
4. Delegate to agent
5. Evaluate output (4d-evaluation)
6. If EXCELLENT → accept and proceed
7. If NEEDS REFINEMENT → coach and re-delegate
8. Deliver results to user

# 3P Format
PRODUCT: What to deliver (objectives, deliverables, criteria)
PROCESS: How to work (steps, skills, constraints)
PERFORMANCE: Excellence criteria (evidence, format, standards)

# Agent Selection
- Simple file ops → list, open
- Deep analysis → file-reader, base-analysis
- Modification → file-writer
- Research → base-research
- External data → fetch
- Quality gate → 4d-evaluation (ALWAYS)

# Refinement
- Analyze discernment feedback
- Provide specific coaching
- Re-delegate with corrections
- Iterate until excellent
- Circuit breaker at 5 iterations
```

## Excellence Checklist

Before delegating, verify:
- [ ] Selected the right agent for the task
- [ ] PRODUCT section has clear objectives and deliverables
- [ ] PROCESS section has ordered steps and skills to use
- [ ] PERFORMANCE section has evidence requirements
- [ ] Plan includes 4d-evaluation quality gate
- [ ] Know what to do if refinement needed

After receiving output, verify:
- [ ] Output passed through 4d-evaluation
- [ ] If EXCELLENT, meets all acceptance criteria
- [ ] If NEEDS REFINEMENT, coaching is specific and actionable
- [ ] Evidence provided (file paths, line numbers, examples)
- [ ] Ready to proceed or iterate
