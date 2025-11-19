---
name: skill-wizard
version: 4.0.0
type: skill
tier: 2
---

# skill-wizard - Interactive Skill Creation Wizard

**Type**: Tier 2 Skill (Orchestrator)
**Purpose**: Guide users through creating Marketplace-compatible skills and micro-skills
**Model**: Sonnet (complex orchestration requiring domain expertise)

---

## Overview

skill-wizard is an interactive orchestrator that guides users through creating new Maestro Marketplace-compatible skills. It implements the Tactical 4-D methodology to:

1. **DELEGATION**: Chain micro-skills for directory creation, file generation, and validation
2. **DESCRIPTION**: Interactive Q&A to gather skill identity, capabilities, and resources
3. **DISCERNMENT**: Validate user inputs and generated files for correctness
4. **DILIGENCE**: 5-level error recovery ensuring robust skill creation

**Key Principle**: Make skill creation accessible through guided questions while ensuring registry discoverability through rich descriptions and proper manifest generation.

---

## Integration with Maestro

**Maestro delegates to skill-wizard when**:
- User intent matches: "create skill", "new skill", "build skill", "skill wizard"
- Capabilities match: skill-creation, skill-development, interactive-wizard
- Discovery score threshold met (typically 70+)

**Maestro provides**:
- Product: Create new skill for specific domain (code, marketing, data, etc.)
- Process: Interactive wizard with guided questions
- Performance: Complete manifest, SKILL.md, directory structure, registry discoverable

**skill-wizard returns to Maestro**:
- Success: Skill path, manifest created, discoverable by registry
- Errors: Validation failures, filesystem issues with context for escalation

---

## Tactical 4-D Implementation

### DELEGATION (Tactical)

skill-wizard orchestrates this workflow:

**Phase 1: Gather Requirements (Inline)**
- Ask 4 interactive questions (name, description, capabilities, resources)
- Validate inputs (hyphen-case name, detailed description, relevant capabilities)
- Confirm plan with user

**Phase 2: Validate & Preview (Micro-Skill Chain)**
```
validate-json(generated manifest)
  → Show preview to user
  → Get confirmation
```

**Phase 3: Create Structure (Micro-Skill Chain)**
```
create-directory(.claude/skills/skill-name)
  → create-directory(.claude/skills/skill-name/scripts)
  → create-directory(.claude/skills/skill-name/references)
  → create-directory(.claude/skills/skill-name/assets)
  → write-file(skill-name.skill.json)
  → write-file(SKILL.md from template)
  → write-file(placeholder resources)
```

**Phase 4: Verify (Micro-Skill Chain)**
```
read-file(skill-name.skill.json)
  → validate-json(manifest content)
  → Confirm registry can discover
  → Report success
```

### DESCRIPTION (Tactical)

For each phase, skill-wizard provides:

**Phase 1 Inputs**:
```typescript
{
  skill_name: string,        // User answer to Q1
  description: string,       // User answer to Q2
  capabilities: string[],    // User answer to Q3
  resources: {
    scripts: string[],
    references: string[],
    assets: string[]
  }                          // User answer to Q4
}
```

**Phase 2 Validation**:
```typescript
const manifest = {
  name: skill_name,
  version: "1.0.0",
  type: skill_type,  // "skill" or "micro-skill"
  tier: skill_type === "skill" ? 2 : 3,
  description: description,
  capabilities: capabilities,
  keywords: extractKeywords(description, capabilities),
  model: "sonnet",
  tools: ["Read", "Write", "Bash"]
};

await invoke_micro_skill("validate-json", {
  content: JSON.stringify(manifest),
  schema: MANIFEST_SCHEMA
});
```

**Phase 3 Directory Creation**:
```typescript
await invoke_micro_skill("create-directory", {
  path: `.claude/skills/${skill_name}`,
  recursive: true
});
```

**Phase 3 File Writing**:
```typescript
await invoke_micro_skill("write-file", {
  file_path: `.claude/skills/${skill_name}/${skill_name}.skill.json`,
  content: JSON.stringify(manifest, null, 2)
});
```

### DISCERNMENT (Tactical)

**After Phase 1 (Gathering)**:
- ✓ Skill name is valid hyphen-case (matches `^[a-z0-9-]+$`)
- ✓ Skill name doesn't conflict with existing skills
- ✓ Description is detailed (>50 words for skills, >30 for micro-skills)
- ✓ Capabilities are relevant (5-10 for skills, 3-5 for micro-skills)
- ✓ Resources lists are valid (file names, no path traversal)

**After Phase 2 (Validation)**:
- ✓ Generated manifest is valid JSON
- ✓ Manifest has all required fields (name, version, type, capabilities, description)
- ✓ Keywords extracted successfully from description and capabilities
- ✓ User confirmed plan after reviewing preview

**After Phase 3 (Creation)**:
- ✓ All directories created successfully
- ✓ Manifest file written successfully
- ✓ SKILL.md written successfully
- ✓ All placeholder resource files created

**After Phase 4 (Verification)**:
- ✓ Manifest file exists and is readable
- ✓ Manifest JSON is valid (re-validate)
- ✓ Registry can parse manifest (no errors)
- ✓ Skill is discoverable via semantic search

### DILIGENCE (Tactical)

**5-Level Error Recovery**:

**Level 1: Retry with Same Parameters**
- Directory creation fails with EACCES → Autonomous retry (handled by micro-skill)
- File write fails with EBUSY → Wait and retry

**Level 2: Adjust and Retry**
- Skill name conflicts → Prompt for new name, regenerate all references
- Invalid JSON → Show errors, let user fix, regenerate
- Description too short → Prompt for more details, regenerate manifest

**Level 3: Alternative Micro-Skill**
- write-file fails → Try with different encoding
- validate-json fails → Offer manual validation, show exact error location

**Level 4: Partial Success**
- Directories created but manifest write failed:
  - Offer: (1) Clean up directories, (2) Continue from failure point
- Manifest written but SKILL.md failed:
  - Offer: (1) Create minimal SKILL.md, (2) Retry with fallback template

**Level 5: Escalate to Maestro**
- Permission denied after all retries → User needs sudo or different location
- Duplicate skill exists and user wants to overwrite → Requires confirmation
- Filesystem full (ENOSPC) → User must free space or choose different location

---

## Domain Expertise

### Skill Design Best Practices

**Rich Descriptions for Discovery**:
- Use specific terminology from the domain
- Mention concrete use cases and problems solved
- Include trigger phrases users would naturally say
- 50+ words for skills, 30+ words for micro-skills

**Example Good Description**:
> "An expert skill for auditing API endpoints for common security vulnerabilities based on the OWASP Top 10. Use this to analyze route handlers, check for missing authentication middleware, validate input sanitization, and ensure proper error handling for security-sensitive routes. It produces a detailed audit report with actionable recommendations."

**Example Poor Description**:
> "Checks code for security issues."

**Capability Naming**:
- Use domain-specific terms: `brand-voice-audit` not just `analysis`
- Include action verbs: `vulnerability-scanning` not just `vulnerabilities`
- Be specific: `owasp-top-10-checking` not just `security`

**Keyword Extraction**:
- Extract nouns and verb phrases from description
- Include common variations: "create" → ["create", "make", "build", "generate"]
- Include domain synonyms: "security" → ["security", "vulnerability", "audit"]

### Marketplace Architecture Understanding

**Three-Tier System**:
- Tier 1 (Maestro): Strategic delegation, domain-agnostic
- Tier 2 (Skills): Tactical orchestration, domain expertise
- Tier 3 (Micro-Skills): Pure execution, autonomous error handling

**When to Create Skill vs Micro-Skill**:
- **Skill** (Tier 2): Needs orchestration, domain expertise, multiple steps
- **Micro-Skill** (Tier 3): Single operation, pure execution, autonomous retry

**Examples**:
- Skill: `api-security-auditor` (orchestrates file reading, parsing, analysis, report generation)
- Micro-Skill: `parse-json` (parses JSON, handles errors, returns result)

### Tactical 4-D Methodology

**Template Structure for Generated SKILL.md**:
```markdown
## Integration with Maestro
[How Maestro delegates to this skill]

## Tactical 4-D Implementation

### DELEGATION (Tactical)
[Which micro-skills to chain, in what order]

### DESCRIPTION (Tactical)
[Inputs/outputs for each micro-skill invocation]

### DISCERNMENT (Tactical)
[Validation after each phase]

### DILIGENCE (Tactical)
[5-level error recovery strategy]

## Domain Expertise
[Specific knowledge for this domain]
```

### Registry Optimization

**Maximizing Discovery Score**:
1. **Rich description** with domain terminology (40% weight)
2. **Relevant capabilities** matching user intent (30% weight)
3. **Keywords** covering variations (20% weight)
4. **Input/output schemas** showing clear interface (10% weight)

**Testing Discovery**:
```bash
npx tsx registry/demo-query.ts "user intent here"
```

Expected score: 70+ for good match, 90+ for excellent match.

---

## Interactive Wizard Flow

### Phase 1: DESCRIPTION (Gather Requirements)

**Question 1: Skill Name**
```
What is the unique, hyphen-case-name for your skill?

Examples:
  - Code domain: api-security-auditor
  - Marketing domain: brand-voice-analyzer
  - Data domain: quarterly-report-generator

Your answer:
```

**Validation**:
- Must match regex: `^[a-z0-9-]+$`
- Must not conflict with existing skills (check `.claude/skills/`)
- Should be descriptive, not generic

**Question 2: Rich Description**
```
Please provide a rich, detailed description for your skill.

This is the MOST IMPORTANT step. The registry uses semantic search to match
your description against user requests. Be specific about:
  - What problems this skill solves
  - When it should be used
  - What it produces

Good example (code domain):
"An expert skill for auditing API endpoints for common security vulnerabilities
based on the OWASP Top 10. Use this to analyze route handlers, check for missing
authentication middleware, validate input sanitization, and ensure proper error
handling for security-sensitive routes. It produces a detailed audit report with
actionable recommendations."

Bad example:
"Checks code for security issues."

Your answer (50+ words):
```

**Validation**:
- Minimum 50 words for skills, 30 for micro-skills
- Should mention domain-specific terms
- Should include use cases or trigger phrases

**Question 3: Capabilities**
```
What are the core capabilities of this skill?

Think of these as search tags or areas of expertise. Use 5-10 capabilities
for skills, 3-5 for micro-skills.

Examples:
  - Code domain: api-security, owasp, authentication, authorization, input-validation
  - Marketing domain: brand-voice, content-analysis, tone-of-voice, sentiment-analysis
  - Data domain: financial-reporting, data-aggregation, quarterly-analysis

Your answer (comma-separated):
```

**Validation**:
- 5-10 capabilities for skills
- 3-5 capabilities for micro-skills
- Should use hyphen-case
- Should be domain-relevant

**Question 4: Resources (Optional)**
```
List any scripts, references, or assets this skill will need.

You can say "none" if the skill doesn't need bundled resources.

Categories:
  - scripts/ (for automation): generate-report.py, calculate-metrics.sh
  - references/ (for knowledge): security-checklist.md, brand-voice-guidelines.md
  - assets/ (for templates/data): report-template.docx, brand-logo.png

Your answer (comma-separated, or "none"):
```

**Validation**:
- Valid file names (no path traversal like `../../etc/passwd`)
- Categorized correctly (scripts, references, assets)

### Phase 2: DISCERNMENT (Review Plan)

**Present Summary**:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 Skill Creation Plan
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Skill Name: [skill-name]
Type: [skill | micro-skill]
Tier: [2 | 3]

Description:
[Full description from Q2]

Capabilities: [capability-1], [capability-2], ...

Keywords (auto-extracted): [keyword-1], [keyword-2], ...

Directory Structure:
.claude/skills/[skill-name]/
  ├── [skill-name].skill.json (manifest)
  ├── SKILL.md (implementation guide)
  ├── scripts/ [list of scripts from Q4]
  ├── references/ [list of references from Q4]
  └── assets/ [list of assets from Q4]

Registry Discovery:
This skill will be discoverable when user requests match:
  - Intent: [key phrases from description]
  - Capabilities: [capability list]
  - Domain: [detected domain]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Does this plan accurately capture the skill you want to create?
Type 'yes' to proceed, or provide corrections:
```

**Validation**:
- User confirms "yes" or equivalent
- If corrections: re-gather specific answers and regenerate plan

### Phase 3: DILIGENCE (Execute Plan)

**Step 1: Create Directory Structure**
```typescript
console.log("Creating skill directory...");
const skillDir = await invoke_micro_skill("create-directory", {
  path: `.claude/skills/${skill_name}`,
  recursive: true
});

if (!skillDir.success) {
  // Level 5 escalation: show error and context
  throw new Error(`Failed to create skill directory: ${skillDir.error.message}`);
}

console.log(`✓ Created ${skillDir.path}`);

// Create subdirectories
for (const subdir of ["scripts", "references", "assets"]) {
  const result = await invoke_micro_skill("create-directory", {
    path: `${skillDir.path}/${subdir}`,
    recursive: true
  });
  if (result.success) {
    console.log(`✓ Created ${subdir}/`);
  }
}
```

**Step 2: Generate and Validate Manifest**
```typescript
console.log("Generating manifest...");
const manifest = {
  name: skill_name,
  version: "1.0.0",
  type: skill_type,
  tier: skill_type === "skill" ? 2 : 3,
  description: description,
  capabilities: capabilities,
  keywords: extractKeywords(description, capabilities),
  domain_expertise: {},  // User fills in later
  input: { type: "object", properties: {} },  // User fills in later
  output: { type: "object", properties: {} }, // User fills in later
  model: "sonnet",
  tools: ["Read", "Write", "Bash"]
};

const manifestJSON = JSON.stringify(manifest, null, 2);

// Validate before writing
console.log("Validating manifest...");
const validation = await invoke_micro_skill("validate-json", {
  content: manifestJSON
});

if (!validation.valid) {
  // Level 2: Show errors, regenerate
  console.error("Generated manifest is invalid:");
  for (const error of validation.errors) {
    console.error(`  ${error.message}`);
  }
  throw new Error("Manifest validation failed");
}

console.log("✓ Manifest is valid JSON");
```

**Step 3: Write Manifest File**
```typescript
console.log("Writing manifest file...");
const writeResult = await invoke_micro_skill("write-file", {
  file_path: `${skillDir.path}/${skill_name}.skill.json`,
  content: manifestJSON
});

if (!writeResult.success) {
  // Level 1: Retry
  // Level 5: Escalate if retry fails
  throw new Error(`Failed to write manifest: ${writeResult.error}`);
}

console.log(`✓ Created ${skill_name}.skill.json`);
```

**Step 4: Generate SKILL.md from Template**
```typescript
console.log("Generating SKILL.md...");
const skillMdContent = generateSkillMdFromTemplate({
  skill_name,
  skill_type,
  description,
  capabilities
});

const skillMdResult = await invoke_micro_skill("write-file", {
  file_path: `${skillDir.path}/SKILL.md`,
  content: skillMdContent
});

if (!skillMdResult.success) {
  throw new Error(`Failed to write SKILL.md: ${skillMdResult.error}`);
}

console.log("✓ Created SKILL.md");
```

**Step 5: Create Placeholder Resource Files**
```typescript
console.log("Creating placeholder resource files...");
for (const script of resources.scripts) {
  await invoke_micro_skill("write-file", {
    file_path: `${skillDir.path}/scripts/${script}`,
    content: "#!/usr/bin/env bash\n# TODO: Implement script\n"
  });
  console.log(`✓ Created scripts/${script}`);
}

for (const ref of resources.references) {
  await invoke_micro_skill("write-file", {
    file_path: `${skillDir.path}/references/${ref}`,
    content: "# TODO: Add reference content\n"
  });
  console.log(`✓ Created references/${ref}`);
}

// Similar for assets...
```

**Step 6: Verify Creation**
```typescript
console.log("\nVerifying skill creation...");

// Read back manifest
const readResult = await invoke_micro_skill("read-file", {
  file_path: `${skillDir.path}/${skill_name}.skill.json`
});

if (!readResult.success) {
  console.warn("⚠ Warning: Could not verify manifest file");
} else {
  // Re-validate
  const revalidation = await invoke_micro_skill("validate-json", {
    content: readResult.data
  });

  if (revalidation.valid) {
    console.log("✓ Manifest file verified");
  } else {
    console.error("✗ Manifest verification failed");
  }
}

console.log("\n✅ Skill creation complete!");
```

### Phase 4: Report Success

**Success Output**:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Skill Created Successfully
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Skill Name: [skill-name]
Location: .claude/skills/[skill-name]/
Registry: Discoverable (manifest created)

Files Created:
  ✓ [skill-name].skill.json
  ✓ SKILL.md
  ✓ scripts/ (+ [N] placeholder files)
  ✓ references/ (+ [N] placeholder files)
  ✓ assets/ (+ [N] placeholder files)

Next Steps:
1. Open SKILL.md and implement the Tactical 4-D sections
2. Fill in domain_expertise in the manifest
3. Define input/output schemas in the manifest
4. Implement the skill logic using micro-skill chains
5. Test discovery: npx tsx registry/demo-query.ts "your intent"

Suggested Next Skill: skill-developer
  Reason: Complete the implementation of your new skill
  Use: Provides guidance on implementing Tactical 4-D logic

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Structured Output (for Maestro)**:
```json
{
  "success": true,
  "skill_name": "api-security-auditor",
  "skill_path": ".claude/skills/api-security-auditor",
  "manifest_created": true,
  "skill_md_created": true,
  "discoverable": true,
  "registry_test_score": null,
  "errors": []
}
```

---

## Error Recovery Examples

### Scenario 1: Skill Name Already Exists

**Error**: create-directory returns `EEXIST`

**Recovery**:
```
✗ Error: Skill directory already exists at .claude/skills/api-auditor

Options:
  1. Choose a different name (recommended)
  2. Overwrite existing skill (DESTRUCTIVE)
  3. Cancel creation

Your choice:
```

**Level 2 (Adjust)**: User provides new name → regenerate entire plan with new name

### Scenario 2: Invalid JSON in Generated Manifest

**Error**: validate-json returns syntax errors

**Recovery**:
```
✗ Error: Generated manifest has invalid JSON

Error: Unexpected token } at line 15, column 3

This is likely a bug in skill-wizard. The manifest generation logic
produced invalid JSON.

Escalating to Maestro for investigation...
```

**Level 5 (Escalate)**: Bug in skill-wizard itself, needs human review

### Scenario 3: Permission Denied Creating Directory

**Error**: create-directory returns `EACCES` after 3 retries

**Recovery**:
```
✗ Error: Permission denied creating .claude/skills/new-skill

The filesystem denied permission to create this directory after 3 attempts.

Possible causes:
  - .claude/skills/ is owned by a different user
  - Parent directory has restrictive permissions
  - Disk is mounted read-only

Suggested actions:
  1. Check directory permissions: ls -la .claude/skills/
  2. Try creating in a different location (e.g., /tmp/skills/)
  3. Run with appropriate privileges

Escalating to Maestro...
```

**Level 5 (Escalate)**: Requires manual intervention, can't fix automatically

---

## Testing skill-wizard

### Test 1: End-to-End Skill Creation

**Input**:
```
Skill Name: test-analyzer
Description: Analyzes test coverage and quality metrics. Use this to scan test suites, identify untested code paths, calculate coverage percentages, and suggest missing test cases. Produces comprehensive test quality reports.
Capabilities: test-analysis, coverage-check, quality-metrics, test-suggestions
Resources: none
```

**Expected Output**:
```
✅ Skill Created Successfully

Files:
  ✓ .claude/skills/test-analyzer/test-analyzer.skill.json
  ✓ .claude/skills/test-analyzer/SKILL.md
```

**Verification**:
```bash
# 1. Files exist
test -f .claude/skills/test-analyzer/test-analyzer.skill.json && echo "PASS: Manifest exists"
test -f .claude/skills/test-analyzer/SKILL.md && echo "PASS: SKILL.md exists"

# 2. Manifest is valid JSON
jq empty .claude/skills/test-analyzer/test-analyzer.skill.json && echo "PASS: Valid JSON"

# 3. Registry can find it
npx tsx registry/demo-query.ts "analyze test coverage" | grep "test-analyzer" && echo "PASS: Discoverable"
```

### Test 2: Error Recovery (Duplicate Name)

**Setup**: Create skill with existing name

**Expected Behavior**:
1. Detect EEXIST error from create-directory
2. Prompt user for: different name, overwrite, or cancel
3. If different name chosen: regenerate plan, continue from Phase 2
4. If overwrite: warn about data loss, require explicit confirmation
5. If cancel: clean exit with no changes

### Test 3: Manifest Validation

**Input**: Malformed user input (e.g., empty description)

**Expected Behavior**:
1. Phase 1 validation catches empty description
2. Re-prompt with explanation: "Description must be at least 50 words"
3. Don't proceed to Phase 2 until valid

---

## Performance Characteristics

- **Phase 1 (Interactive)**: Variable (waits for user input)
- **Phase 2 (Validation)**: ~10-20ms (JSON validation)
- **Phase 3 (Creation)**: ~50-100ms (directory + file creation)
- **Phase 4 (Verification)**: ~20-30ms (read + re-validate)
- **Total (excluding user input)**: ~100-150ms

---

## Usage Examples

### From Maestro

```
User: "I want to create a new skill for analyzing API security"

Maestro (Strategic 4-D):
  DELEGATION:
    Query: "create new skill"
    Match: skill-wizard (score: 95)
    Delegate with context: { domain: "code/security" }

skill-wizard (Tactical 4-D):
  DESCRIPTION:
    [Starts interactive wizard]
    Q1: What is the skill name? → "api-security-auditor"
    Q2: Description? → [rich description]
    ...

  DISCERNMENT:
    ✓ Name valid, no conflicts
    ✓ Description detailed (120 words)
    ✓ Capabilities relevant (5 items)
    ✓ User confirmed plan

  DELEGATION:
    create-directory → write-file → validate-json

  DILIGENCE:
    ✓ All files created
    ✓ Manifest valid
    ✓ Registry can discover

  Returns to Maestro:
    { success: true, skill_path: "...", discoverable: true }

Maestro reports to user:
  "✅ Skill 'api-security-auditor' created and registered. Use skill-developer to implement the logic."
```

---

## Suggested Next Skills

After skill-wizard completes:

**skill-developer** (priority: medium)
- Reason: Complete the implementation of newly created skill
- Context: Skill path, manifest, template structure
- Helps with: Implementing Tactical 4-D logic, micro-skill chains, error handling

**4d-evaluation** (priority: low)
- Reason: Validate the completed skill against excellence standards
- Context: Skill path
- Helps with: Quality gate for production readiness

---

**Tier 2 Principle**: Orchestrate micro-skills, provide domain expertise (skill design), implement 5-level error recovery, make hearts sing through guided experience.
