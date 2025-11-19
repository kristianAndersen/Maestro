# Quick Decision Guide

**Purpose**: Fast reference for choosing the right component type in the Maestro framework
**Last Updated**: 2025-11-18

---

## Table of Contents

1. [The 5-Second Decision Tree](#the-5-second-decision-tree)
2. [Component Type Decision Matrix](#component-type-decision-matrix)
3. [Tier Selection Flowchart](#tier-selection-flowchart)
4. [Common Scenarios](#common-scenarios)
5. [Red Flags & Anti-Patterns](#red-flags--anti-patterns)
6. [Quick Reference Tables](#quick-reference-tables)

---

## The 5-Second Decision Tree

```
What are you building?
    │
    ├─ User-invoked workflow? ────────────────────────> COMMAND
    │                                                   (templates/COMMAND_TEMPLATE.md)
    │
    ├─ Coordinates entire domain? ─────────────────────> TIER 1: AGENT
    │  (e.g., all file operations,                      (templates/AGENT_TEMPLATE.md)
    │   all data processing)
    │
    ├─ Orchestrates specific operation type? ──────────> TIER 2: SKILL
    │  (e.g., file writing with validation,             (templates/SKILL_TEMPLATE.md)
    │   data parsing with transformation)
    │
    └─ Performs single atomic operation? ──────────────> TIER 3: MICRO-SKILL
       (e.g., read file, validate JSON,                 (templates/MICRO_SKILL_TEMPLATE.md)
        write to disk)
```

---

## Component Type Decision Matrix

### Questions to Ask

| Question | COMMAND | AGENT (T1) | SKILL (T2) | MICRO-SKILL (T3) |
|----------|---------|------------|------------|------------------|
| **User-invoked?** | ✅ Yes | ❌ No | ❌ No | ❌ No |
| **Makes strategic decisions?** | ❌ No | ✅ Yes | ✅ Yes | ❌ No |
| **Orchestrates other components?** | ❌ No | ✅ Skills | ✅ Micro-skills | ❌ Nothing |
| **Has 4-D methodology?** | ❌ No | Domain Dir. | Tactical 4-D | ❌ No |
| **Delegates work?** | ❌ No | ✅ To skills | ✅ To micro-skills | ❌ No |
| **Pure execution?** | ❌ No | ❌ No | ❌ No | ✅ Yes |
| **Single operation?** | ❌ No | ❌ No | ❌ No | ✅ Yes |
| **Model preference** | N/A | Sonnet | Sonnet | Haiku |
| **Line limit** | None | None | <500 | <500 |

### Characteristics Comparison

| Characteristic | COMMAND | AGENT (T1) | SKILL (T2) | MICRO-SKILL (T3) |
|----------------|---------|------------|------------|------------------|
| **Complexity** | Medium | High | Medium-High | Low |
| **Scope** | Workflow | Domain | Operation type | Single operation |
| **Context size** | Small | Large | Medium | Minimal |
| **Error recovery** | Basic | Advanced | 5-level | 2-level |
| **Auto-activation** | ❌ User calls | ✅ Registry | ✅ Registry | ❌ Called by skills |
| **Evidence required** | Varies | ✅ Always | ✅ Always | ✅ Always |

---

## Tier Selection Flowchart

### "What Tier Should This Be?"

```
START: I need to create a component
    │
    ├─ Will user type a slash command to invoke it? ──Yes──> COMMAND
    │                                                         (.claude/commands/)
    │
    ├─ NO ↓
    │
    ├─ Does it coordinate an ENTIRE DOMAIN?
    │  Examples:
    │  • All file operations (read, write, delete, move, etc.)
    │  • All data processing operations
    │  • All API interactions
    │  │
    │  ├─ YES ──────────────────────────────────────────────> TIER 1: AGENT
    │  │                                                       (.claude/agents/)
    │  │                                                       Uses: Domain Direction
    │  │                                                       Delegates to: Skills
    │  │
    │  └─ NO ↓
    │
    ├─ Does it orchestrate ONE TYPE of operation?
    │  Examples:
    │  • File writing (with validation, backup, verification)
    │  • Data parsing (with validation, transformation, error handling)
    │  • API requests (with retry, rate limiting, error handling)
    │  │
    │  ├─ YES ──────────────────────────────────────────────> TIER 2: SKILL
    │  │                                                       (.claude/skills/)
    │  │                                                       Uses: Tactical 4-D
    │  │                                                       Delegates to: Micro-skills
    │  │
    │  └─ NO ↓
    │
    └─ Does it perform ONE ATOMIC operation?
       Examples:
       • Read a file
       • Validate JSON structure
       • Write bytes to disk
       • Parse a single field
       │
       └─ YES ──────────────────────────────────────────────> TIER 3: MICRO-SKILL
                                                              (.claude/skills/micro-skills/)
                                                              No 4-D methodology
                                                              Pure execution
```

### "Agent or Skill?"

```
Your component needs to orchestrate work...

Does it handle MULTIPLE OPERATION TYPES in a domain?
    │
    ├─ YES: "I handle reading, writing, deleting, moving files"
    │       "I handle fetching, posting, updating, deleting via API"
    │       "I coordinate parsing, validating, transforming, storing data"
    │       │
    │       └──────> TIER 1: AGENT
    │                Domain Coordinator
    │                Delegates to skills
    │
    └─ NO: "I only handle file writing"
           "I only handle API GET requests"
           "I only handle JSON parsing"
           │
           └──────> TIER 2: SKILL
                    Operation Specialist
                    Delegates to micro-skills
```

### "Skill or Micro-Skill?"

```
Your component performs an operation...

Does it make DECISIONS between multiple steps?
    │
    ├─ YES: "I decide whether to create backup based on file size"
    │       "I choose encoding based on content analysis"
    │       "I select retry strategy based on error type"
    │       │
    │       └──────> TIER 2: SKILL
    │                Has domain expertise
    │                Uses Tactical 4-D
    │                Orchestrates micro-skills
    │
    └─ NO: "I just read the file"
           "I just validate the JSON"
           "I just write the bytes"
           │
           └──────> TIER 3: MICRO-SKILL
                    No decisions
                    Pure execution
                    Returns result or rich error
```

---

## Common Scenarios

### Scenario 1: "I want to add file operations"

**What you're building**: Capability to read, write, edit, delete files

**Decision Path**:
1. Multiple operation types (read, write, edit, delete) → **TIER 1: AGENT**
2. Create `file-operations-agent.md`
3. Agent delegates to skills:
   - `file-reader` skill (TIER 2)
   - `file-writer` skill (TIER 2)
   - `file-editor` skill (TIER 2)
   - `file-deleter` skill (TIER 2)

**Template**: `templates/AGENT_TEMPLATE.md`

---

### Scenario 2: "I want to add safe file writing"

**What you're building**: Write files with validation, backup, and verification

**Decision Path**:
1. Single operation type (writing) but with orchestration → **TIER 2: SKILL**
2. Create `file-writer/SKILL.md`
3. Skill delegates to micro-skills:
   - `validate-path` micro-skill (TIER 3)
   - `create-backup` micro-skill (TIER 3)
   - `write-file` micro-skill (TIER 3)
   - `verify-write` micro-skill (TIER 3)

**Template**: `templates/SKILL_TEMPLATE.md`

---

### Scenario 3: "I want to add JSON validation"

**What you're building**: Validate JSON structure against schema

**Decision Path**:
1. Single atomic operation (validation) → **TIER 3: MICRO-SKILL**
2. Create `micro-skills/validate-json/SKILL.md`
3. Micro-skill:
   - Receives JSON + schema
   - Validates structure
   - Returns success/error with context

**Template**: `templates/MICRO_SKILL_TEMPLATE.md`

---

### Scenario 4: "I want to add a planning workflow"

**What you're building**: User types `/plan feature-name` to create implementation plan

**Decision Path**:
1. User-invoked with slash command → **COMMAND**
2. Create `.claude/commands/plan.md`
3. Command:
   - Uses $ARGUMENTS for feature name
   - Creates directory structure
   - Generates plan files
   - Returns summary

**Template**: `templates/COMMAND_TEMPLATE.md`

---

### Scenario 5: "I want to add smart API requests"

**What you're building**: Make API requests with retry, rate limiting, caching

**Decision Path**:
1. Single operation (API request) but with orchestration → **TIER 2: SKILL**
2. Create `api-requester/SKILL.md`
3. Skill delegates to micro-skills:
   - `check-rate-limit` micro-skill
   - `check-cache` micro-skill
   - `make-http-request` micro-skill
   - `update-cache` micro-skill
4. Skill makes strategic decisions:
   - When to use cache vs fresh request
   - Retry strategy based on error type
   - Rate limit handling approach

**Template**: `templates/SKILL_TEMPLATE.md`

---

## Red Flags & Anti-Patterns

### 🚩 Red Flag 1: Micro-Skill Making Decisions

**Symptom**: Your micro-skill has if/else logic for choosing approaches

**Problem**: Micro-skills are pure execution, no orchestration

**Solution**: Promote to TIER 2 SKILL or move decision logic to calling skill

**Example**:
```
❌ BAD (Micro-skill):
function readFile(path) {
  if (isBinary(path)) {
    return readBinary(path);
  } else if (isJSON(path)) {
    return readJSON(path);
  } else {
    return readText(path);
  }
}

✅ GOOD (Skill orchestrates):
// Skill makes decision
if (isBinary(path)) {
  result = await callMicroSkill('read-binary', { path });
} else if (isJSON(path)) {
  result = await callMicroSkill('read-json', { path });
} else {
  result = await callMicroSkill('read-text', { path });
}
```

---

### 🚩 Red Flag 2: Agent Performing Raw Operations

**Symptom**: Your agent directly reads files, makes API calls, etc.

**Problem**: Agents coordinate, they don't execute

**Solution**: Create skills for operations, agent delegates to them

**Example**:
```
❌ BAD (Agent doing work):
// In agent
const fileContent = fs.readFileSync(path);
const parsed = JSON.parse(fileContent);

✅ GOOD (Agent delegates):
// In agent
const result = await delegateToSkill('file-reader', {
  path: path,
  parse_json: true
});
```

---

### 🚩 Red Flag 3: Skill Without Micro-Skills

**Symptom**: Your skill has no `delegates-to` in frontmatter

**Problem**: Skills orchestrate micro-skills, they don't execute directly

**Solution**: Either:
- Create micro-skills for the operations, or
- Demote to TIER 3 MICRO-SKILL if it's truly single operation

**Example**:
```
❌ BAD (Skill doing everything):
---
name: file-writer
delegates-to: []  # Red flag!
---

✅ GOOD (Skill orchestrates):
---
name: file-writer
delegates-to: [validate-path, create-backup, write-file, verify-write]
---
```

---

### 🚩 Red Flag 4: Command That's Really an Agent

**Symptom**: Your command handles complex domain coordination

**Problem**: Commands are for user workflows, not system orchestration

**Solution**: Create agent, optionally add command as entry point

**Example**:
```
❌ BAD (Command doing too much):
---
description: Handle all file operations with delegation
---
Analyze request, choose operation type, coordinate...

✅ GOOD (Command → Agent):
---
description: Invoke file operations agent
---
Delegate to file-operations-agent with user's request
```

---

### 🚩 Red Flag 5: Too Many Tiers in One Component

**Symptom**: Your component description mentions "coordinates domain AND performs operations"

**Problem**: Mixing tier responsibilities

**Solution**: Split into appropriate tiers

**Example**:
```
❌ BAD (Mixed tiers):
"File manager that handles all file operations and performs reading/writing"
→ This is trying to be both AGENT and SKILL

✅ GOOD (Proper separation):
Agent: "File operations coordinator" (Tier 1)
    ├─ Skill: "File reader" (Tier 2)
    └─ Skill: "File writer" (Tier 2)
```

---

## Quick Reference Tables

### "I Need To..."

| I Need To... | Use This | Template |
|--------------|----------|----------|
| Coordinate an entire domain | TIER 1: AGENT | AGENT_TEMPLATE.md |
| Orchestrate one operation type | TIER 2: SKILL | SKILL_TEMPLATE.md |
| Perform one atomic operation | TIER 3: MICRO-SKILL | MICRO_SKILL_TEMPLATE.md |
| Create user-invoked workflow | COMMAND | COMMAND_TEMPLATE.md |
| Let users trigger planning | COMMAND | COMMAND_TEMPLATE.md |
| Auto-suggest based on keywords | AGENT or SKILL | Use registry triggers |

---

### Delegation Patterns

| From Tier | Delegates To | Example |
|-----------|--------------|---------|
| Maestro (T0) | Agents (T1) | Maestro → file-operations-agent |
| Agent (T1) | Skills (T2) | file-operations-agent → file-writer skill |
| Skill (T2) | Micro-skills (T3) | file-writer skill → write-file micro-skill |
| Micro-skill (T3) | Nothing | Performs operation, returns result |
| Command | Agents/Skills | Command can delegate to appropriate tier |

---

### Error Handling By Tier

| Tier | Error Handling | Example |
|------|----------------|---------|
| COMMAND | Basic | Return error message to user |
| AGENT (T1) | Advanced | Coordinate skill retries, escalate to Maestro |
| SKILL (T2) | 5-level system | Retry → Adjust → Alternative → Partial → Escalate |
| MICRO-SKILL (T3) | 2-level system | Auto-retry transient → Escalate with context |

---

### Model Selection

| Component | Model | Reason |
|-----------|-------|--------|
| Maestro (T0) | Sonnet | Strategic decisions across domains |
| AGENT (T1) | Sonnet | Domain coordination requires thinking |
| SKILL (T2) | Sonnet | Tactical decisions require expertise |
| MICRO-SKILL (T3) | Haiku | Pure execution, fast and cheap |
| COMMAND | N/A | No AI model (just text instructions) |

---

### File Organization

| Component Type | Location | Filename Pattern |
|----------------|----------|------------------|
| AGENT | `.claude/agents/` | `agent-name.md` + `agent-name.agent.json` |
| SKILL | `.claude/skills/skill-name/` | `SKILL.md` + `skill-name.skill.json` |
| MICRO-SKILL | `.claude/skills/micro-skills/name/` | `SKILL.md` + `name.skill.json` |
| COMMAND | `.claude/commands/` | `command-name.md` |
| Agent Registry | `.claude/agents/` | `agent-registry.json` |
| Skill Registry | `.claude/skills/` | `skill-rules.json` |

---

## Decision Checklist

When creating a new component, check these:

### For AGENTS (Tier 1)
- [ ] Coordinates entire domain (not single operation)
- [ ] Delegates to multiple skills
- [ ] Makes domain-level strategic decisions
- [ ] Has `.agent.json` manifest file
- [ ] Has entry in `agent-registry.json`
- [ ] Uses Domain Direction methodology
- [ ] Returns evidence-based results

### For SKILLS (Tier 2)
- [ ] Handles one operation type with expertise
- [ ] Delegates to micro-skills (listed in frontmatter)
- [ ] Implements Tactical 4-D methodology
- [ ] Main file is <500 lines
- [ ] Has `.skill.json` manifest file
- [ ] Has entry in `skill-rules.json`
- [ ] Uses 5-level error recovery

### For MICRO-SKILLS (Tier 3)
- [ ] Performs single atomic operation
- [ ] NO orchestration logic
- [ ] NO strategic decisions
- [ ] Uses Haiku model
- [ ] 2-level error handling (retry + escalate)
- [ ] Returns structured output with rich errors
- [ ] Has `.skill.json` manifest file
- [ ] <500 lines total

### For COMMANDS
- [ ] User-invoked with `/command-name`
- [ ] Has clear description in frontmatter
- [ ] Uses $ARGUMENTS for user input
- [ ] Provides step-by-step instructions
- [ ] Specifies output format
- [ ] Includes examples
- [ ] Located in `.claude/commands/`

---

## Summary

### The Golden Rules

1. **Agents** coordinate domains, delegate to skills
2. **Skills** orchestrate operations, delegate to micro-skills
3. **Micro-skills** execute operations, delegate to nothing
4. **Commands** provide user workflows, can delegate to agents/skills
5. **Each tier has ONE job** - don't mix responsibilities

### When In Doubt

Ask yourself:
1. "Does this make decisions?" → Not a micro-skill
2. "Does this delegate to multiple components?" → Agent or Skill
3. "Does this cover a whole domain?" → Agent
4. "Is this user-invoked?" → Command

### Next Steps

1. Choose component type using this guide
2. Use appropriate template from `templates/`
3. Follow patterns from `PATTERNS_REFERENCE.md`
4. Reference examples from `agent-hooks-commands-skill-inspiration/`

---

**Guide Version**: 1.0.0
**Last Updated**: 2025-11-18
**Companion Documents**:
- `PATTERNS_REFERENCE.md` - Detailed patterns and structures
- `templates/` - Templates for each component type
- `MAESTRO_BLUEPRINT.md` - Complete architecture specification
