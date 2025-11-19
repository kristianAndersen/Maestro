---
name: micro-skill-name                # kebab-case, operation-focused
description: Pure execution micro-skill that [single operation]. Handles [specific details like encoding, errors, edge cases].
type: micro-skill
tier: 3
version: 1.0.0
model: haiku                          # Fast model for simple execution
allowed-tools: [Read, Write]          # Specific tools only - be restrictive
---

# [Micro-Skill Name] - Micro-Skill (Tier 3 Musician)

**Type**: Tier 3 - Pure Execution
**Role**: Musician - Executes single operation with smart error handling
**No 4-D**: This is a pure execution tool, not an orchestrator

## Purpose

[Describe the SINGLE operation this micro-skill performs. Be very specific.]

**Key Principle**: **NO ORCHESTRATION** - Does ONE thing with excellence

**Operation**: [Verb + Object - e.g., "Reads file content", "Writes data to file", "Validates JSON structure"]

**Scope**: [What this includes and explicitly excludes]

## Operation

### Input Parameters

```javascript
{
  // Required parameters
  param1: string;              // Description of param1
  param2: number;              // Description of param2

  // Optional parameters
  param3?: boolean;            // Description of param3 (optional)

  // Options object (if needed)
  options?: {
    flag1: boolean;            // Description of flag1
    flag2: string;             // Description of flag2
    config?: object;           // Nested config if needed
  }
}
```

**Parameter Validation:**
- `param1`: [Validation rules - e.g., "Must be absolute path", "Cannot be empty"]
- `param2`: [Validation rules - e.g., "Must be positive integer", "Range: 0-100"]
- `param3`: [Validation rules if applicable]

### Output

```javascript
{
  // Always present
  success: boolean;            // true if operation succeeded

  // Present on success
  result?: {
    [result_field]: any;       // Actual result data
    metadata?: {               // Optional metadata
      [meta_field]: any;
    }
  };

  // Present on failure
  error?: {
    code: string;              // Error code (e.g., "ENOENT", "INVALID_INPUT")
    message: string;           // Human-readable error message
    context: {                 // Rich context for upstream recovery
      attempted: string;       // What operation was attempted
      parameters: object;      // Parameters that were used
      [domain_specific]: any;  // Additional helpful context
      suggestion: string;      // Actionable suggestion for recovery
    }
  }
}
```

## Smart Error Handling

### Autonomous Retry (Level 1)

**Transient Errors** - Handle automatically without escalation

**[ERROR_CODE_1] ([Error Name])**:
```javascript
// Error code: [CODE]
// Cause: [Why this happens]
// Retry strategy: Exponential backoff
// Attempts: 3
// Delays: [0ms, 100ms, 200ms]

Example retry flow:
- Attempt 1: [ERROR] → wait 0ms
- Attempt 2: [ERROR] → wait 100ms
- Attempt 3: [ERROR] → wait 200ms
- Attempt 4: Success or escalate
```

**[ERROR_CODE_2] ([Error Name])**:
```javascript
// Error code: [CODE]
// Cause: [Why this happens]
// Retry strategy: [Description]
// Attempts: [N]
// Delays: [array]
```

**Retriable Error Codes:**
| Code | Meaning | Attempts | Delays | Reason |
|------|---------|----------|--------|--------|
| EBUSY | Resource busy | 3 | [0, 100, 200]ms | Temporary lock |
| EAGAIN | Try again | 3 | [50, 150, 300]ms | Transient state |
| [Add more] | [Description] | [N] | [array] | [Why retriable] |

### Context-Aware Escalation (Level 2)

**Permanent Errors** - Escalate immediately with rich context for upstream recovery

**[ERROR_CODE_A] ([Error Name])**:
```javascript
{
  success: false,
  error: {
    code: "[ERROR_CODE_A]",
    message: "[Human-readable message]",
    context: {
      attempted: "[operation description]",
      parameters: {
        // Original parameters
      },
      [specific_context]: "[helpful information]",
      [alternatives]: ["option1", "option2"],  // If applicable
      suggestion: "[Specific actionable suggestion]"
    }
  }
}
```

**Example**: [ERROR_CODE_A] (File Not Found)
```javascript
{
  success: false,
  error: {
    code: "ENOENT",
    message: "File not found: /path/to/file.txt",
    context: {
      attempted: "read file",
      parameters: {
        file_path: "/path/to/file.txt",
        encoding: "utf8"
      },
      directory_exists: true,
      alternatives: [
        "/path/to/file.md",
        "/path/to/backup.txt"
      ],
      suggestion: "Check if file was moved or renamed. Similar files found in directory."
    }
  }
}
```

**[ERROR_CODE_B] ([Error Name])**:
```javascript
{
  success: false,
  error: {
    code: "[ERROR_CODE_B]",
    message: "[Human-readable message]",
    context: {
      attempted: "[operation description]",
      parameters: { ... },
      [specific_context]: "[helpful information]",
      suggestion: "[Actionable suggestion]"
    }
  }
}
```

**Non-Retriable Error Codes:**
| Code | Meaning | Context Provided | Suggestion Pattern |
|------|---------|------------------|-------------------|
| ENOENT | Not found | Path, directory status, alternatives | "Verify path or create file" |
| EACCES | Permission denied | Path, permissions, required access | "Grant permissions or use different location" |
| EISDIR | Is directory | Expected file, got directory | "Specify file path, not directory" |
| INVALID_INPUT | Bad parameters | Validation details, examples | "Correct parameter format" |
| [Add more] | [Description] | [What to include] | [Pattern] |

## Implementation

### Algorithm

```javascript
async function executeOperation(params: InputParams): Promise<Output> {
  // STEP 1: Validate input
  const validation = validateInput(params);
  if (!validation.valid) {
    return {
      success: false,
      error: {
        code: "INVALID_INPUT",
        message: validation.message,
        context: {
          attempted: "[operation]",
          parameters: params,
          validation_errors: validation.errors,
          suggestion: validation.suggestion
        }
      }
    };
  }

  // STEP 2: Execute with retry logic
  const maxRetries = 3;
  const backoffDelays = [0, 100, 200];  // milliseconds

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Perform the actual operation
      const result = await performOperation(params);

      // STEP 3: Validate output
      if (!isValidResult(result)) {
        return buildErrorResponse("INVALID_OUTPUT", params, result);
      }

      // Success!
      return {
        success: true,
        result: {
          [result_field]: result,
          metadata: {
            attempts: attempt + 1,
            timestamp: Date.now()
          }
        }
      };

    } catch (error) {
      // Check if error is retriable
      if (isRetriableError(error.code) && attempt < maxRetries - 1) {
        // Retry with backoff
        await delay(backoffDelays[attempt]);
        continue;
      }

      // Not retriable or max retries reached - escalate with context
      return buildErrorResponse(error.code, params, error);
    }
  }
}

// Helper: Determine if error can be retried
function isRetriableError(errorCode: string): boolean {
  const retriableCodes = ['EBUSY', 'EAGAIN', 'ETIMEDOUT'];
  return retriableCodes.includes(errorCode);
}

// Helper: Build rich error response
function buildErrorResponse(errorCode: string, params: any, error: any) {
  return {
    success: false,
    error: {
      code: errorCode,
      message: getErrorMessage(errorCode, params),
      context: {
        attempted: "[operation description]",
        parameters: params,
        ...buildContextForError(errorCode, params, error)
      }
    }
  };
}

// Helper: Build context specific to error type
function buildContextForError(errorCode: string, params: any, error: any) {
  switch (errorCode) {
    case 'ENOENT':
      return {
        path: params.path,
        directory_exists: checkDirectoryExists(params.path),
        alternatives: findSimilarFiles(params.path),
        suggestion: "Verify path or check if file was moved"
      };

    case 'EACCES':
      return {
        path: params.path,
        current_permissions: getPermissions(params.path),
        required_permissions: "[required access level]",
        suggestion: "Grant appropriate permissions or use different location"
      };

    // Add cases for each error type
    default:
      return {
        raw_error: error.message,
        suggestion: "Contact support if issue persists"
      };
  }
}
```

### Input Validation

```javascript
function validateInput(params: InputParams): ValidationResult {
  const errors: string[] = [];

  // Validate param1
  if (!params.param1) {
    errors.push("param1 is required");
  }
  if (params.param1 && !meetsRequirement(params.param1)) {
    errors.push("param1 must [requirement]");
  }

  // Validate param2
  if (params.param2 !== undefined) {
    if (params.param2 < MIN || params.param2 > MAX) {
      errors.push(`param2 must be between ${MIN} and ${MAX}`);
    }
  }

  // Return validation result
  if (errors.length > 0) {
    return {
      valid: false,
      message: `Invalid input: ${errors.join(', ')}`,
      errors: errors,
      suggestion: "Check parameter requirements and try again"
    };
  }

  return { valid: true };
}
```

## Usage Examples

### Example 1: Successful Operation

**Input:**
```javascript
{
  param1: "value1",
  param2: 42,
  options: {
    flag1: true
  }
}
```

**Execution:**
- Validates input ✓
- Performs operation successfully
- Returns result

**Output:**
```javascript
{
  success: true,
  result: {
    [result_field]: "[actual result data]",
    metadata: {
      attempts: 1,
      timestamp: 1700000000000
    }
  }
}
```

### Example 2: Automatic Retry (Transient Error)

**Input:**
```javascript
{
  param1: "value1",
  param2: 42
}
```

**Execution:**
- Attempt 1: EBUSY → Retry after 0ms
- Attempt 2: EBUSY → Retry after 100ms
- Attempt 3: EBUSY → Retry after 200ms
- Attempt 4: SUCCESS

**Output:**
```javascript
{
  success: true,
  result: {
    [result_field]: "[result data]",
    metadata: {
      attempts: 4,  // Succeeded on 4th attempt
      timestamp: 1700000000000
    }
  }
}
```

### Example 3: Error with Rich Context (Permanent Error)

**Input:**
```javascript
{
  param1: "/nonexistent/file.txt",
  param2: 10
}
```

**Execution:**
- Validates input ✓
- Attempts operation → ENOENT
- Builds rich error context
- Escalates immediately (not retriable)

**Output:**
```javascript
{
  success: false,
  error: {
    code: "ENOENT",
    message: "File not found: /nonexistent/file.txt",
    context: {
      attempted: "read file",
      parameters: {
        param1: "/nonexistent/file.txt",
        param2: 10
      },
      directory_exists: false,
      alternatives: [],
      suggestion: "Verify path exists or create file first"
    }
  }
}
```

### Example 4: Invalid Input

**Input:**
```javascript
{
  param1: "",  // Invalid: empty
  param2: -5   // Invalid: negative
}
```

**Execution:**
- Validates input ✗
- Returns validation error immediately

**Output:**
```javascript
{
  success: false,
  error: {
    code: "INVALID_INPUT",
    message: "Invalid input: param1 is required, param2 must be between 0 and 100",
    context: {
      attempted: "[operation]",
      parameters: {
        param1: "",
        param2: -5
      },
      validation_errors: [
        "param1 is required",
        "param2 must be between 0 and 100"
      ],
      suggestion: "Provide valid param1 (non-empty) and param2 (0-100)"
    }
  }
}
```

## Error Codes Reference

| Code | Name | Retriable? | Retry Config | Context Fields | Suggestion Pattern |
|------|------|-----------|--------------|----------------|-------------------|
| ENOENT | Not found | No | - | path, directory_exists, alternatives | "Verify path or create resource" |
| EACCES | Permission denied | No | - | path, current_permissions, required_permissions | "Grant permissions or use different location" |
| EISDIR | Is directory | No | - | path, expected_type | "Specify file path, not directory" |
| ENOTDIR | Not directory | No | - | path, expected_type | "Specify directory path, not file" |
| EBUSY | Resource busy | Yes | 3x [0,100,200]ms | resource_name | Auto-retry (no manual intervention) |
| EAGAIN | Try again | Yes | 3x [50,150,300]ms | operation | Auto-retry (no manual intervention) |
| ETIMEDOUT | Timeout | Yes | 2x [500,1000]ms | timeout_value | Auto-retry or increase timeout |
| INVALID_INPUT | Bad params | No | - | validation_errors, requirements | "Correct parameter format" |
| INVALID_OUTPUT | Bad result | No | - | expected_format, actual_format | "Check operation logic" |

## Integration Notes

### Called By Skills (Tier 2)

**Skills orchestrate multiple micro-skills and make strategic decisions between calls.**

**Typical Usage Pattern:**
```javascript
// In a Tier 2 Skill

// Step 1: Use micro-skill for first operation
const result1 = await callMicroSkill("[micro-skill-name]", {
  param1: value1,
  param2: value2
});

if (!result1.success) {
  // Skill handles error (5-level recovery)
  return handleError(result1.error);
}

// Step 2: Strategic decision based on result1
const strategy = determineStrategy(result1.result);

// Step 3: Use another micro-skill with derived parameters
const result2 = await callMicroSkill("another-micro-skill", {
  input: result1.result,
  config: strategy
});

// Continue orchestration...
```

### Not Called Directly by Maestro or Agents

Micro-skills are implementation details. Higher tiers call skills (Tier 2), which use micro-skills (Tier 3).

**Architecture Flow:**
```
Maestro (Tier 0)
    ↓ delegates to
Agent (Tier 1)
    ↓ delegates to
Skill (Tier 2) ← Makes strategic decisions, orchestrates
    ↓ uses
Micro-Skill (Tier 3) ← Pure execution (THIS COMPONENT)
```

## Best Practices

### ✓ DO

- Focus on single, well-defined operation
- Validate all inputs before execution
- Provide rich error context for escalation
- Auto-retry transient errors (EBUSY, EAGAIN, etc.)
- Return consistent output structure always
- Include helpful suggestions in error messages
- Document all error codes and their meanings
- Keep implementation simple and focused
- Use fast model (Haiku) for efficiency

### ✗ DON'T

- Make strategic decisions (that's Tier 2's job)
- Orchestrate multiple operations
- Call other micro-skills
- Assume context about larger workflow
- Return ambiguous errors
- Skip input validation
- Silently fail or swallow errors
- Add complexity beyond single operation
- Use slow model (Sonnet) - this is pure execution

## Performance Characteristics

- **Model**: Haiku (optimized for speed and cost efficiency)
- **Target Latency**: <100ms for most operations
- **Memory**: Minimal context, single operation focus
- **Scalability**: Can be called hundreds of times in a workflow
- **Efficiency**: No overhead from orchestration logic

## Success Criteria

- [ ] Single operation completed (no orchestration)
- [ ] Input validation performed
- [ ] Structured output returned (success + result/error)
- [ ] Transient errors auto-retried appropriately
- [ ] Permanent errors escalated with rich context
- [ ] Error messages are actionable
- [ ] Output format is consistent
- [ ] Performance meets <100ms target (if applicable)

## Testing Checklist

When testing this micro-skill:

- [ ] **Success Case**: Valid input → successful result
- [ ] **Invalid Input**: Bad params → validation error
- [ ] **Transient Error**: Retriable error → auto-retry → success
- [ ] **Permanent Error**: Non-retriable error → immediate escalation with context
- [ ] **Max Retries**: Retriable error persists → escalation after max attempts
- [ ] **Edge Cases**: [List specific edge cases for this operation]
- [ ] **Performance**: Operation completes within target latency

## Notes

**This is NOT a Skill (Tier 2)**. This is a **Micro-Skill (Tier 3)**.

**Key Differences from Skills:**
- No 4-D methodology (no DELEGATION, DESCRIPTION, DISCERNMENT, DILIGENCE)
- Single operation only (no orchestration)
- Simple error handling (2 levels: retry + escalate)
- Fast model (Haiku, not Sonnet)
- Called by skills, not directly by agents/Maestro
- No strategic decision-making capability

**AI Fluency Mode:** Automation - deterministic execution

**Role:** Musician in the orchestra - plays one note perfectly, every time

**Design Philosophy:**
- Do ONE thing
- Do it WELL
- Fail with CONTEXT
- No surprises (predictable behavior)

---

**Micro-Skill Status**: Tier 3 Pure Execution Tool
**Model**: Haiku (fast and efficient)
**Domain**: [specific-domain - e.g., "file-system-read", "json-validation"]
**Operation**: [single-operation - e.g., "read file", "validate structure"]
**Version**: 1.0.0

---

## Companion Files

**Create these files to complete the micro-skill:**

1. **Micro-Skill Manifest** (`micro-skill-name.skill.json`)
2. **Registry Entry** (add to `.claude/skills/skill-rules.json`)

See `templates/MICRO_SKILL_MANIFEST_TEMPLATE.json` for manifest structure.
