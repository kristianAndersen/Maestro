# Maestro Framework Patterns Reference

**Source**: Analysis of `agent-hooks-commands-skill-inspiration/`
**Last Updated**: 2025-11-18
**Purpose**: Quick reference for creating agents, skills, commands, and understanding the three-tier architecture

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [YAML Frontmatter Patterns](#yaml-frontmatter-patterns)
3. [Document Structure Patterns](#document-structure-patterns)
4. [Registry Patterns](#registry-patterns)
5. [Error Handling Patterns](#error-handling-patterns)
6. [Transparency Patterns](#transparency-patterns)
7. [Naming Conventions](#naming-conventions)
8. [Quick Decision Matrix](#quick-decision-matrix)

---

## Architecture Overview

### Three-Tier System

```
┌─────────────────────────────────────────────────┐
│ TIER 0: Maestro (Conductor)                    │
│ - Strategic 4-D methodology                     │
│ - NEVER writes code                             │
│ - Delegates to Tier 1 agents                    │
│ - AI Fluency: Agency (autonomous decision)      │
└─────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────┐
│ TIER 1: Agents (Domain Coordinators)           │
│ - Domain Direction methodology                  │
│ - Orchestrates domain-level work                │
│ - Delegates to Tier 2 skills                    │
│ - AI Fluency: Agency/Augmentation               │
└─────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────┐
│ TIER 2: Skills (Orchestrators)                 │
│ - Tactical 4-D methodology                      │
│ - Domain expertise + strategic decisions        │
│ - Delegates to Tier 3 micro-skills              │
│ - AI Fluency: Augmentation (collaborative)      │
└─────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────┐
│ TIER 3: Micro-Skills (Musicians)                │
│ - Pure execution, NO orchestration              │
│ - Single operation with smart error handling    │
│ - Uses specific tools only                      │
│ - AI Fluency: Automation (deterministic)        │
└─────────────────────────────────────────────────┘
```

### Key Principles

| Tier | What It Does | Can Orchestrate? | Model | 4-D? | Line Limit |
|------|--------------|------------------|-------|------|------------|
| 0 (Maestro) | Strategic planning | ✅ (delegates to agents) | Sonnet | Strategic 4-D | N/A |
| 1 (Agents) | Domain coordination | ✅ (delegates to skills) | Sonnet | Domain Direction | No limit |
| 2 (Skills) | Tactical orchestration | ✅ (delegates to micro-skills) | Sonnet | Tactical 4-D | <500 lines |
| 3 (Micro-skills) | Pure execution | ❌ (single operation) | Haiku | No | <500 lines |

---

## YAML Frontmatter Patterns

### Tier 1: Agent Frontmatter

```yaml
---
name: agent-name                      # kebab-case
description: When to invoke and what it handles
tools: Read, Write, Edit, Glob, Grep, Skill
model: sonnet                         # sonnet for complex, haiku for simple
color: blue                           # Optional visual identifier
tier: 1
type: agent
version: 1.0.0
domain: domain-name                   # e.g., "file-operations"
delegates-to: [skill-1, skill-2]      # Skills this agent uses
skill-registry: .claude/skills/skill-rules.json
---
```

### Tier 2: Skill Frontmatter

```yaml
---
name: skill-name                      # kebab-case
description: Comprehensive description with use cases and capabilities
type: skill
tier: 2
version: 1.0.0
model: sonnet
allowed-tools: []                     # Usually empty, delegates to micro-skills
delegates-to: [micro-skill-1, micro-skill-2]
---
```

### Tier 3: Micro-Skill Frontmatter

```yaml
---
name: micro-skill-name                # kebab-case
description: Pure execution micro-skill that [single operation]
type: micro-skill
tier: 3
version: 1.0.0
model: haiku                          # Fast model for simple execution
allowed-tools: [Read, Glob]           # Specific tools only
---
```

### Command Frontmatter

```yaml
---
description: Clear one-sentence purpose
argument-hint: Example of how to use arguments (e.g., "task name")
---
```

---

## Document Structure Patterns

### Tier 1: Agent Structure

```markdown
# [Agent Name] (Tier 1)

**Type**: Tier 1 - Domain Coordinator
**Role**: [Purpose description]
**Methodology**: Domain Direction
**AI Fluency Mode**: Agency/Augmentation

## Purpose
[What this agent does]

## Architecture Position
[Visual diagram showing tier placement]

## Integration with Maestro

### Receives from Maestro (Strategic Direction)
- **Product**: What domain work needs to be done
- **Process**: How to approach it
- **Performance**: What defines success

### Returns to Maestro
```typescript
{
  success: boolean,
  [domain-specific results],
  summary: "Brief description",
  skill_used?: "skill-name"
}
```

## Domain Direction Implementation

### Skill Selection Logic
[How agent decides which skill to use]

### Delegation Workflow
1. **Analyze Request** - Understand domain requirements
2. **Select Skill** - Choose appropriate Tier 2 skill
3. **Delegate** - Pass work to skill with clear direction
4. **Evaluate** - Assess skill's results
5. **Iterate or Return** - Refine if needed or return to Maestro

## Decision Trees
[Routing matrices showing when to use which skill]

## Error Handling
[How errors from skills are managed]

## Best Practices
### DO ✓
- [Guideline 1]
- [Guideline 2]

### DON'T ✗
- [Anti-pattern 1]
- [Anti-pattern 2]

## Success Criteria
- [ ] Criterion 1
- [ ] Criterion 2

## Notes
[Important context and distinctions]
```

### Tier 2: Skill Structure

```markdown
# [Skill Name] (Tier 2 Orchestrator)

**Type**: Tier 2 - Orchestrator with Domain Expertise
**Role**: [Domain specialist description]
**Methodology**: Tactical 4-D
**AI Fluency Mode**: Augmentation (collaborative thinking partner)

## Purpose
[What this skill orchestrates]

**Key Principle**: [Core design philosophy]

## Integration with Maestro

### Receives from Maestro (Strategic Direction)

**Product**: What to [action]
```typescript
{
  goal: "Specific objective",
  files: [...],
  constraints: [...]
}
```

**Process**: How to approach it
```typescript
{
  methodology: "Approach description",
  safety_level: "high|medium|low",
  recovery_strategy: "rollback|keep-partial|fail-fast"
}
```

**Performance**: What defines success
```typescript
{
  deliverable: "Expected output",
  criteria: ["Quality measure 1", "Quality measure 2"],
  reporting: "Format of results"
}
```

### Returns to Maestro
```typescript
{
  success: boolean,
  [domain-specific results],
  summary: "Brief description",
  micro_skills_used: ["micro-1", "micro-2"]
}
```

## Tactical 4-D Implementation

### 1. DELEGATION (Tactical) - Planning
[How skill selects and sequences micro-skills]

**Standard Chain**:
```typescript
1. micro-skill-1 → Purpose/operation
2. micro-skill-2 → Purpose/operation
3. [Your Domain Logic] → Strategic decisions
4. micro-skill-3 → Final operation
```

**Micro-Skills Used:**
- `micro-skill-name` → What it does
- **Domain Logic** (Your Expertise): Strategic decisions between operations

### 2. DESCRIPTION (Tactical) - Configuration
**When delegating to micro-skills:**
```typescript
{
  operation: "micro-skill-name",
  parameters: {
    param1: value,
    param2: value
  },
  purpose: "Why calling this micro-skill",
  expected_output: {
    success: boolean,
    result: "expected structure"
  }
}
```

### 3. DISCERNMENT (Tactical) - Evaluation
**Evaluate micro-skill results:**

**Product Discernment**: Does output match requirements?
```typescript
const productCheck = {
  completeness: result.includes(all_required_fields),
  correctness: result.matches(expected_format),
  quality: result.meets(domain_standards)
};
```

**Process Discernment**: Was approach sound?
```typescript
const processCheck = {
  efficient: used_appropriate_micro_skills,
  safe: followed_safety_protocols,
  recoverable: can_rollback_if_needed
};
```

**Performance Discernment**: Meets excellence standards?
```typescript
const performanceCheck = {
  domain_fit: integrates_with_existing_patterns,
  maintainable: clear_and_documented,
  robust: handles_edge_cases
};
```

### 4. DILIGENCE (Tactical) - Recovery
**5-Level Error Recovery System**

**Level 1: Retry with Backoff**
- Transient errors (EBUSY, network timeout)
- Automatic retry: 3 attempts with exponential backoff
- No human intervention

**Level 2: Parameter Adjustment**
- Micro-skill returned error with suggestion
- Adjust parameters based on error context
- Retry with corrected input

**Level 3: Alternative Approach**
- Original micro-skill chain failed
- Use alternative micro-skill or strategy
- Same goal, different path

**Level 4: Partial Success**
- Critical path succeeded, optional parts failed
- Return partial result with clear documentation
- Let Maestro decide next steps

**Level 5: Escalate to Maestro**
- Unrecoverable error
- Return rich error context with:
  - What was attempted
  - What failed
  - What alternatives were tried
  - Recommendations for Maestro

## [Domain Expertise Section]
[Skill-specific knowledge, patterns, best practices]

## Usage Examples

### Example 1: [Common Use Case]
**Input:**
```typescript
{
  goal: "Specific task",
  params: {...}
}
```

**Execution Flow:**
1. **DELEGATION**: Call micro-skill-1 with params
2. **DESCRIPTION**: Configure for safety
3. **DISCERNMENT**: Validate result quality
4. **DILIGENCE**: Handle edge case with Level 2 recovery

**Output:**
```typescript
{
  success: true,
  result: {...}
}
```

### Example 2: [Error Recovery Case]
[Show error handling in action]

## Auto-Activation Rules
**Defined in skill-rules.json:**
```json
{
  "keywords": ["trigger", "words"],
  "intentPatterns": ["regex", "patterns"]
}
```

## Best Practices

### Do's ✓
- Make strategic decisions between micro-skill calls
- Provide rich error context when escalating
- Use domain expertise to configure micro-skills
- Validate results before returning

### Don'ts ✗
- Don't perform raw operations (use micro-skills)
- Don't escalate without trying recovery
- Don't return errors without context
- Don't make assumptions (validate inputs)

## Success Criteria
- [ ] All micro-skills completed successfully
- [ ] Results validated against domain standards
- [ ] Error handling tested (if applicable)
- [ ] Clear summary returned to Maestro

## Notes

**This is a Tier 2 Skill (Orchestrator)**, not a Tier 3 micro-skill.

**Key Differences from Micro-Skills:**
- Has strategic decision-making capability
- Implements full 4-D methodology (Tactical)
- Orchestrates multiple micro-skills
- Provides domain expertise
- Uses recovery strategies

**AI Fluency Mode:** Augmentation - collaborates with Maestro as thinking partner

**Role:** Section Leader in orchestra - guides musicians (micro-skills)

---

**Skill Status**: Tier 2 Orchestrator
**Architecture**: Tactical 4-D with micro-skill delegation
**Model**: Sonnet (strategic thinking required)
**Version**: 1.0.0
```

### Tier 3: Micro-Skill Structure

```markdown
# [Micro-Skill Name] - Micro-Skill (Tier 3 Musician)

**Type**: Tier 3 - Pure Execution
**Role**: Musician - Executes single operation with smart error handling
**No 4-D**: This is a pure execution tool, not an orchestrator

## Purpose
[Single operation description - ONE thing only]

**Key Principle**: **NO ORCHESTRATION** - Does ONE thing with excellence

## Operation

### Input Parameters
```typescript
{
  param1: string;           // Required parameter
  param2?: number;          // Optional parameter
  options?: {               // Optional configuration
    flag1: boolean;
    flag2: string;
  }
}
```

### Output
```typescript
{
  success: boolean;         // Always present
  result?: any;             // Present on success
  error?: {                 // Present on failure
    code: string;           // Error code (e.g., "ENOENT")
    message: string;        // Human-readable message
    context: {              // Rich context for recovery
      attempted: string;
      parameters: object;
      suggestion: string;   // What to try next
    }
  }
}
```

## Smart Error Handling

### Autonomous Retry (Level 1)
**Transient Errors** - Handle automatically without escalation

**EBUSY (Resource Busy)**:
```typescript
// Retry with exponential backoff
attempts: 3
delays: [0ms, 100ms, 200ms]
```

**EAGAIN (Try Again)**:
```typescript
// Similar retry logic
attempts: 3
delays: [50ms, 150ms, 300ms]
```

### Context-Aware Escalation (Level 2)
**Permanent Errors** - Escalate with rich context for upstream recovery

**ENOENT (Not Found)**:
```typescript
{
  error: {
    code: "ENOENT",
    message: "File not found: /path/to/file.txt",
    context: {
      attempted: "read file",
      path: "/path/to/file.txt",
      alternatives: ["/path/to/file.md", "/path/to/backup.txt"],
      suggestion: "Check if file was moved or renamed"
    }
  }
}
```

**EACCES (Permission Denied)**:
```typescript
{
  error: {
    code: "EACCES",
    message: "Permission denied: /protected/file.txt",
    context: {
      attempted: "write file",
      path: "/protected/file.txt",
      current_permissions: "-r--r--r--",
      required_permissions: "write",
      suggestion: "Run with elevated permissions or choose different location"
    }
  }
}
```

## Implementation

### Algorithm
```typescript
async function executeOperation(params) {
  // 1. Validate input
  if (!params.required_param) {
    return {
      success: false,
      error: {
        code: "INVALID_INPUT",
        message: "Missing required parameter",
        context: { ... }
      }
    };
  }

  // 2. Execute with retry logic
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const result = await performOperation(params);
      return { success: true, result };
    } catch (error) {
      if (isRetriable(error) && attempt < MAX_RETRIES - 1) {
        await delay(BACKOFF_DELAYS[attempt]);
        continue;  // Retry
      }
      // Escalate with context
      return buildErrorResponse(error, params);
    }
  }
}
```

## Usage Examples

### Example 1: Successful Operation
**Input:**
```typescript
{
  file_path: "/path/to/file.txt",
  encoding: "utf8"
}
```

**Output:**
```typescript
{
  success: true,
  result: {
    content: "File contents here...",
    encoding: "utf8",
    size: 1234
  }
}
```

### Example 2: Automatic Retry
**Input:**
```typescript
{
  file_path: "/busy/file.txt"
}
```

**Execution:**
- Attempt 1: EBUSY → Retry after 0ms
- Attempt 2: EBUSY → Retry after 100ms
- Attempt 3: Success

**Output:**
```typescript
{
  success: true,
  result: { content: "...", retries: 2 }
}
```

### Example 3: Error with Context
**Input:**
```typescript
{
  file_path: "/nonexistent/file.txt"
}
```

**Output:**
```typescript
{
  success: false,
  error: {
    code: "ENOENT",
    message: "File not found",
    context: {
      attempted: "read",
      path: "/nonexistent/file.txt",
      suggestion: "Verify path or create file first"
    }
  }
}
```

## Error Codes Reference

| Code | Meaning | Retriable? | Context Provided |
|------|---------|-----------|------------------|
| ENOENT | Not found | No | Path, alternatives, suggestions |
| EACCES | Permission denied | No | Permissions, requirements |
| EBUSY | Resource busy | Yes (3x) | None (auto-retry) |
| EAGAIN | Try again | Yes (3x) | None (auto-retry) |
| EISDIR | Is directory | No | Expected file, got directory |
| ENOTDIR | Not directory | No | Expected directory, got file |
| INVALID_INPUT | Bad parameters | No | Validation details |

## Integration Notes

### Called By Skills (Tier 2)
Skills orchestrate multiple micro-skills and make strategic decisions between calls.

**Typical Usage by Skill:**
```typescript
// Skill orchestrates the sequence
const result1 = await microSkill1({ ... });
if (result1.success) {
  // Strategic decision based on result1
  const strategy = determineStrategy(result1);
  const result2 = await microSkill2({ strategy });
}
```

### Not Called Directly by Maestro or Agents
Micro-skills are implementation details. Higher tiers call skills, which use micro-skills.

## Best Practices

### ✓ DO
- Focus on single operation
- Provide rich error context
- Auto-retry transient errors
- Return structured output always
- Validate inputs before execution

### ✗ DON'T
- Make strategic decisions (that's Tier 2's job)
- Orchestrate other micro-skills
- Assume context about larger workflow
- Return ambiguous errors
- Silently fail

## Performance Characteristics

- **Model**: Haiku (optimized for speed and efficiency)
- **Latency**: Target <100ms for most operations
- **Memory**: Minimal context, single operation focus
- **Scalability**: Can be called hundreds of times in workflow

## Success Criteria
- [ ] Single operation completed
- [ ] Structured output returned
- [ ] Errors include context
- [ ] Transient errors auto-retried

## Notes

**This is NOT a Skill (Tier 2)**. This is a **Micro-Skill (Tier 3)**.

**Key Differences from Skills:**
- No Tactical 4-D methodology
- Single operation only
- Smart but simple error handling
- Fast model (Haiku)
- Called by skills, not directly by agents/Maestro

**AI Fluency Mode:** Automation - deterministic execution

**Role:** Musician - plays one note perfectly, every time

---

**Micro-Skill Status**: Tier 3 Execution Tool
**Model**: Haiku (efficient)
**Domain**: [Specific domain, e.g., "file-system-read"]
**Version**: 1.0.0
```

### Command Structure

```markdown
---
description: Clear one-sentence purpose
argument-hint: example-argument
---

[Opening instruction about role and purpose]

## Instructions

1. **[Step 1 Name]** - Action description
   - Sub-point if needed
   - Additional details

2. **[Step 2 Name]** - Action description with:
   - Structured breakdown
   - Multiple components
   - Examples

3. **[Step 3 with $ARGUMENTS]**:
   - Use $ARGUMENTS placeholder where user input goes
   - Example: "Create plan for: $ARGUMENTS"

4. **[Final Step]**:
   - Structured output format
   - Quality requirements
   - Deliverables

## Quality Standards
- Standard 1
- Standard 2
- Validation requirement

## Context References
- Check `FILE.md` for related information (if exists)
- Consult `GUIDE.md` for methodology (if exists)

**Note**: [Final usage guidance or important context]
```

---

## Registry Patterns

### agent-registry.json Pattern

```json
{
  "version": "1.0",
  "description": "Agent activation rules for Maestro Conductor System",
  "delegation_hierarchy": {
    "tier_0": "Maestro (Conductor) - Strategic 4-D",
    "tier_1": "Agents (Domain Orchestrators) - Domain-level coordination",
    "tier_2": "Skills (Operation Orchestrators) - Tactical 4-D",
    "tier_3": "Micro-Skills (Musicians) - Pure execution"
  },
  "agents": {
    "agent-name": {
      "type": "domain-coordinator",
      "enforcement": "suggest",
      "priority": "high",
      "description": "Detailed description with keywords for discovery",
      "domain": "domain-name",
      "skillRegistry": ".claude/skills/skill-rules.json",
      "delegatesTo": ["skill-1", "skill-2"],
      "agentPath": ".claude/agents/agent-name.md",
      "promptTriggers": {
        "keywords": ["trigger", "words", "phrases"],
        "intentPatterns": [
          "^(action|verb).*pattern$",
          "keyword.*context"
        ],
        "domainIndicators": ["contextual", "clues"]
      },
      "capabilities": [
        "primary-capability",
        "secondary-capability"
      ],
      "delegation_strategy": {
        "description": "How agent routes work to skills",
        "routing_logic": {
          "condition_1": "route to skill-1",
          "condition_2": "route to skill-2"
        }
      }
    }
  }
}
```

### skill-rules.json Pattern

```json
{
  "version": "1.1",
  "description": "Skill activation rules for Maestro Conductor System",
  "subagents": {
    "subagent-name": {
      "type": "orchestrator",
      "enforcement": "suggest",
      "priority": "high",
      "description": "What subagent does",
      "agentPath": ".claude/agents/subagent-name.md",
      "promptTriggers": {
        "keywords": ["trigger", "words"],
        "intentPatterns": ["^pattern.*regex$"]
      },
      "delegation": {
        "description": "How it delegates work",
        "preservesContext": true,
        "returnsFormat": "Structured result description"
      }
    }
  },
  "skills": {
    "skill-name": {
      "type": "domain|guardrail",
      "enforcement": "suggest|block|warn",
      "priority": "critical|high|medium|low",
      "description": "Detailed description with use cases and keywords",
      "promptTriggers": {
        "keywords": ["trigger", "words"],
        "intentPatterns": [
          "^action.*pattern$",
          "keyword.*context"
        ]
      },
      "fileTriggers": {
        "patterns": ["**/*.ext", "path/to/*.file"],
        "operations": ["read", "write", "edit", "create"]
      },
      "capabilities": [
        "capability-1",
        "capability-2"
      ],
      "usedBy": "agent-name",
      "delegates-to": ["micro-skill-1", "micro-skill-2"],
      "skipConditions": {
        "when": "Condition description",
        "reason": "Why skip is acceptable"
      }
    }
  },
  "notes": {
    "enforcement_types": {
      "suggest": "Recommends skill but doesn't block workflow",
      "block": "Required before proceeding with operation",
      "warn": "Warning displayed but allows proceeding"
    },
    "priority_levels": {
      "critical": "Must use for correctness/safety",
      "high": "Strongly recommended",
      "medium": "Helpful optimization",
      "low": "Optional enhancement"
    }
  }
}
```

### Agent Manifest (.agent.json) Pattern

**Tier 1 Agent Manifest:**
```json
{
  "name": "agent-name",
  "version": "1.0.0",
  "type": "agent",
  "tier": 1,
  "description": "100-1000 characters with keywords for discovery. Explain domain and when to invoke.",
  "model": "sonnet",
  "domain": "domain-name",
  "capabilities": [
    "primary-capability",
    "secondary-capability",
    "search-keyword"
  ],
  "delegates-to": [
    "skill-1",
    "skill-2",
    "skill-3"
  ],
  "skill-registry": ".claude/skills/skill-rules.json",
  "allowed-tools": [
    "Read",
    "Write",
    "Edit",
    "Glob",
    "Grep",
    "Skill",
    "Bash",
    "Task"
  ],
  "triggers": {
    "keywords": ["trigger", "words"],
    "intentPatterns": ["^pattern.*regex$"],
    "domainIndicators": ["contextual", "clues"]
  },
  "activation": {
    "auto": true,
    "enforcement": "suggest",
    "priority": "high"
  },
  "delegation-strategy": {
    "description": "How agent routes work to skills",
    "routing-logic": {
      "condition-1": "skill-1",
      "condition-2": "skill-2"
    }
  },
  "methodology": "Domain Direction",
  "ai-fluency-mode": "agency",
  "metadata": {
    "author": "creator-name",
    "created": "2025-11-18",
    "status": "active"
  }
}
```

### Skill Manifest (.skill.json) Pattern

**Tier 2 Skill Manifest:**
```json
{
  "name": "skill-name",
  "version": "1.0.0",
  "type": "skill",
  "tier": 2,
  "description": "100-1000 characters with keywords for discovery",
  "model": "sonnet",
  "capabilities": [
    "primary-capability",
    "related-capability",
    "search-keyword"
  ],
  "delegates-to": [
    "micro-skill-1",
    "micro-skill-2"
  ],
  "allowed-tools": [],
  "triggers": {
    "keywords": ["trigger", "words"],
    "intentPatterns": ["(regex|pattern)", "another.*pattern"]
  },
  "activation": {
    "auto": true,
    "enforcement": "suggest",
    "priority": "high"
  },
  "domain": "domain-name",
  "interaction-mode": "augmentation"
}
```

**Tier 3 Micro-Skill Manifest:**
```json
{
  "name": "micro-skill-name",
  "version": "1.0.0",
  "description": "50-500 characters, single-purpose operation",
  "type": "micro-skill",
  "tier": 3,
  "model": "haiku",
  "allowed_tools": ["Read", "Glob"],
  "capabilities": ["specific-operation"],
  "input": {
    "type": "object",
    "properties": {
      "param_name": {
        "type": "string",
        "description": "What this parameter is",
        "optional": false
      }
    }
  },
  "output": {
    "type": "object",
    "properties": {
      "success": {"type": "boolean"},
      "result": {"type": "object", "optional": true},
      "error": {"type": "object", "optional": true}
    }
  },
  "error_handling": {
    "autonomous_retry": {
      "EBUSY": {
        "attempts": 3,
        "backoff": "exponential",
        "delays_ms": [0, 100, 200]
      }
    },
    "context_aware_escalation": [
      "ENOENT",
      "EACCES",
      "EISDIR"
    ]
  },
  "keywords": ["search", "discovery", "terms"],
  "domain": "file-system-operations",
  "role": "musician",
  "orchestration": false,
  "methodology": "none"
}
```

---

## Error Handling Patterns

### Tier 2 Skills: 5-Level Recovery System

```typescript
// Level 1: Retry with Backoff
async function level1Retry(operation, maxAttempts = 3) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      return await operation();
    } catch (error) {
      if (!isTransient(error) || i === maxAttempts - 1) throw error;
      await delay(Math.pow(2, i) * 100);  // Exponential backoff
    }
  }
}

// Level 2: Parameter Adjustment
async function level2Adjust(operation, params) {
  try {
    return await operation(params);
  } catch (error) {
    if (error.context?.suggestion) {
      const adjustedParams = applyErrorSuggestion(params, error);
      return await operation(adjustedParams);
    }
    throw error;
  }
}

// Level 3: Alternative Approach
async function level3Alternative(primaryOperation, fallbackOperation) {
  try {
    return await primaryOperation();
  } catch (error) {
    console.log("Primary failed, trying alternative approach");
    return await fallbackOperation();
  }
}

// Level 4: Partial Success
function level4Partial(results, criticalOnly = false) {
  const succeeded = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  if (criticalOnly && succeeded.some(r => r.critical)) {
    return {
      success: true,
      partial: true,
      results: succeeded,
      failures: failed,
      message: "Critical operations succeeded, optional parts failed"
    };
  }

  throw new Error("Critical operations failed");
}

// Level 5: Escalate to Maestro
function level5Escalate(error, context) {
  return {
    success: false,
    error: {
      code: error.code,
      message: error.message,
      context: {
        attempted: context.operation,
        parameters: context.params,
        alternatives_tried: context.fallbacks,
        recommendation: "Human decision required",
        options: [
          "Option 1: Try with different parameters",
          "Option 2: Use alternative approach",
          "Option 3: Skip this operation"
        ]
      }
    }
  };
}
```

### Tier 3 Micro-Skills: 2-Level Error Handling

```typescript
// Level 1: Autonomous Retry
const RETRY_CONFIG = {
  EBUSY: { attempts: 3, delays: [0, 100, 200] },
  EAGAIN: { attempts: 3, delays: [50, 150, 300] },
  ETIMEDOUT: { attempts: 2, delays: [500, 1000] }
};

async function autonomousRetry(operation, errorCode) {
  const config = RETRY_CONFIG[errorCode];
  if (!config) return null;  // Not retriable

  for (let i = 0; i < config.attempts; i++) {
    try {
      return await operation();
    } catch (error) {
      if (error.code !== errorCode || i === config.attempts - 1) {
        throw error;
      }
      await delay(config.delays[i]);
    }
  }
}

// Level 2: Context-Aware Escalation
function escalateWithContext(error, operationContext) {
  return {
    success: false,
    error: {
      code: error.code,
      message: error.message,
      context: {
        attempted: operationContext.operation,
        parameters: operationContext.params,
        ...buildContextualInfo(error, operationContext)
      }
    }
  };
}

function buildContextualInfo(error, context) {
  switch (error.code) {
    case 'ENOENT':
      return {
        path: context.params.path,
        alternatives: findSimilarPaths(context.params.path),
        suggestion: "Check if file was moved or renamed"
      };
    case 'EACCES':
      return {
        path: context.params.path,
        current_permissions: getPermissions(context.params.path),
        required_permissions: "write",
        suggestion: "Run with elevated permissions or choose different location"
      };
    // ... other error codes
  }
}
```

---

## Transparency Patterns

### Emoji-Based Status Indicators

```markdown
🎯 **Subagent Activated**: [agent-name]
📂 **Task**: [What you're doing]

🔧 **Loading Skill**: [skill-name]
📋 **Purpose**: [Why this skill is needed]

⚙️  **Processing**: [Current action description]

✅ **Complete**
**Subagent:** [agent-name]
**Skill Used:** [skill-name or "none"]
**Files Affected:** [file paths with line numbers]
**Findings:** [Summary of results]

⚠️  **Refinement Needed**
**Issue:** [What needs improvement]
**Coaching:** [Specific guidance]
**Re-delegating:** [What to do next]

⛔ **Escalating to Maestro**
**Reason:** [Why escalation is needed]
**Context:** [Relevant information]
**Options:** [Choices for Maestro]
```

### Progress Visualization

```markdown
## Orchestration Flow

┌─────────────────────────────────────┐
│ 1. ✅ Skill 1: file-reader          │
│    └─ Result: Successfully read     │
└─────────────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│ 2. ⚙️  Skill 2: file-validator      │
│    └─ Status: Validating...         │
└─────────────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│ 3. ⏸️  Skill 3: file-writer         │
│    └─ Status: Pending               │
└─────────────────────────────────────┘
```

### Evidence-Based Reporting

```markdown
## Changes Made

**File**: `/path/to/file.js`
**Lines**: 42-56
**Operation**: Modified function signature

```javascript
// Before (line 42)
function processData(data) {

// After (line 42)
function processData(data, options = {}) {
```

**Validation**: ✅ Tests pass
```bash
$ npm test
  ✓ processData handles default options
  ✓ processData accepts custom options

  2 passing (14ms)
```
```

---

## Naming Conventions

### File Names

| Type | Pattern | Example |
|------|---------|---------|
| Agent | `agent-name.md` | `file-operations-agent.md` |
| Agent Manifest | `agent-name.agent.json` | `file-operations-agent.agent.json` |
| Skill (Tier 2) | `skill-name/SKILL.md` | `file-writer/SKILL.md` |
| Skill Manifest | `skill-name.skill.json` | `file-writer.skill.json` |
| Micro-skill (Tier 3) | `micro-skills/name/SKILL.md` | `micro-skills/read-file/SKILL.md` |
| Micro-skill Manifest | `micro-skill-name.skill.json` | `read-file.skill.json` |
| Command | `command-name.md` | `dev-docs.md` |
| Template | `TEMPLATE_NAME.md` | `SUBAGENT_TEMPLATE.md` |
| Documentation | `DESCRIPTION.md` | `README.md`, `ARCHITECTURE.md` |
| Registry | `type-registry.json` | `agent-registry.json`, `skill-rules.json` |
| References | `references/topic.md` | `references/methodology.md` |

### Naming Rules

- **Files**: lowercase-with-hyphens (kebab-case)
- **Templates/Docs**: SCREAMING_SNAKE_CASE for visibility
- **Directories**: lowercase-with-hyphens, plural for collections
  - `agents/` not `agent/`
  - `micro-skills/` not `micro-skill/`
  - `references/` not `reference/`
- **Variables in docs**: snake_case for TypeScript/JSON examples
- **Agent names**: Descriptive, domain-focused
  - `file-operations-agent` ✓
  - `file-agent` ✗ (too vague)
- **Skill names**: Action-oriented
  - `file-writer` ✓ (what it does)
  - `writing` ✗ (ambiguous)
- **Micro-skill names**: Single-operation focused
  - `read-file` ✓
  - `file-operations` ✗ (too broad for Tier 3)

---

## Quick Decision Matrix

### "Which tier should this be?"

| Question | Answer → Tier |
|----------|---------------|
| Does it make strategic decisions across a domain? | → Tier 1 (Agent) |
| Does it orchestrate multiple operations with domain expertise? | → Tier 2 (Skill) |
| Does it perform a single, focused operation? | → Tier 3 (Micro-skill) |
| Is it a user-invoked workflow? | → Command |

### "Agent or Skill?"

| Characteristic | Agent (Tier 1) | Skill (Tier 2) |
|----------------|----------------|----------------|
| **Scope** | Entire domain | Specific operation type |
| **Delegates to** | Skills | Micro-skills |
| **Methodology** | Domain Direction | Tactical 4-D |
| **Model** | Sonnet | Sonnet |
| **Context size** | No limit | <500 lines |
| **Example** | file-operations-agent | file-writer skill |

### "Skill or Micro-Skill?"

| Characteristic | Skill (Tier 2) | Micro-Skill (Tier 3) |
|----------------|----------------|----------------------|
| **Complexity** | Orchestrates sequence | Single operation |
| **Decision-making** | Strategic | None (pure execution) |
| **Error handling** | 5-level recovery | 2-level (retry + escalate) |
| **Methodology** | Tactical 4-D | None |
| **Model** | Sonnet | Haiku |
| **Delegates** | Yes (to micro-skills) | No |
| **Example** | file-writer (validates, backups, writes, verifies) | read-file (just reads) |

### "When to use Commands?"

Commands are for:
- ✅ User-initiated workflows
- ✅ Multi-step processes that need human guidance
- ✅ Strategic planning (e.g., create implementation plan)
- ✅ Documentation updates
- ✅ Repetitive sequences users invoke explicitly

Commands are NOT for:
- ❌ Automated orchestration (use agents/skills)
- ❌ System-level delegation (use agents)
- ❌ Single tool operations (use tools directly)

---

## Progressive Disclosure Pattern

### Problem
Long skill files bloat context and slow down operation.

### Solution
Main file <500 lines, deep content in `references/`

### Structure
```
skill-name/
├── SKILL.md                           # <500 lines
│   ├── Quick Start (80% use cases)
│   ├── Common Patterns
│   ├── Navigation to references
│   └── Essential information only
│
├── skill-name.skill.json              # Discovery manifest
│
└── references/                        # Deep dives <500 lines each
    ├── methodology.md                 # How the approach works
    ├── patterns.md                    # Advanced patterns
    ├── troubleshooting.md             # Error handling deep dive
    ├── examples.md                    # Comprehensive examples
    └── architecture.md                # System design details
```

### In SKILL.md

```markdown
## Advanced Topics

For deep dives on specific topics, see:

- **Methodology**: See [references/methodology.md](references/methodology.md)
- **Advanced Patterns**: See [references/patterns.md](references/patterns.md)
- **Troubleshooting**: See [references/troubleshooting.md](references/troubleshooting.md)

These references are loaded on-demand when needed.
```

### Loading Pattern

```markdown
## When to Load References

**Load methodology.md when:**
- Implementing custom recovery strategies
- Understanding the theoretical foundation
- Training new team members

**Load patterns.md when:**
- Handling complex edge cases
- Optimizing performance
- Integrating with unusual systems

**Load troubleshooting.md when:**
- Encountering unexpected errors
- Debugging integration issues
- Understanding error recovery paths
```

---

## Version Control

### Semantic Versioning

All components use semver: `MAJOR.MINOR.PATCH`

- **MAJOR**: Breaking changes (interface, structure)
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Version Declaration

In YAML frontmatter:
```yaml
version: 1.0.0
```

In manifest files:
```json
{
  "version": "1.0.0"
}
```

In registries:
```json
{
  "version": "1.0",  // Registry format version
  "agents": {
    "agent-name": {
      "version": "1.0.0"  // Component version
    }
  }
}
```

---

## Summary Checklist

When creating a new component, verify:

### Agent Checklist
- [ ] YAML frontmatter with all required fields
- [ ] Clear "When to Use" section
- [ ] Integration with Maestro defined (receives/returns)
- [ ] Domain Direction or decision logic explained
- [ ] Skills it delegates to listed
- [ ] Error handling strategy documented
- [ ] Best practices (DO/DON'T)
- [ ] Success criteria checklist
- [ ] Corresponding `.agent.json` manifest file created
- [ ] Entry in `agent-registry.json`

### Skill Checklist (Tier 2)
- [ ] YAML frontmatter with tier=2
- [ ] Main file <500 lines
- [ ] Tactical 4-D implementation sections
- [ ] Micro-skills it delegates to listed
- [ ] 5-level error recovery documented
- [ ] Domain expertise section
- [ ] Usage examples
- [ ] Corresponding `.skill.json` manifest
- [ ] Entry in `skill-rules.json`
- [ ] References directory (if needed)

### Micro-Skill Checklist (Tier 3)
- [ ] YAML frontmatter with tier=3
- [ ] Single operation focus
- [ ] NO orchestration logic
- [ ] Input/output TypeScript interfaces
- [ ] 2-level error handling (retry + escalate)
- [ ] Rich error context examples
- [ ] Corresponding `.skill.json` manifest
- [ ] Entry in `skill-rules.json`
- [ ] Uses Haiku model

### Command Checklist
- [ ] YAML frontmatter with description
- [ ] Argument hint provided
- [ ] Clear step-by-step instructions
- [ ] Uses $ARGUMENTS placeholder appropriately
- [ ] Quality standards defined
- [ ] Context references (if applicable)

---

**Document Version**: 1.0.0
**Last Updated**: 2025-11-18
**Status**: Reference material for Maestro framework implementation
