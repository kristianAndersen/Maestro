# Maestro Subagent Architecture

**Progressive Disclosure Through Subagents**

This directory contains **subagents** - specialized AI processes that preserve main context by running in their own subprocess. Each subagent has access to the skill registry and can dynamically load and apply skills within its own context.

---

## Why Subagents?

### The Context Preservation Problem

**Without subagents:**
```
Main Claude Context:
├─ System prompt (Maestro)
├─ Conversation history
├─ User request: "Review App.vue"
├─ File-opener skill loaded (500 lines) ← Takes up space
├─ Code-analysis skill loaded (600 lines) ← More space
├─ File content (127 lines) ← Even more
└─ Analysis results
   = CONTEXT BLOAT
```

**With subagents:**
```
Main Claude Context:
├─ System prompt (Maestro)
├─ Conversation history
├─ User request: "Review App.vue"
├─ Spawn subagent → file-opener
└─ Receive summary: "3 issues found..."
   = CONTEXT PRESERVED ✅

Subagent Context (separate subprocess):
├─ Subagent system prompt
├─ Skill-rules.json (registry)
├─ File-opener skill (loaded here)
├─ Code-analysis skill (loaded here)
├─ File content (here)
└─ Analysis (here)
   → Returns only summary to main
```

### Benefits

**✅ Context Preservation**
- Main Claude stays focused on orchestration
- Heavy processing happens in subprocess
- Only essential results returned

**✅ Progressive Disclosure**
- Skills loaded only when needed
- Loaded into subagent context, not main
- Main sees summary, not full details

**✅ Skill Composability**
- Subagent can use multiple skills
- Skills loaded dynamically from registry
- No hardcoding - registry is source of truth

**✅ 4-D Methodology at Scale**
- Each subagent follows 4-D framework
- Skills also follow 4-D
- Nested excellence enforcement

---

## Architecture

### Three-Layer System

```
┌─────────────────────────────────────┐
│   Layer 1: Main Claude (Maestro)    │  Strategic orchestration
│   - High-level direction            │  User-facing
│   - Spawn subagents                 │  Context preserved
└────────────┬────────────────────────┘
             │
             ↓ delegates
┌─────────────────────────────────────┐
│   Layer 2: Subagents (.claude/     │  Tactical execution
│   agents/)                          │  Subprocess
│   - File operations                 │  Skill-registry aware
│   - Code analysis orchestration     │  Context isolated
│   - Data processing                 │
└────────────┬────────────────────────┘
             │
             ↓ loads & applies
┌─────────────────────────────────────┐
│   Layer 3: Skills (.claude/skills/) │  Domain expertise
│   - Code-analysis methodology       │  Loaded on demand
│   - Data-validation rules           │  Applied in subagent
│   - File-reading strategies         │  context
└─────────────────────────────────────┘
```

### Information Flow

```
User Request
    ↓
Main Claude (Maestro)
    ↓ [Delegation: Product, Process, Performance]
Subagent spawned
    ↓ Reads skill-rules.json
Finds matching skill
    ↓ Loads skill into subagent context
Applies skill methodology
    ↓ Executes with 4-D framework
Results generated
    ↓ [Returns: Summary + Evidence]
Main Claude receives summary
    ↓
User sees results
```

---

## Available Subagents

### file-opener

**Purpose:** Open files from natural language, detect intent, delegate to specialists

**Triggers:**
- "open file", "read file", "check file"
- "review", "analyze", "examine"
- File references with action verbs

**What it does:**
1. Parses prompt for file references
2. Opens file(s) using appropriate strategy
3. Detects user intent (review, validate, edit, etc.)
4. Reads skill registry to find specialist
5. Loads and applies specialist skill
6. Returns structured results to main Claude

**Example:**
```
User: "Review App.vue for bugs"

Main Claude → Spawns file-opener subagent

file-opener:
  - Opens App.vue
  - Detects: "review", "bugs" = code analysis
  - Reads skill-rules.json
  - Finds: code-analysis skill
  - Loads: .claude/skills/code-analysis/SKILL.md
  - Applies: Code analysis methodology
  - Returns: "3 bugs found at lines 45, 78, 102..."

Main Claude → Shows results to user
```

**Context savings:** ~1000+ lines kept out of main context

---

## How to Use Subagents

### As Main Claude (Maestro)

When you detect a file operation request:

1. **Check skill-rules.json** for subagent match
2. **Spawn subagent** using Task tool:
   ```
   Task tool with:
     - subagent_type: "file-opener"
     - prompt: User's original request + context
     - description: "Open and analyze file"
   ```
3. **Wait for result** from subagent
4. **Present summary** to user

### As a Subagent

When spawned by main Claude:

1. **Read skill-rules.json**:
   ```
   Read .claude/skills/skill-rules.json
   ```

2. **Parse user intent** from prompt received

3. **Find matching skill** in registry:
   - Match keywords
   - Match file types
   - Match operation patterns

4. **Load skill into your context**:
   ```
   Read .claude/skills/{skill-name}/SKILL.md
   ```

5. **Apply skill methodology** following its instructions

6. **Return structured summary** to main Claude:
   - What was done
   - What was found
   - Evidence/specifics
   - Recommended actions

---

## Creating New Subagents

### Use the Template

Start with `SUBAGENT_TEMPLATE.md`:

```bash
cp .claude/agents/SUBAGENT_TEMPLATE.md .claude/agents/my-subagent.md
```

### Required Sections

**Front Matter:**
```yaml
---
name: my-subagent
description: When this should be invoked
tools: Read, Skill, [others]
model: sonnet
---
```

**Core Sections:**
1. **Mission** - What you receive, what you deliver
2. **Skill Registry Integration** - How to use skills
3. **4-D Methodology** - Delegation, Description, Discernment, Diligence
4. **Execution Workflows** - Step-by-step examples
5. **Decision Logic** - How you make choices
6. **Error Handling** - What to do when things fail
7. **Best Practices** - Do's and Don'ts

### Register in skill-rules.json

Add to `subagents` section:

```json
{
  "subagents": {
    "my-subagent": {
      "type": "orchestrator",
      "enforcement": "suggest",
      "priority": "high",
      "description": "What this subagent does",
      "agentPath": ".claude/agents/my-subagent.md",
      "promptTriggers": {
        "keywords": ["trigger", "words"],
        "intentPatterns": ["regex patterns"]
      },
      "delegation": {
        "description": "When and how this is used",
        "preservesContext": true,
        "returnsFormat": "What it returns"
      }
    }
  }
}
```

---

## Subagent vs Skill: When to Use What

### Use a Subagent When:

✅ **Context preservation is critical**
- Long files or many files
- Multiple skills needed
- Complex orchestration
- Main context getting bloated

✅ **Dynamic skill selection needed**
- Don't know which skill until runtime
- Intent detection required
- Multiple specialists might be used

✅ **Isolated processing beneficial**
- Error handling in subprocess
- Don't want to pollute main context
- Can retry without affecting main

### Use a Skill When:

✅ **Simple, direct execution**
- One skill, known upfront
- Small context footprint
- No orchestration needed

✅ **Embedded in subagent**
- Skill loaded BY subagent
- Applied in subagent context
- Part of larger workflow

**Rule of thumb:** Subagents orchestrate, skills execute.

---

## Design Patterns

### Pattern 1: Intent Detection → Skill Delegation

```
Subagent receives: "Review code in App.vue"

1. Parse intent: "review code" = code analysis
2. Open file: App.vue
3. Check registry: code-analysis matches
4. Load skill: .claude/skills/code-analysis/SKILL.md
5. Apply skill: Follow code-analysis methodology
6. Return: Structured findings
```

**Used by:** file-opener subagent

### Pattern 2: Multi-Skill Orchestration

```
Subagent receives: "Validate and optimize data.csv"

1. First skill: data-validation
   - Load from registry
   - Validate CSV structure
   - Check data quality

2. Based on results: performance-optimization
   - Load from registry
   - Suggest optimizations
   - Verify improvements

3. Return: Combined results
```

**Future subagent:** data-processor

### Pattern 3: Conditional Delegation

```
Subagent receives: "Analyze files"

Check file count:
  If <= 5 files:
    → Use code-analysis skill

  If > 5 files:
    → Use gemini-delegator skill

Return: Analysis results optimized for file count
```

**Used by:** file-opener subagent (lines 254-267)

---

## Best Practices

### DO ✓

**✓ Always read skill-rules.json**
```typescript
// First thing in subagent execution
const registry = await Read('.claude/skills/skill-rules.json');
const matchingSkills = findMatches(registry, userIntent);
```

**✓ Load skills into subagent context**
```typescript
// Don't rely on memory - read the current version
const skill = await Read(`.claude/skills/${skillName}/SKILL.md`);
// Now apply the skill's current methodology
```

**✓ Return structured summaries**
```markdown
**File Operation Summary**
Opened: src/App.vue (127 lines)
Skill: code-analysis
Found: 3 issues (lines 45, 78, 102)
Status: All actionable with fixes provided
```

**✓ Preserve main context**
```typescript
// In subagent - process everything here
// Return to main - only essential summary
return {
  summary: "3 issues found",
  issues: [...], // Structured, not verbose
  evidence: "Line numbers and fixes provided"
};
```

**✓ Follow 4-D methodology**
- Delegation: What skills to use
- Description: How to direct them
- Discernment: Validate results
- Diligence: Evidence-based return

### DON'T ✗

**✗ Don't bloat main context**
```typescript
// BAD: Return full file content
return { file: [1000 lines], analysis: [...] };

// GOOD: Return summary only
return { issues: 3, details: "lines 45, 78, 102" };
```

**✗ Don't skip skill loading**
```typescript
// BAD: Improvise based on memory
// "I remember code-analysis looks for..."

// GOOD: Load current skill version
const skill = await Read('.claude/skills/code-analysis/SKILL.md');
// Follow its current instructions
```

**✗ Don't guess file paths**
```typescript
// BAD: "User probably means src/App.vue"

// GOOD: Search and present options
const matches = await Glob('**/App.vue');
if (matches.length > 1) {
  return { needsClarification: true, options: matches };
}
```

**✗ Don't lose context**
```typescript
// BAD: Skill doesn't know user's goal
applySkill(file);

// GOOD: Pass full context
applySkill({
  file,
  userIntent: "find security issues",
  originalPrompt: "review for XSS vulnerabilities"
});
```

---

## Testing Subagents

### Manual Testing

**Test 1: Simple file open**
```
Prompt: "Show me the README"
Expected: File-opener subagent → Direct read → Return content
Verify: Main context preserved, file content returned
```

**Test 2: Intent detection**
```
Prompt: "Review App.vue for bugs"
Expected: File-opener → Opens file → Detects "review bugs" → Loads code-analysis
Verify: Correct skill loaded, analysis performed, summary returned
```

**Test 3: Ambiguous reference**
```
Prompt: "Check the config file"
Expected: File-opener → Searches → Finds multiple → Returns options
Verify: User asked to clarify, not guessed
```

**Test 4: Multi-file batch**
```
Prompt: "Analyze all .vue files"
Expected: File-opener → Globs → 12 files found → gemini-delegator
Verify: Large batch delegated appropriately, context preserved
```

### Verification Checklist

After each test:
```
✓ Subagent spawned successfully
✓ Skill registry read
✓ Correct skill loaded (if delegated)
✓ File(s) opened correctly
✓ Intent detected accurately
✓ Results are structured
✓ Evidence provided
✓ Main context preserved (check token usage)
✓ User received actionable output
```

---

## Troubleshooting

### Subagent Not Spawning

**Symptom:** Main Claude handles directly instead of spawning subagent

**Causes:**
- Triggers in skill-rules.json don't match prompt
- Main Claude doesn't recognize subagent pattern
- Task tool not used

**Fix:**
- Check `promptTriggers` keywords and patterns
- Update skill-rules.json with better triggers
- Ensure main Claude reads registry

### Skill Not Found

**Symptom:** Subagent can't find skill in registry

**Causes:**
- Skill not registered in skill-rules.json
- Typo in skill name
- Registry not read

**Fix:**
```typescript
// Always read registry first
const registry = Read('.claude/skills/skill-rules.json');

// Check if skill exists
if (!registry.skills[skillName]) {
  // Fallback or ask for clarification
}
```

### Context Still Bloated

**Symptom:** Main context getting large despite subagent

**Causes:**
- Subagent returning too much detail
- Full file contents returned
- Not using summary format

**Fix:**
```typescript
// BAD
return {
  file: fullFileContents,
  analysis: everyDetail
};

// GOOD
return {
  summary: "3 issues found",
  issues: issues.map(i => ({ line: i.line, type: i.type })),
  evidence: "Specifics provided in structured format"
};
```

---

## Future Subagents

Ideas for additional subagents to enhance Maestro:

### code-reviewer
- **Purpose:** Comprehensive code review across multiple files
- **Skills used:** code-analysis, security-audit, performance-check
- **Preserves:** Main context for iterative discussion

### data-processor
- **Purpose:** Validate, transform, and optimize data files
- **Skills used:** data-validation, schema-check, format-conversion
- **Preserves:** Large dataset processing outside main context

### documentation-analyzer
- **Purpose:** Process large documentation sets
- **Skills used:** gemini-delegator, content-analysis, reference-extraction
- **Preserves:** Main context when reading massive docs

### test-runner
- **Purpose:** Run tests, analyze failures, suggest fixes
- **Skills used:** test-analysis, debugging-guide, fix-recommender
- **Preserves:** Test output and logs in subprocess

---

## Philosophy

**"Main Claude conducts the symphony. Subagents play their sections with skills as their sheet music."**

- **Main Claude (Maestro):** Strategic orchestration, user interaction, high-level direction
- **Subagents:** Tactical execution, skill orchestration, context isolation
- **Skills:** Domain expertise, methodology, execution patterns

This three-tier architecture enables:
- **Progressive disclosure:** Load only what's needed when needed
- **Context preservation:** Heavy lifting in subprocesses
- **Composability:** Mix and match skills dynamically
- **Excellence at scale:** 4-D methodology at every layer

---

## Contributing

To add a new subagent:

1. **Copy template:** `SUBAGENT_TEMPLATE.md` → `your-subagent.md`
2. **Define mission:** What it receives, what it delivers
3. **List skills:** Which skills it typically uses
4. **Document workflows:** Step-by-step execution examples
5. **Register:** Add to `skill-rules.json` under `subagents`
6. **Test:** Verify spawning, skill loading, results
7. **Document:** Update this README with new subagent

---

**Maestro Subagent Architecture**
**Version:** 1.0
**Philosophy:** Progressive disclosure through intelligent delegation
**Integration:** Claude Code Task tool + Skill registry
**Result:** Context-preserving excellence at scale
