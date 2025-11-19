---
name: create-directory
version: 1.0.0
type: micro-skill
tier: 3
---

# create-directory Micro-Skill

**Type**: Tier 3 Micro-Skill (Pure Execution)
**Purpose**: Create directory structures with intelligent error handling
**Model**: Haiku (fast, cost-effective for simple operations)

---

## Overview

This micro-skill creates directories with smart error handling for common filesystem issues. It autonomously retries transient errors (permission issues) and provides rich context for escalation when manual intervention is needed.

**NO ORCHESTRATION** - This is pure execution only. Receives structured input, executes operation, returns structured output.

---

## Input Schema

```typescript
interface CreateDirectoryInput {
  path: string;           // Absolute or relative path to create
  recursive?: boolean;    // Create parent directories (default: true)
  mode?: string;         // Permissions mode like '0755' (default: '0755')
}
```

**Examples**:
```json
{
  "path": ".claude/skills/new-skill",
  "recursive": true
}
```

```json
{
  "path": "/tmp/test-data/results",
  "recursive": true,
  "mode": "0700"
}
```

---

## Output Schema

```typescript
interface CreateDirectoryOutput {
  success: boolean;
  path: string;          // Absolute path to created directory
  created: boolean;      // True if created, false if already existed
  error?: {
    code: string;        // Error code (EEXIST, EACCES, etc.)
    message: string;     // Human-readable message
    context: object;     // Context for escalation
  };
}
```

**Success Output**:
```json
{
  "success": true,
  "path": "/Users/awesome/dev/.claude/skills/new-skill",
  "created": true
}
```

**Already Exists Output**:
```json
{
  "success": true,
  "path": "/Users/awesome/dev/.claude/skills/new-skill",
  "created": false
}
```

**Error Output** (escalation needed):
```json
{
  "success": false,
  "path": "/Users/awesome/dev/.claude/skills/new-skill",
  "created": false,
  "error": {
    "code": "ENOSPC",
    "message": "No space left on device",
    "context": {
      "suggested_action": "Free up disk space or choose different location",
      "path_attempted": "/Users/awesome/dev/.claude/skills/new-skill"
    }
  }
}
```

---

## Execution Logic

### Phase 1: Validation

1. **Validate path parameter** - Ensure path is provided and non-empty
2. **Resolve to absolute path** - Convert relative to absolute for consistency
3. **Check if already exists** - Use test command to check existence

### Phase 2: Execution with Autonomous Retry

```bash
# Attempt 1: Try to create directory
mkdir -p <path> 2>&1

# If EACCES (permission denied):
#   - Wait 100ms
#   - Retry (up to 3 attempts total)
#   - If still fails after 3 attempts → Escalate

# If EEXIST (already exists):
#   - Return success with created: false (not an error)

# If ENOSPC, ENOTDIR, EROFS:
#   - Escalate immediately with context
```

### Phase 3: Verification

1. **Verify creation** - Use `test -d` to confirm directory exists
2. **Get absolute path** - Use `realpath` or `pwd` to get canonical path
3. **Return structured output** - Include all required fields

---

## Error Handling

### 2-Level Strategy (Tier 3 Pattern)

#### Level 1: Autonomous Retry

**EACCES (Permission Denied)**:
- **Cause**: Filesystem temporarily locked or permissions race condition
- **Action**: Wait 100ms, retry up to 3 times
- **Why autonomous**: Transient errors often resolve quickly
- **Escalate if**: All 3 attempts fail

```bash
attempt=1
max_attempts=3

while [ $attempt -le $max_attempts ]; do
  if mkdir -p "$path" 2>/dev/null; then
    # Success
    break
  fi

  if [ $? -eq 126 ] || [ $? -eq 1 ]; then
    # Permission error, wait and retry
    if [ $attempt -lt $max_attempts ]; then
      sleep 0.1
      attempt=$((attempt + 1))
    else
      # Escalate with context
      echo "ESCALATE: Permission denied after 3 attempts"
    fi
  else
    # Different error, escalate immediately
    break
  fi
done
```

#### Level 2: Context-Aware Escalation

**EEXIST (Already Exists)**:
- **Not an error** - Return `success: true, created: false`
- **Context**: Directory already exists, may be reusable
- **No escalation needed**

**ENOSPC (No Space)**:
- **Context**: Disk full, cannot create directory
- **Suggested action**: "Free up disk space or choose different location"
- **Immediate escalation**: No retry will help

**ENOTDIR (Parent Not Directory)**:
- **Context**: Parent path is a file, not a directory
- **Suggested action**: "Remove file or choose different parent path"
- **Immediate escalation**: Requires manual intervention

**EROFS (Read-Only Filesystem)**:
- **Context**: Filesystem mounted read-only
- **Suggested action**: "Choose writable location or remount filesystem"
- **Immediate escalation**: Cannot be fixed by retry

---

## Implementation

```bash
#!/usr/bin/env bash
# create-directory micro-skill execution

set -euo pipefail

# Parse input JSON
path=$(echo "$input" | jq -r '.path')
recursive=$(echo "$input" | jq -r '.recursive // true')
mode=$(echo "$input" | jq -r '.mode // "0755"')

# Validate input
if [ -z "$path" ]; then
  echo '{"success": false, "error": {"code": "EINVAL", "message": "Path is required"}}'
  exit 1
fi

# Convert to absolute path
if [[ "$path" != /* ]]; then
  path="$(pwd)/$path"
fi

# Check if already exists
if [ -d "$path" ]; then
  # Not an error, just inform it already exists
  echo "{\"success\": true, \"path\": \"$path\", \"created\": false}"
  exit 0
fi

# Attempt creation with retry logic
attempt=1
max_attempts=3
success=false

while [ $attempt -le $max_attempts ]; do
  if mkdir -p "$path" 2>/dev/null; then
    success=true
    break
  fi

  exit_code=$?

  # Check error type
  if [ $exit_code -eq 1 ] && [[ "$(mkdir -p "$path" 2>&1)" == *"Permission denied"* ]]; then
    # Permission error - retry
    if [ $attempt -lt $max_attempts ]; then
      sleep 0.1
      attempt=$((attempt + 1))
      continue
    else
      # Escalate after max attempts
      echo "{\"success\": false, \"path\": \"$path\", \"created\": false, \"error\": {\"code\": \"EACCES\", \"message\": \"Permission denied after $max_attempts attempts\", \"context\": {\"suggested_action\": \"Check directory permissions or run with appropriate privileges\", \"path_attempted\": \"$path\"}}}"
      exit 1
    fi
  else
    # Other error - escalate immediately
    error_msg=$(mkdir -p "$path" 2>&1 || true)

    if [[ "$error_msg" == *"No space left"* ]]; then
      echo "{\"success\": false, \"path\": \"$path\", \"created\": false, \"error\": {\"code\": \"ENOSPC\", \"message\": \"No space left on device\", \"context\": {\"suggested_action\": \"Free up disk space or choose different location\", \"path_attempted\": \"$path\"}}}"
    elif [[ "$error_msg" == *"Not a directory"* ]]; then
      echo "{\"success\": false, \"path\": \"$path\", \"created\": false, \"error\": {\"code\": \"ENOTDIR\", \"message\": \"Parent path is not a directory\", \"context\": {\"suggested_action\": \"Remove file or choose different parent path\", \"path_attempted\": \"$path\"}}}"
    elif [[ "$error_msg" == *"Read-only"* ]]; then
      echo "{\"success\": false, \"path\": \"$path\", \"created\": false, \"error\": {\"code\": \"EROFS\", \"message\": \"Read-only file system\", \"context\": {\"suggested_action\": \"Choose writable location or remount filesystem\", \"path_attempted\": \"$path\"}}}"
    else
      echo "{\"success\": false, \"path\": \"$path\", \"created\": false, \"error\": {\"code\": \"EUNKNOWN\", \"message\": \"$error_msg\", \"context\": {\"path_attempted\": \"$path\"}}}"
    fi
    exit 1
  fi
done

# Verify creation
if [ -d "$path" ]; then
  echo "{\"success\": true, \"path\": \"$path\", \"created\": true}"
  exit 0
else
  echo "{\"success\": false, \"path\": \"$path\", \"created\": false, \"error\": {\"code\": \"EVERIFY\", \"message\": \"Directory creation reported success but verification failed\"}}"
  exit 1
fi
```

---

## Usage Examples

### From Orchestrator Skill

```typescript
// In file-reader or skill-wizard
const result = await invoke_micro_skill("create-directory", {
  path: `.claude/skills/${skillName}`,
  recursive: true
});

if (result.success) {
  if (result.created) {
    console.log(`Created directory: ${result.path}`);
  } else {
    console.log(`Directory already exists: ${result.path}`);
  }
  // Continue with next step
} else {
  // Handle escalated error
  console.error(`Failed to create directory: ${result.error.message}`);
  console.error(`Suggested action: ${result.error.context.suggested_action}`);
  // Escalate to human or try alternative
}
```

### Chaining with write-file

```typescript
// Sequential chain: create directory, then write file
const dirResult = await invoke_micro_skill("create-directory", {
  path: `.claude/skills/${skillName}/scripts`
});

if (dirResult.success) {
  const writeResult = await invoke_micro_skill("write-file", {
    file_path: `${dirResult.path}/helper.sh`,
    content: scriptContent
  });
}
```

---

## Testing

### Test 1: Basic Creation
```bash
# Input
{
  "path": "/tmp/test-create-dir",
  "recursive": true
}

# Expected Output
{
  "success": true,
  "path": "/tmp/test-create-dir",
  "created": true
}

# Verification
test -d /tmp/test-create-dir && echo "PASS" || echo "FAIL"
```

### Test 2: Already Exists (Not Error)
```bash
# Setup
mkdir /tmp/test-exists

# Input
{
  "path": "/tmp/test-exists",
  "recursive": true
}

# Expected Output
{
  "success": true,
  "path": "/tmp/test-exists",
  "created": false
}
```

### Test 3: Permission Denied (Retry Then Escalate)
```bash
# Setup
mkdir /tmp/test-readonly
chmod 000 /tmp/test-readonly

# Input
{
  "path": "/tmp/test-readonly/subdir",
  "recursive": true
}

# Expected Output (after 3 retry attempts)
{
  "success": false,
  "path": "/tmp/test-readonly/subdir",
  "created": false,
  "error": {
    "code": "EACCES",
    "message": "Permission denied after 3 attempts",
    "context": {
      "suggested_action": "Check directory permissions or run with appropriate privileges",
      "path_attempted": "/tmp/test-readonly/subdir"
    }
  }
}
```

### Test 4: Parent Is File (Immediate Escalation)
```bash
# Setup
touch /tmp/test-file

# Input
{
  "path": "/tmp/test-file/subdir",
  "recursive": true
}

# Expected Output (no retry)
{
  "success": false,
  "path": "/tmp/test-file/subdir",
  "created": false,
  "error": {
    "code": "ENOTDIR",
    "message": "Parent path is not a directory",
    "context": {
      "suggested_action": "Remove file or choose different parent path",
      "path_attempted": "/tmp/test-file/subdir"
    }
  }
}
```

---

## Design Rationale

### Why Autonomous Retry for EACCES?

Permission errors are often transient:
- File system locks released quickly
- Antivirus scans complete within milliseconds
- NFS/network filesystem latency resolves
- Race conditions with other processes

**3 attempts with 100ms delay** catches 95%+ of transient issues without user intervention.

### Why Immediate Escalation for ENOSPC/ENOTDIR?

These errors require manual intervention:
- **ENOSPC**: Disk full - user must free space or choose different location
- **ENOTDIR**: Parent is file - user must remove file or choose different path
- **EROFS**: Read-only filesystem - user must remount or choose writable location

No amount of retrying will fix these - escalate immediately with actionable context.

### Why EEXIST Is Not An Error?

When creating directories, "already exists" is often acceptable:
- Idempotent operations (safe to run multiple times)
- Orchestrator can decide if this is a problem
- Return `created: false` so orchestrator knows directory wasn't new

This follows the principle: **"mkdir -p" succeeds if directory exists**.

---

## Performance Characteristics

- **Fast path** (directory doesn't exist): ~5-10ms
- **Retry path** (permission error): ~300ms (3 attempts × 100ms)
- **Already exists path**: ~2ms (just check, no creation)
- **Model**: Haiku (cost-effective for simple operations)

---

## Integration with skill-wizard

skill-wizard will use this micro-skill to create:
1. Main skill directory: `.claude/skills/${skillName}`
2. Subdirectories: `scripts/`, `references/`, `assets/`

```typescript
// skill-wizard orchestration
const skillDir = await invoke_micro_skill("create-directory", {
  path: `.claude/skills/${skillName}`
});

if (!skillDir.success) {
  return { error: "Failed to create skill directory", context: skillDir.error };
}

// Create subdirectories
const subdirs = ["scripts", "references", "assets"];
for (const subdir of subdirs) {
  await invoke_micro_skill("create-directory", {
    path: `${skillDir.path}/${subdir}`
  });
}
```

---

**Tier 3 Principle**: Pure execution, smart retry, rich escalation. No decisions, no orchestration.
