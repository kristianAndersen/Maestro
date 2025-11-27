# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

**Maestro** is an AI orchestration framework that implements Anthropic's 4-D methodology (Delegation, Description, Discernment, Diligence). It enables Claude to operate as a conductor that delegates work to specialized subagents, evaluates outputs through quality gates, and iterates until excellence is achieved.

**Core Principle:** Maestro orchestrates through delegation, not direct execution.

## Setup and Installation

```bash
# Install hook dependencies
cd .claude/hooks
npm install

# Verify hooks are working
npm run verify

# Test individual components
npm run test:agent-detection
npm run test:skill-detection
npm run test:evaluation-reminder
```

**Dependencies:** Node.js >= 18.0.0, minimatch ^9.0.0 (for glob pattern matching in hooks)

## Framework Architecture

### Three-Layer System

1. **Hooks** (`.claude/hooks/*.{js,sh}`) - Event-driven automation
   - `maestro-agent-suggester.js`: Analyzes requests and suggests specialized agents (UserPromptSubmit)
   - `subagent-skill-discovery.js`: Suggests relevant skills for subagents (UserPromptSubmit)
   - `context-tracker.js`: Tracks active domain and last edited files (PostToolUse)
   - `work-tracker.sh`: Logs all file modifications to `.maestro-work-log.txt` (PostToolUse)
   - `evaluation-reminder.js`: Reminds to run 4-D evaluation (Stop)
   - `enforce-4d-evaluation.js`: Enforces mandatory 4-D quality gates on subagent outputs (Stop)

2. **Agents** (`.claude/agents/*.md`) - Specialized subagents for specific operations
   - `maestro.md`: Meta-conductor that orchestrates all other agents
   - `list.md`, `open.md`, `file-reader.md`, `file-writer.md`: File operations
   - `base-research.md`, `base-analysis.md`: Information gathering and evaluation
   - `4d-evaluation.md`: Quality assessment using 4-D framework (mandatory quality gate)
   - `fetch.md`: External data retrieval
   - `gemini-brain.md`: Context offloading for large-scale operations
   - `harry.md`: Meta-orchestrator for creating/updating framework components
   - `agent-refactorer.md`: Code refactoring specialist

   **Internal Utility Agents** (invoked by Harry, not directly by users):
   - Creator agents: `create-agent.md`, `create-commands.md`, `create-hooks.md`, `create-meta-prompts.md`, `create-subagents.md`
   - Auditor agents: `hook-auditor.md`, `skill-auditor.md`, `slash-command-auditor.md`, `subagent-auditor.md`

3. **Skills** (`.claude/skills/*/SKILL.md`) - Progressive guidance activated by context
   - Skills provide methodology and best practices to agents
   - Organized as: `SKILL.md` (overview <500 lines) + `assets/*.md` (deep dives <500 lines each)
   - Auto-activated via pattern matching in `skill-rules.json`

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

### Configuration Files

- `.claude/agents/agent-registry.json`: Agent metadata with triggers, keywords, intent patterns
- `.claude/skills/skill-rules.json`: Skill activation rules with prompt/file triggers
- `.claude/context.json`: Runtime context tracking (active domain, last edited file, skill cache)
- `.claude/settings.json`: Hook configuration and event bindings

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
echo "analyze this code for bugs" | node .claude/hooks/maestro-agent-suggester.js

# Test skill detection
echo "modify the authentication handler" | node .claude/hooks/subagent-skill-discovery.js

# Test evaluation reminder
echo "SUBAGENT REPORT: Complete" | node .claude/hooks/evaluation-reminder.js
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
cd .claude/hooks && npm list minimatch
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
2. **Skills as Guidance**: Subagents discover and activate skills autonomously based on context
3. **Quality Gates**: Every output evaluated through 4-D framework before acceptance
4. **Iterative Refinement**: Iterate without limit until excellence achieved, never settle for "good enough"
5. **Framework Agnostic**: Zero bias toward any language, framework, or methodology
6. **Context Preservation with defer_loading**: Progressive disclosure keeps main context clean while enabling complex work. Skills recommended once per session/domain, then cached to reduce token overhead by 74%.
7. **Evidence-Based**: All claims must include proof with specific file paths and line numbers

## File Locations

- **Framework Core**: `.claude/` (agents, skills, hooks, commands)
- **Documentation**: `.claude/README.md` (quick start), root `CLAUDE.md` (this file)
- **Performance Docs**: `docs/DEFER_LOADING_USER_GUIDE.md`, `docs/DEFER_LOADING_DEVELOPER_GUIDE.md`
- **Work Logs**: `.maestro-work-log.txt` (git-ignored, tracks all file modifications)
- **Context Tracking**: `.claude/context.json` (runtime state, active domain, skill cache)

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