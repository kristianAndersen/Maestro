---
name: agent-creator
description: Methodology for creating, improving, and optimizing Maestro framework agents. Activate this skill whenever you are creating a new .claude/agents/*.md file, improving an existing agent's behavior or structure, fixing an agent that isn't triggering correctly, or optimizing agent-registry.json entries. Harry should activate this before any agent creation or optimization task. Also useful when any agent needs to produce or modify another agent file. Don't skip this skill for "quick" agent edits — the anatomy and registry patterns here prevent common mistakes that require healing loops to fix.
---

# Agent Creator Skill

Methodology for building high-quality Maestro agents: creating from scratch, improving existing ones, and optimizing triggering accuracy via agent-registry.json.

## When to Use

- Creating a new `.claude/agents/*.md` file
- Improving an existing agent's behavior, role, or workflow
- Fixing an agent that isn't triggering (description/registry tuning)
- Updating registry entries in `agent-registry.json`
- Reviewing an agent before passing it to the auditor

For full agent anatomy details: see `assets/anatomy.md`

---

## Quick Start (80% of cases)

**Creating a new agent — minimum viable checklist:**

1. Frontmatter: `name`, `description` (what + when + keywords), `tools` (minimal), `model`
2. Body in pure XML — no `##` markdown headings as structure
3. Required sections: `<role>`, `<constraints>`, `<workflow>`, `<output_format>`, `<success_criteria>`
4. Add entry to `.claude/agents/agent-registry.json`
5. Validate: all XML tags closed, JSON syntax valid

**Improving an existing agent — audit checklist:**

- `<role>` defines specific expertise (not "helpful assistant")?
- `<workflow>` has numbered steps?
- `<constraints>` has at least 3 MUST/NEVER/ALWAYS rules?
- `<output_format>` section present?
- No `##` headings as structure in the body?
- All XML tags closed?
- Tools are minimal (no unnecessary Write/Bash/Task)?

---

## Core Principle: Agent Anatomy

Every Maestro agent = YAML frontmatter + pure XML body.

```yaml
---
name: lowercase-with-hyphens
description: What it does + WHEN to use it + trigger keyword hints
tools: Read, Write, Edit, Grep, Glob   # minimal necessary set
model: sonnet                           # sonnet | haiku | opus
---
```

The `description` field is the primary triggering mechanism. It must include:
- What the agent does
- When it should be invoked (trigger context)
- Specific keywords users/orchestrators would use

See `assets/anatomy.md` for full anatomy reference, tool/model selection guides, and XML section patterns.

---

## Workflow: Create New Agent

```
1. Clarify domain and purpose
   - What specific problem does this agent solve?
   - What are the inputs and expected outputs?
   - Does it need to delegate to other agents? (determines if Task tool needed)

2. Design frontmatter
   - name: lowercase-with-hyphens, specific not generic
   - description: what + when + keywords (see anatomy.md for examples)
   - tools: apply least-privilege (read-only? write? delegate?)
   - model: haiku=simple/fast, sonnet=most agents, opus=deep reasoning

3. Write XML body (in this order)
   <role>          → Specific domain expert identity
   <constraints>   → MUST/NEVER/ALWAYS boundaries (min 3)
   <workflow>      → Numbered step-by-step process
   <output_format> → Expected output structure
   <success_criteria> → What "done well" looks like

4. Write file to .claude/agents/{name}.md

5. Add registry entry to agent-registry.json (see registry section below)

6. Validate structure (no ## headings, all tags closed, JSON valid)
```

---

## Workflow: Improve Existing Agent

```
1. Read the agent file fully — understand its current intent before changing anything

2. Audit against checklist (Quick Start section above)

3. Apply targeted fixes with Edit tool — preserve what works, fix what doesn't

4. Common improvements:
   - Vague <role>: make it domain-specific and expert-level
   - Missing <output_format>: add structured output expectations
   - Weak <constraints>: add MUST/NEVER/ALWAYS with specifics
   - ## headings in body: convert to semantic XML tags
   - Unclosed tags: find and fix
   - Over-permissioned tools: remove what isn't used

5. Validate after edits — re-read the file, check structure
```

---

## Workflow: Optimize Triggering

When an agent isn't being suggested or triggered correctly:

```
1. Read the agent's description field
   - Is it specific about WHEN to use it?
   - Does it include keywords users would actually type?
   - Too vague triggers on everything; too narrow never triggers

2. Read agent-registry.json — find the agent's entry
   - keywords: should be specific domain terms (not "help", "do", "make")
   - intentPatterns: realistic user phrases as regex patterns
   - complexity/autonomy: correctly calibrated?
   - Entry missing entirely? Create it.

3. Update description in agent file if vague

4. Update or create registry entry with better triggers

5. Test: would the maestro-agent-suggester pick this up for realistic prompts?
```

---

## Registry Entry Format

```json
"agent-name": {
  "purpose": "One-line description of what agent does",
  "triggers": {
    "keywords": ["specific", "domain", "terms", "users", "type"],
    "synonyms": ["optional", "alternate", "phrasings"],
    "intentPatterns": ["create.*agent", "improve.*workflow"],
    "operations": ["create", "improve", "optimize"]
  },
  "complexity": "simple|medium|complex",
  "autonomy": "high|medium|low",
  "internal": true
}
```

**Trigger quality:**
- Good keywords: domain-specific verbs + nouns (`"create agent"`, `"fix hook"`)
- Bad keywords: generic (`"help"`, `"do"`) — too many false positives
- Good intentPatterns: `"create.*agent"`, `"improve.*workflow"`
- Bad intentPatterns: `".*"` — matches everything

**Fields:**
- `complexity`: simple=single task, medium=multi-step, complex=research+generate+validate
- `autonomy`: high=acts independently, medium=may ask, low=requires confirmation
- `internal: true`: add only if agent is not user-facing (invoked only by other agents)

---

## 4-D Integration

Agents created with this skill must reflect Maestro's 4-D methodology:

- **Delegation**: Include `Task` tool only if the agent delegates. Add clear delegation patterns in workflow.
- **Description**: `<output_format>` must require evidence — file paths, line numbers, concrete examples.
- **Discernment**: Build quality checkpoints into workflow. `<success_criteria>` defines excellence, not just completion.
- **Diligence**: Workflow should emphasize iteration. Never "done" until the output meets excellence bar.

---

## Anti-Patterns to Avoid

- Generic role: `"You are a helpful assistant"` → breaks agent identity
- Markdown headings as structure: `## Workflow` → use `<workflow>` instead
- Over-permissioned tools: giving `Bash` to a read-only agent
- Missing output format: agent returns whatever it feels like
- Vague description: `"Helps with code"` → never triggers correctly
- No registry entry: agent invisible to suggestion hooks
- Single-use Task tool: adding Task "just in case" — only add if delegation is part of the workflow

---

## Quick Reference

```
File location:    .claude/agents/{name}.md
Registry:         .claude/agents/agent-registry.json
Required sections: role, constraints, workflow, output_format, success_criteria
Structure rule:   Pure XML in body — no ## headings as structure
Tool default:     Read, Write, Edit, Grep, Glob (add others only if justified)
Model default:    sonnet
```

For deep reference on XML section patterns and examples: `assets/anatomy.md`
