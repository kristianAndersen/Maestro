---
name: parse-csv
description: Pure execution micro-skill that parses CSV strings into arrays of objects. Handles delimiter detection, header parsing, quoted fields, escaped characters, and provides row-level error reporting.
type: micro-skill
tier: 3
version: 1.0.0
model: sonnet
allowed-tools: []
---

# Parse CSV - Micro-Skill (Tier 3 Musician)

**Type**: Tier 3 - Pure Execution
**Role**: Musician - Executes single operation with smart error handling
**No 4-D**: This is a pure execution tool, not an orchestrator

---

## Purpose

Parses a CSV (Comma-Separated Values) string into an array of objects with comprehensive error handling. This is a **single-purpose execution tool** with smart error handling.

**Key Principle**: **NO ORCHESTRATION** - This micro-skill does one thing: parse CSV. It doesn't plan, it doesn't evaluate strategy, it doesn't chain other operations. It executes and reports.

---

## Operation

### Input Parameters

```typescript
{
  csv_string: string;           // CSV string to parse (required)
  delimiter?: string;           // Field delimiter. Default: auto-detect (comma, tab, semicolon)
  has_header?: boolean;         // First row is header. Default: true
  skip_empty_lines?: boolean;   // Skip blank rows. Default: true
  quote_char?: string;          // Quote character. Default: '"'
  escape_char?: string;         // Escape character. Default: '\\'
  trim_fields?: boolean;        // Trim whitespace from fields. Default: true
}
```

### Output

```typescript
{
  success: boolean;
  data?: Array<object>;         // Parsed rows (if successful)
  metadata: {
    rows: number;               // Number of data rows
    columns: number;            // Number of columns
    delimiter: string;          // Detected/used delimiter
    headers?: string[];         // Column headers (if has_header)
    skipped_rows: number;       // Empty rows skipped
  };
  error?: {                     // If failed
    code: string;               // Error code (PARSE_ERROR, INVALID_CSV, etc.)
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
// Retry once immediately (might be buffer issue)
Attempt 1: immediate
Attempt 2: immediate (no delay)
Result: Return success or error after 2 attempts
```

### Context-Aware Escalation (Level 2)

**Row Parse Error (ROW_PARSE_ERROR)**:
```typescript
// Error in specific row
{
  error: {
    code: "ROW_PARSE_ERROR",
    message: "Error parsing row 42: Unclosed quoted field",
    context: {
      row_number: 42,
      row_content: '"Name","Value","Description\n',  // Malformed row
      expected_columns: 5,
      actual_columns: 3,
      issue: "unclosed_quote",
      previous_row: '"John","123","Valid row"',
      next_row: '"Next","456","Also valid"'
    },
    suggestion: "Check row 42 for unclosed quotes, missing delimiters, or newlines within quoted fields"
  }
}
```

**Column Count Mismatch (COLUMN_MISMATCH)**:
```typescript
// Row has different number of columns
{
  error: {
    code: "COLUMN_MISMATCH",
    message: "Row 15 has 7 columns, expected 5",
    context: {
      row_number: 15,
      expected_columns: 5,
      actual_columns: 7,
      row_content: "a,b,c,d,e,f,g",
      headers: ["col1", "col2", "col3", "col4", "col5"],
      extra_fields: ["f", "g"]
    },
    suggestion: "Verify delimiter is correct, check for extra commas in row 15, or enable flexible column parsing"
  }
}
```

**Delimiter Detection Failed (DELIMITER_UNKNOWN)**:
```typescript
// Can't auto-detect delimiter
{
  error: {
    code: "DELIMITER_UNKNOWN",
    message: "Unable to auto-detect CSV delimiter",
    context: {
      input_sample: "First 200 chars...",
      tried_delimiters: [",", "\t", ";", "|"],
      line_lengths: [45, 44, 46, 45],  // Inconsistent
      suggestion_delimiter: null
    },
    suggestion: "Specify delimiter explicitly using delimiter parameter"
  }
}
```

**Empty CSV (EMPTY_CSV)**:
```typescript
// No data rows
{
  error: {
    code: "EMPTY_CSV",
    message: "CSV contains only headers or is empty",
    context: {
      has_header: true,
      headers: ["col1", "col2", "col3"],
      data_rows: 0,
      total_lines: 1
    },
    suggestion: "Ensure CSV contains data rows after header row"
  }
}
```

---

## Implementation

### Basic Parse

```typescript
function parse_csv_basic(csv_string, options = {}) {
  const {
    delimiter = ',',
    has_header = true,
    skip_empty_lines = true,
    trim_fields = true
  } = options;

  // Split into lines
  const lines = csv_string.split('\n').filter(line =>
    !skip_empty_lines || line.trim().length > 0
  );

  if (lines.length === 0) {
    return {
      success: false,
      error: {
        code: "EMPTY_CSV",
        message: "CSV is empty",
        context: { input_length: csv_string.length },
        suggestion: "Provide non-empty CSV string"
      }
    };
  }

  // Parse header
  let headers;
  let data_start = 0;

  if (has_header) {
    headers = parse_row(lines[0], delimiter, trim_fields);
    data_start = 1;
  } else {
    // Generate headers: col1, col2, col3...
    const first_row = parse_row(lines[0], delimiter, trim_fields);
    headers = first_row.map((_, i) => `col${i + 1}`);
  }

  // Parse data rows
  const data = [];
  for (let i = data_start; i < lines.length; i++) {
    const fields = parse_row(lines[i], delimiter, trim_fields);

    // Create object
    const row_obj = {};
    headers.forEach((header, j) => {
      row_obj[header] = fields[j] || null;
    });

    data.push(row_obj);
  }

  return {
    success: true,
    data,
    metadata: {
      rows: data.length,
      columns: headers.length,
      delimiter,
      headers: has_header ? headers : undefined,
      skipped_rows: 0
    }
  };
}
```

### With Auto-Detect Delimiter

```typescript
function auto_detect_delimiter(csv_string) {
  const delimiters = [',', '\t', ';', '|'];
  const sample_lines = csv_string.split('\n').slice(0, 5);

  let best_delimiter = null;
  let best_consistency = 0;

  for (const delimiter of delimiters) {
    const counts = sample_lines.map(line =>
      (line.match(new RegExp(delimiter, 'g')) || []).length
    );

    // Check consistency
    const avg = counts.reduce((a, b) => a + b, 0) / counts.length;
    const variance = counts.reduce((sum, count) => sum + Math.pow(count - avg, 2), 0) / counts.length;

    // Lower variance = more consistent = better delimiter
    const consistency = avg > 0 ? avg / (1 + variance) : 0;

    if (consistency > best_consistency) {
      best_consistency = consistency;
      best_delimiter = delimiter;
    }
  }

  return best_delimiter;
}
```

### With Quoted Field Handling

```typescript
function parse_row(line, delimiter, trim = true) {
  const fields = [];
  let current_field = '';
  let in_quotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const next_char = line[i + 1];

    if (char === '"') {
      if (in_quotes && next_char === '"') {
        // Escaped quote: "" -> "
        current_field += '"';
        i++;  // Skip next quote
      } else {
        // Toggle quote state
        in_quotes = !in_quotes;
      }
    } else if (char === delimiter && !in_quotes) {
      // Field boundary
      fields.push(trim ? current_field.trim() : current_field);
      current_field = '';
    } else {
      current_field += char;
    }
  }

  // Add last field
  fields.push(trim ? current_field.trim() : current_field);

  return fields;
}
```

### With Row-Level Error Handling

```typescript
function parse_csv_with_errors(csv_string, options = {}) {
  const lines = csv_string.split('\n');
  const errors = [];
  const data = [];

  // Auto-detect delimiter if not specified
  const delimiter = options.delimiter || auto_detect_delimiter(csv_string);

  // Parse header
  const headers = parse_row(lines[0], delimiter);
  const expected_columns = headers.length;

  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    try {
      const fields = parse_row(lines[i], delimiter);

      // Check column count
      if (fields.length !== expected_columns) {
        errors.push({
          row: i + 1,
          code: "COLUMN_MISMATCH",
          expected: expected_columns,
          actual: fields.length,
          content: lines[i]
        });
        continue;  // Skip this row
      }

      // Create object
      const row_obj = {};
      headers.forEach((header, j) => {
        row_obj[header] = fields[j];
      });

      data.push(row_obj);

    } catch (error) {
      errors.push({
        row: i + 1,
        code: "ROW_PARSE_ERROR",
        message: error.message,
        content: lines[i]
      });
    }
  }

  // If too many errors, fail completely
  if (errors.length > data.length * 0.5) {
    return {
      success: false,
      error: {
        code: "TOO_MANY_ERRORS",
        message: `${errors.length} rows failed to parse`,
        context: {
          total_rows: lines.length - 1,
          failed_rows: errors.length,
          success_rows: data.length,
          sample_errors: errors.slice(0, 5)
        },
        suggestion: "Check delimiter, verify CSV format, examine sample errors"
      }
    };
  }

  return {
    success: true,
    data,
    metadata: {
      rows: data.length,
      columns: expected_columns,
      delimiter,
      headers,
      skipped_rows: errors.length,
      errors: errors.length > 0 ? errors : undefined
    }
  };
}
```

---

## Usage Examples

### Example 1: Basic CSV Parse

**Input:**
```typescript
{
  csv_string: 'Name,Age,City\nJohn,30,NYC\nJane,25,LA',
  has_header: true
}
```

**Output (Success):**
```typescript
{
  success: true,
  data: [
    { Name: "John", Age: "30", City: "NYC" },
    { Name: "Jane", Age: "25", City: "LA" }
  ],
  metadata: {
    rows: 2,
    columns: 3,
    delimiter: ",",
    headers: ["Name", "Age", "City"],
    skipped_rows: 0
  }
}
```

### Example 2: Tab-Delimited

**Input:**
```typescript
{
  csv_string: 'ID\tProduct\tPrice\n1\tApple\t1.50\n2\tBanana\t0.75',
  delimiter: '\t'
}
```

**Output (Success):**
```typescript
{
  success: true,
  data: [
    { ID: "1", Product: "Apple", Price: "1.50" },
    { ID: "2", Product: "Banana", Price: "0.75" }
  ],
  metadata: {
    rows: 2,
    columns: 3,
    delimiter: "\t",
    headers: ["ID", "Product", "Price"],
    skipped_rows: 0
  }
}
```

### Example 3: Column Mismatch Error

**Input:**
```typescript
{
  csv_string: 'A,B,C\n1,2,3\n4,5\n6,7,8',  // Row 2 has only 2 columns
  has_header: true
}
```

**Output (Error):**
```typescript
{
  success: false,
  error: {
    code: "COLUMN_MISMATCH",
    message: "Row 3 has 2 columns, expected 3",
    context: {
      row_number: 3,
      expected_columns: 3,
      actual_columns: 2,
      row_content: "4,5",
      headers: ["A", "B", "C"]
    },
    suggestion: "Verify delimiter is correct, check for missing fields in row 3"
  }
}
```

### Example 4: Quoted Fields with Commas

**Input:**
```typescript
{
  csv_string: 'Name,Description\n"Smith, John","Developer, Senior"\n"Doe, Jane","Manager"'
}
```

**Output (Success):**
```typescript
{
  success: true,
  data: [
    { Name: "Smith, John", Description: "Developer, Senior" },
    { Name: "Doe, Jane", Description: "Manager" }
  ],
  metadata: {
    rows: 2,
    columns: 2,
    delimiter: ",",
    headers: ["Name", "Description"],
    skipped_rows: 0
  }
}
```

### Example 5: Empty CSV

**Input:**
```typescript
{
  csv_string: 'Header1,Header2,Header3\n\n\n',  // Only header, no data
  has_header: true
}
```

**Output (Error):**
```typescript
{
  success: false,
  error: {
    code: "EMPTY_CSV",
    message: "CSV contains only headers or is empty",
    context: {
      has_header: true,
      headers: ["Header1", "Header2", "Header3"],
      data_rows: 0,
      total_lines: 1
    },
    suggestion: "Ensure CSV contains data rows after header row"
  }
}
```

---

## Error Codes

| Code | Meaning | Retriable | Context Provided |
|------|---------|-----------|------------------|
| ROW_PARSE_ERROR | Error parsing specific row | Yes (1x) | Row number, content, issue type |
| COLUMN_MISMATCH | Row has wrong column count | No | Row, expected vs actual, content |
| DELIMITER_UNKNOWN | Can't detect delimiter | No | Tried delimiters, sample |
| EMPTY_CSV | No data rows | No | Headers, line count |
| TOO_MANY_ERRORS | >50% rows failed | No | Error count, samples |
| UNCLOSED_QUOTE | Quoted field not closed | No | Row number, content |

---

## Integration Notes

### Called By Skills (Tier 2)

Skills orchestrate this micro-skill:
```typescript
// In data-reader skill (Tier 2)
const result = await micro_skill("parse-csv", {
  csv_string: file_content,
  delimiter: ",",
  has_header: true
});

// Skill evaluates result (Tactical Discernment)
if (!result.success) {
  // Apply domain expertise for recovery
  if (result.error.code === "DELIMITER_UNKNOWN") {
    // Try common delimiters
    return try_delimiters(["\t", ";", "|"], file_content);
  }
  return handle_csv_error(result.error);
}

// Use parsed data
process_rows(result.data);
```

### Not Called Directly by Maestro

Maestro doesn't invoke micro-skills directly. Maestro → Skill → Micro-skill.

---

## Best Practices

### For Micro-Skill Implementation

**✓ DO**:
- Auto-detect delimiter when not specified
- Handle quoted fields with embedded delimiters
- Provide row-level error reporting
- Skip empty lines by default
- Trim whitespace from fields
- Return column headers if present

**✗ DON'T**:
- Don't attempt to fix malformed rows (that's for skills)
- Don't validate data types (use separate validation micro-skill)
- Don't convert types automatically (keep as strings)
- Don't assume encoding (handle as given)

---

## Performance

- **Model**: Haiku (fast, efficient)
- **Typical latency**: < 20ms for CSV < 100KB
- **Memory**: Loads entire CSV into memory
- **Scalability**: For CSV > 10MB consider streaming parser

---

## Success Criteria

- ✓ Parses valid CSV successfully
- ✓ Auto-detects delimiter accurately
- ✓ Handles quoted fields with embedded delimiters
- ✓ Provides row-level error reporting
- ✓ Returns column headers if present
- ✓ Fast execution (< 20ms for typical CSV)
- ✓ Clear success/failure indication

---

## Notes

**This is NOT a skill (Tier 2)**. This is a **micro-skill (Tier 3)** - a pure execution tool.

**Key Differences from Skills**:
- **No Tactical 4-D**: Doesn't plan, doesn't evaluate, doesn't orchestrate
- **Single Operation**: Parses CSV, that's it
- **Smart but Simple**: Detects delimiter, doesn't repair errors
- **Fast Model**: Uses Haiku not Sonnet
- **Called by Skills**: Not invoked directly by Maestro

**Role**: Musician in the orchestra - plays one note perfectly when conductor (skill) signals.

---

**Micro-Skill Status**: Tier 3 Execution Tool
**Architecture**: Pure execution with smart error handling
**Model**: Haiku (efficient)
**Domain**: Data Operations
