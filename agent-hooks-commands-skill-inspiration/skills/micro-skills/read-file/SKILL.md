---
name: read-file
description: Pure execution micro-skill that reads file content from disk. Handles file locks with automatic retry, supports multiple encodings, provides streaming for large files. Smart error handling with context-aware escalation.
type: micro-skill
tier: 3
version: 1.0.0
allowed-tools: Read
model: sonnet
---

# Read File - Micro-Skill (Musician)

**Type**: Tier 3 - Pure Execution
**Role**: Musician - Executes single operation with smart error handling
**No 4-D**: This is a pure execution tool, not an orchestrator

---

## Purpose

Reads file content from disk and returns it as a string. This is a **single-purpose execution tool** with smart error handling.

**Key Principle**: **NO ORCHESTRATION** - This micro-skill does one thing: read a file. It doesn't plan, it doesn't evaluate strategy, it doesn't chain other operations. It executes and reports.

---

## Operation

### Input Parameters

```typescript
{
  file_path: string;        // Absolute path to file (required)
  encoding?: string;        // Default: "utf-8"
  max_size?: number;        // Max bytes to read (safety limit)
  offset?: number;          // Start reading from byte position
  length?: number;          // Number of bytes to read
}
```

### Output

```typescript
{
  success: boolean;
  content?: string;         // File content (if successful)
  size: number;             // Bytes read
  encoding: string;         // Encoding used
  error?: {                 // If failed
    code: string;           // Error code (ENOENT, EACCES, etc.)
    message: string;        // Human-readable message
    context: object;        // Additional context for recovery
    suggestion: string;     // What might fix it
  }
}
```

---

## Smart Error Handling

### Autonomous Retry (Level 1)

**File Locked (EBUSY)**:
```typescript
// Retry automatically with exponential backoff
Attempt 1: immediate
Attempt 2: wait 100ms
Attempt 3: wait 200ms
Result: Return content or error after 3 attempts
```

**Temporary Permission Denied (EACCES)**:
```typescript
// Might be temporary system state
Attempt 1: immediate
Attempt 2: wait 50ms
Result: Return content or error after 2 attempts
```

### Context-Aware Escalation (Level 2)

**File Not Found (ENOENT)**:
```typescript
// Cannot retry, but provide helpful context
{
  error: {
    code: "ENOENT",
    message: "File not found at specified path",
    context: {
      requested_path: "/data/file.txt",
      directory_exists: fs.existsSync("/data"),
      similar_files: [...files in directory with similar names...],
      cwd: process.cwd()
    },
    suggestion: "Check path is absolute, verify file exists, check spelling"
  }
}
```

**Permission Denied (EACCES - persistent)**:
```typescript
// After retries failed
{
  error: {
    code: "EACCES",
    message: "Permission denied reading file",
    context: {
      path: "/etc/shadow",
      current_user: process.env.USER,
      file_permissions: "rw-r----- root shadow",
      required_permission: "read"
    },
    suggestion: "Run with appropriate permissions or request different file"
  }
}
```

**File Too Large**:
```typescript
// Exceeds max_size limit
{
  error: {
    code: "FILE_TOO_LARGE",
    message: "File exceeds maximum size limit",
    context: {
      file_size: 524288000,  // 500MB
      max_size: 10485760,    // 10MB
      file_path: "/logs/huge.log"
    },
    suggestion: "Use streaming read-file-stream micro-skill for large files"
  }
}
```

**Invalid Encoding**:
```typescript
// Encoding not supported
{
  error: {
    code: "INVALID_ENCODING",
    message: "Specified encoding is not supported",
    context: {
      requested_encoding: "utf-32",
      supported_encodings: ["utf-8", "utf-16le", "latin1", "ascii"],
      file_path: "/data/file.txt"
    },
    suggestion: "Use one of the supported encodings or detect encoding first"
  }
}
```

---

## Implementation

### Basic Read

```typescript
// Using Claude Code's Read tool
const result = await Read({
  file_path: "/path/to/file.txt",
  encoding: "utf-8"
});

// Return structured output
return {
  success: true,
  content: result,
  size: result.length,
  encoding: "utf-8"
};
```

### With Retry Logic

```typescript
async function read_with_retry(path, encoding, max_attempts = 3) {
  for (let attempt = 1; attempt <= max_attempts; attempt++) {
    try {
      const content = await Read({ file_path: path, encoding });
      return {
        success: true,
        content,
        size: content.length,
        encoding,
        attempts: attempt
      };
    } catch (error) {
      // Check if retriable
      if (is_retriable(error) && attempt < max_attempts) {
        const delay = Math.pow(2, attempt - 1) * 100;  // Exponential backoff
        await sleep(delay);
        continue;  // Try again
      }

      // Not retriable or max attempts reached
      return format_error(error, { path, encoding, attempt });
    }
  }
}

function is_retriable(error) {
  const retriable_codes = ["EBUSY", "EAGAIN"];
  return retriable_codes.includes(error.code);
}
```

### With Size Check

```typescript
async function read_with_size_limit(path, encoding, max_size) {
  // Check file size first
  const stats = await stat(path);

  if (stats.size > max_size) {
    return {
      success: false,
      error: {
        code: "FILE_TOO_LARGE",
        message: `File size (${stats.size} bytes) exceeds limit (${max_size} bytes)`,
        context: { file_size: stats.size, max_size, path },
        suggestion: "Use read-file-stream for large files"
      }
    };
  }

  // Size OK, proceed with read
  return read_with_retry(path, encoding);
}
```

---

## Usage Examples

### Example 1: Basic Read

**Input:**
```typescript
{
  file_path: "/config/settings.json",
  encoding: "utf-8"
}
```

**Output (Success):**
```typescript
{
  success: true,
  content: "{ \"theme\": \"dark\", \"font\": 14 }",
  size: 35,
  encoding: "utf-8"
}
```

### Example 2: File Not Found

**Input:**
```typescript
{
  file_path: "/data/missing.txt",
  encoding: "utf-8"
}
```

**Output (Error with Context):**
```typescript
{
  success: false,
  error: {
    code: "ENOENT",
    message: "File not found at /data/missing.txt",
    context: {
      requested_path: "/data/missing.txt",
      directory_exists: true,
      similar_files: ["missing-backup.txt", "missing-old.txt"],
      cwd: "/Users/user/project"
    },
    suggestion: "Check file name spelling, verify file exists, use absolute path"
  }
}
```

### Example 3: Locked File (Retried)

**Input:**
```typescript
{
  file_path: "/tmp/locked.txt",
  encoding: "utf-8"
}
```

**Output (Success after retry):**
```typescript
{
  success: true,
  content: "file content here",
  size: 17,
  encoding: "utf-8",
  attempts: 2,  // Succeeded on attempt 2
  note: "File was locked, succeeded after retry"
}
```

### Example 4: Permission Denied

**Input:**
```typescript
{
  file_path: "/etc/shadow",
  encoding: "utf-8"
}
```

**Output (Error with Context):**
```typescript
{
  success: false,
  error: {
    code: "EACCES",
    message: "Permission denied reading /etc/shadow",
    context: {
      path: "/etc/shadow",
      current_user: "user",
      file_owner: "root",
      permissions: "rw-r-----",
      required_permission: "read"
    },
    suggestion: "File requires elevated permissions or different user access"
  }
}
```

---

## Error Codes

| Code | Meaning | Retriable | Context Provided |
|------|---------|-----------|------------------|
| ENOENT | File not found | No | Path, similar files, directory status |
| EACCES | Permission denied | Yes (2x) | Permissions, owner, current user |
| EBUSY | File locked | Yes (3x) | Lock status, retry count |
| EAGAIN | Resource temporarily unavailable | Yes (3x) | System state |
| EISDIR | Path is directory | No | Directory contents suggestion |
| EMFILE | Too many open files | Yes (2x) | System limits |
| ENAMETOOLONG | Path too long | No | Path length, system limit |
| FILE_TOO_LARGE | Exceeds max_size | No | File size, limit, alternative |
| INVALID_ENCODING | Unsupported encoding | No | Supported encodings list |

---

## Integration Notes

### Called By Skills (Tier 2)

Skills orchestrate this micro-skill:
```typescript
// In file-reader skill (Tier 2)
const result = await micro_skill("read-file", {
  file_path: "/data/file.txt",
  encoding: "utf-8",
  max_size: 10 * 1024 * 1024  // 10MB
});

// Skill evaluates result (Tactical Discernment)
if (!result.success) {
  // Apply domain expertise for recovery
  return handle_read_error(result.error);
}

// Use content
process_content(result.content);
```

### Not Called Directly by Maestro

Maestro doesn't invoke micro-skills directly. Maestro → Skill → Micro-skill.

---

## Best Practices

### For Micro-Skill Implementation

**✓ DO**:
- Return structured output (success/error clearly marked)
- Provide rich error context for upstream recovery
- Retry obvious transient failures autonomously
- Keep implementation simple and focused
- Use fast model (haiku) for efficiency

**✗ DON'T**:
- Don't orchestrate other micro-skills (single purpose only)
- Don't make strategic decisions (that's for skills)
- Don't evaluate goals (execute the operation, return result)
- Don't implement complex recovery logic (escalate with context)

---

## Performance

- **Model**: Haiku (fast, efficient)
- **Typical latency**: < 100ms for small files
- **Memory**: Loads entire file into memory
- **Scalability**: Use read-file-stream for files > 10MB

---

## Success Criteria

- ✓ Reads file successfully when accessible
- ✓ Retries transient errors automatically (3 attempts max)
- ✓ Returns rich error context for non-retriable failures
- ✓ Provides suggestions for error recovery
- ✓ Fast execution (< 100ms for typical files)
- ✓ Clear success/failure indication

---

## Notes

**This is NOT a skill (Tier 2)**. This is a **micro-skill (Tier 3)** - a pure execution tool.

**Key Differences from Skills**:
- **No Tactical 4-D**: Doesn't plan, doesn't evaluate, doesn't orchestrate
- **Single Operation**: Reads one file, that's it
- **Smart but Simple**: Handles obvious errors, escalates complex ones
- **Fast Model**: Uses Haiku not Sonnet
- **Called by Skills**: Not invoked directly by Maestro

**Role**: Musician in the orchestra - plays one note perfectly when conductor (skill) signals.

---

**Micro-Skill Status**: Tier 3 Execution Tool
**Architecture**: Pure execution with smart error handling
**Model**: Haiku (efficient)
**Domain**: File System Operations
