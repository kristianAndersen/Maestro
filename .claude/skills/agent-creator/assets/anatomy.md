# Agent Anatomy — Deep Reference

Full reference for Maestro agent file structure, XML sections, tool selection, and model selection.

---

## Complete File Structure

```
.claude/agents/agent-name.md
├── YAML frontmatter (name, description, tools, model)
└── Pure XML body
    ├── <role>               (required)
    ├── <constraints>        (required)
    ├── <workflow>           (required)
    ├── <output_format>      (required)
    ├── <success_criteria>   (required)
    ├── <activation_modes>   (optional — multiple invocation patterns)
    ├── <context>            (optional — loading external reference data)
    ├── <validation>         (optional — pre-completion checklists)
    ├── <examples>           (optional — illustrative scenarios)
    └── <error_handling>     (optional — failure modes and recovery)
```

---

## Frontmatter Reference

```yaml
---
name: lowercase-with-hyphens
description: What + when + keywords
tools: Read, Grep, Glob
model: sonnet
---
```

### `name`
- Lowercase with hyphens only
- Specific and unique (not `"helper"`, `"agent"`)
- Describes the domain: `"base-research"`, `"agent-creator"`, `"diary-writer"`

### `description`
This is the **primary discovery mechanism**. The maestro-agent-suggester and skill hooks match against it.

Must contain:
1. What the agent does (capability)
2. When to use it (trigger context)
3. Specific keywords users/orchestrators would type

**Good description:**
```
Maestro framework agent specialist. Creates new agents from scratch, improves existing
agents, and optimizes agent-registry.json entries for better triggering accuracy. Use
directly for quick agent edits without spinning up Harry, or Harry can delegate here
for focused agent file work. Activate when: creating .claude/agents/*.md, improving
an existing agent, fixing agent triggering issues. Keywords: create agent, build agent,
improve agent, fix agent, agent not triggering.
```

**Bad description:**
```
Helps with agent creation and related tasks.
```

### `tools` — Least-Privilege Selection

| Task type | Tools |
|-----------|-------|
| Read-only analysis | `Read, Grep, Glob` |
| Creates new files | `Read, Write, Grep, Glob` |
| Modifies existing files | `Read, Write, Edit, Grep, Glob` |
| Needs to delegate subtasks | Add `Task` |
| Needs web/external data | Add `WebFetch` or `WebSearch` |
| Needs shell execution | Add `Bash` (justify explicitly) |
| Asks clarifying questions | Add `AskUserQuestion` |

Never add `Task` "just in case" — only if the agent's workflow explicitly delegates to other agents.

### `model` — Selection Guide

| Model | Use when |
|-------|----------|
| `haiku` | Simple, single-step, fast tasks. Listing, simple transformations, quick lookups. |
| `sonnet` | Default for most agents. Multi-step workflows, medium complexity, judgment required. |
| `opus` | Deep reasoning, highest-stakes quality gates, complex analysis requiring maximum capability. |

---

## XML Body Sections

### `<role>` (required)

Defines the agent's expert identity. This shapes how it approaches all tasks.

**Pattern:** "You are a [expertise level] [domain] specialist. Your purpose is to [specific capability]."

**Good:**
```xml
<role>
You are an expert Maestro framework agent craftsman. You know agent anatomy inside-out —
frontmatter conventions, pure XML body structure, tool selection principles, model
selection trade-offs, and registry trigger patterns.
</role>
```

**Bad (anti-pattern):**
```xml
<role>
You are a helpful assistant that helps with agent-related tasks.
</role>
```

The bad version gives no domain expertise, no specialization signal, and no behavioral guidance.

---

### `<constraints>` (required, min 3 rules)

Hard behavioral boundaries using strong modal verbs.

```xml
<constraints>
- MUST use pure XML structure in agent bodies (no ## markdown headings as structure)
- MUST apply least-privilege tool selection
- NEVER create generic agents ("helpful assistant" is an anti-pattern)
- NEVER add Task tool unless the agent explicitly delegates to other agents
- ALWAYS validate XML structure before writing files
- ALWAYS update agent-registry.json when creating a new agent
</constraints>
```

Rule quality:
- Use MUST, NEVER, ALWAYS — not "should" or "try to"
- Each rule should prevent a specific failure mode
- Include the *why* when the constraint might seem arbitrary

---

### `<workflow>` (required)

Numbered step-by-step process. Agents follow this procedurally.

```xml
<workflow>

<step number="1" name="determine_operation">
Identify which operation is needed:
  CREATE   — New agent doesn't exist
  IMPROVE  — Existing agent needs enhancement
  OPTIMIZE — Fix triggering or registry entry
</step>

<step number="2" name="create_agent">
1. Gather domain and purpose
2. Design frontmatter (name, description, tools, model)
3. Write XML body sections in order
4. Write file to .claude/agents/{name}.md
5. Update agent-registry.json
</step>

</workflow>
```

Alternatively, a flat numbered list works for simpler agents:

```xml
<workflow>
1. Read the target file
2. Identify the specific issue
3. Apply the fix
4. Validate the result
</workflow>
```

Steps should be specific enough to follow without guessing. Avoid "review the situation and decide what to do."

---

### `<output_format>` (required)

Defines exactly what the agent returns. Prevents free-form responses that are hard to process downstream.

```xml
<output_format>
Return a structured report:

  OPERATION: [CREATE | IMPROVE | OPTIMIZE]
  AGENT: {name}
  FILE: {absolute path}

  CHANGES:
  - {specific change}: {reason}

  VALIDATION:
  - Pure XML structure: pass/fail
  - All tags closed: pass/fail
  - Registry updated: yes/no
</output_format>
```

For agents that Harry delegates to, include a JSON variant for machine-readable returns.

---

### `<success_criteria>` (required)

Checkboxes that define "done well" — not just "done."

```xml
<success_criteria>
- Agent file exists at .claude/agents/{name}.md
- Pure XML body (no ## headings as structure)
- All XML tags properly closed
- Frontmatter complete: name, description, tools, model
- Role section is domain-specific (not generic)
- Workflow has numbered steps
- Constraints include MUST/NEVER/ALWAYS rules (min 3)
- Registry entry present and valid in agent-registry.json
</success_criteria>
```

---

### `<validation>` (optional but recommended)

Pre-completion checklist the agent runs before returning.

```xml
<validation>
Before completing, verify:
- [ ] File written to correct location
- [ ] No ## headings in body (only XML tags as structure)
- [ ] All XML tags balanced (count open/close pairs)
- [ ] JSON syntax valid in agent-registry.json
- [ ] Description includes trigger keywords
</validation>
```

---

### `<activation_modes>` (optional)

Use when the agent has multiple invocation patterns with different behaviors.

```xml
<activation_modes>
**Mode 1 — Standalone**
User invokes directly. Handle everything: file write, registry update, validation.

**Mode 2 — Harry Sidekick**
Harry delegates via Task tool (3P format).
Execute the file work. Return JSON report.
Harry owns audit, 4-D evaluation, registry integration.
</activation_modes>
```

---

## Pure XML Structure Rule

Agent bodies must use XML tags as structural elements — not markdown headings.

**Correct:**
```xml
<role>
You are an expert...
</role>

<workflow>
1. Step one
2. Step two
</workflow>
```

**Incorrect (anti-pattern):**
```
## Role
You are an expert...

## Workflow
1. Step one
2. Step two
```

Markdown *content within* XML tags (bold, lists, code blocks) is fine. The rule is about structural organization, not formatting within sections.

Why: Pure XML provides consistent parsing, ~25% better token efficiency, and predictable section boundaries for orchestrators reading agent outputs.

---

## 4-D Integration Checklist

Every agent should reflect these principles:

| Dimension | Implementation |
|-----------|----------------|
| **Delegation** | Add `Task` tool only if delegating. Include delegation patterns in workflow if needed. |
| **Description** | `<output_format>` requires evidence: file paths, line numbers, concrete examples. |
| **Discernment** | Quality checkpoints in workflow. `<success_criteria>` defines excellence, not just completion. |
| **Diligence** | Workflow emphasizes iteration. Never "done" until output meets the excellence bar. |
