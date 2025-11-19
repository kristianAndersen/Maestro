# Harry Wizard Implementation Plan

**Version:** 1.0
**Date:** 2025-01-19
**Status:** Ready for Implementation


---

## TABLE OF CONTENTS

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Implementation Roadmap](#implementation-roadmap)
4. [Harry Orchestrator Specifications](#harry-orchestrator-specifications)
5. [Creator Agent Specifications](#creator-agent-specifications)
6. [Audit & Healing System](#audit--healing-system)
7. [Registry Management](#registry-management)
8. [Use Cases & Workflows](#use-cases--workflows)
9. [Testing Strategy](#testing-strategy)
10. [Success Criteria](#success-criteria)
11. [References](#references)

---

## OVERVIEW

### Vision

Harry is a **meta-orchestrator agent** within the Maestro framework that enables users to create, update, audit, and heal framework components (agents, skills, hooks, commands) through an interactive wizard interface. Harry transforms Maestro from a fixed-component framework into a **self-evolving, user-extensible orchestration system** that maintains excellence through automated quality gates.

### Core Philosophy

Harry embodies Maestro's delegation-first principles:

- **Harry Never Creates Directly** - Acts as conductor, delegates to specialized creator agents
- **Audit Every Output** - All components pass through 100-point quality gates
- **Iterate Until Excellent** - Healing loops continue until audit scores >= 85/100
- **Interactive Guidance** - AskUserQuestion tool for all decision points
- **Framework Agnostic** - Zero bias toward React, Vue, Express, or any specific technology
- **Registry Management** - Automatic updates to agent-registry.json and skill-rules.json

### What Harry Enables

**For Users:**
- Create domain-specific agents without writing code
- Extend framework with custom skills, hooks, and commands
- Maintain and update existing components
- Ensure quality through automated auditing
- Recover from failures through guided healing

**For Maestro:**
- Automatic agent discovery for new domains
- Self-sustaining framework that can evolve independently
- Consistent quality enforcement via 4-D methodology
- Transparent creation process with user oversight
- Graceful handling of missing components

---

## ARCHITECTURE

### Three-Tier System

```
┌─────────────────────────────────────────────────────────────┐
│                    TIER 1: HARRY ORCHESTRATOR                │
│                                                               │
│  - Pure delegation (never codes)                             │
│  - Interactive menu system (AskUserQuestion)                 │
│  - Audit/healing loop coordinator                            │
│  - Registry update manager                                   │
│  - 9-step workflow execution                                 │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  TIER 2: CREATOR AGENTS (5)                  │
│                                                               │
│  1. create-meta-prompts    → Requirement refinement          │
│  2. create-subagents       → Agent file generation           │
│  3. create-agent-skills    → Skill file generation           │
│  4. create-hooks           → Hook configuration              │
│  5. create-commands        → Command file generation         │
│                                                               │
│  All converted from taches-cc skills to Maestro agents       │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  TIER 3: AUDITOR AGENTS (3)                  │
│                                                               │
│  1. skill-auditor      → 100-point skill evaluation          │
│  2. subagent-auditor   → 100-point agent evaluation          │
│  3. command-auditor    → 100-point command evaluation        │
│                                                               │
│  Already exist in taches-cc, ready for integration           │
└─────────────────────────────────────────────────────────────┘
```

### Quality Gate Integration (4-D Methodology)

```
Creation → Audit → [Pass >= 85 | Fail < 85] → Healing → Re-Audit → Integration
   ↓         ↓                                    ↓          ↓            ↓
Creator   Auditor      Decision Gate          Creator    Auditor     Registry
Agent     Agent        (User visible)         (refined)  (retry)     Update
```

**4-D Integration Points:**

1. **Delegation (D1):** Harry delegates to specialized creators, never executes directly
2. **Description (D2):** create-meta-prompts refines requirements comprehensively
3. **Discernment (D3):**
   - Product Discernment: Auditors evaluate component correctness
   - Process Discernment: Auditors evaluate methodology used
   - Performance Discernment: Auditors enforce excellence (>= 85 threshold)
4. **Diligence (D4):** Healing loops iterate until passing, no shortcuts

### File Structure

```
.claude/
├── agents/
│   ├── agent-registry.json          # Master agent registry (Harry updates)
│   ├── harry.md                     # Harry orchestrator
│   ├── create-meta-prompts.md       # Creator 1: Requirement refinement
│   ├── create-subagents.md          # Creator 2: Agent generation
│   ├── create-agent-skills.md       # Creator 3: Skill generation
│   ├── create-hooks.md              # Creator 4: Hook configuration
│   ├── create-commands.md           # Creator 5: Command generation
│   ├── skill-auditor.md             # Auditor 1: Skill evaluation
│   ├── subagent-auditor.md          # Auditor 2: Agent evaluation
│   └── slash-command-auditor.md     # Auditor 3: Command evaluation
│
├── skills/
│   ├── skill-rules.json             # Master skill registry (Harry updates)
│   └── [user-created skills]/
│
├── hooks/
│   ├── hooks.json                   # Hook configurations (Harry updates)
│   └── [hook scripts]
│
└── commands/
    ├── harry.md                     # /harry command wrapper
    └── [user-created commands]
```

---

## IMPLEMENTATION ROADMAP


#### Phase 1: Foundation 

**Goal:** Harry orchestrator operational with basic menu system

**Tasks:**

1. **Create Harry agent file** 
   - File: `.claude/agents/harry.md`
   - Implement complete 9-step workflow
   - Add all constraint checks (never create directly)
   - Implement AskUserQuestion menu patterns
   - Add transparency protocol (progress reporting)
   - Validation: Harry presents menu, refuses direct creation

2. **Update agent-registry.json** 
   - Add Harry entry with triggers
   - Keywords: ["create agent", "build skill", "no agent found", "wizard"]
   - IntentPatterns: ["create.*agent", "build.*skill", "need.*agent"]
   - Mark as fallback suggestion for unknown domains
   - Validation: maestro-agent-suggester.js suggests Harry appropriately

3. **Create /harry command** 
   - File: `.claude/commands/harry.md`
   - Simple delegation wrapper to Harry agent
   - No arguments needed
   - Pure XML structure
   - Validation: /harry activates Harry's interactive menu

4. **Phase 1 testing** 
   - Run /harry → Menu appears with 8 options
   - User request with no matching agent → Harry auto-activates
   - Harry refuses to create files directly
   - Harry delegates correctly (mock for now)

**Deliverables:**
- `.claude/agents/harry.md` (complete 9-step workflow)
- `.claude/commands/harry.md` (wrapper)
- Updated `.claude/agents/agent-registry.json`
- Phase 1 test report

**Success Criteria:**
- ✓ /harry command works
- ✓ Interactive menu displays
- ✓ Harry activates automatically when no agent matches
- ✓ Harry enforces "no direct creation" constraint

---

#### Phase 2: Creator Agents

**Goal:** All 5 creator agents operational and tested

**Parallel Development Strategy:**

**2.1: create-meta-prompts agent** 
- Source: `taches-cc-resources-main/skills/create-meta-prompts/SKILL.md`
- Remove skill YAML wrapper
- Add agent YAML (tools: Read, Write, AskUserQuestion, Grep, Glob)
- Convert to pure XML: `<role>`, `<constraints>`, `<workflow>`, `<output_format>`
- Remove user interaction (Harry handles menus)
- Add structured requirements document output
- Test adaptive questioning workflow
- Validation: Returns complete requirements document in markdown format

**2.2: create-subagents agent** 
- Source: `taches-cc-resources-main/skills/create-subagents/SKILL.md`
- Add agent YAML (tools: Read, Write, Edit, Grep, Glob)
- Preserve all XML structure guidance from original skill
- Add registry entry generation (extract triggers from description)
- Add "return to Harry" output format (JSON)
- Test agent.md creation with pure XML body
- Validation: Creates valid agent.md with no markdown headings in body

**2.3: create-agent-skills agent** 
- Source: `taches-cc-resources-main/skills/create-agent-skills/SKILL.md`
- Add agent YAML (tools: Read, Write, Edit, Grep, Glob, WebSearch, WebFetch)
- Preserve progressive disclosure logic (SKILL.md < 500 lines)
- Add reference file creation workflow
- Add skill-rules.json entry generation
- Test 500-line validation
- Validation: Creates valid SKILL.md < 500 lines + reference files if needed

**2.4: create-hooks agent** 
- Source: `taches-cc-resources-main/skills/create-hooks/SKILL.md`
- Add agent YAML (tools: Read, Write, Edit, Bash, Grep, Glob)
- Add hooks.json merge logic (read, merge, validate with jq)
- Add script creation workflow (chmod +x)
- Preserve all safety patterns (timeout, loop prevention)
- Test hook configuration generation
- Validation: Creates valid hook entry + script with executable permissions

**2.5: create-commands agent** 
- Source: `taches-cc-resources-main/skills/create-slash-commands/SKILL.md`
- Add agent YAML (tools: Read, Write, Edit, Grep, Glob)
- Simplify workflow (remove user Q&A, Harry handles)
- Preserve XML structure intelligence
- Add argument handling patterns
- Test command.md creation
- Validation: Creates valid command.md with pure XML body

**Integration Tasks** 
- Test all creator agents in isolation with sample inputs
- Verify output formats match Harry's expectations
- Test error handling (invalid inputs, missing files)
- Document each creator's input/output contract

**Deliverables:**
- `.claude/agents/create-meta-prompts.md`
- `.claude/agents/create-subagents.md`
- `.claude/agents/create-agent-skills.md`
- `.claude/agents/create-hooks.md`
- `.claude/agents/create-commands.md`
- Creator agent test suite
- Input/output specification document

**Success Criteria:**
- ✓ Each creator agent tested independently
- ✓ Receives requirements, creates component
- ✓ Returns structured metadata
- ✓ No errors with valid inputs
- ✓ Graceful error messages for invalid inputs

---

#### Phase 3: Auditors & Healing 

**Goal:** Audit/healing loop operational with 4-D integration

**Tasks:**

**3.1: Integrate existing auditors** 
- Copy from `taches-cc-resources-main/agents/`
  - `skill-auditor.md` → `.claude/agents/`
  - `subagent-auditor.md` → `.claude/agents/`
  - `slash-command-auditor.md` → `.claude/agents/`
- Update agent-registry.json (mark as internal: true)
- Test each auditor independently with sample components
- Verify 100-point scoring works
- Validation: Auditors return structured reports with scores

**3.2: Implement healing loop in Harry** 
- Add audit invocation after creation (Step 5 of workflow)
- Parse audit results (score, critical issues, file:line references)
- Extract refinement instructions from audit findings
- Re-delegate to creator agent with feedback
- Test iteration logic (max 3 attempts)
- Validation: Healing continues until score >= 85 or max iterations

**3.3: Add user decision gates** 
- Implement AskUserQuestion for continued healing
- Options: "Continue healing", "Accept current state", "Cancel creation"
- Add "Show detailed issues" option
- Test max iteration handling (3 attempts)
- Validation: User can abort healing gracefully, sees detailed feedback

**3.4: Phase 3 integration testing** 
- Create component → Audit runs automatically
- Failing audit (mock score < 85) → Healing initiates
- Iteration continues → Reaches passing score
- Max iterations → User decision presented
- Test all decision paths

**Deliverables:**
- `.claude/agents/skill-auditor.md` (integrated)
- `.claude/agents/subagent-auditor.md` (integrated)
- `.claude/agents/slash-command-auditor.md` (integrated)
- Updated Harry with healing loop implementation
- Updated agent-registry.json with auditor entries
- Audit/healing test suite

**Success Criteria:**
- ✓ Component creation → Audit runs automatically
- ✓ Score < 85 → Healing initiates without user intervention
- ✓ Healing provides specific, actionable feedback
- ✓ Re-audit shows improvement
- ✓ Max iterations → User decision presented
- ✓ User can continue, accept, or cancel

---

#### Phase 4: Registry Management 

**Goal:** Automatic registry updates with validation

**Tasks:**

**4.1: Implement extraction logic** 
- Add trigger extraction to Harry (Step 7 of workflow)
- **For agents:**
  - Parse description → keywords
  - Generate intentPatterns from keywords
  - Classify operations from workflow
  - Assess complexity (simple/medium/complex)
  - Determine autonomy (high/medium/low)
- **For skills:**
  - Extract promptTriggers from description
  - Identify fileTriggers from domain
  - Set type (domain/guardrail)
  - Set enforcement (suggest/block/warn)
  - Set priority (critical/high/medium/low)
- Test extraction with sample components
- Validation: Reasonable triggers generated automatically

**4.2: Implement JSON merge operations** 
- Read existing registries (agent-registry.json, skill-rules.json)
- Merge new entries (preserve existing)
- Validate with jq (syntax check)
- Backup before update (.json.bak)
- Write updated registry
- Test conflict handling (duplicate names)
- Validation: Valid JSON after merge, no corruption

**4.3: Integration testing** 
- Create agent → agent-registry.json updated
- Create skill → skill-rules.json updated
- Create hook → hooks.json updated
- Verify no syntax errors
- Test registry validation failures
- Test component discovery after creation
- Validation: New components discoverable by maestro-agent-suggester.js

**Deliverables:**
- Updated Harry with registry management (Step 7)
- Extraction logic implementation
- JSON merge utilities
- Registry operation test suite
- Trigger pattern documentation

**Success Criteria:**
- ✓ Component created → Registry auto-updated
- ✓ Maestro finds new agent on next request
- ✓ Subagents discover new skills automatically
- ✓ No JSON syntax errors
- ✓ Backup created before updates
- ✓ Validation failures handled gracefully

---

#### Phase 5: Integration Testing 

**Goal:** End-to-end workflows validated, edge cases handled

**Tasks:**

**5.1: Use Case 1 testing - Agent Not Found** 
- User requests domain-specific work (e.g., "Optimize React components")
- No agent exists in registry
- maestro-agent-suggester.js suggests Harry
- Harry activates automatically
- create-meta-prompts refines requirements
- create-subagents generates agent.md
- create-agent-skills generates matching skill
- subagent-auditor evaluates agent
- skill-auditor evaluates skill
- Audit passes → Registries updated
- New agent spawned to handle original request
- Validation: Complete flow from request to execution

**5.2: Use Case 2 testing - Skill Needed** 
- Write agent handling request
- Agent reports missing GraphQL validation skill
- Agent delegates back to Maestro
- Maestro → Harry for skill creation
- create-meta-prompts refines skill scope
- create-agent-skills generates GraphQL skill
- skill-auditor evaluates
- Audit passes → skill-rules.json updated
- Write agent re-runs with new skill
- Validation: Skill augmentation works seamlessly

**5.3: Use Case 3 testing - Manual Maintenance** 
- User runs /harry command
- Interactive menu appears
- Test each menu option:
  1. Create new agent
  2. Update existing agent
  3. Create new skill
  4. Update existing skill
  5. Create hook
  6. Create command
  7. Audit component
  8. Heal component
- All workflows complete successfully
- Validation: All menu options functional

**5.4: Edge case testing** 
- **Invalid JSON handling:**
  - Registry update with syntax error
  - Backup restoration
  - Error reporting to user
- **Audit failures:**
  - Component scores < 50
  - Max healing iterations reached
  - User cancels healing
- **Component conflicts:**
  - Duplicate agent names
  - Conflicting skill triggers
  - Overwriting existing components
- **Registry corruption recovery:**
  - Malformed JSON
  - Missing required fields
  - Rollback to backup
- Validation: Graceful error handling for all edge cases

**5.5: Performance testing** 
- Measure token usage per workflow
- Harry: ~300 tokens (orchestration)
- Creator agents: 500-2000 tokens (isolated)
- Auditor agents: 400-800 tokens (isolated)
- Total: Should stay under 5000 tokens per creation
- Validation: Context management effective

**Deliverables:**
- Complete end-to-end test suite
- Edge case test results
- Performance benchmarks
- Error handling documentation
- Troubleshooting guide (draft)

**Success Criteria:**
- ✓ All 3 use cases work end-to-end
- ✓ Edge cases handled gracefully
- ✓ Error messages clear and actionable
- ✓ Performance within acceptable limits
- ✓ Context management effective
- ✓ User can recover from any failure state

---

#### Phase 6: Documentation & Polish 

**Goal:** Production-ready system with complete documentation

**Tasks:**

**6.1: User documentation** 
- `docs/harry-user-guide.md`:
  - How to use /harry command
  - Understanding the interactive menu
  - Interpreting audit scores
  - Working with healing loops
  - When Harry auto-activates
  - Common workflows and examples
- Quick start guide
- FAQ section

**6.2: Developer documentation** 
- `docs/harry-developer-guide.md`:
  - Harry architecture overview
  - How to extend Harry
  - Adding new creator agents
  - Adding new auditors
  - Registry pattern guide
  - Trigger extraction logic
  - Troubleshooting guide

**6.3: Example library** 
- `docs/harry-examples.md`:
  - Example 1: Creating a React optimization agent
  - Example 2: Adding GraphQL skill to Write agent
  - Example 3: Creating git workflow command
  - Example 4: Auditing existing skill
  - Example 5: Healing failing component
- Complete workflows with screenshots/outputs

**6.4: Polish & optimization** 
- Improve error messages (clarity, actionability)
- Add progress indicators (Step X/9: ...)
- Optimize auditor prompts (reduce token usage)
- Refine healing feedback (more specific)
- Test user experience flow
- Final bug fixes

**Deliverables:**
- `docs/harry-user-guide.md`
- `docs/harry-developer-guide.md`
- `docs/harry-examples.md`
- `docs/harry-troubleshooting.md`
- Updated README.md with Harry section
- Release notes

**Success Criteria:**
- ✓ Complete user documentation
- ✓ Complete developer documentation
- ✓ 5+ working examples
- ✓ Troubleshooting guide covers common issues
- ✓ Error messages improved
- ✓ User experience polished
- ✓ Ready for production use

---

## HARRY ORCHESTRATOR SPECIFICATIONS

### File Location
`.claude/agents/harry.md`

### YAML Frontmatter

```yaml
---
name: harry
description: Meta-orchestrator for creating, updating, auditing, and healing Maestro framework components (agents, skills, hooks, commands). Use when user needs to build new framework components, modify existing components, or when requested agents/skills don't exist. MUST BE USED when user invokes /harry command or when Maestro cannot find matching agent for domain-specific request.
tools: Task, AskUserQuestion, Read, Write, Edit, Grep, Glob
model: sonnet
---
```

### Core Philosophy

**Maestro's Philosophy Applied to Harry:**

1. **Harry Never Creates Directly** - Delegates to creator agents
2. **Audit Every Output** - All created components pass through auditors
3. **Iterate Until Excellent** - Healing loops continue until audit passes
4. **Interactive Guidance** - AskUserQuestion for all decision points
5. **Registry Management** - Update agent-registry.json and skill-rules.json
6. **Framework Agnostic** - No bias toward React/Vue/Express/etc.

### Critical Constraints

- NEVER write agent files, skill files, hooks, or commands directly
- ALWAYS delegate creation to specialized creator agents
- MUST run auditor agents on all created components
- MUST implement healing loop if audit score < 85/100
- NEVER skip registry updates after successful creation
- ALWAYS use AskUserQuestion for interactive menus (not plain text)
- MUST preserve Maestro's delegation-only philosophy in all operations

### 9-Step Workflow

**Step 1: Activation Analysis**
- IF user invoked `/harry`: Present interactive menu (go to Step 2)
- IF Maestro delegated due to missing agent: Set mode "create_agent" (go to Step 3)
- IF existing agent needs skill: Set mode "create_skill" (go to Step 3)

**Step 2: Interactive Menu**
- Use AskUserQuestion to present 8 options:
  1. Create new agent
  2. Update existing agent
  3. Create new skill
  4. Update existing skill
  5. Create hook
  6. Create command
  7. Audit component
  8. Heal component
- User selects → Set mode → Continue to Step 3

**Step 3: Requirements Gathering**
- Delegate to create-meta-prompts agent via Task tool
- Pass user's original request or menu selection
- Agent refines through adaptive questioning
- Returns structured requirements document
- Store for next step

**Step 4: Creation Delegation**
- Route based on mode:
  - create_agent → create-subagents agent
  - create_skill → create-agent-skills agent
  - create_hook → create-hooks agent
  - create_command → create-commands agent
- Pass refined requirements + target location + existing component (if update)
- Creator returns: created files, locations, summary

**Step 5: Mandatory Audit**
- Route based on component type:
  - Agent → subagent-auditor
  - Skill → skill-auditor
  - Command → command-auditor
  - Hook → Skip (simpler validation)
- Auditor returns: Score (X/100), critical issues, file:line fixes
- **Decision Gate:**
  - Score >= 85 → Continue to Step 7 (success)
  - Score < 85 → Continue to Step 6 (healing)

**Step 6: Healing Loop**
- Present audit results to user: "Component scored {score}/100. Below threshold (85). Initiating healing..."
- Re-delegate to original creator agent
- Pass audit findings as refinement instructions
- Specify exact issues to fix with file:line references
- Creator makes fixes → Re-run auditor (back to Step 5)
- **Loop termination:**
  - Max 3 healing iterations
  - If still failing after 3: Ask user "Continue healing? / Accept as-is? / Cancel?"

**Step 7: Registry Integration**
- **For new agents:** Update `.claude/agents/agent-registry.json`
  - Add entry with triggers, keywords, intentPatterns
  - Derive from agent description and domain
- **For new skills:** Update `.claude/skills/skill-rules.json`
  - Add entry with promptTriggers, fileTriggers
  - Set priority, enforcement, type
- **For hooks:** Update `.claude/hooks.json`
- Use Write tool to update JSON files
- Validate JSON syntax with jq after update

**Step 8: Activation Test (Optional)**
- Ask user via AskUserQuestion: "Component created successfully. Test it now?"
- Options:
  1. Test now - Spawn agent/activate skill with sample task
  2. Show usage - Display how to invoke/trigger
  3. Done - Complete workflow
- If testing, run sample workflow

**Step 9: Completion**
- Present summary:
  ```
  ✓ Component: {name}
  ✓ Type: {agent/skill/hook/command}
  ✓ Audit Score: {score}/100
  ✓ Location: {file path}
  ✓ Registry: Updated

  The component is ready to use!
  ```
- Offer next actions:
  1. Create another component
  2. Test this component
  3. View component details
  4. Done

### Activation Triggers

Harry activates in three scenarios:

**1. Automatic (via maestro-agent-suggester.js):**
- User requests domain-specific work with no matching agent
- Maestro receives suggestion: "Consider using Harry to create needed agent"

**2. Explicit Command:**
- User runs `/harry` command
- Harry presents interactive menu

**3. Agent Escalation:**
- Existing agent reports missing skill
- Agent delegates back to Maestro
- Maestro → Harry for skill creation

### Output Format

Harry always reports:

1. Current step in workflow (Step X/9: ...)
2. Which agent is working (when delegating)
3. Audit scores (when evaluating)
4. Registry changes (when integrating)
5. Next action options (at decision points)

**Transparency protocol:**
- User sees which creator agent is working
- User sees audit results before healing
- User confirms registry updates
- User approves component activation

---

## CREATOR AGENT SPECIFICATIONS

### 1. create-meta-prompts Agent

**Purpose:** Requirement refinement specialist for meta-prompting workflows

**Source:** `taches-cc-resources-main/skills/create-meta-prompts/SKILL.md`

**Conversion Notes:**
- Preserves adaptive intake workflow from original skill
- Adds explicit "return to Harry" behavior
- Removes execution steps (belong to other creators)
- Maintains AskUserQuestion patterns

**Key Specifications:**

```yaml
---
name: create-meta-prompts
description: Requirement refinement specialist for meta-prompting workflows. Use when building prompts for Claude-to-Claude pipelines, multi-stage workflows, or when user needs help clarifying requirements for agent/skill creation. Refines rough ideas into structured requirements through adaptive questioning.
tools: Read, Write, AskUserQuestion, Grep, Glob
model: sonnet
---
```

**Constraints:**
- NEVER create the final component (that's the next agent's job)
- ALWAYS use AskUserQuestion for gathering requirements
- MUST infer obvious details (don't ask answerable questions)
- DO NOT proceed to creation (return refined requirements only)
- NEVER make technology assumptions (ask if relevant)

**Workflow:**
1. Analyze initial request (extract explicit, identify inferable, detect ambiguities)
2. Adaptive questioning (2-4 questions via AskUserQuestion)
   - Scope: What specific operations?
   - Complexity: What edge cases matter?
   - Output: What should user receive?
   - Boundaries: What's out of scope?
3. Present decision gate: "Ready to proceed with building?"
4. Generate requirements document
5. Return to Harry with structured requirements

**Output Format (to Harry):**

```markdown
## Component Type
[Agent | Skill | Hook | Command]

## Domain
[React | Testing | API | General | etc.]

## Purpose
[Clear statement of what this component does]

## Specific Functionality
1. [Operation 1]
2. [Operation 2]

## Edge Cases
- [Scenario 1]
- [Scenario 2]

## Constraints
- [Boundary 1]
- [Boundary 2]

## Success Criteria
- [Measurable outcome 1]
- [Measurable outcome 2]

## Recommended Creator
[create-subagents | create-agent-skills | etc.]
```

---

### 2. create-subagents Agent

**Purpose:** Agent file generator for Maestro framework

**Source:** `taches-cc-resources-main/skills/create-subagents/SKILL.md`

**Conversion Notes:**
- Incorporates all XML structure guidance from original skill
- Adds Maestro-specific patterns (delegation, 4-D compliance)
- Returns structured JSON for Harry's registry integration
- Removes interactive elements (Harry handles those)

**Key Specifications:**

```yaml
---
name: create-subagents
description: Agent file generator for Maestro framework. Use when creating new Claude Code subagent configuration files following Maestro patterns (pure delegation, XML structure, tool restrictions, model selection). Creates complete agent.md files with role definition, workflow, constraints, and Maestro compliance.
tools: Read, Write, Edit, Grep, Glob
model: sonnet
---
```

**Constraints:**
- MUST follow Maestro agent patterns (pure XML, no markdown headings in body)
- MUST include agent-registry.json entry recommendation
- NEVER create generic agents ("helpful assistant")
- ALWAYS include role, workflow, constraints, output_format sections
- MUST use appropriate tool restrictions (least privilege)
- NEVER assume user's technology stack (framework agnostic)

**Workflow:**
1. Read refined requirements (from create-meta-prompts)
2. Analyze domain and complexity (simple/medium/complex)
3. Generate YAML frontmatter (name, description, tools, model)
4. Generate pure XML body (`<role>`, `<constraints>`, `<workflow>`, `<output_format>`, `<success_criteria>`)
5. Generate agent-registry.json entry (keywords, intentPatterns, operations)
6. Write agent file to `.claude/agents/{agent-name}.md`
7. Validate XML structure (no markdown headings in body)
8. Return to Harry with metadata

**XML Structure Requirements:**

Required tags (all agents):
- `<role>`
- `<constraints>`
- `<workflow>`
- `<output_format>`
- `<success_criteria>`

Conditional tags:
- `<context>` - When loading external data
- `<validation>` - When verifying outputs
- `<examples>` - For complex behaviors
- `<error_handling>` - For failure scenarios
- `<focus_areas>` - For specialized domains

**Tool Selection Guidance:**
- Read-only agents: Read, Grep, Glob (no Write/Edit)
- Analysis agents: Read, Grep, Glob, Bash (read-only commands)
- Creation agents: Read, Write, Edit, Grep, Glob
- Integration agents: Read, Write, Edit, Bash, Grep, Glob
- Least privilege principle: Only grant absolutely necessary tools

**Output Format (to Harry):**

```json
{
  "agent_file": ".claude/agents/agent-name.md",
  "agent_name": "agent-name",
  "registry_entry": {
    "purpose": "...",
    "triggers": {
      "keywords": ["..."],
      "intentPatterns": ["..."],
      "operations": ["..."]
    },
    "complexity": "simple|medium|complex",
    "autonomy": "high|medium|low"
  },
  "summary": "Created agent for {purpose} with {tool count} tools"
}
```

---

### 3. create-agent-skills Agent

**Purpose:** Skill file generator for Maestro framework

**Source:** `taches-cc-resources-main/skills/create-agent-skills/SKILL.md`

**Conversion Notes:**
- Preserves adaptive intake and research trigger from original skill
- Removes user interaction (Harry handles menu)
- Adds explicit reference file creation
- Returns structured data for Harry's registry integration
- Maintains all XML structure and progressive disclosure patterns

**Key Specifications:**

```yaml
---
name: create-agent-skills
description: Skill file generator for Maestro framework. Use when creating new SKILL.md files with progressive disclosure, pure XML structure, and framework-agnostic guidance. Creates complete skill directories with main SKILL.md and reference files following 500-line rule.
tools: Read, Write, Edit, Grep, Glob, WebSearch, WebFetch
model: sonnet
---
```

**Constraints:**
- MUST follow 500-line rule (SKILL.md < 500 lines)
- MUST use pure XML structure (no markdown headings in body)
- MUST include skill-rules.json entry recommendation
- NEVER make framework assumptions (no React/Vue/Express bias)
- ALWAYS create reference files for deep content
- MUST include required tags: objective, quick_start, success_criteria

**Workflow:**
1. Read refined requirements (from create-meta-prompts)
2. Detect external APIs/services
   - If API detected: Offer research option
   - Use WebSearch/WebFetch for 2024-2025 docs
   - Store findings for code examples
3. Determine skill complexity (simple/medium/complex)
4. Generate YAML frontmatter (name, description)
5. Create SKILL.md with pure XML (required + conditional tags)
6. Create reference files if needed (`references/methodology.md`, `references/patterns.md`, etc.)
7. Generate skill-rules.json entry (promptTriggers, fileTriggers, type, priority, enforcement)
8. Validate structure (SKILL.md < 500 lines, all tags present, no markdown headings)
9. Create slash command wrapper (optional)
10. Return to Harry with metadata

**XML Structure Intelligence:**

Simple skills:
- Required tags only
- No reference files needed
- Example: Text extraction, format conversion

Medium skills:
- Required + workflow/examples
- 1-2 reference files
- Example: API integration, multi-step workflows

Complex skills:
- Required + security/validation/advanced
- 3+ reference files
- Example: Payment processing, auth systems

**Progressive Disclosure Pattern:**

SKILL.md (< 500 lines):
- Overview and objectives
- Quick start for 80% use cases
- Links to reference files for deep dives

references/*.md (each < 500 lines):
- methodology.md: Detailed approach
- patterns.md: Code examples, recipes
- troubleshooting.md: Edge cases, debugging

**Output Format (to Harry):**

```json
{
  "skill_directory": ".claude/skills/skill-name/",
  "files_created": [
    ".claude/skills/skill-name/SKILL.md",
    ".claude/skills/skill-name/references/methodology.md",
    ".claude/skills/skill-name/references/patterns.md"
  ],
  "line_counts": {
    "SKILL.md": 450,
    "references/methodology.md": 380,
    "references/patterns.md": 290
  },
  "registry_entry": {
    "type": "domain",
    "enforcement": "suggest",
    "priority": "medium",
    "triggers": {
      "promptTriggers": ["..."],
      "fileTriggers": ["..."]
    }
  },
  "summary": "Created skill for {domain} with {file count} files"
}
```

---

### 4. create-hooks Agent

**Purpose:** Hook configuration generator for Claude Code automation

**Source:** `taches-cc-resources-main/skills/create-hooks/SKILL.md`

**Conversion Notes:**
- Maintains all safety patterns from original skill
- Removes interactive menu (Harry provides context)
- Adds explicit script creation workflow
- Returns testing instructions to Harry
- Preserves all hook type examples and patterns

**Key Specifications:**

```yaml
---
name: create-hooks
description: Hook configuration generator for Claude Code automation. Use when creating hooks for event-driven automation (PreToolUse, PostToolUse, Stop, UserPromptSubmit, etc.). Creates hook entries in hooks.json with matchers, commands, and validation logic.
tools: Read, Write, Edit, Bash, Grep, Glob
model: sonnet
---
```

**Constraints:**
- MUST validate hooks.json syntax with jq
- NEVER create hooks with infinite loop potential
- ALWAYS include timeout configuration
- MUST verify executable permissions for command hooks
- NEVER skip the stop_hook_active check for Stop hooks

**Workflow:**
1. Read refined requirements (from create-meta-prompts)
2. Determine hook type (PreToolUse, PostToolUse, UserPromptSubmit, Stop, SessionStart, etc.)
3. Choose hook implementation (command hook: shell script, prompt hook: LLM evaluation)
4. Configure matcher (exact match, multiple tools, MCP tools, no matcher)
5. Generate hook configuration JSON
6. Create script file if command hook (write, chmod +x, test)
7. Update hooks.json (read, merge, validate with jq, write)
8. Test hook (optional, provide instructions)
9. Return to Harry with metadata

**Safety Checklist:**
- [ ] Infinite loop prevention (stop_hook_active check for Stop hooks)
- [ ] Timeout configured (reasonable limit)
- [ ] Permissions validated (chmod +x for scripts)
- [ ] Path safety (absolute paths with $CLAUDE_PROJECT_DIR)
- [ ] JSON validation (jq . hooks.json)
- [ ] Selective blocking (conservative with blocking hooks)

**Output Format (to Harry):**

```json
{
  "hook_event": "PreToolUse",
  "matcher": "Bash",
  "hook_type": "command",
  "script_file": ".claude/hooks/validate-bash.sh",
  "hooks_json_updated": true,
  "testing_instructions": "Run: claude --debug\nThen use Bash tool to verify hook fires",
  "summary": "Created PreToolUse hook for Bash validation"
}
```

---

### 5. create-commands Agent

**Purpose:** Slash command generator for Claude Code

**Source:** `taches-cc-resources-main/skills/create-slash-commands/SKILL.md`

**Conversion Notes:**
- Preserves all XML patterns from original skill
- Removes interactive menus (Harry handles)
- Simplifies workflow (no user Q&A)
- Returns structured metadata to Harry
- Maintains argument intelligence logic

**Key Specifications:**

```yaml
---
name: create-commands
description: Slash command generator for Claude Code. Use when creating custom slash commands with XML structure, dynamic context loading, and argument handling. Creates command.md files following Claude Code patterns.
tools: Read, Write, Edit, Grep, Glob
model: sonnet
---
```

**Constraints:**
- MUST use pure XML structure in command body
- MUST include required tags: objective, process, success_criteria
- NEVER create commands that bypass Maestro delegation
- ALWAYS add argument-hint if command uses $ARGUMENTS
- MUST validate allowed-tools restrictions

**Workflow:**
1. Read refined requirements (from create-meta-prompts)
2. Analyze command purpose (simple operation, complex workflow, parameterized, state-dependent)
3. Determine argument needs (self-contained, user-specified data, structured input)
4. Generate YAML frontmatter (description, argument-hint if needed, allowed-tools if restrictions)
5. Generate XML body (required tags: objective, process, success_criteria; conditional: context, verification, testing, output)
6. Integrate dynamic elements (context commands: ! `git status`, file references: @ package.json, arguments: $ARGUMENTS or $1, $2)
7. Apply intelligence rules (simple vs complex commands)
8. Write command file to `.claude/commands/{command-name}.md`
9. Validate XML structure
10. Return to Harry with metadata

**XML Structure Patterns:**

Simple command:
```xml
<objective>Review code for security vulnerabilities.</objective>

<process>
1. Scan for common vulnerabilities
2. Identify specific issues with line numbers
3. Suggest remediation
</process>

<success_criteria>
- All vulnerability types checked
- Issues identified with locations
- Actionable fixes provided
</success_criteria>
```

Complex command with context:
```xml
<objective>Create git commit following repository conventions.</objective>

<context>
- Current status: ! `git status`
- Changes: ! `git diff HEAD`
- Recent commits: ! `git log --oneline -5`
</context>

<process>
1. Review staged and unstaged changes
2. Stage relevant files
3. Write commit message following recent style
4. Create commit
</process>

<success_criteria>
- All relevant changes staged
- Commit message follows conventions
- Commit created successfully
</success_criteria>
```

**Output Format (to Harry):**

```json
{
  "command_file": ".claude/commands/command-name.md",
  "command_name": "command-name",
  "usage": "/command-name [args]",
  "has_arguments": true,
  "tool_restrictions": ["Read", "Grep"],
  "summary": "Created command for {purpose}"
}
```

---

## AUDIT & HEALING SYSTEM

### Audit Flow Integration

```
Component Created (by creator agent)
         ↓
    Audit Agent Evaluation
         ↓
    Score: X/100
         ↓
  [Decision Gate]
         ↓
    ┌─────────┴─────────┐
    ↓                   ↓
Score >= 85        Score < 85
    ↓                   ↓
Accept &           Healing Loop
Integrate              ↓
    ↓              Extract Issues
Registry           from Audit
Update                 ↓
    ↓              Re-delegate to
Complete           Creator Agent
                       ↓
                  Pass Audit
                   Feedback
                       ↓
                  Creator Fixes
                       ↓
              Re-run Audit Agent
                       ↓
                  [Loop until pass
                   or max attempts]
```

### Auditor Agent Integration

**Existing Auditors (from taches-cc-resources-main):**

**1. skill-auditor.md** - Ready to use
- 100-point evaluation system
- Categories: YAML, Structure, Content, Anti-patterns
- File:line specific findings
- Migration guidance for legacy skills

**2. subagent-auditor.md** - Ready to use
- 100-point evaluation system
- Categories: Must-have, Should-have, Nice-to-have
- XML structure validation
- Tool access evaluation

**3. slash-command-auditor.md** - Ready to use
- 100-point evaluation system
- XML structure validation
- Argument handling evaluation
- Dynamic context assessment

### Healing Loop Protocol

**Step 1: Receive Audit**
- Auditor returns:
  - Overall score (X/100)
  - Category breakdown
  - Critical issues list (with file:line)
  - Optimization opportunities
  - Quick fixes

**Step 2: Present to User**
```
Component: {name}
Score: {score}/100

Critical Issues ({count}):
1. {issue} at {file}:{line} - {description}
2. ...

Initiating healing loop...
```

**Step 3: Extract Refinements**
- Parse audit findings into refinement instructions
- Group by file location
- Prioritize critical issues
- Create specific fix directives
- Include correct patterns from audit

**Step 4: Re-delegate**
- Spawn original creator agent again
- Pass original requirements
- Add audit findings as constraints
- Include file:line references
- Specify exact fixes needed
- Creator makes targeted fixes

**Step 5: Re-audit**
- Run same auditor agent again
- Fresh evaluation of updated component
- New score
- Remaining issues (if any)

**Step 6: Iteration Check**
- IF score >= 85: Exit loop, proceed to integration
- IF score < 85 AND iteration < 3: Back to Step 2 (continue healing)
- IF score < 85 AND iteration == 3: Ask user via AskUserQuestion:
  - Options: Continue healing / Accept current state / Cancel creation

### 4-D Methodology Integration Points

**Delegation (D1):**
- Harry delegates to creator agents (never creates directly)
- Creator agents are specialists (subagents, skills, hooks, commands)
- Clear separation of concerns

**Description (D2):**
- create-meta-prompts refines requirements (Product, Process, Performance)
- Creator agents receive comprehensive direction
- Audit criteria clearly specified

**Discernment (D3):**
- **Product Discernment:** Auditor evaluates component correctness
- **Process Discernment:** Auditor evaluates methodology used
- **Performance Discernment:** Auditor evaluates excellence (>= 85 threshold)

**Diligence (D4):**
- Healing loop iterates until passing
- No shortcuts (mandatory audits)
- Evidence-based decisions (file:line references)

### Quality Thresholds

**Audit Scores:**
- 85-100: Excellent (accept immediately)
- 70-84: Good (healing recommended)
- 50-69: Needs work (healing required)
- < 50: Poor (restart recommended)

**Healing Limits:**
- Default max iterations: 3
- User can extend or abort
- Each iteration must show improvement

---

## REGISTRY MANAGEMENT

### agent-registry.json Structure

```json
{
  "version": "1.0",
  "agents": {
    "existing-agent": { "...": "..." },

    "new-agent-name": {
      "purpose": "Extracted from agent description",
      "triggers": {
        "keywords": [
          "derived-from-domain",
          "extracted-from-description",
          "related-operations"
        ],
        "intentPatterns": [
          "pattern-matching-domain.*",
          "user-request-pattern.*"
        ],
        "operations": [
          "primary-operation",
          "secondary-operation"
        ]
      },
      "complexity": "simple|medium|complex",
      "autonomy": "high|medium|low"
    }
  }
}
```

### Harry's Extraction Logic for Agents

**1. Keywords:** Parse agent description and domain
- Domain: "React" → ["React", "component", "JSX"]
- Purpose: "Performance optimization" → ["optimize", "performance"]

**2. IntentPatterns:** Generate from keywords
- Keywords: ["optimize", "performance"]
- Patterns: ["optimize.*performance", "improve.*speed"]

**3. Operations:** Classify from agent workflow
- Agent modifies files → ["write", "edit", "modify"]
- Agent analyzes code → ["analyze", "evaluate", "review"]

**4. Complexity:** Assess from workflow steps
- Simple: Single focused task (< 5 steps)
- Medium: Multi-step process (5-10 steps)
- Complex: Research + generation + validation (> 10 steps)

**5. Autonomy:** Determine from constraints
- High: Works independently, clear success criteria
- Medium: Needs some guidance, moderate decision-making
- Low: Requires frequent check-ins, complex decisions

### skill-rules.json Structure

```json
{
  "version": "1.0",
  "skills": {
    "existing-skill": { "...": "..." },

    "new-skill-name": {
      "type": "domain",
      "enforcement": "suggest",
      "priority": "medium",
      "triggers": {
        "promptTriggers": [
          "keyword-from-description",
          "domain-term",
          "operation-name"
        ],
        "fileTriggers": [
          "**/*.{relevant-extension}",
          "path/pattern/*.{type}"
        ]
      },
      "skipConditions": {
        "hasSkill": ["conflicting-skill-name"]
      }
    }
  }
}
```

### Harry's Extraction Logic for Skills

**1. Type Classification:**
- Domain skill: Provides domain-specific guidance (React, GraphQL, etc.)
- Guardrail skill: Enforces critical practices (security, testing)

**2. Enforcement Level:**
- suggest: Recommend when relevant (default for domain skills)
- warn: Alert but allow bypass (important patterns)
- block: Prevent action (critical security/compliance)

**3. Priority:**
- critical: Security, data integrity (guardrails)
- high: Best practices, major patterns (important domains)
- medium: Optimization, convenience (standard domains)
- low: Nice-to-have, edge cases

**4. PromptTriggers:**
- Extract from skill description
- Parse domain keywords
- Identify operation verbs

**5. FileTriggers:**
- Map domain to file extensions
- React → ["**/*.jsx", "**/*.tsx"]
- GraphQL → ["**/*.graphql", "**/*.gql"]
- Python → ["**/*.py"]

### Registry Update Workflow

**Step 1: Prepare Entry**
- Creator agent returns component metadata
- Harry extracts registry data using logic above

**Step 2: Read Existing**
- Read current registry (agent-registry.json or skill-rules.json)
- Parse JSON, store existing entries

**Step 3: Merge Entry**
- Add new entry to registry
- Preserve existing entries

**Step 4: Validate JSON**
- Validate merged JSON with jq
- If invalid: Report error, abort, ask user to fix manually

**Step 5: Write Back**
- Backup original (.json.bak)
- Write merged JSON
- Verify file exists

**Step 6: Confirm**
- Report to user:
  ```
  ✓ Registry Updated
  File: {registry-path}
  Entry: {component-name}
  Triggers: {trigger-count} keywords
  ```

---

## USE CASES & WORKFLOWS

### Use Case 1: Agent Not Found - Auto-Creation

**Scenario:** User requests domain-specific work, no matching agent exists

**Flow:**
```
User: "Optimize React components for performance"
    ↓
Maestro: No React agent in registry
    ↓
maestro-agent-suggester.js: Suggests Harry (fallback)
    ↓
Harry activates: "Domain-specific agent needed"
    ↓
Harry → create-meta-prompts agent (refine requirements)
    ↓
Harry → create-subagents agent (build agent.md)
    ↓
Harry → create-agent-skills agent (build matching skill)
    ↓
Harry → create-hooks agent (optional: custom hooks)
    ↓
Harry → skill-auditor agent (validate skill)
    ↓
Harry → subagent-auditor agent (validate agent)
    ↓
Audit passes → Harry updates registries
    ↓
Harry spawns new React agent to handle original request
```

**Expected Result:**
- New `react-optimizer` agent created
- New `react-performance` skill created
- Both pass audit (>= 85/100)
- Registries updated automatically
- Original request handled by new agent

---

### Use Case 2: Skill Needed - Augmentation

**Scenario:** Existing agent lacks skill for specific requirement

**Flow:**
```
User: "Write agent, add GraphQL schema validation"
    ↓
Maestro delegates to Write agent
    ↓
Write agent: No GraphQL validation skill available
    ↓
Write agent reports back: "Need GraphQL skill"
    ↓
Maestro → Harry: "Write agent needs GraphQL skill"
    ↓
Harry → create-meta-prompts (refine skill scope)
    ↓
Harry → create-agent-skills (build GraphQL skill)
    ↓
Harry → skill-auditor (validate)
    ↓
Audit passes → Harry updates skill-rules.json
    ↓
Harry re-launches Write agent with new skill
```

**Expected Result:**
- New `graphql-validation` skill created
- Passes audit (>= 85/100)
- skill-rules.json updated
- Write agent discovers and uses new skill
- Original task completed successfully

---

### Use Case 3: Manual Maintenance - /harry Command

**Scenario:** User wants to maintain framework components

**Flow:**
```
User: /harry
    ↓
Harry: Interactive menu via AskUserQuestion
    ↓
Options:
  1. Create new agent
  2. Update existing agent
  3. Create new skill
  4. Update existing skill
  5. Create hook
  6. Create command
  7. Audit component
  8. Heal failing audit
    ↓
User selects option (e.g., "Create new agent")
    ↓
Harry orchestrates appropriate creator/auditor workflow
    ↓
Always ends with audit/healing loop
```

**Example: Create New Agent**
```
User selects: "Create new agent"
    ↓
Harry → create-meta-prompts (gather requirements)
    ↓
create-meta-prompts asks: "What domain?" "What operations?" "What constraints?"
    ↓
User provides: "Database optimization", "Query analysis", "PostgreSQL only"
    ↓
create-meta-prompts returns requirements document
    ↓
Harry → create-subagents (build agent.md)
    ↓
Harry → create-agent-skills (build matching skill)
    ↓
Harry → subagent-auditor (evaluate agent)
    ↓
Score: 88/100 (pass)
    ↓
Harry → skill-auditor (evaluate skill)
    ↓
Score: 82/100 (fail - below 85)
    ↓
Harry initiates healing loop
    ↓
Re-delegate to create-agent-skills with audit feedback
    ↓
Re-audit: Score 87/100 (pass)
    ↓
Harry updates registries
    ↓
Completion summary shown to user
```

**Expected Result:**
- Component created through guided workflow
- User makes all decisions via menus
- Quality enforced through audits
- Healing applied automatically
- Component ready for use

---

## TESTING STRATEGY

### Phase 1 Testing: Foundation

**Test Suite:**
- /harry command activation
- Menu display (8 options)
- Auto-activation when no agent matches
- Constraint enforcement (no direct creation)
- Delegation to mock creator agents

**Test Cases:**
1. User runs `/harry` → Menu appears
2. User request "React optimization" with no agent → Harry auto-activates
3. Harry attempts direct creation → Blocked by constraints
4. Harry delegates to creator → Task tool used correctly

**Validation:**
- ✓ All activation scenarios work
- ✓ Menu interactions functional
- ✓ Constraints enforced
- ✓ Delegation mechanism works

---

### Phase 2 Testing: Creator Agents

**Test Suite (per creator agent):**
- Independent execution
- Input validation
- Output format verification
- Error handling
- XML structure validation

**Test Cases (create-subagents example):**
1. Valid requirements → agent.md created
2. Complex requirements → Full XML structure
3. Invalid input → Graceful error
4. Registry entry generation → Valid JSON
5. Tool restrictions → Least privilege applied

**Validation:**
- ✓ Each creator works independently
- ✓ Output matches expected format
- ✓ XML structure valid (no markdown headings)
- ✓ Error handling graceful
- ✓ Registry metadata correct

---

### Phase 3 Testing: Auditors & Healing

**Test Suite:**
- Independent auditor execution
- Score calculation accuracy
- Issue extraction
- Healing loop iteration
- User decision gates

**Test Cases:**
1. Perfect component → Score 100, accept
2. Good component → Score 88, accept
3. Failing component → Score 78, healing initiated
4. Critical issues → Score 45, multiple healing iterations
5. Max iterations → User decision presented

**Validation:**
- ✓ Auditors return valid scores
- ✓ Issues extracted with file:line
- ✓ Healing loop iterates correctly
- ✓ Improvement shown per iteration
- ✓ User can abort/continue/accept

---

### Phase 4 Testing: Registry Management

**Test Suite:**
- Extraction logic accuracy
- JSON merge operations
- Validation (jq)
- Backup/restore
- Conflict handling

**Test Cases:**
1. Create agent → agent-registry.json updated
2. Create skill → skill-rules.json updated
3. Duplicate name → Conflict detected
4. Invalid JSON → Validation fails, rollback
5. Backup exists → Restore from backup

**Validation:**
- ✓ Triggers extracted accurately
- ✓ JSON syntax valid after merge
- ✓ Backups created before updates
- ✓ Conflicts handled gracefully
- ✓ Rollback works correctly

---

### Phase 5 Testing: Integration

**Test Suite:**
- End-to-end workflows (3 use cases)
- Edge cases
- Error recovery
- Performance benchmarks

**Test Cases:**
1. Use Case 1 (agent not found) → Complete flow
2. Use Case 2 (skill needed) → Augmentation flow
3. Use Case 3 (manual maintenance) → All menu options
4. Registry corruption → Recovery
5. Audit failure (max iterations) → User abort
6. Token usage → Under 5000 per creation

**Validation:**
- ✓ All use cases work end-to-end
- ✓ Edge cases handled
- ✓ Errors recoverable
- ✓ Performance acceptable
- ✓ Context management effective

---

### Phase 6 Testing: Documentation

**Test Suite:**
- Documentation accuracy
- Example execution
- Troubleshooting guide effectiveness

**Test Cases:**
1. Follow user guide examples → Work as documented
2. Follow developer guide → Can extend Harry
3. Common issues in troubleshooting → Solutions work
4. Example library workflows → Execute successfully

**Validation:**
- ✓ Documentation accurate
- ✓ Examples executable
- ✓ Troubleshooting effective
- ✓ User feedback positive

---

## SUCCESS CRITERIA

### Harry Works When:

**Functional Requirements:**
- ✓ `/harry` command shows interactive menu
- ✓ User can create new agent through wizard
- ✓ User can create new skill through wizard
- ✓ User can create hooks and commands
- ✓ All created components pass audit (>= 85/100)
- ✓ Registries updated automatically
- ✓ New components discoverable immediately
- ✓ Healing loop iterates until quality achieved
- ✓ User sees transparent progress throughout

**Technical Requirements:**
- ✓ Harry delegates to creators (never creates directly)
- ✓ Pure XML structure in all components
- ✓ JSON registries valid after updates
- ✓ Auditors return 100-point scores
- ✓ Healing loops iterate max 3 times
- ✓ Context management effective (<5000 tokens per creation)
- ✓ No external dependencies (pure Claude Code ecosystem)

**Quality Requirements:**
- ✓ All components follow Maestro patterns
- ✓ Framework remains agnostic (no tech bias)
- ✓ 4-D methodology applied consistently
- ✓ Evidence-based evaluation (file:line references)
- ✓ Graceful error handling
- ✓ User can recover from any failure state

---

### Framework Works When:

**Extensibility:**
- ✓ Users can extend Maestro without writing code
- ✓ Domain-specific agents created on-demand
- ✓ Skills augment existing agents seamlessly
- ✓ Custom hooks and commands integrate smoothly

**Quality Enforcement:**
- ✓ Quality standards enforced automatically
- ✓ Audit failures trigger healing
- ✓ No component integrated without passing audit
- ✓ User sees quality scores and issues

**Self-Sustainability:**
- ✓ Framework can create and maintain itself
- ✓ Harry can create new creator agents
- ✓ Harry can update existing components
- ✓ System evolves without manual intervention

**User Experience:**
- ✓ Transparent progress reporting
- ✓ Interactive decision points
- ✓ Clear error messages
- ✓ Actionable feedback
- ✓ Predictable behavior

---

## REFERENCES

### Design Documents

**Complete Design:**
- `/Users/awesome/dev/devtest/Maestro/docs/designs/HARRY_WIZARD_COMPLETE_DESIGN.md`
- 2,292 lines comprehensive specification
- All agent specs, workflows, patterns, technical details

**Research Summary:**
- `/Users/awesome/dev/devtest/Maestro/docs/designs/HARRY_RESEARCH_SUMMARY.md`
- Research process and findings
- Resource analysis and inventory
- Performance evaluation

**Quick Reference:**
- `/Users/awesome/dev/devtest/Maestro/docs/designs/HARRY_QUICK_REFERENCE.md`
- Fast lookup guide
- Key concepts and commands
- Navigation aid

### Source Resources

**Vision:**
- `/Users/awesome/dev/devtest/Maestro/harry.md`
- Original vision and use cases

**Framework:**
- `/Users/awesome/dev/devtest/Maestro/MAESTRO_BLUEPRINT.md`
- Complete Maestro architecture
- Base component specifications

**Discovery System:**
- `/Users/awesome/dev/devtest/Maestro/AGENT_DISCOVERY.md`
- Agent discovery deep dive

**taches-cc Resources:**
- `/Users/awesome/dev/devtest/Maestro/taches-cc-resources-main/skills/`
  - 5 creator skills (source for conversion)
- `/Users/awesome/dev/devtest/Maestro/taches-cc-resources-main/agents/`
  - 3 auditor agents (ready for integration)
- `/Users/awesome/dev/devtest/Maestro/taches-cc-resources-main/commands/`
  - 14 slash commands (reference material)

### Conversion Checklist

**For each taches-cc skill → creator agent:**

- [ ] Copy SKILL.md content
- [ ] Remove skill-specific YAML (keep name, description)
- [ ] Add agent YAML (tools, model)
- [ ] Convert to `<role>`, `<constraints>`, `<workflow>`
- [ ] Remove user interaction (Harry handles)
- [ ] Add "return to Harry" step
- [ ] Define structured output format
- [ ] Test in isolation
- [ ] Add to agent-registry.json

---

## CONCLUSION

This implementation plan provides a **complete, actionable roadmap** for building the Harry wizard system within the Maestro framework over 7 weeks.

**Key Achievements:**

1. **Full Resource Integration:** All taches-cc-resources-main content mapped to Maestro agents
2. **Pure Delegation:** Harry never executes, only orchestrates
3. **4-D Compliance:** Audit/healing loops enforce quality at every step
4. **Framework Agnostic:** No technology bias, user brings domain
5. **Self-Sustaining:** System can create and maintain itself
6. **Production-Ready:** Complete with testing, documentation, and edge case handling

**Phased Approach:**

- Week 1: Harry foundation (orchestrator + menu)
- Weeks 2-3: Creator agents (5 conversions, parallel)
- Week 4: Auditors + healing (quality gates)
- Week 5: Registry management (auto-updates)
- Week 6: Integration testing (end-to-end)
- Week 7: Documentation + polish (production-ready)

**Risk Mitigation:**

- Each phase independently testable
- Incremental delivery (Harry → Creators → Auditors)
- Graceful degradation (manual fallback if automation fails)
- User always in control (AskUserQuestion gates)

**Timeline:** 7 weeks to production-ready Harry wizard system

**Next Steps:**

1. Review this implementation plan
2. Begin Phase 1: Create harry.md orchestrator
3. Test activation and menu system
4. Proceed to Phase 2: Creator agent conversions

The Harry wizard will transform Maestro from a fixed-component framework into a **self-evolving, user-extensible orchestration system** that maintains excellence through automated quality gates.
