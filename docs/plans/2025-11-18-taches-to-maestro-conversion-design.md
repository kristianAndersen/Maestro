# TÂCHES to Maestro Conversion Design

**Date:** 2025-11-18
**Status:** Design Complete, Ready for Implementation

## Overview

Convert 3 TÂCHES prompt systems into 6 Maestro-native components (3 agents + 3 skills) with full auto-discovery integration and 4D evaluation.

**Approach:** Deep Maestro Integration (Approach 2)
- Redesign each system to work WITH Maestro's delegation model
- Agents and skills follow progressive disclosure (<500 lines)
- Full integration with agent-registry.json and skill-rules.json
- Auto-discovery via existing hooks
- Complete 4D evaluation gates

---

## Section 1: Overall Architecture

### The Conversion Strategy

We're converting 3 TÂCHES prompt systems into 6 Maestro-native components (3 agents + 3 skills) that work seamlessly with Maestro's conductor model.

### The Three Systems

**1. Context Handoff** - Preserves work across context switches
- **Agent**: `.claude/agents/context-handoff.md` - Analyzes conversations, creates whats-next.md documents
- **Skill**: `.claude/skills/context-handoff/SKILL.md` - Guides HOW to structure handoffs properly

**2. Meta-Prompting** - Delegates prompt engineering to Claude
- **Agent**: `.claude/agents/meta-prompting.md` - Creates XML-structured prompts, delegates execution
- **Skill**: `.claude/skills/meta-prompting/SKILL.md` - Guides prompt engineering methodology

**3. Todo Management** - Captures ideas without derailing focus
- **Agent**: `.claude/agents/todo-management.md` - Manages TO-DOS.md, adds/retrieves items
- **Skill**: `.claude/skills/todo-management/SKILL.md` - Guides todo capture patterns

### Auto-Discovery Integration

All components register in Maestro's discovery systems:
- **agent-registry.json** - Triggers for when Maestro should suggest each agent
- **skill-rules.json** - Triggers for when agents should discover each skill
- **Hooks** - maestro-agent-suggester.js detects user intent and suggests appropriate agent

### 4D Evaluation

Each agent returns structured evidence that passes through 4D gates:
- **Product Discernment** - Is the handoff/prompt/todo complete and correct?
- **Process Discernment** - Was the methodology sound?
- **Performance Discernment** - Does it meet excellence standards?

---

## Section 2: Context Handoff Agent + Skill

### Agent: `.claude/agents/context-handoff.md`

```yaml
---
name: context-handoff
description: "Analyzes current conversation and creates structured handoff document (whats-next.md) for seamless continuation in fresh context"
tools: Read, Write, Bash, Grep, Glob
model: sonnet
---
```

**When to Use:**
- User says "create handoff", "what's next", or context is getting full
- End of work session before switching contexts
- Before starting fresh conversation on same task

**Autonomous Execution:**
1. Analyze conversation history from beginning to now
2. Extract: original task, work completed (with file:line references), work remaining, attempted approaches, critical context, current state
3. Structure as XML document with semantic tags
4. Write to `whats-next.md` in working directory
5. Return summary with verification that all key context captured

**Skills to Discover:** `context-handoff`

**Return Format:**
```xml
<agent_result>
  <summary>Created whats-next.md with comprehensive handoff documentation</summary>
  <evidence>
    <files_created>whats-next.md</files_created>
    <verification>
      - 6 required sections present
      - File:line references: [count]
      - Attempted approaches documented: [count]
      - Ready for fresh context continuation
    </verification>
  </evidence>
  <ready_for_evaluation>true</ready_for_evaluation>
</agent_result>
```

### Skill: `.claude/skills/context-handoff/SKILL.md`

**Purpose:** Guide agents on creating high-quality handoff documents

**Structure:** (<500 lines main file)
- YAML frontmatter with name and description
- Quick Start: 6 required sections, XML structure, file:line precision
- Key Principles: Comprehensive over brevity, future Claude must understand weeks later, capture failures not just successes
- Navigation to resources

**Resources:**
- `resources/methodology.md` - Deep dive on each of the 6 sections
- `resources/patterns.md` - Examples for different task types (coding, research, analysis, writing)

---

## Section 3: Meta-Prompting Agent + Skill

### Agent: `.claude/agents/meta-prompting.md`

```yaml
---
name: meta-prompting
description: "Expert prompt engineer: creates optimized XML-structured prompts and delegates execution to fresh sub-agents with parallel/sequential strategies"
tools: Read, Write, Edit, Bash, Glob, Task, AskUserQuestion
model: sonnet
---
```

**When to Use:**
- User requests complex feature requiring architectural decisions
- Task has 3+ distinct steps or multiple files
- User says "create prompt for..." or "meta-prompt this"
- Refactoring, migrations, performance optimization

**Autonomous Execution:**

**Phase 1: Prompt Creation**
1. Analyze user request for clarity (Golden Rule: would colleague understand?)
2. Ask clarifying questions if ambiguous
3. Determine single vs multiple prompts (parallel vs sequential)
4. Generate XML-structured prompts with: objective, context, requirements, verification, success criteria
5. Save to `.prompts/[number]-[name].md`
6. Ask user: run now / review first / save for later

**Phase 2: Prompt Execution** (if requested)
7. Read prompt file(s)
8. Delegate to Task tool (general-purpose subagent)
9. Parallel: spawn all Tasks in single message
10. Sequential: spawn Tasks one at a time, wait for completion
11. Archive to `.prompts/completed/` with metadata
12. Return consolidated results with evidence

**Skills to Discover:** `meta-prompting`

**Return Format:**
```xml
<agent_result>
  <summary>Created [N] prompt(s) and [executed/saved for later]</summary>
  <evidence>
    <files_created>.prompts/[number]-[name].md</files_created>
    <prompt_quality>
      - XML structure: complete
      - Success criteria: defined
      - Verification steps: included
      - Execution strategy: [parallel/sequential/deferred]
    </prompt_quality>
    <execution_results>[If executed: consolidated sub-agent results]</execution_results>
  </evidence>
  <ready_for_evaluation>true</ready_for_evaluation>
</agent_result>
```

### Skill: `.claude/skills/meta-prompting/SKILL.md`

**Purpose:** Guide prompt engineering methodology

**Structure:** (<500 lines main file)
- YAML frontmatter with name and description
- Quick Start: XML structure patterns, when to use extended thinking, WHY explanations matter
- Key Principles: Clarity first, context is critical, explicit instructions, verification always
- Navigation to resources

**Resources:**
- `resources/xml-patterns.md` - Templates for coding, analysis, research tasks
- `resources/complexity-assessment.md` - How to determine simple vs complex, single vs multiple prompts
- `resources/parallel-vs-sequential.md` - Decision framework for execution strategy

---

## Section 4: Todo Management Agent + Skill

### Agent: `.claude/agents/todo-management.md`

```yaml
---
name: todo-management
description: "Manages TO-DOS.md: captures ideas mid-conversation without derailing focus, retrieves todos with full context for resuming work"
tools: Read, Write, Edit, Bash, Glob, AskUserQuestion
model: sonnet
---
```

**When to Use:**
- User spots something to fix/improve but wants to stay focused on current task
- User says "add to todos", "capture this", "remind me to..."
- User wants to check todos or resume previous work
- Mid-conversation idea capture

**Autonomous Execution:**

**Mode 1: Add Todo**
1. Check for duplicate todos in TO-DOS.md (create file if missing)
2. Extract from conversation: problem, relevant files with line numbers, solution approach
3. Format as structured entry: `**[Action] [Component]** - Description. **Problem:** ... **Files:** ... **Solution:** ...`
4. Append under new heading: `## Context Title - YYYY-MM-DD HH:MM`
5. Confirm saved and ask if user wants to continue original work

**Mode 2: Check/Retrieve Todo**
6. Parse TO-DOS.md and display compact numbered list with dates
7. Wait for user selection
8. Load full context for selected todo with file summaries
9. Check for matching workflows (CLAUDE.md, .claude/skills/)
10. Present options: invoke skill / work directly / brainstorm / browse others
11. Remove from list when work begins
12. Return structured context ready for work

**Skills to Discover:** `todo-management`

**Return Format:**
```xml
<agent_result>
  <summary>[Added todo / Loaded todo #N for work]</summary>
  <evidence>
    <operation>[add/retrieve]</operation>
    <todo_details>
      - Problem: [extracted problem]
      - Files: [file paths with line numbers]
      - Solution approach: [if available]
    </todo_details>
    <workflow_match>[If retrieve: detected workflow or none]</workflow_match>
  </evidence>
  <ready_for_evaluation>true</ready_for_evaluation>
</agent_result>
```

### Skill: `.claude/skills/todo-management/SKILL.md`

**Purpose:** Guide effective todo capture and context preservation

**Structure:** (<500 lines main file)
- YAML frontmatter with name and description
- Quick Start: Structured format (Problem/Files/Solution), when to capture vs continue
- Key Principles: Capture liberally, include line numbers, self-contained for future Claude
- Navigation to resources

**Resources:**
- `resources/capture-patterns.md` - When to capture, how much detail, formatting examples
- `resources/workflow-detection.md` - How to match todos to project workflows and skills

---

## Section 5: Auto-Discovery Integration

### Agent Registry Entries

**File:** `.claude/agents/agent-registry.json`

Add these entries:

```json
{
  "context-handoff": {
    "triggers": {
      "keywords": ["handoff", "whats-next", "continue later", "fresh context", "context switch"],
      "intentPatterns": [
        "context.*full",
        "start.*fresh.*chat",
        "save.*progress",
        "create.*handoff"
      ],
      "operations": ["session-end", "context-preservation"]
    },
    "complexity": "medium",
    "autonomy": "high"
  },

  "meta-prompting": {
    "triggers": {
      "keywords": ["create prompt", "meta-prompt", "generate prompt", "complex feature", "multi-step"],
      "intentPatterns": [
        "refactor.*multiple.*files",
        "complex.*feature",
        "migration",
        "architectural.*decision"
      ],
      "operations": ["prompt-creation", "sub-agent-delegation"]
    },
    "complexity": "complex",
    "autonomy": "medium"
  },

  "todo-management": {
    "triggers": {
      "keywords": ["add to todos", "capture this", "remind me", "check todos", "todo list"],
      "intentPatterns": [
        "spotted.*bug.*later",
        "noticed.*improve",
        "should.*refactor.*not now",
        "what.*outstanding"
      ],
      "operations": ["idea-capture", "context-preservation", "backlog-management"]
    },
    "complexity": "simple",
    "autonomy": "high"
  }
}
```

### Skill Registry Entries

**File:** `.claude/skills/skill-rules.json`

Add these entries:

```json
{
  "context-handoff": {
    "type": "domain",
    "enforcement": "suggest",
    "priority": "high",
    "promptTriggers": ["handoff", "documentation", "context preservation"],
    "fileTriggers": ["whats-next.md"],
    "agents": ["context-handoff"]
  },

  "meta-prompting": {
    "type": "domain",
    "enforcement": "suggest",
    "priority": "high",
    "promptTriggers": ["prompt engineering", "XML structure", "sub-agent delegation"],
    "fileTriggers": [".prompts/**/*.md"],
    "agents": ["meta-prompting"]
  },

  "todo-management": {
    "type": "domain",
    "enforcement": "suggest",
    "priority": "medium",
    "promptTriggers": ["todo", "backlog", "idea capture"],
    "fileTriggers": ["TO-DOS.md"],
    "agents": ["todo-management"]
  }
}
```

### Hook Integration

**No new hooks required!** Existing Maestro hooks automatically use these registries:
- `maestro-agent-suggester.js` - Reads agent-registry.json for UserPromptSubmit
- `subagent-skill-discovery.js` - Reads skill-rules.json for subagent spawning

---

## Section 6: 4D Evaluation Gates

### Context Handoff - Evaluation Criteria

**Product Discernment:**
- Does whats-next.md contain all 6 sections?
- Are file:line references precise and complete?
- Can future Claude understand without the original conversation?

**Process Discernment:**
- Did agent analyze entire conversation from beginning to now?
- Were attempted approaches and failures captured, not just successes?
- Was the extraction comprehensive, not selective?

**Performance Discernment:**
- Is it comprehensive enough to resume work weeks later with zero information loss?
- Are all critical decisions and context included?
- Does it meet the "future Claude" test?

### Meta-Prompting - Evaluation Criteria

**Product Discernment:**
- Does prompt have XML structure with all required tags?
- Are success criteria and verification steps clearly defined?
- For multi-prompt: is parallel vs sequential strategy correct?

**Process Discernment:**
- Were clarifying questions asked when needed?
- Did agent assess complexity correctly?
- Was the Golden Rule applied (would colleague understand)?

**Performance Discernment:**
- Will this prompt produce excellent results on first execution?
- Are WHY explanations included for constraints?
- Is the prompt at appropriate depth for task complexity?

### Todo Management - Evaluation Criteria

**Product Discernment:**
- Does todo have required Problem and Files fields?
- Are line numbers included with file paths?
- Is context self-contained and actionable?

**Process Discernment:**
- Was duplicate check performed before adding?
- Were relevant files from conversation correctly identified?
- Was workflow detection thorough when retrieving?

**Performance Discernment:**
- Can future Claude resume this work with full context?
- Is the todo specific and actionable?
- Does it preserve the original intent and reasoning?

### Agent Return Format Standard

All agents must return:

```xml
<agent_result>
  <summary>[Concise summary of what was accomplished]</summary>
  <evidence>
    <files_created>[List with absolute paths]</files_created>
    <verification>[Proof of quality - specific metrics, file excerpts, validation checks]</verification>
    [Additional evidence specific to agent type]
  </evidence>
  <ready_for_evaluation>true</ready_for_evaluation>
</agent_result>
```

Maestro receives this structured output, evaluates against 4D criteria, and either:
- **Accept** - Delegation complete, proceed
- **Coach** - Provide specific, actionable refinement feedback and re-delegate

---

## Implementation Strategy

### Phase 1: Create Agent Files (3 files)
1. `.claude/agents/context-handoff.md`
2. `.claude/agents/meta-prompting.md`
3. `.claude/agents/todo-management.md`

### Phase 2: Create Skill Files (9 files)
1. `.claude/skills/context-handoff/SKILL.md`
2. `.claude/skills/context-handoff/resources/methodology.md`
3. `.claude/skills/context-handoff/resources/patterns.md`
4. `.claude/skills/meta-prompting/SKILL.md`
5. `.claude/skills/meta-prompting/resources/xml-patterns.md`
6. `.claude/skills/meta-prompting/resources/complexity-assessment.md`
7. `.claude/skills/meta-prompting/resources/parallel-vs-sequential.md`
8. `.claude/skills/todo-management/SKILL.md`
9. `.claude/skills/todo-management/resources/capture-patterns.md`
10. `.claude/skills/todo-management/resources/workflow-detection.md`

### Phase 3: Update Registries (2 files)
1. Update `.claude/agents/agent-registry.json` with 3 new entries
2. Update `.claude/skills/skill-rules.json` with 3 new entries

### Phase 4: Move Originals
1. Create `Agents-to-incorporate/` directory
2. Move converted TÂCHES prompts there for reference

### Output Location
All converted files will be placed in `Agents-to-incorporate/` before being moved to their final locations in `.claude/agents/` and `.claude/skills/`.

---

## Success Criteria

- [ ] All 3 agents follow Maestro specification format
- [ ] All 3 skills follow progressive disclosure (<500 lines)
- [ ] Agent registry entries enable auto-discovery
- [ ] Skill registry entries enable automatic skill loading
- [ ] Each agent returns structured evidence for 4D evaluation
- [ ] Files organized correctly (agents in `.claude/agents/`, skills in `.claude/skills/`)
- [ ] Original TÂCHES prompts preserved in `Agents-to-incorporate/`

---

## Next Steps

1. Use `superpowers:writing-plans` to create detailed implementation plan
2. Use `superpowers:subagent-driven-development` to execute implementation with quality gates
3. Test each agent with sample scenarios
4. Validate auto-discovery triggers work correctly
5. Document usage examples in Maestro documentation
