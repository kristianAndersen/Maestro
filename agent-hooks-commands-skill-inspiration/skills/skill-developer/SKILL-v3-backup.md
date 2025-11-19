---
name: skill-developer
description: Guide for creating effective Maestro-compatible skills. Use when creating new skills, updating existing skills, modifying skill-rules.json, understanding trigger patterns, working with hooks, debugging skill activation, or implementing progressive disclosure. Covers skill structure, YAML frontmatter, trigger types (keywords, intent patterns, file paths), bundled resources (scripts/references/assets), enforcement levels, hook mechanisms, and the 500-line rule with Maestro's 4-D methodology integration.
version: 3.0.0
---

# Skill Developer - Maestro Edition

Comprehensive guide for creating skills that integrate with the Maestro Conductor System. Skills in Maestro are **specialized executors** that receive clear direction, execute domain-specific work, and report back for evaluation through 4-D quality gates.

## Purpose

Guide creation of effective, reusable skills that transform Claude from general-purpose agent into specialized executor with procedural knowledge and domain expertise while maintaining Maestro's excellence standards.

---

## Integration with Maestro

### Skills as Specialized Executors

In Maestro's architecture:
- **Maestro (Conductor)**: Orchestrates work, maintains excellence standards
- **Skills (Executors)**: Provide specialized knowledge, workflows, and tools
- **Hooks (Routing)**: Automatically activate relevant skills

### 4-D Methodology for Skills

**DELEGATION (Maestro → Skill)**
- Maestro delegates domain-specific work to appropriate skills
- Skills receive Product/Process/Performance direction
- Auto-activation via hook system when triggers match

**DESCRIPTION (Skill → Claude)**
- Skills provide clear specifications for execution
- Procedural knowledge, workflows, tool integrations
- Domain expertise that no model fully possesses

**DISCERNMENT (Output → Evaluation)**
- Skills enable quality evaluation through clear deliverables
- Reference Maestro's excellence standards
- Provide objective success criteria

**DILIGENCE (Implementation → Verification)**
- Skills enforce evidence-based verification
- Concrete examples and clear guidance
- Iterative refinement when gaps exist

---

## About Skills

Skills are modular, self-contained packages that extend Claude's capabilities by providing:

1. **Specialized workflows** - Multi-step procedures for specific domains
2. **Tool integrations** - Instructions for working with file formats or APIs
3. **Domain expertise** - Project-specific knowledge, schemas, business logic
4. **Bundled resources** - Scripts, references, assets for complex tasks

**Maestro Principle**: Skills bring knowledge, Maestro orchestrates excellence.

---

## Skill Structure

### Anatomy of a Skill

```
skill-name/
├── SKILL.md (required)
│   ├── YAML frontmatter (required)
│   │   ├── name: (required)
│   │   ├── description: (required, max 1024 chars)
│   │   └── allowed-tools: (optional)
│   └── Markdown instructions (required, <500 lines)
└── Bundled Resources (optional)
    ├── scripts/          - Executable code (Python/Bash/etc.)
    ├── references/       - Documentation loaded as needed
    └── assets/           - Files used in output (templates, etc.)
```

### Progressive Disclosure (Three-Level Loading)

1. **Metadata** (name + description) - Always in context (~100 words)
2. **SKILL.md body** - When skill triggers (<500 lines, <5k words)
3. **Bundled resources** - As Claude determines need (Unlimited*)

*Scripts can execute without reading into context

**Why**: Manages context efficiently, follows Anthropic's 500-line rule

---

## SKILL.md Requirements

### Frontmatter (YAML)

```yaml
---
name: skill-name                    # Required, lowercase + hyphens, max 64 chars
description: Brief explanation...   # Required, max 1024 chars, include triggers
version: 1.0.0                     # Optional but recommended
allowed-tools: Read, Write, Edit   # Optional, restricts tool access
---
```

**Critical: Description Field**
- Determines when Claude uses the skill (model-invoked)
- Include BOTH what it does AND when to use it
- Specific trigger terms users would mention
- Keywords for hook system matching

**Good Example:**
```yaml
description: Create React components following project patterns. Use when building UI components, pages, or layouts. Triggers on keywords: component, React, UI, page, form, modal.
```

**Bad Example:**
```yaml
description: Helps with React development.
```

### Body Content (<500 lines)

**Writing Style**: Imperative/infinitive form (verb-first), not second person
- ✅ "To accomplish X, do Y"
- ❌ "You should do X"
- ✅ "Execute the script"
- ❌ "You can execute the script"

**Structure Template:**
```markdown
# Skill Name - Maestro Edition

## Purpose
What this skill does and how it integrates with Maestro

## Integration with Maestro
How skill fits 4-D methodology (DELEGATION/DESCRIPTION/DISCERNMENT/DILIGENCE)

## Excellence Standards
How skill upholds Maestro's standards

## When to Use This Skill
Specific trigger scenarios

## Key Information
Core procedures, workflows, tool usage

## Examples
Concrete use cases with verification steps

## Reference Materials
Links to detailed resources
```

---

## Bundled Resources

### scripts/ Directory

**When to include**: Code being rewritten repeatedly or needing deterministic reliability

**Examples**:
- `scripts/rotate_pdf.py` for PDF operations
- `scripts/delegate_to_gemini.py` for Gemini CLI integration
- `scripts/validate_schema.py` for data validation

**Benefits**:
- Token efficient
- Deterministic execution
- May execute without loading into context
- Can be patched for environment-specific needs

### references/ Directory

**When to include**: Documentation Claude should reference while working

**Examples**:
- `references/api_docs.md` for API specifications
- `references/schema.md` for database structures
- `references/patterns.md` for common patterns library
- `references/troubleshooting.md` for debugging guides

**Best practices**:
- Keep SKILL.md lean, move details to references
- If files >10k words, include grep search patterns in SKILL.md
- Avoid duplication (info in SKILL.md OR references, not both)
- Table of contents for files >100 lines

### assets/ Directory

**When to include**: Files used in final output (not loaded into context)

**Examples**:
- `assets/template.html` for boilerplate
- `assets/logo.png` for brand assets
- `assets/config.json` for configuration templates
- `assets/frontend-template/` for project scaffolding

**Use cases**: Templates, images, boilerplate, fonts, sample documents that get copied/modified

---

## Skill Creation Process (6 Steps)

### Step 1: Understanding with Concrete Examples

**Goal**: Clearly understand how skill will be used

**Questions to ask**:
- What functionality should the skill support?
- Can you give examples of how this would be used?
- What would a user say that should trigger this skill?
- What are the most common use cases?

**Output**: 3+ concrete examples of skill usage

**Maestro Note**: Focus on Product (what to build), Process (how), Performance (definition of done)

### Step 2: Planning Reusable Contents

**Goal**: Analyze examples to identify reusable resources

**For each example, ask**:
1. How to execute this from scratch?
2. What gets rewritten repeatedly? → scripts/
3. What reference docs are needed? → references/
4. What templates/assets help? → assets/

**Example Analysis**:
- "Rotate PDF" → Need `scripts/rotate_pdf.py` (same code each time)
- "Query BigQuery" → Need `references/schema.md` (table structures)
- "Build webapp" → Need `assets/hello-world/` (HTML/React boilerplate)

**Output**: List of scripts, references, assets to include

### Step 3: Initialize Skill Structure

**Create directory**:
```bash
mkdir -p .claude/skills/skill-name/{scripts,references,assets}
```

**Create SKILL.md with template**:
```markdown
---
name: skill-name
description: [TODO: Specific description with triggers]
version: 1.0.0
---

# Skill Name - Maestro Edition

[TODO: Complete template sections]
```

### Step 4: Edit the Skill

**For another Claude instance**: Include non-obvious procedural knowledge

**Start with bundled resources**:
1. Create scripts/ files identified in Step 2
2. Create references/ files with detailed documentation
3. Add assets/ files (templates, etc.)
4. Delete unused example directories

**Update SKILL.md**:
1. Purpose (few sentences)
2. Integration with Maestro (4-D methodology)
3. Excellence Standards (how skill maintains quality)
4. When to use (trigger scenarios)
5. How to use skill and bundled resources
6. Examples with verification steps

**Maestro Requirements**:
- Explain 4-D integration
- Reference excellence standards
- Include verification in examples
- Evidence-based success criteria

### Step 5: Configure Auto-Activation

**Add to skill-rules.json**:
```json
{
  "skill-name": {
    "type": "domain",
    "enforcement": "suggest",
    "priority": "high",
    "description": "Brief description matching SKILL.md",
    "promptTriggers": {
      "keywords": ["keyword1", "keyword2", "topic"],
      "intentPatterns": ["(create|build).*?something"]
    },
    "fileTriggers": {
      "pathPatterns": ["src/**/*.ext"],
      "contentPatterns": ["import.*Library"]
    }
  }
}
```

**Test activation**:
```bash
cd .claude/hooks
export CLAUDE_PROJECT_DIR=/path/to/project
echo '{"prompt":"test prompt with triggers"}' | npx tsx skill-activation-prompt.ts
```

### Step 6: Iterate and Refine

**After testing**:
1. Use skill on real tasks
2. Notice struggles or inefficiencies
3. Identify SKILL.md or bundled resource updates needed
4. Implement changes and test again
5. Update version number

**Maestro Iteration**: Apply 4-D evaluation after each use
- Did skill provide sufficient direction? (DESCRIPTION)
- Was output evaluable? (DISCERNMENT)
- Was verification possible? (DILIGENCE)

---

## Skill Types in Maestro

### Domain Skills (type: "domain")

**Purpose**: Provide expertise for specific domains

**Characteristics**:
- Enforcement: "suggest"
- Priority: "high" or "medium"
- Advisory, not mandatory
- Comprehensive documentation

**Examples**:
- Tech stack patterns (React, Python, etc.)
- Marketing guidelines (brand voice, campaigns)
- Analytics standards (data validation, reporting)

**Maestro Integration**: Receive delegation, execute with excellence, enable evaluation

### Guardrail Skills (type: "guardrail")

**Purpose**: Enforce critical standards from Maestro's excellence checklist

**Characteristics**:
- Enforcement: "block" or "suggest"
- Priority: "critical" or "high"
- Prevent errors before they happen
- Quality gates

**Examples**:
- 4d-evaluation (quality gate before implementation)
- Data validation (prevent invalid data)
- Security checks (enforce security standards)

**Maestro Integration**: Act as checkpoints in conductor's quality system

---

## Hook System Integration

### UserPromptSubmit Hook (Auto-Activation)

**How it works**:
1. Hook receives prompt before Claude sees it
2. Reads skill-rules.json
3. Matches keywords and intent patterns
4. Injects skill suggestions into Claude's context

**Configuration in skill-rules.json**:
```json
{
  "promptTriggers": {
    "keywords": ["explicit", "terms"],
    "intentPatterns": ["(action|verb).*?pattern"]
  },
  "fileTriggers": {
    "pathPatterns": ["glob/**/*.pattern"],
    "contentPatterns": ["regex.*patterns"]
  }
}
```

### PostToolUse Hook (Context Tracking)

**Purpose**: Tracks file modifications for context awareness

**Automatic**: No configuration needed, detects project structure

---

## Testing and Validation

### Skill Testing Checklist

- [ ] SKILL.md frontmatter valid (name, description)
- [ ] Description includes trigger keywords
- [ ] SKILL.md under 500 lines
- [ ] Writing style: imperative/infinitive form
- [ ] Maestro integration section present
- [ ] Excellence standards documented
- [ ] Examples include verification steps
- [ ] Reference files have table of contents (if >100 lines)
- [ ] Entry in skill-rules.json
- [ ] Triggers tested with real prompts
- [ ] No false positives in testing
- [ ] No false negatives in testing
- [ ] JSON syntax validated: `jq . skill-rules.json`

### Manual Hook Testing

```bash
# Test prompt matching
cd .claude/hooks
export CLAUDE_PROJECT_DIR=/path/to/project
echo '{"prompt":"test with skill triggers"}' | npx tsx skill-activation-prompt.ts

# Should output skill suggestions
```

---

## Best Practices (Maestro-Aligned)

### Do:

✅ Start with 3+ concrete examples
✅ Keep SKILL.md under 500 lines (use references/)
✅ Include specific trigger keywords in description
✅ Explain 4-D methodology integration
✅ Provide verification steps in examples
✅ Use imperative/infinitive writing style
✅ Move detailed docs to references/
✅ Test with real prompts before documenting
✅ Iterate based on actual usage
✅ Version your skills for tracking

### Don't:

❌ Create vague descriptions lacking triggers
❌ Exceed 500 lines in SKILL.md
❌ Use second-person style ("you should")
❌ Duplicate content (SKILL.md and references/)
❌ Skip Maestro integration section
❌ Omit verification in examples
❌ Forget to test trigger patterns
❌ Add skills without hook configuration
❌ Make assumptions without testing

---

## Reference Files

For detailed information:

### [TRIGGER_TYPES.md](TRIGGER_TYPES.md)
- Keyword triggers (explicit matching)
- Intent patterns (implicit action detection)
- File path triggers (glob patterns)
- Content patterns (regex in files)

### [SKILL_RULES_REFERENCE.md](SKILL_RULES_REFERENCE.md)
- Complete schema for skill-rules.json
- Field-by-field explanations
- Examples for domain and guardrail skills

### [HOOK_MECHANISMS.md](HOOK_MECHANISMS.md)
- UserPromptSubmit flow details
- PostToolUse tracking mechanics
- Session state management

### [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- Skill not triggering debugging
- False positive/negative issues
- Hook execution problems

### [PATTERNS_LIBRARY.md](PATTERNS_LIBRARY.md)
- Ready-to-use trigger patterns
- Intent pattern examples
- File/content pattern templates

---

---

**Skill Status**: Maestro Edition - 4-D integrated, progressive disclosure, hook-enabled ✅
**Line Count**: <500 (following Anthropic best practices) ✅
**Philosophy**: Skills execute, Maestro orchestrates, hooks activate automatically ✅

**For detailed guidance**: See reference files in this directory
