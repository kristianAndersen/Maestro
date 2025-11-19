# Shell Command Best Practices

Comprehensive guide for using the Bash tool effectively and safely in Claude Code.

## When to Use Bash Tool

The Bash tool is for terminal operations that require shell execution:

### ✅ Appropriate Uses

1. **Version Control (Git)**
   - `git status`, `git add`, `git commit`, `git push`
   - `git diff`, `git log`, `git branch`
   - Git operations that modify repository state

2. **Package Managers**
   - `npm install`, `npm run`, `npm test`
   - `pip install`, `yarn add`, `pnpm install`
   - Package installation and script execution

3. **Build Tools**
   - `npm run build`, `npm run dev`
   - `vite build`, `webpack`
   - Compilation and bundling commands

4. **Docker/Containers**
   - `docker ps`, `docker build`, `docker run`
   - `docker-compose up`
   - Container management

5. **System Commands**
   - `ps`, `kill`, `top`
   - `df`, `du`, `uptime`
   - Process and system monitoring

6. **Development Servers**
   - Starting local servers
   - Running development tools
   - Background processes

7. **macOS-Specific Utilities**
   - `open`, `pbcopy`, `pbpaste`
   - `say`, `diskutil`
   - macOS system commands

### ❌ Do NOT Use Bash For

1. **File Reading** → Use Read tool
   - Not: `cat file.txt`
   - Use: Read tool

2. **File Writing** → Use Write tool
   - Not: `echo "content" > file.txt`
   - Use: Write tool

3. **File Editing** → Use Edit tool
   - Not: `sed 's/old/new/' file.txt`
   - Use: Edit tool

4. **Finding Files** → Use Glob tool
   - Not: `find . -name "*.js"`
   - Use: Glob tool

5. **Searching Content** → Use Grep tool
   - Not: `grep -r "pattern" src/`
   - Use: Grep tool

6. **Communication with User**
   - Not: `echo "Status message"`
   - Use: Output text directly in response

---

## Command Construction

### Chaining Commands

Different operators have different behaviors:

#### && (AND operator)
Use when commands **depend on previous success**:

```bash
✅ Good: Commands must succeed in order
git add . && git commit -m "message" && git push

Behavior:
- If git add fails → stop, don't commit
- If commit fails → stop, don't push
- All must succeed for chain to complete
```

#### ; (Semicolon)
Use when you want to run commands **regardless of previous failure**:

```bash
✅ Good: Run all commands, ignore failures
npm run lint; npm run test; npm run build

Behavior:
- Run lint (even if fails)
- Run test (even if lint failed)
- Run build (even if test failed)
```

#### || (OR operator)
Use for **fallback/error handling**:

```bash
✅ Good: Try command, fallback if fails
npm test || echo "Tests failed but continuing"

Behavior:
- Try npm test
- If it fails, run echo command
- If it succeeds, skip echo command
```

#### Pipes (|)
Use to **pass output between commands**:

```bash
✅ Good: Pass output to next command
ps aux | grep node

Behavior:
- ps aux output becomes grep input
- Sequential processing
```

### Examples by Use Case

#### Git Workflow
```bash
✅ Good: Dependent operations with &&
git add . && git commit -m "Fix auth bug" && git push

❌ Bad: Separate Bash calls (lose context)
# Message 1
Bash: git add .
# Message 2
Bash: git commit -m "Fix auth bug"
# Message 3
Bash: git push
```

#### Testing Workflow
```bash
✅ Good: Run all tests regardless of failures
npm run lint; npm run test:unit; npm run test:e2e

✅ Also good: Stop on first failure
npm run lint && npm run test:unit && npm run test:e2e
```

#### Cleanup Workflow
```bash
✅ Good: Clean up even if some commands fail
rm -rf dist; rm -rf node_modules; rm -rf .cache
```

---

## Quoting and Escaping

Proper quoting prevents errors and security issues.

### Path Quoting

**Always quote paths containing spaces:**

```bash
❌ Fails with spaces:
cd /Users/awesome/My Documents/project

✅ Quote paths with spaces:
cd "/Users/awesome/My Documents/project"
```

**Use quotes for file arguments:**

```bash
✅ Safe:
cp "source file.txt" "destination file.txt"

❌ Unsafe:
cp source file.txt destination file.txt
# Interpreted as: cp source file.txt destination file.txt
# (3 separate arguments!)
```

### String Quoting

**Single quotes (`'`) - Literal strings:**
```bash
echo 'The $HOME variable is: $HOME'
Output: The $HOME variable is: $HOME
(Variables NOT expanded)
```

**Double quotes (`"`) - Variable expansion:**
```bash
echo "The $HOME variable is: $HOME"
Output: The $HOME variable is: /Users/awesome
(Variables expanded)
```

**For commit messages, use HEREDOC:**
```bash
✅ Best practice: HEREDOC for multiline/special chars
git commit -m "$(cat <<'EOF'
Fix authentication bug

- Added session validation
- Fixed token refresh logic

🤖 Generated with Claude Code
EOF
)"
```

### Escaping Special Characters

| Character | Meaning | Escape Method | Example |
|-----------|---------|---------------|---------|
| `$` | Variable | `\$` or `'...'` | `echo '\$100'` |
| `"` | String delimiter | `\"` or `'...'` | `echo "He said \"Hi\""` |
| `'` | String delimiter | `'"'"'` | `echo 'It'"'"'s working'` |
| `\` | Escape char | `\\` | `echo "Path: C:\\Users"` |
| `;` | Command separator | `\;` or `"..."` | `find . -name "*.js" -exec rm {} \;` |
| `&` | Background operator | `\&` or `"..."` | `curl "api.com?foo=1&bar=2"` |

---

## Working Directory Management

### Best Practice: Use Absolute Paths

**Prefer absolute paths over cd:**

```bash
✅ Good: Absolute path, maintain current directory
pytest /Users/awesome/dev/project/tests

❌ Less ideal: Change directory
cd /Users/awesome/dev/project && pytest tests
```

**Why absolute paths are better:**
1. No state change (current directory unchanged)
2. Explicit and clear
3. Easier to parallelize operations
4. No risk of being in wrong directory

### When to Use cd

Only use `cd` when:
1. User explicitly requests it
2. Multiple operations in same directory
3. Relative paths are required by tool

```bash
✅ Acceptable: Multiple operations in directory
cd /path/to/project && npm install && npm run build

✅ Also good: Absolute paths
npm --prefix /path/to/project install && npm --prefix /path/to/project run build
```

---

## Parallel vs Sequential Execution

### Parallel Execution

Use **multiple Bash tool calls in single message** for independent commands:

```markdown
Task: Check git status and view recent commits

✅ Good: Parallel execution (single message)
Bash: git status
Bash: git log --oneline -5

Why: Commands are independent, can run simultaneously
```

### Sequential Execution

Use **single Bash call with &&** for dependent commands:

```markdown
Task: Install deps and start server

✅ Good: Sequential with &&
Bash: npm install && npm run dev

❌ Bad: Separate messages
Message 1: Bash: npm install
Message 2: Bash: npm run dev

Why: Server start depends on successful installation
```

### Decision Tree

```
Multiple commands to run?
├─→ Commands independent?
│   └─→ Use parallel Bash calls (multiple tools in one message)
├─→ Commands dependent (one needs previous success)?
│   └─→ Use single Bash call with &&
└─→ Commands should all run (ignore failures)?
    └─→ Use single Bash call with ;
```

---

## Background Processes

### Starting Background Commands

Use `run_in_background: true` parameter:

```markdown
Bash tool
command: npm run dev
run_in_background: true
```

### Monitoring Background Output

Use BashOutput tool:

```markdown
BashOutput tool
bash_id: <shell-id-from-start>
```

### Killing Background Processes

Use KillShell tool:

```markdown
KillShell tool
shell_id: <shell-id>
```

### Common Background Tasks

1. **Development servers**
   ```bash
   npm run dev
   vite
   webpack serve
   ```

2. **Watch processes**
   ```bash
   npm run watch
   tsc --watch
   ```

3. **Long-running tasks**
   ```bash
   npm run build:large
   docker build
   ```

---

## macOS-Specific Commands

### Available Utilities

#### open - Open files, URLs, and applications

```bash
# Open file in default application
open document.pdf

# Open URL in browser
open http://localhost:3000

# Open current directory in Finder
open .

# Open specific application
open -a "Visual Studio Code" /path/to/project
```

#### pbcopy/pbpaste - Clipboard operations

```bash
# Copy file contents to clipboard
pbcopy < file.txt

# Copy command output to clipboard
git log --oneline -10 | pbcopy

# Paste clipboard to file
pbpaste > output.txt

# Paste and use in command
pbpaste | grep "pattern"
```

#### say - Text to speech

```bash
# Announce completion
say "Build complete"

# With voice selection
say -v "Samantha" "Tests passed"

# Background announcement
say "Deployment finished" &
```

#### diskutil - Disk management

```bash
# List all disks
diskutil list

# Get disk info
diskutil info disk0

# Erase disk (⚠️ destructive!)
diskutil eraseDisk JHFS+ "NewName" /dev/disk2
```

#### defaults - System preferences

```bash
# Read preference
defaults read com.apple.finder ShowHiddenFiles

# Write preference
defaults write com.apple.finder ShowHiddenFiles -bool true

# Delete preference
defaults delete com.apple.finder ShowHiddenFiles
```

---

## Git Best Practices

### Safe Git Workflow

**Never use destructive flags without explicit user request:**

```bash
❌ Dangerous: Never do automatically
git push --force
git reset --hard HEAD~1
git clean -fd

✅ Safe: Standard operations
git status
git add .
git commit -m "message"
git push
```

### Commit Message Format

Use HEREDOC for proper formatting:

```bash
✅ Good: HEREDOC with markdown
git commit -m "$(cat <<'EOF'
Fix authentication session timeout

- Extend session duration to 24 hours
- Add automatic refresh on activity
- Improve token validation logic

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

### Git Command Patterns

#### Status and Inspection
```bash
# Parallel execution (independent)
git status
git log --oneline -10
git diff
```

#### Making Changes
```bash
# Sequential with && (dependent)
git add . && git commit -m "message" && git push
```

#### Branch Operations
```bash
# Create and switch to branch
git checkout -b feature-branch

# Or separate commands
git branch feature-branch && git checkout feature-branch
```

---

## npm/Package Manager Best Practices

### Installation

```bash
# Install dependencies
npm install

# Install specific package
npm install package-name

# Install dev dependency
npm install --save-dev package-name

# Install globally
npm install -g package-name
```

### Running Scripts

```bash
# Run script from package.json
npm run build
npm run dev
npm run test

# With arguments
npm run test -- --watch
```

### Common Patterns

#### Install and Run
```bash
✅ Sequential (dependent)
npm install && npm run build
```

#### Clean Install
```bash
✅ Sequential (dependent)
rm -rf node_modules && npm install
```

#### Multiple Scripts
```bash
# Run all regardless of failure
npm run lint; npm run test; npm run build

# Stop on first failure
npm run lint && npm run test && npm run build
```

---

## Error Handling

### Capture and Handle Errors

#### Continue on Error
```bash
# Run all commands, report which failed
npm run lint || echo "Lint failed"
npm run test || echo "Tests failed"
npm run build || echo "Build failed"
```

#### Stop on Error
```bash
# Stop at first failure
npm run lint && npm run test && npm run build
```

#### Conditional Execution
```bash
# Only build if tests pass
npm run test && npm run build || echo "Tests failed, skipping build"
```

### Exit Codes

```bash
# Commands return exit codes:
# 0 = success
# Non-zero = failure

# Check status explicitly
git status && echo "Git available" || echo "Git not found"
```

---

## Timeouts

### Default Timeout
- Default: 2 minutes (120000ms)
- Maximum: 10 minutes (600000ms)

### Setting Timeout

```markdown
Bash tool
command: npm run long-build
timeout: 600000  # 10 minutes
```

### When to Increase Timeout

- Large builds
- Full test suites
- Database migrations
- Docker image builds
- Large file downloads

---

## Output Management

### Redirecting Output

#### Suppress Output
```bash
# Suppress stdout
command > /dev/null

# Suppress stderr
command 2> /dev/null

# Suppress both
command > /dev/null 2>&1
```

#### Capture Output
```bash
# Capture in variable
output=$(command)

# Save to file
command > output.txt

# Append to file
command >> output.txt
```

### Handling Verbose Commands

```bash
# Quiet flag if available
npm install --quiet
git clone --quiet repo-url

# Redirect verbose output
npm install > /dev/null
```

---

## Security Considerations

### Command Injection Prevention

**Never construct commands with unsanitized user input:**

```bash
❌ Dangerous: User input in command
user_input="file.txt; rm -rf /"
rm $user_input  # Executes: rm file.txt; rm -rf /

✅ Safe: Quote and validate
rm "$user_input"  # Error: no such file "file.txt; rm -rf /"
```

### Path Validation

**Use absolute paths:**

```bash
✅ Safe: Absolute path
rm /Users/awesome/dev/project/file.txt

❌ Risk: Relative path
rm ../../../important-file.txt
```

### Avoid Secrets in Commands

**Don't put secrets in command line:**

```bash
❌ Bad: Secret visible in process list, history
curl -H "Authorization: Bearer sk_live_secret123" api.com

✅ Good: Use environment variables or files
export API_KEY="sk_live_secret123"
curl -H "Authorization: Bearer $API_KEY" api.com
```

---

## Common Patterns

### Pattern 1: Install and Start
```bash
npm install && npm run dev
```

### Pattern 2: Clean Build
```bash
rm -rf dist && npm run build
```

### Pattern 3: Test and Build
```bash
npm run test && npm run build || echo "Failed"
```

### Pattern 4: Git Commit and Push
```bash
git add . && git commit -m "message" && git push
```

### Pattern 5: Parallel Status Checks
```markdown
Single message with multiple Bash calls:
- Bash: git status
- Bash: npm outdated
- Bash: docker ps
```

### Pattern 6: Open Development Server
```bash
npm run dev && open http://localhost:3000
```

---

## Troubleshooting

### Command Not Found

```bash
Error: command not found: somecommand

Solutions:
1. Check if command is installed: which somecommand
2. Install if needed: npm install -g somecommand
3. Use full path: /usr/local/bin/somecommand
4. Check PATH: echo $PATH
```

### Permission Denied

```bash
Error: Permission denied

Solutions:
1. Check file permissions: ls -l file
2. Use sudo if appropriate (ask user first!)
3. Change permissions: chmod +x file
4. Change ownership: chown user:group file
```

### Path Not Found

```bash
Error: No such file or directory

Solutions:
1. Use absolute path
2. Verify path exists: ls /full/path
3. Check spelling and case sensitivity
4. Use tab completion: partial/path<tab>
```

---

## Best Practices Summary

1. ✅ **Use && for dependent commands**
2. ✅ **Use ; for independent commands that should all run**
3. ✅ **Quote all paths with spaces**
4. ✅ **Use absolute paths when possible**
5. ✅ **Use HEREDOC for complex commit messages**
6. ✅ **Parallel Bash calls for independent operations**
7. ✅ **Single Bash call with && for dependent operations**
8. ✅ **Explain destructive commands before execution**
9. ✅ **Use specialized tools (Read/Write/Edit/Glob/Grep) over shell commands**
10. ✅ **Handle errors appropriately (|| for fallback)**

---

## Anti-Patterns

1. ❌ Using `cat` to read files → Use Read tool
2. ❌ Using `echo >` to write files → Use Write tool
3. ❌ Using `sed` to edit files → Use Edit tool
4. ❌ Using `find` to search files → Use Glob tool
5. ❌ Using `grep` to search content → Use Grep tool
6. ❌ Separate Bash calls for dependent operations → Use &&
7. ❌ Unquoted paths with spaces → Always quote
8. ❌ Using `cd` unnecessarily → Use absolute paths
9. ❌ Not explaining destructive commands → Always warn user
10. ❌ Hardcoding secrets in commands → Use env vars or files

---

**Remember:** Bash tool is for terminal operations (git, npm, docker, system commands). For file operations, always prefer specialized tools (Read, Write, Edit, Glob, Grep).
