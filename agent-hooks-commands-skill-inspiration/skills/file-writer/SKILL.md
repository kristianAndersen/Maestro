---
name: file-writer
description: Auto-activated orchestrator for writing files with safety guarantees, backup strategies, and error recovery. Delegates to write-file micro-skill with domain expertise in file operations.
type: skill
tier: 2
version: 1.0.0
model: sonnet
allowed-tools: []
delegates-to: [write-file, create-directory]
---

# File Writer Skill (Tier 2 Orchestrator)

**Type**: Tier 2 - Orchestrator with Domain Expertise
**Role**: File operations specialist that orchestrates safe file writing
**Methodology**: Tactical 4-D
**AI Fluency Mode**: Augmentation (collaborative thinking partner)

---

## Purpose

Orchestrates file writing operations with safety guarantees, strategic backup decisions, and intelligent error recovery. Brings domain expertise in file system operations to ensure reliable, safe file writes.

**Key Principle**: This skill provides strategic file writing - choosing backup strategies, handling complex error scenarios, and making decisions about file operations. It delegates the actual write operation to the `write-file` micro-skill.

---

## Integration with Maestro

### Receives from Maestro (Strategic Direction)

**Product**: What to write
```typescript
{
  goal: "Write configuration file with validation",
  files: [{
    path: "/config/app.json",
    content: "{ ... }",
    safety: "high"
  }],
  constraints: ["Preserve existing if write fails", "Validate JSON before writing"]
}
```

**Process**: How to approach it
```typescript
{
  methodology: "Validate → Backup → Write → Verify",
  safety_level: "high",  // high = backup always, medium = backup if exists, low = no backup
  recovery_strategy: "rollback"  // rollback | keep-partial | fail-fast
}
```

**Performance**: What defines success
```typescript
{
  deliverable: "File written with safety guarantees",
  criteria: ["Content validated", "Backup created if needed", "Write verified"],
  reporting: "Brief confirmation with backup location if created"
}
```

### Returns to Maestro

```typescript
{
  success: true,
  files_written: [{
    path: "/config/app.json",
    bytes: 2048,
    backup: "/config/app.json.bak"
  }],
  operations: {
    validated: true,
    backed_up: true,
    verified: true
  },
  summary: "Configuration written successfully, backup created"
}
```

---

## Tactical 4-D Implementation

### 1. DELEGATION (Tactical) - Operation Planning

Based on request, plan the operation sequence:

**Standard Write Chain**:
```typescript
1. Validate content (if applicable)
   - JSON files → parse and validate schema
   - YAML files → parse and validate syntax
   - Code files → basic syntax check (if requested)

2. Determine backup strategy
   - High safety → always backup
   - Medium safety → backup if file exists
   - Low safety → no backup

3. Delegate to write-file micro-skill
   - Pass: file_path, content, encoding
   - Options: backup, create_dirs, atomic

4. Verify write (if requested)
   - Read back written file
   - Compare content (checksum or size)
```

**Complex Multi-File Write Chain**:
```typescript
1. Validate all files first
2. Determine write order (dependencies)
3. Create transaction log for rollback
4. Write files sequentially
5. Verify all writes
6. Clean up transaction log on success
```

**Micro-Skills Used:**
- `write-file` → Actual file write operation
- `create-directory` → Ensure parent directories exist (if write-file doesn't handle)
- `validate-json` → Validate JSON content before writing
- `read-file` → Read back for verification

**Domain Logic (Your Expertise)**:
- When to create backups (based on safety level and file existence)
- How to handle write failures (rollback, partial, fail-fast)
- Content validation strategies by file type
- Conflict resolution (overwrite, append, merge)

### 2. DESCRIPTION (Tactical) - Micro-Skill Direction

**When delegating to write-file:**
```typescript
{
  operation: "write-file",
  parameters: {
    file_path: "/config/app.json",
    content: validated_content,
    encoding: "utf-8",
    backup: should_backup(safety_level, file_exists),
    create_dirs: true,
    atomic: true
  },
  purpose: "Write validated configuration with safety guarantees",
  expected_output: {
    type: "WriteResult",
    success: true,
    validation: "bytes_written > 0, file_path matches input"
  }
}
```

**When delegating to validate-json:**
```typescript
{
  operation: "validate-json",
  parameters: {
    content: raw_content,
    schema: schema_if_provided
  },
  purpose: "Validate JSON syntax and schema before writing",
  expected_output: {
    type: "ValidationResult",
    valid: true,
    validation: "No syntax errors, schema compliance if schema provided"
  }
}
```

### 3. DISCERNMENT (Tactical) - Result Evaluation

**Evaluate write-file results:**

```typescript
// After write-file executes
const write_result = await micro_skill("write-file", params);

// Tactical Discernment
const evaluation = {
  operation_succeeded: write_result.success === true,
  expected_bytes: write_result.bytes_written === expected_size,
  backup_created: safety_requires_backup ? write_result.backup_path !== undefined : true,
  atomic_used: write_result.atomic === true
};

// Decision
if (Object.values(evaluation).every(v => v === true)) {
  // Operation meets requirements
  return {
    success: true,
    file_path: write_result.file_path,
    backup: write_result.backup_path,
    summary: format_success_message(write_result)
  };
} else {
  // Operation incomplete or failed
  return handle_write_failure(write_result, evaluation);
}
```

**Error recovery decision tree:**
```typescript
if (write_result.error) {
  switch (write_result.error.code) {
    case "ENOSPC":
      // Disk full - try alternative location or fail
      return try_alternative_location_or_fail(params);

    case "EACCES":
      // Permission denied - suggest sudo or different location
      return escalate_permission_error(write_result.error);

    case "ENOENT":
      // Directory missing - create it or fail based on safety
      if (params.create_dirs) {
        await micro_skill("create-directory", { path: dir });
        return retry_write(params);
      }
      return fail_with_context(write_result.error);

    default:
      // Unknown error - escalate to Maestro
      return escalate_to_maestro(write_result.error);
  }
}
```

### 4. DILIGENCE (Tactical) - Safety & Verification

**Pre-write validation:**
```typescript
// Validate content if applicable
if (is_json_file(file_path)) {
  const validation = await micro_skill("validate-json", { content });
  if (!validation.valid) {
    return {
      success: false,
      error: "Invalid JSON syntax, refusing to write",
      details: validation.errors
    };
  }
}

// Check safety requirements
if (safety_level === "high" && fs.existsSync(file_path)) {
  // High safety: always backup existing files
  backup_required = true;
}
```

**Post-write verification:**
```typescript
// Verify write if requested
if (verify_write) {
  const verification = await micro_skill("read-file", { file_path });

  if (verification.success) {
    const matches = verify_content(verification.content, original_content);
    if (!matches) {
      // Content mismatch - rollback if backup exists
      return rollback_to_backup(backup_path);
    }
  } else {
    // Read failed - write might have failed
    return investigate_write_failure(file_path);
  }
}
```

**Transaction management (multi-file writes):**
```typescript
// Track operations for potential rollback
const transaction = {
  operations: [],
  backups: []
};

try {
  for (const file of files) {
    const result = await write_file_with_tracking(file, transaction);
    transaction.operations.push(result);
  }

  // All succeeded
  return {
    success: true,
    files_written: transaction.operations.length,
    summary: "All files written successfully"
  };

} catch (error) {
  // Rollback all operations
  await rollback_transaction(transaction);
  return {
    success: false,
    error: "Write failed, rolled back all changes",
    details: error
  };
}
```

---

## Strategic Capabilities

### 1. Backup Strategies

**High Safety (default for config files):**
- Always create backup before overwrite
- Use timestamped backups (.bak.{timestamp})
- Keep multiple backup generations

**Medium Safety (default for data files):**
- Backup if file exists
- Single .bak file (overwrites previous backup)

**Low Safety (temporary files, logs):**
- No backup
- Fast writes

### 2. Content Validation

**JSON files:**
- Parse and validate syntax
- Validate against schema if provided
- Pretty-print before writing (optional)

**YAML files:**
- Parse and validate syntax
- Preserve formatting (optional)

**Code files:**
- Basic syntax check (if requested)
- Preserve encoding and line endings

### 3. Error Recovery

**Automatic retry:**
- Transient errors (locks, temporary permissions)
- Delegated to write-file micro-skill

**Strategic recovery:**
- Disk full → Try alternative location
- Permission denied → Suggest solutions
- Directory missing → Create if safe

**Rollback:**
- Write verification fails → Restore from backup
- Multi-file transaction fails → Rollback all writes

### 4. Conflict Resolution

**File exists:**
- Overwrite (with backup)
- Append to existing
- Merge content (for specific file types)
- Fail with error (let user decide)

**Concurrent writes:**
- Use atomic writes (prevent corruption)
- File locking (if supported)
- Retry with backoff

---

## Usage Examples

### Example 1: Simple Config Write (Auto-Activated)

**User request:**
> "Write this JSON to /config/app.json with a backup"

**Maestro delegates to file-writer:**
```typescript
Product: {
  goal: "Write JSON configuration with backup",
  file: "/config/app.json",
  content: "{ \"version\": 2, \"enabled\": true }",
  safety: "high"
}

Process: {
  methodology: "Validate JSON → Backup existing → Write → Verify",
  safety_level: "high"
}

Performance: {
  deliverable: "Configuration written safely",
  criteria: ["Valid JSON", "Backup created", "Write verified"]
}
```

**file-writer orchestrates:**
```typescript
1. Validate JSON: ✓ Valid syntax
2. Check backup requirement: ✓ High safety = backup required
3. Delegate to write-file:
   {
     file_path: "/config/app.json",
     content: "{ \"version\": 2, \"enabled\": true }",
     backup: true,
     create_dirs: true,
     atomic: true
   }
4. Result: ✓ Written 34 bytes, backup: /config/app.json.bak
5. Return to Maestro: Success with backup confirmation
```

### Example 2: Multi-File Write with Transaction

**User request:**
> "Write these 3 config files atomically - if any fails, rollback all"

**file-writer orchestrates:**
```typescript
1. Start transaction
2. Validate all files first (fail fast if any invalid)
3. For each file:
   - Write with backup
   - Track operation
   - Verify write
4. All succeeded → Commit transaction
   OR any failed → Rollback all writes from backups
5. Return to Maestro: Transaction result
```

### Example 3: Error Recovery

**Scenario:** Disk full when writing large file

**file-writer recovery:**
```typescript
1. Delegate to write-file
2. Receive: { success: false, error: { code: "ENOSPC", ... } }
3. Domain expertise: Disk full, try /tmp as alternative
4. Delegate to write-file with alternative path
5. Success → Notify user file written to different location
   OR Fail → Escalate to Maestro with context
```

---

## Auto-Activation Rules

**Triggers in skill-rules.json:**
```json
{
  "keywords": [
    "write file",
    "save file",
    "create file",
    "write to file",
    "save to disk",
    "write config",
    "save config",
    "write JSON",
    "save JSON"
  ],
  "intentPatterns": [
    "(write|save|create).*(file|to disk|config|JSON|YAML)",
    "(put|store).*(in file|to file|on disk)"
  ]
}
```

**Auto-activation conditions:**
- User mentions writing/saving files
- Context includes file path and content
- Safety-critical operations (config, data files)

---

## Integration Notes

### Called by Maestro

Maestro delegates file writing operations to this skill when safety, validation, or strategic decisions are needed.

### Delegates to Micro-Skills

This skill orchestrates:
- `write-file` (Tier 3) - Actual write operation
- `validate-json` (Tier 3) - JSON validation
- `create-directory` (Tier 3) - Directory creation
- `read-file` (Tier 3) - Write verification

### Not a Micro-Skill

This is **NOT** a simple write operation. It's an orchestrator that:
- Makes strategic decisions (backup? validate? verify?)
- Handles complex error scenarios
- Manages transactions and rollbacks
- Provides domain expertise in file operations

---

## Best Practices

### Do's ✓

- ✓ **Validate content** before writing (JSON, YAML, etc.)
- ✓ **Create backups** for important files (configs, data)
- ✓ **Use atomic writes** to prevent corruption
- ✓ **Verify writes** for safety-critical operations
- ✓ **Provide context** in error messages
- ✓ **Handle errors strategically** (retry, recover, escalate)
- ✓ **Track transactions** for multi-file operations

### Don'ts ✗

- ✗ **Don't skip validation** for structured data (JSON, YAML)
- ✗ **Don't write without backup** for config files
- ✗ **Don't assume write succeeded** without verification
- ✗ **Don't fail silently** - provide actionable error context
- ✗ **Don't write partial data** on multi-file failures (rollback instead)

---

## Success Criteria

This skill succeeds when:

- ✓ Content validated before writing (if applicable)
- ✓ Backup created when safety requires it
- ✓ Files written successfully via write-file micro-skill
- ✓ Write verified if safety-critical
- ✓ Errors handled strategically (retry, recover, or escalate with context)
- ✓ Transactions managed (multi-file all-or-nothing)
- ✓ Clear confirmation returned to Maestro

---

## Notes

**This is a Tier 2 Skill (Orchestrator)**, not a Tier 3 micro-skill.

**Key Differences from write-file micro-skill:**
- **Strategic decisions**: When to backup, validate, verify
- **Error recovery**: Intelligent handling beyond simple retry
- **Transaction management**: Multi-file atomicity
- **Domain expertise**: File operation best practices
- **Uses Tactical 4-D**: Plans, evaluates, orchestrates

**AI Fluency Mode:** Augmentation - collaborates with Maestro through refinement loops and quality gates.

**Role:** Section Leader in the orchestra - interprets conductor's (Maestro's) direction and coordinates musicians (micro-skills) to achieve the goal.

---

**Skill Status**: Tier 2 Orchestrator with File Operations Expertise
**Architecture**: Tactical 4-D with micro-skill delegation
**Model**: Sonnet (strategic thinking required)
**Version**: 1.0.0
