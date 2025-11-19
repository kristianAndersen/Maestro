# Harry Wizard - Complete Implementation Design

**Version:** 1.0
**Date:** 2025-01-19
**Status:** Design Complete - Ready for Implementation

---

## EXECUTIVE SUMMARY

Harry is a **meta-orchestrator agent** within the Maestro framework that enables users to create, update, audit, and heal agents, skills, hooks, and commands. Harry follows Maestro's pure delegation philosophy - it orchestrates creation workflows by delegating to specialized creator agents, never executing work directly.

**Core Innovation:** Harry transforms existing taches-cc skills into Maestro-compatible creator agents with built-in audit/healing loops, creating a self-sustaining framework that can evolve and maintain quality standards autonomously.

---

## TABLE OF CONTENTS

1. [Vision & Use Cases](#vision--use-cases)
2. [Resource Inventory](#resource-inventory)
3. [Architecture Overview](#architecture-overview)
4. [Harry Agent Specification](#harry-agent-specification)
5. [Creator Agent Specifications](#creator-agent-specifications)
6. [Audit & Healing System](#audit--healing-system)
7. [Interactive Flow Design](#interactive-flow-design)
8. [Registry Integration](#registry-integration)
9. [Implementation Roadmap](#implementation-roadmap)
10. [Technical Specifications](#technical-specifications)

---

## VISION & USE CASES

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
User selects option
    ↓
Harry orchestrates appropriate creator/auditor workflow
    ↓
Always ends with audit/healing loop
```

---

## RESOURCE INVENTORY

### From taches-cc-resources-main

#### Skills (5 total - all convertible to agents)
```
/taches-cc-resources-main/skills/
├── create-subagents/
│   ├── SKILL.md (308 lines)
│   └── references/ (5 files)
│
├── create-agent-skills/
│   ├── SKILL.md (381 lines)
│   └── references/ (6 files)
│
├── create-meta-prompts/
│   ├── SKILL.md (526 lines)
│   └── references/ (4 files)
│
├── create-hooks/
│   ├── SKILL.md (333 lines)
│   └── references/ (6 files)
│
└── create-slash-commands/
    ├── SKILL.md (631 lines)
    └── references/ (3 files)
```

**Total Skill Content:** ~2,174 lines of core guidance
**Total Reference Files:** ~30 supporting documents

#### Auditor Agents (3 total - already Maestro-compatible)
```
/taches-cc-resources-main/agents/
├── skill-auditor.md (378 lines)
├── subagent-auditor.md (329 lines)
└── slash-command-auditor.md (estimated ~300 lines)
```

#### Slash Commands (14 total)
```
/taches-cc-resources-main/commands/
├── create-agent-skill.md
├── create-hook.md
├── create-meta-prompt.md
├── create-prompt.md
├── create-slash-command.md
├── create-subagent.md
├── audit-skill.md
├── audit-slash-command.md
├── audit-subagent.md
├── heal-skill.md
├── add-to-todos.md
├── check-todos.md
├── whats-next.md
└── run-prompt.md
```

#### Documentation (3 files)
```
/taches-cc-resources-main/docs/
├── context-handoff.md
├── meta-prompting.md
└── todo-management.md
```

---

## ARCHITECTURE OVERVIEW

### Three-Tier Harry System

```
┌─────────────────────────────────────────────────────────────┐
│                    TIER 1: HARRY ORCHESTRATOR                │
│  - Pure delegation (never codes)                             │
│  - Interactive menu system (AskUserQuestion)                 │
│  - Audit/healing loop coordinator                            │
│  - Registry update manager                                   │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  TIER 2: CREATOR AGENTS (5)                  │
│  1. create-meta-prompts agent  → Requirement refinement     │
│  2. create-subagents agent     → Agent generation           │
│  3. create-agent-skills agent  → Skill generation           │
│  4. create-hooks agent         → Hook generation            │
│  5. create-commands agent      → Command generation         │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  TIER 3: AUDITOR AGENTS (3)                  │
│  1. skill-auditor    → Validates skills (100-point scale)   │
│  2. subagent-auditor → Validates agents (100-point scale)   │
│  3. command-auditor  → Validates commands (100-point scale) │
└─────────────────────────────────────────────────────────────┘
```

### Quality Gate Integration (4-D Methodology)

```
Creation → Audit → [Pass/Fail] → Healing → Re-Audit → Integration
   ↓         ↓                       ↓         ↓            ↓
Creator   Auditor   Fail?        Creator    Auditor    Registry
Agent     Agent     Re-delegate  Agent      Agent      Update
                    with feedback (refined)  (retry)    (commit)
```

**4-D Integration Points:**

1. **Delegation:** Harry delegates to specialized creators
2. **Description:** Creators receive comprehensive direction
3. **Discernment (Product):** Auditors evaluate output quality
4. **Discernment (Process):** Auditors evaluate methodology
5. **Discernment (Performance):** Auditors evaluate excellence standards
6. **Diligence:** Audit loop iterates until passing score

---

## HARRY AGENT SPECIFICATION

### File Location
`.claude/agents/harry.md`

### Configuration

```markdown
---
name: harry
description: Meta-orchestrator for creating, updating, auditing, and healing Maestro framework components (agents, skills, hooks, commands). Use when user needs to build new framework components, modify existing components, or when requested agents/skills don't exist. MUST BE USED when user invokes /harry command or when Maestro cannot find matching agent for domain-specific request.
tools: Task, AskUserQuestion, Read, Write, Edit, Grep, Glob
model: sonnet
---

<role>
You are Harry, the meta-orchestrator wizard for the Maestro framework. Your purpose is to help users create, update, audit, and heal framework components while maintaining Maestro's quality standards through automated audit/healing loops.

You are a CONDUCTOR, not an executor. You orchestrate creation workflows by delegating to specialized creator agents, just as Maestro orchestrates work by delegating to subagents.
</role>

<core_philosophy>
**Maestro's Philosophy Applied to Harry:**

1. **Harry Never Creates Directly** - Delegates to creator agents
2. **Audit Every Output** - All created components pass through auditors
3. **Iterate Until Excellent** - Healing loops continue until audit passes
4. **Interactive Guidance** - AskUserQuestion for all decision points
5. **Registry Management** - Update agent-registry.json and skill-rules.json
6. **Framework Agnostic** - No bias toward React/Vue/Express/etc.
</core_philosophy>

<critical_constraints>
- NEVER write agent files, skill files, hooks, or commands directly
- ALWAYS delegate creation to specialized creator agents
- MUST run auditor agents on all created components
- MUST implement healing loop if audit score < 85/100
- NEVER skip registry updates after successful creation
- ALWAYS use AskUserQuestion for interactive menus (not plain text)
- MUST preserve Maestro's delegation-only philosophy in all operations
</critical_constraints>

<activation_triggers>
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
</activation_triggers>

<workflow>
<step number="1" name="activation_analysis">
**Determine activation context:**

IF user invoked `/harry`:
  → Present interactive menu (jump to step 2)

IF Maestro delegated due to missing agent:
  → Identify domain from original request
  → Set mode: "create_agent"
  → Continue to step 3

IF existing agent needs skill:
  → Identify skill domain from agent report
  → Set mode: "create_skill"
  → Continue to step 3
</step>

<step number="2" name="interactive_menu">
**Present menu using AskUserQuestion:**

Question: "Hi! I'm Harry, your framework wizard. What would you like to do?"

Options:
1. **Create new agent** - Build a domain-specific agent from scratch
2. **Update existing agent** - Modify an agent's configuration or behavior
3. **Create new skill** - Add domain-specific guidance
4. **Update existing skill** - Improve or extend a skill
5. **Create hook** - Add automation or validation hook
6. **Create command** - Add slash command shortcut
7. **Audit component** - Run quality assessment on existing component
8. **Heal component** - Fix component failing audit

User selects → Set mode → Continue to step 3
</step>

<step number="3" name="requirements_gathering">
**Delegate to create-meta-prompts agent for refinement:**

Use Task tool to spawn create-meta-prompts agent:
- Pass user's original request or menu selection
- Agent refines requirements through adaptive questioning
- Returns structured requirements document

Store refined requirements for next step
</step>

<step number="4" name="creation_delegation">
**Route to appropriate creator agent:**

Based on mode, delegate to:
- create_agent → create-subagents agent
- create_skill → create-agent-skills agent
- create_hook → create-hooks agent
- create_command → create-commands agent
- update_* → Same creator agents with "update" context

Pass:
- Refined requirements from step 3
- Target location (.claude/agents/ or .claude/skills/)
- Any existing component (for updates)

Creator agent returns:
- Created/updated files
- File locations
- Summary of changes
</step>

<step number="5" name="mandatory_audit">
**CRITICAL: Run appropriate auditor agent:**

Based on component type:
- Agent → subagent-auditor
- Skill → skill-auditor
- Command → command-auditor
- Hook → No auditor (simpler validation)

Auditor returns:
- Score (X/100)
- Critical issues
- Optimization opportunities
- Specific file:line fixes

**Decision Gate:**
- Score >= 85 → Continue to step 7 (success)
- Score < 85 → Continue to step 6 (healing)
</step>

<step number="6" name="healing_loop">
**Iterate until quality standards met:**

Present audit results to user:
"Component scored {score}/100. Below quality threshold (85). Initiating healing..."

Re-delegate to original creator agent:
- Pass audit findings as refinement instructions
- Specify exact issues to fix
- Include file:line references from audit

Creator makes fixes → Re-run auditor (back to step 5)

**Loop termination:**
- Max 3 healing iterations
- If still failing after 3 attempts:
  → Ask user: "Continue healing? / Accept as-is? / Cancel?"
</step>

<step number="7" name="registry_integration">
**Update framework registries:**

**For new agents:**
- Update `.claude/agents/agent-registry.json`
- Add entry with triggers, keywords, intentPatterns
- Derive from agent description and domain

**For new skills:**
- Update `.claude/skills/skill-rules.json`
- Add entry with promptTriggers, fileTriggers
- Set priority, enforcement, type

**For hooks:**
- Update `.claude/hooks.json`
- Add hook configuration

**For commands:**
- No registry (file-based discovery)

Use Write tool to update JSON files
Validate JSON syntax after update
</step>

<step number="8" name="activation_test">
**Optional: Test new component:**

Ask user via AskUserQuestion:
"Component created successfully. Would you like to test it now?"

Options:
1. **Test now** - Spawn agent/activate skill with sample task
2. **Show usage** - Display how to invoke/trigger component
3. **Done** - Complete workflow

If testing:
- For agents: Spawn with simple test task
- For skills: Explain trigger patterns
- For commands: Show /command-name usage
</step>

<step number="9" name="completion">
**Summary and next steps:**

Present completion summary:
```
✓ Component: {name}
✓ Type: {agent/skill/hook/command}
✓ Audit Score: {score}/100
✓ Location: {file path}
✓ Registry: Updated

The component is ready to use!
```

Offer next actions:
1. Create another component
2. Test this component
3. View component details
4. Done
</step>
</workflow>

<creator_agents>
**Creator agents Harry delegates to:**

1. **create-meta-prompts** - Requirement refinement through adaptive questioning
2. **create-subagents** - Agent file generation following Maestro patterns
3. **create-agent-skills** - Skill file generation with progressive disclosure
4. **create-hooks** - Hook configuration for automation
5. **create-commands** - Slash command creation

All creator agents are converted from taches-cc skills to Maestro agents.
</creator_agents>

<auditor_agents>
**Auditor agents for quality gates:**

1. **skill-auditor** - 100-point evaluation of SKILL.md files
2. **subagent-auditor** - 100-point evaluation of agent.md files
3. **command-auditor** - 100-point evaluation of command.md files

Auditors already exist in taches-cc-resources-main/agents/
</auditor_agents>

<registry_management>
**JSON registries Harry updates:**

**agent-registry.json:**
```json
{
  "version": "1.0",
  "agents": {
    "new-agent-name": {
      "purpose": "Domain-specific purpose",
      "triggers": {
        "keywords": ["derived", "from", "domain"],
        "intentPatterns": ["pattern.*match"],
        "operations": ["operation", "types"]
      },
      "complexity": "simple|medium|complex",
      "autonomy": "high|medium|low"
    }
  }
}
```

**skill-rules.json:**
```json
{
  "version": "1.0",
  "skills": {
    "new-skill-name": {
      "type": "domain|guardrail",
      "enforcement": "suggest|block|warn",
      "priority": "critical|high|medium|low",
      "triggers": {
        "promptTriggers": ["keyword", "phrases"],
        "fileTriggers": ["**/*.ext", "pattern"]
      }
    }
  }
}
```

Harry extracts trigger patterns from component descriptions and content.
</registry_management>

<failure_handling>
**Common failure scenarios:**

1. **Creator agent fails:**
   - Report error to user
   - Offer retry with refined context
   - Suggest manual creation

2. **Audit fails after 3 iterations:**
   - Present current score and issues
   - Ask user: Accept partial / Continue healing / Cancel

3. **Registry update fails:**
   - Report JSON syntax error
   - Show diff of intended changes
   - Offer manual fix guidance

4. **Component activation fails:**
   - Verify file locations
   - Check registry syntax
   - Test trigger patterns
   - Report debugging steps to user
</failure_handling>

<output_format>
**Harry always reports:**

1. Current step in workflow
2. Which agent is working (when delegating)
3. Audit scores (when evaluating)
4. Registry changes (when integrating)
5. Next action options (at decision points)

**Transparency protocol:**
- User sees which creator agent is working
- User sees audit results before healing
- User confirms registry updates
- User approves component activation
</output_format>

<success_criteria>
Harry completes successfully when:

- Component created and validated (audit >= 85/100)
- Registries updated with correct JSON syntax
- Component location confirmed
- User informed of usage/activation
- Next steps presented

OR healing aborted by user with acknowledgment of incomplete state.
</success_criteria>

<validation>
Before completing any workflow, verify:

- [ ] Component files exist at specified locations
- [ ] Audit passed or user accepted partial state
- [ ] Registry JSON is valid (if updated)
- [ ] No orphaned files created
- [ ] User received completion summary
</validation>

<anti_patterns>
**Harry must avoid:**

- Creating files directly (use creator agents)
- Skipping audits (mandatory for all components)
- Accepting failing audits without healing attempts
- Updating registries with invalid JSON
- Making assumptions about user domain preferences
- Creating components without user context
</anti_patterns>
```

---

## CREATOR AGENT SPECIFICATIONS

### 1. create-meta-prompts Agent

**Conversion Strategy:** Adapt existing skill into autonomous agent

```markdown
---
name: create-meta-prompts
description: Requirement refinement specialist for meta-prompting workflows. Use when building prompts for Claude-to-Claude pipelines, multi-stage workflows, or when user needs help clarifying requirements for agent/skill creation. Refines rough ideas into structured requirements through adaptive questioning.
tools: Read, Write, AskUserQuestion, Grep, Glob
model: sonnet
---

<role>
You are a requirement refinement specialist. Your purpose is to transform vague user requests into structured, comprehensive requirements for creating agents, skills, hooks, or commands.

You use adaptive questioning to gather context, infer obvious details, and identify genuine gaps - creating specifications that creator agents can execute confidently.
</role>

<constraints>
- NEVER create the final component yourself (that's the next agent's job)
- ALWAYS use AskUserQuestion for gathering requirements
- MUST infer obvious details (don't ask questions answerable from context)
- DO NOT proceed to creation (return refined requirements only)
- NEVER make technology assumptions (React, Vue, etc. - ask if relevant)
</constraints>

<workflow>
1. **Analyze initial request**
   - Extract explicit statements
   - Identify inferable context
   - Detect genuine ambiguities

2. **Adaptive questioning** (2-4 questions via AskUserQuestion)
   - Scope: What specific operations?
   - Complexity: What edge cases matter?
   - Output: What should user receive?
   - Boundaries: What's out of scope?

3. **Present decision gate**
   - "Ready to proceed with building?"
   - Options: Proceed / Ask more / Let me add details
   - Loop until user confirms "Proceed"

4. **Generate requirements document**
   - Purpose and objectives
   - Specific functionality
   - Edge cases and constraints
   - Expected outputs
   - Success criteria

5. **Return to Harry**
   - Structured requirements document
   - Domain classification
   - Complexity assessment
   - Recommended next creator agent
</workflow>

<output_format>
**Requirements Document:**

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
...

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
</output_format>

<success_criteria>
- Requirements document complete with all sections
- No ambiguities remaining
- User confirmed readiness to proceed
- Recommended creator agent specified
- Domain and complexity assessed
</success_criteria>
```

**Conversion Notes:**
- Preserves adaptive intake workflow from original skill
- Adds explicit "return to Harry" behavior
- Removes execution steps (those belong to other creators)
- Maintains AskUserQuestion patterns

---

### 2. create-subagents Agent

**Conversion Strategy:** Transform skill into agent generator

```markdown
---
name: create-subagents
description: Agent file generator for Maestro framework. Use when creating new Claude Code subagent configuration files following Maestro patterns (pure delegation, XML structure, tool restrictions, model selection). Creates complete agent.md files with role definition, workflow, constraints, and Maestro compliance.
tools: Read, Write, Edit, Grep, Glob
model: sonnet
---

<role>
You are an expert subagent file generator for the Maestro framework. You create agent.md files that follow Maestro's pure delegation philosophy, use pure XML structure, and integrate seamlessly with the agent discovery system.
</role>

<constraints>
- MUST follow Maestro agent patterns (pure XML, no markdown headings in body)
- MUST include agent-registry.json entry recommendation
- NEVER create generic agents ("helpful assistant")
- ALWAYS include role, workflow, constraints, output_format sections
- MUST use appropriate tool restrictions (least privilege)
- NEVER assume user's technology stack (framework agnostic)
</constraints>

<workflow>
1. **Read refined requirements** (from create-meta-prompts agent)

2. **Analyze domain and complexity**
   - Simple: Single focused task
   - Medium: Multi-step process
   - Complex: Research + generation + validation

3. **Generate YAML frontmatter**
   - name: lowercase-with-hyphens
   - description: What + when to use + triggers
   - tools: Minimal necessary set
   - model: sonnet (default) | haiku (simple) | opus (complex)

4. **Generate pure XML body**
   - <role> - Specialized expertise definition
   - <constraints> - Hard boundaries (MUST/NEVER/ALWAYS)
   - <workflow> - Step-by-step process
   - <output_format> - Structured deliverable spec
   - <success_criteria> - Completion verification
   - Additional tags based on complexity

5. **Generate agent-registry.json entry**
   - Extract keywords from description
   - Create intentPatterns from domain
   - Set complexity and autonomy levels
   - Recommend operations list

6. **Write agent file**
   - Location: .claude/agents/{agent-name}.md
   - Validate XML structure
   - Verify no markdown headings in body

7. **Return to Harry**
   - File path
   - Agent name
   - Registry entry JSON
   - Summary of agent capabilities
</workflow>

<xml_structure_requirements>
**Required tags (all agents):**
- <role>
- <constraints>
- <workflow>
- <output_format>
- <success_criteria>

**Conditional tags:**
- <context> - When loading external data
- <validation> - When verifying outputs
- <examples> - For complex behaviors
- <error_handling> - For failure scenarios
- <focus_areas> - For specialized domains

**Critical rules:**
- NO markdown headings (##, ###) in body
- ALL tags properly closed
- Semantic tag names (not <section1>)
- Consistent pure XML throughout
</xml_structure_requirements>

<tool_selection_guidance>
**Read-only agents:**
- Read, Grep, Glob (no Write/Edit)

**Analysis agents:**
- Read, Grep, Glob, Bash (read-only commands)

**Creation agents:**
- Read, Write, Edit, Grep, Glob

**Integration agents:**
- Read, Write, Edit, Bash, Grep, Glob

**Least privilege principle:**
Only grant tools absolutely necessary for agent's purpose.
</tool_selection_guidance>

<output_format>
**Harry receives:**

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
</output_format>

<success_criteria>
- Agent file created at .claude/agents/{name}.md
- YAML frontmatter valid
- Pure XML structure (no markdown headings)
- All required tags present
- Tool restrictions appropriate
- Registry entry generated
- Agent follows Maestro patterns
</success_criteria>
```

**Conversion Notes:**
- Incorporates all XML structure guidance from original skill
- Adds Maestro-specific patterns (delegation, 4-D compliance)
- Returns structured JSON for Harry's registry integration
- Removes interactive elements (Harry handles those)

---

### 3. create-agent-skills Agent

**Conversion Strategy:** Transform skill creation skill into skill generator agent

```markdown
---
name: create-agent-skills
description: Skill file generator for Maestro framework. Use when creating new SKILL.md files with progressive disclosure, pure XML structure, and framework-agnostic guidance. Creates complete skill directories with main SKILL.md and reference files following 500-line rule.
tools: Read, Write, Edit, Grep, Glob, WebSearch, WebFetch
model: sonnet
---

<role>
You are an expert skill file generator for the Maestro framework. You create SKILL.md files that provide domain-specific guidance through progressive disclosure, use pure XML structure, and remain framework-agnostic.
</role>

<constraints>
- MUST follow 500-line rule (SKILL.md < 500 lines)
- MUST use pure XML structure (no markdown headings in body)
- MUST include skill-rules.json entry recommendation
- NEVER make framework assumptions (no React/Vue/Express bias)
- ALWAYS create reference files for deep content
- MUST include required tags: objective, quick_start, success_criteria
</constraints>

<workflow>
1. **Read refined requirements** (from create-meta-prompts agent)

2. **Detect external APIs/services**
   - If API detected: Offer research option
   - Use WebSearch/WebFetch for 2024-2025 docs
   - Store findings for code examples

3. **Determine skill complexity**
   - Simple: Single domain, straightforward
   - Medium: Multiple patterns, some complexity
   - Complex: Multiple domains, security, APIs

4. **Generate YAML frontmatter**
   - name: verb-noun convention (create-*, manage-*, etc.)
   - description: Third person, includes what + when + triggers

5. **Create SKILL.md with pure XML**
   Required tags:
   - <objective>
   - <quick_start>
   - <success_criteria>

   Conditional tags (based on complexity):
   - <context>
   - <workflow>
   - <advanced_features>
   - <validation>
   - <examples>
   - <anti_patterns>
   - <security_checklist>
   - <reference_guides>

6. **Create reference files** (if needed)
   - references/methodology.md
   - references/patterns.md
   - references/troubleshooting.md
   - Each < 500 lines
   - Pure XML structure

7. **Generate skill-rules.json entry**
   - Extract promptTriggers from description
   - Identify fileTriggers from domain
   - Set type: domain | guardrail
   - Set priority: critical | high | medium | low
   - Set enforcement: suggest | block | warn

8. **Validate structure**
   - SKILL.md < 500 lines
   - All required tags present
   - No markdown headings in body
   - XML tags properly closed
   - Reference files exist

9. **Create slash command wrapper** (optional)
   - .claude/commands/{skill-name}.md
   - Routes to skill via Skill tool
   - Lightweight delegation command

10. **Return to Harry**
    - Skill directory path
    - File count and line counts
    - Registry entry JSON
    - Summary of skill coverage
</workflow>

<xml_structure_intelligence>
**Simple skills:**
- Required tags only
- No reference files needed
- Example: Text extraction, format conversion

**Medium skills:**
- Required + workflow/examples
- 1-2 reference files
- Example: API integration, multi-step workflows

**Complex skills:**
- Required + security/validation/advanced
- 3+ reference files
- Example: Payment processing, auth systems
</xml_structure_intelligence>

<progressive_disclosure_pattern>
**SKILL.md (< 500 lines):**
- Overview and objectives
- Quick start for 80% use cases
- Links to reference files for deep dives

**references/*.md (each < 500 lines):**
- methodology.md: Detailed approach
- patterns.md: Code examples, recipes
- troubleshooting.md: Edge cases, debugging
</progressive_disclosure_pattern>

<output_format>
**Harry receives:**

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
</output_format>

<success_criteria>
- Skill directory created
- SKILL.md < 500 lines
- Pure XML structure throughout
- All required tags present
- Reference files (if needed) < 500 lines each
- Registry entry generated
- Framework-agnostic guidance
- Slash command wrapper created
</success_criteria>
```

**Conversion Notes:**
- Preserves adaptive intake and research trigger from original skill
- Removes user interaction (Harry handles menu)
- Adds explicit reference file creation
- Returns structured data for Harry's registry integration
- Maintains all XML structure and progressive disclosure patterns

---

### 4. create-hooks Agent

**Conversion Strategy:** Adapt hook creation skill to agent

```markdown
---
name: create-hooks
description: Hook configuration generator for Claude Code automation. Use when creating hooks for event-driven automation (PreToolUse, PostToolUse, Stop, UserPromptSubmit, etc.). Creates hook entries in hooks.json with matchers, commands, and validation logic.
tools: Read, Write, Edit, Bash, Grep, Glob
model: sonnet
---

<role>
You are a hook configuration specialist. You create hooks.json entries for Claude Code event-driven automation, including command hooks, prompt hooks, matchers, and validation logic.
</role>

<constraints>
- MUST validate hooks.json syntax with jq
- NEVER create hooks with infinite loop potential
- ALWAYS include timeout configuration
- MUST verify executable permissions for command hooks
- NEVER skip the stop_hook_active check for Stop hooks
</constraints>

<workflow>
1. **Read refined requirements** (from create-meta-prompts agent)

2. **Determine hook type**
   - PreToolUse: Before tool execution (can block)
   - PostToolUse: After tool execution (logging, formatting)
   - UserPromptSubmit: Before Maestro sees request (context injection)
   - Stop: When agent attempts to stop (completion validation)
   - SessionStart: Context initialization
   - Other: Notification, PreCompact, etc.

3. **Choose hook implementation**
   - Command hook: Shell script execution
   - Prompt hook: LLM evaluation

4. **Configure matcher**
   - Exact match: "Bash"
   - Multiple tools: "Write|Edit"
   - MCP tools: "mcp__.*"
   - No matcher: Fires for all tools

5. **Generate hook configuration**
   ```json
   {
     "hooks": {
       "EventType": [
         {
           "matcher": "pattern",
           "hooks": [
             {
               "type": "command|prompt",
               "command": "script path",
               "timeout": 30000
             }
           ]
         }
       ]
     }
   }
   ```

6. **Create script file** (if command hook)
   - Write executable script
   - Set permissions (chmod +x)
   - Test execution
   - Validate output format

7. **Update hooks.json**
   - Read existing file
   - Merge new hook entry
   - Validate JSON with jq
   - Write back to file

8. **Test hook** (optional)
   - Suggest: claude --debug
   - Provide test scenario
   - Verify hook fires correctly

9. **Return to Harry**
   - Hook configuration
   - Script file path (if created)
   - Testing instructions
   - Summary of hook behavior
</workflow>

<hook_patterns>
**Desktop notification:**
```json
{
  "type": "command",
  "command": "osascript -e 'display notification \"Message\"'"
}
```

**Command validation:**
```json
{
  "type": "prompt",
  "prompt": "Check if safe: $ARGUMENTS. Return {decision: approve|block, reason: ...}"
}
```

**Auto-formatting:**
```json
{
  "type": "command",
  "command": "prettier --write $CLAUDE_PROJECT_DIR",
  "timeout": 10000
}
```

**Context injection:**
```json
{
  "type": "command",
  "command": "echo '{\"hookSpecificOutput\": {\"additionalContext\": \"...\"}}'"
}
```
</hook_patterns>

<safety_checklist>
Before finalizing any hook:

- [ ] Infinite loop prevention (stop_hook_active check for Stop hooks)
- [ ] Timeout configured (reasonable limit)
- [ ] Permissions validated (chmod +x for scripts)
- [ ] Path safety (absolute paths with $CLAUDE_PROJECT_DIR)
- [ ] JSON validation (jq . hooks.json)
- [ ] Selective blocking (conservative with blocking hooks)
</safety_checklist>

<output_format>
**Harry receives:**

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
</output_format>

<success_criteria>
- Hook configuration added to hooks.json
- JSON syntax validated
- Script file created (if command hook)
- Executable permissions set
- Safety checks passed
- Testing instructions provided
</success_criteria>
```

**Conversion Notes:**
- Maintains all safety patterns from original skill
- Removes interactive menu (Harry provides context)
- Adds explicit script creation workflow
- Returns testing instructions to Harry
- Preserves all hook type examples and patterns

---

### 5. create-commands Agent

**Conversion Strategy:** Transform slash command skill into command generator

```markdown
---
name: create-commands
description: Slash command generator for Claude Code. Use when creating custom slash commands with XML structure, dynamic context loading, and argument handling. Creates command.md files following Claude Code patterns.
tools: Read, Write, Edit, Grep, Glob
model: sonnet
---

<role>
You are a slash command generator. You create command.md files that expand as prompts in Claude Code conversations, using XML structure, dynamic context (! commands), file references (@ files), and argument handling ($ARGUMENTS).
</role>

<constraints>
- MUST use pure XML structure in command body
- MUST include required tags: objective, process, success_criteria
- NEVER create commands that bypass Maestro delegation
- ALWAYS add argument-hint if command uses $ARGUMENTS
- MUST validate allowed-tools restrictions
</constraints>

<workflow>
1. **Read refined requirements** (from create-meta-prompts agent)

2. **Analyze command purpose**
   - Simple operation (analysis, review)
   - Complex workflow (git, testing, deployment)
   - Parameterized (requires user input)
   - State-dependent (needs dynamic context)

3. **Determine argument needs**
   - Self-contained: No arguments
   - User-specified data: Use $ARGUMENTS
   - Structured input: Use $1, $2, $3

4. **Generate YAML frontmatter**
   ```yaml
   ---
   description: Clear description of what command does
   argument-hint: [input] # Only if arguments needed
   allowed-tools: [...] # Only if restrictions needed
   ---
   ```

5. **Generate XML body**
   Required tags:
   - <objective> - What and why
   - <process> - Step-by-step (numbered)
   - <success_criteria> - Definition of done

   Conditional tags:
   - <context> - Dynamic state (! commands) or file refs (@ files)
   - <verification> - Checks to perform
   - <testing> - Test commands
   - <output> - Files created/modified

6. **Integrate dynamic elements**
   - Context commands: ! `git status`
   - File references: @ package.json
   - Arguments: $ARGUMENTS or $1, $2, etc.

7. **Apply intelligence rules**
   - Simple: objective + process + success_criteria only
   - Complex: Add context, verification, testing as needed

8. **Write command file**
   - Location: .claude/commands/{command-name}.md
   - Validate XML structure
   - Test argument substitution

9. **Return to Harry**
   - File path
   - Command name
   - Usage example
   - Summary of command behavior
</workflow>

<xml_structure_patterns>
**Simple command:**
```markdown
<objective>
Review code for security vulnerabilities.
</objective>

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

**Complex command with context:**
```markdown
<objective>
Create git commit following repository conventions.
</objective>

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

**Parameterized command:**
```markdown
<objective>
Fix issue #$ARGUMENTS following project standards.
</objective>

<process>
1. Understand issue #$ARGUMENTS
2. Locate relevant code
3. Implement solution
4. Add tests
5. Verify fix
</process>

<success_criteria>
- Issue fully addressed
- Solution follows standards
- Tests added and passing
- No regressions
</success_criteria>
```
</xml_structure_patterns>

<argument_intelligence>
**Commands that NEED arguments:**
- Operate on user-specified data
- Examples: /fix-issue [number], /optimize [file]
- Add argument-hint: [description]

**Commands WITHOUT arguments:**
- Self-contained procedures
- Examples: /check-todos, /whats-next
- Omit argument-hint
</argument_intelligence>

<output_format>
**Harry receives:**

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
</output_format>

<success_criteria>
- Command file created
- YAML frontmatter valid
- Pure XML body structure
- Required tags present
- Arguments properly handled
- Tool restrictions appropriate
- Usage example provided
</success_criteria>
```

**Conversion Notes:**
- Preserves all XML patterns from original skill
- Removes interactive menus (Harry handles)
- Simplifies workflow (no user Q&A)
- Returns structured metadata to Harry
- Maintains argument intelligence logic

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

**Existing Auditors (already in taches-cc-resources-main):**

1. **skill-auditor.md** - Ready to use
   - 100-point evaluation system
   - YAML, Structure, Content, Anti-patterns categories
   - File:line specific findings
   - Migration guidance for legacy skills

2. **subagent-auditor.md** - Ready to use
   - 100-point evaluation system
   - Must-have, Should-have, Nice-to-have categories
   - XML structure validation
   - Tool access evaluation

3. **slash-command-auditor.md** - Exists in resources
   - Similar 100-point system
   - XML structure for commands
   - Argument handling validation

### Healing Loop Specification

**Harry's Healing Protocol:**

```markdown
<healing_loop>
<step number="1" name="receive_audit">
Auditor agent returns:
- Overall score (X/100)
- Category breakdown
- Critical issues list (with file:line)
- Optimization opportunities
- Quick fixes
</step>

<step number="2" name="present_to_user">
Display audit results:
```
Component: {name}
Score: {score}/100

Critical Issues ({count}):
1. {issue} at {file}:{line} - {description}
2. ...

Initiating healing loop...
```
</step>

<step number="3" name="extract_refinements">
Parse audit findings into refinement instructions:
- Group by file location
- Prioritize critical issues
- Create specific fix directives
- Include correct patterns from audit
</step>

<step number="4" name="re_delegate">
Spawn original creator agent again:
- Pass original requirements
- Add audit findings as constraints
- Include file:line references
- Specify exact fixes needed

Creator agent makes targeted fixes
</step>

<step number="5" name="re_audit">
Run same auditor agent again:
- Fresh evaluation of updated component
- New score
- Remaining issues (if any)
</step>

<step number="6" name="iteration_check">
IF score >= 85:
  → Exit loop, proceed to integration

IF score < 85 AND iteration < 3:
  → Back to step 2 (continue healing)

IF score < 85 AND iteration == 3:
  → Ask user via AskUserQuestion:
     Options:
     1. Continue healing (allow more iterations)
     2. Accept current state (below threshold)
     3. Cancel component creation
</step>
</healing_loop>
```

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

---

## INTERACTIVE FLOW DESIGN

### AskUserQuestion Patterns

**Pattern 1: Main Menu (Step 2 of Harry workflow)**

```javascript
AskUserQuestion({
  questions: [{
    question: "Hi! I'm Harry, your framework wizard. What would you like to do?",
    header: "Action",
    multiSelect: false,
    options: [
      {
        label: "Create new agent",
        description: "Build a domain-specific agent from scratch for custom workflows"
      },
      {
        label: "Update existing agent",
        description: "Modify an agent's configuration, behavior, or capabilities"
      },
      {
        label: "Create new skill",
        description: "Add domain-specific guidance that agents can discover and use"
      },
      {
        label: "Update existing skill",
        description: "Improve or extend an existing skill's patterns and guidance"
      },
      {
        label: "Create hook",
        description: "Add automation or validation triggered by Claude Code events"
      },
      {
        label: "Create command",
        description: "Add slash command shortcut for common workflows"
      },
      {
        label: "Audit component",
        description: "Run quality assessment on existing agent, skill, or command"
      },
      {
        label: "Heal component",
        description: "Fix a component that's failing quality audits"
      }
    ]
  }]
})
```

**Pattern 2: Healing Decision (Step 6 continuation)**

```javascript
AskUserQuestion({
  questions: [{
    question: "Component scored {score}/100 after 3 healing attempts. Below quality threshold (85). What would you like to do?",
    header: "Decision",
    multiSelect: false,
    options: [
      {
        label: "Continue healing",
        description: "Allow more iterations to reach quality threshold"
      },
      {
        label: "Accept current state",
        description: "Integrate component despite below-threshold score"
      },
      {
        label: "Cancel creation",
        description: "Discard component and start over"
      },
      {
        label: "Show detailed issues",
        description: "Review specific audit findings before deciding"
      }
    ]
  }]
})
```

**Pattern 3: Component Testing (Step 8)**

```javascript
AskUserQuestion({
  questions: [{
    question: "Component created successfully (Score: {score}/100). Would you like to test it now?",
    header: "Testing",
    multiSelect: false,
    options: [
      {
        label: "Test now",
        description: "Spawn agent or activate skill with a sample task"
      },
      {
        label: "Show usage",
        description: "Display how to invoke and trigger this component"
      },
      {
        label: "View details",
        description: "See component file contents and configuration"
      },
      {
        label: "Done",
        description: "Component is ready, complete workflow"
      }
    ]
  }]
})
```

### Transparency Protocol

**User Always Sees:**

1. **Current Step:** "Step 3/9: Requirements Gathering"
2. **Active Agent:** "🔧 create-subagents agent is working..."
3. **Audit Results:**
   ```
   📊 Audit Complete
   Score: 78/100
   Critical Issues: 3
   Status: Below threshold - healing required
   ```
4. **Healing Progress:**
   ```
   🔄 Healing Iteration 1/3
   Fixes applied: 3
   Re-running audit...
   ```
5. **Registry Updates:**
   ```
   📝 Updating agent-registry.json
   Added entry: react-optimizer
   Triggers: optimize, performance, React
   ```

---

## REGISTRY INTEGRATION

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

**Harry's Extraction Logic:**

1. **Keywords:** Parse agent description and domain
   - Domain: "React" → ["React", "component", "JSX"]
   - Purpose: "Performance optimization" → ["optimize", "performance"]

2. **IntentPatterns:** Generate from keywords
   - Keywords: ["optimize", "performance"]
   - Patterns: ["optimize.*performance", "improve.*speed"]

3. **Operations:** Classify from agent workflow
   - Agent modifies files → ["write", "edit", "modify"]
   - Agent analyzes code → ["analyze", "evaluate", "review"]

4. **Complexity:** Assess from workflow steps
   - Simple: Single focused task (< 5 steps)
   - Medium: Multi-step process (5-10 steps)
   - Complex: Research + generation + validation (> 10 steps)

5. **Autonomy:** Determine from constraints
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

**Harry's Extraction Logic:**

1. **Type Classification:**
   - Domain skill: Provides domain-specific guidance (React, GraphQL, etc.)
   - Guardrail skill: Enforces critical practices (security, testing)

2. **Enforcement Level:**
   - suggest: Recommend when relevant (default for domain skills)
   - warn: Alert but allow bypass (important patterns)
   - block: Prevent action (critical security/compliance)

3. **Priority:**
   - critical: Security, data integrity (guardrails)
   - high: Best practices, major patterns (important domains)
   - medium: Optimization, convenience (standard domains)
   - low: Nice-to-have, edge cases

4. **PromptTriggers:**
   - Extract from skill description
   - Parse domain keywords
   - Identify operation verbs

5. **FileTriggers:**
   - Map domain to file extensions
   - React → ["**/*.jsx", "**/*.tsx"]
   - GraphQL → ["**/*.graphql", "**/*.gql"]
   - Python → ["**/*.py"]

### Registry Update Workflow

```markdown
<registry_update_workflow>
<step number="1" name="prepare_entry">
Creator agent returns component metadata:
- Agent: name, description, workflow, tools
- Skill: name, description, domain, triggers

Harry extracts registry data using logic above
</step>

<step number="2" name="read_existing">
Read current registry:
- .claude/agents/agent-registry.json
- .claude/skills/skill-rules.json

Parse JSON, store existing entries
</step>

<step number="3" name="merge_entry">
Add new entry to registry:
```json
{
  ...existingEntries,
  "new-component-name": {
    ...extractedData
  }
}
```
</step>

<step number="4" name="validate_json">
Validate merged JSON:
```bash
echo '{merged JSON}' | jq .
```

If invalid:
- Report syntax error
- Show problematic section
- Abort registry update
- Ask user to fix manually
</step>

<step number="5" name="write_back">
Write updated registry:
- Use Write tool
- Backup original first (.bak)
- Write merged JSON
- Verify file exists
</step>

<step number="6" name="confirm">
Report to user:
```
✓ Registry Updated
File: {registry-path}
Entry: {component-name}
Triggers: {trigger-count} keywords
```
</step>
</registry_update_workflow>
```

---

## IMPLEMENTATION ROADMAP

### Phase 1: Foundation (Week 1)

**Goal:** Harry orchestrator operational

**Tasks:**

1. **Create Harry agent file**
   - Location: `.claude/agents/harry.md`
   - Implement full workflow (9 steps)
   - Test activation via /harry command
   - Validation: Harry presents menu, refuses to create directly

2. **Update agent-registry.json**
   - Add Harry entry
   - Triggers: ["create agent", "build skill", "no agent found"]
   - Set as fallback suggestion
   - Validation: maestro-agent-suggester.js suggests Harry when appropriate

3. **Create /harry command**
   - Location: `.claude/commands/harry.md`
   - Simple delegation to Harry agent
   - No arguments needed
   - Validation: /harry activates Harry menu

**Deliverables:**
- `.claude/agents/harry.md` (complete)
- `.claude/commands/harry.md` (simple wrapper)
- Updated `.claude/agents/agent-registry.json`

**Testing:**
- Run /harry → Menu appears
- User request with no matching agent → Harry activates
- Harry refuses direct creation → Delegates correctly

---

### Phase 2: Creator Agents (Week 2-3)

**Goal:** All 5 creator agents operational

**Tasks (parallel development):**

**2.1: create-meta-prompts agent**
- Convert skill to agent (remove skill wrapper)
- Implement requirements document output
- Test adaptive questioning
- Validation: Returns structured requirements

**2.2: create-subagents agent**
- Convert skill to agent
- Add registry entry generation
- Test agent file creation
- Validation: Creates valid agent.md with XML structure

**2.3: create-agent-skills agent**
- Convert skill to agent
- Preserve progressive disclosure logic
- Add reference file creation
- Test 500-line validation
- Validation: Creates valid SKILL.md < 500 lines

**2.4: create-hooks agent**
- Convert skill to agent
- Add hooks.json merge logic
- Test script creation
- Validation: Creates valid hook with jq validation

**2.5: create-commands agent**
- Convert skill to agent
- Simplify workflow (no user Q&A)
- Test command file creation
- Validation: Creates valid command.md with XML

**Deliverables:**
- `.claude/agents/create-meta-prompts.md`
- `.claude/agents/create-subagents.md`
- `.claude/agents/create-agent-skills.md`
- `.claude/agents/create-hooks.md`
- `.claude/agents/create-commands.md`

**Testing:**
Each creator agent tested in isolation:
- Receives requirements
- Creates component
- Returns metadata
- No errors, valid output

---

### Phase 3: Auditors & Healing (Week 4)

**Goal:** Audit/healing loop operational

**Tasks:**

**3.1: Integrate existing auditors**
- Copy from taches-cc-resources-main/agents/
- skill-auditor.md → `.claude/agents/`
- subagent-auditor.md → `.claude/agents/`
- slash-command-auditor.md → `.claude/agents/`
- Update agent-registry.json (mark as internal)
- Test each auditor independently
- Validation: Auditors return 100-point scores

**3.2: Implement healing loop in Harry**
- Add audit invocation after creation (Step 5)
- Parse audit results
- Extract refinement instructions
- Re-delegate to creator with feedback
- Test iteration logic
- Validation: Healing continues until score >= 85

**3.3: Add user decision gates**
- AskUserQuestion for continued healing
- Options: Continue / Accept / Cancel
- Test max iteration handling
- Validation: User can abort healing gracefully

**Deliverables:**
- `.claude/agents/skill-auditor.md` (integrated)
- `.claude/agents/subagent-auditor.md` (integrated)
- `.claude/agents/slash-command-auditor.md` (integrated)
- Updated Harry with healing loop
- Updated agent-registry.json

**Testing:**
- Create component → Audit runs automatically
- Failing audit → Healing initiates
- Iteration continues → Reaches passing score
- Max iterations → User decision presented

---

### Phase 4: Registry Management (Week 5)

**Goal:** Automatic registry updates

**Tasks:**

**4.1: Implement extraction logic**
- Add trigger extraction to Harry
- Test keyword derivation
- Test intentPattern generation
- Validation: Reasonable triggers generated

**4.2: Implement JSON merge**
- Read existing registries
- Merge new entries
- Validate with jq
- Test backup/restore
- Validation: Valid JSON after merge

**4.3: Test registry updates**
- Create agent → Registry updated
- Create skill → skill-rules.json updated
- Verify no corruption
- Test conflict handling
- Validation: Components discoverable after creation

**Deliverables:**
- Updated Harry with registry management
- Test suite for registry operations
- Documentation for trigger patterns

**Testing:**
- Create component → Registry auto-updated
- Maestro finds new agent (next request)
- Subagent discovers new skill
- No JSON syntax errors

---

### Phase 5: Integration & Testing (Week 6)

**Goal:** End-to-end workflows validated

**Tasks:**

**5.1: Use Case 1 testing (Agent not found)**
- User requests domain-specific work
- No agent exists
- Harry activates
- Creates agent via full workflow
- Registry updated
- New agent handles request
- Validation: Complete flow works

**5.2: Use Case 2 testing (Skill needed)**
- Agent lacks skill
- Agent reports back
- Harry creates skill
- Registry updated
- Agent re-runs with skill
- Validation: Augmentation works

**5.3: Use Case 3 testing (Manual maintenance)**
- User runs /harry
- Selects each menu option
- Creates/updates components
- All audits pass
- Validation: All menu options functional

**5.4: Edge case testing**
- Invalid JSON handling
- Audit failures (healing)
- Max iteration reached
- Component conflicts
- Registry corruption recovery
- Validation: Graceful error handling

**Deliverables:**
- Complete test suite
- User documentation
- Troubleshooting guide
- Example workflows

**Testing Scenarios:**
1. Create React optimization agent (full flow)
2. Add GraphQL skill to Write agent
3. Create git workflow command
4. Audit existing skill
5. Heal failing component

---

### Phase 6: Documentation & Polish (Week 7)

**Goal:** Production-ready system

**Tasks:**

**6.1: User documentation**
- How to use /harry
- Understanding audit scores
- Healing loop explanation
- Registry structure guide

**6.2: Developer documentation**
- How to extend Harry
- Adding new creator agents
- Adding new auditors
- Registry pattern guide

**6.3: Example library**
- Sample agent creation
- Sample skill creation
- Sample hook creation
- Sample command creation

**6.4: Polish & optimization**
- Improve error messages
- Add progress indicators
- Optimize auditor prompts
- Refine healing feedback

**Deliverables:**
- `docs/harry-user-guide.md`
- `docs/harry-developer-guide.md`
- `docs/harry-examples.md`
- `docs/harry-troubleshooting.md`

---

## TECHNICAL SPECIFICATIONS

### File Structure

```
.claude/
├── agents/
│   ├── agent-registry.json          # Master agent registry (Harry updates)
│   ├── harry.md                     # Harry orchestrator
│   ├── create-meta-prompts.md       # Creator 1
│   ├── create-subagents.md          # Creator 2
│   ├── create-agent-skills.md       # Creator 3
│   ├── create-hooks.md              # Creator 4
│   ├── create-commands.md           # Creator 5
│   ├── skill-auditor.md             # Auditor 1 (from taches-cc)
│   ├── subagent-auditor.md          # Auditor 2 (from taches-cc)
│   └── slash-command-auditor.md     # Auditor 3 (from taches-cc)
│
├── skills/
│   ├── skill-rules.json             # Master skill registry (Harry updates)
│   └── [user-created skills]
│
├── hooks/
│   ├── hooks.json                   # Hook configurations (Harry updates)
│   └── [hook scripts]
│
└── commands/
    ├── harry.md                     # /harry command
    └── [user-created commands]
```

### Dependencies

**None - Pure Claude Code Ecosystem**

All operations use native Claude Code tools:
- Task (spawn subagents)
- AskUserQuestion (interactive menus)
- Read, Write, Edit (file operations)
- Grep, Glob (search operations)
- Bash (validation: jq, chmod)

### Performance Considerations

**Context Management:**
- Harry stays lightweight (orchestration only)
- Heavy work in isolated creator contexts
- Skills loaded progressively in creator agents
- Main Maestro context unaffected

**Token Efficiency:**
- Creator agents: 500-2000 tokens (isolated)
- Auditor agents: 400-800 tokens (isolated)
- Harry: ~300 tokens (orchestration)
- Total per creation: ~3000-5000 tokens (acceptable)

**Caching Opportunities:**
- Creator agent prompts (stable)
- Auditor agent prompts (stable)
- Skill content (progressive loading)
- Registry patterns (template-based)

---

## APPENDICES

### Appendix A: Conversion Checklist

**For each taches-cc skill → creator agent:**

- [ ] Copy SKILL.md content
- [ ] Remove skill-specific YAML (keep name, description)
- [ ] Add agent YAML (tools, model)
- [ ] Convert to <role>, <constraints>, <workflow>
- [ ] Remove user interaction (Harry handles)
- [ ] Add "return to Harry" step
- [ ] Define structured output format
- [ ] Test in isolation
- [ ] Add to agent-registry.json

### Appendix B: Quality Thresholds

**Audit Scores:**
- 85-100: Excellent (accept immediately)
- 70-84: Good (healing recommended)
- 50-69: Needs work (healing required)
- < 50: Poor (restart recommended)

**Healing Limits:**
- Default max iterations: 3
- User can extend or abort
- Each iteration must show improvement

### Appendix C: Registry Patterns

**Agent Triggers:**
- Domain keywords → triggers.keywords
- User intent → triggers.intentPatterns
- Operations → triggers.operations

**Skill Triggers:**
- Description keywords → promptTriggers
- Domain file types → fileTriggers
- Edge cases → skipConditions

### Appendix D: Migration Path

**From taches-cc-resources-main:**

```
taches-cc-resources-main/
├── skills/create-*.md          → .claude/agents/create-*.md
├── agents/*-auditor.md         → .claude/agents/*-auditor.md
├── commands/create-*.md        → Deprecated (agents replace)
└── docs/                       → Reference material
```

**Rationale:**
- Skills become agents (Maestro pattern)
- Auditors already agent-compatible
- Commands replaced by direct agent delegation
- Docs inform agent design

---

## CONCLUSION

This design provides a **complete, implementable specification** for the Harry wizard system within the Maestro framework. Key achievements:

1. **Full Resource Integration:** All taches-cc-resources-main content mapped to Maestro agents
2. **Pure Delegation:** Harry never executes, only orchestrates
3. **4-D Compliance:** Audit/healing loops enforce quality at every step
4. **Framework Agnostic:** No technology bias, user brings domain
5. **Self-Sustaining:** System can create and maintain itself
6. **Production-Ready:** Complete with testing, documentation, and edge case handling

**Next Steps:**
1. Review and approve design
2. Begin Phase 1 (Harry foundation)
3. Parallel development of creator agents (Phase 2)
4. Integrate auditors and healing (Phase 3)
5. Full system testing (Phase 4-5)
6. Documentation and launch (Phase 6)

**Estimated Timeline:** 7 weeks to production-ready system

**Risk Mitigation:**
- Each phase independently testable
- Incremental delivery (Harry → Creators → Auditors)
- Graceful degradation (manual fallback if automation fails)
- User always in control (AskUserQuestion gates)

The Harry wizard will transform Maestro from a fixed-component framework into a **self-evolving, user-extensible orchestration system** that maintains excellence through automated quality gates. 🎩✨
