# Write Resilience Protocol

> **When to load this file:** Only when operating in Resilient Mode (delegator flagged `high-risk: true`) or when you've encountered a write error. Standard writes do NOT need this protocol — just write and verify.

---

# Write Skill: Resilience

Retry, verification, and fallback patterns for reliable file writing operations. Load this asset when write reliability is critical — expensive generated output, config files, or any write where silent failure means lost work.

## Error Classification

Before retrying, classify the error:

**Transient (retry):**
- Tool timeout or hang (no response)
- Internal error / acknowledgment failure
- Generic I/O error without specific code

**Permanent (don't retry):**
- `EACCES` / `Permission denied` — fix permissions first
- `ENOENT` / `No such file or directory` — parent directory missing
- `ENOSPC` / `No space left on device` — disk full
- `EISDIR` / `Is a directory` — path points to directory, not file

**Rule:** If the error message contains `permission`, `EACCES`, `ENOENT`, `ENOSPC`, or `not found` (for directories) → permanent. Everything else → transient, retry.

## Retry Protocol

- **Max attempts:** 3 total (1 initial + 2 retries)
- **Before each retry:** Read the target file first — the previous write may have landed despite the error (ghost write)
- **Between retries:** No delay needed for file operations (not a rate-limit issue)
- **After max retries exhausted:** Bash heredoc fallback (see below)

```
Attempt 1: Write tool
  → Success? → Verify (Phase 3)
  → Error? → Read file → Content matches? → Ghost write success
                        → Content wrong/missing? → Attempt 2

Attempt 2: Write tool (retry)
  → Success? → Verify (Phase 3)
  → Error? → Read file → Same check
                        → Attempt 3

Attempt 3: Bash heredoc fallback
  → Success? → Verify (Phase 3)
  → Error? → Report permanent failure
```

## Read-After-Write Verification

**Mandatory after every successful write. No exceptions.**

1. Read the file back using the Read tool
2. Verify: file exists (Read didn't error)
3. Verify: line count matches expected (within ±2 lines for trailing newline variance)
4. Verify: first 3 lines match expected content
5. Verify: last 3 lines match expected content

If verification fails after a reportedly successful write → treat as corruption, retry.

## Ghost Write Detection

The specific failure mode this addresses: Write tool succeeds in writing content but fails to return acknowledgment (hangs, errors, or times out).

**Detection pattern:**
1. Write tool returns an error or no response
2. Immediately Read the target file
3. Compare what you read against what you tried to write:
   - **Content matches expected** → Ghost write success. Log it, proceed to verification as normal.
   - **Content is partial** (fewer lines than expected) → True failure, partial write. Retry with full content.
   - **Content is wrong or file doesn't exist** → True failure. Retry.

**In the resilience log, record ghost writes explicitly:**
```
Resilience Log:
- Attempt 1: Write tool error (internal error)
- Ghost write check: File exists, content matches (215/215 lines)
- Result: Ghost write success — proceeded to verification
```

## Bash Heredoc Fallback

Last resort after Write tool exhausts retries.

```bash
cat <<'M_EOF_RESILIENT' > /path/to/file
[file content here]
M_EOF_RESILIENT
```

**Important:**
- Use single-quoted delimiter (`'M_EOF_RESILIENT'`) to prevent variable expansion
- The delimiter `M_EOF_RESILIENT` must not appear as a standalone line in the file content
- Must still run Read-After-Write Verification after Bash write
- This is a fallback, not a primary method — always try Write tool first

**Limitations:**
- Shell special characters in content may need escaping
- Large files may hit shell buffer limits
- Adds Bash dependency to what should be a tool-native operation

## Anti-Patterns

- **Retrying permanent errors** — `Permission denied` won't succeed on retry. Fix the root cause.
- **Skipping verification** — "It looked like it worked" is not verification. Read it back.
- **Using Bash as primary method** — Write tool is the correct tool. Bash is emergency fallback only.
- **Retrying more than twice** — 3 attempts is the limit. Beyond that, the problem is structural.
- **Ignoring ghost writes** — If the file exists with correct content after an error, that's a success. Don't overwrite it with a retry.
