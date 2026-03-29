## Session Bootstrap

The Maestro conductor persona is loaded automatically via `"agent": "maestro"` in `.claude/settings.json`. This loads `.claude/agents/maestro.md` as a system-level instruction — that file is the single source of truth for conductor identity and behavior.

**CLAUDE.md is a reference manual, not a persona definition.** It documents the framework architecture, agent catalog, workflows, and configuration — but does not define who Maestro is or how it should behave. That responsibility belongs solely to `maestro.md`.

## Repository Overview

**Maestro** is an AI orchestration framework that implements Anthropic's 4-D methodology (Delegation, Description, Discernment, Diligence). It enables Claude to operate as a conductor that delegates work to specialized subagents, evaluates outputs through quality gates, and iterates until excellence is achieved.

**Core Principle:** Maestro orchestrates through delegation, not direct execution. Maestro does not assume, have bias, follow paradigms, or operate in any specific domain. Maestro is agnostic to language, framework, or methodology. All work is done by specialized subagents guided by progressive skills.

## Setup and Installation

```bash
# Install Bun (if not already installed)
curl -fsSL https://bun.sh/install | bash

# Install hook dependencies
cd .claude/hooks
bun install

# Verify hooks are working
bun run verify

# Test individual components
bun run test:agent-detection
bun run test:skill-detection
bun run test:evaluation-reminder
```

**Dependencies:** Bun >= 1.0.0, minimatch ^9.0.0

**Note:** Maestro uses Bun for all hook execution, providing 2.4x faster performance (23ms avg vs 56ms Node.js baseline).

## Framework Architecture

### Three-Layer System

1. **Hooks** (`.claude/hooks/*.{js,sh}`) - Event-driven automation
   - `maestro-agent-suggester.js`: Analyzes requests and suggests specialized agents (UserPromptSubmit)
   - `subagent-skill-discovery.js`: Suggests relevant skills for subagents (UserPromptSubmit)
   - `context-tracker.js`: Tracks active domain and last edited files (PostToolUse)
   - `work-tracker.sh`: Logs all file modifications to `.maestro-work-log.txt` (PostToolUse)
   - `evaluation-reminder.js`: Reminds to run 4-D evaluation (Stop)
   - `enforce-4d-evaluation.js`: Enforces mandatory 4-D quality gates on subagent outputs (Stop)
   - `subagent-error-reporter.js`: Captures subagent completion/failure metadata to `logs/subagent-runs.jsonl` (SubagentStop)
   - `delegation-logger.js`: Logs delegation completions with taskHash correlation to `logs/delegation.jsonl` (PostToolUse)
   - `diary-capture.js`: Captures session memory for diary entries (Stop)
   - `pre-delegation-validator.js`: Validates delegation context before subagent dispatch (PreToolUse)
   - `skill-extraction-detector.js`: Detects skill extraction patterns (UserPromptSubmit)
   - `statusline.sh`: Updates status line display (PostToolUse)

2. **Agents** (`.claude/agents/*.md`) - Specialized subagents for specific operations
   - `maestro.md`: Meta-conductor that orchestrates all other agents
   - `list.md`, `open.md`, `file-reader.md`, `file-writer.md`: File operations
   - `m-file-writer.md`: Resilient file writer with retry, ghost write detection, and verification (**Maestro MUST use m-file-writer instead of file-writer for all write delegations**)
   - `base-research.md`, `base-analysis.md`: Information gathering and evaluation
   - `4d-evaluation.md`: Quality assessment using 4-D framework (mandatory quality gate)
   - `fetch.md`: External data retrieval
   - `gemini-brain.md`: Context offloading for large-scale operations
   - `harry.md`: Meta-orchestrator for creating/updating framework components
   - `agent-refactorer.md`: Code refactoring specialist
   - `diary-writer.md`: Episodic session memory capture for learning and reflection
   - `reflector.md`: Diary analysis and CLAUDE.md improvement proposals
   - `excel.md`: Excel/spreadsheet data operations specialist
   - `agent-creator.md`: Agent creation, improvement, and registry optimization specialist
   - `ai-pulse.md`: Twitter/X AI news aggregation and digest generation
   - `figma.md`: Figma design operations and canvas manipulation
   - `ui-ux-designer.md`: Color theory, typography, layout, and WCAG compliance specialist
   - `communicator.md`: Inter-session messaging and registration

   **Internal Utility Agents** (invoked by Harry, not directly by users):
   - Creator agents: `create-agent.md` (skill generator), `create-commands.md`, `create-hooks.md`, `create-meta-prompts.md`, `create-subagents.md`
   - Auditor agents: `hook-auditor.md`, `skill-auditor.md`, `slash-command-auditor.md`, `subagent-auditor.md`

   **Debate Persona Agents** (specialized discussion agents):
   - `emilio.md`: Cross-functional integrator PM, leads with pragmatic constraints
   - `ludvig.md`: Pragmatic systems leader, leads with first principles
   - `nicola.md`: Systems-minded investigator-builder, leads with data and evidence

3. **Skills** (`.claude/skills/*/SKILL.md`) - Progressive guidance activated by context
   - Skills provide methodology and best practices to agents
   - Organized as: `SKILL.md` (overview <500 lines) + `assets/*.md` (deep dives <500 lines each)
   - Auto-activated via pattern matching in `skill-rules.json`
   - Available skill domains: list, open, read, write, fetch, base-research, base-analysis, 4d-evaluation, hallucination-detection, maestro-orchestration, delegater, ui-ux-design, ai-pulse, excel, figma, lighthouse

### Performance Optimization

**defer_loading with Smart Caching:**
- Reduces repetitive skill recommendations by 74% (cumulative across sessions)
- First encounter: Full skill information provided
- Subsequent encounters: Minimal/no output (skills cached)
- Session-aware: 30-minute timeout resets cache
- Domain-aware: Track recommendations by work context

Benefits:
- 74% token reduction across multi-prompt sessions
- Faster response times (less context pollution)
- Better UX (relevant info when needed, clean thereafter)

See: `docs/DEFER_LOADING_USER_GUIDE.md` for details

**Bun Runtime Performance:**
- 2.4x faster hook execution with Bun (23ms avg vs 56ms Node.js baseline)
- Faster JSON parsing and module loading
- Drop-in replacement for Node.js with full API compatibility
- All hooks tested and verified with Bun >= 1.0.0

### Configuration Files

- `.claude/agents/agent-registry.json`: Agent metadata with triggers, keywords, intent patterns
- `.claude/skills/skill-rules.json`: Skill activation rules with prompt/file triggers
- `.claude/context.json`: Runtime context tracking (active domain, last edited file, skill cache)
- `.claude/settings.json`: Hook configuration and event bindings

### Observability Layer

**Schemas** (`.claude/schemas/*.json`) - JSONL log format contracts:
- `delegation-log.json`: Delegation completion events (timestamp is completion, not dispatch)
- `subagent-runs-log.json`: Subagent lifecycle events (10 fields)
- `evaluation-history-log.json`: 4-D evaluation verdicts with taskHash correlation

**Live Logs** (`.claude/logs/*.jsonl`) - Runtime event streams:
- `delegation.jsonl`: PostToolUse/Agent completions with taskHash
- `subagent-runs.jsonl`: SubagentStop completions with agentType

**Evaluation History** (`.claude/memory/evaluation-history.jsonl`):
- 4-D verdicts with taskHash for cross-log correlation

## Core Workflows

### Maestro Delegation Flow

```
User Request → Maestro Conductor (analyzes)
  ↓
  Specialized Agent (executes with skill guidance)
  ↓
  4-D Evaluation (quality gate)
  ↓
  EXCELLENT → Complete & Deliver
  NEEDS REFINEMENT → Re-delegate with coaching
```

### Inter-Agent Delegation Flow

Agents can delegate to other specialized agents when tasks require capabilities beyond their scope:

```
Agent A (receives task)
  ↓
  Recognizes need for specialized capability
  ↓
  Delegates to Agent B using Task tool + 3P format
  ↓
  Agent B executes and returns results
  ↓
  Agent A integrates results into final deliverable
```

**Common Delegation Patterns:**

- **base-research → fetch**: When research requires external web data or APIs
- **base-research → gemini-brain**: When files exceed 2000 lines or bulk operations needed
- **base-analysis → fetch**: When evaluation requires current external documentation for baseline
- **base-analysis → base-research**: When analysis needs comprehensive discovery phase
- **fetch → base-analysis**: When fetched data requires deep evaluation
- **fetch → m-file-writer**: When external data needs to be saved to files

**Requirements for Delegation:**

1. Agent must have Task tool in its tools list (frontmatter line 4)
2. Agent must use 3P format (PRODUCT, PROCESS, PERFORMANCE) when delegating
3. Agent must integrate delegated results into final report
4. Agent must cite delegated work with proper attribution

### The 3P Delegation Format

When delegating to agents, Maestro uses this structure:

**PRODUCT** (What to deliver):
- Clear task objective and specific targets
- Expected deliverables and acceptance criteria

**PROCESS** (How to work):
- Step-by-step approach
- Skills to discover and use
- Constraints and edge cases

**PERFORMANCE** (Excellence criteria):
- Behavioral expectations
- Evidence requirements (file paths, line numbers)
- Return format structure

### The 4-D Evaluation Framework

Every subagent output passes through these quality gates:

1. **Delegation**: Was the right agent/approach used?
2. **Description**: Is work complete and well-explained?
3. **Product Discernment**: Is it correct, elegant, complete? Does it solve the real problem?
4. **Process Discernment**: Was reasoning sound? Any gaps or shortcuts?
5. **Performance Discernment**: Meets excellence bar? (quality and elegance, NOT speed)

**Verdict:** Either `EXCELLENT` (accept) or `NEEDS REFINEMENT` (iterate with coaching)

## Activation Methods

### Mode 1: Explicit Activation
```bash
/maestro <your request>
```
Spawns the Maestro conductor who orchestrates through delegation.

### Mode 2: Auto-Detection (Always Active)
Hooks automatically suggest appropriate agents based on:
- Keyword matching (from agent-registry.json)
- Intent pattern detection (regex patterns)
- File path patterns (from context tracking)
- Operation types (create, read, update, analyze, etc.)

## Common Tasks

### Testing Hook Functionality
```bash
# Test agent detection
echo "analyze this code for bugs" | bun .claude/hooks/maestro-agent-suggester.js

# Test skill detection
echo "modify the authentication handler" | bun .claude/hooks/subagent-skill-discovery.js

# Test evaluation reminder
echo "SUBAGENT REPORT: Complete" | bun .claude/hooks/evaluation-reminder.js

# Run all hook tests
cd .claude/hooks && bun run test:agent-detection && bun run test:skill-detection
```

### Debugging Hooks
```bash
# Check file permissions
chmod +x .claude/hooks/*.js
chmod +x .claude/hooks/*.sh

# Validate JSON configurations
cat .claude/agents/agent-registry.json | jq '.'
cat .claude/skills/skill-rules.json | jq '.'

# Check hook dependencies
cd .claude/hooks && bun pm ls minimatch

# Reinstall dependencies if corrupted
cd .claude/hooks && bun install --force
```

### Understanding defer_loading Behavior

Skills are recommended intelligently:
- **First time in a domain:** Full skill descriptions and activation instructions
- **Continuing in same domain:** Skills available but not re-recommended (cached)
- **New domain or session:** Fresh recommendations appear

If you don't see expected skills:
```bash
# Reset skill cache to get fresh recommendations
rm .claude/context.json
```

Check which skills are currently cached:
```bash
cat .claude/context.json | jq '.skillTracking.recommended'
```

### Working with Agents

When creating or modifying agents:
- Agent files must be in `.claude/agents/*.md`
- Register in `agent-registry.json` with triggers (keywords, intentPatterns, operations)
- Use XML structure for clear section delineation
- Specify tool restrictions explicitly
- Include evidence requirements in delegation templates

### Working with Skills

When creating or modifying skills:
- Main file: `SKILL.md` (overview, <500 lines)
- Deep dives: `assets/*.md` (detailed patterns, <500 lines each)
- Register in `skill-rules.json` with triggers (promptTriggers, fileTriggers)
- Use progressive disclosure: show overview first, load assets on-demand
- Provide concrete examples and anti-patterns

## Key Principles

1. **Delegation First**: All work flows through specialized agents, never direct execution by Maestro
2. **Inter-Agent Delegation**: Agents can delegate to other agents when tasks require capabilities beyond their scope (e.g., base-research → fetch for web data, fetch → base-analysis for evaluation)
3. **Skills as Guidance**: Subagents discover and activate skills autonomously based on context
4. **Quality Gates**: Every output evaluated through 4-D framework before acceptance
5. **Iterative Refinement**: Iterate without limit until excellence achieved, never settle for "good enough"
6. **Framework Agnostic**: Zero bias toward any language, framework, or methodology
7. **Context Preservation with defer_loading**: Progressive disclosure keeps main context clean while enabling complex work. Skills recommended once per session/domain, then cached to reduce token overhead by 74%.
8. **Evidence-Based**: All claims must include proof with specific file paths and line numbers
9. **Resilient Writes**: Maestro MUST always delegate file writes to m-file-writer (not file-writer). The m-file-writer provides retry logic, ghost write detection, and mandatory read-after-write verification to prevent silent write failures.
10. **Observability**: All delegations, evaluations, and subagent runs are logged with taskHash correlation for debugging and compliance measurement.

## File Locations

- **Framework Core**: `.claude/` (agents, skills, hooks, commands)
- **Documentation**: `.claude/README.md` (quick start), root `CLAUDE.md` (this file)
- **Performance Docs**: `docs/DEFER_LOADING_USER_GUIDE.md`, `docs/DEFER_LOADING_DEVELOPER_GUIDE.md`
- **Work Logs**: `.maestro-work-log.txt` (git-ignored, tracks all file modifications)
- **Context Tracking**: `.claude/context.json` (runtime state, active domain, skill cache)
- **Observability Schemas**: `.claude/schemas/` (JSONL log format contracts)
- **Runtime Logs**: `.claude/logs/` (delegation, subagent-runs event streams)
- **Session Memory**: `.claude/memory/diary/` (episodic session capture for learning)
- **Slash Commands**: `.claude/commands/` (ai-pulse, diagnose, figma)

## Maestro Emoji Protocol

When Maestro is active, these emoji markers provide visual workflow tracking:

- 🎼 Analyzing request
- 📋 Planning delegation
- 📤 Delegating to agent
- 🔍 Evaluating output
- 🔄 Refining (iteration needed)
- ✅ Complete (excellent)

## Important Notes

- Hooks run automatically on events (UserPromptSubmit, PostToolUse, Stop)
- Agent suggestions are informational, not mandatory
- Skill activation is context-aware (prompt keywords + file patterns)
- All agent work must return to Maestro for 4-D evaluation
- Main conductor context stays clean; heavy processing happens in subagent contexts
- The framework is self-modifying: use `harry` agent to create/update components
- defer_loading reduces skill recommendation overhead by 74% across sessions
- Bun runtime provides 2.4x faster hook execution compared to Node.js
