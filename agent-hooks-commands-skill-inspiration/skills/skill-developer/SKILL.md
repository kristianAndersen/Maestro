---
name: skill-developer
description: Guide for creating Maestro Marketplace-compatible skills. Use when creating new skills, updating existing skills, generating manifests, understanding Tactical 4-D methodology, micro-skill chaining, or debugging skill discovery. Covers three-tier architecture (Conductor → Orchestrators → Musicians), skill types (Tier 2 orchestrators vs Tier 3 micro-skills), manifest creation, registry integration, and progressive disclosure with <500-line rule.
version: 4.0.0
type: skill
tier: 2
allowed-tools: Read, Write, Edit, Glob, Grep
model: sonnet
---

# Skill Developer - Maestro Marketplace Edition

**Domain**: Skill Development & Framework Integration
**Expertise**: Maestro three-tier architecture, Tactical 4-D methodology, manifest creation, registry integration
**Role**: Section Leader - Guides creation of marketplace-compatible skills and micro-skills

---

## Purpose

Guide creation of effective, reusable skills and micro-skills that integrate with the Maestro Marketplace. Transform knowledge into discoverable, chainable components that work across code, marketing, analytics, and any domain.

**What Maestro Delegates:**
- Create new skill for specific domain
- Update existing skill to marketplace standards
- Generate skill manifest for registry discovery
- Debug skill discovery or chaining issues

**What This Skill Delivers:**
- Complete skill implementation (SKILL.md + manifest)
- Marketplace-compatible structure
- Registry-discoverable metadata
- Tactical 4-D or pure execution patterns

---

## Integration with Maestro Marketplace

### Three-Tier Architecture

```
MAESTRO (Tier 1 - The Conductor)
  • Strategic 4-D methodology
  • Queries registry for skill discovery
  • Evaluates final outcomes only
  • Zero domain knowledge, pure orchestration
  ↓ delegates with strategic direction

SKILLS (Tier 2 - The Orchestrators) ← WE CREATE THESE
  • Tactical 4-D methodology
  • Domain expertise (code, marketing, analytics, etc.)
  • Chain micro-skills to accomplish goals
  • Autonomous error recovery (5-level system)
  ↓ chains micro-skills with parameters

MICRO-SKILLS (Tier 3 - The Musicians) ← WE ALSO CREATE THESE
  • Pure execution (NO orchestration)
  • Smart error handling (autonomous retry + escalation)
  • Single-purpose operations
  • Context-aware escalation
```

### Skill Types in Marketplace

**Tier 2 - Skills (Orchestrators)**:
- Apply Tactical 4-D (DELEGATION, DESCRIPTION, DISCERNMENT, DILIGENCE)
- Bring domain expertise
- Chain micro-skills in sequences
- Handle tactical decisions
- **AI Fluency Mode:** Augmentation (collaborative thinking partner)

**Tier 3 - Micro-Skills (Musicians)**:
- NO orchestration (single operation only)
- Two-level error handling (retry + escalate)
- Provide rich context on failure
- Enable skill composition
- **AI Fluency Mode:** Automation (execute specific tasks)

### Human-AI Interaction Modes (AI Fluency Framework)

**Understanding the tier-to-mode mapping:**

| Tier | Role | AI Fluency Mode | How It Works |
|------|------|-----------------|--------------|
| **Tier 1** | Maestro (Conductor) | **Agency** | Works independently on your behalf with configured behavior patterns |
| **Tier 2** | Skills (Orchestrators) | **Augmentation** | Collaborates as thinking partner, iterative back-and-forth |
| **Tier 3** | Micro-Skills (Musicians) | **Automation** | Executes specific tasks based on instructions |

**Why this matters for skill creators:**

- **Agency (Tier 1):** You configure Maestro's knowledge (via CLAUDE.md, skills) and behavior patterns (excellence standards), then it orchestrates work autonomously
- **Augmentation (Tier 2):** Skills collaborate with Maestro through quality gates and refinement loops - both contribute to outcomes
- **Automation (Tier 3):** Micro-skills execute atomic operations without decision-making - deterministic and reliable

**Design implications:**
- Tier 2 skills should embrace iteration (refinement loops expected)
- Tier 3 micro-skills should be predictable (no surprises, clear success/failure)
- Tier 1 configuration determines overall behavior (set standards once, apply everywhere)

---

## Skill Creation Process (Marketplace Edition)

### Step 1: Determine Skill Type

**Ask:** What tier does this belong in?

**Tier 2 - Skill (Orchestrator)** if:
- ✓ Requires domain expertise (code quality, brand voice, data validation)
- ✓ Chains multiple operations together
- ✓ Makes tactical decisions based on results
- ✓ Needs to adapt approach based on context

**Examples:** `code-analysis`, `content-analysis`, `data-validation`, `file-reader`

**Tier 3 - Micro-Skill (Musician)** if:
- ✓ Performs single, atomic operation
- ✓ No decision-making (just execute and report)
- ✓ Used as building block by skills
- ✓ Can retry autonomously on transient errors

**Examples:** `read-file`, `write-file`, `parse-json`, `parse-csv`

---

### Step 2: Gather Requirements (Tactical DESCRIPTION)

**For Skills (Tier 2):**

Ask the user:
1. **Domain & Expertise**: What specialized knowledge does this provide?
   - "Analyze JavaScript/TypeScript code quality"
   - "Validate brand voice consistency"
   - "Check data quality dimensions"

2. **Use Cases**: Give 3+ concrete examples
   - "Detect security vulnerabilities in authentication code"
   - "Check blog posts for SEO optimization"
   - "Validate customer CSV for completeness"

3. **Micro-Skills Needed**: What operations will you chain?
   - search-codebase → read-file → parse-ast → detect-patterns
   - read-file → extract-text → analyze-sentiment → check-seo
   - read-file → parse-csv → check-schema → detect-anomalies

4. **Success Criteria**: How do you know it worked?
   - "Report with severity-ranked issues and file locations"
   - "Score with specific improvement recommendations"
   - "Quality percentage with categorized problems"

**For Micro-Skills (Tier 3):**

Ask the user:
1. **Single Operation**: What ONE thing does this do?
   - "Read file from disk"
   - "Parse JSON string to object"
   - "Write content to file"

2. **Inputs**: What does it need?
   - File path, encoding
   - JSON string, max depth
   - File path, content, permissions

3. **Outputs**: What does it return?
   - Success: file content + metadata
   - Error: code + message + context

4. **Errors**: What can go wrong? Which are retriable?
   - ENOENT (not found) - escalate
   - EBUSY (file locked) - retry 3x with backoff
   - PARSE_ERROR (invalid JSON) - escalate with location

---

### Step 3: Create the Manifest (Registry Discovery)

**Every skill MUST have a manifest for registry discovery.**

#### For Tier 2 Skills:

**Template: `skill-name.skill.json`**
```json
{
  "name": "skill-name",
  "type": "skill",
  "tier": 2,
  "description": "Comprehensive description with domain expertise, use cases, and capabilities. Include keywords users would search for. 100-1000 chars.",

  "inputs": [
    {
      "name": "file_paths",
      "type": "array<string>",
      "description": "Source files to analyze (supports glob patterns)",
      "required": true
    },
    {
      "name": "analysis_depth",
      "type": "string",
      "description": "Level: 'quick', 'standard', 'deep'",
      "required": false,
      "default": "standard"
    }
  ],

  "outputs": [
    {
      "name": "analysis_report",
      "type": "structured_document",
      "description": "Complete analysis with findings, severity, locations, recommendations"
    }
  ],

  "capabilities": [
    "primary-capability",
    "related-capability",
    "domain-specific-capability",
    "use-case-keyword",
    "another-search-term"
  ],

  "dependencies": [
    "read-file",
    "parse-json",
    "search-codebase"
  ],

  "suggestedNextSkills": [
    {
      "skill": "follow-up-skill",
      "reason": "Common next step after analysis",
      "priority": "high"
    }
  ],

  "estimatedComplexity": "medium",
  "version": "1.0.0"
}
```

**Key Fields for Discovery:**
- **description**: Most important! Include domain, use cases, keywords
- **capabilities**: Freeform tags for semantic search (5-10 terms)
- **inputs/outputs**: Type-safe specification

#### For Tier 3 Micro-Skills:

**Template: `micro-skill-name.skill.json`**
```json
{
  "name": "micro-skill-name",
  "type": "micro-skill",
  "tier": 3,
  "description": "Single-purpose operation description. Clear, specific, no orchestration. 50-500 chars.",

  "inputs": [
    {
      "name": "file_path",
      "type": "string",
      "description": "Absolute path to file",
      "required": true
    }
  ],

  "outputs": [
    {
      "name": "content",
      "type": "string",
      "description": "File contents as string"
    },
    {
      "name": "metadata",
      "type": "object",
      "description": "Size, encoding, modified date"
    }
  ],

  "errorHandling": {
    "retriableErrors": ["EBUSY", "EAGAIN"],
    "retryStrategy": "exponential",
    "maxAttempts": 3
  },

  "capabilities": ["file-operations", "read", "io"],
  "estimatedComplexity": "low",
  "version": "1.0.0"
}
```

**Manifest Generation Helper:**

When creating manifests, ensure:
- [ ] name: lowercase-with-hyphens, no spaces
- [ ] description: Specific, includes domain keywords
- [ ] capabilities: 5-10 searchable terms
- [ ] inputs/outputs: Complete with types and descriptions
- [ ] tier: Correct value (2 for skills, 3 for micro-skills)
- [ ] type: Matches tier ("skill" or "micro-skill")
- [ ] Valid JSON (test with `jq . manifest.json`)

---

### Step 4: Write the SKILL.md File

**Critical Rules:**
- **<500 lines** in main SKILL.md (Anthropic best practice)
- **Use references/** directory for deep content
- **Imperative form**: "Execute X", not "You should execute X"

#### For Tier 2 Skills (Tactical 4-D Structure):

**Use template:** `templates/skill-template-tactical-4d.md`

**Required Sections:**
1. **Purpose** - What this skill does and delivers
2. **Integration with Maestro** - Receives Strategic direction
3. **Tactical 4-D Methodology**:
   - **DELEGATION**: Plan which micro-skills to chain
   - **DESCRIPTION**: Provide parameters to each micro-skill
   - **DISCERNMENT**: Evaluate each micro-skill output
   - **DILIGENCE**: 5-level error recovery
4. **Domain Expertise Application** - YOUR UNIQUE VALUE
5. **Micro-Skill Chains** - Sequences you'll use
6. **Examples** - Complete use cases with all 4 D's

**Domain Expertise Section (Critical):**
This is what makes your skill valuable! Document:
- Patterns you detect (code smells, brand voice issues, data anomalies)
- Thresholds you apply (complexity > 10, reading grade > 12, completeness < 95%)
- Standards you check against (OWASP Top 10, Flesch-Kincaid, IQR method)
- Recommendations you provide (specific, actionable, prioritized)

**Example Structure:**
```markdown
## Domain Expertise Application

### Code Smell Patterns

**Long Parameter List:**
```typescript
// Problem: > 5 parameters indicates missing abstraction
function createUser(name, email, age, address, phone, role, ...) {
  // Hard to maintain, error-prone
}

// Recommendation: Use object parameter
function createUser(userData: UserData) {
  // Clear, extensible, type-safe
}
```

### Complexity Thresholds
- Functions > 10 cyclomatic complexity: Refactor candidate
- Files > 300 lines: Consider splitting
- Nested depth > 3: Simplification needed

### Best Practices Checked
1. No var usage (use let/const)
2. Async functions use try/catch
3. Array methods preferred over loops
4. [... your expertise ...]
```

#### For Tier 3 Micro-Skills (Pure Execution):

**Use template:** `templates/micro-skill-template.md`

**Required Sections:**
1. **Purpose** - Single operation this performs
2. **Integration with Skills** - How orchestrators use this
3. **Input Parameters** - Exact specification
4. **Output Format** - Success and error structures
5. **Error Handling** - Two-level system:
   - Level 1: Autonomous Retry (transient errors)
   - Level 2: Context-Aware Escalation (complex errors)
6. **Examples** - Success, retry, escalation scenarios

**Error Handling (Critical for Micro-Skills):**

**Level 1: Autonomous Retry** - Handle without escalation
```typescript
Retriable Errors:
- EBUSY (file locked): 3 attempts, exponential backoff (100ms, 200ms, 400ms)
- EAGAIN (resource temp unavailable): 2 attempts, linear backoff (50ms intervals)
- Network timeouts: 3 attempts, exponential backoff

Return: Success with attempt count noted
```

**Level 2: Context-Aware Escalation** - Provide rich context
```typescript
Non-Retriable Errors:
- ENOENT (file not found): Escalate with similar files, path suggestions
- PARSE_ERROR (invalid syntax): Escalate with line/column, near text
- ENOSPC (disk full): Escalate with space available, large files

Return: {
  success: false,
  error: {
    code: "ENOENT",
    message: "File not found: /path/to/file.txt",
    context: {
      searchedPaths: ["/path/to/file.txt", "/alt/path/file.txt"],
      similarFiles: ["/path/to/file.md", "/path/to/config.txt"],
      suggestion: "Check if file was moved or renamed"
    }
  }
}
```

---

### Step 5: Create Directory Structure

**For Skills (Tier 2):**
```bash
mkdir -p .claude/skills/skill-name/{references,examples}
touch .claude/skills/skill-name/SKILL.md
touch .claude/skills/skill-name/skill-name.skill.json
```

**For Micro-Skills (Tier 3):**
```bash
mkdir -p .claude/skills/micro-skills/micro-skill-name
touch .claude/skills/micro-skills/micro-skill-name/SKILL.md
touch .claude/skills/micro-skills/micro-skill-name/micro-skill-name.skill.json
```

**Optional directories:**
- `references/` - Detailed documentation (>500 lines)
- `examples/` - Sample inputs/outputs
- `scripts/` - Helper scripts (if needed)

---

### Step 6: Implement the Skill

**Writing Guidelines:**

**Style:**
- ✅ Imperative form: "Execute", "Analyze", "Return"
- ❌ Second person: "You should", "You can"
- ✅ Active voice: "Skill chains micro-skills"
- ❌ Passive voice: "Micro-skills are chained by skill"

**For Skills - Implement Tactical 4-D:**

**1. DELEGATION Section:**
```markdown
## Tactical Execution Plan

Goal: [From Maestro's strategic direction]

Tactical Breakdown:
1. Discover files (micro-skill: search-codebase)
   - Parameters: { pattern: "**/*.ts", exclude: ["node_modules"] }
   - Expected: array<string> of file paths

2. Read files (micro-skill: read-file, parallel)
   - Parameters: { file_path: from_step_1, encoding: "utf-8" }
   - Expected: string content for each file

3. Parse code (micro-skill: parse-ast)
   - Parameters: { code: from_step_2, language: "typescript" }
   - Expected: AST tree structure

4. Apply domain expertise:
   a. Calculate complexity (domain logic)
   b. Detect code smells (domain logic)
   c. Check best practices (domain logic)

5. Generate report (domain logic)
   - Aggregate findings
   - Prioritize by severity
   - Format for readability
```

**2. DESCRIPTION Section:**
```markdown
## Micro-Skill Invocations

### Step 1: Search Codebase
{
  operation: "search-codebase",
  parameters: {
    pattern: "**/*.{js,ts,jsx,tsx}",
    exclude: ["node_modules", "dist"],
    max_results: 1000
  },
  purpose: "Locate all source files for analysis",
  expected_output: {
    type: "array<string>",
    format: "absolute file paths",
    validation: "all paths must exist"
  }
}
```

**3. DISCERNMENT Section:**
```markdown
## Output Evaluation

After Search Codebase:
✓ Check:
  - At least 1 file found
  - All paths exist
  - File extensions match expected types

⚠️ If no files found:
  - Try broader pattern
  - Check if wrong directory
  - Escalate if project structure unexpected
```

**4. DILIGENCE Section:**
```markdown
## Error Handling

### File Not Found
Level 1: Check if path is relative, try absolute
Level 2: Search for file by name
Level 3: Skip and note in report
Level 4: Escalate if critical file

### Parse Errors
Level 1: Try lenient parser
Level 2: Use text-based pattern matching
Level 3: Mark file as unparseable, continue
Level 4: Escalate if entire codebase unparseable
```

**For Micro-Skills - Implement Error Handling:**

Focus on the two-level system:

```markdown
## Error Handling Implementation

### Autonomous Retry (Level 1)

Transient errors handled without escalation:

EBUSY (file locked):
  Attempts: 3
  Backoff: Exponential (100ms, 200ms, 400ms)
  Reason: File may be briefly locked by another process

EACCES (permission denied):
  Attempts: 2
  Backoff: Linear (50ms intervals)
  Reason: Permissions may be in flux

Return format on success after retry:
{
  success: true,
  data: { ... },
  metadata: {
    attemptsRequired: 2,
    retryReason: "EBUSY"
  }
}

### Context-Aware Escalation (Level 2)

Non-retriable errors escalated with rich context:

ENOENT (file not found):
{
  success: false,
  error: {
    code: "ENOENT",
    message: "File not found: /path/to/file.txt",
    context: {
      searchedPaths: ["/path/to/file.txt"],
      directoryExists: true,
      similarFiles: ["file.md", "file2.txt"],
      permissions: "drwxr-xr-x",
      suggestion: "Check filename spelling or use glob pattern"
    }
  }
}
```

---

### Step 7: Test with Registry

**Verify Discovery:**

```bash
# 1. Test manifest is valid JSON
jq . .claude/skills/skill-name/skill-name.skill.json

# 2. Check registry finds your skill
cd registry
npm test  # Should detect your new skill

# 3. Test semantic search
# Add to registry/skill-registry.test.ts:
test('discovers skill-name for relevant queries', async () => {
  const results = await registry.search({
    intent: 'your skill use case in natural language'
  });

  const found = results.skills.find(s => s.name === 'skill-name');
  expect(found).toBeDefined();
  expect(found.score).toBeGreaterThan(10);
});
```

**Verify Skill Works:**

Create test scenario:
```markdown
## Test Scenario: [Skill Name]

**Setup:**
[Create test files, data, or environment]

**Invocation:**
Maestro receives request: "[Natural language request]"
Registry should find: skill-name (score > threshold)

**Expected Execution:**
1. Skill chains: [micro-skill-1] → [micro-skill-2] → [micro-skill-3]
2. Applies domain expertise: [specific analysis/processing]
3. Returns: [expected output format]

**Success Criteria:**
- [ ] Correct micro-skills chained
- [ ] Domain expertise applied correctly
- [ ] Output meets specification
- [ ] Error handling works (test failure scenarios)
```

---

### Step 8: Document and Iterate

**Update Progress Document:**

Add to `.claude/skills/skill-name/CHANGELOG.md`:
```markdown
# Changelog

## [1.0.0] - 2025-11-13

### Added
- Initial implementation
- Tactical 4-D methodology
- Domain expertise: [list key capabilities]
- Micro-skill chains: [list sequences]
- Examples: [list use cases]

### Tested
- ✅ Registry discovery (semantic search)
- ✅ Manifest validation (JSON schema)
- ✅ End-to-end execution
- ✅ Error handling (retry + escalation)
```

**Iterate Based on Usage:**
1. Use skill on real tasks
2. Notice gaps or inefficiencies
3. Update SKILL.md or manifest
4. Increment version number
5. Document changes in CHANGELOG.md

---

## Interactive Skill Creation Wizard

When user says "create a new skill", follow this checklist:

### Phase 1: Discovery (Ask Questions)

```markdown
**Let's create your skill! I'll ask a few questions:**

1. **What domain does this cover?**
   - Code/Software Engineering
   - Marketing/Content
   - Data/Analytics
   - Writing
   - Other: ___

2. **What's a specific use case?** (be concrete)
   Example: "Analyze React components for performance issues"
   Your use case: ___

3. **Is this an orchestrator (chains operations) or a single operation?**
   - Orchestrator → Tier 2 Skill
   - Single operation → Tier 3 Micro-Skill

4. **What micro-skills will you use?** (if Tier 2)
   Example: search-codebase, read-file, parse-ast
   Your micro-skills: ___

5. **What domain expertise do you bring?**
   Example: "OWASP Top 10 security patterns, SOLID principles"
   Your expertise: ___
```

### Phase 2: Generate Structure

```markdown
**Creating skill structure...**

Based on your answers:
- Name: [generated-name]
- Type: [skill or micro-skill]
- Tier: [2 or 3]
- Domain: [domain-name]

**Files I'll create:**
1. .claude/skills/[name]/SKILL.md
2. .claude/skills/[name]/[name].skill.json
3. .claude/skills/[name]/references/ (if needed)

**Proceed? (yes/no)**
```

### Phase 3: Generate Manifest

```markdown
**Generating manifest from your requirements...**

{
  "name": "[name]",
  "type": "[skill|micro-skill]",
  "tier": [2|3],
  "description": "[Generated from use case and expertise]",
  "inputs": [
    [Generated from requirements]
  ],
  "outputs": [
    [Generated from use case]
  ],
  "capabilities": [
    [Generated keywords from domain and use case]
  ],
  ...
}

**Does this look correct? Any changes needed?**
```

### Phase 4: Generate SKILL.md

```markdown
**Generating SKILL.md using appropriate template...**

[For Tier 2: Uses tactical-4d template]
[For Tier 3: Uses micro-skill template]

**Sections created:**
- Purpose (from your use case)
- Integration with Maestro
- [Tactical 4-D sections OR Error Handling]
- Domain Expertise (from your expertise description)
- Examples (from your use case)

**Review and customize domain expertise section? (yes/no)**
```

### Phase 5: Test Discovery

```markdown
**Testing registry discovery...**

Running: registry.search({ intent: "[your use case]" })

Results:
- ✅ Skill found: [name]
- Score: [number]
- Match reason: [capabilities matched]

**Would you like to adjust capabilities for better discovery?**
```

### Phase 6: Create Test Scenario

```markdown
**Creating test scenario...**

Test file: .claude/skills/[name]/TEST_SCENARIO.md

Contains:
- Setup instructions
- Sample invocation
- Expected execution flow
- Success criteria

**Ready to test with real data? (yes/no)**
```

---

## Validation Checklist

Before marking skill complete:

### Manifest Validation
- [ ] Valid JSON (test with `jq`)
- [ ] name: lowercase-with-hyphens
- [ ] description: 100-1000 chars, includes keywords
- [ ] capabilities: 5-10 searchable terms
- [ ] inputs/outputs: Complete with types
- [ ] tier: Correct (2 for skills, 3 for micro-skills)
- [ ] type: Matches tier

### SKILL.md Validation
- [ ] Under 500 lines (main file)
- [ ] Imperative form used throughout
- [ ] Purpose section clear
- [ ] Integration with Maestro explained
- [ ] For Tier 2: All 4 D's documented
- [ ] For Tier 3: Two-level error handling
- [ ] Domain expertise clearly documented
- [ ] Examples include verification steps

### Registry Integration
- [ ] Skill appears in registry scan
- [ ] Semantic search finds skill correctly
- [ ] No false positives in testing
- [ ] Manifest score > threshold for intended queries

### Functional Testing
- [ ] Skill executes end-to-end
- [ ] Micro-skill chains work correctly
- [ ] Error handling tested (retry + escalation)
- [ ] Output format matches specification
- [ ] Domain expertise applied correctly

---

## Common Patterns & Best Practices

### For Skills (Tier 2)

**Pattern 1: Sequential Chain**
```
Use when: Each step depends on previous output
Example: read → parse → analyze → report
```

**Pattern 2: Parallel Execution**
```
Use when: Steps are independent
Example: Read multiple files simultaneously
```

**Pattern 3: Conditional Branching**
```
Use when: Path depends on result
Example: If large file → stream, else → direct read
```

**Pattern 4: Iterative Processing**
```
Use when: Processing collection of items
Example: Validate each row in CSV
```

**Error Recovery Strategy:**
```
Level 1: Retry (transient errors from micro-skills)
Level 2: Adjust parameters (wrong path, pattern)
Level 3: Alternative micro-skill (parser fails)
Level 4: Re-plan (approach won't work)
Level 5: Escalate to Maestro (truly stuck)
```

### For Micro-Skills (Tier 3)

**Pattern 1: Read Operations**
```
Retry: EBUSY, EAGAIN
Escalate: ENOENT, EACCES (with context)
Context: Similar files, permissions, suggestions
```

**Pattern 2: Write Operations**
```
Retry: EBUSY, EAGAIN
Escalate: ENOSPC, EROFS, EACCES
Context: Space available, permissions, alternatives
```

**Pattern 3: Parse Operations**
```
Retry: Buffer issues (rare)
Escalate: PARSE_ERROR (with location)
Context: Line, column, near text, character
```

**Pattern 4: Validation Operations**
```
Don't retry: Validation failures are not transient
Escalate: With specific validation failures
Context: Which rules failed, example fixes
```

---

## Troubleshooting

### Skill Not Discovered

**Problem**: Registry doesn't find skill for expected queries

**Debug Steps:**
1. Check manifest exists and is valid JSON
2. Verify `description` includes search keywords
3. Check `capabilities` array has relevant terms
4. Test with registry directly:
   ```bash
   cd registry
   npm test -- --grep "skill-name"
   ```
5. Try exact capability match:
   ```javascript
   registry.search({ capability: "exact-capability-name" })
   ```

**Common Fixes:**
- Add more keywords to description
- Expand capabilities array
- Use domain-specific terminology
- Include common search phrases

### Skill Found But Low Score

**Problem**: Skill appears in results but low ranking

**Fixes:**
- Put most important keywords in first 100 chars of description
- Ensure capabilities match common search terms
- Check competitor skills that rank higher
- Add synonyms to capabilities

### Micro-Skill Chain Fails

**Problem**: Skill can't invoke micro-skill or gets errors

**Debug Steps:**
1. Check micro-skill exists in registry
2. Verify micro-skill manifest has correct inputs/outputs
3. Test micro-skill independently
4. Check parameter format matches micro-skill spec
5. Review error escalation context

**Common Issues:**
- Wrong parameter names (check manifest)
- Type mismatch (string vs array)
- Missing required parameters
- Micro-skill not in registry

### Error Handling Not Working

**Problem**: Errors not being retried or escalated correctly

**For Micro-Skills:**
- Check error code matches retriable list
- Verify retry logic implemented
- Ensure max attempts not exceeded
- Confirm escalation includes context

**For Skills:**
- Check 5-level recovery implemented
- Verify evaluation after each micro-skill
- Ensure re-planning logic works
- Confirm escalation to Maestro includes context

---

## Reference Documentation

For deeper information:

### In This Skill Directory

- **TACTICAL_4D_GUIDE.md** - Complete Tactical 4-D patterns with examples
- **MICRO_SKILL_PATTERNS.md** - Common micro-skill implementation patterns
- **ERROR_HANDLING_GUIDE.md** - Comprehensive error handling strategies
- **MANIFEST_REFERENCE.md** - Complete manifest schema with all fields
- **DISCOVERY_OPTIMIZATION.md** - How to optimize for registry discovery

### In Documentation

- **docs/tactical-4d-patterns.md** - Tactical 4-D methodology guide
- **docs/skill-development-guide.md** - 8-step creation process
- **docs/micro-skill-development-guide.md** - Micro-skill creation guide
- **docs/skill-registry-guide.md** - Registry and discovery details
- **docs/manifest-schema-spec.md** - Complete manifest specification

### Templates

- **templates/skill-template-tactical-4d.md** - Tier 2 skill template
- **templates/micro-skill-template.md** - Tier 3 micro-skill template
- **templates/skill-manifest-template.json** - Manifest template
- **templates/micro-skill-manifest-template.json** - Micro-skill manifest

---

## Success Criteria

You've successfully created a skill when:

**Registry Integration:**
- ✅ Skill discovered by semantic search
- ✅ Score > 10 for intended queries
- ✅ Manifest validates against schema
- ✅ No false positives/negatives

**Implementation Quality:**
- ✅ SKILL.md under 500 lines
- ✅ Tactical 4-D complete (Tier 2) OR error handling (Tier 3)
- ✅ Domain expertise clearly documented
- ✅ Examples include verification

**Functionality:**
- ✅ Executes end-to-end successfully
- ✅ Micro-skill chains work correctly
- ✅ Error handling tested and working
- ✅ Output format matches spec

**Documentation:**
- ✅ CHANGELOG.md created
- ✅ TEST_SCENARIO.md exists
- ✅ References/ for deep content
- ✅ Clear integration with Maestro

---

**Skill Status**: Maestro Marketplace Edition v4.0 - Three-tier architecture, registry integration, Tactical 4-D methodology ✅
**Line Count**: <500 lines (main SKILL.md) ✅
**Philosophy**: Skills bring expertise, micro-skills bring operations, Maestro orchestrates excellence, registry enables discovery ✅
