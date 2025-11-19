# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.


## Project Overview

**Maestro** is a pure agnostic AI orchestration framework that implements Anthropic's 4-D methodology (Delegation, Description, Discernment, Diligence). It enables Claude to operate as a conductor that delegates work to specialized subagents, evaluates all outputs through quality gates, and iterates until excellence is achieved.

## Core Philosophy

### Maestro's Mandate
- **Maestro Never Writes Code** - Acts as conductor, not executor
- **Delegation First** - All work flows through specialized subagents
- **Skills as Guidance** - Subagents discover and use skills within their context
- **Quality Gates** - Every output passes through 4-D evaluation
- **Iterative Refinement** - Iterate until excellent, never settle for "good enough"
- **Framework Agnostic** - Zero bias toward any language, framework, or paradigm

### Three-Tier Architecture

```
User Request
    ↓
Maestro Conductor (orchestrates, evaluates, never codes)
    ↓
Subagents (execute tasks, discover skills, work autonomously)
    ↓
Skills (provide guidance, loaded progressively in subagent context)
```

## Repository Structure

```
maestro/
├── MAESTRO_BLUEPRINT.md           # Complete architecture specification (~1966 lines)
├── AGENT_DISCOVERY.md             # Agent discovery system documentation
├── maestro.md                     # Maestro conductor persona (to be created)
├── MAESTRO_SUBAGENT_PROTOCOL.md   # Delegation/evaluation protocol (to be created)
│
└── .claude/
    ├── settings.json              # Hook configuration
    ├── agents/                    # Subagent definitions
    │   ├── agent-registry.json    # Agent discovery registry
    │   ├── list.md                # Directory/file listing operations
    │   ├── open.md                # File reading with context preservation
    │   ├── read.md                # Deep file/codebase analysis
    │   ├── write.md               # Code and file modifications
    │   ├── fetch.md               # External data retrieval
    │   ├── base-research.md       # Information gathering & analysis
    │   ├── base-analysis.md       # Code/system evaluation
    │   ├── 4d-evaluation.md       # Quality assessment using 4-D framework
    │   └── skill-wizard.md        # Meta-agent for creating new skills
    │
    ├── skills/                    # Skill library (progressive disclosure)
    │   ├── skill-rules.json       # Skill discovery registry
    │   └── [skill-name]/
    │       ├── SKILL.md           # Main entry point (<500 lines)
    │       └── resources/         # Deep dive resources (<500 lines each)
    │           ├── methodology.md
    │           ├── patterns.md
    │           └── troubleshooting.md
    │
    └── hooks/                     # Automation hooks
        ├── maestro-agent-suggester.js      # Agent discovery (UserPromptSubmit)
        ├── subagent-skill-discovery.js     # Skill discovery (UserPromptSubmit)
        ├── work-tracker.sh                 # Track modifications (PostToolUse)
        └── evaluation-reminder.js          # Remind to evaluate (Stop)
```

## Implementation Phases

The Maestro framework is being implemented in 6 phases:

### Phase 1: Foundation (Core Framework)
- **Status**: Blueprint complete, implementation pending
- **Goal**: Establish Maestro conductor with delegation-only mandate
- **Key Files**:
  - `maestro.md` - Enhanced conductor persona
  - `MAESTRO_SUBAGENT_PROTOCOL.md` - Delegation/evaluation protocol

### Phase 2: Base Agents (Essential Workers)
- **Status**: Specification complete, implementation pending
- **Goal**: Create 8 base agents for fundamental operations
- **Agents**: List, Open, Read, Write, Fetch, BaseResearch, BaseAnalysis, 4D-Evaluation

### Phase 3: Base Skills (Agnostic Guidance)
- **Status**: Specification complete, implementation pending
- **Goal**: Create 8 base skills providing framework-agnostic guidance
- **Skills**: Matching each agent, following progressive disclosure (<500 lines)

### Phase 4: Discovery Systems
- **Status**: Architecture defined, implementation pending
- **Goal**: Implement hook system for automatic agent/skill activation
- **Components**:
  - Agent registry and discovery hook
  - Skill registry and discovery hook
  - Work tracking and evaluation reminders

### Phase 5: Skill-Wizard
- **Status**: Specification complete, implementation pending
- **Goal**: Enable users to create custom skills following Maestro patterns

### Phase 6: Polish & Documentation
- **Status**: Pending
- **Goal**: Complete documentation and example workflows

## Key Design Patterns

### Progressive Disclosure
Skills are structured to avoid context bloat:
- **SKILL.md**: <500 lines, overview + navigation
- **resources/*.md**: <500 lines each, deep dives loaded on-demand
- Main Maestro context stays clean (only orchestration)
- Heavy work happens in isolated subagent contexts

### Agent Discovery System
- `agent-registry.json` defines all agents and their triggers (keywords, intent patterns, operations)
- `maestro-agent-suggester.js` hook analyzes user requests and suggests appropriate agents
- Maestro receives suggestions before responding, ensuring systematic delegation

### Skill Discovery System
- `skill-rules.json` defines all skills and their triggers (keywords, intent, file patterns)
- `subagent-skill-discovery.js` hook analyzes subagent tasks and suggests relevant skills
- Subagents receive suggestions when spawned, enabling automatic skill activation

### 4-D Evaluation Gates
Every subagent output must pass through evaluation before acceptance:

**Product Discernment**: Is it correct, elegant, complete, solving the real problem?
**Process Discernment**: Was the reasoning sound, thorough, using appropriate techniques?
**Performance Discernment**: Meets excellence standards, simple yet powerful, fits codebase? (Note: "Performance" = quality/excellence, NOT execution speed)

## Technology Constraints

### Native Claude Ecosystem Only
- ✅ Task tool (spawn subagents)
- ✅ Skill tool (activate skills)
- ✅ Hooks (UserPromptSubmit, PostToolUse, Stop)
- ✅ Standard file tools (Read, Write, Edit, Glob, Grep)
- ✅ Bash, TodoWrite, AskUserQuestion

### No External Dependencies
- Scripts: Node.js (vanilla, minimal deps) + Bash
- Configuration: JSON (agent-registry.json, skill-rules.json, settings.json)
- Skills: Markdown with YAML frontmatter
- Agents: Markdown with instructions

### Minimal Node.js Dependencies
Only essential packages:
- `minimatch`: For glob pattern matching in skill triggers
- Everything else: Native Node.js (fs, path, JSON)

## Working with This Repository

### When Creating Agents
Follow the base agent specification in `MAESTRO_BLUEPRINT.md`:
1. Clear purpose and "When to Use" section
2. Skills to discover
3. Step-by-step autonomous execution instructions
4. Structured return format with evidence requirements
5. Constraints (work autonomously, use skills, return evidence)

### When Creating Skills
Follow progressive disclosure pattern:
1. SKILL.md must be <500 lines
2. Deep content goes in resources/*.md (<500 lines each)
3. Include YAML frontmatter with name and description
4. Provide Quick Start for 80% use cases
5. Reference resources for edge cases and deep dives
6. Must be framework-agnostic (no React/Vue/Express assumptions)

### When Creating Hooks
Follow Claude Code hook conventions:
1. Executable scripts (Node.js or Bash)
2. UserPromptSubmit: Context injection before response
3. PostToolUse: Track modifications after tool use
4. Stop: Reminders after response completion
5. Must be non-blocking and lightweight

### When Adding to Registries
**agent-registry.json**:
- Define triggers: keywords, intentPatterns, operations
- Set complexity: simple | medium | complex
- Set autonomy: high | medium | low
- Mark internal: true for Maestro-only agents

**skill-rules.json**:
- Define type: domain | guardrail
- Set enforcement: suggest | block | warn
- Set priority: critical | high | medium | low
- Define promptTriggers and fileTriggers
- Configure skipConditions if needed

## Important Principles

### Framework Agnosticism
- NEVER assume React, Vue, Angular, Express, Django, Rails, etc.
- Base components provide methodology, not tech-specific implementation
- Users extend via domain-specific skills (created through skill-wizard)
- Guidance applies universally across languages and frameworks

### Evidence-Based Verification
- Subagents must return proof (code snippets with file:line references)
- Evaluation requires evidence, not just assertions
- "Tests pass" means show the test output
- "Built successfully" means show the build output

### Refinement Culture
- First iteration rarely achieves excellence
- Evaluation failures trigger coaching feedback
- Re-delegation with specific, actionable refinements
- No limit on iterations - continue until excellent
- Transparency: User sees the refinement process

### Context Preservation
- Maestro context: Orchestration, delegation decisions, evaluation summaries
- Subagent context: Specific task, file contents, skills, heavy work
- Skills context: Progressive loading, on-demand resources
- Goal: Main context stays manageable even for complex multi-step work

## Reference Documents

All architectural decisions, specifications, and design patterns are documented in:

1. **MAESTRO_BLUEPRINT.md** - Complete framework architecture (~1966 lines)
   - Sections: What, Why, How, 4-D Methodology, Architecture, Base Components, Implementation Strategy, Technical Specifications
   - Contains detailed specifications for all agents, skills, hooks, and registries

2. **AGENT_DISCOVERY.md** - Agent discovery system deep dive (~300 lines)
   - How Maestro automatically determines which agent to use
   - Registry structure and trigger matching logic
   - Hook implementation details and flow diagrams

**When implementing any component, always reference the relevant section in MAESTRO_BLUEPRINT.md first.**
