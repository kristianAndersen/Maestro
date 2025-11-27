# defer_loading Implementation Design

## Document Overview

This document specifies the design for the defer_loading feature in Maestro's skill system. The feature aims to reduce skill discovery overhead while maintaining full backward compatibility.

**Created:** 2025-11-25
**Version:** 1.0
**Status:** Design phase (Week 1, Task 1.2)
**Related:** `skill-loading-architecture.md` (baseline analysis)

---

## Executive Summary

### Problem Statement

Current skill discovery system loads ~600-650 tokens per prompt:
- skill-rules.json (~400 tokens)
- Skill descriptions (~150-200 tokens)
- Context overhead (~50 tokens)

In long conversations (50+ prompts), this overhead consumes 16-32% of token budget without providing proportional value (same recommendations repeated).

### Proposed Solution

Implement **defer_loading** through three mechanisms:

1. **Lightweight skill references** - Minimal metadata only
2. **Description deferral** - Move verbose descriptions to SKILL.md
3. **Smart caching** - Track recommended skills to avoid repetition

### Success Criteria (Phase 1)

- ✅ Reduce discovery overhead from 600-650 → 200-300 tokens (50% reduction)
- ✅ Maintain 100% backward compatibility (existing skills work unchanged)
- ✅ No regression in skill discovery accuracy
- ✅ Measurable improvement in 50+ prompt conversations

---

## Design Philosophy

### Core Principles

1. **Backward Compatibility First**
   - All existing skills must work without modification
   - Fallback to current behavior if defer_loading not supported
   - Graceful degradation

2. **Progressive Enhancement**
   - Skills opt-in to defer_loading via metadata flag
   - Non-defer skills continue with current flow
   - Mixed ecosystem supported

3. **No Functional Loss**
   - Discovery accuracy maintained
   - Skill recommendations remain helpful
   - Agent experience unchanged

4. **Measurable Impact**
   - Token reduction quantified
   - Performance benchmarked
   - Before/after comparison documented

---

## Architecture Design

### Component Changes

```
┌─────────────────────────────────────────────────────────────┐
│                    CURRENT SYSTEM                            │
├─────────────────────────────────────────────────────────────┤
│ skill-rules.json (400 tokens)                                │
│   - Full descriptions                                        │
│   - All trigger patterns                                     │
│   - Metadata                                                 │
│                                                               │
│ Recommendation Output (150-200 tokens)                       │
│   - "When to use: [verbose description]"                     │
│   - Priority + icon                                          │
│   - Usage instructions                                       │
│                                                               │
│ Total: 600-650 tokens per prompt                             │
└─────────────────────────────────────────────────────────────┘

                            ▼
                    defer_loading

┌─────────────────────────────────────────────────────────────┐
│                    OPTIMIZED SYSTEM                          │
├─────────────────────────────────────────────────────────────┤
│ skill-rules.json (200 tokens) - SLIMMED                      │
│   - Minimal descriptions (opt-in)                            │
│   - Essential triggers only                                  │
│   - defer_loading flags                                      │
│                                                               │
│ Recommendation Output (100-150 tokens) - MINIMAL             │
│   - Skill name + priority                                    │
│   - "Use Skill tool for details" (if deferred)               │
│   - Cached check (skip if already recommended)               │
│                                                               │
│ context.json Tracking (+50 tokens)                           │
│   - Tracks recommended skills                                │
│   - Prevents repetition                                      │
│                                                               │
│ Total: 250-350 tokens per prompt (initial)                   │
│        150-200 tokens per prompt (subsequent)                │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Structure Design

### Modified skill-rules.json Schema

#### Current Schema (Per Skill):
```json
{
  "skill-name": {
    "type": "domain",
    "enforcement": "suggest",
    "priority": "high",
    "promptTriggers": {
      "keywords": ["word1", "word2"],
      "synonyms": ["alt1", "alt2"],
      "intentPatterns": ["pattern1", "pattern2"]
    },
    "fileTriggers": {
      "pathPatterns": ["**/*.py"]
    },
    "domain": "writing"
  }
}
```
**Token Cost:** ~35-45 tokens per skill

#### New Schema with defer_loading:
```json
{
  "skill-name": {
    "type": "domain",
    "enforcement": "suggest",
    "priority": "high",
    "defer_loading": {
      "enabled": true,
      "short_description": "Brief one-liner"
    },
    "promptTriggers": {
      "keywords": ["word1", "word2"],
      "synonyms": ["alt1"],
      "intentPatterns": ["pattern1"]
    },
    "fileTriggers": {
      "pathPatterns": ["**/*.py"]
    },
    "domain": "writing"
  }
}
```
**Token Cost:** ~25-30 tokens per skill (if descriptions moved to SKILL.md)

**Changes:**
- `defer_loading` object added (opt-in flag)
- `short_description` replaces verbose hardcoded descriptions
- Optional: Reduce trigger patterns to essentials only

#### Fallback Behavior:
```javascript
// In subagent-skill-discovery.js
const isDeferred = skillConfig.defer_loading?.enabled || false;
const description = isDeferred
  ? skillConfig.defer_loading.short_description
  : getSkillDescription(skillName); // Legacy lookup
```

---

### Enhanced context.json Schema

#### Current Schema:
```json
{
  "activeDomain": "writing",
  "lastEditedFile": "/path/to/file.py"
}
```
**Token Cost:** ~50 tokens

#### New Schema with Skill Tracking:
```json
{
  "activeDomain": "writing",
  "lastEditedFile": "/path/to/file.py",
  "skillTracking": {
    "recommended": ["write", "read", "base-analysis"],
    "used": ["write"],
    "sessionId": "uuid-or-timestamp"
  }
}
```
**Token Cost:** ~100 tokens (with tracking)

**Tracking Logic:**
- `recommended`: Skills already suggested in current conversation
- `used`: Skills explicitly invoked via Skill tool
- `sessionId`: Detect new conversations (reset tracking)

**Benefits:**
- Skip re-recommending same skills
- Reduce redundant output
- Track skill usage patterns

---

## Implementation Plan

### Phase 1: Core Infrastructure (Week 2)

#### 1.1 Modify skill-rules.json
```json
// Add defer_loading to compatible skills
{
  "write": {
    "defer_loading": {
      "enabled": true,
      "short_description": "Code/file modifications"
    },
    // ... existing config
  }
}
```

**Files to modify:**
- `.claude/skills/skill-rules.json`

**Testing:**
- Validate JSON schema
- Ensure backward compatibility (non-deferred skills)

#### 1.2 Update subagent-skill-discovery.js

**Location:** `.claude/hooks/subagent-skill-discovery.js`

**Changes:**

##### Change 1: Add defer_loading support (after line 165)
```javascript
function getSkillDescription(skillName, skillConfig) {
  // Check if skill has defer_loading enabled
  if (skillConfig.defer_loading?.enabled) {
    return skillConfig.defer_loading.short_description;
  }

  // Fallback to legacy descriptions
  const descriptions = {
    'list': 'Directory and file listing operations...',
    // ... existing descriptions
  };

  return descriptions[skillName] || `Guidance for ${skillName} operations`;
}
```

##### Change 2: Load and check skill tracking (after line 233)
```javascript
// Load project context with skill tracking
let projectContext = {};
try {
  const contextPath = join(__dirname, '..', 'context.json');
  projectContext = JSON.parse(readFileSync(contextPath, 'utf-8'));
} catch (e) {
  projectContext = { skillTracking: { recommended: [], used: [] } };
}

// Initialize skill tracking if missing
if (!projectContext.skillTracking) {
  projectContext.skillTracking = { recommended: [], used: [] };
}
```

##### Change 3: Filter already-recommended skills (after line 146)
```javascript
function findRelevantSkills(skillRules, task, context = {}) {
  const matches = [];
  const recommended = context.skillTracking?.recommended || [];

  for (const [skillName, skillConfig] of Object.entries(skillRules.skills)) {
    // Skip if already recommended in this session
    if (recommended.includes(skillName) && !context.forceRecommend) {
      continue;
    }

    const match = matchSkill(skillName, skillConfig, task, context);
    if (match.score > 0) {
      matches.push({
        name: skillName,
        config: skillConfig,
        match,
        score: match.score
      });
    }
  }

  // Sort by score
  matches.sort((a, b) => b.score - a.score);
  return matches;
}
```

##### Change 4: Update context after recommendation (after line 201)
```javascript
function generateSuggestions(matches, context) {
  if (matches.length === 0) {
    return '';
  }

  // Build recommendation output (existing logic)
  let output = '\n# Skill Recommendations\n\n';
  // ... existing code ...

  // Track recommended skills
  const recommendedSkills = matches.map(m => m.name);
  updateSkillTracking(context, recommendedSkills);

  return output;
}

function updateSkillTracking(context, recommendedSkills) {
  try {
    const contextPath = join(__dirname, '..', 'context.json');
    const ctx = context.skillTracking ? context : { skillTracking: { recommended: [], used: [] } };

    // Add new recommendations
    ctx.skillTracking.recommended = [
      ...new Set([...ctx.skillTracking.recommended, ...recommendedSkills])
    ];

    // Write back to context.json
    writeFileSync(contextPath, JSON.stringify(ctx, null, 2), 'utf-8');
  } catch (e) {
    // Fail silently, tracking is optional
  }
}
```

**Testing:**
- Test with defer_loading enabled skills
- Test with legacy skills (no defer_loading)
- Verify tracking updates context.json
- Ensure no crashes on missing context.json

#### 1.3 Update SKILL.md files (Progressive)

**Approach:** Add full descriptions to SKILL.md files for skills with defer_loading enabled.

**Example for write skill:**

Add to top of `.claude/skills/write/SKILL.md` (after frontmatter):
```markdown
---
name: write
description: Code/file modifications (short for discovery)
full_description: >
  Comprehensive guidance for code and file modification operations.
  Helps choose between Edit and Write tools, implement safety checks,
  verify changes, and follow best practices for reliable modifications.
defer_loading: true
---

# Write Skill

## Full Description (defer_loading)

This skill provides comprehensive guidance for code and file modification operations.
It helps you choose between Edit and Write tools, implement safety checks,
verify changes, and follow best practices for making reliable, maintainable
code modifications.

<!-- Rest of existing SKILL.md content -->
```

**Skills to update:**
- write
- read
- base-research
- base-analysis
- 4d-evaluation

---

### Phase 2: Smart Caching (Week 3)

#### 2.1 Session Detection

**Goal:** Detect new conversations to reset skill tracking.

**Mechanism:**
```javascript
// In subagent-skill-discovery.js
function detectNewSession(context) {
  const lastSessionTime = context.skillTracking?.sessionId;
  const now = Date.now();
  const sessionTimeout = 30 * 60 * 1000; // 30 minutes

  if (!lastSessionTime || (now - lastSessionTime) > sessionTimeout) {
    // New session detected
    context.skillTracking = {
      recommended: [],
      used: [],
      sessionId: now
    };
    return true;
  }
  return false;
}
```

#### 2.2 Recommendation Suppression

**Goal:** Skip redundant recommendations within same session.

**Output format when suppressed:**
```markdown
# Skill Recommendations

Previously recommended skills are available:
- write (high priority) - use `Skill(skill: "write")` to activate
- read (high priority) - use `Skill(skill: "read")` to activate

New recommendations for this task:
## 🟡 base-analysis (medium priority)
**When to use:** Code evaluation for quality...
```

**Token savings:** ~100 tokens per prompt (after initial recommendations)

---

### Phase 3: Conditional Discovery (Week 4)

#### 3.1 Pre-Check Filter

**Goal:** Skip discovery for conversational prompts.

**Heuristic:**
```javascript
function shouldRunDiscovery(prompt) {
  const codeIndicators = [
    /\b(code|file|function|class|implement|fix|bug|refactor|analyze)\b/i,
    /\.(js|py|ts|go|java|rb|rs|cpp|cs|php|md|json|yaml)\b/i,
    /\/.*\//,  // Paths with slashes
    /@/,       // Decorators or annotations
  ];

  // Run discovery if any indicator matches
  return codeIndicators.some(pattern => pattern.test(prompt));
}
```

**Fallback:** Always run discovery if:
- Prompt mentions "skill"
- Context has activeDomain set
- Last action was code-related

**Token savings:** ~650 tokens per non-code prompt (complete skip)

---

## API Contracts

### skill-rules.json Contract

#### defer_loading Object (Optional)
```typescript
interface DeferLoadingConfig {
  enabled: boolean;          // Enable defer_loading for this skill
  short_description: string; // Brief one-line description (20-50 chars)
}
```

**Validation rules:**
- `enabled` must be boolean
- `short_description` required if enabled=true
- `short_description` max 100 characters
- Skill must have SKILL.md with full description

### context.json Contract

#### skillTracking Object (Optional)
```typescript
interface SkillTracking {
  recommended: string[];  // Array of skill names
  used: string[];        // Array of skill names
  sessionId: number;     // Timestamp of session start
}
```

**Update rules:**
- `recommended` appends new skills (no duplicates)
- `used` updated when Skill tool invoked (requires hook)
- `sessionId` reset after timeout or explicit signal

### Hook Output Contract

**Current format (unchanged):**
```markdown
# Skill Recommendations

Based on your task, the following skills may be helpful:

## 🟠 read (high priority)
**When to use:** Deep file and codebase analysis...

## Using Skills
To activate a skill, use the Skill tool:
...
```

**New format (with defer_loading):**
```markdown
# Skill Recommendations

## 🟠 read (high priority)
Code analysis and comprehension. Use `Skill(skill: "read")` for full guidance.

## Using Skills
Activate skills with: `Skill(skill: "skill-name")`
Full descriptions load on activation.
```

**Differences:**
- Shorter descriptions
- Explicit mention of "full guidance" on activation
- Removed verbose "When to use" section

---

## Fallback Strategy

### Scenario 1: Invalid defer_loading Config

**Problem:** skill-rules.json has malformed defer_loading object

**Fallback:**
```javascript
try {
  const isDeferred = skillConfig.defer_loading?.enabled || false;
  const description = isDeferred
    ? skillConfig.defer_loading.short_description
    : getSkillDescription(skillName);
} catch (e) {
  // Fallback to legacy
  const description = getSkillDescription(skillName);
}
```

**Behavior:** Skill works with full description (legacy mode)

### Scenario 2: Missing context.json

**Problem:** context.json doesn't exist or is unreadable

**Fallback:**
```javascript
let projectContext = {};
try {
  const contextPath = join(__dirname, '..', 'context.json');
  projectContext = JSON.parse(readFileSync(contextPath, 'utf-8'));
} catch (e) {
  // Create default context
  projectContext = {
    skillTracking: { recommended: [], used: [], sessionId: Date.now() }
  };
}
```

**Behavior:** Discovery runs normally, tracking starts fresh

### Scenario 3: Corrupted context.json

**Problem:** context.json exists but has invalid JSON

**Fallback:**
```javascript
try {
  projectContext = JSON.parse(readFileSync(contextPath, 'utf-8'));
} catch (e) {
  console.error('Warning: context.json corrupted, resetting');
  projectContext = { skillTracking: { recommended: [], used: [], sessionId: Date.now() } };
  // Attempt to overwrite with valid JSON
  try {
    writeFileSync(contextPath, JSON.stringify(projectContext, null, 2));
  } catch (writeError) {
    // Fail silently
  }
}
```

**Behavior:** Reset tracking, continue with valid context

### Scenario 4: Skill Without defer_loading Used

**Problem:** Legacy skill (no defer_loading flag) is discovered

**Fallback:**
```javascript
const isDeferred = skillConfig.defer_loading?.enabled || false;
if (!isDeferred) {
  // Use legacy description lookup
  description = getSkillDescription(skillName);
}
```

**Behavior:** Full description shown (current behavior maintained)

---

## Rollback Plan

### Rollback Trigger Conditions

Rollback to current system if:

1. **Discovery accuracy drops >10%** (skills not found when needed)
2. **Token savings <30%** (optimization ineffective)
3. **Backward compatibility breaks** (existing skills fail)
4. **Critical bugs** (crashes, data loss)

### Rollback Procedure

#### Step 1: Revert skill-rules.json
```bash
cd .claude/skills
git checkout HEAD skill-rules.json
```

#### Step 2: Revert subagent-skill-discovery.js
```bash
cd .claude/hooks
git checkout HEAD subagent-skill-discovery.js
```

#### Step 3: Clean context.json
```bash
# Remove skillTracking object
cat .claude/context.json | jq 'del(.skillTracking)' > .claude/context.json.tmp
mv .claude/context.json.tmp .claude/context.json
```

#### Step 4: Verify Rollback
```bash
# Test discovery works
echo "analyze auth.py" | node .claude/hooks/subagent-skill-discovery.js

# Expected: Full recommendations (legacy format)
```

### Rollback Testing

**Pre-rollback checklist:**
- [ ] Backup current skill-rules.json
- [ ] Backup current subagent-skill-discovery.js
- [ ] Document token measurements before rollback
- [ ] Test legacy system still works

**Post-rollback verification:**
- [ ] Discovery produces recommendations
- [ ] Skill tool still works
- [ ] No errors in hook execution
- [ ] Token costs match pre-implementation baseline

---

## Risks & Mitigation

### Risk 1: Broken Skill Discovery

**Risk:** defer_loading logic breaks skill matching

**Probability:** Medium
**Impact:** High (skills not discovered)

**Mitigation:**
- Comprehensive unit tests for matching logic
- Feature flag to disable defer_loading per skill
- Extensive testing in Phase 1 before rollout
- Monitoring: track recommendation counts before/after

**Detection:**
```bash
# Test skill discovery
echo "analyze code" | node .claude/hooks/subagent-skill-discovery.js | grep -c "##"
# Should return 2-3 (number of recommendations)
```

### Risk 2: Context Tracking Pollution

**Risk:** context.json grows unbounded, tracking becomes stale

**Probability:** Low
**Impact:** Low (increased token cost, confusion)

**Mitigation:**
- Session timeout (30 min) clears tracking
- Max array size limit (recommended: 10 skills)
- Manual reset command: `/clear-skill-tracking`
- Periodic cleanup on context switch

**Detection:**
```bash
# Check context.json size
wc -c .claude/context.json
# Should be <1KB typically
```

### Risk 3: Backward Compatibility Break

**Risk:** Existing skills fail with new system

**Probability:** Low
**Impact:** High (breaks user workflows)

**Mitigation:**
- Gradual rollout (opt-in per skill)
- Legacy fallback for all code paths
- Test suite covering all 9 existing skills
- Version flag in skill-rules.json

**Detection:**
```bash
# Test all skills
for skill in write read list open fetch base-research base-analysis 4d-evaluation hallucination-detection; do
  echo "test $skill" | node .claude/hooks/subagent-skill-discovery.js | grep -q "$skill" || echo "FAIL: $skill"
done
```

### Risk 4: Token Savings Not Realized

**Risk:** Optimization overhead negates savings

**Probability:** Low
**Impact:** Medium (wasted effort, no benefit)

**Mitigation:**
- Baseline measurements before implementation
- Token counting at each stage
- A/B testing with real conversations
- Revert if <30% savings achieved

**Detection:**
```bash
# Measure tokens before/after
# Use baseline-metrics.md scenarios
# Compare total token usage
```

### Risk 5: Session Detection Failure

**Risk:** New sessions not detected, tracking persists incorrectly

**Probability:** Medium
**Impact:** Low (redundant recommendations suppressed)

**Mitigation:**
- Conservative timeout (30 min)
- Manual reset capability
- Session ID visible in context.json
- Force recommend flag for edge cases

**Detection:**
```bash
# Check session age
node -e "const ctx = require('./.claude/context.json'); console.log(Date.now() - ctx.skillTracking?.sessionId)"
# Should reset after 1800000ms (30 min)
```

### Risk 6: Hook Performance Regression

**Risk:** Additional logic slows hook execution

**Probability:** Low
**Impact:** Low (slight latency increase)

**Mitigation:**
- Benchmarking: measure hook execution time
- Optimize tracking updates (async writes)
- Lazy loading of context.json
- Cache parsed JSON in memory (future)

**Detection:**
```bash
# Benchmark hook execution
time echo "test" | node .claude/hooks/subagent-skill-discovery.js
# Should be <50ms total
```

### Risk Matrix

| Risk | Probability | Impact | Priority | Mitigation Effort |
|------|-------------|--------|----------|-------------------|
| Broken discovery | Medium | High | **HIGH** | High (testing) |
| Context pollution | Low | Low | Low | Low (limits) |
| Backward compat break | Low | High | **HIGH** | Medium (testing) |
| No token savings | Low | Medium | Medium | Medium (measurement) |
| Session detection fail | Medium | Low | Medium | Low (timeout) |
| Performance regression | Low | Low | Low | Low (benchmarking) |

**Priority focus:** Broken discovery + Backward compatibility (HIGH priority risks)

---

## Testing Strategy

### Unit Tests (Week 2)

#### Test 1: defer_loading Flag Handling
```javascript
// Test: Skill with defer_loading enabled
const skillConfig = {
  defer_loading: { enabled: true, short_description: "Brief desc" }
};
const desc = getSkillDescription("test-skill", skillConfig);
assert(desc === "Brief desc");

// Test: Skill without defer_loading (legacy)
const legacyConfig = { /* no defer_loading */ };
const legacyDesc = getSkillDescription("write", legacyConfig);
assert(legacyDesc.includes("guidance"));
```

#### Test 2: Skill Tracking
```javascript
// Test: Tracks recommended skills
const context = { skillTracking: { recommended: [] } };
const matches = [{ name: "write" }, { name: "read" }];
generateSuggestions(matches, context);
assert(context.skillTracking.recommended.includes("write"));
assert(context.skillTracking.recommended.includes("read"));

// Test: Skips already-recommended
const context2 = { skillTracking: { recommended: ["write"] } };
const matches2 = findRelevantSkills(skillRules, "modify code", context2);
assert(!matches2.some(m => m.name === "write")); // Should be filtered
```

#### Test 3: Fallback Behavior
```javascript
// Test: Missing context.json
const result = loadProjectContext("/nonexistent/path");
assert(result.skillTracking !== undefined);
assert(result.skillTracking.recommended.length === 0);

// Test: Malformed defer_loading
const badConfig = { defer_loading: { enabled: "yes" } }; // Invalid type
const desc = getSkillDescription("bad-skill", badConfig);
assert(desc !== undefined); // Should fallback, not crash
```

### Integration Tests (Week 3)

#### Test 4: End-to-End Discovery
```bash
# Test: Normal discovery flow
echo "analyze auth.py" | node .claude/hooks/subagent-skill-discovery.js > output.txt
grep -q "read" output.txt || exit 1
grep -q "base-analysis" output.txt || exit 1

# Test: Deferred skill format
grep -q "Use.*Skill tool.*for full guidance" output.txt || echo "Warning: No defer format"
```

#### Test 5: Context Persistence
```bash
# Test: First recommendation
echo "modify config" | node .claude/hooks/subagent-skill-discovery.js
cat .claude/context.json | grep -q "write" || exit 1

# Test: Second prompt (should track)
echo "modify another file" | node .claude/hooks/subagent-skill-discovery.js > output2.txt
# write should be suppressed or marked as "previously recommended"
```

#### Test 6: Session Reset
```bash
# Test: Modify sessionId to old timestamp
node -e "const ctx = require('./.claude/context.json'); ctx.skillTracking.sessionId = Date.now() - 2000000; require('fs').writeFileSync('.claude/context.json', JSON.stringify(ctx, null, 2))"

# Test: Discovery should reset tracking
echo "new session test" | node .claude/hooks/subagent-skill-discovery.js
cat .claude/context.json | node -e "const ctx = require('./.claude/context.json'); console.log(ctx.skillTracking.recommended.length === 0 ? 'PASS' : 'FAIL')"
```

### Performance Tests (Week 3)

#### Test 7: Token Counting
```bash
# Test: Measure token reduction
# Baseline (no defer_loading)
echo "analyze code" | node .claude/hooks/subagent-skill-discovery.js | wc -w
# Expected: ~150-200 words = ~200-260 tokens

# With defer_loading
# Expected: ~80-120 words = ~105-160 tokens

# Verify: 30%+ reduction
```

#### Test 8: Hook Execution Time
```bash
# Benchmark: 100 runs
for i in {1..100}; do
  time echo "test" | node .claude/hooks/subagent-skill-discovery.js > /dev/null
done 2>&1 | grep real | awk '{sum+=$2} END {print "Avg:", sum/100, "ms"}'

# Expected: <20ms average
```

### Acceptance Tests (Week 4)

#### Test 9: Real Conversation Simulation
```bash
# Simulate 20-prompt conversation
for i in {1..20}; do
  echo "Prompt $i: modify file$i.py" | node .claude/hooks/subagent-skill-discovery.js
done

# Measure total tokens consumed
cat .claude/context.json
# Verify: tracking limited to 10 skills, no unbounded growth
```

#### Test 10: All Skills Still Work
```bash
# Test each skill is discoverable
skills=("write" "read" "list" "open" "fetch" "base-research" "base-analysis" "4d-evaluation" "hallucination-detection")

for skill in "${skills[@]}"; do
  result=$(echo "$skill test" | node .claude/hooks/subagent-skill-discovery.js)
  if echo "$result" | grep -q "$skill"; then
    echo "✓ $skill"
  else
    echo "✗ $skill FAILED"
  fi
done
```

---

## Success Metrics

### Quantitative Metrics

| Metric | Baseline | Target | Measurement Method |
|--------|----------|--------|-------------------|
| Discovery overhead (per prompt) | 600-650 tokens | 200-300 tokens | Token counting in test scenarios |
| Discovery overhead (subsequent) | 600-650 tokens | 150-200 tokens | Token counting with caching |
| Hook execution time | ~10ms | <20ms | Benchmark with 100 runs |
| Context.json size | 50 tokens | <150 tokens | wc -w on context.json |
| Skill discovery accuracy | 95% | 95% | Test suite pass rate |
| Token budget savings (50 prompts) | 0% | 15-20% | End-to-end conversation test |

### Qualitative Metrics

| Metric | Success Criteria |
|--------|------------------|
| Backward compatibility | All 9 existing skills work unchanged |
| Agent experience | No regression in skill usability |
| Debugging ease | Errors are clear, fallbacks work |
| Maintainability | Code is documented, testable |

### Phase 1 Exit Criteria

Before proceeding to Phase 2:

- [ ] All 10 unit tests pass
- [ ] Token overhead reduced by 30%+ (600 → 400 tokens)
- [ ] No regressions in skill discovery accuracy
- [ ] All 9 existing skills still discoverable
- [ ] context.json tracking works correctly
- [ ] Fallbacks tested and working
- [ ] Documentation updated

### Phase 2 Exit Criteria

Before proceeding to Phase 3:

- [ ] All 20 integration tests pass
- [ ] Session detection works reliably
- [ ] Recommendation suppression reduces subsequent prompt overhead by 50%
- [ ] Performance benchmarks <20ms
- [ ] Real conversation testing shows 15-20% token savings

### Phase 3 Exit Criteria

Before declaring feature complete:

- [ ] Conditional discovery reduces non-code prompt overhead by 90%
- [ ] All 30 acceptance tests pass
- [ ] Rollback plan tested and verified
- [ ] Production monitoring in place
- [ ] Documentation complete (user-facing + internal)

---

## Monitoring & Observability

### Metrics to Track (Post-Launch)

```javascript
// Add to subagent-skill-discovery.js
const metrics = {
  discoveries_total: 0,
  discoveries_skipped: 0,
  skills_recommended: {},
  cache_hits: 0,
  cache_misses: 0,
  errors: 0
};

// Log to file or console
function logMetrics() {
  writeFileSync('.maestro-discovery-metrics.json', JSON.stringify(metrics, null, 2));
}
```

### Health Checks

```bash
# Daily health check script
#!/bin/bash

# Check: Hook still works
echo "test" | node .claude/hooks/subagent-skill-discovery.js > /dev/null
if [ $? -ne 0 ]; then
  echo "ERROR: Hook execution failed"
  exit 1
fi

# Check: Context.json valid
if ! jq empty .claude/context.json 2>/dev/null; then
  echo "ERROR: context.json invalid JSON"
  exit 1
fi

# Check: Context size reasonable
size=$(wc -c < .claude/context.json)
if [ $size -gt 2048 ]; then
  echo "WARNING: context.json size >2KB, may need cleanup"
fi

echo "Health check passed"
```

---

## Future Enhancements (Post-Phase 3)

### Enhancement 1: Skill Usage Analytics

Track which skills are actually used vs just recommended:

```javascript
// Hook into Skill tool (requires Claude Code API)
// Track skill activations
context.skillTracking.used.push(skillName);
```

**Benefit:** Understand which skills are valuable, which are noise

### Enhancement 2: Machine Learning Recommendations

Use historical data to improve skill matching:

```javascript
// Train simple model on:
// - Prompt text → Skills actually used
// - File patterns → Skills helpful
// Adjust scoring weights based on learned patterns
```

**Benefit:** More accurate recommendations over time

### Enhancement 3: Skill Bundles

Group related skills for common workflows:

```json
{
  "bundles": {
    "code-analysis": ["read", "base-analysis"],
    "code-modification": ["write", "read"],
    "full-stack": ["write", "read", "base-research", "base-analysis"]
  }
}
```

**Benefit:** Reduce overhead for multi-skill tasks

### Enhancement 4: Dynamic Description Generation

Generate descriptions on-the-fly based on context:

```javascript
// Instead of static descriptions:
// "Code analysis and comprehension"

// Context-aware:
// "Analyze auth.py for patterns and issues"
```

**Benefit:** More relevant recommendations, no token waste on generic text

### Enhancement 5: Skill Prefetching

Predict likely skills and load preemptively:

```javascript
// If "modify" prompt, prefetch write skill SKILL.md
// Load in background while hook runs
// Skill tool invocation has content ready
```

**Benefit:** Faster skill activation, better UX

---

## Appendix A: Token Calculation Methodology

### Estimation Formula

```
tokens ≈ words × 1.3
```

**Rationale:**
- English text: 1 token ≈ 0.75 words
- Code/technical: 1 token ≈ 0.6-0.7 words
- JSON/structured: 1 token ≈ 0.8 words
- **Average for skill content: 1 word ≈ 1.3 tokens**

### Measurement Tools

```bash
# Word count
wc -w file.md

# Token count (using tiktoken or similar)
python -c "import tiktoken; enc = tiktoken.encoding_for_model('gpt-4'); print(len(enc.encode(open('file.md').read())))"

# Quick estimate
words=$(wc -w < file.md)
echo "$words * 1.3" | bc
```

### Validation

Compare estimates vs actual token usage:
- Use Claude API token counts
- Log actual context size
- Adjust formula if needed

---

## Appendix B: Implementation Checklist

### Week 2: Core Implementation

- [ ] Modify skill-rules.json with defer_loading flags
- [ ] Update getSkillDescription() function
- [ ] Add context.json tracking logic
- [ ] Implement findRelevantSkills() filtering
- [ ] Add updateSkillTracking() function
- [ ] Update generateSuggestions() output
- [ ] Write 10 unit tests
- [ ] Run unit tests, fix failures
- [ ] Test with 2-3 real skills
- [ ] Measure token reduction
- [ ] Document any issues found

### Week 3: Smart Caching

- [ ] Implement detectNewSession()
- [ ] Add session timeout logic
- [ ] Create recommendation suppression format
- [ ] Write 10 integration tests
- [ ] Run integration tests, fix failures
- [ ] Test real conversation flows (20+ prompts)
- [ ] Measure cumulative token savings
- [ ] Benchmark hook performance
- [ ] Verify context.json stays bounded

### Week 4: Conditional Discovery

- [ ] Implement shouldRunDiscovery() heuristic
- [ ] Add pre-check filter
- [ ] Define fallback conditions
- [ ] Write 10 acceptance tests
- [ ] Run full test suite (30 tests)
- [ ] Test all 9 existing skills
- [ ] Measure end-to-end impact
- [ ] Validate rollback plan
- [ ] Update user documentation
- [ ] Create monitoring dashboard

---

## Document Metadata

**Author:** Autonomous agent (Task 1.2)
**Date:** 2025-11-25
**Status:** ✅ DESIGN COMPLETE
**Next Steps:**
- Create test skills (Task 1.3)
- Establish baseline metrics (Task 1.4)
- Complete risk assessment (embedded in this doc)
**Version:** 1.0

---

## Change Log

| Date | Version | Changes |
|------|---------|---------|
| 2025-11-25 | 1.0 | Initial design document created |

