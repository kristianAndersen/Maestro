# defer_loading Developer Guide

**Document Version:** 1.0
**Last Updated:** 2025-11-27
**Status:** Production Ready
**Target Audience:** Developers working with Maestro codebase

---

## Architecture Overview

The defer_loading system optimizes skill discovery by reducing redundant recommendations through smart caching and progressive disclosure. It operates in three layers:

### Layer 1: Configuration (`skill-rules.json`)

Defines skills with optional defer_loading metadata:

```json
{
  "skill-name": {
    "defer_loading": {
      "enabled": true,
      "short_description": "Brief one-liner (20-50 chars)"
    },
    "promptTriggers": { "keywords": [...] },
    "fileTriggers": { "pathPatterns": [...] },
    "priority": "high"
  }
}
```

**Key points:**
- `defer_loading.enabled` - Boolean flag (optional, defaults to false)
- `short_description` - Required if enabled, shown on subsequent recommendations
- Full descriptions moved to SKILL.md files
- Backward compatible - legacy skills work unchanged

### Layer 2: Hook (`subagent-skill-discovery.js`)

Implements the discovery and caching logic:

```
Input: User prompt
  ↓
Load skillRules.json + context.json
  ↓
Match relevant skills (unchanged)
  ↓
Check session status (new/domain-switch/continue)
  ↓
Generate output (3 formats based on context)
  ↓
Update context.json tracking
  ↓
Output: Recommendations (minimal/incremental/full)
```

**Components:**
- Session detection (30-minute timeout)
- Domain history cleanup (prevents unbounded growth)
- Smart output formatting
- Context persistence

### Layer 3: Context (`context.json`)

Tracks recommended skills across session:

```json
{
  "skillTracking": {
    "recommended": ["skill-name1", "skill-name2"],
    "used": [],
    "sessionStart": "2025-11-27T12:00:00Z",
    "sessionId": "session-1234567-abc",
    "lastPromptTime": "2025-11-27T12:05:00Z",
    "promptCount": 5,
    "domainHistory": ["analysis", "writing"]
  }
}
```

**Fields:**
- `recommended` - Skills already recommended (no re-output)
- `used` - Skills explicitly activated (future analytics)
- `sessionStart` - Session creation timestamp
- `sessionId` - Unique session identifier
- `lastPromptTime` - Last activity for timeout detection
- `promptCount` - Number of prompts in session
- `domainHistory` - Last 100 domains seen (cleanup prevents growth)

---

## Implementation Details

### 1. Session Detection

**Location:** `subagent-skill-discovery.js`, lines 109-135

**Function:** `detectNewSession(context, currentDomain)`

**Returns:**
- `true` - New session (full reset)
- `'domain-switch'` - Domain changed (partial reset)
- `false` - Continue session (normal update)

**Logic:**

```javascript
function detectNewSession(context, currentDomain) {
  const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

  // Check 1: Missing/corrupted session info
  if (!context.skillTracking?.sessionId || !context.skillTracking?.lastPromptTime) {
    return true; // New session
  }

  // Check 2: 30-minute idle timeout
  const lastPromptTime = new Date(context.skillTracking.lastPromptTime);
  const now = new Date();
  const idleTime = now - lastPromptTime;

  if (idleTime > SESSION_TIMEOUT_MS) {
    return true; // New session due to timeout
  }

  // Check 3: Domain switch (optional feature)
  const domainHistory = context.skillTracking.domainHistory || [];
  const lastDomain = domainHistory[domainHistory.length - 1];

  if (currentDomain && lastDomain && currentDomain !== lastDomain) {
    return 'domain-switch'; // Partial reset
  }

  return false; // Continue current session
}
```

**Testing:**
```bash
# Test new session (corrupted context)
echo '{}' > .claude/context.json
echo "test prompt" | node .claude/hooks/subagent-skill-discovery.js

# Test 30-minute timeout
# Modify context.json to old timestamp, verify reset
node -e "const ctx = {...}; ctx.skillTracking.lastPromptTime = new Date(Date.now()-2000000).toISOString(); ..."
```

### 2. Domain History Cleanup

**Location:** `subagent-skill-discovery.js`, lines 138-154

**Function:** `cleanupDomainHistory(domainHistory, maxEntries = 100)`

**Purpose:** Prevent unbounded growth of domainHistory array

**Implementation:**

```javascript
function cleanupDomainHistory(domainHistory, maxEntries = 100) {
  if (!Array.isArray(domainHistory) || domainHistory.length <= maxEntries) {
    return domainHistory;
  }

  // Keep only the last maxEntries items (most recent)
  return domainHistory.slice(-maxEntries);
}
```

**Why this matters:**
- Long sessions could accumulate 100+ domains
- Array size grows unbounded → token cost increases
- Keeps only last 100 domains (typically 50+ session hours)
- No functional impact (domain switches rarely look back >100 items)

**Performance impact:** O(n) where n=domainHistory.length, typically <100 items

### 3. Smart Output Formatting

**Location:** `subagent-skill-discovery.js`, lines 353-469

**Three formats based on context state:**

#### Format 1: Full Discovery (Lines 401-413)

**When:** New session OR explicit skill request

**Output:**
```markdown
# Skill Recommendations

Based on your task, the following skills may be helpful:

## 🟠 read (high priority)
Brief: Deep file/codebase analysis
Activate: Skill(skill: "read")

## Using Skills

To activate a skill, use the Skill tool with the skill name shown above.
Skills provide progressive guidance - start with SKILL.md, then load assets/* as needed.
```

**Token cost:** 50-60 tokens per skill

#### Format 2: Incremental (Lines 417-437)

**When:** Mix of new and cached skills

**Output:**
```markdown
# New Skills Available

## 🟡 base-analysis (medium priority)
Brief: Code/system quality evaluation
Activate: Skill(skill: "base-analysis")

Previously recommended: 🟠 read, 🟡 write

Use Skill(skill: "name") to activate.
```

**Token cost:** 30-40 tokens for new skills

#### Format 3: Cached Only (Lines 440-454)

**When:** All matching skills cached + not explicit request

**Output:**
```markdown
# Skills Available

🔴 4d-evaluation, 🟡 read, 🟡 base-analysis

Use Skill(skill: "name") to activate.
```

**Token cost:** 10-20 tokens (ultra-minimal)

**Format selection logic:**

```javascript
// Determine output format based on session status and content
const isNewSession = sessionStatus === true;
const hasNewSkills = newSkills.length > 0;
const hasPreviousSkills = previouslyRecommended.length > 0;

if (isNewSession || context.forceRecommend) {
  // Format 1: Full discovery
  return fullDiscoveryOutput;
} else if (hasNewSkills && hasPreviousSkills) {
  // Format 2: Incremental
  return incrementalOutput;
} else if (!hasNewSkills && hasPreviousSkills) {
  // Format 3: All cached
  return cachedListOutput;
} else {
  // Format 1 fallback
  return fullDiscoveryOutput;
}
```

### 4. Cache Hit Logic

**Location:** `subagent-skill-discovery.js`, lines 295-315

**Function:** `findRelevantSkills(skillRules, task, context)`

**Filtering logic:**

```javascript
function findRelevantSkills(skillRules, task, context = {}) {
  const matches = [];
  const recommended = context.skillTracking?.recommended || [];

  for (const [skillName, skillConfig] of Object.entries(skillRules.skills)) {
    // Skip if already recommended (CACHE HIT)
    if (recommended.includes(skillName) && !context.forceRecommend) {
      continue; // Skip this skill, don't output
    }

    // Otherwise, check if skill matches task
    const match = matchSkill(skillConfig, task, context);
    if (match.score > 0) {
      matches.push({ name: skillName, config: skillConfig, match, score: match.score });
    }
  }

  // Sort by relevance
  matches.sort((a, b) => b.score - a.score);
  return matches;
}
```

**Cache behavior:**
- If skill in `recommended[]` → skip (cache hit)
- If `forceRecommend = true` → don't skip (explicit request)
- Only return NEW skills that haven't been cached

**Impact on output size:**
- Baseline (no cache): All matching skills recommended (100-120 words)
- With cache (hit): Only new skills output (0-40 words)
- Cache hit rate in validation: 52% (13 of 25 prompts)

### 5. Context Persistence

**Location:** `subagent-skill-discovery.js`, lines 159-220

**Function:** `updateSkillTracking(context, recommendedSkills, sessionStatus, currentDomain)`

**Three scenarios:**

**Scenario 1: New session (sessionStatus = true)**
```javascript
if (sessionStatus === true) {
  context.skillTracking = {
    recommended: recommendedSkills,
    used: [],
    sessionStart: new Date().toISOString(),
    sessionId: generateSessionId(),
    lastPromptTime: new Date().toISOString(),
    promptCount: 1,
    domainHistory: currentDomain ? [currentDomain] : []
  };
}
```

**Scenario 2: Domain switch (sessionStatus = 'domain-switch')**
```javascript
else if (sessionStatus === 'domain-switch') {
  const existingRecommended = context.skillTracking.recommended || [];
  context.skillTracking.recommended = [
    ...new Set([...existingRecommended, ...recommendedSkills])
  ];
  context.skillTracking.lastPromptTime = new Date().toISOString();
  context.skillTracking.promptCount = (context.skillTracking.promptCount || 0) + 1;

  // Update domain history
  const domainHistory = context.skillTracking.domainHistory || [];
  if (currentDomain && !domainHistory.includes(currentDomain)) {
    context.skillTracking.domainHistory = [...domainHistory, currentDomain];
  }
}
```

**Scenario 3: Normal update (sessionStatus = false)**
```javascript
else {
  // Append new recommendations (no duplicates)
  const existingRecommended = context.skillTracking.recommended || [];
  context.skillTracking.recommended = [
    ...new Set([...existingRecommended, ...recommendedSkills])
  ];
  context.skillTracking.lastPromptTime = new Date().toISOString();
  context.skillTracking.promptCount = (context.skillTracking.promptCount || 0) + 1;

  // ... domain history update ...
}
```

**Key operation:** `...new Set([...arr1, ...arr2])` creates union without duplicates

---

## Creating defer_loading-Compatible Skills

### Step 1: Prepare skill-rules.json Entry

```json
{
  "your-skill-name": {
    "type": "domain",
    "enforcement": "suggest",
    "priority": "high",
    "defer_loading": {
      "enabled": true,
      "short_description": "Brief description (20-50 chars max)"
    },
    "promptTriggers": {
      "keywords": ["keyword1", "keyword2"],
      "intentPatterns": ["pattern1.*pattern2"]
    },
    "fileTriggers": {
      "pathPatterns": ["**/*.ext"]
    }
  }
}
```

**Requirements:**
- `defer_loading.enabled` must be `true` (boolean)
- `short_description` required, max ~100 characters
- Keep it actionable: "Code refactoring assistance"
- Not generic: "Skill guidance available"

### Step 2: Structure SKILL.md for Progressive Disclosure

**Main file:** `SKILL.md` (overview, <500 lines)
**Deep dives:** `assets/*.md` (methodology, examples, patterns, <500 lines each)

**SKILL.md structure:**
```markdown
# Your Skill Name

[Overview of what this skill provides]

## When to Use

[When you should activate this skill]

## Key Concepts

[2-3 core concepts for this skill]

## Getting Started

[Quick 2-minute walkthrough]

## Advanced Topics

[Reference to assets/methodology.md for deeper patterns]

## Common Patterns

[Reference to assets/patterns.md for real examples]

## Troubleshooting

[Reference to assets/troubleshooting.md for issues]
```

**Asset file structure:**
- `assets/methodology.md` - Detailed methodology, step-by-step
- `assets/patterns.md` - Common patterns, anti-patterns
- `assets/examples.md` - Complete code examples
- `assets/troubleshooting.md` - Known issues, debugging

### Step 3: Test defer_loading Integration

**Test 1: Verify skill-rules.json syntax**
```bash
cat .claude/skills/skill-rules.json | jq '.skills["your-skill-name"]'
# Should show defer_loading object with enabled=true
```

**Test 2: Test skill discovery**
```bash
# Test that skill is discovered
echo "task that matches your skill" | node .claude/hooks/subagent-skill-discovery.js
# Should output skill name with brief description

# Test on second prompt (cached)
echo "similar task" | node .claude/hooks/subagent-skill-discovery.js
# Should show minimal output (cached format)
```

**Test 3: Verify SKILL.md loading**
```bash
# Activate skill to test full SKILL.md loads
# Verify it's readable and helpful
```

---

## Testing defer_loading Changes

### Manual Testing

**Reset context for clean state:**
```bash
echo '{"version":"1.0","skillTracking":{"recommended":[],"used":[],"sessionStart":"'$(date -u +%Y-%m-%dT%H:%M:%S.000Z)'"}}' > .claude/context.json
```

**Test single prompt:**
```bash
echo "your test prompt" | node .claude/hooks/subagent-skill-discovery.js | wc -w
```

**Test caching behavior:**
```bash
# Prompt 1 - should show full output
echo "analyze auth.py" | node .claude/hooks/subagent-skill-discovery.js | wc -w
# ~120 words

# Prompt 2 - should show cached format
echo "check config.yaml" | node .claude/hooks/subagent-skill-discovery.js | wc -w
# ~20 words (cached)
```

**Check context state:**
```bash
cat .claude/context.json | jq '.skillTracking.recommended'
# Shows: ["read", "base-analysis", ...]
```

### Automated Testing

**Use existing test scripts:**
```bash
# Baseline test (reset before each prompt)
./test-remaining-baseline.sh

# Phase 2 test (persistent session)
./test-remaining-phase2.sh
```

**Measuring token reduction:**
```bash
# Run both scripts, compare output
# Expected: Phase 2 output = 30-40% of baseline

# Calculate reduction
baseline_words=1971
phase2_words=513
reduction=$((baseline_words - phase2_words))
percent=$(echo "scale=1; $reduction / $baseline_words * 100" | bc)
echo "Token reduction: ${percent}%"
# Expected: ~74%
```

### Token Measurement

**Methodology:** words × 1.3 = estimated tokens

**Example:**
```bash
# Measure output
echo "test prompt" | node .claude/hooks/subagent-skill-discovery.js > output.txt
words=$(wc -w < output.txt)
tokens=$((words * 13 / 10))

echo "Output: $words words = $tokens tokens"
```

**Validation against actual API tokens:**
```python
import tiktoken

enc = tiktoken.encoding_for_model("gpt-4")
text = "skill recommendation output here..."
actual_tokens = len(enc.encode(text))

estimated_tokens = len(text.split()) * 1.3

print(f"Actual: {actual_tokens}")
print(f"Estimated: {estimated_tokens}")
print(f"Accuracy: {actual_tokens / estimated_tokens:.1%}")
```

---

## Performance Characteristics

### Per-Prompt Overhead

| Phase | Per-Prompt Output | Tokens | Notes |
|-------|-------------------|--------|-------|
| Phase 0 (baseline) | 494 tokens | 494 | Full skill-rules loading |
| Phase 1 (defer_loading) | 111 tokens | 111 | No skill-rules overhead |
| Phase 2 (with caching) | 26.6 avg | 26.6 | Cumulative on 25-prompt session |

### Cumulative Session Impact

**25-prompt session:**
- Phase 0: 12,350 tokens (25 × 494)
- Phase 2: 666 tokens (with caching)
- Reduction: 94.6%

**50-prompt session (projected):**
- Phase 0: 24,700 tokens
- Phase 2: ~1,200 tokens (estimated, cache hits plateau)
- Reduction: ~95%

### Cache Hit Rate Analysis

**From validation testing (25 prompts):**
- Zero-output prompts: 36% (9 of 25)
- Minimal output: 16% (4 of 25)
- New skill output: 48% (12 of 25)

**By skill type:**
| Skill | Matches | Cache Hits | Hit Rate |
|-------|---------|-----------|----------|
| read | 4 | 3 | 75% |
| base-analysis | 3 | 2 | 67% |
| 4d-evaluation | 4 | 2 | 50% |
| write | 1 | 1 | 100% |

---

## Debugging

### Common Issues

**Issue 1: Skills not being cached**

Check context.json:
```bash
cat .claude/context.json | jq '.skillTracking.recommended'
```

Should show accumulated skills. If empty:
1. Context.json isn't writable → Check file permissions
2. Hook error → Check error output
3. Session timed out → Use fresh context

**Issue 2: Unexpected skill re-recommendations**

Cause: Domain changed or session reset

Check domain history:
```bash
cat .claude/context.json | jq '.skillTracking.domainHistory'
```

**Issue 3: context.json growing unbounded**

Should not happen (cleanup prevents it). If it does:
```bash
# Check size
wc -c .claude/context.json

# Inspect growth
cat .claude/context.json | jq '.skillTracking.domainHistory | length'

# Should be ≤ 100
```

### Debug Tools

**Check hook health:**
```bash
# Test basic execution
echo "test" | node .claude/hooks/subagent-skill-discovery.js > /dev/null
echo $?  # Should be 0
```

**Validate JSON:**
```bash
# Check skill-rules.json
cat .claude/skills/skill-rules.json | jq '.' > /dev/null && echo "Valid"

# Check context.json
cat .claude/context.json | jq '.' > /dev/null && echo "Valid"
```

**Monitor during execution:**
```bash
# Add debug logging to hook
# Add console.error() statements to trace execution
```

---

## API Reference

### Functions in subagent-skill-discovery.js

#### loadSkillRules()
```javascript
function loadSkillRules(): Object
```
**Purpose:** Load skill-rules.json
**Returns:** Parsed skill configuration object
**Throws:** Exits with error if file not found
**Location:** Lines 45-54

#### loadProjectContext()
```javascript
function loadProjectContext(): Object
```
**Purpose:** Load context.json with skill tracking
**Returns:** Context with skillTracking field
**Fallback:** Returns empty context if file missing
**Location:** Lines 59-93

#### generateSessionId()
```javascript
function generateSessionId(): string
```
**Purpose:** Create unique session identifier
**Returns:** "session-{timestamp}-{random}"
**Location:** Lines 98-100

#### detectNewSession(context, currentDomain)
```javascript
function detectNewSession(context: Object, currentDomain: string?): boolean | 'domain-switch'
```
**Purpose:** Detect session reset conditions
**Returns:** true (new), 'domain-switch', or false (continue)
**Timeout:** 30 minutes
**Location:** Lines 109-135

#### cleanupDomainHistory(domainHistory, maxEntries)
```javascript
function cleanupDomainHistory(domainHistory: Array, maxEntries: number = 100): Array
```
**Purpose:** Prevent unbounded growth
**Returns:** Cleaned array with ≤ maxEntries
**Location:** Lines 147-154

#### updateSkillTracking(context, recommendedSkills, sessionStatus, currentDomain)
```javascript
function updateSkillTracking(context: Object, recommendedSkills: Array, sessionStatus: boolean | string, currentDomain: string?): void
```
**Purpose:** Update context.json with tracking info
**Side Effects:** Writes to .claude/context.json
**Location:** Lines 159-220

#### getPriorityScore(priority)
```javascript
function getPriorityScore(priority: string): number
```
**Purpose:** Convert priority to numeric score
**Returns:** 0-4 (low to critical)
**Location:** Lines 225-233

#### matchSkill(skillConfig, task, context)
```javascript
function matchSkill(skillConfig: Object, task: string, context: Object?): Object
```
**Purpose:** Score skill match against task
**Returns:** { keyword, synonym, intent, file, context, score }
**Location:** Lines 238-291

#### findRelevantSkills(skillRules, task, context)
```javascript
function findRelevantSkills(skillRules: Object, task: string, context: Object?): Array
```
**Purpose:** Find and rank matching skills
**Returns:** Sorted array of matching skill objects
**Implements:** Cache filtering (skip already-recommended)
**Location:** Lines 296-322

#### getShortDescription(skillConfig)
```javascript
function getShortDescription(skillConfig: Object): string
```
**Purpose:** Get brief description for deferred skill
**Returns:** Short description string
**Location:** Lines 327-335

#### isDeferLoadingEnabled(skillConfig)
```javascript
function isDeferLoadingEnabled(skillConfig: Object): boolean
```
**Purpose:** Check if defer_loading is enabled
**Returns:** true if skill has defer_loading.enabled=true
**Location:** Lines 340-348

#### formatSkillReference(name, config, compact)
```javascript
function formatSkillReference(name: string, config: Object, compact: boolean = false): string
```
**Purpose:** Format skill for output
**Returns:** Markdown formatted skill reference
**Location:** Lines 353-381

#### generateSuggestions(matches, context, sessionStatus)
```javascript
function generateSuggestions(matches: Array, context: Object?, sessionStatus: boolean | string): string
```
**Purpose:** Generate formatted skill output
**Returns:** Markdown skill recommendations (or empty string)
**Selects:** Full/incremental/cached format based on context
**Location:** Lines 386-469

#### extractFilePaths(task)
```javascript
function extractFilePaths(task: string): Array<string>
```
**Purpose:** Extract file paths from task description
**Returns:** Array of potential file paths
**Location:** Lines 474-480

#### isExplicitSkillRequest(task)
```javascript
function isExplicitSkillRequest(task: string): boolean
```
**Purpose:** Detect requests for skill recommendations
**Returns:** true if user explicitly asks about skills
**Location:** Lines 485-496

#### main()
```javascript
async function main(): Promise<void>
```
**Purpose:** Entry point, orchestrates skill discovery
**Process:** Load → Match → Generate → Update → Output
**Location:** Lines 501-549

---

## Contributing

### Modifying defer_loading

**When making changes:**

1. **Test backward compatibility**
   - All existing skills still work unchanged
   - Test with non-deferred skills
   - Verify fallback behavior

2. **Measure token impact**
   - Use baseline test scripts
   - Measure before/after
   - Document impact

3. **Update documentation**
   - Update this guide if logic changes
   - Update user guide if behavior changes
   - Document breaking changes

4. **Test comprehensively**
   - Unit tests for new logic
   - Integration tests for workflows
   - Performance benchmarks

### Adding New Features

**Example: Skill expiration (auto-forget after 100 prompts)**

```javascript
function shouldExpireSkill(skill, context) {
  const promptCount = context.skillTracking.promptCount || 0;
  const skillAge = promptCount - (context.skillTracking.skillIntroducedAt?.[skill] || 0);
  return skillAge > 100; // Forget after 100 prompts
}
```

**Changes needed:**
- Update `updateSkillTracking()` to track introduction time
- Update `findRelevantSkills()` to check expiration
- Add tests for expiration logic
- Document in user guide

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-11-27 | Initial developer guide, production ready |

---

**Last Updated:** 2025-11-27
**Status:** Production Ready
**Related:** `DEFER_LOADING_USER_GUIDE.md`, `DEFER_LOADING_ROLLBACK.md`
