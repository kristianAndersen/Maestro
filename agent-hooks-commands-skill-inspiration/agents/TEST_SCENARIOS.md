# Subagent Testing Scenarios

Test cases to verify the Maestro subagent architecture works correctly with skill-registry integration.

---

## How to Test

**As Main Claude (Maestro):**
When user requests file operations, you should:
1. Read `.claude/skills/skill-rules.json`
2. Find `subagents.file-opener`
3. Spawn subagent using Task tool with `subagent_type: "general-purpose"`
4. Provide the subagent with the file-opener agent prompt

**The subagent will:**
1. Receive file-opener.md as system prompt
2. Have access to skill registry
3. Load and apply skills dynamically
4. Return structured summary

---

## Test 1: Simple File Read

### User Prompt
```
"Show me the README"
```

### Expected Flow

**Main Claude:**
```
1. Detects: "show" + "README" = file operation
2. Reads: skill-rules.json
3. Finds: subagents.file-opener matches
4. Spawns: Task tool with file-opener agent
5. Passes: "Show me the README"
```

**file-opener Subagent:**
```
1. Receives: "Show me the README"
2. Parses: File = "README" (likely README.md), Intent = "show" (read-only)
3. Opens: Read(README.md) → Content loaded
4. Detects: No skill needed (simple display)
5. Returns: File content + brief note
```

**Main Claude:**
```
Receives: README content summary
Shows to user: Content of README
```

### Success Criteria
- ✓ Subagent spawned (not direct execution)
- ✓ File found and opened
- ✓ Content returned to main Claude
- ✓ Main context preserved (<100 tokens used)

---

## Test 2: Code Review with Skill Delegation

### User Prompt
```
"Review the file-opener skill for bugs"
```

### Expected Flow

**Main Claude:**
```
1. Detects: "review" + "file" = file operation
2. Reads: skill-rules.json
3. Finds: subagents.file-opener matches
4. Spawns: file-opener subagent
5. Passes: "Review the file-opener skill for bugs"
```

**file-opener Subagent:**
```
1. Receives: "Review the file-opener skill for bugs"
2. Parses: File = "file-opener skill" → .claude/skills/file-opener/SKILL.md
         Intent = "review", "bugs" = code analysis
3. Opens: Read(.claude/skills/file-opener/SKILL.md) → 480 lines loaded
4. Reads registry: Read(.claude/skills/skill-rules.json)
5. Searches registry: Keywords "review", "bugs" → Finds code-analysis
6. Loads skill: Read(.claude/skills/code-analysis/SKILL.md) into subagent context
7. Applies: code-analysis methodology to file-opener/SKILL.md
8. Returns: Structured findings (line numbers, issues, recommendations)
```

**Main Claude:**
```
Receives: "Reviewed file-opener/SKILL.md. Found [X] issues..."
Shows to user: Structured summary with findings
```

### Success Criteria
- ✓ Subagent spawned
- ✓ File opened (file-opener/SKILL.md)
- ✓ skill-rules.json read in subagent
- ✓ code-analysis skill loaded in subagent context
- ✓ Skill methodology applied
- ✓ Structured results returned
- ✓ Main context preserved (skill never loaded in main)

---

## Test 3: Pattern-Based Multi-File

### User Prompt
```
"Check all markdown files in the skills directory"
```

### Expected Flow

**Main Claude:**
```
1. Detects: "check" + "files" = file operation
2. Spawns: file-opener subagent
3. Passes: "Check all markdown files in the skills directory"
```

**file-opener Subagent:**
```
1. Receives: "Check all markdown files in the skills directory"
2. Parses: Pattern = "all markdown files in skills"
         Intent = "check" (needs clarification)
3. Globs: .claude/skills/**/*.md → Found 15+ files
4. Checks: File count > 5 = Heavy context
5. Reads registry: Find skill for large batch
6. Decision: gemini-delegator skill (handles 5+ files)
7. Loads: .claude/skills/gemini-delegator/SKILL.md
8. Applies: Delegate to Gemini CLI for batch analysis
9. Returns: Aggregated findings across all files
```

**Main Claude:**
```
Receives: "Checked 15 markdown files. Found patterns..."
Shows to user: Batch analysis summary
```

### Success Criteria
- ✓ Pattern correctly interpreted (*.md in .claude/skills/)
- ✓ Glob found multiple files
- ✓ Large batch detected (>5 files)
- ✓ Appropriate skill selected (gemini-delegator)
- ✓ Batch processing delegated
- ✓ Main context preserved (15 files NOT loaded in main)

---

## Test 4: Ambiguous Reference

### User Prompt
```
"Check the config file"
```

### Expected Flow

**Main Claude:**
```
1. Detects: "check" + "config file" = file operation
2. Spawns: file-opener subagent
3. Passes: "Check the config file"
```

**file-opener Subagent:**
```
1. Receives: "Check the config file"
2. Parses: File = "config file" (AMBIGUOUS)
         Intent = "check" (unclear without file type)
3. Searches: Grep for "config", "settings", ".env"
4. Found:
   - .claude/skills/skill-rules.json
   - package.json
   - tsconfig.json (if exists)
5. Cannot proceed: Multiple candidates
6. Returns: Options for user to clarify
```

**Main Claude:**
```
Receives: "Found 3 potential config files: [list]"
Asks user: "Which config file would you like to check?"
User responds: "skill-rules.json"
Spawns again: With clarified file
```

**file-opener Subagent (second call):**
```
1. Receives: "Check skill-rules.json"
2. Opens: .claude/skills/skill-rules.json
3. Detects: .json file + "check" = data validation
4. Reads registry: Finds data-validation skill
5. Loads: .claude/skills/data-validation/SKILL.md
6. Applies: JSON validation, schema check
7. Returns: Validation results
```

### Success Criteria
- ✓ Ambiguity detected (not guessed)
- ✓ Options presented to user
- ✓ User clarification requested
- ✓ Correct file opened after clarification
- ✓ Appropriate skill applied (data-validation for JSON)

---

## Test 5: Data Validation

### User Prompt
```
"Validate skill-rules.json"
```

### Expected Flow

**Main Claude:**
```
1. Detects: "validate" + "skill-rules.json" = file operation
2. Spawns: file-opener subagent
```

**file-opener Subagent:**
```
1. Receives: "Validate skill-rules.json"
2. Parses: File = "skill-rules.json", Intent = "validate"
3. Opens: Read(.claude/skills/skill-rules.json)
4. Detects: .json file + "validate" = data validation
5. Reads registry: Finds data-validation skill
6. Loads: .claude/skills/data-validation/SKILL.md
7. Applies: JSON structure validation, schema compliance
8. Returns: Validation results (is valid JSON, schema issues, etc.)
```

**Main Claude:**
```
Receives: "Validated skill-rules.json. Status: [result]"
Shows to user: Validation summary
```

### Success Criteria
- ✓ File type detected (.json)
- ✓ Intent matched (validate → data-validation)
- ✓ Correct skill loaded
- ✓ JSON validation performed
- ✓ Results structured and actionable

---

## Test 6: Direct Edit Request

### User Prompt
```
"Update the file-opener description in skill-rules.json"
```

### Expected Flow

**Main Claude:**
```
1. Detects: "update" = edit operation (might not need subagent)
2. Options:
   a. Spawn file-opener to locate file, then main Claude edits
   b. Main Claude handles directly with Edit tool
```

**file-opener Subagent (if spawned):**
```
1. Receives: "Update the file-opener description"
2. Parses: Intent = "update" = Edit operation
3. Opens: skill-rules.json to find location
4. Detects: No skill needed (direct Edit)
5. Returns: File location + content to edit
   OR
   Performs edit directly and returns confirmation
```

### Success Criteria
- ✓ Edit intent detected
- ✓ No unnecessary skill delegation
- ✓ File opened and edited correctly
- ✓ Either subagent edits OR returns to main for edit

---

## Test 7: Large Single File

### User Prompt
```
"Analyze the 2000-line implementation in large-file.js"
```

### Expected Flow

**Main Claude:**
```
1. Spawns: file-opener subagent
```

**file-opener Subagent:**
```
1. Opens: large-file.js
2. Checks: File size = 2000 lines (large)
3. Reads registry: Should use file-reader for large files
4. Loads: .claude/skills/file-reader/SKILL.md
5. Applies: Streaming read strategy (file-reader handles large files)
6. Then: Detects "analyze" intent
7. Loads: code-analysis skill (for the analysis)
8. Applies: Code analysis to streamed content
9. Returns: Analysis results
```

### Success Criteria
- ✓ Large file detected
- ✓ file-reader skill used for opening
- ✓ code-analysis skill used for analysis
- ✓ Multiple skills chained correctly
- ✓ Main context preserved (2000 lines NOT in main)

---

## Verification Checklist

After running tests, verify:

### Subagent Spawning
```
✓ Main Claude reads skill-rules.json
✓ Subagent entry found in registry
✓ Task tool used to spawn
✓ Subagent receives correct prompt
✓ Subagent has file-opener.md as system prompt
```

### Skill Registry Access
```
✓ Subagent reads skill-rules.json
✓ Registry parsed correctly
✓ Skills matched based on intent
✓ Skill files loaded into subagent context
✓ Main context NOT loaded with skill
```

### Intent Detection
```
✓ File references parsed correctly
✓ User intent keywords extracted
✓ Appropriate skill selected
✓ Ambiguity handled with clarification
✓ Direct operations (show, edit) recognized
```

### Results Quality
```
✓ Structured output returned
✓ Line numbers / specifics provided
✓ Evidence included
✓ Actionable recommendations
✓ Summary concise (preserves main context)
```

### Context Preservation
```
✓ Main Claude context < 500 tokens after test
✓ Skills loaded in subagent only
✓ File contents in subagent only
✓ Only summary returned to main
✓ User sees complete results
```

---

## Performance Benchmarks

### Expected Token Usage

**Test 1 (Simple Read):**
- Main context: ~200 tokens (spawn + receive summary)
- Subagent context: ~1000 tokens (agent prompt + file)
- **Savings:** File content not in main

**Test 2 (Code Review with Skill):**
- Main context: ~300 tokens (spawn + receive results)
- Subagent context: ~2500 tokens (agent + skill + file + analysis)
- **Savings:** ~2200 tokens preserved in main

**Test 3 (Multi-File Batch):**
- Main context: ~400 tokens (spawn + receive aggregated results)
- Subagent context: ~5000+ tokens (15 files + gemini delegation)
- **Savings:** ~4600+ tokens preserved in main

### Context Preservation Success

```
Without subagents:
  Main context after Test 2: ~3000 tokens used
  Main context after Test 3: ~6000+ tokens used

With subagents:
  Main context after Test 2: ~300 tokens used
  Main context after Test 3: ~400 tokens used

Improvement: 90%+ context preservation ✅
```

---

## Troubleshooting Test Failures

### Subagent Not Spawning
**Check:**
- Is skill-rules.json being read?
- Do triggers match the prompt?
- Is Task tool being used?

**Fix:**
- Verify trigger keywords in registry
- Ensure main Claude checks registry
- Use Task tool with correct params

### Skill Not Found in Subagent
**Check:**
- Is subagent reading skill-rules.json?
- Does skill exist in registry?
- Is skill file path correct?

**Fix:**
- Ensure first action is Read(skill-rules.json)
- Verify skill is registered
- Check file paths match registry

### Context Still Bloated
**Check:**
- Is subagent returning full content?
- Are files loaded in main instead of subagent?
- Is summary too verbose?

**Fix:**
- Return only structured summary
- Keep file content in subagent
- Use concise return format

---

## Next Steps

After successful testing:

1. **Create more subagents:**
   - code-reviewer (comprehensive reviews)
   - data-processor (ETL operations)
   - documentation-analyzer (large docs)

2. **Enhance skill registry:**
   - Add more specialist skills
   - Refine trigger patterns
   - Document skill combinations

3. **Optimize delegation:**
   - Auto-detect when to spawn subagent
   - Batch similar operations
   - Cache skill registry in main context

4. **Monitor performance:**
   - Track token savings
   - Measure response times
   - Identify bottlenecks

---

**Testing Goal:** Verify that Maestro's subagent architecture preserves context while enabling dynamic skill composition through the registry.

**Success Metric:** 90%+ context preservation with full functionality maintained.
