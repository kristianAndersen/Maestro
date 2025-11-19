---
name: write-file
description: Pure execution micro-skill that writes content to disk. Handles atomic writes to prevent corruption, automatic backup creation, directory creation if needed, and conflict resolution strategies.
type: micro-skill
tier: 3
version: 1.0.0
model: sonnet
allowed-tools: [Write]
---

# Write File - Micro-Skill (Tier 3 Musician)

**Type**: Tier 3 - Pure Execution
**Role**: Musician - Executes single operation with smart error handling
**No 4-D**: This is a pure execution tool, not an orchestrator

---

## Purpose

Writes content to a file on disk with safety guarantees (atomic writes, backups). This is a **single-purpose execution tool** with smart error handling.

**Key Principle**: **NO ORCHESTRATION** - This micro-skill does one thing: write content to a file. It doesn't plan, it doesn't evaluate strategy, it doesn't chain other operations. It executes and reports.

---

## Operation

### Input Parameters

```typescript
{
  file_path: string;        // Absolute path to file (required)
  content: string;          // Content to write (required)
  encoding?: string;        // Default: "utf-8"
  atomic?: boolean;         // Atomic write (tmp + rename). Default: true
  backup?: boolean;         // Create .bak before overwrite. Default: false
  create_dirs?: boolean;    // Create parent directories. Default: true
  mode?: number;            // File permissions (e.g., 0o644). Default: 0o644
}
```

### Output

```typescript
{
  success: boolean;
  bytes_written?: number;          // Bytes written (if successful)
  file_path: string;               // Final file path
  backup_path?: string;            // Backup file path (if backup created)
  encoding: string;                // Encoding used
  created_dirs?: string[];         // Directories created (if any)
  error?: {                        // If failed
    code: string;                  // Error code (EACCES, ENOSPC, etc.)
    message: string;               // Human-readable message
    context: object;               // Additional context for recovery
    suggestion: string;            // What might fix it
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
Result: Return success or error after 3 attempts
```

**Temporary Permission Denied (EACCES)**:
```typescript
// Might be temporary system state
Attempt 1: immediate
Attempt 2: wait 50ms
Result: Return success or error after 2 attempts
```

### Context-Aware Escalation (Level 2)

**Directory Doesn't Exist (ENOENT)**:
```typescript
// Provide context about missing directory
{
  error: {
    code: "ENOENT",
    message: "Directory does not exist",
    context: {
      file_path: "/data/logs/app.log",
      missing_directory: "/data/logs",
      parent_exists: fs.existsSync("/data"),
      create_dirs_option: false  // User didn't enable auto-create
    },
    suggestion: "Enable create_dirs option or create directory first: mkdir -p /data/logs"
  }
}
```

**Permission Denied (EACCES - persistent)**:
```typescript
// After retries failed
{
  error: {
    code: "EACCES",
    message: "Permission denied writing to file",
    context: {
      file_path: "/etc/config.txt",
      directory: "/etc",
      current_user: process.env.USER,
      directory_permissions: "rwxr-xr-x root root",
      required_permission: "write"
    },
    suggestion: "Run with appropriate permissions or write to different location"
  }
}
```

**Disk Full (ENOSPC)**:
```typescript
// No space left on device
{
  error: {
    code: "ENOSPC",
    message: "No space left on device",
    context: {
      file_path: "/var/data/output.txt",
      content_size: 5242880,  // 5MB trying to write
      disk_path: "/dev/sda1",
      available_space: 102400,  // Only 100KB available
      space_needed: 5140480  // 5MB - 100KB = additional space needed
    },
    suggestion: "Free up disk space, or write to different volume with available space"
  }
}
```

**File Already Exists (EEXIST)**:
```typescript
// File exists and atomic write prevents overwrite
{
  error: {
    code: "EEXIST",
    message: "File already exists",
    context: {
      file_path: "/data/output.txt",
      existing_size: 1024,
      existing_modified: "2025-11-13T10:30:00Z",
      new_content_size: 2048,
      backup_option: false  // User didn't enable backup
    },
    suggestion: "Enable backup option to preserve existing file, or delete manually first"
  }
}
```

---

## Implementation

### Basic Write

```typescript
// Using Claude Code's Write tool
const result = await Write({
  file_path: "/path/to/file.txt",
  content: "file content here"
});

// Return structured output
return {
  success: true,
  bytes_written: Buffer.byteLength(content, encoding),
  file_path: file_path,
  encoding: encoding || "utf-8"
};
```

### With Retry Logic

```typescript
async function write_with_retry(file_path, content, encoding, max_attempts = 3) {
  for (let attempt = 1; attempt <= max_attempts; attempt++) {
    try {
      await Write({ file_path, content });

      return {
        success: true,
        bytes_written: Buffer.byteLength(content, encoding),
        file_path,
        encoding: encoding || "utf-8",
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
      return format_error(error, { file_path, content, encoding, attempt });
    }
  }
}

function is_retriable(error) {
  const retriable_codes = ["EBUSY", "EAGAIN"];
  return retriable_codes.includes(error.code);
}
```

### With Atomic Write

```typescript
async function write_atomic(file_path, content, encoding) {
  // Write to temporary file first
  const tmp_path = `${file_path}.tmp.${Date.now()}`;

  try {
    // Write to temp
    await Write({ file_path: tmp_path, content });

    // Rename temp to final (atomic operation)
    await rename(tmp_path, file_path);

    return {
      success: true,
      bytes_written: Buffer.byteLength(content, encoding),
      file_path,
      encoding: encoding || "utf-8"
    };

  } catch (error) {
    // Clean up temp file if it exists
    try { await unlink(tmp_path); } catch {}

    return format_error(error, { file_path, content, atomic: true });
  }
}
```

### With Backup

```typescript
async function write_with_backup(file_path, content, encoding) {
  let backup_path;

  try {
    // Check if file exists
    if (fs.existsSync(file_path)) {
      // Create backup
      backup_path = `${file_path}.bak`;
      await copyFile(file_path, backup_path);
    }

    // Write new content
    await Write({ file_path, content });

    return {
      success: true,
      bytes_written: Buffer.byteLength(content, encoding),
      file_path,
      backup_path,
      encoding: encoding || "utf-8"
    };

  } catch (error) {
    return format_error(error, { file_path, backup_path });
  }
}
```

### With Directory Creation

```typescript
async function write_with_dir_creation(file_path, content, encoding) {
  const directory = path.dirname(file_path);
  const created_dirs = [];

  try {
    // Create parent directories if needed
    if (!fs.existsSync(directory)) {
      await fs.promises.mkdir(directory, { recursive: true });
      created_dirs.push(directory);
    }

    // Write file
    await Write({ file_path, content });

    return {
      success: true,
      bytes_written: Buffer.byteLength(content, encoding),
      file_path,
      created_dirs: created_dirs.length > 0 ? created_dirs : undefined,
      encoding: encoding || "utf-8"
    };

  } catch (error) {
    return format_error(error, { file_path, directory, created_dirs });
  }
}
```

---

## Usage Examples

### Example 1: Basic Write

**Input:**
```typescript
{
  file_path: "/data/output.txt",
  content: "Hello, World!",
  encoding: "utf-8"
}
```

**Output (Success):**
```typescript
{
  success: true,
  bytes_written: 13,
  file_path: "/data/output.txt",
  encoding: "utf-8"
}
```

### Example 2: Directory Doesn't Exist

**Input:**
```typescript
{
  file_path: "/data/logs/app.log",
  content: "log entry",
  create_dirs: false  // Auto-create disabled
}
```

**Output (Error with Context):**
```typescript
{
  success: false,
  error: {
    code: "ENOENT",
    message: "Directory does not exist: /data/logs",
    context: {
      file_path: "/data/logs/app.log",
      missing_directory: "/data/logs",
      parent_exists: true,  // /data exists
      create_dirs_option: false
    },
    suggestion: "Enable create_dirs: true or create directory first: mkdir -p /data/logs"
  }
}
```

### Example 3: With Backup

**Input:**
```typescript
{
  file_path: "/config/settings.json",
  content: "{ \"version\": 2 }",
  backup: true
}
```

**Output (Success with Backup):**
```typescript
{
  success: true,
  bytes_written: 17,
  file_path: "/config/settings.json",
  backup_path: "/config/settings.json.bak",
  encoding: "utf-8"
}
```

### Example 4: Disk Full

**Input:**
```typescript
{
  file_path: "/var/data/large.txt",
  content: "...very large content..."
}
```

**Output (Error - No Space):**
```typescript
{
  success: false,
  error: {
    code: "ENOSPC",
    message: "No space left on device",
    context: {
      file_path: "/var/data/large.txt",
      content_size: 5242880,  // 5MB
      available_space: 102400,  // 100KB
      space_needed: 5140480
    },
    suggestion: "Free up disk space or write to different volume"
  }
}
```

### Example 5: Locked File (Retried)

**Input:**
```typescript
{
  file_path: "/tmp/locked.txt",
  content: "new content"
}
```

**Output (Success after retry):**
```typescript
{
  success: true,
  bytes_written: 11,
  file_path: "/tmp/locked.txt",
  encoding: "utf-8",
  attempts: 2,  // Succeeded on attempt 2
  note: "File was locked, succeeded after retry"
}
```

---

## Error Codes

| Code | Meaning | Retriable | Context Provided |
|------|---------|-----------|------------------|
| ENOENT | Directory/parent not found | No | Missing dir, parent status, create_dirs option |
| EACCES | Permission denied | Yes (2x) | User, directory perms, required permission |
| EBUSY | File locked | Yes (3x) | Lock status, retry count |
| EAGAIN | Resource temporarily unavailable | Yes (3x) | System state |
| ENOSPC | Disk full | No | Content size, available space, space needed |
| EISDIR | Path is directory | No | Directory path |
| EROFS | Read-only file system | No | Mount point, file system info |
| EEXIST | File exists (atomic mode) | No | Existing file info, backup option |

---

## Integration Notes

### Called By Skills (Tier 2)

Skills orchestrate this micro-skill:
```typescript
// In file-writer skill (Tier 2)
const result = await micro_skill("write-file", {
  file_path: "/output/result.json",
  content: JSON.stringify(data, null, 2),
  backup: true,
  create_dirs: true
});

// Skill evaluates result (Tactical Discernment)
if (!result.success) {
  // Apply domain expertise for recovery
  if (result.error.code === "ENOSPC") {
    // Try writing to alternative location
    return try_alternative_location(data);
  }
  return handle_write_error(result.error);
}

// Use result
log(`Wrote ${result.bytes_written} bytes to ${result.file_path}`);
if (result.backup_path) {
  log(`Backup created: ${result.backup_path}`);
}
```

### Not Called Directly by Maestro

Maestro doesn't invoke micro-skills directly. Maestro → Skill → Micro-skill.

---

## Best Practices

### For Micro-Skill Implementation

**✓ DO**:
- Return structured output (success/error clearly marked)
- Use atomic writes by default (prevent corruption)
- Provide rich error context for upstream recovery
- Retry transient failures (locks, temporary permissions)
- Keep implementation simple and focused
- Create parent directories if requested
- Clean up temporary files on failure

**✗ DON'T**:
- Don't orchestrate other micro-skills (single purpose only)
- Don't make strategic decisions (that's for skills)
- Don't assume content format (write as given)
- Don't implement complex backup strategies (that's for skills)
- Don't fail silently on directory creation

---

## Performance

- **Model**: Haiku (fast, efficient)
- **Typical latency**: < 50ms for files < 1MB
- **Memory**: Loads entire content into memory
- **Scalability**: For files > 10MB consider streaming write micro-skill

---

## Success Criteria

- ✓ Writes file successfully when path accessible
- ✓ Retries transient errors automatically (3 attempts max)
- ✓ Creates parent directories if requested
- ✓ Creates backup before overwrite if requested
- ✓ Uses atomic write to prevent corruption
- ✓ Returns rich error context for non-retriable failures
- ✓ Cleans up temporary files on failure
- ✓ Fast execution (< 50ms for typical files)

---

## Notes

**This is NOT a skill (Tier 2)**. This is a **micro-skill (Tier 3)** - a pure execution tool.

**Key Differences from Skills**:
- **No Tactical 4-D**: Doesn't plan, doesn't evaluate, doesn't orchestrate
- **Single Operation**: Writes one file, that's it
- **Smart but Simple**: Handles obvious errors, escalates complex ones
- **Fast Model**: Uses Haiku not Sonnet
- **Called by Skills**: Not invoked directly by Maestro

**Role**: Musician in the orchestra - plays one note perfectly when conductor (skill) signals.

---

**Micro-Skill Status**: Tier 3 Execution Tool
**Architecture**: Pure execution with smart error handling
**Model**: Haiku (efficient)
**Domain**: File System Operations
