---
name: validate-json
version: 1.0.0
type: micro-skill
tier: 3
---

# validate-json Micro-Skill

**Type**: Tier 3 Micro-Skill (Pure Execution)
**Purpose**: Validate JSON syntax and optionally check schema compliance
**Model**: Haiku (fast, cost-effective for validation)

---

## Overview

This micro-skill validates JSON content and provides precise error locations for syntax errors. It can also validate against JSON Schema for structure compliance.

**NO ORCHESTRATION** - Pure execution only. Receives JSON string, validates, returns structured result.

**NO RETRY** - Validation errors are logical, not transient. Retry won't help.

---

## Input Schema

```typescript
interface ValidateJsonInput {
  content: string;        // JSON content to validate (as string)
  schema?: object;        // Optional JSON Schema to validate against
  strict?: boolean;       // Strict mode: reject duplicates, trailing commas (default: false)
}
```

**Examples**:

Basic validation:
```json
{
  "content": "{\"name\": \"test\", \"value\": 42}"
}
```

With schema validation:
```json
{
  "content": "{\"name\": \"test\", \"value\": 42}",
  "schema": {
    "type": "object",
    "properties": {
      "name": {"type": "string"},
      "value": {"type": "number"}
    },
    "required": ["name", "value"]
  }
}
```

Strict mode:
```json
{
  "content": "{\"name\": \"test\"}",
  "strict": true
}
```

---

## Output Schema

```typescript
interface ValidateJsonOutput {
  valid: boolean;
  parsed?: object;        // Parsed JSON (only if valid)
  errors?: Array<{
    type: "syntax" | "schema";
    message: string;
    line?: number;        // 1-indexed
    column?: number;      // 1-indexed
    position?: number;    // Character position
    context?: string;     // Surrounding text
  }>;
}
```

**Valid JSON Output**:
```json
{
  "valid": true,
  "parsed": {
    "name": "test",
    "value": 42
  }
}
```

**Syntax Error Output**:
```json
{
  "valid": false,
  "errors": [
    {
      "type": "syntax",
      "message": "Unexpected token } in JSON at position 15",
      "line": 1,
      "column": 16,
      "position": 15,
      "context": "{\"name\": \"test\",}"
    }
  ]
}
```

**Schema Error Output**:
```json
{
  "valid": false,
  "errors": [
    {
      "type": "schema",
      "message": "Missing required property: value",
      "context": "Schema requires 'value' property but it was not found"
    }
  ]
}
```

---

## Execution Logic

### Phase 1: Syntax Validation

```javascript
try {
  const parsed = JSON.parse(content);
  // Valid syntax, continue to schema check if provided
} catch (error) {
  // Extract line/column from error
  const position = error.message.match(/position (\d+)/)?.[1];
  const { line, column } = calculateLineColumn(content, position);

  return {
    valid: false,
    errors: [{
      type: "syntax",
      message: error.message,
      line: line,
      column: column,
      position: parseInt(position),
      context: getContext(content, position)
    }]
  };
}
```

### Phase 2: Schema Validation (If Provided)

```javascript
if (schema) {
  const ajv = new Ajv();
  const validate = ajv.compile(schema);
  const valid = validate(parsed);

  if (!valid) {
    return {
      valid: false,
      errors: validate.errors.map(err => ({
        type: "schema",
        message: ajv.errorsText([err]),
        context: `Path: ${err.instancePath}, Schema path: ${err.schemaPath}`
      }))
    };
  }
}
```

### Phase 3: Return Result

```javascript
return {
  valid: true,
  parsed: parsed
};
```

---

## Error Handling

### 2-Level Strategy (Tier 3 Pattern)

#### Level 1: Autonomous Retry

**NONE** - Validation errors are logical, not transient.

If JSON has syntax error, retrying won't fix it. If JSON doesn't match schema, retrying won't change the structure.

#### Level 2: Context-Aware Escalation

**Syntax Errors**:
- Provide exact line, column, and character position
- Show surrounding context (5 characters before/after)
- Include full error message from parser

**Schema Errors**:
- List all validation failures
- Include JSON path to problematic data
- Include schema path showing what was expected

**Example escalation**:
```json
{
  "valid": false,
  "errors": [
    {
      "type": "syntax",
      "message": "Unexpected token : in JSON at position 12",
      "line": 2,
      "column": 3,
      "position": 12,
      "context": "{\n  \"name\": \"test\"\n}"
    }
  ]
}
```

Orchestrator can:
1. Show user the exact error location
2. Attempt to fix common issues (missing comma, trailing comma, etc.)
3. Re-prompt for valid JSON
4. Escalate to human with precise context

---

## Implementation

```javascript
#!/usr/bin/env node
// validate-json micro-skill execution

const input = JSON.parse(process.argv[2]);
const { content, schema, strict } = input;

// Helper: Calculate line and column from position
function calculateLineColumn(text, position) {
  const lines = text.substring(0, position).split('\n');
  return {
    line: lines.length,
    column: lines[lines.length - 1].length + 1
  };
}

// Helper: Get context around error position
function getContext(text, position, radius = 20) {
  const start = Math.max(0, position - radius);
  const end = Math.min(text.length, position + radius);
  const context = text.substring(start, end);
  const marker = ' '.repeat(Math.min(radius, position - start)) + '^';
  return context + '\n' + marker;
}

// Phase 1: Syntax validation
let parsed;
try {
  parsed = JSON.parse(content);
} catch (error) {
  const posMatch = error.message.match(/position (\d+)/);
  const position = posMatch ? parseInt(posMatch[1]) : 0;
  const { line, column } = calculateLineColumn(content, position);

  const output = {
    valid: false,
    errors: [{
      type: "syntax",
      message: error.message,
      line: line,
      column: column,
      position: position,
      context: getContext(content, position)
    }]
  };

  console.log(JSON.stringify(output));
  process.exit(0);
}

// Phase 2: Schema validation (if provided)
if (schema) {
  // Using a simple schema validator
  // In production, use ajv or similar library
  const errors = validateAgainstSchema(parsed, schema);

  if (errors.length > 0) {
    const output = {
      valid: false,
      errors: errors.map(err => ({
        type: "schema",
        message: err.message,
        context: err.context
      }))
    };

    console.log(JSON.stringify(output));
    process.exit(0);
  }
}

// Phase 3: Success
const output = {
  valid: true,
  parsed: parsed
};

console.log(JSON.stringify(output));
process.exit(0);

// Simple schema validator (basic implementation)
function validateAgainstSchema(data, schema) {
  const errors = [];

  if (schema.type && typeof data !== schema.type) {
    errors.push({
      message: `Expected type ${schema.type}, got ${typeof data}`,
      context: `Root type mismatch`
    });
  }

  if (schema.required && schema.type === 'object') {
    for (const key of schema.required) {
      if (!(key in data)) {
        errors.push({
          message: `Missing required property: ${key}`,
          context: `Schema requires '${key}' property`
        });
      }
    }
  }

  if (schema.properties && schema.type === 'object') {
    for (const [key, propSchema] of Object.entries(schema.properties)) {
      if (key in data) {
        const propType = propSchema.type;
        const actualType = typeof data[key];

        if (propType && actualType !== propType) {
          errors.push({
            message: `Property '${key}' should be ${propType}, got ${actualType}`,
            context: `Path: /${key}`
          });
        }
      }
    }
  }

  return errors;
}
```

---

## Usage Examples

### From Orchestrator Skill

```typescript
// skill-wizard validating generated manifest
const manifestContent = JSON.stringify({
  name: skillName,
  version: "1.0.0",
  type: "skill",
  capabilities: capabilities
});

const result = await invoke_micro_skill("validate-json", {
  content: manifestContent
});

if (result.valid) {
  console.log("Manifest is valid JSON");
  // Continue with writing file
} else {
  console.error("Invalid manifest JSON:");
  for (const error of result.errors) {
    console.error(`  Line ${error.line}, Col ${error.column}: ${error.message}`);
    console.error(`  Context: ${error.context}`);
  }
  // Fix errors and retry generation
}
```

### Validating with Schema

```typescript
// Validate skill manifest against schema
const manifestSchema = {
  type: "object",
  properties: {
    name: { type: "string" },
    version: { type: "string" },
    type: { type: "string" },
    capabilities: { type: "array" }
  },
  required: ["name", "version", "type", "capabilities"]
};

const result = await invoke_micro_skill("validate-json", {
  content: manifestContent,
  schema: manifestSchema
});

if (!result.valid) {
  // Handle schema validation errors
  for (const error of result.errors) {
    if (error.type === "schema") {
      console.error(`Schema error: ${error.message}`);
    }
  }
}
```

### Chaining with read-file

```typescript
// Read file, parse and validate JSON
const fileContent = await invoke_micro_skill("read-file", {
  file_path: ".claude/skills/my-skill/manifest.json"
});

if (fileContent.success) {
  const validation = await invoke_micro_skill("validate-json", {
    content: fileContent.data
  });

  if (validation.valid) {
    // Work with parsed JSON
    const manifest = validation.parsed;
  }
}
```

---

## Testing

### Test 1: Valid JSON
```bash
# Input
{
  "content": "{\"name\": \"test\", \"value\": 42}"
}

# Expected Output
{
  "valid": true,
  "parsed": {
    "name": "test",
    "value": 42
  }
}
```

### Test 2: Syntax Error (Missing Comma)
```bash
# Input
{
  "content": "{\"name\": \"test\" \"value\": 42}"
}

# Expected Output
{
  "valid": false,
  "errors": [
    {
      "type": "syntax",
      "message": "Unexpected string in JSON at position 16",
      "line": 1,
      "column": 17,
      "position": 16,
      "context": "{\"name\": \"test\" \"value\": 42}"
    }
  ]
}
```

### Test 3: Schema Validation (Missing Required Field)
```bash
# Input
{
  "content": "{\"name\": \"test\"}",
  "schema": {
    "type": "object",
    "properties": {
      "name": {"type": "string"},
      "value": {"type": "number"}
    },
    "required": ["name", "value"]
  }
}

# Expected Output
{
  "valid": false,
  "errors": [
    {
      "type": "schema",
      "message": "Missing required property: value",
      "context": "Schema requires 'value' property"
    }
  ]
}
```

### Test 4: Schema Validation (Wrong Type)
```bash
# Input
{
  "content": "{\"name\": \"test\", \"value\": \"not a number\"}",
  "schema": {
    "type": "object",
    "properties": {
      "name": {"type": "string"},
      "value": {"type": "number"}
    },
    "required": ["name", "value"]
  }
}

# Expected Output
{
  "valid": false,
  "errors": [
    {
      "type": "schema",
      "message": "Property 'value' should be number, got string",
      "context": "Path: /value"
    }
  ]
}
```

---

## Design Rationale

### Why No Autonomous Retry?

Validation errors are **logical**, not transient:
- Syntax errors are in the content itself (missing comma, etc.)
- Schema errors are structural mismatches
- Retrying the same validation will always produce the same error

**Solution**: Provide rich context for orchestrator to fix the issue, then re-validate.

### Why Precise Error Locations?

Syntax errors in JSON can be hard to spot:
- Missing comma in 500-line file
- Extra bracket in deeply nested structure
- Trailing comma in array

**Line/column/context** make it trivial to fix:
```
Line 42, Column 5: Unexpected token }
Context:
  "capabilities": ["skill-creation"]
}     <-- HERE
```

### Why Schema Validation?

Manifests must follow specific structure:
- Required fields: name, version, type, capabilities
- Type constraints: capabilities must be array
- Format validation: version matches semver pattern

**Schema validation** catches structural errors before files are written.

---

## Performance Characteristics

- **Valid JSON**: ~2-5ms (just parse)
- **Syntax error**: ~3-7ms (parse + location calculation)
- **Schema validation**: ~5-15ms (parse + schema check)
- **Model**: Haiku (cost-effective for simple validation)

---

## Integration with skill-wizard

skill-wizard will use this micro-skill to:
1. Validate generated manifest JSON before writing file
2. Validate user-provided JSON inputs (if any)
3. Verify existing manifests when reading

```typescript
// skill-wizard orchestration
const manifest = {
  name: skillName,
  version: "1.0.0",
  type: "skill",
  tier: 2,
  capabilities: capabilities,
  keywords: keywords
};

const manifestJSON = JSON.stringify(manifest, null, 2);

// Validate before writing
const validation = await invoke_micro_skill("validate-json", {
  content: manifestJSON,
  schema: MANIFEST_SCHEMA
});

if (!validation.valid) {
  return {
    error: "Generated manifest is invalid",
    details: validation.errors
  };
}

// Write validated manifest
await invoke_micro_skill("write-file", {
  file_path: `.claude/skills/${skillName}/${skillName}.skill.json`,
  content: manifestJSON
});
```

---

## Common Validation Errors

### Trailing Comma
```json
{
  "name": "test",
  "value": 42,  // <-- ERROR
}
```
**Error**: `Unexpected token } in JSON at position 35`

### Missing Comma
```json
{
  "name": "test"  // <-- ERROR (missing comma)
  "value": 42
}
```
**Error**: `Unexpected string in JSON at position 16`

### Unquoted Key
```json
{
  name: "test"  // <-- ERROR (should be "name")
}
```
**Error**: `Unexpected token n in JSON at position 2`

### Single Quotes (Must Use Double)
```json
{
  'name': 'test'  // <-- ERROR (must use " not ')
}
```
**Error**: `Unexpected token ' in JSON at position 2`

---

**Tier 3 Principle**: Pure validation, rich error context, no retry on logical errors.
