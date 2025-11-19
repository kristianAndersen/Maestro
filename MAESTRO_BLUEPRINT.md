# MAESTRO FRAMEWORK BLUEPRINT
**Version:** 1.0
**Philosophy:** Pure agnostic conductor orchestrating excellence through delegation and iteration

---

## TABLE OF CONTENTS

1. [THE WHAT](#the-what)
2. [THE WHY](#the-why)
3. [THE HOW](#the-how)
4. [4-D METHODOLOGY](#4-d-methodology)
5. [ARCHITECTURE](#architecture)
6. [BASE COMPONENTS](#base-components)
7. [IMPLEMENTATION STRATEGY](#implementation-strategy)
8. [TECHNICAL SPECIFICATIONS](#technical-specifications)

---

## THE WHAT

### Vision Statement

**Maestro is a pure agnostic AI orchestration framework** that conducts excellence by delegating all work to specialized subagents who use skills for guidance, evaluating every output through rigorous 4-D quality gates, and iterating relentlessly until excellence is achieved.

### Core Principles

1. **Maestro Never Writes Code** - The conductor orchestrates, never executes
2. **Delegation First** - All work flows through specialized subagents
3. **Skills as Guidance** - Subagents discover and use skills within their context
4. **Quality Gates** - Every output passes through 4-D evaluation
5. **Iterative Refinement** - No shortcuts, iterate until excellent
6. **Context Preservation** - Progressive disclosure keeps main context clean
7. **Framework Agnostic** - Zero bias toward any language, framework, or paradigm

### What Maestro Is NOT

- ❌ Not a coding assistant that writes code directly
- ❌ Not framework-specific (React, Vue, Express, etc.)
- ❌ Not a "good enough" executor
- ❌ Not a single-pass workflow system
- ❌ Not opinionated about tech choices

### What Maestro IS

- ✅ A conductor that delegates strategically
- ✅ A quality gatekeeper that evaluates rigorously
- ✅ A coach that refines iteratively
- ✅ A methodology for achieving excellence
- ✅ A framework-agnostic orchestration system

---

## THE WHY

### Problem: Current AI Coding Limitations

**Context Pollution:**
- Large files bloat main context
- Complex tasks consume token budget
- Knowledge gets lost in noise

**Inconsistent Quality:**
- "Good enough" becomes the standard
- No systematic quality evaluation
- Shortcuts become habits

**Single-Pass Mentality:**
- First draft accepted without review
- No iterative refinement loop
- Excellence sacrificed for speed

**Skill Activation Failure:**
- Skills sit unused until manually invoked
- Context doesn't reach the skill when needed
- Guidelines exist but aren't applied

### Solution: Maestro's Three-Tier Architecture

```
User Request
    ↓
Maestro Conductor (orchestrates, evaluates, never codes)
    ↓
Subagents (execute tasks, discover skills, work autonomously)
    ↓
Skills (provide guidance, loaded progressively in subagent context)
```

### Benefits

**Context Preservation:**
- Main Maestro context stays clean (only high-level orchestration)
- Subagents handle heavy lifting in isolated contexts
- Skills load progressively only when needed

**Systematic Excellence:**
- Every output evaluated through 4-D gates
- Iterative refinement is mandatory, not optional
- Quality standards enforced at framework level

**Intelligent Delegation:**
- Right agent for the right task
- Skills auto-discover within agent context
- Progressive disclosure maximizes efficiency

**Framework Agnostic:**
- No React/Vue/Angular bias
- No Express/Django/Rails assumptions
- User brings paradigm, Maestro conducts methodology

---

## THE HOW

### User Interaction Flow

1. **User makes request** → Maestro receives
2. **Maestro analyzes task** → Determines complexity, domain, requirements
3. **Maestro delegates** → Spawns appropriate subagent with clear instructions
4. **Subagent activates** → Discovers relevant skills, executes task
5. **Subagent returns** → Delivers structured output with evidence
6. **Maestro evaluates** → Runs output through 4-D quality gates
7. **Two paths:**
   - ✅ **Excellent** → Maestro confirms to user with summary
   - ⚠️ **Needs refinement** → Maestro coaches subagent, returns to step 3
8. **Repeat until excellent** → Then move to next task

### Transparency Protocol

**User always sees:**
- 🎼 **Who's working** - Maestro or which subagent
- 📋 **Why delegation** - Reason for choosing this agent
- 📤 **What's delegated** - Task and context passed
- ⏳ **Status updates** - While subagent works
- 📥 **Results** - Subagent output with evidence
- 🔍 **Evaluation** - Maestro's 4-D assessment
- 🔄 **Refinement** - If iteration needed, what and why
- ✅ **Completion** - Only when excellence achieved

### Progressive Disclosure in Action

**Example: "Add error handling to authentication service"**

```
Main Context (Maestro):
  - User request
  - Delegation decision
  - Evaluation summaries
  - High-level orchestration
  Total: ~500 tokens

Subagent Context (Write agent):
  - Specific task: "Add error handling to authentication service"
  - File content: auth_service.js (2000 lines)
  - Auto-loaded skill: error-tracking/SKILL.md (400 lines)
  - Additional resource: error-tracking/resources/patterns.md (300 lines)
  Total: ~6000 tokens (isolated from main)

Result:
  - Main Maestro stays light and strategic
  - Heavy work happens in isolated subagent
  - Skills load progressively only where needed
  - Context preserved across iterations
```

---

## 4-D METHODOLOGY

### Foundation: Anthropic's AI Fluency Framework

Maestro operationalizes Anthropic's 4-D framework (Delegation, Description, Discernment, Diligence) with:
- Automated quality gates
- Iterative refinement loops
- Transparent orchestration
- Evidence-based verification

**Reference:** Anthropic AI Fluency: Key Terminology (Dakan, Feller, Anthropic 2025)

---

### 1. DELEGATION - Strategic Work Distribution

**Maestro's Role:**
- Analyze task complexity and domain
- Select appropriate subagent from registry
- Provide comprehensive direction (Product, Process, Performance)
- Never execute work directly

**Decision Tree:**
```
Task Received
  ↓
Simple operation? (read file, list directory)
  → YES: BaseOperation agents (Read, List, Open)
  → NO: Continue
  ↓
Research needed? (gather info, analyze codebase)
  → YES: BaseResearch agent
  → NO: Continue
  ↓
Analysis required? (evaluate, assess, review)
  → YES: BaseAnalysis agent
  → NO: Continue
  ↓
Writing/modification? (code, docs, config)
  → YES: Write agent
  → NO: Continue
  ↓
External data? (API, web, fetch)
  → YES: Fetch agent
  → NO: Continue
  ↓
Quality evaluation? (4-D assessment)
  → YES: 4D-Evaluation agent
  → NO: Unknown → ask user or decompose further
```

**Escalation to User (pause and ask):**
- Critical decisions (architecture changes, data loss risks, security)
- Ambiguity that can't be resolved through iteration
- Ethical concerns requiring human judgment
- Missing information that affects approach

---

### 2. DESCRIPTION - Clear Communication

**When delegating to subagent, Maestro provides:**

**Product Description:**
- What needs to be built/created/modified
- Expected outputs and formats
- Acceptance criteria (how to know it's done)
- Constraints and requirements
- Files/resources involved

**Process Description:**
- How to approach the task (methodology)
- Step-by-step guidance (if complex)
- Patterns to follow (architectural decisions)
- What to check before starting (validate assumptions)
- How to handle edge cases

**Performance Description:**
- Behavioral expectations (autonomous, thorough)
- Communication style (verbose during work, structured on return)
- Skill discovery (which skills to check for)
- Evidence requirements (what proof to return)

**Example Delegation:**
```markdown
🎼 Maestro: Delegating to Write agent
📋 Reason: Code modification with error handling requirements

📤 Passing to Write agent:

PRODUCT:
- Task: Add comprehensive error handling to authentication service
- Files: src/auth/auth_service.js
- Expected: Try-catch blocks, proper error types, logging integration
- Acceptance: All error paths handled, errors logged with context

PROCESS:
- Step 1: Read current auth_service.js, analyze error-prone operations
- Step 2: Check for error-tracking skill, use patterns from it
- Step 3: Add try-catch around database calls, API calls, validation
- Step 4: Ensure errors include context (user ID, operation type)
- Step 5: Verify no silent failures remain

PERFORMANCE:
- Work autonomously, discover error-tracking skill if available
- Show your work (which sections modified, why)
- Return structured report with:
  - List of error handlers added
  - File modifications made
  - Evidence (code snippets showing error handling)
```

---

### 3. DISCERNMENT - Iterative Quality Evaluation

**Automatic Quality Gate:**
Every subagent output passes through 4-D evaluation BEFORE Maestro accepts it.

**Maestro evaluates using 4D-Evaluation agent:**

**Product Discernment:**
- ✓ Is it correct? (logic sound, edge cases handled)
- ✓ Is it elegant? (nothing to remove, simple yet powerful)
- ✓ Is it complete? (no missing pieces, fully functional)
- ✓ Does it solve the real problem? (addresses root cause)

**Process Discernment:**
- ✓ Was the reasoning sound? (logical approach)
- ✓ Any gaps or shortcuts? (thoroughness check)
- ✓ Were appropriate techniques used? (best practices followed)
- ✓ Is the approach sustainable? (maintainable long-term)

**Performance Discernment** (quality/excellence, not speed):
- ✓ Meets excellence standards? (no "good enough")
- ✓ Simple yet powerful? (elegance through subtraction)
- ✓ Fits codebase philosophy? (consistent with existing patterns)
- ✓ Makes codebase better? (net improvement)

*Note: "Performance" in 4-D refers to quality standards and excellence, not execution speed or runtime performance.*

**Excellence Standards Checklist:**
- [ ] Code is correct and handles edge cases
- [ ] Solution is elegant and simple (nothing to remove)
- [ ] No security vulnerabilities (injection, XSS, etc.)
- [ ] Performance is reasonable (no obvious bottlenecks)
- [ ] Documentation exists where complexity demands it
- [ ] Follows existing codebase patterns
- [ ] Tests exist and pass (if applicable)
- [ ] Evidence provided (not just assertions)

**Evaluation Outcomes:**

**If EXCELLENT:**
```
✅ 4-D Evaluation: PASSED

Product: Correct, elegant, complete ✓
Process: Sound reasoning, thorough approach ✓
Performance: Meets excellence bar, improves codebase ✓

Implementing...
```

**If NEEDS REFINEMENT:**
```
🔄 4-D Evaluation: REFINEMENT NEEDED

Product Discernment (What was built):
  ✓ Correct logic
  ✗ Missing edge case: What if user is null?
  ✓ Complete solution

Process Discernment (How it was built):
  ✓ Sound approach
  ⚠ Shortcut detected: Error handling assumes happy path

Performance Discernment (Quality & fit):
  ✓ Simple implementation
  ✗ Doesn't follow existing error pattern (see auth_service.js lines 45-60)

Note: "Performance" here means quality/excellence standards, NOT execution speed.

COACHING FEEDBACK:
1. Add null check before user.validate() (line 78)
2. Expand error handling to cover database timeout scenario
3. Match error handling pattern from auth_service.js for consistency

Re-delegating to Write agent with refinements...
```

**Refinement Loop:**
- Maestro provides specific, actionable feedback
- Re-invokes same subagent with coaching
- Subagent iterates with guidance
- Returns refined output
- Maestro re-evaluates
- **Repeat until standards met** (no limit on iterations)

---

### 4. DILIGENCE - Responsibility & Ethics

**Creation Diligence:**
- Choose subagents thoughtfully (right tool for job)
- Understand capabilities and limitations
- Don't delegate inappropriate tasks (ethical concerns → user)
- Provide comprehensive direction (never vague delegation)

**Transparency Diligence:**
- User always knows who's working and why
- Honest about limitations and uncertainties
- Show the orchestration process
- Explain evaluation decisions

**Deployment Diligence:**
- Verification before claiming completion
- Evidence over assertions (tests pass, builds succeed)
- Confirm work is excellent, not just done
- Never skip quality gates for speed

**Ethical Guardrails:**
- Security testing only with authorization context
- No destructive techniques without clear approval
- Data loss risks → escalate to user
- Dual-use tools require authorization confirmation

---

## ARCHITECTURE

### Native Claude Ecosystem Integration

**Maestro uses ONLY native Claude Code features:**
- ✅ Task tool (spawn subagents)
- ✅ Skill tool (activate skills)
- ✅ Hooks (UserPromptSubmit, PostToolUse, Stop)
- ✅ Standard file tools (Read, Write, Edit, Glob, Grep)
- ✅ Bash tool (for scripts and automation)
- ✅ TodoWrite (track progress)
- ✅ AskUserQuestion (user escalation)

**No external dependencies:**
- ❌ No custom APIs
- ❌ No external orchestration layers
- ❌ No proprietary systems
- ❌ No complex frameworks

**Technology Choices:**
- Scripts: Node.js (vanilla, minimal deps) + Bash
- Configuration: JSON (agent-rules.json, skill-rules.json, settings.json)
- Skills: Markdown with YAML frontmatter + /script +/assets
- Agents: Markdown with instructions
- Hooks: Node.js + Bash (executable scripts)

---

### Three-Tier Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         USER                                 │
│                  (provides requests)                         │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   MAESTRO CONDUCTOR                          │
│                  (maestro.md persona)                        │
│                                                              │
│  Responsibilities:                                           │
│  • Analyze user requests                                     │
│  • Delegate to subagents (NEVER code directly)              │
│  • Evaluate all outputs (4-D gates)                         │
│  • Coach and refine iteratively                             │
│  • Maintain transparency                                     │
│  • Verify completion with evidence                          │
│                                                              │
│  Tools Used:                                                 │
│  • Task (spawn subagents)                                   │
│  • TodoWrite (track orchestration)                          │
│  • AskUserQuestion (escalate when needed)                   │
│                                                              │
└───────────┬─────────────────────────────────┬───────────────┘
            │                                 │
            │ Delegates                  Evaluates
            │                                 │
            ▼                                 ▼
┌─────────────────────────────────────────────────────────────┐
│                      SUBAGENTS                               │
│            (.claude/agents/*.md files)                       │
│                                                              │
│  Base Agents:                                                │
│  • List       - Directory/file listing operations            │
│  • Open       - File reading with context preservation       │
│  • Read       - Deep file analysis                          │
│  • Write      - Code/file modifications                     │
│  • Fetch      - External data retrieval                     │
│  • BaseResearch - Information gathering & analysis          │
│  • BaseAnalysis - Code/system evaluation                    │
│  • 4D-Evaluation - Quality assessment using 4-D framework   │
│                                                              │
│  Responsibilities:                                           │
│  • Execute delegated tasks autonomously                      │
│  • Discover and use relevant skills                         │
│  • Work within isolated context                             │
│  • Return structured output with evidence                    │
│                                                              │
│  Tools Used:                                                 │
│  • All standard Claude tools (Read, Write, Edit, etc.)      │
│  • Skill (discover and activate skills)                     │
│  • Bash (execute commands)                                  │
│                                                              │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            │ Discovers & Uses
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                        SKILLS                                │
│            (.claude/skills/*/SKILL.md)                       │
│                                                              │
│  Base Skills:                                                │
│  • List       - File operation best practices                │
│  • Open       - Context-aware file reading                  │
│  • Read       - Analysis methodology                        │
│  • Write      - Code modification patterns                  │
│  • Fetch      - Data retrieval guidelines                   │
│  • BaseResearch - Research methodology                      │
│  • BaseAnalysis - Evaluation frameworks                     │
│  • 4D-Evaluation - Quality assessment criteria              │
│                                                              │
│  Structure (Progressive Disclosure):                         │
│  • SKILL.md (<500 lines, overview + navigation)             │
│  • resources/*.md (<500 lines each, deep dives)             │
│                                                              │
│  Activation:                                                 │
│  • Auto-discovered by subagents via hooks                   │
│  • Loaded progressively (main first, resources on-demand)   │
│  • Lives in subagent context (not Maestro's)                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

### Agent Discovery System

**Purpose:** Auto-suggest appropriate agents to Maestro based on user requests

**Agent Registry:** `.claude/agents/agent-registry.json`

This registry maps task patterns to agents, similar to how skill-rules.json works for skills.

**Structure:**
```json
{
  "version": "1.0",
  "agents": {
    "list": {
      "purpose": "Directory and file listing operations",
      "triggers": {
        "keywords": ["list", "show files", "directory", "ls", "what files"],
        "intentPatterns": ["list.*files?", "show.*directory", "what.*in.*folder"],
        "operations": ["list", "enumerate", "scan"]
      },
      "complexity": "simple",
      "autonomy": "high"
    },
    "open": {
      "purpose": "File reading with context preservation",
      "triggers": {
        "keywords": ["open", "read file", "show me", "view"],
        "intentPatterns": ["open.*file", "read.*from", "show.*content"],
        "operations": ["read", "view", "display"]
      },
      "complexity": "simple",
      "autonomy": "high"
    },
    "read": {
      "purpose": "Deep file and codebase analysis",
      "triggers": {
        "keywords": ["analyze", "understand", "explain", "how does", "what does"],
        "intentPatterns": ["analyze.*code", "understand.*how", "explain.*this"],
        "operations": ["analyze", "research", "investigate"]
      },
      "complexity": "medium",
      "autonomy": "high"
    },
    "write": {
      "purpose": "Code and file modifications",
      "triggers": {
        "keywords": ["add", "modify", "change", "update", "fix", "create", "implement"],
        "intentPatterns": ["add.*to", "modify.*file", "fix.*bug", "implement.*feature"],
        "operations": ["write", "edit", "modify", "create"]
      },
      "complexity": "medium",
      "autonomy": "medium"
    },
    "fetch": {
      "purpose": "External data retrieval",
      "triggers": {
        "keywords": ["fetch", "get data", "API", "download", "retrieve"],
        "intentPatterns": ["fetch.*from", "get.*api", "download.*data"],
        "operations": ["fetch", "retrieve", "download"]
      },
      "complexity": "simple",
      "autonomy": "high"
    },
    "base-research": {
      "purpose": "Information gathering and codebase exploration",
      "triggers": {
        "keywords": ["research", "find", "search", "where is", "locate"],
        "intentPatterns": ["find.*where", "search.*for", "locate.*code"],
        "operations": ["search", "find", "explore"]
      },
      "complexity": "medium",
      "autonomy": "high"
    },
    "base-analysis": {
      "purpose": "Code and system evaluation",
      "triggers": {
        "keywords": ["evaluate", "assess", "review", "check quality", "analyze"],
        "intentPatterns": ["evaluate.*code", "assess.*quality", "review.*implementation"],
        "operations": ["evaluate", "assess", "review"]
      },
      "complexity": "medium",
      "autonomy": "high"
    },
    "4d-evaluation": {
      "purpose": "Quality assessment using 4-D framework",
      "triggers": {
        "keywords": ["evaluate quality", "4-D", "quality check", "assessment"],
        "intentPatterns": ["evaluate.*4-?D", "quality.*assessment"],
        "operations": ["evaluate"]
      },
      "complexity": "simple",
      "autonomy": "high",
      "internal": true
    }
  }
}
```

**Field Explanations:**
- `purpose`: One-line description of what agent does
- `triggers.keywords`: Simple string matching in user request
- `triggers.intentPatterns`: Regex patterns for intent detection
- `triggers.operations`: Operation verbs that indicate this agent
- `complexity`: "simple" | "medium" | "complex" (helps Maestro estimate effort)
- `autonomy`: "high" | "medium" | "low" (how much agent can work alone)
- `internal`: true if agent is used by Maestro internally (like 4D-evaluation)

---

### Hook System Architecture

**Purpose:** Auto-suggest agents to Maestro and auto-activate skills in subagents

**Hook 1: `maestro-agent-suggester` (UserPromptSubmit)**
- **Runs:** In Maestro context when user makes request
- **File:** `.claude/hooks/maestro-agent-suggester.js` (Node.js)
- **Purpose:** Analyze user request and suggest appropriate agent(s)
- **Method:**
  - Reads `.claude/agents/agent-registry.json`
  - Matches request against agent triggers (keywords, intent, operations)
  - Prioritizes based on complexity and match strength
  - Reminds Maestro of delegation mandate
  - Suggests specific agent with reasoning
- **Output:** Context injection with agent recommendation

**Example Output:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 AGENT SUGGESTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

User request detected: "Add error handling to auth service"

RECOMMENDED AGENT: Write
Reason: Request contains "add" (write operation) and targets code modification

Alternative: Read (if analysis needed first)

REMINDER: Maestro delegates, never codes directly.
Use Task tool to spawn Write agent with comprehensive direction.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Hook 2: `subagent-skill-discovery` (UserPromptSubmit)**
- **Runs:** Inside subagent context when subagent receives task
- **File:** `.claude/hooks/subagent-skill-discovery.js` (Node.js)
- **Purpose:** Analyze subagent's task and suggest relevant skills
- **Method:**
  - Reads `.claude/skills/skill-rules.json`
  - Matches task against skill triggers (keywords, intent, files)
  - Injects skill suggestions to subagent's context
- **Output:** Formatted reminder for subagent to use Skill tool

**Example Output:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 SKILL SUGGESTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Task received: "Add error handling to auth service"

RECOMMENDED SKILLS:
  → Write skill (modification patterns)
  → error-tracking skill (if available)

Use Skill tool to load guidance before starting work.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Hook 3: `work-tracker` (PostToolUse)**
- **Runs:** After file modifications (Edit, Write)
- **File:** `.claude/hooks/work-tracker.sh` (Bash)
- **Purpose:** Track modifications for context preservation
- **Method:**
  - Detects which files were modified
  - Logs changes for session awareness
  - Helps avoid duplicate work
- **Output:** Silent tracking (no user output)

**Hook 4: `evaluation-reminder` (Stop)**
- **Runs:** After Maestro stops (end of response)
- **File:** `.claude/hooks/evaluation-reminder.js` (Node.js)
- **Purpose:** Remind Maestro to run 4-D evaluation if subagent just returned
- **Method:**
  - Detects if last action was receiving subagent output
  - Checks if evaluation already performed
  - Reminds Maestro to evaluate before accepting
  - Suggests using 4D-Evaluation agent
- **Output:** Gentle reminder (non-blocking)

**Example Output:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 EVALUATION REMINDER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Subagent output received. Before accepting:

REQUIRED: Run 4-D evaluation
Use Task tool → 4D-Evaluation agent

Only accept output after evaluation passes.
Refine if issues found.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### Agent Discovery Flow

**Step-by-step: How Maestro discovers which agent to use**

1. **User makes request** → "Add error handling to authentication service"

2. **Hook fires** → `maestro-agent-suggester.js` (UserPromptSubmit)
   - Reads agent-registry.json
   - Analyzes request: "Add" (write operation), "authentication service" (code target)
   - Matches against agent triggers
   - Finds: Write agent (keywords: "add", operations: "write")
   - Generates suggestion with reasoning

3. **Maestro receives context injection:**
   ```
   🎯 AGENT SUGGESTION
   RECOMMENDED AGENT: Write
   Reason: "add" keyword + code modification intent detected
   ```

4. **Maestro responds to user:**
   ```
   🎼 Maestro: Delegating to Write agent
   📋 Reason: Code modification with error handling requirements
   ```

5. **Maestro spawns agent** using Task tool with comprehensive direction

**Fallback Logic:**
- If no agent matches → Maestro uses BaseResearch to decompose task
- If multiple agents match → Maestro chooses based on priority/complexity
- If user is vague → Maestro asks clarifying questions first

---

## BASE COMPONENTS

### Base Agents Specification

All base agents follow this structure:

```markdown
# [Agent Name]

## Purpose
[One-sentence description]

## When to Use
- [Trigger scenario 1]
- [Trigger scenario 2]

## Skills to Discover
- [Skill 1] - [When to use it]
- [Skill 2] - [When to use it]

## Instructions

### 1. Initialization
- Receive task from Maestro
- Check for relevant skills using Skill tool
- If skills found, activate and load guidance

### 2. Execution
- [Step-by-step autonomous work process]

### 3. Return Format
Return structured output:

**Task:** [What was requested]
**Skills Used:** [Which skills were activated]
**Actions Taken:** [What was done, with file:line references]
**Evidence:** [Proof of completion - code snippets, test results, etc.]
**Notes:** [Any caveats, assumptions, or follow-up needed]

## Tools Available
- [List of Claude tools this agent can use]

## Constraints
- Work autonomously (don't ask Maestro for guidance mid-task)
- Use skills for patterns and best practices
- Return comprehensive evidence
- Be thorough over fast
```

---

### Base Skills Specification

All base skills follow this structure:

```
skill-name/
  SKILL.md                 # Main entry point (<500 lines)
  resources/
    methodology.md         # Deep dive on approach
    patterns.md           # Common patterns and examples
    troubleshooting.md    # Edge cases and solutions
```

**SKILL.md template:**
```markdown
---
name: skill-name
description: Brief description covering when this activates and what it provides
---

# [Skill Name]

## Purpose
[What this skill provides guidance for]

## When to Use This Skill
Automatically activates when:
- [Trigger scenario 1]
- [Trigger scenario 2]

## Quick Start
[3-5 key principles that apply 80% of the time]

## Core Principles
1. **[Principle 1]** - [Brief explanation]
2. **[Principle 2]** - [Brief explanation]
3. **[Principle 3]** - [Brief explanation]

## Common Patterns
[Most frequently used patterns with minimal examples]

## Resources (Progressive Disclosure)
For deeper guidance, load these resources:
- `resources/methodology.md` - [When to read this]
- `resources/patterns.md` - [When to read this]
- `resources/troubleshooting.md` - [When to read this]

## Anti-Patterns
[What NOT to do, common mistakes]

## Quick Reference
[Cheat sheet, decision trees, quick lookups]
```

---

### Base Agents List

**1. List Agent**
- **Purpose:** Directory and file listing operations
- **Skills:** List skill (file organization patterns)
- **Returns:** Structured directory trees, file metadata

**2. Open Agent**
- **Purpose:** File reading with context preservation
- **Skills:** Open skill (when to load full vs partial files)
- **Returns:** File contents with analysis metadata

**3. Read Agent**
- **Purpose:** Deep file/codebase analysis
- **Skills:** Read skill (analysis methodology, pattern detection)
- **Returns:** Comprehensive analysis with insights

**4. Write Agent**
- **Purpose:** Code and file modifications
- **Skills:** Write skill (modification patterns, safety checks)
- **Returns:** Modification summary with evidence (diffs, line numbers)

**5. Fetch Agent**
- **Purpose:** External data retrieval (web, APIs)
- **Skills:** Fetch skill (data handling, error handling)
- **Returns:** Retrieved data with source attribution

**6. BaseResearch Agent**
- **Purpose:** Information gathering and codebase exploration
- **Skills:** BaseResearch skill (research methodology, synthesis)
- **Returns:** Research report with findings and sources

**7. BaseAnalysis Agent**
- **Purpose:** Code and system evaluation
- **Skills:** BaseAnalysis skill (evaluation frameworks, metrics)
- **Returns:** Analysis report with recommendations

**8. 4D-Evaluation Agent**
- **Purpose:** Quality assessment using 4-D framework
- **Skills:** 4D-Evaluation skill (assessment criteria, scoring)
- **Returns:** Evaluation report with pass/fail + refinement coaching

---

### Base Skills List

**1. List Skill**
- **Domain:** File operations
- **Guidance:** When to use glob vs tree, filtering patterns, output formatting

**2. Open Skill**
- **Domain:** File reading
- **Guidance:** Partial vs full reads, context preservation, memory efficiency

**3. Read Skill**
- **Domain:** Analysis
- **Guidance:** Pattern recognition, code comprehension, codebase navigation

**4. Write Skill**
- **Domain:** Modifications
- **Guidance:** Edit vs Write, safety checks, verification, testing

**5. Fetch Skill**
- **Domain:** Data retrieval
- **Guidance:** Error handling, retry logic, data validation, caching

**6. BaseResearch Skill**
- **Domain:** Research methodology
- **Guidance:** Source evaluation, synthesis techniques, documentation

**7. BaseAnalysis Skill**
- **Domain:** Evaluation
- **Guidance:** Frameworks (performance, security, maintainability), reporting

**8. 4D-Evaluation Skill**
- **Domain:** Quality assessment
- **Guidance:** 4-D criteria (Delegation, Description, Discernment, Diligence), scoring rubrics, coaching patterns

---

### Skill-Wizard Agent

**Purpose:** Meta-agent that helps users create new skills following Maestro methodology

**Responsibilities:**
- Interview user about skill domain and purpose
- Generate skill structure (SKILL.md + resources/)
- Create skill-rules.json entry with proper triggers
- Follow 500-line rule and progressive disclosure
- Ensure 4-D methodology compliance
- Test skill activation

**When to Use:**
- User wants to add domain-specific guidance (React, Vue, Express, etc.)
- User wants to encode team patterns into skills
- User wants to create guardrail skills (enforce critical practices)

**Returns:**
- Complete skill directory structure
- skill-rules.json configuration
- Testing instructions

---

## IMPLEMENTATION STRATEGY

### Phase 1: Foundation (Core Framework)

**Goal:** Establish Maestro conductor with delegation-only mandate

**Deliverables:**
1. `maestro.md` - Enhanced conductor persona
   - Delegation mandate (never code directly)
   - 4-D evaluation protocol
   - Refinement loop logic
   - Transparency guidelines

2. `MAESTRO_SUBAGENT_PROTOCOL.md` - Enhanced protocol
   - Pre-delegation decision tree
   - Delegation format (Product, Process, Performance)
   - Post-return evaluation gate
   - Refinement coaching format

3. `.claude/settings.json` - Hook configuration
   - maestro-delegation-helper (remind to delegate)
   - evaluation-reminder (remind to evaluate)

**Validation:**
- Maestro refuses to write code when asked directly
- Maestro delegates appropriately
- Maestro evaluates subagent output before accepting

---

### Phase 2: Base Agents (Essential Workers)

**Goal:** Create 8 base agents that execute fundamental operations

**Deliverables:**
1. `.claude/agents/list.md` - List agent
2. `.claude/agents/open.md` - Open agent
3. `.claude/agents/read.md` - Read agent
4. `.claude/agents/write.md` - Write agent
5. `.claude/agents/fetch.md` - Fetch agent
6. `.claude/agents/base-research.md` - BaseResearch agent
7. `.claude/agents/base-analysis.md` - BaseAnalysis agent
8. `.claude/agents/4d-evaluation.md` - 4D-Evaluation agent

**Each agent includes:**
- Clear purpose and when to use
- Skill discovery instructions
- Autonomous execution steps
- Structured return format
- Evidence requirements

**Validation:**
- Each agent can be spawned via Task tool
- Each agent discovers relevant skills
- Each agent returns structured output
- Maestro can evaluate agent output

---

### Phase 3: Base Skills (Agnostic Guidance)

**Goal:** Create 8 base skills providing framework-agnostic guidance

**Deliverables:**
1. `.claude/skills/list/` - List skill with resources
2. `.claude/skills/open/` - Open skill with resources
3. `.claude/skills/read/` - Read skill with resources
4. `.claude/skills/write/` - Write skill with resources
5. `.claude/skills/fetch/` - Fetch skill with resources
6. `.claude/skills/base-research/` - BaseResearch skill with resources
7. `.claude/skills/base-analysis/` - BaseAnalysis skill with resources
8. `.claude/skills/4d-evaluation/` - 4D-Evaluation skill with resources

**Each skill includes:**
- SKILL.md (<500 lines)
- resources/ directory (methodology, patterns, troubleshooting)
- Framework-agnostic guidance
- Progressive disclosure structure

**Validation:**
- Skills activate when subagent works
- Skills provide useful guidance (not framework-specific)
- Skills follow 500-line rule
- Resources load on-demand

---

### Phase 4: Discovery Systems (Agent & Skill Auto-Activation)

**Goal:** Implement hook system for automatic agent suggestion and skill discovery

**Deliverables:**

**4.1 Agent Discovery:**
1. `.claude/agents/agent-registry.json` - Agent registry
   - All base agents configured
   - Trigger patterns (keywords, intent, operations)
   - Complexity and autonomy levels

2. `.claude/hooks/maestro-agent-suggester.js` - UserPromptSubmit hook
   - Analyzes user request in Maestro context
   - Matches against agent-registry.json
   - Suggests appropriate agent with reasoning

**4.2 Skill Discovery:**
3. `.claude/hooks/subagent-skill-discovery.js` - UserPromptSubmit hook
   - Analyzes subagent task
   - Matches against skill-rules.json
   - Suggests relevant skills

4. `.claude/skills/skill-rules.json` - Skill registry
   - All base skills configured
   - Trigger patterns (keywords, intent, files)
   - Enforcement levels

**4.3 Support Hooks:**
5. `.claude/hooks/work-tracker.sh` - PostToolUse hook
   - Tracks file modifications
   - Session awareness

6. `.claude/hooks/evaluation-reminder.js` - Stop hook
   - Reminds Maestro to evaluate subagent output
   - Gentle, non-blocking reminder

**Validation:**
- Agents auto-suggested when user makes request
- Skills auto-suggest when subagent starts work
- Triggers match correctly (no false positives/negatives)
- Maestro receives agent suggestions in its context
- Subagents receive skill suggestions in their context
- Evaluation reminders fire after subagent returns

---

### Phase 5: Skill-Wizard (Expansion Capability)

**Goal:** Enable users to create custom skills following Maestro patterns

**Deliverables:**
1. `.claude/agents/skill-wizard.md` - Skill creation agent
   - Interviews user about skill purpose
   - Generates skill structure
   - Creates skill-rules.json entry
   - Tests activation

2. `.claude/skills/skill-developer/` - Skill creation guidance
   - How to write effective skills
   - Progressive disclosure patterns
   - Trigger configuration
   - Testing methodology

**Validation:**
- Skill-wizard can create new skills from user input
- Generated skills follow 500-line rule
- Generated skills activate correctly
- User can extend Maestro with domain knowledge

---

### Phase 6: Polish & Documentation

**Goal:** Complete documentation and example workflows

**Deliverables:**
1. `README.md` - Project overview and quick start
2. `EXAMPLES.md` - Real workflow examples showing full orchestration
3. `CONTRIBUTING.md` - How to add agents/skills
4. `TROUBLESHOOTING.md` - Common issues and solutions

**Validation:**
- New user can understand Maestro in <5 minutes
- New user can use Maestro immediately
- Examples demonstrate key benefits
- Troubleshooting covers common pitfalls

---

## TECHNICAL SPECIFICATIONS

### Directory Structure

```
maestro/
├── README.md                          # Overview and quick start
├── MAESTRO_BLUEPRINT.md               # This document
├── maestro.md                         # Conductor persona
├── MAESTRO_SUBAGENT_PROTOCOL.md       # Delegation/evaluation protocol
├── EXAMPLES.md                        # Workflow examples
├── CONTRIBUTING.md                    # Extension guide
├── TROUBLESHOOTING.md                 # Common issues
│
├── .claude/
│   ├── settings.json                  # Hook configuration
│   │
│   ├── agents/                        # Subagent definitions
│   │   ├── agent-registry.json        # Agent discovery registry
│   │   ├── list.md
│   │   ├── open.md
│   │   ├── read.md
│   │   ├── write.md
│   │   ├── fetch.md
│   │   ├── base-research.md
│   │   ├── base-analysis.md
│   │   ├── 4d-evaluation.md
│   │   └── skill-wizard.md
│   │
│   ├── skills/                        # Skill library
│   │   ├── skill-rules.json           # Skill discovery registry
│   │   ├── list/
│   │   │   ├── SKILL.md
│   │   │   └── resources/
│   │   │       ├── methodology.md
│   │   │       ├── patterns.md
│   │   │       └── troubleshooting.md
│   │   ├── open/
│   │   │   └── [same structure]
│   │   ├── read/
│   │   │   └── [same structure]
│   │   ├── write/
│   │   │   └── [same structure]
│   │   ├── fetch/
│   │   │   └── [same structure]
│   │   ├── base-research/
│   │   │   └── [same structure]
│   │   ├── base-analysis/
│   │   │   └── [same structure]
│   │   ├── 4d-evaluation/
│   │   │   └── [same structure]
│   │   └── skill-developer/
│   │       └── [same structure]
│   │
│   └── hooks/                         # Automation hooks
│       ├── package.json               # Minimal Node.js deps
│       ├── maestro-agent-suggester.js # Agent discovery for Maestro
│       ├── subagent-skill-discovery.js # Skill discovery for subagents
│       ├── work-tracker.sh            # Track file modifications
│       └── evaluation-reminder.js     # Remind to evaluate
│
└── examples/                          # Example workflows
    ├── simple-file-modification.md
    ├── codebase-research.md
    ├── multi-step-feature.md
    └── refinement-iteration.md
```

---

### Hook Dependencies

**package.json** (minimal, native Node.js focus):
```json
{
  "name": "maestro-hooks",
  "version": "1.0.0",
  "type": "module",
  "dependencies": {
    "minimatch": "^9.0.0"
  }
}
```

**Why so minimal?**
- `minimatch`: For glob pattern matching (skill triggers)
- Everything else: Native Node.js (fs, path, JSON parsing)
- Bash scripts need zero dependencies

---

### skill-rules.json Structure

```json
{
  "version": "1.0",
  "skills": {
    "skill-name": {
      "type": "domain|guardrail",
      "enforcement": "suggest|block|warn",
      "priority": "critical|high|medium|low",
      "promptTriggers": {
        "keywords": ["keyword1", "keyword2"],
        "intentPatterns": ["regex1", "regex2"]
      },
      "fileTriggers": {
        "pathPatterns": ["**/*.js", "src/**/*.ts"],
        "contentPatterns": ["regex1", "regex2"]
      },
      "skipConditions": {
        "sessionMarker": "skill-name-used",
        "fileMarker": "// @maestro-skip: skill-name",
        "envVar": "MAESTRO_SKIP_SKILL_NAME"
      }
    }
  }
}
```

**Field Explanations:**
- `type`: "domain" (guidance) vs "guardrail" (enforcement)
- `enforcement`: "suggest" (gentle), "block" (mandatory), "warn" (notice)
- `priority`: Determines display order in skill suggestions
- `promptTriggers.keywords`: Simple string matching in task description
- `promptTriggers.intentPatterns`: Regex for intent detection
- `fileTriggers.pathPatterns`: Glob patterns for file paths (e.g., "**/*.js", "src/**/*.py")
- `fileTriggers.contentPatterns`: Regex for file content
- `skipConditions`: Ways to bypass skill (session, marker, env)

---

### settings.json Configuration

```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "name": "Maestro Agent Suggester",
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/maestro-agent-suggester.js"
          }
        ]
      },
      {
        "name": "Subagent Skill Discovery",
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/subagent-skill-discovery.js"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/work-tracker.sh"
          }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/evaluation-reminder.js"
          }
        ]
      }
    ]
  }
}
```

**Hook Execution Order:**

**When user makes request to Maestro:**
1. `maestro-agent-suggester.js` fires (UserPromptSubmit)
   - Analyzes user request
   - Suggests appropriate agent
   - Reminds Maestro to delegate

**When Maestro spawns subagent:**
2. `subagent-skill-discovery.js` fires (UserPromptSubmit in subagent context)
   - Analyzes subagent's task
   - Suggests relevant skills
   - Reminds subagent to use skills

**When subagent modifies files:**
3. `work-tracker.sh` fires (PostToolUse after Edit/Write)
   - Tracks modifications silently

**When Maestro finishes response:**
4. `evaluation-reminder.js` fires (Stop)
   - Checks if subagent output was received
   - Reminds to evaluate if needed

---

### Agent Return Format Specification

All agents must return structured output in this format:

```markdown
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 [AGENT NAME] REPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Task:** [What Maestro requested]

**Skills Used:** [Which skills were discovered and activated]
- skill-name: [How it was used]

**Actions Taken:**
1. [Action 1 with file:line references]
2. [Action 2 with file:line references]
3. [Action 3 with file:line references]

**Evidence:**
[Code snippets, test output, screenshots, etc. - PROOF of completion]

```
[file:line-start:line-end]
code snippet showing the work
```

**Verification:**
- [ ] Tests pass (if applicable)
- [ ] No errors or warnings
- [ ] Edge cases handled
- [ ] Documentation updated (if needed)

**Notes:**
[Any caveats, assumptions, or follow-up recommendations]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Why this format?**
- Structured for easy parsing by 4D-Evaluation agent
- Evidence-based (not just claims)
- Clear accountability (what was done, where)
- Verification checklist (quality self-check)
- Transparency (skills used, decisions made)

---

### Maestro Evaluation Format

After receiving subagent output, Maestro (via 4D-Evaluation agent) returns:

```markdown
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 4-D EVALUATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Evaluated:** [Subagent name] output for [task]

**PRODUCT DISCERNMENT:**
✓ Correctness: [Pass/Fail - reasoning]
✓ Elegance: [Pass/Fail - reasoning]
✓ Completeness: [Pass/Fail - reasoning]
✓ Problem Solving: [Pass/Fail - reasoning]

**PROCESS DISCERNMENT:**
✓ Reasoning: [Pass/Fail - reasoning]
✓ Thoroughness: [Pass/Fail - reasoning]
✓ Techniques: [Pass/Fail - reasoning]
✓ Sustainability: [Pass/Fail - reasoning]

**PERFORMANCE DISCERNMENT:**
✓ Excellence Standards: [Pass/Fail - reasoning]
✓ Simplicity: [Pass/Fail - reasoning]
✓ Codebase Fit: [Pass/Fail - reasoning]
✓ Net Improvement: [Pass/Fail - reasoning]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**VERDICT:** [EXCELLENT ✅ | NEEDS REFINEMENT 🔄]

[If EXCELLENT:]
All criteria met. Output meets excellence standards.
Proceeding with implementation.

[If NEEDS REFINEMENT:]
**Issues Found:**
1. [Specific issue with reference to output]
2. [Specific issue with reference to output]

**Coaching Feedback for [Subagent]:**
1. [Actionable refinement instruction]
2. [Actionable refinement instruction]

**Re-delegating with refinements...**

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## MAESTRO IN ACTION

### Example Workflow: "Add error handling to authentication service"

**Step 1: User Request**
```
User: Add comprehensive error handling to the authentication service
```

**Step 2: Maestro Analyzes**
```
🎼 Maestro: Analyzing request...

Task Type: Code modification
Domain: Error handling, authentication
Complexity: Medium
Best Agent: Write agent
```

**Step 3: Maestro Delegates**
```
🎼 Maestro: Delegating to Write agent
📋 Reason: Code modification with error handling requirements

📤 Passing to Write agent:

PRODUCT:
- Task: Add comprehensive error handling to authentication service
- Files: src/auth/auth_service.js
- Expected: Try-catch blocks, proper error types, logging
- Acceptance: All error paths handled, errors provide context

PROCESS:
- Read current auth_service.js, identify error-prone operations
- Check for Write skill and error-tracking skill
- Add error handling following discovered patterns
- Ensure errors include context (operation, user info)
- Verify no silent failures

PERFORMANCE:
- Work autonomously
- Discover and use relevant skills
- Return structured report with evidence
- Show code changes with file:line references

⏳ Write agent is working...
```

**Step 4: Write Agent Executes**
```
🎯 WRITE AGENT ACTIVATED
📂 Task: Add error handling to auth_service.js

🔧 Discovering skills...
✓ Found: Write skill
✓ Found: error-tracking skill

📖 Loading Write skill guidance...
📖 Loading error-tracking patterns...

⚙️  Analyzing auth_service.js (245 lines)...
⚙️  Identified 8 error-prone operations:
   - Database queries (lines 45, 78, 112)
   - Token signing (line 156)
   - Password hashing (line 189)
   - API calls (lines 201, 223)
   - Validation (line 234)

⚙️  Adding error handling following error-tracking patterns...
   - Try-catch blocks with proper error types
   - Logging with context
   - User-friendly error messages

✅ Modifications complete
```

**Step 5: Write Agent Returns**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 WRITE AGENT REPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Task:** Add comprehensive error handling to auth_service.js

**Skills Used:**
- Write skill: Modification patterns, safety checks
- error-tracking skill: Error handling patterns

**Actions Taken:**
1. Added try-catch to database operations (lines 45, 78, 112)
2. Added error handling to token signing (line 156)
3. Added error handling to password hashing (line 189)
4. Added error handling to external API calls (lines 201, 223)
5. Added validation error handling (line 234)
6. Created custom error classes (AuthenticationError, DatabaseError)
7. Added logging with context to all error handlers

**Evidence:**

```javascript
// src/auth/auth_service.js:45-55
async findUserByEmail(email) {
  try {
    return await this.db.user.findUnique({ where: { email } });
  } catch (error) {
    logger.error('Database error finding user', {
      email,
      error: error.message
    });
    throw new DatabaseError('Failed to find user', { email });
  }
}
```

```javascript
// src/auth/auth_service.js:156-166
async generateToken(userId) {
  try {
    return jwt.sign({ userId }, process.env.JWT_SECRET);
  } catch (error) {
    logger.error('Token signing failed', {
      userId,
      error: error.message
    });
    throw new AuthenticationError('Token generation failed');
  }
}
```

**Verification:**
- [x] All error-prone operations wrapped
- [x] Errors include context for debugging
- [x] Logging added with structured data
- [x] Custom error classes created
- [x] No silent failures remain

**Notes:**
- Followed error-tracking skill patterns
- All errors now provide actionable context
- Consider adding error recovery for database timeouts

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Step 6: Maestro Evaluates**
```
📥 Received from Write agent

🔍 Running 4-D evaluation...
⏳ Delegating to 4D-Evaluation agent...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 4-D EVALUATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**PRODUCT DISCERNMENT:**
✓ Correctness: PASS - Error handling logic is sound
✓ Elegance: PASS - Clean try-catch blocks, no over-engineering
✓ Completeness: PASS - All identified error paths covered
✓ Problem Solving: PASS - Addresses root requirement

**PROCESS DISCERNMENT:**
✓ Reasoning: PASS - Systematic approach, identified all error points
✓ Thoroughness: PASS - Used skills for patterns, comprehensive coverage
✓ Techniques: PASS - Followed error-tracking skill patterns
✓ Sustainability: PASS - Maintainable, consistent error handling

**PERFORMANCE DISCERNMENT:**
✓ Excellence Standards: PASS - Exceeds basic requirements
✓ Simplicity: PASS - No unnecessary complexity
✓ Codebase Fit: PASS - Follows existing patterns
✓ Net Improvement: PASS - Significantly improves error visibility

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**VERDICT:** EXCELLENT ✅

All 4-D criteria met. Output demonstrates:
- Comprehensive error coverage
- Proper use of skills for patterns
- Evidence-based completion
- Production-ready quality

Proceeding with implementation.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Step 7: Maestro Confirms to User**
```
✅ Task complete: Error handling added to authentication service

**Summary:**
- 8 error-prone operations now protected
- Custom error classes created (AuthenticationError, DatabaseError)
- Logging added with context for debugging
- All changes verified through 4-D evaluation

**Files Modified:**
- src/auth/auth.service.ts (error handling added)

**Skills Applied:**
- Write skill (modification patterns)
- error-tracking skill (Sentry integration patterns)

**Quality Assurance:**
Passed all 4-D evaluation criteria (Product, Process, Performance)

The authentication service now has comprehensive error handling with
proper logging and typed errors.
```

---

### Example Workflow: Refinement Iteration

**What if evaluation fails?**

**Step 6 (Alternate): Maestro Finds Issues**
```
📥 Received from Write agent

🔍 Running 4-D evaluation...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 4-D EVALUATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**PRODUCT DISCERNMENT:**
✓ Correctness: PASS - Logic is sound
✗ Elegance: FAIL - Error messages expose internal implementation
✓ Completeness: PASS - All paths covered
✓ Problem Solving: PASS - Addresses requirement

**PROCESS DISCERNMENT:**
✓ Reasoning: PASS - Systematic approach
⚠ Thoroughness: WARNING - Missed edge case: null JWT_SECRET
✓ Techniques: PASS - Followed patterns
✓ Sustainability: PASS - Maintainable

**PERFORMANCE DISCERNMENT:**
✓ Excellence Standards: PASS - Good quality
✗ Simplicity: FAIL - Duplicate error handling code (DRY violation)
✓ Codebase Fit: PASS - Follows patterns
✓ Codebase Improvement: PASS - Net positive

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**VERDICT:** NEEDS REFINEMENT 🔄

**Issues Found:**
1. Error messages expose internal details (security risk)
   - Example: "Database error finding user" reveals DB structure

2. Duplicate error handling code violates DRY principle
   - Try-catch pattern repeated 8 times with similar structure

3. Missing edge case: JWT_SECRET could be undefined/null

**Coaching Feedback for Write agent:**
1. Replace technical error messages with user-friendly versions
   - Keep technical details in logs only
   - User-facing: "Authentication failed, please try again"

2. Extract error handling to helper function
   - Create `wrapWithErrorHandling(operation, context)` utility
   - Reduces duplication, improves maintainability

3. Add validation for JWT_SECRET at service initialization
   - Fail fast if environment variable missing
   - Add to constructor with clear error message

**Re-delegating to Write agent with refinements...**

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Step 7: Maestro Re-Delegates**
```
🎼 Maestro: Re-delegating to Write agent
📋 Reason: Refinement needed based on 4-D evaluation

📤 Passing to Write agent:

PRODUCT:
- Task: Refine error handling in auth_service.js
- Issues: Security (exposed internals), DRY violation, missing validation
- Expected: User-friendly errors, helper function, env validation
- Acceptance: Passes 4-D evaluation criteria

PROCESS:
- Replace error messages with user-friendly versions
- Create wrapWithErrorHandling() helper to reduce duplication
- Add JWT_SECRET validation in constructor
- Maintain existing error logging (keep technical details in logs)

PERFORMANCE:
- Apply coaching feedback precisely
- Show improvements clearly
- Verify security issue resolved

COACHING CONTEXT:
[Provides full evaluation from 4D-Evaluation agent]

⏳ Write agent is refining...
```

**Step 8: Write Agent Refines & Returns**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 WRITE AGENT REPORT (REFINEMENT)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Task:** Refine error handling based on 4-D evaluation feedback

**Refinements Applied:**
1. ✅ Replaced technical errors with user-friendly messages
2. ✅ Created wrapWithErrorHandling() helper (eliminates duplication)
3. ✅ Added JWT_SECRET validation in constructor

**Actions Taken:**
1. Created error handling utility (src/auth/utils/error_handler.js)
2. Refactored all 8 error handlers to use utility
3. Added environment validation in AuthService constructor
4. Updated error messages (user-facing vs logs)

**Evidence:**

```javascript
// src/auth/utils/error_handler.js (NEW FILE)
async function wrapWithErrorHandling(operation, context) {
  try {
    return await operation();
  } catch (error) {
    logger.error(`Operation failed: ${context.operation}`, {
      ...context,
      error: error.message
    });
    throw new AuthenticationError('Authentication failed. Please try again.');
  }
}

module.exports = { wrapWithErrorHandling };
```

```javascript
// src/auth/auth_service.js - Constructor (NEW)
constructor(db) {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  this.db = db;
}
```

```javascript
// src/auth/auth_service.js - Refactored usage
async findUserByEmail(email) {
  return wrapWithErrorHandling(
    () => this.db.user.findUnique({ where: { email } }),
    { operation: 'findUserByEmail', email }
  );
}
```

**Verification:**
- [x] Technical details hidden from user-facing errors
- [x] All duplication eliminated (8 try-catch → 1 utility)
- [x] JWT_SECRET validated at startup
- [x] Logging still captures full technical context

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Step 9: Maestro Re-Evaluates**
```
📥 Received refinement from Write agent

🔍 Running 4-D evaluation (iteration 2)...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 4-D EVALUATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**PRODUCT DISCERNMENT:**
✓ Correctness: PASS - Logic sound, edge cases covered
✓ Elegance: PASS - User-friendly errors, no internal exposure
✓ Completeness: PASS - All requirements met
✓ Problem Solving: PASS - Addresses root issues

**PROCESS DISCERNMENT:**
✓ Reasoning: PASS - Applied feedback precisely
✓ Thoroughness: PASS - Edge case (JWT_SECRET) now handled
✓ Techniques: PASS - DRY principle applied correctly
✓ Sustainability: PASS - Maintainable utility pattern

**PERFORMANCE DISCERNMENT:**
✓ Excellence Standards: PASS - Exceeds requirements
✓ Simplicity: PASS - Elegant abstraction, reduced complexity
✓ Codebase Fit: PASS - Utility pattern fits well
✓ Net Improvement: PASS - Significantly improved

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**VERDICT:** EXCELLENT ✅

All previous issues resolved:
1. ✅ Security: Error messages now user-friendly
2. ✅ DRY: Utility eliminates duplication
3. ✅ Edge case: JWT_SECRET validated

Refinement demonstrates strong coaching response.
Output now meets full excellence standards.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Step 10: Maestro Confirms**
```
✅ Task complete: Error handling refined to excellence

**Iterations:** 2 (initial + 1 refinement)

**Refinements Applied:**
- Security: User-friendly error messages (internals hidden)
- Code Quality: DRY violation eliminated via utility
- Robustness: Environment validation at startup

**Final State:**
- src/auth/auth_service.js (refactored)
- src/auth/utils/error_handler.js (new utility)

**Quality Assurance:**
Passed all 4-D criteria after refinement iteration.

The authentication service now has production-grade error handling that
is secure, maintainable, and robust.
```

---

## MAESTRO PRINCIPLES SUMMARY

**Conductor, Not Executor:**
- Maestro orchestrates but never writes code
- All work delegated to specialized subagents
- Delegation is strategic, not automatic

**Quality Over Speed:**
- Every output passes through 4-D evaluation
- Refinement iterations are mandatory when needed
- Excellence is the only acceptable standard

**Context Preservation:**
- Main Maestro context stays clean (orchestration only)
- Heavy work happens in isolated subagent contexts
- Skills load progressively where needed

**Transparent Process:**
- User sees orchestration (who, why, what)
- Evaluations are visible and explained
- Refinement coaching is transparent

**Framework Agnostic:**
- Zero bias toward any tech stack
- Base components are methodology, not implementation
- Users extend with domain-specific skills

**Native Claude Ecosystem:**
- Uses only native Claude Code tools
- No external dependencies or APIs
- Simple: Node.js + Bash + JSON + Markdown

---

## SUCCESS CRITERIA

**Maestro is successful when:**

1. ✅ Maestro refuses to write code directly (delegation mandate works)
2. ✅ Subagents discover and use skills automatically (auto-activation works)
3. ✅ Every output is evaluated through 4-D gates (quality enforcement works)
4. ✅ Refinement iterations happen naturally (coaching loop works)
5. ✅ Main context stays clean during complex work (progressive disclosure works)
6. ✅ Users can add domain skills easily (skill-wizard works)
7. ✅ Framework remains agnostic (no tech bias creeps in)
8. ✅ New users understand Maestro in <5 minutes (documentation works)
9. ✅ Transparency is clear but not overwhelming (protocol works)
10. ✅ Excellence becomes the default, not the exception (culture works)

---

## NEXT STEPS

**To implement Maestro:**

1. **Phase 1:** Enhance `maestro.md` with delegation-only mandate
2. **Phase 2:** Create 8 base agents (List, Open, Read, Write, Fetch, Research, Analysis, 4D-Eval)
3. **Phase 3:** Create 8 base skills (matching agents, framework-agnostic)
4. **Phase 4:** Implement hook system (skill discovery, delegation reminder)
5. **Phase 5:** Create skill-wizard for user extensions
6. **Phase 6:** Documentation and examples

**Ready to start?** Begin with Phase 1: Maestro conductor persona refinement.

---

**End of Blueprint**

*Maestro: Excellence through delegation, evaluation, and iteration.*
