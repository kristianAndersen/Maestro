# Maestro Component Templates

This directory contains templates for creating Maestro framework components.

## Available Templates

### Agent (Tier 1) - Domain Coordinators
- **AGENT_TEMPLATE.md** - Implementation file structure
- **AGENT_MANIFEST_TEMPLATE.json** - Metadata for auto-discovery

**Required Files:**
```
.claude/agents/
├── agent-name.md              # Implementation (use AGENT_TEMPLATE.md)
├── agent-name.agent.json      # Manifest (use AGENT_MANIFEST_TEMPLATE.json)
└── agent-registry.json        # Add entry here
```

### Skill (Tier 2) - Operation Orchestrators
- **SKILL_TEMPLATE.md** - Implementation file structure
- **SKILL_MANIFEST_TEMPLATE.json** - Metadata for auto-discovery (to be created)

**Required Files:**
```
.claude/skills/skill-name/
├── SKILL.md                   # Implementation (use SKILL_TEMPLATE.md)
├── skill-name.skill.json      # Manifest (use SKILL_MANIFEST_TEMPLATE.json)
└── ../skill-rules.json        # Add entry here
```

### Micro-Skill (Tier 3) - Pure Execution
- **MICRO_SKILL_TEMPLATE.md** - Implementation file structure
- **MICRO_SKILL_MANIFEST_TEMPLATE.json** - Metadata for auto-discovery (to be created)

**Required Files:**
```
.claude/skills/micro-skills/micro-skill-name/
├── SKILL.md                        # Implementation (use MICRO_SKILL_TEMPLATE.md)
├── micro-skill-name.skill.json     # Manifest (use MICRO_SKILL_MANIFEST_TEMPLATE.json)
└── ../../skill-rules.json          # Add entry here
```

### Command - User Workflows
- **COMMAND_TEMPLATE.md** - Slash command structure

**Required Files:**
```
.claude/commands/
└── command-name.md            # Implementation (use COMMAND_TEMPLATE.md)
```

## Dual-File Pattern

**All agents, skills, and micro-skills follow the dual-file pattern:**

1. **Implementation File** (.md) - The actual component logic and documentation
2. **Manifest File** (.json) - Metadata for discovery hooks and activation

### Why Dual-File?

**Benefits:**
- **Self-Contained**: Metadata travels with component
- **Discovery**: Rich metadata for auto-suggestion hooks
- **Versioning**: Track component versions independently
- **Consistency**: Same pattern across all tiers
- **Maintenance**: Update metadata without editing central registry

### Manifest vs Registry

**Manifest File** (e.g., `agent-name.agent.json`):
- Detailed component metadata
- Trigger patterns and keywords
- Capabilities and delegation info
- Lives with the component

**Registry File** (e.g., `agent-registry.json`):
- Central index of all components
- Discovery hook configuration
- Activation rules
- Single source for hook system

**Both are required** - they serve different purposes!

## Usage Workflow

### Creating a New Agent

1. Copy `AGENT_TEMPLATE.md` to `.claude/agents/your-agent.md`
2. Copy `AGENT_MANIFEST_TEMPLATE.json` to `.claude/agents/your-agent.agent.json`
3. Fill in both files with your agent details
4. Add entry to `.claude/agents/agent-registry.json`

### Creating a New Skill

1. Create directory `.claude/skills/your-skill/`
2. Copy `SKILL_TEMPLATE.md` to `.claude/skills/your-skill/SKILL.md`
3. Copy `SKILL_MANIFEST_TEMPLATE.json` to `.claude/skills/your-skill/your-skill.skill.json`
4. Fill in both files with your skill details
5. Add entry to `.claude/skills/skill-rules.json`

### Creating a New Micro-Skill

1. Create directory `.claude/skills/micro-skills/your-micro-skill/`
2. Copy `MICRO_SKILL_TEMPLATE.md` to the directory as `SKILL.md`
3. Copy `MICRO_SKILL_MANIFEST_TEMPLATE.json` to the directory as `your-micro-skill.skill.json`
4. Fill in both files with your micro-skill details
5. Add entry to `.claude/skills/skill-rules.json`

### Creating a New Command

1. Copy `COMMAND_TEMPLATE.md` to `.claude/commands/your-command.md`
2. Fill in the command details
3. No manifest or registry entry needed (user-invoked)

## Quick Reference

| Component | Implementation Template | Manifest Template | Registry |
|-----------|------------------------|-------------------|----------|
| Agent (T1) | AGENT_TEMPLATE.md | AGENT_MANIFEST_TEMPLATE.json | agent-registry.json |
| Skill (T2) | SKILL_TEMPLATE.md | SKILL_MANIFEST_TEMPLATE.json | skill-rules.json |
| Micro-Skill (T3) | MICRO_SKILL_TEMPLATE.md | MICRO_SKILL_MANIFEST_TEMPLATE.json | skill-rules.json |
| Command | COMMAND_TEMPLATE.md | (none) | (none) |

## Companion Documents

- **PATTERNS_REFERENCE.md** - Detailed patterns and conventions
- **QUICK_DECISION_GUIDE.md** - Choose the right component type
- **MAESTRO_BLUEPRINT.md** - Complete framework architecture

---

**Last Updated**: 2025-11-18
**Template Version**: 1.0.0
