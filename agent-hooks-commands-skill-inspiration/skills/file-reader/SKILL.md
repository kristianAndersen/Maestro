---
name: file-reader
description: Orchestrates file reading operations with intelligent handling of encodings, large files, binary detection, and error recovery. Chains micro-skills to read single or multiple files with appropriate strategies based on file characteristics.
type: skill
tier: 2
version: 1.0.0
allowed-tools: Read, Glob
model: sonnet
---

# File Reader - Tactical Orchestrator

**Domain**: File System Operations
**Expertise**: Intelligent file reading strategies, encoding detection, large file handling
**Role**: Section Leader - Orchestrates file reading micro-skills using Tactical 4-D methodology

---

## Purpose

This skill orchestrates file reading operations by intelligently selecting and chaining micro-skills based on file characteristics (size, encoding, type). It applies domain expertise to handle edge cases like large files, binary files, encoding issues, and access permissions.

**What Maestro Delegates:**
- Read one or more files with specific requirements
- Handle files of unknown size or encoding
- Extract specific content patterns from files

**What This Skill Delivers:**
- File content as strings or structured data
- Metadata about files (size, encoding, type)
- Error reports with context for inaccessible files
- Performance-optimized reading strategy

---

## Integration with Maestro

### Receives Strategic Direction

When Maestro delegates to this skill, you receive:

**Product (What to accomplish):**
- Goal: Read file(s) and return content
- Expected Outcome: String content or structured data
- Acceptance Criteria: Valid content, correct encoding, error handling
- Constraints: Memory limits, timeout considerations

**Process (How to approach it):**
- Approach: Check file characteristics first, then choose appropriate reading strategy
- Considerations: File size, encoding, binary vs text, permissions
- Patterns: Stream large files, batch small files, detect encodings

**Performance (Quality expectations):**
- Standards: Fast for small files, memory-efficient for large files, accurate encoding
- Verification: Content is readable, no corruption, proper error messages
- Documentation: Report strategy used and any issues encountered

---

## Tactical 4-D Methodology

### 1. DELEGATION (Tactical) - Micro-Skill Selection

**Planning Process:**

1. **Analyze request** from Maestro
   - Single file or multiple?
   - Known paths or need to search?
   - Specific encoding required?
   - Content processing needed?

2. **Check file characteristics**
   - File size (for streaming decision)
   - File type (binary detection)
   - Permissions (access check)

3. **Select reading strategy**
   - Small text files (< 1MB): Direct read
   - Large text files (> 10MB): Streaming read
   - Multiple files: Parallel batch read
   - Unknown encoding: Detection then read
   - Binary files: Binary read or skip with warning

**Micro-Skills Used:**
- `file-stat`: Check file size, type, permissions
- `read-file`: Read entire file into memory
- `read-file-stream`: Stream large files in chunks
- `detect-encoding`: Determine file encoding
- `read-file-binary`: Read binary files

**Example Chain:**
```
Goal: Read configuration files from /config directory

Tactical Plan:
  1. glob (find files) → file_paths[]
  2. file-stat (check each) → size, type, permissions
  3. For each file:
     If size < 1MB && text file:
       → read-file → content
     If size > 10MB:
       → read-file-stream → content (chunked)
     If binary:
       → Skip with warning
  4. Aggregate results → { [path]: content }
```

### 2. DESCRIPTION (Tactical) - Micro-Skill Direction

**For File Stat:**
```typescript
{
  operation: "file-stat",
  parameters: {
    file_path: "/path/to/file.txt",
    check_permissions: true
  },
  purpose: "Determine file size to select appropriate reading strategy",
  expected_output: {
    type: "object",
    fields: ["size", "isFile", "isReadable", "mtime"],
    validation: "size must be number, isFile must be boolean"
  }
}
```

**For Read File (Small):**
```typescript
{
  operation: "read-file",
  parameters: {
    file_path: "/path/to/file.txt",
    encoding: "utf-8",
    max_size: "10MB"  // Safety limit
  },
  purpose: "Load entire file content for processing",
  expected_output: {
    type: "string",
    format: "UTF-8 text",
    validation: "non-empty string, valid encoding"
  },
  error_handling: {
    file_not_found: "Return error with path",
    permission_denied: "Return error with context",
    too_large: "Switch to streaming strategy"
  }
}
```

**For Read File Stream (Large):**
```typescript
{
  operation: "read-file-stream",
  parameters: {
    file_path: "/path/to/large-file.log",
    chunk_size: 1024 * 1024,  // 1MB chunks
    encoding: "utf-8",
    on_chunk: (chunk) => process_chunk(chunk)
  },
  purpose: "Memory-efficient reading of large file",
  expected_output: {
    type: "stream",
    processing: "incremental",
    validation: "each chunk valid encoding"
  }
}
```

### 3. DISCERNMENT (Tactical) - Output Evaluation

**Evaluation Checklist:**

**After File Stat:**
```
✓ Check:
  - size is valid number
  - isFile is true (not directory)
  - isReadable is true (have permissions)
  - path exists

⚠️ If issues:
  - Not a file → Skip with warning
  - Not readable → Try alternative path or escalate
  - Doesn't exist → Return error with context
```

**After Read File:**
```
✓ Check:
  - Content is non-null
  - Content is string (not buffer)
  - Encoding is valid (no replacement characters)
  - Length matches expected file size
  - No truncation occurred

⚠️ If issues:
  - Wrong encoding → Detect and retry
  - Truncated → Check max_size limit, use streaming
  - Binary data → Use binary read or skip
```

**After Read File Stream:**
```
✓ Check:
  - All chunks received
  - No stream errors
  - Content reassembled correctly
  - Total size matches file stat

⚠️ If issues:
  - Stream interrupted → Retry from last chunk
  - Memory pressure → Reduce chunk size
  - Encoding errors → Switch to binary mode
```

### 4. DILIGENCE (Tactical) - Error Recovery

**Error Recovery Levels:**

**Level 1: Retry with Adjustments**
```typescript
// File locked
if (error.code === "EBUSY") {
  await sleep(100);  // Wait briefly
  return await retry_read(path, attempts: 3);
}

// Permission temporarily denied
if (error.code === "EACCES") {
  await sleep(50);
  return await retry_read(path, attempts: 2);
}
```

**Level 2: Parameter Adjustment**
```typescript
// Wrong encoding
if (content.includes("\uFFFD")) {  // Replacement character
  console.log("Encoding issue detected, trying alternatives...");

  const encodings = ["utf-8", "latin1", "ascii", "utf-16le"];
  for (const enc of encodings) {
    try {
      const content = await read_file({ path, encoding: enc });
      if (!content.includes("\uFFFD")) {
        console.log(`✓ Successful with ${enc} encoding`);
        return { content, encoding: enc };
      }
    } catch (e) {
      continue;
    }
  }
}

// File too large for memory
if (error.message.includes("file too large")) {
  console.log("Switching to streaming strategy for large file...");
  return await read_file_stream({ path, chunk_size: 1024 * 1024 });
}
```

**Level 3: Alternative Approach**
```typescript
// Cannot read as text
if (error.type === "EncodingError") {
  console.log("Text reading failed, trying binary mode...");

  const binary = await read_file_binary({ path });
  return {
    content: binary,
    type: "binary",
    note: "File is binary, returned as buffer"
  };
}

// File moved/renamed
if (error.code === "ENOENT") {
  console.log("File not found at expected path, searching...");

  const dir = path.dirname(file_path);
  const name = path.basename(file_path);
  const found = await search_directory({ dir, filename: name });

  if (found.length > 0) {
    console.log(`✓ Found at alternative location: ${found[0]}`);
    return await read_file({ path: found[0] });
  }
}
```

**Level 4: Partial Success**
```typescript
// Some files in batch failed
if (reading_multiple_files && some_failed) {
  return {
    success: succeeded_files.map(f => ({ path: f.path, content: f.content })),
    failed: failed_files.map(f => ({ path: f.path, error: f.error, reason: f.reason })),
    note: `Read ${succeeded_files.length}/${total_files} files successfully`
  };
}
```

**Level 5: Escalate to Maestro**
```typescript
return {
  error: true,
  issue: "Cannot read file after all recovery attempts",
  file_path: path,
  attempted: [
    "Direct read with utf-8",
    "Encoding detection and retry",
    "Binary mode read",
    "Search for alternative location"
  ],
  file_info: {
    exists: fs.existsSync(path),
    permissions: file_permissions,
    size: file_size,
    type: file_type
  },
  recommendation: [
    "Check if file path is correct",
    "Verify file is readable by current user",
    "Confirm file is not corrupted",
    "Consider providing alternative file location"
  ]
};
```

---

## Execution Workflow

### Workflow: Read Single File

```
1. Receive Strategic Direction
   - File path: /data/config.json
   - Expected: JSON content
   - Constraints: Must be valid JSON

2. Plan Tactical Execution
   a. Check file exists and accessible
   b. Get file stats (size, type)
   c. Choose reading strategy
   d. Read with appropriate method
   e. Validate content
   f. Return to Maestro

3. Execute with Evaluation
   Step 1: file-stat("/data/config.json")
     → Output: { size: 2048, isFile: true, isReadable: true }
     → Evaluate: ✓ Small file, readable, text file
     → Decision: Use direct read

   Step 2: read-file({ path: "/data/config.json", encoding: "utf-8" })
     → Output: "{ \"key\": \"value\" }"
     → Evaluate: ✓ Valid string, looks like JSON
     → Decision: Proceed

   Step 3: Validate JSON (domain logic)
     → Parse JSON
     → Evaluate: ✓ Valid JSON structure
     → Decision: Success

4. Return to Maestro
   Result: { content: {...}, encoding: "utf-8", size: 2048 }
   Evidence: Successfully parsed as JSON
```

### Workflow: Read Multiple Files

```
1. Receive Strategic Direction
   - Files: /logs/*.log
   - Expected: Aggregate log content
   - Constraints: Memory efficient

2. Plan Tactical Execution
   a. Find all matching files (glob)
   b. Check stats for each file
   c. Categorize by size (small/large)
   d. Read small files in parallel
   e. Stream large files sequentially
   f. Aggregate results

3. Execute with Evaluation
   Step 1: glob("/logs/*.log")
     → Output: [file1.log, file2.log, file3.log, large.log]
     → Evaluate: ✓ 4 files found
     → Decision: Proceed

   Step 2: file-stat (for each file, parallel)
     → Outputs: [
         { file1: 100KB, readable },
         { file2: 50KB, readable },
         { file3: 200KB, readable },
         { large: 500MB, readable }
       ]
     → Evaluate: ✓ First 3 small, last one needs streaming
     → Decision: Split strategy

   Step 3: Parallel read small files
     → read-file(file1, file2, file3) in parallel
     → Outputs: [content1, content2, content3]
     → Evaluate: ✓ All succeeded
     → Decision: Proceed

   Step 4: Stream large file
     → read-file-stream(large.log)
     → Output: content4 (via chunks)
     → Evaluate: ✓ Complete
     → Decision: Success

4. Return to Maestro
   Result: {
     files_read: 4,
     total_size: "500.35 MB",
     contents: { file1: "...", file2: "...", file3: "...", large: "..." },
     strategy: "3 direct read + 1 streamed"
   }
```

---

## Domain Expertise Application

### File Size Strategy

**Small Files (< 1MB)**:
```typescript
// Direct read - fastest for small files
const content = await read_file({ path, encoding: "utf-8" });
// Keep in memory, process immediately
```

**Medium Files (1-10MB)**:
```typescript
// Direct read with monitoring
const content = await read_file({
  path,
  encoding: "utf-8",
  max_size: "10MB",
  on_progress: (percent) => console.log(`Reading: ${percent}%`)
});
```

**Large Files (> 10MB)**:
```typescript
// Streaming read - memory efficient
const chunks = [];
await read_file_stream({
  path,
  chunk_size: 1024 * 1024,  // 1MB chunks
  on_chunk: (chunk) => {
    process_chunk(chunk);  // Process incrementally
    chunks.push(chunk);
  }
});
const content = chunks.join("");
```

### Encoding Detection

**Strategy**:
1. Try UTF-8 first (most common)
2. Check for BOM (Byte Order Mark)
3. Look for encoding declaration in file
4. Try common alternatives (latin1, ascii)
5. Fall back to binary if all fail

```typescript
function detect_and_read(path) {
  // Try UTF-8 first
  try {
    const content = read_file({ path, encoding: "utf-8" });
    if (!has_replacement_chars(content)) {
      return { content, encoding: "utf-8" };
    }
  } catch (e) {}

  // Check BOM
  const bom = read_bytes(path, 3);
  if (bom === "\xEF\xBB\xBF") return read_with_encoding("utf-8");
  if (bom === "\xFF\xFE") return read_with_encoding("utf-16le");

  // Try alternatives
  for (const enc of ["latin1", "ascii", "utf-16le"]) {
    const content = read_file({ path, encoding: enc });
    if (looks_valid(content)) {
      return { content, encoding: enc };
    }
  }

  // Binary fallback
  return read_file_binary({ path });
}
```

### Binary File Detection

**Indicators of binary files**:
- Null bytes in first 8192 bytes
- Non-printable characters > 30%
- No valid text encoding
- Known binary extensions (.exe, .bin, .jpg, etc.)

```typescript
function is_binary(path) {
  const sample = read_bytes(path, 8192);

  // Check for null bytes
  if (sample.includes(0x00)) return true;

  // Count non-printable characters
  const non_printable = sample.filter(b => b < 32 && b !== 9 && b !== 10 && b !== 13);
  if (non_printable.length / sample.length > 0.3) return true;

  // Check extension
  const ext = path.extname(path).toLowerCase();
  const binary_exts = [".exe", ".bin", ".jpg", ".png", ".pdf", ".zip"];
  if (binary_exts.includes(ext)) return true;

  return false;
}
```

---

## Examples

### Example 1: Read Configuration File

**Maestro Delegates**:
```
Product: Read /config/settings.json and parse as JSON
Process: Validate JSON structure before returning
Performance: Fast read, clear error messages if invalid
```

**Skill Execution**:
```
1. file-stat("/config/settings.json")
   → size: 3KB, readable
   → Decision: Direct read

2. read-file({ path: "/config/settings.json", encoding: "utf-8" })
   → content: "{ ... }"
   → Evaluation: ✓ Valid string

3. Parse and validate JSON (domain logic)
   → JSON.parse(content)
   → Evaluation: ✓ Valid JSON

4. Return to Maestro:
   {
     content: { parsed JSON object },
     raw: "{ ... }",
     encoding: "utf-8",
     size: 3072
   }
```

### Example 2: Read Large Log File

**Maestro Delegates**:
```
Product: Extract error entries from 2GB log file
Process: Memory efficient, don't load entire file
Performance: Fast, process incrementally
```

**Skill Execution**:
```
1. file-stat("/logs/app.log")
   → size: 2GB
   → Decision: Streaming required

2. read-file-stream({
     path: "/logs/app.log",
     chunk_size: 1MB,
     on_chunk: (chunk) => {
       // Process each chunk for ERROR lines
       const errors = chunk.split("\n").filter(line => line.includes("ERROR"));
       accumulated_errors.push(...errors);
     }
   })
   → Processed 2000 chunks
   → Found 1234 error lines

3. Return to Maestro:
   {
     errors_found: 1234,
     sample_errors: [...first 10...],
     strategy: "streamed 2GB in 1MB chunks",
     memory_efficient: true
   }
```

### Example 3: Encoding Detection

**Maestro Delegates**:
```
Product: Read file with unknown encoding
Process: Detect correct encoding automatically
Performance: Accurate detection, no data loss
```

**Skill Execution**:
```
1. read-file({ path: "/data/unknown.txt", encoding: "utf-8" })
   → content contains � (replacement chars)
   → Evaluation: ✗ Wrong encoding

2. detect-encoding("/data/unknown.txt")
   → Check BOM: None
   → Try latin1: Still has issues
   → Try utf-16le: Looks valid
   → Decision: utf-16le

3. read-file({ path: "/data/unknown.txt", encoding: "utf-16le" })
   → content: Valid text, no replacement chars
   → Evaluation: ✓ Success

4. Return to Maestro:
   {
     content: "...",
     encoding: "utf-16le",
     detection_method: "tried 3 encodings, utf-16le successful"
   }
```

---

## Best Practices

### Do's ✓

- ✓ **Check file stats first**: Know what you're dealing with
- ✓ **Use appropriate strategy**: Direct for small, stream for large
- ✓ **Detect encoding**: Don't assume UTF-8
- ✓ **Handle binaries gracefully**: Detect and skip or read as binary
- ✓ **Retry transient errors**: File locks, network issues
- ✓ **Report strategy used**: Transparency in approach
- ✓ **Batch small files**: Read in parallel for efficiency

### Don'ts ✗

- ✗ **Don't load huge files entirely**: Use streaming
- ✗ **Don't assume encoding**: Detect or allow specification
- ✗ **Don't ignore binary files**: Handle them explicitly
- ✗ **Don't give up immediately**: Try alternatives
- ✗ **Don't lose error context**: Explain what went wrong
- ✗ **Don't skip validation**: Check content after reading

---

## Success Criteria

This skill succeeds when:

- ✓ File content accurately read
- ✓ Correct encoding detected/used
- ✓ Large files handled memory-efficiently
- ✓ Binary files detected and handled appropriately
- ✓ Errors have clear explanations and recovery attempts
- ✓ Performance appropriate for file size
- ✓ Evidence provided (strategy used, stats, validation)

---

## Notes

**Tactical 4-D Summary**:
- **Delegation**: Select read strategy based on file characteristics
- **Description**: Provide clear parameters to file micro-skills
- **Discernment**: Validate content encoding and completeness
- **Diligence**: Retry locks, detect encodings, try alternatives

**Remember**: You orchestrate file reading intelligently, not just pass through to tools. Apply domain expertise about file systems, encodings, and memory management.

---

**Skill Status**: Tier 2 Orchestrator for Maestro Marketplace
**Architecture**: Tactical 4-D Implementation
**Line Count**: ~450 lines (following <500 rule)
**Domain**: File System Operations
