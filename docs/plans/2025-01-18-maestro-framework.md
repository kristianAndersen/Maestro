# Maestro Framework Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement the complete Maestro AI orchestration framework following Anthropic's 4-D methodology with delegation-first architecture, quality gates, and progressive disclosure patterns.

**Architecture:**
- Three-tier: Maestro Conductor → Subagents → Skills
- Native Claude ecosystem (Task, Skill, Hooks)
- Framework-agnostic methodology
- Progressive disclosure (<500 lines per file)

**Tech Stack:**
- Node.js (vanilla) + Bash for hooks
- JSON for registries (agent-registry.json, skill-rules.json)
- Markdown with YAML frontmatter for agents and skills
- Single dependency: minimatch (glob patterns)

---

## PHASE 0: Repository Foundation Verification

**Goal:** Verify existing repository state and establish proper git foundation for implementation tracking.

### Task 0.1: Verify Repository State and Configure Git Foundation

**Context:** The repository already exists with MAESTRO_BLUEPRINT.md, CLAUDE.md, and AGENT_DISCOVERY.md. This task ensures proper git configuration before implementation begins.

**Subtasks:**

- [ ] Verify git repository exists: `test -d .git && echo "✓ Git repository exists" || git init`
- [ ] Document current repository state: `git status` and `git log --oneline | head -5`
- [ ] Create or update .gitignore file with Maestro-specific patterns:
  - node_modules/ (hook dependencies)
  - .DS_Store (macOS artifacts)
  - *.log (general logs)
  - .maestro-work-log.txt (work tracker hook output)
  - .claude/hooks/node_modules/ (hook dependencies in subdirectory)
- [ ] Verify .gitignore covers necessary patterns: `cat .gitignore`
- [ ] If new .gitignore created, commit it: `git add .gitignore && git commit -m "Add .gitignore for Maestro implementation"`
- [ ] Confirm clean working state before implementation: `git status`

**Validation:**
```bash
# Verify git foundation
test -d .git && echo "✓ Git repository exists"
test -f .gitignore && echo "✓ .gitignore exists"
grep -q "node_modules" .gitignore && echo "✓ .gitignore configured for Maestro"
grep -q ".maestro-work-log.txt" .gitignore && echo "✓ Work tracker log ignored"

# Document starting point
echo "Current repository state:"
git log --oneline | head -3
echo "Files to be tracked during implementation:"
git status --short
```

---

## PHASE 1: Foundation (Core Framework)

**Goal:** Establish Maestro conductor persona with delegation-only mandate and evaluation protocol.

### Task 1.1: Create maestro.md Conductor Persona

**File:** `/Users/awesome/dev/devtest/Maestro/maestro.md`

**Content Template Guidance:**
Reference MAESTRO_BLUEPRINT.md sections 3 (Maestro as Conductor) and 4 (4-D Methodology) for detailed specifications. Each section below should be 10-30 lines with concrete examples.

**Subtasks:**

- [ ] Create maestro.md file
- [ ] Add YAML frontmatter (name: Maestro, role: AI Orchestration Conductor, mandate: "Delegate work, never execute")
- [ ] Write Core Identity section (~20 lines): You are a conductor, not an executor. Your role is orchestration. Include analogy to orchestra conductor.
- [ ] Write Responsibilities section (~30 lines): Six key responsibilities - analyze requests, delegate to agents, evaluate outputs, refine iteratively, communicate transparently, verify excellence. Each with 2-3 sentence explanation.
- [ ] Write "What You NEVER Do" section (~15 lines): NEVER write code directly, NEVER skip evaluation, NEVER accept "good enough", NEVER bypass agents for "quick fixes". Use strong imperative language.
- [ ] Write "What You ALWAYS Do" section (~20 lines): ALWAYS delegate via Task tool, ALWAYS provide 3P direction, ALWAYS run 4-D evaluation, ALWAYS iterate until excellent
- [ ] Write Delegation Decision Tree (~40 lines): Table format mapping request types to agents (list files→List agent, modify code→Write agent, research→BaseResearch, etc.). Include 8 agents with trigger examples.
- [ ] Write Delegation Format section (~30 lines): 3P Framework with template: Product (what to build), Process (how to build), Performance (excellence criteria). Include concrete example.
- [ ] Write 4-D Evaluation Protocol section (~25 lines): How to delegate to 4D-Evaluation agent, what to provide, how to interpret verdict (EXCELLENT vs NEEDS REFINEMENT)
- [ ] Write Refinement Loop section (~25 lines): When evaluation finds gaps, generate coaching feedback, re-delegate with specific improvements, repeat until excellent. No iteration limit.
- [ ] Write Transparency Protocol section (~30 lines):
  - [ ] Define **Maestro Emoji Protocol** for consistent transparency:
    - 🎼 Maestro actions and decisions (who's working)
    - 📋 Reasoning and analysis (why taking action)
    - 📤 Delegation to subagents (what's being delegated)
    - ⏳ Status updates during work (progress indicators)
    - 📥 Results received from subagents (what came back)
    - 🔍 Evaluation in progress (quality gate activation)
    - 🔄 Refinement iteration (coaching and re-delegation)
    - ✅ Completion confirmation (work done, criteria met)
  - [ ] Provide user communication pattern with example messages for each stage using emoji protocol
  - [ ] Emphasize consistency: Always use these emojis for their designated purposes
- [ ] Write Example Response Pattern section (~30 lines): Full example workflow from user request through delegation, evaluation, and completion
- [ ] Write Tools You Use section (~15 lines): Task (spawn subagents), TodoWrite (track work), AskUserQuestion (clarify requirements). No code tools.
- [ ] Write Escalation to User section (~15 lines): When to ask user - critical architectural decisions, ambiguous requirements, ethical concerns, conflicting constraints
- [ ] Write Context Preservation section (~15 lines): Keep orchestration decisions and evaluation summaries in main context. Heavy work stays in subagent context.
- [ ] Write Success Criteria section (~10 lines): Work passes 4-D evaluation, meets requirements, follows framework-agnostic principles, has evidence
- [ ] Add closing mantra: "Delegate. Evaluate. Refine. Repeat until excellent."
- [ ] Verify file is 290-330 lines (well under 500 line limit, allows clarity over compression): `wc -l maestro.md`
- [ ] Read file to confirm content complete, tone is authoritative, and 4-D principles are emphasized

**Line Count Rationale:**
Total estimated sections: Core Identity (~20) + Responsibilities (~30) + What You NEVER Do (~15) + What You ALWAYS Do (~20) + Delegation Decision Tree (~40) + Delegation Format (~30) + 4-D Evaluation Protocol (~25) + Refinement Loop (~25) + Transparency Protocol (~30) + Example Response Pattern (~30) + Tools (~15) + Escalation (~15) + Context Preservation (~15) + Success Criteria (~10) = ~320 lines + YAML frontmatter + headers + spacing = 290-330 lines total.

**Validation:**
```bash
test -f maestro.md && echo "✓ maestro.md exists"
grep -q "Delegate. Evaluate. Refine" maestro.md && echo "✓ Content complete"
grep -q "🎼.*Maestro" maestro.md && echo "✓ Emoji protocol included"
line_count=$(wc -l < maestro.md)
if [ "$line_count" -ge 290 ] && [ "$line_count" -le 330 ]; then
  echo "✓ maestro.md is $line_count lines (target: 290-330)"
elif [ "$line_count" -lt 500 ]; then
  echo "⚠ maestro.md is $line_count lines (acceptable but review if too short/long)"
else
  echo "✗ maestro.md is $line_count lines (EXCEEDS 500 line limit)"
fi
```

---

### Task 1.2: Create MAESTRO_SUBAGENT_PROTOCOL.md

**File:** `/Users/awesome/dev/devtest/Maestro/MAESTRO_SUBAGENT_PROTOCOL.md`

**Subtasks:**

- [ ] Create MAESTRO_SUBAGENT_PROTOCOL.md file
- [ ] Add header (Version 1.0, Purpose)
- [ ] Write Overview section
- [ ] Write Part 1: Pre-Delegation Analysis (task classification, agent selection, direction prep)
- [ ] Write Part 2: Delegation Format - 3P Framework (Product, Process, Performance with examples)
- [ ] Write Part 3: Subagent Return Format (structured report template with evidence)
- [ ] Write Part 4: Post-Return Evaluation Gate (4-D evaluation process, criteria)
- [ ] Write Part 5: Refinement Coaching (coaching format, re-delegation with coaching)
- [ ] Write Part 6: Iteration Protocol (rules, tracking, no limit on iterations)
- [ ] Write Part 7: User Communication (transparency messages for each stage)
- [ ] Write Part 8: Excellence Standards Checklist (9-item checklist)
- [ ] Write Part 9: Escalation to User (critical decisions, ambiguity, ethical concerns)
- [ ] Write Summary Flow diagram (visual flow from request to completion)
- [ ] Verify file is ~450 lines (under 500 line limit)
- [ ] Read file to confirm content complete

**Validation:**
```bash
test -f MAESTRO_SUBAGENT_PROTOCOL.md && echo "✓ Protocol exists"
grep -q "3P Framework" MAESTRO_SUBAGENT_PROTOCOL.md && echo "✓ Content complete"
wc -l MAESTRO_SUBAGENT_PROTOCOL.md  # Should be ~450 lines
```

---

### Task 1.3: Create .claude/settings.json Foundation

**File:** `/Users/awesome/dev/devtest/Maestro/.claude/settings.json`

**Subtasks:**

- [ ] Create .claude directory: `mkdir -p .claude/hooks`
- [ ] Create settings.json with empty hooks structure
- [ ] Add UserPromptSubmit array (empty for now, hooks added in Phase 4)
- [ ] Add PostToolUse array (empty for now)
- [ ] Add Stop array (empty for now)
- [ ] Verify settings.json is valid JSON
- [ ] Read file to confirm structure

**Validation:**
```bash
test -f .claude/settings.json && echo "✓ settings.json exists"
node -e "JSON.parse(require('fs').readFileSync('.claude/settings.json')); console.log('✓ Valid JSON')"
```

---

### Task 1.4: Validate Phase 1 Complete

**Subtasks:**

- [ ] Verify maestro.md exists and has content
- [ ] Verify MAESTRO_SUBAGENT_PROTOCOL.md exists and has content
- [ ] Verify .claude/settings.json exists and is valid JSON
- [ ] Verify all files under line limits
- [ ] Mark Phase 1 complete

**Validation:**
```bash
test -f maestro.md && echo "✓ maestro.md"
test -f MAESTRO_SUBAGENT_PROTOCOL.md && echo "✓ Protocol"
test -f .claude/settings.json && echo "✓ settings.json"
echo "✅ Phase 1 Complete"
```

---

## PHASE 2: Base Agents (Essential Workers)

**Goal:** Create 8 base agents for fundamental operations.

### Task 2.1: Create List Agent

**File:** `/Users/awesome/dev/devtest/Maestro/.claude/agents/list.md`

**Required Agent Return Format (All Agents Must Use This):**

All agents must return structured reports using this exact format to enable consistent 4-D evaluation:

```markdown
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 [AGENT NAME] REPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Task:** [What Maestro requested]

**Skills Used:** [Which skills were discovered and activated]

**Actions Taken:**
1. [Action with evidence - file:line references, commands run, specific steps]
2. [Action with evidence]

**Evidence:**
[Concrete proof of completion: code snippets, command output, file excerpts, data samples]

**Verification:**
- [ ] [Verification check 1 - tests pass, validation succeeds, etc.]
- [ ] [Verification check 2]

**Notes:**
[Optional: Caveats, assumptions, follow-up recommendations]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Why This Format Matters (4-D Alignment):**
- **Description:** Clear structure enables Maestro to understand what was done
- **Discernment:** Evidence enables quality evaluation without assumptions
- **Diligence:** Verification checklist demonstrates thoroughness
- **Delegation:** Structured format enables automated parsing and evaluation

**Subtasks:**

- [ ] Create .claude/agents directory: `mkdir -p .claude/agents`
- [ ] Create list.md file
- [ ] Add "# List Agent" header
- [ ] Write Purpose section (directory and file listing operations)
- [ ] Write "When to Use" section (triggers: list files, show directory, etc.)
- [ ] Write "Skills to Discover" section (List skill)
- [ ] Write Instructions section with 3 subsections:
  - [ ] 1. Initialization (check for List skill, parse delegation)
  - [ ] 2. Execution (determine approach, execute listing, format output, handle edge cases)
  - [ ] 3. Return Format (MUST use structured template above with evidence)
- [ ] Include required return format template in agent file
- [ ] Write "Tools Available" section (Bash, Glob, Skill)
- [ ] Write "Constraints" section (autonomous, use skills, return evidence in structured format)
- [ ] Write "Examples" section (3 examples showing return format: simple listing, recursive, filtered)
- [ ] Verify file is ~160-180 lines (increased for return format template)
- [ ] Read file to confirm content complete and return format is specified

**Validation:**
```bash
test -f .claude/agents/list.md && echo "✓ list.md created"
grep -q "## Purpose" .claude/agents/list.md && echo "✓ Has Purpose section"
grep -q "## Return Format" .claude/agents/list.md && echo "✓ Has Return Format"
wc -l .claude/agents/list.md  # Should be ~140 lines
```

---

### Task 2.2: Create Open Agent

**File:** `/Users/awesome/dev/devtest/Maestro/.claude/agents/open.md`

**Note:** Use the **Required Agent Return Format** specified in Task 2.1 for consistency across all agents.

**Subtasks:**

- [ ] Create open.md file
- [ ] Add "# Open Agent" header
- [ ] Write Purpose section (file reading with context preservation)
- [ ] Write "When to Use" section (triggers: open file, show contents, read file)
- [ ] Write "Skills to Discover" section (Open skill)
- [ ] Write Instructions section:
  - [ ] 1. Initialization (check for Open skill, parse delegation)
  - [ ] 2. Execution (determine approach - full vs partial, execute read, preserve context, handle edge cases)
  - [ ] 3. Return Format (use structured template from Task 2.1 with evidence)
- [ ] Include return format template in agent file
- [ ] Write "Tools Available" section (Read, Bash, Skill)
- [ ] Write "Constraints" section (must return structured report with evidence)
- [ ] Write "Examples" section (3 examples with return format: small file, large file partial, multiple files)
- [ ] Verify file length reasonable (~160-180 lines)
- [ ] Read file to confirm complete and return format specified

**Validation:**
```bash
test -f .claude/agents/open.md && echo "✓ open.md created"
grep -q "## Purpose" .claude/agents/open.md && echo "✓ Complete"
```

---

### Task 2.3: Create Read Agent

**File:** `/Users/awesome/dev/devtest/Maestro/.claude/agents/read.md`

**Note:** Use the **Required Agent Return Format** specified in Task 2.1.

**Subtasks:**

- [ ] Create read.md file
- [ ] Add "# Read Agent" header
- [ ] Write Purpose section (deep analysis of files, content, and systems - framework-agnostic)
- [ ] Write "When to Use" section (triggers: analyze, understand, explain)
- [ ] Write "Skills to Discover" section (Read skill)
- [ ] Write Instructions section:
  - [ ] 1. Initialization (check for Read skill, parse delegation)
  - [ ] 2. Execution (gather context, analyze thoroughly - structure/flow/patterns/dependencies/logic/edge cases, synthesize insights)
  - [ ] 3. Return Format (use structured template from Task 2.1 with comprehensive analysis evidence)
- [ ] Include return format template
- [ ] Write "Tools Available" section (Read, Grep, Glob, Bash, Skill)
- [ ] Write "Constraints" section (must provide evidence-based analysis)
- [ ] Write "Examples" section with return format (diverse examples: function analysis, document structure, configuration review)
- [ ] Verify file complete (~160-180 lines)

**Validation:**
```bash
test -f .claude/agents/read.md && echo "✓ read.md created"
```

---

### Task 2.4: Create Write Agent

**File:** `/Users/awesome/dev/devtest/Maestro/.claude/agents/write.md`

**Note:** Use the **Required Agent Return Format** specified in Task 2.1.

**Subtasks:**

- [ ] Create write.md file
- [ ] Add "# Write Agent" header
- [ ] Write Purpose section (content/file modifications with safety - framework-agnostic: code, docs, config, data)
- [ ] Write "When to Use" section (triggers: add, modify, fix, create, implement)
- [ ] Write "Skills to Discover" section (Write skill + domain-specific skills)
- [ ] Write Instructions section:
  - [ ] 1. Initialization (check for Write skill and domain skills, parse delegation)
  - [ ] 2. Execution (pre-modification analysis, make modifications using Edit or Write, verify changes)
  - [ ] 3. Return Format (use structured template from Task 2.1 with evidence of changes and verification)
- [ ] Include return format template
- [ ] Write "Tools Available" section (Read, Edit, Write, Grep, Bash, Skill)
- [ ] Write "Constraints" section (must verify changes, provide evidence)
- [ ] Write "Examples" section with return format (diverse: add feature, fix issue, create new content)
- [ ] Verify file complete (~180-200 lines, larger due to safety considerations)

**Validation:**
```bash
test -f .claude/agents/write.md && echo "✓ write.md created"
```

---

### Task 2.5: Create Fetch Agent

**File:** `/Users/awesome/dev/devtest/Maestro/.claude/agents/fetch.md`

**Note:** Use the **Required Agent Return Format** specified in Task 2.1.

**Subtasks:**

- [ ] Create fetch.md file
- [ ] Add "# Fetch Agent" header
- [ ] Write Purpose section (external data retrieval from APIs, web, services)
- [ ] Write "When to Use" section (triggers: fetch, get data, API, download, retrieve)
- [ ] Write "Skills to Discover" section (Fetch skill)
- [ ] Write Instructions section:
  - [ ] 1. Initialization (check for Fetch skill, parse delegation)
  - [ ] 2. Execution (prepare request, execute fetch, validate response, process data, handle edge cases)
  - [ ] 3. Return Format (use structured template from Task 2.1 with source, data samples, validation evidence)
- [ ] Include return format template
- [ ] Write "Tools Available" section (WebFetch, Bash, Skill)
- [ ] Write "Constraints" section (must validate responses, provide evidence)
- [ ] Write "Examples" section with return format (fetch JSON from API, fetch web content, fetch with retry)
- [ ] Verify file complete (~160-180 lines)

**Validation:**
```bash
test -f .claude/agents/fetch.md && echo "✓ fetch.md created"
```

---

### Task 2.6: Create BaseResearch Agent

**File:** `/Users/awesome/dev/devtest/Maestro/.claude/agents/base-research.md`

**Note:** Use the **Required Agent Return Format** specified in Task 2.1.

**Subtasks:**

- [ ] Create base-research.md file
- [ ] Add "# BaseResearch Agent" header
- [ ] Write Purpose section (information gathering and exploration - framework-agnostic for any content)
- [ ] Write "When to Use" section (triggers: find, search, research, locate, discover)
- [ ] Write "Skills to Discover" section (BaseResearch skill)
- [ ] Write Instructions section:
  - [ ] 1. Initialization (check for BaseResearch skill, parse delegation)
  - [ ] 2. Execution (plan research, execute research, synthesize findings, document sources)
  - [ ] 3. Return Format (use structured template from Task 2.1 with comprehensive research evidence and sources)
- [ ] Include return format template
- [ ] Write "Tools Available" section (Grep, Glob, Read, Bash, Skill)
- [ ] Write "Constraints" section (must cite sources, provide evidence)
- [ ] Write "Examples" section with return format (pattern discovery, location finding, inventory, trend analysis)
- [ ] Verify file complete (~170-190 lines)

**Validation:**
```bash
test -f .claude/agents/base-research.md && echo "✓ base-research.md created"
```

---

### Task 2.7: Create BaseAnalysis Agent

**File:** `/Users/awesome/dev/devtest/Maestro/.claude/agents/base-analysis.md`

**Note:** Use the **Required Agent Return Format** specified in Task 2.1.

**Subtasks:**

- [ ] Create base-analysis.md file
- [ ] Add "# BaseAnalysis Agent" header
- [ ] Write Purpose section (evaluation and assessment - framework-agnostic for any content/system)
- [ ] Write "When to Use" section (triggers: evaluate, assess, review, audit, analyze quality)
- [ ] Write "Skills to Discover" section (BaseAnalysis skill)
- [ ] Write Instructions section:
  - [ ] 1. Initialization (check for BaseAnalysis skill, parse delegation)
  - [ ] 2. Execution (prepare evaluation, execute evaluation across dimensions - quality/security/maintainability/usability, identify findings, generate recommendations)
  - [ ] 3. Return Format (use structured template from Task 2.1 with evaluation evidence, scores, and actionable recommendations)
- [ ] Include return format template
- [ ] Write "Tools Available" section (Read, Grep, Bash, Skill)
- [ ] Write "Constraints" section (must provide evidence-based evaluation, actionable recommendations)
- [ ] Write "Examples" section with return format (diverse: security review, quality assessment, usability evaluation, configuration audit)
- [ ] Verify file complete (~170-190 lines)

**Validation:**
```bash
test -f .claude/agents/base-analysis.md && echo "✓ base-analysis.md created"
```

---

### Task 2.8: Create 4D-Evaluation Agent

**File:** `/Users/awesome/dev/devtest/Maestro/.claude/agents/4d-evaluation.md`

**CRITICAL CLARIFICATION: "Performance" in 4-D Framework**

In the 4-D methodology, **"Performance" refers to QUALITY and EXCELLENCE standards, NOT execution speed or runtime metrics.**

**Performance Discernment evaluates:**
- ✅ Meets excellence standards (no "good enough")
- ✅ Simple yet powerful (elegance, not over-engineered)
- ✅ Fits project philosophy and established patterns
- ✅ Improves overall quality (enhances maintainability, clarity, usability)

**Performance Discernment does NOT evaluate:**
- ❌ Execution speed or runtime metrics
- ❌ Resource consumption (memory, CPU, disk)
- ❌ Algorithmic complexity or efficiency
- ❌ Benchmark results or profiling data

**Framework-Agnostic Note:** These criteria apply to ANY deliverable (code, documentation, analysis, research, configuration, etc.), not just software development.

This distinction is essential to prevent confusion during implementation and usage.

**Subtasks:**

- [ ] Create 4d-evaluation.md file
- [ ] Add "# 4D-Evaluation Agent" header
- [ ] Write Purpose section (quality assessment using 4-D framework, emphasize Discernment principle)
- [ ] Write "When to Use" section (internal agent, used by Maestro after subagent returns, quality gate)
- [ ] Write "Skills to Discover" section (4D-Evaluation skill)
- [ ] Write "IMPORTANT: Performance = Quality, Not Speed" section with clarification above
- [ ] Write Instructions section:
  - [ ] 1. Initialization (check for 4D-Evaluation skill, parse delegation)
  - [ ] 2. Execution:
    - [ ] Product Discernment (is it correct, elegant, complete, solving real problem?)
    - [ ] Process Discernment (was reasoning sound, thorough, using appropriate techniques?)
    - [ ] Performance Discernment (meets excellence standards, simple yet powerful, fits project patterns? NOT speed/memory)
    - [ ] Determine verdict (EXCELLENT or NEEDS REFINEMENT)
    - [ ] Generate coaching if needed (specific, actionable improvements)
  - [ ] 3. Return Format (4-D evaluation report with verdict and coaching)
- [ ] Write "Tools Available" section (Read, Grep, Bash, Skill)
- [ ] Write "Constraints" section (autonomous evaluation, no false positives)
- [ ] Write "Excellence Standards Checklist" section (9-item checklist from protocol, framework-agnostic language)
- [ ] Write "Performance = Quality Note" emphasizing throughout examples
- [ ] Write "Examples" section (use diverse examples: code modification, documentation, research report):
  - [ ] Example 1: EXCELLENT verdict (all 3 discernment areas pass, no coaching needed)
  - [ ] Example 2: NEEDS REFINEMENT - Product issue (incomplete edge case handling)
  - [ ] Example 3: NEEDS REFINEMENT - Performance issue (over-engineered, should be simpler)
- [ ] Verify file complete, framework-agnostic, and "Performance = quality NOT speed" is clear

**Validation:**
```bash
test -f .claude/agents/4d-evaluation.md && echo "✓ 4d-evaluation.md created"
```

---

### Task 2.9: Validate Phase 2 Complete

**Subtasks:**

- [ ] Verify all 8 agents exist: `ls -1 .claude/agents/*.md`
- [ ] Check each agent has required sections (Purpose, When to Use, Skills to Discover, Instructions, Return Format)
- [ ] Verify line counts reasonable (~150-250 lines each)
- [ ] Read sample agent to confirm quality
- [ ] Mark Phase 2 complete

**Validation:**
```bash
ls -1 .claude/agents/*.md | wc -l  # Should be 8
for file in .claude/agents/*.md; do
  grep -q "## Purpose" "$file" && echo "✓ $file has Purpose"
done
echo "✅ Phase 2 Complete"
```

---

## PHASE 3: Base Skills (Agnostic Guidance)

**Goal:** Create 8 base skills with progressive disclosure (<500 lines per SKILL.md).

**Resource File Content Taxonomy:**
To maintain consistency across all skills, follow this content division for the 3 resource files:

- **methodology.md**: Advanced techniques, deep theory, step-by-step processes, decision frameworks, strategic approaches
- **patterns.md**: Concrete examples, templates, code snippets (framework-agnostic), pattern library, common scenarios with solutions
- **troubleshooting.md**: Common problems with solutions, edge case handling, debugging techniques, performance optimization, known limitations

Each resource file must be <500 lines and focus exclusively on its designated content type.

### Task 3.1: Create List Skill

**Files:**
- `/Users/awesome/dev/devtest/Maestro/.claude/skills/list/SKILL.md`
- `/Users/awesome/dev/devtest/Maestro/.claude/skills/list/resources/methodology.md`
- `/Users/awesome/dev/devtest/Maestro/.claude/skills/list/resources/patterns.md`
- `/Users/awesome/dev/devtest/Maestro/.claude/skills/list/resources/troubleshooting.md`

**Required YAML Frontmatter Template (All Skills Must Use This):**

All skills must begin with YAML frontmatter using this exact format:

```yaml
---
name: skill-name
description: Brief description of when this skill activates and what guidance it provides (single line, <100 characters)
---
```

**Field Requirements:**
- **name**: Lowercase, hyphen-separated, matches directory name (e.g., "list", "base-research", "4d-evaluation")
- **description**: Single line, under 100 characters, describes:
  1. When the skill activates (trigger context)
  2. What guidance it provides (value proposition)
- **No additional fields** unless specified by skill-wizard for custom skills

**Examples:**
- ✅ Good: `description: Activates for directory listing operations; provides tool selection and output formatting guidance`
- ❌ Bad: `description: A skill for listing things` (too vague, doesn't explain when/what)
- ❌ Bad: Multi-line description (violates single-line requirement)

**Subtasks:**

- [ ] Create skill directory: `mkdir -p .claude/skills/list/resources`
- [ ] Create SKILL.md file
- [ ] Add YAML frontmatter using template above:
  - name: "list"
  - description: "Activates for directory/file listing operations; provides tool selection, filtering patterns, and output formatting guidance"
- [ ] Write Purpose section
- [ ] Write "When to Use This Skill" section (auto-activates when listing)
- [ ] Write Quick Start section (80% of use cases)
- [ ] Write Core Principles section (4-5 key principles)
- [ ] Write Tool Selection Matrix (table: scenario, tool, command, when to use)
- [ ] Write Common Patterns section (4-5 patterns with examples)
- [ ] Write Output Formatting Guidelines section
- [ ] Write Edge Cases section
- [ ] Write "Resources (Progressive Disclosure)" section (links to 3 resource files)
- [ ] Write Anti-Patterns section
- [ ] Write Quick Reference section (decision tree, common glob patterns)
- [ ] Verify SKILL.md is <500 lines
- [ ] Create resources/methodology.md (advanced filtering, organization strategies, performance, use cases, integration patterns)
- [ ] Verify methodology.md is <500 lines
- [ ] Create resources/patterns.md (pattern library, framework-specific patterns, output formats, pattern selection)
- [ ] Verify patterns.md is <500 lines
- [ ] Create resources/troubleshooting.md (common issues and solutions, edge case handling, performance optimization)
- [ ] Verify troubleshooting.md is <500 lines

**Validation:**
```bash
test -f .claude/skills/list/SKILL.md && echo "✓ list/SKILL.md"
test -d .claude/skills/list/resources && echo "✓ list/resources/"
wc -l .claude/skills/list/SKILL.md  # Must be <500 lines
wc -l .claude/skills/list/resources/*.md  # Each must be <500 lines
```

---

### Task 3.2: Create Open Skill

**Files:**
- `/Users/awesome/dev/devtest/Maestro/.claude/skills/open/SKILL.md`
- `/Users/awesome/dev/devtest/Maestro/.claude/skills/open/resources/*.md` (3 files)

**Note:** Use the **Required YAML Frontmatter Template** specified in Task 3.1 for consistency.

**Subtasks:**

- [ ] Create skill directory: `mkdir -p .claude/skills/open/resources`
- [ ] Create SKILL.md with YAML frontmatter (name: "open", description: single line covering when/what), Purpose, When to Use, Quick Start, Core Principles, Common Patterns, Resources, Anti-Patterns, Quick Reference
- [ ] Write content focused on: partial vs full reads, memory efficiency, context preservation
- [ ] Verify SKILL.md <500 lines
- [ ] Create resources/methodology.md (advanced read strategies, memory management, progressive loading)
- [ ] Create resources/patterns.md (read pattern library, format-specific handling)
- [ ] Create resources/troubleshooting.md (large file handling, encoding issues, performance)
- [ ] Verify all resource files <500 lines

**Validation:**
```bash
test -f .claude/skills/open/SKILL.md && echo "✓ open/SKILL.md"
wc -l .claude/skills/open/SKILL.md .claude/skills/open/resources/*.md
```

---

### Task 3.3: Create Read Skill

**Files:**
- `/Users/awesome/dev/devtest/Maestro/.claude/skills/read/SKILL.md`
- `/Users/awesome/dev/devtest/Maestro/.claude/skills/read/resources/*.md` (3 files)

**Note:** Use the **Required YAML Frontmatter Template** specified in Task 3.1.

**Subtasks:**

- [ ] Create skill directory: `mkdir -p .claude/skills/read/resources`
- [ ] Create SKILL.md with YAML frontmatter (name: "read", description: single line) and standard structure
- [ ] Write content focused on: analysis methodology, pattern recognition, code comprehension strategies
- [ ] Verify SKILL.md <500 lines
- [ ] Create resources/methodology.md (deep analysis techniques, comprehension strategies)
- [ ] Create resources/patterns.md (analysis patterns, language-specific approaches)
- [ ] Create resources/troubleshooting.md (complex code handling, large codebase strategies)
- [ ] Verify all resource files <500 lines

**Validation:**
```bash
test -f .claude/skills/read/SKILL.md && echo "✓ read/SKILL.md"
wc -l .claude/skills/read/SKILL.md .claude/skills/read/resources/*.md
```

---

### Task 3.4: Create Write Skill

**Files:**
- `/Users/awesome/dev/devtest/Maestro/.claude/skills/write/SKILL.md`
- `/Users/awesome/dev/devtest/Maestro/.claude/skills/write/resources/*.md` (3 files)

**Note:** Use the **Required YAML Frontmatter Template** specified in Task 3.1.

**Subtasks:**

- [ ] Create skill directory: `mkdir -p .claude/skills/write/resources`
- [ ] Create SKILL.md with YAML frontmatter (name: "write", description: single line) and standard structure
- [ ] Write content focused on: modification patterns, Edit vs Write tool selection, safety checks, verification, testing (framework-agnostic)
- [ ] Verify SKILL.md <500 lines
- [ ] Create resources/methodology.md (modification strategies, safety protocols, testing approaches)
- [ ] Create resources/patterns.md (modification patterns, refactoring patterns, creation patterns)
- [ ] Create resources/troubleshooting.md (merge conflicts, breaking changes, test failures)
- [ ] Verify all resource files <500 lines

**Validation:**
```bash
test -f .claude/skills/write/SKILL.md && echo "✓ write/SKILL.md"
wc -l .claude/skills/write/SKILL.md .claude/skills/write/resources/*.md
```

---

### Task 3.5: Create Fetch Skill

**Files:**
- `/Users/awesome/dev/devtest/Maestro/.claude/skills/fetch/SKILL.md`
- `/Users/awesome/dev/devtest/Maestro/.claude/skills/fetch/resources/*.md` (3 files)

**Note:** Use the **Required YAML Frontmatter Template** specified in Task 3.1.

**Subtasks:**

- [ ] Create skill directory: `mkdir -p .claude/skills/fetch/resources`
- [ ] Create SKILL.md with YAML frontmatter (name: "fetch", description: single line) and standard structure
- [ ] Write content focused on: error handling, retry logic, data validation, caching strategies
- [ ] Verify SKILL.md <500 lines
- [ ] Create resources/methodology.md (fetch strategies, error recovery, caching)
- [ ] Create resources/patterns.md (API patterns, web scraping patterns, data validation)
- [ ] Create resources/troubleshooting.md (network errors, rate limiting, auth issues)
- [ ] Verify all resource files <500 lines

**Validation:**
```bash
test -f .claude/skills/fetch/SKILL.md && echo "✓ fetch/SKILL.md"
wc -l .claude/skills/fetch/SKILL.md .claude/skills/fetch/resources/*.md
```

---

### Task 3.6: Create BaseResearch Skill

**Files:**
- `/Users/awesome/dev/devtest/Maestro/.claude/skills/base-research/SKILL.md`
- `/Users/awesome/dev/devtest/Maestro/.claude/skills/base-research/resources/*.md` (3 files)

**Note:** Use the **Required YAML Frontmatter Template** specified in Task 3.1.

**Subtasks:**

- [ ] Create skill directory: `mkdir -p .claude/skills/base-research/resources`
- [ ] Create SKILL.md with YAML frontmatter (name: "base-research", description: single line) and standard structure
- [ ] Write content focused on: research methodology, source evaluation, synthesis techniques, documentation (framework-agnostic)
- [ ] Verify SKILL.md <500 lines
- [ ] Create resources/methodology.md (research strategies, source evaluation, synthesis)
- [ ] Create resources/patterns.md (research patterns, query patterns, documentation patterns)
- [ ] Create resources/troubleshooting.md (no results, too many results, conflicting sources)
- [ ] Verify all resource files <500 lines

**Validation:**
```bash
test -f .claude/skills/base-research/SKILL.md && echo "✓ base-research/SKILL.md"
wc -l .claude/skills/base-research/SKILL.md .claude/skills/base-research/resources/*.md
```

---

### Task 3.7: Create BaseAnalysis Skill

**Files:**
- `/Users/awesome/dev/devtest/Maestro/.claude/skills/base-analysis/SKILL.md`
- `/Users/awesome/dev/devtest/Maestro/.claude/skills/base-analysis/resources/*.md` (3 files)

**Note:** Use the **Required YAML Frontmatter Template** specified in Task 3.1.

**Subtasks:**

- [ ] Create skill directory: `mkdir -p .claude/skills/base-analysis/resources`
- [ ] Create SKILL.md with YAML frontmatter (name: "base-analysis", description: single line) and standard structure
- [ ] Write content focused on: evaluation frameworks (quality, security, maintainability), assessment metrics, reporting patterns (framework-agnostic)
- [ ] Verify SKILL.md <500 lines
- [ ] Create resources/methodology.md (evaluation methodologies, framework selection, scoring)
- [ ] Create resources/patterns.md (analysis patterns, security patterns, quality patterns)
- [ ] Create resources/troubleshooting.md (subjective criteria, conflicting standards, tool integration)
- [ ] Verify all resource files <500 lines

**Validation:**
```bash
test -f .claude/skills/base-analysis/SKILL.md && echo "✓ base-analysis/SKILL.md"
wc -l .claude/skills/base-analysis/SKILL.md .claude/skills/base-analysis/resources/*.md
```

---

### Task 3.8: Create 4D-Evaluation Skill

**Files:**
- `/Users/awesome/dev/devtest/Maestro/.claude/skills/4d-evaluation/SKILL.md`
- `/Users/awesome/dev/devtest/Maestro/.claude/skills/4d-evaluation/resources/*.md` (3 files)

**CRITICAL CLARIFICATION: "Performance" = Quality, Not Speed**

Ensure the skill emphasizes that **Performance Discernment evaluates quality and excellence, NOT execution speed or runtime metrics.** This must be explicit throughout the skill to prevent confusion.

**Subtasks:**

- [ ] Create skill directory: `mkdir -p .claude/skills/4d-evaluation/resources`
- [ ] Create SKILL.md with standard structure and YAML frontmatter
- [ ] Write "Performance = Quality" clarification section prominently (before Quick Start)
- [ ] Write content focused on:
  - [ ] 4-D assessment criteria (Delegation, Description, Discernment, Diligence)
  - [ ] Performance Discernment = quality/excellence (simple yet powerful, fits patterns, improves quality)
  - [ ] Performance Discernment ≠ speed/memory/benchmarks
  - [ ] Scoring rubrics (framework-agnostic, applies to any deliverable)
  - [ ] Coaching feedback patterns (specific, actionable, constructive)
  - [ ] Verdict determination (EXCELLENT vs NEEDS REFINEMENT)
- [ ] Verify SKILL.md <500 lines
- [ ] Create resources/methodology.md:
  - [ ] 4-D methodology deep dive (each D explained in depth)
  - [ ] Assessment techniques (how to evaluate each dimension)
  - [ ] Performance clarification with examples across domains (code, docs, research)
  - [ ] Framework-agnostic language throughout
- [ ] Create resources/patterns.md:
  - [ ] Evaluation patterns (how to structure assessments)
  - [ ] Coaching patterns (constructive feedback templates)
  - [ ] Refinement patterns (how to guide improvement)
  - [ ] Cross-domain examples (software, documentation, analysis, configuration)
- [ ] Create resources/troubleshooting.md:
  - [ ] Borderline cases (when to mark EXCELLENT vs NEEDS REFINEMENT)
  - [ ] Conflicting criteria (trade-offs in quality)
  - [ ] Coaching effectiveness (how to give actionable feedback)
  - [ ] Common misconceptions (especially "Performance = speed" mistake)
- [ ] Verify all resource files <500 lines
- [ ] Verify framework-agnostic language throughout (no code-specific assumptions)

**Validation:**
```bash
test -f .claude/skills/4d-evaluation/SKILL.md && echo "✓ 4d-evaluation/SKILL.md"
wc -l .claude/skills/4d-evaluation/SKILL.md .claude/skills/4d-evaluation/resources/*.md
```

---

### Task 3.9: Validate Phase 3 Complete

**Subtasks:**

- [ ] Verify all 8 skills exist with SKILL.md and resources/ directory
- [ ] Check all SKILL.md files are <500 lines
- [ ] Check all resource files are <500 lines
- [ ] Verify all SKILL.md files have YAML frontmatter
- [ ] Verify progressive disclosure structure (main skill → resources)
- [ ] Read sample skill to confirm quality
- [ ] Mark Phase 3 complete

**Validation:**
```bash
ls -d .claude/skills/*/ | wc -l  # Should be 8
for dir in .claude/skills/*/; do
  test -f "${dir}SKILL.md" && echo "✓ ${dir}SKILL.md"
  test -d "${dir}resources" && echo "✓ ${dir}resources/"
done
echo "✅ Phase 3 Complete"
```

---

## PHASE 4: Discovery Systems (Hooks + Registries)

**Goal:** Implement automatic agent suggestion and skill discovery via hooks, embodying the **Delegation Discernment** principle by helping Maestro systematically identify the right agent/skill for each task.

**Important Note on Dependencies and Testing Strategy:**

This phase creates registries that reference agents (Phase 2) and skills (Phase 3) that must already exist for complete functionality. However, the hooks should be implemented with **graceful degradation** to support testing at each stage.

**Testing Strategy (Diligence Principle):**

**1. Unit Testing (During Phase 4):**
- Test hooks with **sample registry entries** (create minimal test fixtures)
- Verify JSON parsing and validation logic
- Test scoring/matching algorithms with mock inputs
- Validate output formatting and structure
- **Goal:** Ensure hook logic is correct before integration

**2. Integration Testing (Phase 7.3):**
- Verify hooks work with actual agent/skill files from Phases 2-3
- Test end-to-end discovery flow (user input → hook → suggestion → delegation)
- Validate trigger accuracy across diverse inputs
- **Goal:** Ensure complete system works as designed

**Graceful Degradation Requirements (Diligence and Transparency):**

Hooks must handle missing or incomplete dependencies without crashing:

- **If agent file missing:** Log warning to stderr, skip that agent in suggestions, continue processing
- **If skill file missing:** Log warning to stderr, skip that skill in suggestions, continue processing
- **If registry malformed:** Log error with specific JSON issue, provide helpful error message, exit gracefully
- **If no agents/skills match:** Return "No recommendation" message with suggestion to check registry configuration

**Why This Matters:**
- Enables **incremental implementation** (test as you build)
- Supports **debugging** (identify issues early)
- Demonstrates **diligence** (robust error handling)
- Maintains **transparency** (clear error messages)

**Example Graceful Handling:**
```javascript
// In maestro-agent-suggester.js
if (!fs.existsSync(agentFilePath)) {
  console.error(`⚠ Warning: Agent file not found: ${agentFilePath}`);
  console.error(`   Skipping agent '${agentName}' in suggestions`);
  continue; // Skip this agent, continue processing others
}
```

### Task 4.1: Create agent-registry.json

**File:** `/Users/awesome/dev/devtest/Maestro/.claude/agents/agent-registry.json`

**Subtasks:**

- [ ] Create agent-registry.json file
- [ ] Add version and agents object
- [ ] Add "list" agent entry (purpose, triggers: keywords/intentPatterns/operations, complexity: simple, autonomy: high)
- [ ] Add "open" agent entry (similar structure)
- [ ] Add "read" agent entry (complexity: medium)
- [ ] Add "write" agent entry (complexity: medium, autonomy: medium)
- [ ] Add "fetch" agent entry (complexity: simple)
- [ ] Add "base-research" agent entry (complexity: medium)
- [ ] Add "base-analysis" agent entry (complexity: medium)
- [ ] Add "4d-evaluation" agent entry (complexity: simple, internal: true)
- [ ] Verify valid JSON
- [ ] Read file to confirm completeness

**Validation:**
```bash
test -f .claude/agents/agent-registry.json && echo "✓ agent-registry.json"
node -e "const r=require('fs').readFileSync('.claude/agents/agent-registry.json'); JSON.parse(r); console.log('✓ Valid JSON')"
```

---

### Task 4.2: Create skill-rules.json

**File:** `/Users/awesome/dev/devtest/Maestro/.claude/skills/skill-rules.json`

**Purpose:** This registry enables **automatic skill discovery** for subagents, embodying the **Description and Discernment** principles by matching tasks to appropriate guidance.

**Structure Template (from MAESTRO_BLUEPRINT.md):**

```json
{
  "version": "1.0",
  "skills": {
    "skill-name": {
      "type": "domain|guardrail",
      "enforcement": "suggest|block|warn",
      "priority": "critical|high|medium|low",
      "promptTriggers": {
        "keywords": ["keyword1", "keyword2"],
        "intentPatterns": ["regex1", "regex2"]
      },
      "fileTriggers": {
        "pathPatterns": ["**/*.js", "src/**/*.ts"],
        "contentPatterns": ["regex1", "regex2"]
      },
      "skipConditions": {
        "sessionMarker": "skill-name-used",
        "fileMarker": "// @maestro-skip: skill-name"
      }
    }
  }
}
```

**Field Definitions:**
- **type**: `domain` (domain-specific guidance) or `guardrail` (quality/safety enforcement)
- **enforcement**: `suggest` (recommend), `block` (prevent action), `warn` (alert but allow)
- **priority**: `critical` (4-D evaluation), `high` (core operations), `medium` (common tasks), `low` (nice-to-have)
- **promptTriggers.keywords**: Words that indicate this skill is relevant (case-insensitive)
- **promptTriggers.intentPatterns**: Regex patterns matching task intent (case-insensitive)
- **fileTriggers.pathPatterns**: Glob patterns matching file paths (uses minimatch)
- **fileTriggers.contentPatterns**: Regex patterns matching file content
- **skipConditions**: Optional conditions to skip skill activation

**Subtasks:**

- [ ] Create skill-rules.json file with base structure
- [ ] Add version: "1.0"
- [ ] Add "list" skill entry:
  - type: "domain", enforcement: "suggest", priority: "medium"
  - promptTriggers: keywords ["list", "show", "directory"], intentPatterns ["list.*files", "show.*directory"]
  - fileTriggers: pathPatterns []
  - skipConditions: sessionMarker "list-skill-used"
- [ ] Add "open" skill entry:
  - type: "domain", enforcement: "suggest", priority: "medium"
  - promptTriggers: keywords ["open", "read", "view"], intentPatterns ["open.*file", "read.*file"]
- [ ] Add "read" skill entry:
  - type: "domain", enforcement: "suggest", priority: "high"
  - promptTriggers: keywords ["analyze", "understand", "explain"], intentPatterns ["analyze.*code", "understand.*how"]
  - fileTriggers: pathPatterns ["**/*.js", "**/*.ts", "**/*.py", "**/*.go", "**/*.java", "**/*.rb"]
- [ ] Add "write" skill entry:
  - type: "domain", enforcement: "suggest", priority: "high"
  - promptTriggers: keywords ["add", "modify", "fix", "create", "implement"], intentPatterns ["add.*to", "fix.*bug", "implement.*feature"]
  - fileTriggers: pathPatterns ["**/*.js", "**/*.ts", "**/*.py", "**/*.go", "**/*.java", "**/*.rb"]
- [ ] Add "fetch" skill entry:
  - type: "domain", enforcement: "suggest", priority: "medium"
  - promptTriggers: keywords ["fetch", "get", "download", "retrieve"], intentPatterns ["fetch.*from", "get.*data"]
- [ ] Add "base-research" skill entry:
  - type: "domain", enforcement: "suggest", priority: "high"
  - promptTriggers: keywords ["find", "search", "locate", "research"], intentPatterns ["find.*in.*codebase", "search.*for"]
- [ ] Add "base-analysis" skill entry:
  - type: "domain", enforcement: "suggest", priority: "high"
  - promptTriggers: keywords ["evaluate", "assess", "review", "audit"], intentPatterns ["evaluate.*quality", "assess.*security"]
  - fileTriggers: pathPatterns ["**/*.js", "**/*.ts", "**/*.py", "**/*.go", "**/*.java", "**/*.rb"]
- [ ] Add "4d-evaluation" skill entry:
  - type: "guardrail", enforcement: "suggest", priority: "critical"
  - promptTriggers: keywords ["evaluate", "assess", "discernment"], intentPatterns ["4-D.*evaluation", "quality.*gate"]
- [ ] Verify valid JSON: `node -e "JSON.parse(require('fs').readFileSync('.claude/skills/skill-rules.json'))"`
- [ ] Read file to confirm all 8 base skills included
- [ ] Verify all entries have required fields (type, enforcement, priority, promptTriggers)

**Validation:**
```bash
test -f .claude/skills/skill-rules.json && echo "✓ skill-rules.json exists"
node -e "const r=require('fs').readFileSync('.claude/skills/skill-rules.json'); JSON.parse(r); console.log('✓ Valid JSON')"
node -e "const r=JSON.parse(require('fs').readFileSync('.claude/skills/skill-rules.json')); console.log('✓ ' + Object.keys(r.skills).length + ' skills registered')"
grep -q '"type".*"guardrail"' .claude/skills/skill-rules.json && echo "✓ Guardrail skill (4d-evaluation) included"
```

---

### Task 4.3: Setup Hooks Package

**File:** `/Users/awesome/dev/devtest/Maestro/.claude/hooks/package.json`

**Subtasks:**

- [ ] Create package.json in .claude/hooks/
- [ ] Add name: "maestro-hooks"
- [ ] Add version: "1.0.0"
- [ ] Add type: "module" (for ES modules)
- [ ] Add dependencies: minimatch ^9.0.0
- [ ] Run npm install in .claude/hooks/
- [ ] Verify minimatch installed

**Validation:**
```bash
test -f .claude/hooks/package.json && echo "✓ package.json"
test -d .claude/hooks/node_modules/minimatch && echo "✓ minimatch installed"
```

---

### Task 4.4: Create maestro-agent-suggester.js Hook

**File:** `/Users/awesome/dev/devtest/Maestro/.claude/hooks/maestro-agent-suggester.js`

**Purpose:** This hook embodies the **Delegation Discernment** principle of the 4-D methodology by helping Maestro systematically identify the right agent for each task based on objective scoring criteria.

**Scoring Algorithm (Detailed Specification):**

For each agent in the registry, calculate a match score using these rules:

**1. Keyword Matching (Description Discernment)**
- Case-insensitive word boundary matching (`\bkeyword\b` regex pattern)
- Each unique keyword match from agent's keyword list: **+10 points**
- **Cap:** Maximum 20 points per agent (even if multiple keywords match)
- **Rationale:** Prevents keyword stuffing from dominating score
- **Example:** "add error handling" matches "add" keyword → +10 for Write agent

**2. Intent Pattern Matching (Delegation Discernment)**
- Test each intentPattern regex against full user prompt (case-insensitive flag)
- Each pattern match: **+15 points**
- **Cap:** Maximum 30 points per agent (even if multiple patterns match)
- **Rationale:** Intent patterns are more specific than keywords, deserve higher weight
- **Example:** "fix the authentication bug" matches `fix.*bug` pattern → +15 for Write agent

**3. Operation Type Matching (Description Discernment)**
- Check if prompt contains operation verbs from agent's operations array
- Each operation match: **+8 points**
- **Cap:** Maximum 16 points per agent
- **Example:** "modify the config file" → "modify" matches operations → +8 for Write agent

**4. Complexity Alignment (Diligence in Delegation)**
- Analyze prompt complexity using word count and structural cues:
  - **Simple:** < 10 words, single file reference, no "and"/"also" conjunctions
  - **Medium:** 10-30 words, or contains "and"/"also", or multiple files
  - **Complex:** > 30 words, or multiple steps indicated, or "first...then" patterns
- If prompt complexity matches agent.complexity: **+5 points**
- **Example:** "list files" (2 words) → simple → List agent (complexity: simple) gets +5

**5. Tie-Breaking and Multi-Agent Suggestion**
- Sort agents by total score (descending)
- If top score < 10 points: **No suggestion** (threshold not met)
- If top score ≥ 10 points: Suggest top agent
- If 2nd place within 10 points of 1st place: **Suggest both agents** (user choice)
- **Rationale:** Close scores indicate ambiguous delegation; transparency requires showing options

**6. Output Format (Transparency and Diligence)**
```
╔════════════════════════════════════════════════════════════╗
║ 🎯 MAESTRO AGENT SUGGESTION                                ║
╠════════════════════════════════════════════════════════════╣
║ RECOMMENDED AGENT: Write                                   ║
║ CONFIDENCE: High (Score: 33/75)                            ║
║                                                            ║
║ REASON:                                                    ║
║ • Keyword match: "add" (+10)                               ║
║ • Intent pattern: "add.*to" (+15)                          ║
║ • Operation match: "modify" (+8)                           ║
║                                                            ║
║ 📋 DELEGATION REMINDER:                                    ║
║ Use Task tool to delegate to Write agent with 3P format   ║
║ (Product, Process, Performance)                            ║
╚════════════════════════════════════════════════════════════╝
```

**Subtasks:**

- [ ] Create maestro-agent-suggester.js file with Node.js shebang
- [ ] Add shebang: `#!/usr/bin/env node`
- [ ] Add imports (fs, path, fileURLToPath)
- [ ] Read user prompt from stdin (handle multi-line input)
- [ ] Load agent-registry.json with error handling
- [ ] Implement analyzeComplexity(prompt) function:
  - [ ] Count words, check for conjunctions, count file references
  - [ ] Return 'simple' | 'medium' | 'complex'
- [ ] Implement matchKeywords(prompt, agent.keywords) with word boundary regex:
  - [ ] Case-insensitive matching
  - [ ] Cap at 20 points maximum
- [ ] Implement matchIntentPatterns(prompt, agent.intentPatterns):
  - [ ] Regex test with case-insensitive flag
  - [ ] Cap at 30 points maximum
- [ ] Implement matchOperations(prompt, agent.operations):
  - [ ] Check for operation verb presence
  - [ ] Cap at 16 points maximum
- [ ] Implement calculateComplexityBonus(prompt, agent.complexity):
  - [ ] Compare prompt complexity to agent complexity
  - [ ] Return 5 if match, 0 if no match
- [ ] Calculate total score for each agent (sum of all components)
- [ ] Sort agents by score and apply tie-breaking logic
- [ ] Generate formatted suggestion output with ASCII box borders
- [ ] Include: agent name(s), confidence level, score breakdown, delegation reminder with 3P reference
- [ ] Output to stdout
- [ ] Make file executable: `chmod +x maestro-agent-suggester.js`
- [ ] Test with multiple scenarios to verify scoring accuracy

**Validation:**
```bash
test -x .claude/hooks/maestro-agent-suggester.js && echo "✓ Executable"

# Test 1: Simple operation (should suggest Write agent)
echo "add error handling" | node .claude/hooks/maestro-agent-suggester.js | grep -q "RECOMMENDED AGENT: Write" && echo "✓ Test 1 passed: Write agent suggested"

# Test 2: Listing operation (should suggest List agent)
echo "list all files" | node .claude/hooks/maestro-agent-suggester.js | grep -q "RECOMMENDED AGENT: List" && echo "✓ Test 2 passed: List agent suggested"

# Test 3: Research operation (should suggest BaseResearch agent)
echo "find all API endpoints in the codebase" | node .claude/hooks/maestro-agent-suggester.js | grep -q "RECOMMENDED AGENT: BaseResearch" && echo "✓ Test 3 passed: BaseResearch agent suggested"

# Test 4: Verify score breakdown included
echo "add logging" | node .claude/hooks/maestro-agent-suggester.js | grep -q "REASON:" && echo "✓ Test 4 passed: Score breakdown present"

# Test 5: Verify delegation reminder included
echo "modify config" | node .claude/hooks/maestro-agent-suggester.js | grep -q "3P format" && echo "✓ Test 5 passed: 3P delegation reminder present"
```

---

### Task 4.5: Create subagent-skill-discovery.js Hook

**File:** `/Users/awesome/dev/devtest/Maestro/.claude/hooks/subagent-skill-discovery.js`

**Subtasks:**

- [ ] Create subagent-skill-discovery.js file
- [ ] Add shebang: `#!/usr/bin/env node`
- [ ] Add imports (fs, path, fileURLToPath, minimatch)
- [ ] Read subagent task from stdin
- [ ] Load skill-rules.json
- [ ] Implement matchSkill function (keyword matching, intent pattern matching, file pattern matching if context available)
- [ ] Find relevant skills
- [ ] Generate formatted suggestion output with skill recommendations
- [ ] Include: recommended skills, when to use each, reminder to use Skill tool
- [ ] Output to stdout
- [ ] Make file executable: `chmod +x subagent-skill-discovery.js`
- [ ] Test manually with sample input

**Validation:**
```bash
test -x .claude/hooks/subagent-skill-discovery.js && echo "✓ Executable"
echo "modify the auth service" | node .claude/hooks/subagent-skill-discovery.js
# Should output suggestion for Write skill
```

---

### Task 4.6: Create work-tracker.sh Hook

**File:** `/Users/awesome/dev/devtest/Maestro/.claude/hooks/work-tracker.sh`

**Subtasks:**

- [ ] Create work-tracker.sh file
- [ ] Add shebang: `#!/bin/bash`
- [ ] Read tool use information from stdin (tool name, file path)
- [ ] Log to .maestro-work-log.txt (append mode)
- [ ] Format: timestamp, tool, file path
- [ ] Silent operation (no stdout output)
- [ ] Make file executable: `chmod +x work-tracker.sh`
- [ ] Test manually

**Validation:**
```bash
test -x .claude/hooks/work-tracker.sh && echo "✓ Executable"
echo '{"tool":"Edit","file":"test.js"}' | .claude/hooks/work-tracker.sh
test -f .maestro-work-log.txt && echo "✓ Log created"
```

---

### Task 4.7: Create evaluation-reminder.js Hook

**File:** `/Users/awesome/dev/devtest/Maestro/.claude/hooks/evaluation-reminder.js`

**Subtasks:**

- [ ] Create evaluation-reminder.js file
- [ ] Add shebang: `#!/usr/bin/env node`
- [ ] Add imports
- [ ] Read conversation context from stdin (last messages)
- [ ] Detect if subagent just returned output (look for "REPORT" markers)
- [ ] Check if evaluation already performed (look for "4-D EVALUATION")
- [ ] If subagent returned but no evaluation yet, output reminder
- [ ] Format: ASCII box with reminder to run 4-D evaluation before accepting
- [ ] Suggest using Task tool with 4D-Evaluation agent
- [ ] Make file executable: `chmod +x evaluation-reminder.js`
- [ ] Test manually

**Validation:**
```bash
test -x .claude/hooks/evaluation-reminder.js && echo "✓ Executable"
# Manual test with sample context
```

---

### Task 4.8: Update settings.json with Hooks

**File:** `/Users/awesome/dev/devtest/Maestro/.claude/settings.json`

**Subtasks:**

- [ ] Read current settings.json
- [ ] Update UserPromptSubmit array:
  - [ ] Add maestro-agent-suggester.js hook entry
  - [ ] Add subagent-skill-discovery.js hook entry
- [ ] Update PostToolUse array:
  - [ ] Add work-tracker.sh hook entry with matcher: "Edit|Write"
- [ ] Update Stop array:
  - [ ] Add evaluation-reminder.js hook entry
- [ ] Verify valid JSON
- [ ] Read file to confirm structure

**Validation:**
```bash
node -e "const s=require('fs').readFileSync('.claude/settings.json'); JSON.parse(s); console.log('✓ Valid JSON')"
grep -q "maestro-agent-suggester" .claude/settings.json && echo "✓ Agent suggester hook configured"
grep -q "subagent-skill-discovery" .claude/settings.json && echo "✓ Skill discovery hook configured"
```

---

### Task 4.9: Validate Phase 4 Complete

**Subtasks:**

- [ ] Verify agent-registry.json exists and is valid
- [ ] Verify skill-rules.json exists and is valid
- [ ] Verify all 4 hooks exist and are executable
- [ ] Verify settings.json configured with all hooks
- [ ] Test hook execution manually
- [ ] Mark Phase 4 complete

**Validation:**
```bash
test -f .claude/agents/agent-registry.json && echo "✓ Agent registry"
test -f .claude/skills/skill-rules.json && echo "✓ Skill rules"
ls -la .claude/hooks/*.{js,sh} | grep -E '^-rwx' | wc -l  # Should be 4 executable
echo "✅ Phase 4 Complete"
```

---

## PHASE 5: Skill-Wizard (Expansion Capability)

**Goal:** Enable users to create custom skills following Maestro patterns.

### Task 5.1: Create skill-wizard.md Agent

**File:** `/Users/awesome/dev/devtest/Maestro/.claude/agents/skill-wizard.md`

**Subtasks:**

- [ ] Create skill-wizard.md file
- [ ] Add "# Skill-Wizard Agent" header
- [ ] Write Purpose section (meta-agent for creating new skills)
- [ ] Write "When to Use" section (user wants to create custom skill, encode team patterns, add domain guidance)
- [ ] Write "Skills to Discover" section (skill-developer skill if exists)
- [ ] Write Instructions section:
  - [ ] 1. Initialization (interview user about skill domain and purpose)
  - [ ] 2. Execution (gather requirements, generate skill structure, create SKILL.md, create resources/, create skill-rules.json entry, validate structure)
  - [ ] 3. Return Format (complete skill directory structure, registry entry, testing instructions)
- [ ] Write Interview Questions section (domain, purpose, triggers, patterns, anti-patterns)
- [ ] Write Generation Guidelines section (follow 500-line rule, progressive disclosure, framework-agnostic)
- [ ] Write "Tools Available" section (Write, Read, Edit, Skill)
- [ ] Write "Constraints" section
- [ ] Write "Examples" section
- [ ] Verify file complete

**Validation:**
```bash
test -f .claude/agents/skill-wizard.md && echo "✓ skill-wizard.md created"
grep -q "## Purpose" .claude/agents/skill-wizard.md && echo "✓ Complete"
```

---

### Task 5.2: Create skill-developer Skill

**Files:**
- `/Users/awesome/dev/devtest/Maestro/.claude/skills/skill-developer/SKILL.md`
- `/Users/awesome/dev/devtest/Maestro/.claude/skills/skill-developer/resources/*.md` (3 files)

**Note:** Use the **Required YAML Frontmatter Template** specified in Task 3.1.

**Subtasks:**

- [ ] Create skill directory: `mkdir -p .claude/skills/skill-developer/resources`
- [ ] Create SKILL.md with YAML frontmatter (name: "skill-developer", description: single line) and standard structure
- [ ] Write content focused on: how to write effective skills, progressive disclosure patterns, trigger configuration, testing methodology, framework-agnostic principles
- [ ] Include skill template examples
- [ ] Include trigger configuration guidelines
- [ ] Include resource file organization patterns
- [ ] Verify SKILL.md <500 lines
- [ ] Create resources/methodology.md (skill design methodology, requirement gathering, structure planning)
- [ ] Create resources/patterns.md (skill patterns, template library, trigger patterns)
- [ ] Create resources/troubleshooting.md (activation issues, scope issues, maintenance)
- [ ] Verify all resource files <500 lines

**Validation:**
```bash
test -f .claude/skills/skill-developer/SKILL.md && echo "✓ skill-developer/SKILL.md"
wc -l .claude/skills/skill-developer/SKILL.md .claude/skills/skill-developer/resources/*.md
```

---

### Task 5.3: Update skill-rules.json with skill-developer

**File:** `/Users/awesome/dev/devtest/Maestro/.claude/skills/skill-rules.json`

**Subtasks:**

- [ ] Read current skill-rules.json
- [ ] Add "skill-developer" entry
- [ ] Set type: "domain"
- [ ] Set enforcement: "suggest"
- [ ] Set priority: "high"
- [ ] Add promptTriggers: keywords ["create skill", "new skill", "skill wizard"], intentPatterns ["create.*skill", "new.*skill"]
- [ ] Add fileTriggers (empty or for skill-related files)
- [ ] Add skipConditions
- [ ] Verify valid JSON
- [ ] Save file

**Validation:**
```bash
grep -q "skill-developer" .claude/skills/skill-rules.json && echo "✓ skill-developer registered"
node -e "const s=require('fs').readFileSync('.claude/skills/skill-rules.json'); JSON.parse(s); console.log('✓ Valid JSON')"
```

---

### Task 5.4: Update agent-registry.json with skill-wizard

**File:** `/Users/awesome/dev/devtest/Maestro/.claude/agents/agent-registry.json`

**Subtasks:**

- [ ] Read current agent-registry.json
- [ ] Add "skill-wizard" entry
- [ ] Set purpose: "Meta-agent for creating new skills"
- [ ] Add triggers: keywords ["create skill", "new skill", "skill wizard"], intentPatterns, operations ["create"]
- [ ] Set complexity: "medium"
- [ ] Set autonomy: "medium"
- [ ] Verify valid JSON
- [ ] Save file

**Validation:**
```bash
grep -q "skill-wizard" .claude/agents/agent-registry.json && echo "✓ skill-wizard registered"
node -e "const r=require('fs').readFileSync('.claude/agents/agent-registry.json'); JSON.parse(r); console.log('✓ Valid JSON')"
```

---

### Task 5.5: Validate Phase 5 Complete

**Subtasks:**

- [ ] Verify skill-wizard.md agent exists
- [ ] Verify skill-developer skill exists with resources
- [ ] Verify both registered in their respective registries
- [ ] Test skill-wizard can be discovered with appropriate trigger
- [ ] Mark Phase 5 complete

**Validation:**
```bash
test -f .claude/agents/skill-wizard.md && echo "✓ Skill-wizard agent"
test -f .claude/skills/skill-developer/SKILL.md && echo "✓ skill-developer skill"
echo "create new skill" | node .claude/hooks/maestro-agent-suggester.js | grep -q "skill-wizard" && echo "✓ Discovery works"
echo "✅ Phase 5 Complete"
```

---

## PHASE 6: Polish & Documentation

**Goal:** Complete documentation and example workflows.

### Task 6.1: Create README.md

**File:** `/Users/awesome/dev/devtest/Maestro/README.md`

**Subtasks:**

- [ ] Create README.md file
- [ ] Add project title and tagline
- [ ] Write Overview section (what is Maestro, core philosophy)
- [ ] Write Key Features section (delegation-first, 4-D methodology, progressive disclosure, framework-agnostic)
- [ ] Write Quick Start section (installation, basic usage, first delegation)
- [ ] Write Architecture section (three-tier diagram, component overview)
- [ ] Write Core Components section (maestro.md, agents, skills, hooks)
- [ ] Write How It Works section (user request → delegation → evaluation → refinement flow)
- [ ] Write Example Workflow section (simple example with output samples)
- [ ] Write Documentation Links section (links to other docs)
- [ ] Write Contributing section (link to CONTRIBUTING.md)
- [ ] Write License section
- [ ] Verify file complete and well-formatted

**Validation:**
```bash
test -f README.md && echo "✓ README.md created"
grep -q "## Quick Start" README.md && echo "✓ Has Quick Start"
```

---

### Task 6.2: Create EXAMPLES.md

**File:** `/Users/awesome/dev/devtest/Maestro/EXAMPLES.md`

**Subtasks:**

- [ ] Create EXAMPLES.md file
- [ ] Add title and introduction
- [ ] Write Example 1: Simple File Modification
  - [ ] User request
  - [ ] Maestro analysis and delegation
  - [ ] Subagent execution with skill usage
  - [ ] 4-D evaluation (EXCELLENT)
  - [ ] User confirmation
- [ ] Write Example 2: Codebase Research
  - [ ] User request
  - [ ] Maestro delegation to BaseResearch
  - [ ] Research execution with findings
  - [ ] Evaluation and completion
- [ ] Write Example 3: Multi-Step Feature Implementation
  - [ ] Complex user request
  - [ ] Maestro breaks down into tasks
  - [ ] Multiple agent delegations
  - [ ] Evaluations between steps
  - [ ] Complete workflow
- [ ] Write Example 4: Refinement Iteration
  - [ ] User request
  - [ ] Initial implementation
  - [ ] 4-D evaluation finds issues
  - [ ] Maestro coaches and re-delegates
  - [ ] Refined implementation
  - [ ] Evaluation passes
- [ ] Add section explaining transparency elements (emojis, formatting)
- [ ] Verify examples are realistic and complete

**Validation:**
```bash
test -f EXAMPLES.md && echo "✓ EXAMPLES.md created"
grep -q "Example 1:" EXAMPLES.md && echo "✓ Has examples"
```

---

### Task 6.3: Create CONTRIBUTING.md

**File:** `/Users/awesome/dev/devtest/Maestro/CONTRIBUTING.md`

**Subtasks:**

- [ ] Create CONTRIBUTING.md file
- [ ] Write Introduction section (how to extend Maestro)
- [ ] Write Adding New Agents section:
  - [ ] Create .claude/agents/your-agent.md
  - [ ] Follow base agent specification
  - [ ] Add entry to agent-registry.json
  - [ ] Test discovery
- [ ] Write Adding New Skills section:
  - [ ] Create .claude/skills/your-skill/ directory
  - [ ] Create SKILL.md (<500 lines)
  - [ ] Create resources/ directory
  - [ ] Add entry to skill-rules.json
  - [ ] Test activation
- [ ] Write Modifying Hooks section (when and how to modify hooks)
- [ ] Write Guidelines section:
  - [ ] Framework agnostic principle
  - [ ] Progressive disclosure (<500 lines)
  - [ ] Evidence-based practices
  - [ ] Testing before contributing
- [ ] Write Using Skill-Wizard section (easiest way to add skills)
- [ ] Add Pull Request guidelines if applicable
- [ ] Verify file complete

**Validation:**
```bash
test -f CONTRIBUTING.md && echo "✓ CONTRIBUTING.md created"
grep -q "## Adding New Agents" CONTRIBUTING.md && echo "✓ Has agent instructions"
```

---

### Task 6.4: Create TROUBLESHOOTING.md

**File:** `/Users/awesome/dev/devtest/Maestro/TROUBLESHOOTING.md`

**Subtasks:**

- [ ] Create TROUBLESHOOTING.md file
- [ ] Write Introduction section
- [ ] Write Common Issues section:
  - [ ] "Maestro is writing code directly" → Check maestro.md loaded, verify hooks working
  - [ ] "Skills not activating" → Check skill-rules.json, verify hooks installed
  - [ ] "Agent not being suggested" → Check agent-registry.json triggers
  - [ ] "Hooks not running" → Check settings.json, verify executable permissions
  - [ ] "4-D evaluation not happening" → Check evaluation-reminder.js hook
- [ ] Write Hook Debugging section (how to test hooks manually)
- [ ] Write Registry Debugging section (validating JSON, testing triggers)
- [ ] Write Performance Issues section (context bloat, skill loading)
- [ ] Write FAQ section (common questions and answers)
- [ ] Add links to relevant documentation
- [ ] Verify file complete

**Validation:**
```bash
test -f TROUBLESHOOTING.md && echo "✓ TROUBLESHOOTING.md created"
grep -q "## Common Issues" TROUBLESHOOTING.md && echo "✓ Has troubleshooting content"
```

---

### Task 6.5: Create example/ Directory with Workflow Files

**Files:** Various example markdown files

**Example Strategy:**
These are aspirational examples showing how Maestro WILL work once fully implemented. They are fictional transcripts that demonstrate the intended behavior patterns using the **4-D methodology** (Delegation, Description, Discernment, Diligence). Use realistic scenarios (e.g., "add logging to authentication service") and show complete workflows with actual agent/skill names from this implementation.

**Example Content Requirements:**

Each example MUST include these elements to demonstrate the complete Maestro framework:

**1. User Request (Realistic Scenario)**
- Single clear sentence or 2-3 sentence request
- Represents real-world development task
- Example: "Add rate limiting to the API authentication endpoint"

**2. Hook Output (Agent/Skill Suggestion)**
- Show actual hook output format from Phase 4 hooks
- ASCII box borders with 🎯 emoji
- Score breakdown and delegation reminder
- Example from maestro-agent-suggester.js output format

**3. Maestro Response (Delegation Decision with 4-D Principles)**
- **Delegation:** "I'm delegating this to the Write agent..."
- **Description (3P Framework):**
  - **Product:** What to build (specific deliverable)
  - **Process:** How to build it (methodology to follow)
  - **Performance:** Excellence criteria (quality standards)
- Use transparency emoji: 🎼 (Maestro), 📋 (reason), 📤 (delegation)

**4. Subagent Context (Skill Discovery + Work Process)**
- Show skill discovery hook output (subagent-skill-discovery.js format)
- Subagent acknowledges skill activation: "I'm using the Write skill..."
- Show work process with evidence (file:line references)
- Use realistic file paths: `src/auth/rate_limiter.js:42`

**5. Subagent Return Report (Structured with Evidence)**
- Use exact return format from agent specifications (Gap G1 template):
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 [AGENT NAME] REPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
**Task:** [What was requested]
**Skills Used:** [Which skills]
**Actions Taken:** [With file:line]
**Evidence:** [Code snippets, output]
**Verification:** [Tests pass, build succeeds]
**Notes:** [Any caveats]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**6. 4-D Evaluation (Discernment Gate)**
- Show 4D-Evaluation agent delegation
- **Product Discernment:** Is it correct, elegant, complete?
- **Process Discernment:** Was reasoning sound, thorough?
- **Performance Discernment:** Meets excellence standards? (quality, NOT speed)
- **Verdict:** EXCELLENT or NEEDS REFINEMENT
- If NEEDS REFINEMENT: Include coaching feedback with specific improvements

**7. Final Outcome (Success or Refinement)**
- If EXCELLENT: "✅ Work complete, meets all 4-D criteria"
- If NEEDS REFINEMENT: Show re-delegation with coaching → refined implementation → second evaluation → EXCELLENT
- User confirmation or next steps

**Formatting Standards:**
- Use actual emoji protocol: 🎼 🎯 📋 📤 ⏳ 📥 🔍 🔄 ✅
- Include realistic code snippets (5-10 lines max)
- Show file:line references: `auth_service.js:42`
- Use ASCII box borders consistently
- Keep examples concise (2-3 pages each)

**Purpose and Validation:**
- **Purpose:** User-facing documentation showing complete orchestration flow
- **Validation:** Each example demonstrates at least one 4-D principle explicitly
- **Validation:** All agent/skill names match Phase 2-3 actual implementations
- **Validation:** 3P framework used in every delegation

**Subtasks:**

- [ ] Create examples/ directory: `mkdir -p examples`
- [ ] Create examples/simple-file-modification.md (annotated transcript)
  - [ ] User request: "Add error logging to authentication service"
  - [ ] Show hook suggestion (Write agent)
  - [ ] Maestro 3P delegation with Delegation principle
  - [ ] Write agent work with skill usage and evidence
  - [ ] 4-D evaluation (EXCELLENT verdict)
  - [ ] Include file:line references, code snippets, emoji protocol
- [ ] Create examples/codebase-research.md (research workflow)
  - [ ] User question: "Where are API rate limits enforced?"
  - [ ] Show hook suggestion (BaseResearch agent)
  - [ ] Maestro 3P delegation with Description principle
  - [ ] BaseResearch findings with evidence (file:line references)
  - [ ] 4-D evaluation focusing on Diligence in research thoroughness
- [ ] Create examples/multi-step-feature.md (complex feature)
  - [ ] Complex request: "Implement user session timeout with configurable duration"
  - [ ] Task breakdown by Maestro (3 subtasks)
  - [ ] Multiple agent delegations (Write, Read, BaseAnalysis)
  - [ ] Evaluations between steps demonstrating quality gates
  - [ ] Final integration and completion
- [ ] Create examples/refinement-iteration.md (shows refinement loop demonstrating Discernment)
  - [ ] Request: "Add input validation to user registration"
  - [ ] Initial Write agent implementation
  - [ ] 4-D evaluation finds issues: NEEDS REFINEMENT (incomplete edge case handling)
  - [ ] Maestro coaching feedback: "Add validation for email format, password strength, SQL injection prevention"
  - [ ] Re-delegation with coaching
  - [ ] Refined implementation with complete validation
  - [ ] Second 4-D evaluation: EXCELLENT
  - [ ] Demonstrates Discernment principle (catching issues before they cascade)
- [ ] Verify all examples include required elements (7 elements listed above)
- [ ] Verify examples demonstrate 4-D principles explicitly
- [ ] Verify examples use actual agent/skill names from implementation
- [ ] Verify emoji protocol used consistently
- [ ] Verify 3P framework in every delegation

**Validation:**
```bash
test -d examples && echo "✓ examples/ directory"
ls -1 examples/*.md | wc -l  # Should be 4
```

---

### Task 6.6: Validate Phase 6 Complete

**Subtasks:**

- [ ] Verify README.md exists and is complete
- [ ] Verify EXAMPLES.md exists with 4 examples
- [ ] Verify CONTRIBUTING.md exists with guidelines
- [ ] Verify TROUBLESHOOTING.md exists with solutions
- [ ] Verify examples/ directory with workflow files
- [ ] Read through all docs for quality and completeness
- [ ] Mark Phase 6 complete

**Validation:**
```bash
test -f README.md && echo "✓ README.md"
test -f EXAMPLES.md && echo "✓ EXAMPLES.md"
test -f CONTRIBUTING.md && echo "✓ CONTRIBUTING.md"
test -f TROUBLESHOOTING.md && echo "✓ TROUBLESHOOTING.md"
test -d examples && echo "✓ examples/"
echo "✅ Phase 6 Complete"
```

---

## PHASE 7: FINAL VALIDATION & TESTING

**Goal:** Verify complete Maestro framework is ready to use through structural validation, framework-agnosticism checks, and end-to-end integration testing.

### Task 7.1: Structural Validation

**Subtasks:**

- [ ] Verify Phase 0 complete (git initialized, .gitignore)
- [ ] Verify Phase 1 complete (maestro.md, protocol, settings.json)
- [ ] Verify Phase 2 complete (8 agents)
- [ ] Verify Phase 3 complete (8 skills with progressive disclosure)
- [ ] Verify Phase 4 complete (registries, 4 hooks, settings configured)
- [ ] Verify Phase 5 complete (skill-wizard, skill-developer)
- [ ] Verify Phase 6 complete (4 docs, examples)
- [ ] Run complete directory structure check
- [ ] Validate all JSON files
- [ ] Verify all hooks are executable
- [ ] Verify all line count limits enforced (<500 for all skills)

**Validation:**
```bash
# Directory structure
tree -L 3 .claude/

# JSON validation
for json in .claude/agents/agent-registry.json .claude/skills/skill-rules.json .claude/settings.json .claude/hooks/package.json; do
  node -e "JSON.parse(require('fs').readFileSync('$json')); console.log('✓ $json valid')"
done

# Hook executability
ls -la .claude/hooks/*.{js,sh} | grep -E '^-rwx'

# Line counts
for skill in .claude/skills/*/SKILL.md; do
  lines=$(wc -l < "$skill")
  [ $lines -lt 500 ] && echo "✓ $skill: $lines lines" || echo "✗ $skill: $lines lines (OVER LIMIT)"
done

echo "✅ Phase 7.1: Structural Validation Complete"
```

---

### Task 7.2: Framework-Agnosticism Validation

**Goal:** Ensure all agents and skills are truly framework-agnostic with no technology-specific assumptions.

**Subtasks:**

- [ ] Search for framework-specific terms in agents:
  ```bash
  grep -ri "react\|vue\|angular\|svelte\|express\|koa\|fastify\|django\|flask\|rails\|laravel\|spring" .claude/agents/*.md
  ```
- [ ] Expected result: No matches (exit code 1)
- [ ] Search for framework-specific terms in skills:
  ```bash
  grep -ri "react\|vue\|angular\|svelte\|express\|koa\|fastify\|django\|flask\|rails\|laravel\|spring" .claude/skills/*/SKILL.md .claude/skills/*/resources/*.md
  ```
- [ ] Expected result: No matches (exit code 1)
- [ ] Search for package manager assumptions (should be generic):
  ```bash
  grep -ri "npm install\|pip install\|gem install\|composer install" .claude/agents/*.md .claude/skills/*/SKILL.md
  ```
- [ ] Expected result: Only generic references like "install dependencies", not specific commands
- [ ] Manually review 2-3 agents to verify guidance is methodology-focused, not technology-focused
- [ ] Manually review 2-3 skills to verify patterns are universal, not framework-specific
- [ ] If violations found: Fix the content to be framework-agnostic, then re-run checks

**Validation:**
```bash
# Should return "No framework-specific terms found"
if ! grep -riq "react\|vue\|angular\|express\|django\|rails" .claude/agents/ .claude/skills/; then
  echo "✓ No framework-specific terms found"
else
  echo "✗ Framework-specific terms detected - review needed"
  grep -ri "react\|vue\|angular\|express\|django\|rails" .claude/agents/ .claude/skills/ | head -10
fi
echo "✅ Phase 7.2: Framework-Agnosticism Validated"
```

---

### Task 7.3: End-to-End Integration Testing

**Goal:** Test the complete discovery and delegation workflow with realistic scenarios.

**Subtasks:**

- [ ] Test 1: Agent Discovery Hook
  - [ ] Run: `echo "list all JavaScript files" | node .claude/hooks/maestro-agent-suggester.js`
  - [ ] Verify: Should suggest "List" agent with high score
  - [ ] Verify: Output includes ASCII box, agent name, reason
- [ ] Test 2: Agent Discovery Hook (Write Operation)
  - [ ] Run: `echo "add error handling to the login function" | node .claude/hooks/maestro-agent-suggester.js`
  - [ ] Verify: Should suggest "Write" agent
  - [ ] Verify: Score is above minimum threshold (10+)
- [ ] Test 3: Agent Discovery Hook (Research Operation)
  - [ ] Run: `echo "find all API endpoints in the codebase" | node .claude/hooks/maestro-agent-suggester.js`
  - [ ] Verify: Should suggest "BaseResearch" agent
- [ ] Test 4: Skill Discovery Hook
  - [ ] Run: `echo "analyze the authentication module" | node .claude/hooks/subagent-skill-discovery.js`
  - [ ] Verify: Should suggest "Read" or "BaseAnalysis" skill
- [ ] Test 5: Work Tracker Hook
  - [ ] Run: `echo '{"tool":"Edit","file":"test.js"}' | .claude/hooks/work-tracker.sh`
  - [ ] Verify: .maestro-work-log.txt is created/updated
  - [ ] Verify: Entry contains timestamp and file path
- [ ] Test 6: Registry Completeness
  - [ ] Verify all 8 agents from Phase 2 are in agent-registry.json
  - [ ] Verify all 9 skills (8 base + skill-developer) are in skill-rules.json
  - [ ] Check each entry has required fields: triggers, complexity/priority, description
- [ ] Test 7: Hook Integration in settings.json
  - [ ] Verify UserPromptSubmit contains both agent and skill discovery hooks
  - [ ] Verify PostToolUse contains work-tracker hook
  - [ ] Verify Stop contains evaluation-reminder hook
  - [ ] Verify all hook paths are correct
- [ ] Test 8: File Structure Completeness (Granular Validation for Diligence)
  - [ ] Verify agent files:
    ```bash
    agent_count=$(find .claude/agents -type f -name "*.md" ! -name "*registry*" | wc -l | tr -d ' ')
    [ "$agent_count" -eq 9 ] && echo "✓ 9 agent .md files" || echo "✗ Expected 9 agents, found $agent_count"
    ```
  - [ ] Verify skill SKILL.md files:
    ```bash
    skill_main_count=$(find .claude/skills -type f -name "SKILL.md" | wc -l | tr -d ' ')
    [ "$skill_main_count" -eq 9 ] && echo "✓ 9 SKILL.md files" || echo "✗ Expected 9 SKILL.md, found $skill_main_count"
    ```
  - [ ] Verify skill resources directories:
    ```bash
    skill_resource_dirs=$(find .claude/skills -type d -name "resources" | wc -l | tr -d ' ')
    [ "$skill_resource_dirs" -eq 9 ] && echo "✓ 9 resources/ directories" || echo "✗ Expected 9 resources dirs, found $skill_resource_dirs"
    ```
  - [ ] Verify skill resource files (minimum 3 per skill):
    ```bash
    skill_resources=$(find .claude/skills/*/resources -type f -name "*.md" | wc -l | tr -d ' ')
    [ "$skill_resources" -ge 27 ] && echo "✓ At least 27 resource files (3+ per skill)" || echo "✗ Expected at least 27, found $skill_resources"
    ```
  - [ ] Verify JSON registry files:
    ```bash
    json_count=$(find .claude -type f -name "*.json" ! -path "*/node_modules/*" | wc -l | tr -d ' ')
    [ "$json_count" -ge 3 ] && echo "✓ At least 3 JSON files (registries + settings)" || echo "✗ Expected at least 3, found $json_count"
    ```
  - [ ] Verify specific registries exist:
    ```bash
    test -f .claude/agents/agent-registry.json && echo "✓ agent-registry.json"
    test -f .claude/skills/skill-rules.json && echo "✓ skill-rules.json"
    test -f .claude/settings.json && echo "✓ settings.json"
    ```

**Validation:**
```bash
echo "Running End-to-End Integration Tests..."

# Test agent discovery
echo "Test 1: List agent discovery"
echo "list all files" | node .claude/hooks/maestro-agent-suggester.js | grep -q "list" && echo "✓ List agent discovered"

echo "Test 2: Write agent discovery"
echo "add logging" | node .claude/hooks/maestro-agent-suggester.js | grep -q "write" && echo "✓ Write agent discovered"

echo "Test 3: Research agent discovery"
echo "find all functions" | node .claude/hooks/maestro-agent-suggester.js | grep -q "research" && echo "✓ Research agent discovered"

# Test skill discovery
echo "Test 4: Skill discovery"
echo "analyze code" | node .claude/hooks/subagent-skill-discovery.js | grep -q "read\|analysis" && echo "✓ Skill discovered"

# Test work tracker
echo "Test 5: Work tracker"
echo '{"tool":"Edit","file":"test.js"}' | .claude/hooks/work-tracker.sh
test -f .maestro-work-log.txt && echo "✓ Work log created"

# Test registry completeness
echo "Test 6: Registry completeness"
agent_count=$(node -e "const r=require('./.claude/agents/agent-registry.json'); console.log(Object.keys(r.agents).length)")
skill_count=$(node -e "const r=require('./.claude/skills/skill-rules.json'); console.log(Object.keys(r.skills).length)")
[ "$agent_count" -eq 9 ] && echo "✓ 9 agents in registry" || echo "✗ Expected 9 agents, found $agent_count"
[ "$skill_count" -eq 9 ] && echo "✓ 9 skills in registry" || echo "✗ Expected 9 skills, found $skill_count"

# Test file counts
echo "Test 8: File structure"
md_count=$(find .claude -type f -name "*.md" | wc -l | tr -d ' ')
[ "$md_count" -eq 45 ] && echo "✓ 45 markdown files" || echo "~ Found $md_count markdown files (expected 45)"

echo "✅ Phase 7.3: Integration Testing Complete"
```

---

### Task 7.4: Error Recovery Documentation

**Goal:** Document common failure scenarios and recovery procedures.

**Subtasks:**

- [ ] Create docs directory if it doesn't exist: `mkdir -p docs`
- [ ] Create docs/ERROR_RECOVERY.md file
- [ ] Add "Validation Failure Scenarios" section with recovery procedures:
  - [ ] **Phase validation fails**: Document which files to check, how to verify manually, when to re-run validation
  - [ ] **JSON validation fails**: Show how to use `node -e` to find JSON syntax errors, common fixes
  - [ ] **Hook execution fails**: Permission issues (`chmod +x`), path issues, dependency issues (`npm install`)
  - [ ] **Line count over limit**: How to split content into resources, what to move
  - [ ] **Framework-specific terms found**: How to make content generic, examples of agnostic phrasing
  - [ ] **Integration test fails**: How to debug hook logic, check registry entries, verify file paths
- [ ] Add "Mid-Phase Failure Recovery" section:
  - [ ] If implementation stops mid-phase, how to determine what's complete
  - [ ] Using git status to see uncommitted changes
  - [ ] Re-running validation commands for completed subtasks
  - [ ] Safe to continue from last completed subtask
- [ ] Add "Rollback Procedures" section:
  - [ ] How to revert to previous phase using git
  - [ ] When to rollback vs fix forward
  - [ ] Preserving work while rolling back (git stash, branches)
- [ ] Add "Troubleshooting Checklist" section:
  - [ ] Working directory is project root
  - [ ] Node.js and npm are installed
  - [ ] minimatch dependency is installed in .claude/hooks/
  - [ ] All hooks have executable permissions
  - [ ] JSON files have valid syntax
  - [ ] File paths match specification exactly
- [ ] Verify file is complete and helpful

**Validation:**
```bash
test -f docs/ERROR_RECOVERY.md && echo "✓ Error recovery documentation created"
grep -q "Validation Failure Scenarios" docs/ERROR_RECOVERY.md && echo "✓ Recovery procedures documented"
```

---

### Task 7.5: Create Implementation Summary

**Subtasks:**

- [ ] Count total files created
- [ ] Verify all phases completed
- [ ] Document any deviations from plan
- [ ] Create checklist of validation results
- [ ] Mark entire implementation complete

**Summary Report:**
```
MAESTRO FRAMEWORK IMPLEMENTATION COMPLETE

Phase 0: Repository Initialization - ✅
  - Git repository initialized
  - .gitignore configured

Phase 1: Foundation - ✅
  - maestro.md (~250 lines, with content templates)
  - MAESTRO_SUBAGENT_PROTOCOL.md (~450 lines)
  - .claude/settings.json (foundation)

Phase 2: Base Agents - ✅
  - 9 agents created (8 base + skill-wizard)
  - All follow base agent specification
  - All ~150-250 lines

Phase 3: Base Skills - ✅
  - 9 skills with progressive disclosure (8 base + skill-developer)
  - All SKILL.md <500 lines
  - All resource files <500 lines
  - Content taxonomy enforced (methodology/patterns/troubleshooting)
  - 36 total skill files (9 SKILL.md + 27 resources)

Phase 4: Discovery Systems - ✅
  - agent-registry.json (9 agents with scoring algorithm)
  - skill-rules.json (9 skills)
  - 4 hooks (executable, tested)
  - settings.json configured with all hooks
  - Dependency clarification documented

Phase 5: Skill-Wizard - ✅
  - skill-wizard.md agent
  - skill-developer skill
  - Both registered in respective registries

Phase 6: Documentation - ✅
  - README.md
  - EXAMPLES.md (with aspirational examples)
  - CONTRIBUTING.md
  - TROUBLESHOOTING.md
  - 4 example workflows

Phase 7: Validation & Testing - ✅
  - Structural validation (file counts, JSON, permissions, line limits)
  - Framework-agnosticism validation (no React/Vue/Django/etc.)
  - End-to-end integration testing (8 test scenarios)
  - Error recovery documentation (docs/ERROR_RECOVERY.md)
  - Implementation summary

Total Files: ~80+ files
Total Lines: ~15,000-20,000 lines
Framework: VALIDATED AND READY TO USE
```

---

## EXECUTION NOTES

**Recommended Execution Approach:**

After approval, use **superpowers:executing-plans** or **superpowers:subagent-driven-development** to implement this plan.

**Execution Strategy:**
1. Execute phases sequentially (0 → 1 → 2 → 3 → 4 → 5 → 6 → 7)
2. Validate after each phase before proceeding
3. Use bite-sized subtasks for efficient progress tracking
4. Commit after each major task completion with descriptive messages
5. Run validation commands to verify correctness at each step
6. If validation fails, consult docs/ERROR_RECOVERY.md for recovery procedures

**Quality Gates:**
- Phase 0 validation before starting Phase 1 (git initialized)
- Phase 1 validation before starting Phase 2 (foundation complete)
- Phase 2 validation before starting Phase 3 (all agents created)
- Phase 3 validation before starting Phase 4 (all skills created)
- Phase 4 validation before starting Phase 5 (discovery systems working)
- Phase 5 validation before starting Phase 6 (skill-wizard complete)
- Phase 6 validation before starting Phase 7 (documentation complete)
- Phase 7 comprehensive validation (structural + framework-agnostic + integration testing)

**Success Criteria:**
- ✅ All files created with exact paths specified in plan
- ✅ All JSON files valid and loadable
- ✅ All hooks executable with correct permissions
- ✅ All line limits enforced (<500 for all skills)
- ✅ All agents follow base specification pattern
- ✅ All skills follow progressive disclosure pattern
- ✅ Framework-agnostic (no React/Vue/Django/Rails/Express assumptions)
- ✅ Content taxonomy enforced (methodology/patterns/troubleshooting)
- ✅ Complete documentation with examples
- ✅ All integration tests passing
- ✅ Error recovery documentation in place
- ✅ System validated and ready for immediate use

**Error Recovery:**
If any validation fails or implementation encounters issues:
1. Check docs/ERROR_RECOVERY.md (created in Phase 7.4)
2. Use git to identify what's been completed: `git status` and `git log`
3. Re-run validation commands for the current phase
4. Fix issues and continue from last successful subtask
5. Escalate to user if fundamental design issues are discovered

---

**END OF IMPLEMENTATION PLAN**

*Ready to build Maestro: Excellence through delegation, evaluation, and iteration.*
