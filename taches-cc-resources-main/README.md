# TÂCHES Claude Code Resources

A growing collection of my favourite custom Claude Code resources in one place.

## Installation

### Option 1: Plugin Install (Recommended)

```bash
# Add the marketplace
claude plugin marketplace add glittercowboy/taches-cc-resources

# Install the plugin
claude plugin install taches-cc-resources
```

Start a new Claude Code session to use the commands and skills.

### Option 2: Manual Install

```bash
# Clone the repo
git clone https://github.com/glittercowboy/taches-cc-resources.git
cd taches-cc-resources

# Install commands
cp commands/*.md ~/.claude/commands/

# Install skills
cp -r skills/* ~/.claude/skills/
```

Commands install globally to `~/.claude/commands/`. Skills install to `~/.claude/skills/`. Project-specific data (prompts, todos) lives in each project's working directory.

## Commands

### Meta-Prompting

Separate analysis from execution. Describe what you want in natural language, Claude generates a rigorous prompt, then runs it in a fresh sub-agent context.

- [`/create-prompt`](./commands/create-prompt.md) - Generate optimized prompts with XML structure
- [`/run-prompt`](./commands/run-prompt.md) - Execute saved prompts in sub-agent contexts

### Todo Management

Capture ideas mid-conversation without derailing current work. Resume later with full context intact.

- [`/add-to-todos`](./commands/add-to-todos.md) - Capture tasks with full context
- [`/check-todos`](./commands/check-todos.md) - Resume work on captured tasks

### Context Handoff

Create structured handoff documents to continue work in a fresh context. Reference with `@whats-next.md` to resume seamlessly.

- [`/whats-next`](./commands/whats-next.md) - Create handoff document for fresh context

### Create Extensions

Wrapper commands that invoke the skills below.

- [`/create-agent-skill`](./commands/create-agent-skill.md) - Create a new skill
- [`/create-meta-prompt`](./commands/create-meta-prompt.md) - Create staged workflow prompts
- [`/create-slash-command`](./commands/create-slash-command.md) - Create a new slash command
- [`/create-subagent`](./commands/create-subagent.md) - Create a new subagent
- [`/create-hook`](./commands/create-hook.md) - Create a new hook

### Audit Extensions

Invoke auditor subagents.

- [`/audit-skill`](./commands/audit-skill.md) - Audit skill for best practices
- [`/audit-slash-command`](./commands/audit-slash-command.md) - Audit command for best practices
- [`/audit-subagent`](./commands/audit-subagent.md) - Audit subagent for best practices

### Self-Improvement

- [`/heal-skill`](./commands/heal-skill.md) - Fix skills based on execution issues

## Agents

Specialized subagents used by the audit commands.

- [`skill-auditor`](./agents/skill-auditor.md) - Expert skill auditor for best practices compliance
- [`slash-command-auditor`](./agents/slash-command-auditor.md) - Expert slash command auditor
- [`subagent-auditor`](./agents/subagent-auditor.md) - Expert subagent configuration auditor

## Skills

### [Create Agent Skills](./skills/create-agent-skills/)

Build skills by describing what you want. Asks clarifying questions, researches APIs if needed, and generates properly structured skill files. When things don't work perfectly, `/heal-skill` analyzes what went wrong and updates the skill based on what actually worked.

Commands: `/create-agent-skill`, `/heal-skill`, `/audit-skill`

### [Create Meta-Prompts](./skills/create-meta-prompts/)

The skill-based evolution of the meta-prompting system. Builds prompts with structured outputs (research.md, plan.md) that subsequent prompts can parse. Adds automatic dependency detection to chain research → plan → implement workflows.

Commands: `/create-meta-prompt`

### [Create Slash Commands](./skills/create-slash-commands/)

Build commands that expand into full prompts when invoked. Describe the command you want, get proper YAML configuration with arguments, tool restrictions, and dynamic context loading.

Commands: `/create-slash-command`, `/audit-slash-command`

### [Create Subagents](./skills/create-subagents/)

Build specialized Claude instances that run in isolated contexts. Describe the agent's purpose, get optimized system prompts with the right tool access and orchestration patterns.

Commands: `/create-subagent`, `/audit-subagent`

### [Create Hooks](./skills/create-hooks/)

Build event-driven automation that triggers on tool calls, session events, or prompt submissions. Describe what you want to automate, get working hook configurations.

Commands: `/create-hook`

---

More resources coming soon.

---

**Community Ports:** [OpenCode](https://github.com/stephenschoettler/taches-oc-prompts)

—TÂCHES
