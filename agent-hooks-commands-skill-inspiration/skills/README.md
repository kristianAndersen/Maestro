# Maestro Skills

Skills for the Maestro Conductor System - specialized executors that integrate with the 4-D methodology.

---

## What Are Skills?

In Maestro, skills are **specialized executors** that:
- Receive clear direction from the conductor (Product/Process/Performance)
- Execute work in their domain of expertise
- Report back for evaluation through 4-D quality gates
- Maintain excellence standards

**Maestro Philosophy:** The conductor (Maestro) stays language/domain-agnostic. Skills bring the knowledge.

---

## Skills in This Directory

### Meta-Skills (Core Maestro)

**skill-developer/**
- **Purpose**: Create and manage Maestro-compatible skills
- **Type**: Meta-skill (teaches skill creation)
- **Domain**: Universal - any project type
- **Use When**: Creating new skills, modifying skill-rules.json, understanding triggers

**4d-evaluation/**
- **Purpose**: Quality gate for evaluating outputs before implementation
- **Type**: Guardrail (excellence enforcement)
- **Domain**: Universal - any project type
- **Use When**: Before major implementations, reviewing outputs, quality checks

---

## Creating Custom Skills

Maestro is designed for **YOUR project-specific skills**:

### Examples by Domain

**Code Projects:**
- `react-patterns` - React/TypeScript best practices
- `api-design` - REST API architecture and patterns
- `testing-strategy` - Test-driven development for your stack

**Marketing Projects:**
- `brand-voice` - Brand voice and tone guidelines
- `campaign-patterns` - Campaign structure and best practices
- `analytics-review` - Marketing analytics validation

**Analytics Projects:**
- `data-validation` - Data quality checks and standards
- `reporting-standards` - Report structure and presentation
- `methodology` - Analysis methodology and approaches

**Writing Projects:**
- `style-guide` - Writing style and tone
- `structure-patterns` - Document structure templates
- `fact-checking` - Verification standards

---

## Skill Structure

### Minimal Skill

```
.claude/skills/my-skill/
└── SKILL.md          # Main skill file (<500 lines)
```

### Skill with References (Recommended for complex topics)

```
.claude/skills/my-skill/
├── SKILL.md                 # Main file (<500 lines)
└── resources/
    ├── topic-1.md          # Deep dive (<500 lines each)
    ├── topic-2.md
    └── topic-3.md
```

**Progressive Disclosure:** Claude loads main SKILL.md first, only loads resource files when needed.

---

## Skill Activation

Skills activate automatically via the hook system:

1. User submits prompt or works with files
2. `skill-activation-prompt` hook checks `skill-rules.json`
3. Matching skills are suggested to Claude
4. Claude uses relevant skill(s) to guide work

**Configuration:** `.claude/skills/skill-rules.json`

---

## Getting Started

### 1. Use skill-developer Skill

```
Ask Claude: "Help me create a skill for [your domain]"
```

The `skill-developer` skill will guide you through:
- Skill file structure
- Trigger configuration
- Testing and refinement
- Maestro integration

### 2. Follow the Template

Every skill should include:
- **Purpose**: What this skill does
- **Integration with Maestro**: How it fits the 4-D framework
- **Excellence Standards**: What quality bar it maintains
- **Key Information**: The actual guidance/patterns

### 3. Add to skill-rules.json

Define trigger conditions:
```json
{
  "my-skill": {
    "type": "domain",
    "enforcement": "suggest",
    "priority": "high",
    "promptTriggers": {
      "keywords": ["keyword1", "topic"],
      "intentPatterns": ["(create|build).*?something"]
    }
  }
}
```

### 4. Test and Refine

```bash
# Test skill activation
echo '{"prompt":"test prompt"}' | npx tsx ../.claude/hooks/skill-activation-prompt.ts
```

---

## Best Practices

**Anthropic's Guidelines:**
- ✅ Keep SKILL.md under 500 lines
- ✅ Use reference files for detailed topics
- ✅ Add table of contents to files > 100 lines
- ✅ Include ALL trigger keywords in description
- ✅ Test with 3+ real scenarios before documenting

**Maestro's Guidelines:**
- ✅ Explain integration with 4-D methodology
- ✅ Reference excellence standards where relevant
- ✅ Provide concrete examples, not abstractions
- ✅ Support evidence-based verification
- ✅ Keep domain-agnostic at core, specific in skills

---

## Skill Types

### Domain Skills (type: "domain", enforcement: "suggest")
Provide expertise for specific domains. Most skills are this type.

**Examples:**
- Tech stack patterns (React, Express, Django, etc.)
- Marketing guidelines (brand voice, campaigns)
- Analytics standards (data validation, reporting)
- Writing guides (style, structure, tone)

### Guardrail Skills (type: "guardrail", enforcement: "block" or "suggest")
Enforce critical standards from Maestro's excellence checklist.

**Examples:**
- Quality gates before major implementations
- Critical workflow checkpoints
- Non-negotiable standards

---

## Related Files

**Configuration:**
- `skill-rules.json` - Trigger configuration for all skills
- `../settings.json` - Hook registration (user creates)

**Hooks:**
- `../.claude/hooks/skill-activation-prompt.ts` - Auto-activation system

**Documentation:**
- `skill-developer/SKILL.md` - Complete guide to creating skills
- `skill-developer/TRIGGER_TYPES.md` - Trigger patterns reference
- `skill-developer/SKILL_RULES_REFERENCE.md` - JSON schema reference

---

**Next Steps:**

1. Review existing skills (skill-developer, 4d-evaluation)
2. Ask Claude to help create skills for your project
3. Test skill activation
4. Iterate based on usage

**Philosophy:** Maestro orchestrates, skills execute, excellence is the standard.
