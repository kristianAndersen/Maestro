# Maestro Framework - Quick Start Guide

**Version:** 1.0
**Purpose:** AI orchestration framework for Claude Code using delegation-first architecture

---

## What is Maestro?

Maestro is an AI orchestration framework that implements Anthropic's 4-D methodology (Delegation, Description, Discernment, Diligence). It enables Claude to operate as a conductor that delegates work to specialized subagents, evaluates all outputs through quality gates, and iterates until excellence is achieved.

**Core Principle:** Maestro never writes code directlyit orchestrates through delegation.

---

## Setup

**Prerequisites:** Bun >= 1.0.0

```bash
# 1. Install Bun (if not already installed)
curl -fsSL https://bun.sh/install | bash

# 2. Install dependencies (from hooks directory)
cd .claude/hooks
bun install

# 3. Verify hooks are working
bun run verify

# 4. Test individual components (optional)
bun run test:agent-detection    # Test agent auto-detection
bun run test:skill-detection     # Test skill auto-detection
bun run test:evaluation-reminder # Test evaluation reminders
```

**What gets installed:**
- `minimatch` (^9.0.3) - For glob pattern matching in skill triggers

**Performance:** Bun provides 2.4x faster hook execution compared to Node.js (23ms avg vs 56ms baseline).

That's it! The framework is now ready to use.

---


## Activation Methods

Maestro can operate in two modes:

### Mode 1: Slash Command (Explicit Activation) 🎼

Use the `/maestro` command to explicitly activate Maestro orchestration for your request:

```
/maestro analyze this codebase for security issues
```

This spawns the Maestro conductor who then:
1. Analyzes your request
2. Selects the appropriate specialized agent
3. Delegates with comprehensive 3P direction (Product, Process, Performance)
4. Evaluates the output through 4-D quality gates
5. Refines iteratively if needed until excellent

### Mode 2: Auto-Detection (Always Active) >

The framework includes hooks that automatically suggest appropriate agents:

- **Agent Auto-Detection** (`maestro-agent-suggester.js`): Analyzes your requests and suggests specialized agents
- **Skill Auto-Detection** (`subagent-skill-discovery.js`): Suggests relevant skills for subagents to use

When you make a request, you'll see suggestions like:

```
TPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPW
Q <🎼 MAESTRO AGENT SUGGESTION                                Q
`PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPc
Q RECOMMENDED AGENT: BaseResearch                            Q
Q CONFIDENCE: High (Score: 45/100)                           Q
Q ...                                                        Q
ZPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP]
```

---

## Current Configuration

This repository has the following Maestro components active:

### Hooks (Automatic Triggers)

**UserPromptSubmit** (runs before Claude responds):
- `maestro-agent-suggester.js` - Suggests which agent to delegate to (additive scoring + intent classification)
- `subagent-skill-discovery.js` - Suggests relevant skills for the task
- `skill-extraction-detector.js` - Detects skill extraction patterns

**PostToolUse** (runs after tool operations):
- `work-tracker.sh` - Logs all file modifications to `.maestro-work-log.txt`
- `context-tracker.js` - Tracks active domain and last edited file in `.claude/context.json`
- `delegation-logger.js` - Logs delegation completions with taskHash to `logs/delegation.jsonl`
- `statusline.sh` - Updates status line display
- `regression-warning.js` - Warns when routing-critical files are modified

**PreToolUse** (runs before tool execution):
- `pre-delegation-validator.js` - Validates delegation context before subagent dispatch

**Stop** (runs after Claude completes response):
- `evaluation-reminder.js` - Reminds to run 4-D evaluation on completed work
- `enforce-4d-evaluation.js` - Enforces mandatory 4-D quality gates on subagent outputs
- `diary-capture.js` - Captures session memory for diary entries

**SubagentStop** (runs when subagent completes):
- `subagent-error-reporter.js` - Captures subagent completion/failure metadata to `logs/subagent-runs.jsonl`

**PreCompact** (runs before context compaction):
- `pre-compact-diary.js` - Captures working context before compaction to diary staging

### Available Agents

**Core Operations:**
- **list** - Directory/file listing operations
- **open** - File reading with context preservation
- **file-reader** - Deep file/codebase analysis
- **m-file-writer** - Resilient file writer with retry and verification (preferred for all writes)
- **file-writer** - Basic code and file modifications

**Research & Analysis:**
- **base-research** - Information gathering & exploration
- **base-analysis** - Code/system evaluation
- **4d-evaluation** - Quality assessment (mandatory quality gate)

**Specialized:**
- **fetch** - External data retrieval (APIs, web resources)
- **gemini-brain** - Context offloading for large-scale operations
- **excel** - Excel/spreadsheet data operations
- **ai-pulse** - Twitter/X AI news aggregation
- **figma** - Figma design operations and canvas manipulation
- **ui-ux-designer** - Color theory, typography, layout, WCAG compliance

**Framework:**
- **harry** - Meta-orchestrator for creating/updating framework components
- **agent-refactorer** - Code refactoring specialist
- **agent-creator** - Agent creation and registry optimization

**Memory & Learning:**
- **diary-writer** - Episodic session memory capture
- **reflector** - Diary analysis and CLAUDE.md improvement proposals

**Communication:**
- **communicator** - Inter-session messaging and registration

**Debate Personas:**
- **emilio** - Cross-functional integrator PM
- **ludvig** - Pragmatic systems leader, first principles
- **nicola** - Systems-minded investigator, data-driven

### Available Skills

Skills provide progressive guidance to agents:

- **list** - Directory enumeration methodology
- **open** - File reading best practices
- **read** - Deep analysis patterns
- **write** - Code modification guidance
- **fetch** - External data retrieval patterns
- **base-research** - Research methodology
- **base-analysis** - Evaluation frameworks
- **4d-evaluation** - Quality assessment criteria
- **hallucination-detection** - Prevents AI hallucinations in code
- **maestro-orchestration** - Multi-agent delegation guidance
- **delegater** - Cross-agent coordination patterns
- **ui-ux-design** - Design systems, color theory, typography
- **ai-pulse** - AI news aggregation methodology
- **excel** - Spreadsheet data operations
- **figma** - Figma canvas operations
- **lighthouse** - Web performance auditing

---

## Verification

### Test if Maestro is Active

1. **Check for Maestro persona:**
   - Ask: "What's your role?"
   - Expected: "I am Maestro, an AI orchestration conductor..."
   - If different: Activate via `/maestro` command

2. **Test agent detection:**
   ```bash
   echo "analyze this code for bugs" | bun .claude/hooks/maestro-agent-suggester.js
   ```
   Expected: Agent suggestion box appears

3. **Test skill detection:**
   ```bash
   echo "modify the authentication handler" | bun .claude/hooks/subagent-skill-discovery.js
   ```
   Expected: Skill recommendations appear

4. **Test evaluation reminder:**
   ```bash
   echo "SUBAGENT REPORT: Complete" | bun .claude/hooks/evaluation-reminder.js
   ```
   Expected: Evaluation reminder box appears

### Run Regression Suite

```bash
# Full regression (336 prompts, ~2 min)
bun .claude/hooks/run-regression.js
```

Thresholds: FP must be 0%, Precision must be >= 85%. Exit code 1 on failure.

A git pre-commit hook automatically gates commits that modify `agent-registry.json` or `maestro-agent-suggester.js`.

---

## How It Works

### The Delegation Flow

```

   User Request
          ,

           🎼

 Maestro Conductor
 (Analyzes request)
          ,

           🎼

 Specialized Agent
 (Executes work)
          ,

           🎼

 4-D Evaluation
 (Quality gate)
          ,

          4
      🎼         🎼
  EXCELLENT  NEEDS REFINEMENT



                (Iterate with coaching)

      🎼                🎼

  Complete & Deliver

```

### The 3P Delegation Format

Maestro delegates to agents using the 3P framework:

**PRODUCT** (What to deliver):
- Clear task objective
- Specific targets
- Expected deliverables
- Acceptance criteria

**PROCESS** (How to work):
- Step-by-step approach
- Skills to discover
- Considerations and constraints
- Edge cases to handle

**PERFORMANCE** (Excellence criteria):
- Behavioral expectations
- Evidence requirements
- Return format structure

### The 4-D Evaluation Framework

Every subagent output passes through 4-D quality gates:

1. **Product Discernment** (What was built):
   - Is it correct? (logic sound, edge cases handled)
   - Is it elegant? (simple yet powerful)
   - Is it complete? (no missing pieces)
   - Does it solve the real problem?

2. **Process Discernment** (How it was built):
   - Was the reasoning sound?
   - Any gaps or shortcuts?
   - Were appropriate techniques used?

3. **Performance Discernment** (Excellence standards):
   - Meets excellence bar (not "good enough")?
   - Simple yet powerful?
   - Fits codebase patterns?

**Verdict:** Either EXCELLENT (accept) or NEEDS REFINEMENT (iterate with coaching)

---

## Progressive Disclosure

Maestro preserves context through three-tier architecture:

1. **Maestro Context** (Main):
   - Orchestration logic only
   - Delegation decisions
   - Evaluation summaries

2. **Subagent Context** (Isolated):
   - Task-specific work
   - Skill activation
   - Heavy processing

3. **Skill Resources** (On-Demand):
   - SKILL.md (<500 lines - overview)
   - assets/*.md (<500 lines each - deep dives)

This keeps the main context clean while enabling complex multi-step work.

---

## Troubleshooting

### Hooks Not Triggering

1. Check file permissions:
   ```bash
   chmod +x .claude/hooks/*.js
   chmod +x .claude/hooks/*.sh
   ```

2. Verify hooks configuration in `.claude/settings.json`

3. Test hooks individually (see Verification section above)

### Agent Detection Not Working

1. Verify agent-registry.json is valid:
   ```bash
   cat .claude/agents/agent-registry.json | jq '.'
   ```

2. Test detection manually:
   ```bash
   echo "your request here" | bun .claude/hooks/maestro-agent-suggester.js
   ```

### Skill Detection Not Working

1. Verify skill-rules.json is valid:
   ```bash
   cat .claude/skills/skill-rules.json | jq '.'
   ```

2. Check if minimatch dependency is installed:
   ```bash
   bun pm ls minimatch
   ```

3. If missing, install dependencies:
   ```bash
   bun install
   ```

### Bun-Specific Issues

If you experience issues with Bun:

1. Verify Bun version:
   ```bash
   bun --version  # Should be >= 1.0.0
   ```

2. Run hooks with Bun:
   ```bash
   bun .claude/hooks/maestro-agent-suggester.js
   ```

3. Update Bun to latest version:
   ```bash
   bun upgrade
   ```

---

## Next Steps

1. **Try Maestro Mode**: Run `/maestro` and give it a task
2. **Observe the Flow**: Watch delegation → execution → evaluation → refinement
3. **Explore Agents**: Check `.claude/agents/*.md` to see what each agent does
4. **Explore Skills**: Check `.claude/skills/*/SKILL.md` for guidance patterns
5. **Run Regression**: Execute `bun .claude/hooks/run-regression.js` to verify routing quality

---

## Framework Principles

**Delegation First** - All work flows through specialized agents
**Skills as Guidance** - Subagents discover and use skills autonomously
**Quality Gates** - Every output evaluated before acceptance
**Iterative Refinement** - Iterate until excellent, never settle
**Framework Agnostic** - Zero bias toward any language or framework
**Context Preservation** - Progressive disclosure keeps main context clean
**Evidence-Based** - All claims must be proven with references

---

## Documentation

- **CLAUDE.md** - Project overview and core philosophy
- **docs/DEFER_LOADING_USER_GUIDE.md** - Performance optimization guide
- **docs/skill-loading-architecture.md** - Skill system architecture
- **.claude/agents/maestro.md** - Maestro conductor implementation
- **.claude/agents/agent-registry.json** - Agent auto-detection configuration
- **.claude/docs/dataset-refresh-protocol.md** - Regression corpus maintenance

---

**Questions?** Check the documentation above or ask Maestro directly via `/maestro`.
