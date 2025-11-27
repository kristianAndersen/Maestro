# Maestro

> An AI orchestration framework that makes Claude Code operate like a symphony conductor - delegating work to specialized agents, evaluating outputs through quality gates, and iterating until excellence is achieved.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org)
[![Claude Code](https://img.shields.io/badge/Claude-Code-orange.svg)](https://claude.ai/code)

---

## Table of Contents

- [What is Maestro?](#what-is-maestro)
- [Key Features](#key-features)
- [Quick Start](#quick-start)
- [How It Works](#how-it-works)
- [Architecture](#architecture)
- [Usage](#usage)
- [Available Agents & Skills](#available-agents--skills)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)
- [Documentation](#documentation)
- [Contributing](#contributing)

---

## What is Maestro?

**Maestro** is an AI orchestration framework built on Anthropic's **4-D methodology** (Delegation, Description, Discernment, Diligence). Instead of having Claude Code execute tasks directly, Maestro acts as a conductor that:

1. **Analyzes** your request
2. **Delegates** to specialized subagents
3. **Evaluates** outputs through rigorous quality gates
4. **Iterates** until excellence is achieved

**Core Principle:** Maestro never writes code directly - it orchestrates through delegation.

### Why Maestro?

- **Quality First**: Every output passes through mandatory 4-D quality gates before acceptance
- **Specialized Expertise**: Task-specific agents (file operations, research, analysis, refactoring) instead of one-size-fits-all
- **Context Preservation**: Smart caching reduces token overhead by 74% across sessions
- **Iterative Excellence**: Refines work until it meets excellence standards, never settling for "good enough"
- **Framework Agnostic**: Zero bias toward any language, framework, or methodology

---

## Key Features

### Intelligent Agent Delegation
Automatically detects task intent and recommends the most appropriate specialized agent for the job.

### Progressive Skill Discovery
Context-aware skill activation provides agents with just-in-time guidance and best practices.

### 4-D Quality Gates
Every deliverable evaluated across four dimensions:
- **Product Discernment**: Is it correct, elegant, and complete?
- **Process Discernment**: Was the reasoning sound?
- **Performance Discernment**: Does it meet excellence standards?
- **Delegation Discernment**: Was the right approach used?

### Smart Caching with defer_loading
Reduces repetitive skill recommendations by 74% through session-aware, domain-aware caching.

### Event-Driven Automation
Hooks trigger automatically on:
- **UserPromptSubmit**: Agent and skill suggestions
- **PostToolUse**: Work tracking and context updates
- **Stop**: Evaluation reminders and quality enforcement

---

## Quick Start

### Prerequisites

- **Node.js** >= 18.0.0
- **Claude Code** (from [claude.ai/code](https://claude.ai/code))

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/kristianAndersen/Maestro.git
cd Maestro

# 2. Install hook dependencies
cd .claude/hooks
npm install

# 3. Verify the installation
npm run verify

# 4. (Optional) Test individual components
npm run test:agent-detection
npm run test:skill-detection
npm run test:evaluation-reminder
```

That's it! The framework is ready to use.

### First Steps

Try activating Maestro with a task:

```bash
/maestro analyze this codebase for security issues
```

Watch as Maestro:
1. Analyzes the request
2. Delegates to the appropriate agent (likely `base-analysis`)
3. The agent executes with skill guidance
4. Output is evaluated through 4-D quality gates
5. Iterates if refinement is needed

---

## How It Works

### The Delegation Flow

```
User Request
     |
     v
Maestro Conductor
     |
     | (Analyzes request)
     | (Plans delegation)
     |
     v
Specialized Agent
     |
     | (Discovers skills)
     | (Executes work)
     |
     v
4-D Evaluation
(Quality Gate)
     |
     +--------+--------+
     |                 |
     v                 v
EXCELLENT      NEEDS REFINEMENT
     |                 |
     v                 |
Complete              |
& Deliver             |
                      |
                      v
                Re-delegate
                with coaching
```

### The 3P Delegation Format

Maestro uses a structured delegation framework when assigning work to agents:

**PRODUCT** (What to deliver):
- Clear task objective and specific targets
- Expected deliverables and acceptance criteria

**PROCESS** (How to work):
- Step-by-step approach
- Skills to discover and use
- Constraints and edge cases to handle

**PERFORMANCE** (Excellence criteria):
- Behavioral expectations
- Evidence requirements (file paths, line numbers)
- Return format structure

### The 4-D Evaluation Framework

Every subagent output is evaluated across four dimensions:

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

4. **Delegation Discernment**:
   - Was the right agent/approach used?
   - Is work complete and well-explained?

**Verdict:** Either `EXCELLENT` (accept) or `NEEDS REFINEMENT` (iterate with coaching)

---

## Architecture

Maestro uses a **three-layer architecture** for context preservation and intelligent work orchestration:

### 1. Hooks Layer (Event-Driven Automation)

Located in `.claude/hooks/*.{js,sh}`, hooks trigger automatically on Claude Code events:

| Hook | Event | Purpose |
|------|-------|---------|
| `maestro-agent-suggester.js` | UserPromptSubmit | Analyzes requests and suggests specialized agents |
| `subagent-skill-discovery.js` | UserPromptSubmit | Suggests relevant skills for subagents |
| `context-tracker.js` | PostToolUse | Tracks active domain and last edited files |
| `work-tracker.sh` | PostToolUse | Logs all file modifications |
| `evaluation-reminder.js` | Stop | Reminds to run 4-D evaluation |
| `enforce-4d-evaluation.js` | Stop | Enforces mandatory quality gates |

### 2. Agents Layer (Specialized Subagents)

Located in `.claude/agents/*.md`, each agent specializes in specific operations:

**Core Agents:**
- `maestro.md` - Meta-conductor that orchestrates all other agents
- `file-reader.md` - Deep file/codebase analysis
- `file-writer.md` - Code and file modifications
- `base-research.md` - Information gathering and exploration
- `base-analysis.md` - Code/system evaluation
- `4d-evaluation.md` - Quality assessment (mandatory quality gate)
- `agent-refactorer.md` - Code refactoring specialist

**Utility Agents:**
- `list.md`, `open.md` - File operations
- `fetch.md` - External data retrieval
- `gemini-brain.md` - Context offloading for large-scale operations
- `harry.md` - Meta-orchestrator for creating/updating framework components

**Internal Agents** (invoked by Harry):
- Creator agents: `create-agent.md`, `create-hooks.md`, etc.
- Auditor agents: `hook-auditor.md`, `skill-auditor.md`, etc.

### 3. Skills Layer (Progressive Guidance)

Located in `.claude/skills/*/SKILL.md`, skills provide just-in-time methodology and best practices:

- **Structure**: `SKILL.md` (overview <500 lines) + `assets/*.md` (deep dives <500 lines each)
- **Activation**: Auto-triggered via pattern matching in `skill-rules.json`
- **Progressive Disclosure**: Overview first, load detailed assets on-demand
- **Smart Caching**: Skills recommended once per session/domain, then cached

**Available Skills:**
- `list`, `open`, `read`, `write` - File operation patterns
- `fetch` - External data retrieval patterns
- `base-research`, `base-analysis` - Research and evaluation frameworks
- `4d-evaluation` - Quality assessment criteria
- `hallucination-detection` - Prevents AI hallucinations in code

### Performance Optimization: defer_loading

Maestro uses smart caching to reduce token overhead:

- **First encounter**: Full skill information provided
- **Subsequent encounters**: Minimal/no output (skills cached)
- **Session-aware**: 30-minute timeout resets cache
- **Domain-aware**: Track recommendations by work context

**Result**: 74% token reduction across multi-prompt sessions

---

## Usage

### Mode 1: Explicit Activation (Slash Command)

Use the `/maestro` command to explicitly activate Maestro orchestration:

```bash
/maestro analyze this codebase for security issues
/maestro refactor the authentication module for better testability
/maestro research best practices for API rate limiting
```

### Mode 2: Auto-Detection (Always Active)

The framework automatically suggests agents based on your request:

```
+------------------------------------------------------+
| MAESTRO AGENT SUGGESTION                             |
+------------------------------------------------------+
| RECOMMENDED AGENT: BaseResearch                      |
| CONFIDENCE: High (Score: 45/100)                     |
|                                                      |
| REASONING:                                           |
| - Keyword match: "research" (weight: 10)             |
| - Intent pattern: research/exploration               |
| - Operation type: information gathering              |
+------------------------------------------------------+
```

Suggestions are informational - you can choose to use them or proceed differently.

---

## Available Agents & Skills

### Agents

| Agent | Purpose | When to Use |
|-------|---------|-------------|
| **maestro** | Meta-conductor | Orchestrating complex multi-step workflows |
| **file-reader** | Deep analysis | Understanding codebases, complex files |
| **file-writer** | Code modifications | Creating/updating files with safety checks |
| **base-research** | Information gathering | Exploring unknowns, learning patterns |
| **base-analysis** | Evaluation | Assessing code quality, finding issues |
| **4d-evaluation** | Quality gates | Evaluating deliverables for excellence |
| **agent-refactorer** | Code refactoring | Improving code structure and design |
| **fetch** | External data | Retrieving data from APIs, URLs |
| **gemini-brain** | Large-scale ops | Context offloading for massive codebases |
| **harry** | Framework updates | Creating/modifying Maestro components |

### Skills

| Skill | Purpose | Auto-Activates When |
|-------|---------|---------------------|
| **read** | File analysis patterns | Analyzing files, understanding code |
| **write** | Modification guidance | Creating/modifying files |
| **list** | Directory enumeration | Listing files and directories |
| **fetch** | External data retrieval | Fetching from APIs or URLs |
| **base-research** | Research methodology | Conducting research tasks |
| **base-analysis** | Evaluation frameworks | Analyzing code/systems |
| **4d-evaluation** | Quality criteria | Running quality assessments |
| **hallucination-detection** | Accuracy checks | Preventing AI hallucinations |

---

## Configuration

### Key Configuration Files

Located in `.claude/`:

- **`agents/agent-registry.json`**: Agent metadata, triggers, keywords, intent patterns
- **`skills/skill-rules.json`**: Skill activation rules with prompt/file triggers
- **`context.json`**: Runtime context tracking (active domain, skill cache)
- **`settings.json`**: Hook configuration and event bindings

### Customizing Agent Detection

Edit `.claude/agents/agent-registry.json`:

```json
{
  "agentId": "my-custom-agent",
  "name": "MyCustomAgent",
  "keywords": ["custom", "special"],
  "intentPatterns": ["custom.*task"],
  "operations": ["custom-operation"],
  "baseScore": 10
}
```

### Customizing Skill Activation

Edit `.claude/skills/skill-rules.json`:

```json
{
  "skillId": "my-skill",
  "promptTriggers": ["custom keyword"],
  "fileTriggers": ["*.custom"],
  "defer_loading": true
}
```

---

## Troubleshooting

### Hooks Not Triggering

1. **Check file permissions:**
   ```bash
   chmod +x .claude/hooks/*.js
   chmod +x .claude/hooks/*.sh
   ```

2. **Verify hooks configuration:**
   ```bash
   cat .claude/settings.json | jq '.'
   ```

3. **Test hooks manually:**
   ```bash
   echo "analyze this code" | node .claude/hooks/maestro-agent-suggester.js
   ```

### Agent Detection Not Working

1. **Validate agent registry:**
   ```bash
   cat .claude/agents/agent-registry.json | jq '.'
   ```

2. **Test detection manually:**
   ```bash
   echo "your request here" | node .claude/hooks/maestro-agent-suggester.js
   ```

### Skill Detection Not Working

1. **Validate skill rules:**
   ```bash
   cat .claude/skills/skill-rules.json | jq '.'
   ```

2. **Check minimatch dependency:**
   ```bash
   cd .claude/hooks && npm list minimatch
   ```

3. **Reinstall dependencies if needed:**
   ```bash
   cd .claude/hooks && npm install
   ```

### Skills Not Being Recommended

Skills are cached after first recommendation. To reset the cache:

```bash
rm .claude/context.json
```

Check currently cached skills:

```bash
cat .claude/context.json | jq '.skillTracking.recommended'
```

---

## Documentation

- **[CLAUDE.md](CLAUDE.md)** - Comprehensive project overview and philosophy
- **[.claude/README.md](.claude/README.md)** - Quick start guide
- **[docs/DEFER_LOADING_USER_GUIDE.md](docs/DEFER_LOADING_USER_GUIDE.md)** - Performance optimization guide
- **[docs/DEFER_LOADING_DEVELOPER_GUIDE.md](docs/DEFER_LOADING_DEVELOPER_GUIDE.md)** - Developer guide for defer_loading
- **[.claude/agents/maestro.md](.claude/agents/maestro.md)** - Maestro conductor implementation

---

## Contributing

Maestro is a self-modifying framework. To create or update components:

### Creating New Agents

Use the `harry` meta-orchestrator:

```bash
/maestro delegate to harry: create a new agent for [purpose]
```

### Creating New Skills

```bash
/maestro delegate to harry: create a new skill for [domain]
```

### Creating New Hooks

```bash
/maestro delegate to harry: create a hook that [functionality]
```

### Manual Creation

1. **Agents**: Add `.md` file to `.claude/agents/`, register in `agent-registry.json`
2. **Skills**: Add `SKILL.md` to `.claude/skills/[skill-name]/`, register in `skill-rules.json`
3. **Hooks**: Add `.js` or `.sh` to `.claude/hooks/`, register in `settings.json`

---

## Framework Principles

1. **Delegation First**: All work flows through specialized agents, never direct execution
2. **Skills as Guidance**: Subagents discover and activate skills autonomously based on context
3. **Quality Gates**: Every output evaluated through 4-D framework before acceptance
4. **Iterative Refinement**: Iterate until excellent, never settle for "good enough"
5. **Framework Agnostic**: Zero bias toward any language, framework, or methodology
6. **Context Preservation**: Progressive disclosure keeps main context clean while enabling complex work
7. **Evidence-Based**: All claims must include proof with specific file paths and line numbers

---

## License

[MIT](LICENSE)

---

## Questions?

Check the [documentation](#documentation) above or ask Maestro directly:

```bash
/maestro What's the best way to [your question]?
```

---

**Built with ❤️ using [Claude Code](https://claude.ai/code)**
