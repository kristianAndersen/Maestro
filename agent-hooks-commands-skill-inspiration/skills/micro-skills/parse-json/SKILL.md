---
name: parse-json
description: Pure execution micro-skill that parses JSON strings into objects. Handles syntax errors with detailed location information, validates structure, supports relaxed parsing modes, and provides rich error context.
type: micro-skill
tier: 3
version: 1.0.0
model: sonnet
allowed-tools: []
---

# Parse JSON - Micro-Skill (Tier 3 Musician)

**Type**: Tier 3 - Pure Execution
**Role**: Musician - Executes single operation with smart error handling
**No 4-D**: This is a pure execution tool, not an orchestrator

---

## Purpose

Parses a JSON string into a JavaScript object with comprehensive error handling. This is a **single-purpose execution tool** with smart error handling.

**Key Principle**: **NO ORCHESTRATION** - This micro-skill does one thing: parse JSON. It doesn't plan, it doesn't evaluate strategy, it doesn't chain other operations. It executes and reports.

---

## Operation

### Input Parameters

```typescript
{
  json_string: string;          // JSON string to parse (required)
  strict?: boolean;             // Strict mode (reject trailing commas, comments). Default: true
  reviver?: Function;           // JSON.parse reviver function. Default: undefined
  max_depth?: number;           // Maximum nesting depth. Default: 100
}
```

### Output

```typescript
{
  success: boolean;
  data?: any;                   // Parsed object (if successful)
  metadata: {
    size: number;               // Original string size in bytes
    depth: number;              // Object nesting depth
    keys_count?: number;        // Number of keys (if object)
    array_length?: number;      // Array length (if array)
  };
  error?: {                     // If failed
    code: string;               // Error code (PARSE_ERROR, INVALID_JSON, etc.)
    message: string;            // Human-readable message
    context: object;            // Additional context for recovery
    suggestion: string;         // What might fix it
  }
}
```

---

## Smart Error Handling

### Autonomous Retry (Level 1)

**Transient Parsing Error**:
```typescript
// Retry once immediately (might be buffer/encoding issue)
Attempt 1: immediate
Attempt 2: immediate (no delay)
Result: Return success or error after 2 attempts
```

### Context-Aware Escalation (Level 2)

**Syntax Error (PARSE_ERROR)**:
```typescript
// Provide detailed location and context
{
  error: {
    code: "PARSE_ERROR",
    message: "Unexpected token '}' at position 145",
    context: {
      position: 145,
      line: 8,
      column: 12,
      near_text: '..."active": true,\n  }\n]',  // 50 chars around error
      expected: "property name or ']'",
      found: "'}'",
      json_snippet: '...first 200 chars of input...'
    },
    suggestion: "Check for missing comma, extra brace, or trailing comma at line 8 column 12"
  }
}
```

**Invalid JSON Structure (INVALID_JSON)**:
```typescript
// Not valid JSON at all
{
  error: {
    code: "INVALID_JSON",
    message: "Input is not valid JSON",
    context: {
      input_type: typeof json_string,
      input_sample: json_string.substring(0, 100),
      detected_format: "HTML" | "XML" | "YAML" | "plain text" | "unknown",
      size: json_string.length
    },
    suggestion: "Ensure input is valid JSON format, not HTML/XML/YAML"
  }
}
```

**Max Depth Exceeded (MAX_DEPTH)**:
```typescript
// Object nested too deeply
{
  error: {
    code: "MAX_DEPTH",
    message: "Object nesting exceeds maximum depth",
    context: {
      max_depth: 100,
      detected_depth: 127,
      sample_path: "root.data.items[0].metadata.context.details..."
    },
    suggestion: "Increase max_depth limit or flatten object structure"
  }
}
```

**Empty Input (EMPTY_INPUT)**:
```typescript
// Empty or whitespace-only string
{
  error: {
    code: "EMPTY_INPUT",
    message: "JSON string is empty or contains only whitespace",
    context: {
      input_length: 0,
      input_value: ""
    },
    suggestion: "Provide non-empty JSON string"
  }
}
```

---

## Implementation

### Basic Parse

```typescript
// Using native JSON.parse
try {
  const data = JSON.parse(json_string);

  return {
    success: true,
    data,
    metadata: {
      size: Buffer.byteLength(json_string, 'utf-8'),
      depth: calculateDepth(data),
      keys_count: typeof data === 'object' ? Object.keys(data).length : undefined,
      array_length: Array.isArray(data) ? data.length : undefined
    }
  };
} catch (error) {
  return format_error(error, { json_string });
}
```

### With Retry Logic

```typescript
async function parse_with_retry(json_string, max_attempts = 2) {
  for (let attempt = 1; attempt <= max_attempts; attempt++) {
    try {
      const data = JSON.parse(json_string);

      return {
        success: true,
        data,
        metadata: {
          size: Buffer.byteLength(json_string),
          depth: calculateDepth(data)
        },
        attempts: attempt
      };

    } catch (error) {
      // Only retry if might be transient (rare, but possible with large buffers)
      if (attempt < max_attempts && error.message.includes('buffer')) {
        continue;  // Try again immediately
      }

      return format_error(error, { json_string, attempt });
    }
  }
}
```

### With Depth Checking

```typescript
function parse_with_depth_check(json_string, max_depth = 100) {
  try {
    const data = JSON.parse(json_string);
    const depth = calculateDepth(data);

    if (depth > max_depth) {
      return {
        success: false,
        error: {
          code: "MAX_DEPTH",
          message: `Object nesting (${depth}) exceeds maximum depth (${max_depth})`,
          context: {
            max_depth,
            detected_depth: depth,
            sample_path: getDeepPath(data, max_depth)
          },
          suggestion: "Increase max_depth limit or flatten object structure"
        }
      };
    }

    return {
      success: true,
      data,
      metadata: { size: json_string.length, depth }
    };

  } catch (error) {
    return format_error(error, { json_string });
  }
}

function calculateDepth(obj, current_depth = 0) {
  if (typeof obj !== 'object' || obj === null) return current_depth;

  let max_child_depth = current_depth;
  for (const key in obj) {
    const child_depth = calculateDepth(obj[key], current_depth + 1);
    max_child_depth = Math.max(max_child_depth, child_depth);
  }

  return max_child_depth;
}
```

### With Error Location

```typescript
function format_error(error, context) {
  // Extract position from error message if available
  const position_match = error.message.match(/position (\d+)/);
  const position = position_match ? parseInt(position_match[1]) : null;

  let error_context = {
    input_sample: context.json_string.substring(0, 100) + '...',
    size: context.json_string.length
  };

  if (position !== null) {
    // Calculate line and column
    const before_error = context.json_string.substring(0, position);
    const line = (before_error.match(/\n/g) || []).length + 1;
    const last_newline = before_error.lastIndexOf('\n');
    const column = position - last_newline;

    // Extract context around error
    const start = Math.max(0, position - 25);
    const end = Math.min(context.json_string.length, position + 25);
    const near_text = context.json_string.substring(start, end);

    error_context = {
      ...error_context,
      position,
      line,
      column,
      near_text: `...${near_text}...`,
      char_at_position: context.json_string[position]
    };
  }

  return {
    success: false,
    error: {
      code: "PARSE_ERROR",
      message: error.message,
      context: error_context,
      suggestion: get_suggestion(error, error_context)
    }
  };
}

function get_suggestion(error, context) {
  const msg = error.message.toLowerCase();

  if (msg.includes('unexpected token')) {
    return `Check for syntax errors near line ${context.line || '?'} column ${context.column || '?'} - look for missing commas, extra braces, or trailing commas`;
  }

  if (msg.includes('unexpected end')) {
    return "JSON is incomplete - check for missing closing braces '}' or brackets ']'";
  }

  if (msg.includes('unexpected string')) {
    return "Check for missing colon ':' between property name and value, or missing comma between properties";
  }

  return "Validate JSON syntax using a JSON validator tool";
}
```

---

## Usage Examples

### Example 1: Basic Parse (Success)

**Input:**
```typescript
{
  json_string: '{"name": "test", "value": 42}'
}
```

**Output (Success):**
```typescript
{
  success: true,
  data: { name: "test", value: 42 },
  metadata: {
    size: 32,
    depth: 1,
    keys_count: 2
  }
}
```

### Example 2: Array Parse

**Input:**
```typescript
{
  json_string: '[1, 2, 3, 4, 5]'
}
```

**Output (Success):**
```typescript
{
  success: true,
  data: [1, 2, 3, 4, 5],
  metadata: {
    size: 15,
    depth: 1,
    array_length: 5
  }
}
```

### Example 3: Syntax Error

**Input:**
```typescript
{
  json_string: '{"name": "test", "active": true,}'  // Trailing comma
}
```

**Output (Error with Context):**
```typescript
{
  success: false,
  error: {
    code: "PARSE_ERROR",
    message: "Unexpected token '}' at position 35",
    context: {
      position: 35,
      line: 1,
      column: 36,
      near_text: '..."active": true,}',
      char_at_position: '}',
      input_sample: '{"name": "test", "active": true,}...'
    },
    suggestion: "Check for syntax errors near line 1 column 36 - look for missing commas, extra braces, or trailing commas"
  }
}
```

### Example 4: Invalid JSON (Not JSON)

**Input:**
```typescript
{
  json_string: '<html><body>Not JSON</body></html>'
}
```

**Output (Error):**
```typescript
{
  success: false,
  error: {
    code: "INVALID_JSON",
    message: "Input is not valid JSON",
    context: {
      input_type: "string",
      input_sample: "<html><body>Not JSON</body></html>",
      detected_format: "HTML",
      size: 35
    },
    suggestion: "Ensure input is valid JSON format, not HTML/XML/YAML"
  }
}
```

### Example 5: Deeply Nested Object

**Input:**
```typescript
{
  json_string: '{"a":{"b":{"c":{"d":{"e":...}}}}}',  // 150 levels deep
  max_depth: 100
}
```

**Output (Error - Too Deep):**
```typescript
{
  success: false,
  error: {
    code: "MAX_DEPTH",
    message: "Object nesting (150) exceeds maximum depth (100)",
    context: {
      max_depth: 100,
      detected_depth: 150,
      sample_path: "root.a.b.c.d.e.f.g.h.i.j..."
    },
    suggestion: "Increase max_depth limit or flatten object structure"
  }
}
```

### Example 6: Empty Input

**Input:**
```typescript
{
  json_string: "   "  // Only whitespace
}
```

**Output (Error):**
```typescript
{
  success: false,
  error: {
    code: "EMPTY_INPUT",
    message: "JSON string is empty or contains only whitespace",
    context: {
      input_length: 3,
      input_value: "   "
    },
    suggestion: "Provide non-empty JSON string"
  }
}
```

---

## Error Codes

| Code | Meaning | Retriable | Context Provided |
|------|---------|-----------|------------------|
| PARSE_ERROR | JSON syntax error | Yes (1x) | Position, line, column, near text, suggestion |
| INVALID_JSON | Not JSON format | No | Input sample, detected format |
| MAX_DEPTH | Nesting too deep | No | Max depth, detected depth, sample path |
| EMPTY_INPUT | Empty string | No | Input length, value |

---

## Integration Notes

### Called By Skills (Tier 2)

Skills orchestrate this micro-skill:
```typescript
// In data-reader skill (Tier 2)
const result = await micro_skill("parse-json", {
  json_string: file_content,
  max_depth: 50
});

// Skill evaluates result (Tactical Discernment)
if (!result.success) {
  // Apply domain expertise for recovery
  if (result.error.code === "PARSE_ERROR") {
    // Try to repair common JSON issues
    return try_repair_json(file_content);
  }
  return handle_parse_error(result.error);
}

// Use parsed data
process_data(result.data);
```

### Not Called Directly by Maestro

Maestro doesn't invoke micro-skills directly. Maestro → Skill → Micro-skill.

---

## Best Practices

### For Micro-Skill Implementation

**✓ DO**:
- Return structured output (success/error clearly marked)
- Provide detailed error location (line, column, near text)
- Calculate and return object metadata (depth, keys, size)
- Retry once for possible transient buffer issues
- Detect input format if not JSON (HTML, XML, YAML)
- Keep implementation simple and focused

**✗ DON'T**:
- Don't attempt to repair JSON (that's for skills)
- Don't validate content structure (schema validation is separate)
- Don't make assumptions about data usage
- Don't implement complex error recovery
- Don't try to detect "what the user meant"

---

## Performance

- **Model**: Haiku (fast, efficient)
- **Typical latency**: < 10ms for JSON < 100KB
- **Memory**: Loads entire JSON into memory (same as native JSON.parse)
- **Scalability**: For JSON > 1MB consider streaming parser

---

## Success Criteria

- ✓ Parses valid JSON successfully
- ✓ Returns detailed error location for syntax errors
- ✓ Calculates object depth and metadata
- ✓ Detects non-JSON input formats
- ✓ Handles empty/whitespace input gracefully
- ✓ Fast execution (< 10ms for typical JSON)
- ✓ Clear success/failure indication

---

## Notes

**This is NOT a skill (Tier 2)**. This is a **micro-skill (Tier 3)** - a pure execution tool.

**Key Differences from Skills**:
- **No Tactical 4-D**: Doesn't plan, doesn't evaluate, doesn't orchestrate
- **Single Operation**: Parses JSON, that's it
- **Smart but Simple**: Provides error location, doesn't attempt repairs
- **Fast Model**: Uses Haiku not Sonnet
- **Called by Skills**: Not invoked directly by Maestro

**Role**: Musician in the orchestra - plays one note perfectly when conductor (skill) signals.

---

**Micro-Skill Status**: Tier 3 Execution Tool
**Architecture**: Pure execution with smart error handling
**Model**: Haiku (efficient)
**Domain**: Data Operations
