# File System Tools Reference

Comprehensive guide for using Claude Code's file operation tools: Read, Write, Edit, Glob, and Grep.

## Read Tool

### Purpose
Read any file type including text files, images, PDFs, and Jupyter notebooks. Returns content with line numbers for easy reference.

### When to Use
- Reading source code files
- Viewing configuration files
- Analyzing images or PDFs (multimodal)
- Inspecting data files
- Reading documentation
- Reviewing Jupyter notebooks with outputs

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file_path` | string | Yes | Absolute path to the file |
| `offset` | number | No | Starting line number (for large files) |
| `limit` | number | No | Number of lines to read (for large files) |

### Best Practices

1. **Always use absolute paths**
   ```javascript
   ✅ /Users/awesome/dev/project/src/App.vue
   ❌ src/App.vue (relative path)
   ```

2. **Read whole file by default**
   - Don't specify offset/limit unless file is huge (>2000 lines)
   - Better to read entire file once than partial reads multiple times

3. **Parallel reading**
   - Read multiple files in single message when possible
   - Maximizes performance through parallel execution

4. **Check file existence**
   - Read tool will error if file doesn't exist
   - This is okay - errors are handled gracefully

### Examples

#### Example 1: Read Single File
```markdown
Task: Read the main App component

Tool call:
  Read tool
  file_path: /Users/awesome/dev/project/src/App.vue
```

#### Example 2: Read Multiple Files in Parallel
```markdown
Task: Read all store files

Tool calls (in single message):
  Read /Users/awesome/dev/project/src/stores/auth.js
  Read /Users/awesome/dev/project/src/stores/user.js
  Read /Users/awesome/dev/project/src/stores/settings.js
```

#### Example 3: Read Large File with Offset
```markdown
Task: Read lines 100-200 of large log file

Tool call:
  Read tool
  file_path: /var/log/app.log
  offset: 100
  limit: 100
```

#### Example 4: Read Image File
```markdown
Task: Analyze screenshot

Tool call:
  Read tool
  file_path: /Users/awesome/screenshots/error-state.png

Result: Image displayed for visual analysis
```

### Anti-Patterns

❌ **Using cat via Bash**
```bash
# Don't do this
Bash: cat /path/to/file.txt
```

✅ **Use Read tool instead**
```markdown
Read: /path/to/file.txt
```

❌ **Reading files one at a time in sequence**
```markdown
Message 1: Read file1.js
Wait for response...
Message 2: Read file2.js
Wait for response...
```

✅ **Read files in parallel**
```markdown
Single message:
  Read file1.js
  Read file2.js
  Read file3.js
```

---

## Write Tool

### Purpose
Create new files or completely replace existing files. Overwrites file if it exists.

### When to Use
- Creating new files
- Completely replacing file contents
- Generating code from scratch
- Creating configuration files

### When NOT to Use
- Modifying existing files (use Edit instead)
- Appending to files (use Edit instead)
- Making partial changes (use Edit instead)

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file_path` | string | Yes | Absolute path to the file |
| `content` | string | Yes | Complete file contents |

### Critical Rules

⚠️ **MUST Read existing file before using Write on it**
- Write tool will ERROR if you haven't read the file first
- This prevents accidental overwrites
- Exception: Creating new files (no Read required)

### Best Practices

1. **Use for new files**
   - Write is perfect for creating files from scratch
   - No need to Read first for new files

2. **Complete file contents**
   - Write requires complete file contents
   - Cannot do partial updates (use Edit for that)

3. **Absolute paths**
   - Always use absolute paths
   - Prevents writing to wrong location

4. **Verify before overwrite**
   - If file exists, Read it first
   - Review contents before replacing

### Examples

#### Example 1: Create New File
```markdown
Task: Create new composable

Tool call:
  Write tool
  file_path: /Users/awesome/dev/project/src/composables/useAuth.js
  content: [full file contents]
```

#### Example 2: Replace Existing File (Safely)
```markdown
Task: Completely rewrite component

Step 1: Read existing file
  Read /Users/awesome/dev/project/src/components/Button.vue

Step 2: Review contents

Step 3: Write new version
  Write tool
  file_path: /Users/awesome/dev/project/src/components/Button.vue
  content: [complete new contents]
```

### Anti-Patterns

❌ **Writing without Reading existing file**
```markdown
Write /path/to/existing-file.js
[content]

Error: Must Read file before using Write!
```

✅ **Read first, then Write**
```markdown
Step 1: Read /path/to/existing-file.js
Step 2: Write /path/to/existing-file.js with new content
```

❌ **Using Bash with echo/cat for file creation**
```bash
# Don't do this
Bash: echo "content" > file.txt
Bash: cat <<EOF > file.txt
```

✅ **Use Write tool**
```markdown
Write tool
file_path: /path/to/file.txt
content: [content]
```

---

## Edit Tool

### Purpose
Make exact string replacements in existing files. Performs find-and-replace operations.

### When to Use
- Updating specific strings in files
- Refactoring variable names
- Fixing bugs with targeted changes
- Updating configuration values
- Replacing imports/exports

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file_path` | string | Yes | Absolute path to file |
| `old_string` | string | Yes | Exact string to replace (must be unique) |
| `new_string` | string | Yes | Replacement string |
| `replace_all` | boolean | No | Replace all occurrences (default: false) |

### Critical Rules

⚠️ **MUST Read file before using Edit**
- Edit tool will ERROR if you haven't read the file
- This ensures you have correct old_string

⚠️ **old_string must be EXACT match**
- Include exact whitespace/indentation
- Must be unique in file (unless using replace_all)
- Edit FAILS if string not found or not unique

⚠️ **Preserve indentation from Read output**
- Read output shows: `line_number[tab]actual_content`
- Only use content AFTER the tab character
- Never include line number prefix in old_string

### Best Practices

1. **Get exact string from Read output**
   ```markdown
   Read output shows:
   42    const foo = 'bar'
         ^^^^^ This tab separates line number from content

   Use in Edit:
   old_string: "const foo = 'bar'"  (content only, exact match)
   ```

2. **Include surrounding context for uniqueness**
   ```markdown
   ❌ Too generic (might match multiple places):
   old_string: "foo"

   ✅ More context (unique match):
   old_string: "const foo = 'bar'"
   ```

3. **Use replace_all for renaming**
   ```markdown
   Task: Rename variable throughout file

   Edit tool:
   old_string: "oldVarName"
   new_string: "newVarName"
   replace_all: true
   ```

4. **Multiline replacements**
   ```markdown
   Edit tool supports multiline strings:
   old_string: "function foo() {\n  return bar\n}"
   new_string: "function foo() {\n  return baz\n}"
   ```

### Examples

#### Example 1: Update Configuration Value
```markdown
Task: Change API URL in config

Step 1: Read config file
  Read /Users/awesome/dev/project/config.js

  Output shows:
  5    const API_URL = 'http://localhost:3000'

Step 2: Edit with exact match
  Edit tool
  file_path: /Users/awesome/dev/project/config.js
  old_string: "const API_URL = 'http://localhost:3000'"
  new_string: "const API_URL = 'https://api.production.com'"
```

#### Example 2: Rename Variable Across File
```markdown
Task: Rename getData to fetchData

Step 1: Read file to verify variable exists

Step 2: Edit with replace_all
  Edit tool
  file_path: /Users/awesome/dev/project/src/api.js
  old_string: "getData"
  new_string: "fetchData"
  replace_all: true
```

#### Example 3: Update Import Statement
```markdown
Task: Change import path

Step 1: Read file
  Output shows:
  1    import { useAuth } from '@/composables/auth'

Step 2: Edit exact match
  Edit tool
  old_string: "import { useAuth } from '@/composables/auth'"
  new_string: "import { useAuth } from '@/lib/composables/auth'"
```

### Anti-Patterns

❌ **Using sed/awk via Bash**
```bash
# Don't do this
Bash: sed -i 's/old/new/' file.txt
```

✅ **Use Edit tool**
```markdown
Edit tool
old_string: "old"
new_string: "new"
```

❌ **Not reading file first**
```markdown
Edit without prior Read
Error: Must Read file before Edit!
```

✅ **Always Read first**
```markdown
Step 1: Read file
Step 2: Edit file
```

❌ **Including line numbers in old_string**
```markdown
Read output:
42    const foo = 'bar'

❌ Wrong:
old_string: "42    const foo = 'bar'"

✅ Correct:
old_string: "const foo = 'bar'"
```

❌ **old_string not unique**
```markdown
Edit fails if old_string appears multiple times
Solution: Add more context or use replace_all
```

---

## Glob Tool

### Purpose
Find files matching glob patterns. Fast file pattern matching for any codebase size.

### When to Use
- Finding files by name pattern
- Locating all files of certain type
- Discovering files in directory structure
- File inventory before Read operations

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `pattern` | string | Yes | Glob pattern (e.g., `*.js`, `**/*.vue`) |
| `path` | string | No | Directory to search (default: current working directory) |

### Glob Pattern Syntax

| Pattern | Matches | Example |
|---------|---------|---------|
| `*` | Any characters in single directory | `*.js` = all JS files in current dir |
| `**` | Any characters across directories | `**/*.js` = all JS files recursively |
| `?` | Single character | `file?.js` = file1.js, fileA.js |
| `[abc]` | Character set | `file[12].js` = file1.js, file2.js |
| `{a,b}` | Alternatives | `*.{js,ts}` = all .js and .ts files |

### Best Practices

1. **Use specific patterns**
   ```markdown
   ❌ Too broad:
   pattern: "*"

   ✅ Specific:
   pattern: "*.vue"
   pattern: "src/**/*.js"
   ```

2. **Combine with Read for full file access**
   ```markdown
   Step 1: Glob to find files
   Step 2: Read matched files (in parallel)
   ```

3. **Directory-specific searches**
   ```markdown
   Glob tool
   pattern: "*.js"
   path: /Users/awesome/dev/project/src/composables
   ```

### Examples

#### Example 1: Find All Vue Components
```markdown
Task: List all Vue components

Tool call:
  Glob tool
  pattern: "src/components/**/*.vue"

Result: List of component file paths
```

#### Example 2: Find Test Files
```markdown
Task: Find all test files

Tool call:
  Glob tool
  pattern: "**/*.test.js"

Result: All test files in project
```

#### Example 3: Find Config Files
```markdown
Task: Find configuration files

Tool call:
  Glob tool
  pattern: "*.config.{js,ts,json}"

Result: vite.config.js, jest.config.js, etc.
```

#### Example 4: Glob + Read Pattern
```markdown
Task: Read all composables

Step 1: Find files
  Glob tool
  pattern: "src/composables/**/*.js"

  Result: [
    /path/to/useAuth.js,
    /path/to/useApi.js,
    /path/to/useForm.js
  ]

Step 2: Read all files in parallel
  Read /path/to/useAuth.js
  Read /path/to/useApi.js
  Read /path/to/useForm.js
```

### Anti-Patterns

❌ **Using find via Bash**
```bash
# Don't do this
Bash: find . -name "*.js"
```

✅ **Use Glob tool**
```markdown
Glob tool
pattern: "**/*.js"
```

❌ **Using ls via Bash**
```bash
# Don't do this
Bash: ls src/components/*.vue
```

✅ **Use Glob tool**
```markdown
Glob tool
pattern: "src/components/*.vue"
```

---

## Grep Tool

### Purpose
Search file contents using regex patterns. Built on ripgrep for high performance.

### When to Use
- Finding text in files
- Searching for function/variable usage
- Locating API calls or imports
- Code archaeology (finding old patterns)
- Debugging (finding error messages)

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `pattern` | string | Yes | Regex pattern to search for |
| `output_mode` | string | No | `files_with_matches`, `content`, `count` (default: `files_with_matches`) |
| `path` | string | No | File or directory to search (default: current dir) |
| `type` | string | No | File type filter (js, py, rust, etc.) |
| `glob` | string | No | Glob pattern to filter files |
| `-i` | boolean | No | Case insensitive search |
| `-n` | boolean | No | Show line numbers (requires `output_mode: content`) |
| `-A` | number | No | Lines after match (requires `output_mode: content`) |
| `-B` | number | No | Lines before match (requires `output_mode: content`) |
| `-C` | number | No | Lines before and after match (requires `output_mode: content`) |
| `multiline` | boolean | No | Pattern can span lines (default: false) |
| `head_limit` | number | No | Limit output to first N entries |

### Output Modes

1. **files_with_matches** (default)
   - Shows only file paths containing matches
   - Fast overview of where pattern appears
   - Good for "where is this used?"

2. **content**
   - Shows actual matching lines
   - Supports context lines (-A, -B, -C)
   - Supports line numbers (-n)
   - Good for "show me the code"

3. **count**
   - Shows match count per file
   - Good for "how often is this used?"

### Best Practices

1. **Two-step search pattern**
   ```markdown
   Step 1: Find which files (files_with_matches)
     Grep tool
     pattern: "useAuthStore"
     output_mode: "files_with_matches"

   Step 2: See actual code (content with line numbers)
     Grep tool
     pattern: "useAuthStore"
     output_mode: "content"
     -n: true
     -C: 2
   ```

2. **Use type parameter for efficiency**
   ```markdown
   ✅ Efficient:
   pattern: "function"
   type: "js"

   ❌ Less efficient:
   pattern: "function"
   glob: "*.js"
   ```

3. **Use glob for multiple file types**
   ```markdown
   Grep tool
   pattern: "import.*Vue"
   glob: "*.{js,vue,ts}"
   ```

4. **Escape special regex characters**
   ```markdown
   Searching for: interface{}

   Pattern: "interface\\{\\}"
   (Braces must be escaped)
   ```

### Examples

#### Example 1: Find API Usage
```markdown
Task: Where do we call the auth API?

Tool call:
  Grep tool
  pattern: "/api/auth"
  output_mode: "files_with_matches"
  type: "js"

Result: List of files using auth API
```

#### Example 2: Show Code with Context
```markdown
Task: Show me how useAuthStore is used

Tool call:
  Grep tool
  pattern: "useAuthStore"
  output_mode: "content"
  -n: true
  -C: 3
  glob: "*.{js,vue}"

Result: Matching lines with 3 lines context and line numbers
```

#### Example 3: Count Occurrences
```markdown
Task: How often is this function called?

Tool call:
  Grep tool
  pattern: "fetchUserData"
  output_mode: "count"
  type: "js"

Result: Count per file
```

#### Example 4: Case-Insensitive Search
```markdown
Task: Find TODO comments (case-insensitive)

Tool call:
  Grep tool
  pattern: "todo"
  -i: true
  output_mode: "content"
  -n: true

Result: All variations (TODO, todo, Todo) with line numbers
```

#### Example 5: Multiline Pattern
```markdown
Task: Find struct definitions with specific field

Tool call:
  Grep tool
  pattern: "struct.*\\{[\\s\\S]*?field"
  multiline: true
  output_mode: "content"

Result: Struct definitions spanning multiple lines
```

### Anti-Patterns

❌ **Using grep/rg via Bash**
```bash
# Don't do this
Bash: grep -r "pattern" src/
Bash: rg "pattern"
```

✅ **Use Grep tool**
```markdown
Grep tool
pattern: "pattern"
path: "src/"
```

❌ **Searching without specifying type/glob**
```markdown
# Inefficient - searches all files
Grep tool
pattern: "function"
```

✅ **Filter by file type**
```markdown
Grep tool
pattern: "function"
type: "js"
```

❌ **Not using two-step pattern**
```markdown
# Going straight to content without overview
Grep with output_mode: content
```

✅ **Overview first, then details**
```markdown
Step 1: files_with_matches (overview)
Step 2: content with line numbers (details)
```

---

## Tool Comparison Matrix

| Task | Tool | Alternative | Why Preferred Tool is Better |
|------|------|-------------|------------------------------|
| Read single file | Read | Bash + cat | Handles all file types, line numbers, no escaping |
| Read multiple files | Parallel Read | Sequential cat | Parallel execution, consistent format |
| Create new file | Write | Bash + echo | Safety checks, proper encoding, multi-line support |
| Edit existing file | Edit | Bash + sed | Exact matching, safety checks, proper escaping |
| Find files | Glob | Bash + find | Faster, simpler syntax, consistent output |
| Search content | Grep | Bash + grep | Structured output, powerful filters, context lines |

---

## Performance Tips

1. **Parallel tool calls**
   - Call multiple independent tools in single message
   - Example: Read 5 files at once

2. **Appropriate output modes**
   - Use files_with_matches for overview (faster)
   - Use content only when needed (slower)

3. **Narrow search scope**
   - Use type parameter in Grep
   - Use specific paths in Glob
   - Avoid searching entire codebase unless necessary

4. **Limit large outputs**
   - Use head_limit in Grep
   - Use offset/limit in Read for huge files

---

## Common Workflows

### Workflow 1: Explore Codebase
```markdown
1. Use Glob to discover structure
2. Use Read to examine key files
3. Use Grep to find specific patterns
```

### Workflow 2: Refactor Variable Name
```markdown
1. Use Grep to find all occurrences
2. Use Read on each file to verify context
3. Use Edit with replace_all on each file
```

### Workflow 3: Debug Issue
```markdown
1. Use Grep to find error message or function
2. Use Read to examine full file context
3. Use Edit to fix issue
```

### Workflow 4: Review Changes
```markdown
1. Use Bash for git status/diff
2. Use Glob to find changed files
3. Use Read to review each file
```

---

**Remember:** These specialized tools are designed for Claude Code workflows. They provide better safety, performance, and integration than equivalent Bash commands. Always prefer them over shell alternatives.
