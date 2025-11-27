# Token Measurement Methodology

**Document Version:** 1.0
**Created:** 2025-11-27
**Purpose:** Establish clear, reproducible standards for measuring defer_loading token reduction across three implementation phases

---

## Overview

This document defines the token measurement methodology for the Maestro defer_loading optimization project. It clarifies the three-phase testing framework, establishes baseline definitions, and provides step-by-step reproducibility instructions.

**Related Documents:**
- `baseline-metrics.md` - Phase 0 measurements (pre-defer_loading)
- `phase1-metrics.md` - Phase 1 measurements (defer_loading only)
- `phase2-validation-report.md` - Phase 2 measurements (defer_loading + smart caching)
- `defer-loading-design.md` - Implementation design specification

---

## Three-Phase Framework

### Phase 0: Pre-defer_loading Baseline

**Implementation State:** Original system without any defer_loading optimization

**Behavior:**
- Full `skill-rules.json` (146 lines, ~400 tokens) loaded on every prompt
- Verbose skill descriptions output on every recommendation
- No skill tracking or caching
- No session awareness

**Discovery Overhead Components:**
- skill-rules.json loading: ~400 tokens (80-84% of total)
- Recommendation generation: 75-131 tokens (16-20%)
- Context.json loading: ~20 tokens (3%)
- **Total: 475-531 tokens per prompt (avg: 494 tokens)**

**Measurement Date:** 2025-11-25
**Source:** `docs/baseline-metrics.md`

**Key Characteristic:** Constant overhead on EVERY prompt, regardless of:
- Number of prompts in conversation
- Whether same skills recommended repeatedly
- Session length or context

---

### Phase 1: defer_loading Only

**Implementation State:** Core defer_loading implemented, no smart caching

**Behavior:**
- skill-rules.json NOT loaded (eliminated 400-token overhead)
- Lightweight skill references output (description + path + usage only)
- Skill tracking structure added to context.json but NOT filtering recommendations
- All skills recommended every time they match (no suppression)

**Discovery Overhead Components:**
- Skill references: 30-40 words per skill (~40-52 tokens per skill)
- Header/footer text: ~30 tokens
- **Total: 92-158 tokens per prompt (avg: 111 tokens)**

**Measurement Date:** 2025-11-25
**Source:** `docs/phase1-metrics.md`

**Token Reduction vs Phase 0:** 77.5% (494 → 111 tokens average)

**Key Characteristic:** Reduced overhead per prompt, but still CONSTANT - same recommendations output every time skill patterns match.

---

### Phase 2: defer_loading + Smart Caching

**Implementation State:** defer_loading + skill tracking with recommendation suppression

**Behavior:**
- skill-rules.json NOT loaded (same as Phase 1)
- Lightweight skill references (same as Phase 1)
- **NEW:** Skill tracking ACTIVELY filters recommendations
- Previously-recommended skills skipped on subsequent prompts
- Context.json accumulates recommended skills across session

**Discovery Overhead:**
- **First prompt with new skill:** 30-40 words per skill (~40-52 tokens per skill)
- **Subsequent prompts (cached skills):** 0 words (0 tokens) when all skills cached
- **Session average:** Depends on cache hit rate and session length

**Measurement Date:** 2025-11-27
**Source:** `docs/phase2-validation-report.md`

**Key Characteristic:** DECREASING overhead across session - first prompts incur cost, subsequent prompts with same skills free.

---

## Understanding "Baseline" in Each Comparison

### Phase 0 → Phase 1 Comparison

**Baseline:** Phase 0 (pre-defer_loading system)

**Comparison Type:** Single-prompt average
**Methodology:**
- Measure 5 test scenarios in Phase 0 (494 tokens average)
- Measure same 5 test scenarios in Phase 1 (111 tokens average)
- Calculate reduction: (494 - 111) / 494 = **77.5% reduction**

**What This Measures:** Per-prompt overhead reduction from eliminating skill-rules.json loading

**Apples-to-Apples:** YES - Both phases run identical test scenarios with same prompts, measuring single-prompt overhead.

---

### Phase 1 → Phase 2 Comparison

**Baseline:** Simulated Phase 1 behavior (defer_loading without caching)

**Comparison Type:** Multi-prompt cumulative
**Methodology:**
- **Baseline simulation:** Reset context.json BEFORE EACH prompt, forcing full recommendations every time (simulates Phase 1 behavior: no caching)
- **Phase 2 test:** Reset context.json ONCE at start, let caching accumulate across all 25 prompts
- Compare total word counts across entire 25-prompt sequence
- Calculate reduction: (2,562 - 666) / 2,562 = **74.0% reduction**

**What This Measures:** Cumulative reduction from smart caching across a 25-prompt session

**Apples-to-Apples:** YES - Both tests use identical 25 prompts, but baseline forces full output (no caching) while Phase 2 enables caching.

**Critical Note:** The "baseline" in Phase 2 testing is NOT Phase 0 - it's a simulated "Phase 1 without caching benefit" to isolate the caching impact.

---

### Phase 0 → Phase 2 Total Impact

**Baseline:** Phase 0 (original system)

**Comparison Type:** Multi-prompt cumulative projection

**Projected Calculation:**
```
Phase 0 total (25 prompts):  25 × 494 = 12,350 tokens
Phase 2 actual (25 prompts):              666 tokens
Total reduction:             12,350 - 666 = 11,684 tokens
Percentage reduction:        11,684 / 12,350 = 94.6% reduction
```

**What This Measures:** Total end-to-end improvement from both defer_loading AND smart caching combined

**Note:** This is a projection, not a direct measurement, because Phase 0 and Phase 2 use different measurement methodologies (single-prompt average vs multi-prompt cumulative).

---

## Measurement Standards

### Token Estimation Formula

**Primary Method:** Word-to-token conversion using 1.3 multiplier

```
tokens = word_count × 1.3
```

**Rationale:**
- GPT tokenizers average ~1.3 tokens per English word
- Provides consistent estimation across all measurements
- More practical than actual API token counting for testing

**Validation:**
- Spot-check with actual API token counts periodically
- Acceptable variance: ±10%
- Re-calibrate multiplier if systematic deviation detected

**Example:**
```bash
# Count words in hook output
echo "analyze auth.py for bugs" | node .claude/hooks/subagent-skill-discovery.js | wc -w
# Output: 101 words

# Calculate tokens
tokens=$((101 * 13 / 10))
# Result: 131 tokens
```

---

### Actual Token Counting

**When to Use:** Validation of estimation formula, production monitoring

**Method:** Use OpenAI tiktoken library or Claude API token counts

```python
import tiktoken

enc = tiktoken.encoding_for_model("gpt-4")
text = "Skill recommendation output here..."
token_count = len(enc.encode(text))
```

**Frequency:** Validate estimation every 10 tests, or when variance exceeds 10%

---

### Word-to-Token Ratio Validation

**Acceptable Range:** 1.2 - 1.4 tokens per word

**Validation Process:**
1. Take 10 sample outputs from hook
2. Count words: `wc -w`
3. Count actual tokens: `tiktoken`
4. Calculate average ratio: `sum(tokens) / sum(words)`
5. If ratio < 1.2 or > 1.4, investigate text characteristics

**Common Causes of Variance:**
- Technical terms (higher ratio: 1.4-1.6)
- JSON/YAML content (higher ratio: 1.5-2.0)
- Natural prose (lower ratio: 1.1-1.3)

---

## Single-Prompt Testing

### Methodology

**Use Case:** Measure per-prompt overhead reduction (Phase 0 → Phase 1)

**Process:**
1. Define test scenarios (5+ distinct prompt types)
2. For each scenario:
   - Reset any state (context.json if applicable)
   - Execute prompt through hook
   - Measure output word count
   - Apply token estimation formula
3. Calculate average across all scenarios
4. Compare baseline vs optimized

**Example Test Scenarios:**
1. Code analysis request: "analyze auth.py for bugs"
2. File modification request: "modify config.yaml"
3. Research/search request: "find all validation functions"
4. Small skill test: "test small skill"
5. Large skill test: "test large skill"

---

### Comparison Framework

**Baseline Measurement (Phase 0):**
```bash
# Run each scenario independently, reset state between tests
for scenario in "${scenarios[@]}"; do
  # Reset if needed
  echo "$scenario" | node .claude/hooks/subagent-skill-discovery.js | wc -w
done

# Calculate average
```

**Optimized Measurement (Phase 1):**
```bash
# Same process, same scenarios, with defer_loading enabled
for scenario in "${scenarios[@]}"; do
  echo "$scenario" | node .claude/hooks/subagent-skill-discovery.js | wc -w
done

# Calculate average
```

**Comparison Calculation:**
```
Reduction = (Baseline_avg - Optimized_avg) / Baseline_avg × 100%
```

**Expected Result (Phase 0 → Phase 1):** 70-80% reduction

---

## Multi-Prompt Testing

### Methodology

**Use Case:** Measure cumulative reduction from smart caching (Phase 1 → Phase 2)

**Process:**
1. Create comprehensive prompt set (20-30 prompts covering diverse tasks)
2. **Baseline simulation:**
   - Reset context.json BEFORE EACH prompt
   - Execute all prompts sequentially
   - Sum total word count across all outputs
3. **Optimized test:**
   - Reset context.json ONCE at start
   - Execute all prompts sequentially (same order)
   - Sum total word count across all outputs
4. Compare cumulative totals

**Critical:** Both baseline and optimized MUST use identical prompts in identical order.

---

### Cumulative Reduction Calculation

**Formula:**
```
Total_Words_Baseline = sum(word_count_i) for all prompts with reset before each
Total_Words_Optimized = sum(word_count_i) for all prompts with single reset

Reduction = (Total_Words_Baseline - Total_Words_Optimized) / Total_Words_Baseline × 100%
```

**Token Conversion:**
```
Total_Tokens_Baseline = Total_Words_Baseline × 1.3
Total_Tokens_Optimized = Total_Words_Optimized × 1.3
```

**Example (Phase 2):**
```
Baseline:  1,971 words = 2,562 tokens
Optimized:   513 words =   666 tokens
Reduction: 1,458 words = 1,896 tokens (74.0%)
```

---

### Session Simulation

**Realistic Session Characteristics:**
- 20-50 prompts total
- Mix of task types (code analysis, file operations, research)
- Repeated skill patterns (simulate real workflow)
- Some prompts introduce new skills, others reuse existing

**Prompt Set Design:**
```
Prompts 1-5:   Introduce core skills (read, write, base-analysis)
Prompts 6-15:  Reuse core skills in various combinations
Prompts 16-20: Introduce specialized skills (fetch, test-skill-a)
Prompts 21-25: Mix of core and specialized reuse
```

**Expected Cache Behavior:**
- First 5 prompts: Full output (establishing baseline)
- Prompts 6-15: High cache hit rate (50-80% zero-output)
- Prompts 16-20: Some full output (new skills), some cached
- Prompts 21-25: Mostly cached (90%+ zero-output)

---

## Reproducibility Guide

### Environment Setup

#### Prerequisites
```bash
# Verify environment
cd /Users/awesome/dev/devtest/Maestro
node --version  # Must be v18+
git status      # Verify on correct branch
```

#### Install Dependencies
```bash
cd .claude/hooks
npm install  # Installs minimatch and other dependencies
npm run verify  # Validates hook functionality
```

#### Verify Hook State
```bash
# Check hook version/implementation
head -20 .claude/hooks/subagent-skill-discovery.js

# Verify skill-rules.json
cat .claude/skills/skill-rules.json | jq '.skills | keys'

# Expected: 11 skills registered
```

---

### Test Execution

#### Phase 0 Baseline Measurement

**Configuration:**
- Use unmodified system (before defer_loading implementation)
- All skills have verbose descriptions in skill-rules.json
- No defer_loading flags enabled

**Commands:**
```bash
# Test Scenario 1
echo "analyze auth.py for bugs" | node .claude/hooks/subagent-skill-discovery.js | wc -w
# Expected: ~101 words

# Test Scenario 2
echo "modify config.yaml" | node .claude/hooks/subagent-skill-discovery.js | wc -w
# Expected: ~64 words

# Test Scenario 3
echo "find all validation functions" | node .claude/hooks/subagent-skill-discovery.js | wc -w
# Expected: ~58 words

# Test Scenario 4
echo "test small skill" | node .claude/hooks/subagent-skill-discovery.js | wc -w
# Expected: ~65 words

# Test Scenario 5
echo "test large skill" | node .claude/hooks/subagent-skill-discovery.js | wc -w
# Expected: ~65 words

# Calculate average
echo "scale=2; (101 + 64 + 58 + 65 + 65) / 5" | bc
# Expected: ~70.6 words output

# Add skill-rules.json overhead
# 70.6 × 1.3 = 92 tokens (output)
# 400 tokens (skill-rules.json)
# Total: ~492 tokens per prompt
```

---

#### Phase 1 Measurement

**Configuration:**
- defer_loading enabled in skill-rules.json for all skills
- Hook implements defer_loading logic
- Context.json tracks recommendations but does NOT filter

**Commands:**
```bash
# Same test scenarios as Phase 0
echo "analyze auth.py for bugs" | node .claude/hooks/subagent-skill-discovery.js | wc -w
# Expected: ~122 words (158 tokens)

echo "modify config.yaml" | node .claude/hooks/subagent-skill-discovery.js | wc -w
# Expected: ~71 words (92 tokens)

echo "find all validation functions" | node .claude/hooks/subagent-skill-discovery.js | wc -w
# Expected: ~65 words (84 tokens)

echo "test small skill" | node .claude/hooks/subagent-skill-discovery.js | wc -w
# Expected: ~85 words (110 tokens)

echo "test large skill" | node .claude/hooks/subagent-skill-discovery.js | wc -w
# Expected: ~85 words (110 tokens)

# Calculate average
echo "scale=2; (122 + 71 + 65 + 85 + 85) / 5" | bc
# Expected: ~85.6 words = 111 tokens per prompt

# Calculate reduction
echo "scale=1; (492 - 111) / 492 * 100" | bc
# Expected: ~77.4% reduction
```

---

#### Phase 2 Baseline Simulation

**Configuration:**
- Same as Phase 1 (defer_loading enabled)
- Reset context.json BEFORE EACH prompt
- Forces full recommendations every time (simulates no caching)

**Commands:**
```bash
# Create test script
cat > test-baseline.sh << 'EOF'
#!/bin/bash
total=0
while IFS= read -r prompt; do
  # Reset context before each prompt
  echo '{"version":"1.0","skillTracking":{"recommended":[],"used":[],"sessionStart":"'$(date -u +%Y-%m-%dT%H:%M:%S.000Z)'"}}' > .claude/context.json

  # Run hook and count words
  words=$(echo "$prompt" | node .claude/hooks/subagent-skill-discovery.js 2>/dev/null | wc -w | xargs)
  total=$((total + words))
  echo "Prompt: $words words"
done < docs/25-prompts.txt

echo "BASELINE TOTAL: $total words"
echo "BASELINE TOKENS: $((total * 13 / 10))"
EOF

chmod +x test-baseline.sh
./test-baseline.sh

# Expected output:
# BASELINE TOTAL: 1971 words
# BASELINE TOKENS: 2562
```

---

#### Phase 2 Optimized Test

**Configuration:**
- defer_loading enabled (same as Phase 1)
- Reset context.json ONCE at start
- Let caching accumulate across all prompts

**Commands:**
```bash
# Create test script
cat > test-phase2.sh << 'EOF'
#!/bin/bash

# Reset context ONCE at start
echo '{"version":"1.0","skillTracking":{"recommended":[],"used":[],"sessionStart":"'$(date -u +%Y-%m-%dT%H:%M:%S.000Z)'"}}' > .claude/context.json

total=0
while IFS= read -r prompt; do
  # Run hook WITHOUT resetting context
  words=$(echo "$prompt" | node .claude/hooks/subagent-skill-discovery.js 2>/dev/null | wc -w | xargs)
  total=$((total + words))
  echo "Prompt: $words words"
done < docs/25-prompts.txt

echo "PHASE 2 TOTAL: $total words"
echo "PHASE 2 TOKENS: $((total * 13 / 10))"
EOF

chmod +x test-phase2.sh
./test-phase2.sh

# Expected output:
# PHASE 2 TOTAL: 513 words
# PHASE 2 TOKENS: 666
```

---

### Data Collection

#### Recording Measurements

**Spreadsheet Format:**

| Phase | Test Type | Scenario | Word Count | Token Estimate | Notes |
|-------|-----------|----------|------------|----------------|-------|
| Phase 0 | Single-prompt | Scenario 1 | 101 | 131 | + 400 skill-rules |
| Phase 0 | Single-prompt | Scenario 2 | 64 | 83 | + 400 skill-rules |
| ... | ... | ... | ... | ... | ... |
| Phase 1 | Single-prompt | Scenario 1 | 122 | 158 | No skill-rules |
| ... | ... | ... | ... | ... | ... |
| Phase 2 | Multi-prompt | Cumulative (25) | 513 | 666 | With caching |

**File Format:**
```csv
phase,test_type,scenario,word_count,token_estimate,notes
phase0,single,scenario1,101,131,+400 skill-rules
phase0,single,scenario2,64,83,+400 skill-rules
...
```

---

#### Context Inspection

**Check Context State:**
```bash
# View current context
cat .claude/context.json | jq '.'

# Check recommended skills
cat .claude/context.json | jq '.skillTracking.recommended'

# Check session start time
cat .claude/context.json | jq '.skillTracking.sessionStart'

# Verify tracking array size
cat .claude/context.json | jq '.skillTracking.recommended | length'
```

**Expected Context After 25 Prompts:**
```json
{
  "version": "1.0",
  "skillTracking": {
    "recommended": [
      "4d-evaluation",
      "hallucination-detection",
      "read",
      "base-analysis",
      "base-research",
      "write",
      "open",
      "list",
      "fetch",
      "test-skill-a",
      "test-skill-b"
    ],
    "used": [],
    "sessionStart": "2025-11-27T12:00:00.000Z"
  },
  "lastUpdated": "2025-11-27T12:30:00.000Z"
}
```

---

### Analysis Methods

#### Calculate Per-Prompt Average

**Formula:**
```bash
# Single-prompt testing
total=0
count=0
for scenario in "${scenarios[@]}"; do
  words=$(echo "$scenario" | node .claude/hooks/subagent-skill-discovery.js | wc -w | xargs)
  total=$((total + words))
  count=$((count + 1))
done

average=$((total / count))
tokens=$((average * 13 / 10))
echo "Average: $average words = $tokens tokens per prompt"
```

---

#### Calculate Cumulative Total

**Formula:**
```bash
# Multi-prompt testing
total_words=0
prompt_count=0

while IFS= read -r prompt; do
  words=$(echo "$prompt" | node .claude/hooks/subagent-skill-discovery.js | wc -w | xargs)
  total_words=$((total_words + words))
  prompt_count=$((prompt_count + 1))
done < docs/25-prompts.txt

total_tokens=$((total_words * 13 / 10))
echo "Total: $total_words words = $total_tokens tokens across $prompt_count prompts"
```

---

#### Calculate Reduction Percentage

**Formula:**
```bash
baseline_tokens=2562
optimized_tokens=666

reduction=$((baseline_tokens - optimized_tokens))
percentage=$(echo "scale=1; $reduction / $baseline_tokens * 100" | bc)

echo "Reduction: $reduction tokens ($percentage%)"
```

---

#### Cache Hit Rate Analysis

**Formula:**
```bash
# Count zero-output prompts
zero_output_count=$(grep "^0$" prompt-outputs.txt | wc -l | xargs)
total_prompts=$(wc -l < prompt-outputs.txt | xargs)

hit_rate=$(echo "scale=1; $zero_output_count / $total_prompts * 100" | bc)
echo "Cache hit rate: $hit_rate% ($zero_output_count / $total_prompts)"
```

**Example Analysis:**
```
Prompts with 0 words output: 9 / 25 = 36% (zero-output prompts)
Prompts with <50 words output: 13 / 25 = 52% (high cache efficiency)
Prompts with full output: 3 / 25 = 12% (new skills introduced)
```

---

## Results Interpretation

### Phase 0 → Phase 1 Comparison

**What It Shows:** Per-prompt overhead reduction from eliminating skill-rules.json loading

**Typical Results:**
- Phase 0: 494 tokens per prompt (average)
- Phase 1: 111 tokens per prompt (average)
- **Reduction: 383 tokens (77.5%)**

**Interpretation:**
- ✅ **Target achieved if:** Reduction ≥ 30%
- 🎯 **Excellent if:** Reduction ≥ 70%
- ⚠️ **Needs investigation if:** Reduction < 30%

**Key Insight:** This measures the BASE optimization - how much we save PER prompt by not loading skill-rules.json. This reduction applies to EVERY prompt.

---

### Phase 1 → Phase 2 Comparison

**What It Shows:** Additional cumulative reduction from smart caching across a session

**Typical Results (25-prompt session):**
- Simulated Phase 1: 2,562 tokens (25 × 111, no caching benefit)
- Phase 2: 666 tokens (with caching)
- **Reduction: 1,896 tokens (74.0%)**

**Interpretation:**
- ✅ **Target achieved if:** Reduction ≥ 40%
- 🎯 **Excellent if:** Reduction ≥ 70%
- ⚠️ **Needs investigation if:** Reduction < 40%

**Key Insight:** This measures the ADDITIONAL optimization from caching - how much we save by NOT re-recommending already-cached skills. This reduction MULTIPLIES with session length.

---

### Phase 0 → Phase 2 Total Impact

**What It Shows:** End-to-end improvement from BOTH defer_loading AND smart caching

**Calculation (Projected):**
```
Phase 0 total (25 prompts):  25 × 494 = 12,350 tokens
Phase 2 actual (25 prompts):              666 tokens
Total reduction:             12,350 - 666 = 11,684 tokens
Percentage reduction:        11,684 / 12,350 = 94.6%
```

**Interpretation:**
- ✅ **Target achieved if:** Reduction ≥ 60%
- 🎯 **Excellent if:** Reduction ≥ 90%
- ⚠️ **Needs investigation if:** Reduction < 60%

**Key Insight:** This shows the TOTAL IMPACT on a real user session - combining base optimization (Phase 1) with caching benefits (Phase 2). Most meaningful metric for user experience.

**Caveat:** This is a projection based on different measurement methodologies. Phase 0 baseline (494 avg) extrapolated to 25 prompts, compared to Phase 2 actual cumulative measurement (666 tokens).

---

### Understanding the Different "77.5%" and "74.0%" Numbers

**Common Confusion:** Both Phase 1 and Phase 2 show ~75% reduction - why?

**Explanation:**

**Phase 1: 77.5% reduction**
- **Baseline:** Phase 0 single-prompt average (494 tokens)
- **Optimized:** Phase 1 single-prompt average (111 tokens)
- **What's measured:** Per-prompt overhead elimination
- **Formula:** (494 - 111) / 494 = 77.5%

**Phase 2: 74.0% reduction**
- **Baseline:** Simulated Phase 1 cumulative with no caching (2,562 tokens)
- **Optimized:** Phase 2 cumulative with caching (666 tokens)
- **What's measured:** Session-level caching benefit
- **Formula:** (2,562 - 666) / 2,562 = 74.0%

**Why Similar Percentages?**

They measure DIFFERENT things:
- Phase 1 reduction is per-prompt, constant across all prompts
- Phase 2 reduction is cumulative, compounds with caching
- They happen to be numerically similar (~75%) but represent distinct optimizations
- Phase 1 saves ~380 tokens/prompt by eliminating overhead
- Phase 2 saves ~1,900 tokens/session by eliminating repetition

**The percentages are coincidentally similar, but the absolute token savings are very different:**
- Phase 1: 383 tokens saved per prompt (constant)
- Phase 2: 1,896 tokens saved per 25-prompt session (cumulative)

---

## Common Measurement Pitfalls

### Pitfall 1: Inconsistent Context State

**Problem:** Comparing measurements with different context.json states

**Example:**
```bash
# WRONG: Baseline has stale context, optimized has fresh context
# Baseline
echo "test" | node .claude/hooks/subagent-skill-discovery.js | wc -w

# Phase 2 (different context state!)
echo '{}' > .claude/context.json
echo "test" | node .claude/hooks/subagent-skill-discovery.js | wc -w
```

**Solution:** Always reset context.json to identical state before comparable measurements

```bash
# CORRECT: Both tests start with same state
reset_context() {
  echo '{"version":"1.0","skillTracking":{"recommended":[],"used":[],"sessionStart":"'$(date -u +%Y-%m-%dT%H:%M:%S.000Z)'"}}' > .claude/context.json
}

# Baseline
reset_context
echo "test" | node .claude/hooks/subagent-skill-discovery.js | wc -w

# Phase 2
reset_context
echo "test" | node .claude/hooks/subagent-skill-discovery.js | wc -w
```

---

### Pitfall 2: Different Prompt Order

**Problem:** Comparing multi-prompt tests with different prompt sequences

**Why It Matters:** Caching effectiveness depends on skill introduction order

**Example:**
```bash
# WRONG: Different prompts or order
# Baseline
echo "analyze code" | ...
echo "modify file" | ...

# Phase 2 (different prompts!)
echo "read file" | ...
echo "write file" | ...
```

**Solution:** Use identical prompt set in identical order

```bash
# CORRECT: Same prompts, same order, stored in file
cat > prompts.txt << EOF
analyze code
modify file
read file
EOF

# Both tests use same prompts.txt file
```

---

### Pitfall 3: Including Setup Overhead

**Problem:** Including one-time setup costs in per-prompt measurements

**Example:**
```bash
# WRONG: Includes hook startup time
time echo "test" | node .claude/hooks/subagent-skill-discovery.js
# Measures: Node.js startup + module loading + execution
```

**Solution:** Use word count only (excludes execution time), or average multiple runs

```bash
# CORRECT: Measure output tokens only
echo "test" | node .claude/hooks/subagent-skill-discovery.js | wc -w

# Or for performance testing: average multiple runs
for i in {1..10}; do
  time echo "test" | node .claude/hooks/subagent-skill-discovery.js > /dev/null
done
```

---

### Pitfall 4: Forgetting skill-rules.json Overhead

**Problem:** Only counting recommendation output, ignoring skill-rules.json loading in Phase 0

**Example:**
```bash
# WRONG: Only counts visible output
echo "test" | node .claude/hooks/subagent-skill-discovery.js | wc -w
# Result: 101 words = 131 tokens

# Missing: skill-rules.json (~400 tokens) loaded in Phase 0!
```

**Solution:** Always add skill-rules.json overhead to Phase 0 measurements

```bash
# CORRECT: Add overhead
output_tokens=131
skillrules_tokens=400
total_phase0_tokens=$((output_tokens + skillrules_tokens))
# Result: 531 tokens
```

---

### Pitfall 5: Mixing Estimation and Actual Counts

**Problem:** Comparing estimated tokens (×1.3) with actual API token counts

**Example:**
```bash
# WRONG: Baseline uses estimation, optimized uses actual
baseline_tokens=$((words * 13 / 10))  # Estimated
optimized_tokens=$(tiktoken_count)     # Actual

# Not comparable!
```

**Solution:** Use same method for both baseline and optimized measurements

```bash
# CORRECT: Both use estimation
baseline_tokens=$((baseline_words * 13 / 10))
optimized_tokens=$((optimized_words * 13 / 10))

# Or both use actual
baseline_tokens=$(tiktoken_count baseline_output)
optimized_tokens=$(tiktoken_count optimized_output)
```

---

### Pitfall 6: Confusing Average and Cumulative

**Problem:** Comparing per-prompt average with multi-prompt cumulative

**Example:**
```bash
# WRONG: Comparing different measurement types
phase1_average=111  # Per-prompt average
phase2_total=666    # 25-prompt cumulative

reduction=$((phase1_average - phase2_total))
# This makes no sense!
```

**Solution:** Compare like with like

```bash
# CORRECT: Compare averages
phase1_average=111
phase2_average=$((666 / 25))  # 26.6 tokens per prompt
reduction=$((phase1_average - phase2_average))

# Or compare cumulatives
phase1_total=$((111 * 25))  # 2775 tokens
phase2_total=666
reduction=$((phase1_total - phase2_total))
```

---

## Appendices

### Appendix A: Historical Measurements

#### Phase 0 Baseline (2025-11-25)

**Test Scenarios:**

| Scenario | Description | Output Words | Tokens (×1.3) | +skill-rules | Total |
|----------|-------------|--------------|---------------|--------------|-------|
| 1 | "analyze auth.py for bugs" | 101 | 131 | 400 | 531 |
| 2 | "modify config.yaml" | 64 | 83 | 400 | 483 |
| 3 | "find all validation functions" | 58 | 75 | 400 | 475 |
| 4 | "test small skill" | 65 | 85 | 400 | 485 |
| 5 | "test large skill" | 65 | 85 | 400 | 485 |
| **Average** | - | **70.6** | **91.8** | **400** | **491.8** |

**Source:** `docs/baseline-metrics.md`

---

#### Phase 1 Measurements (2025-11-25)

**Test Scenarios (same prompts as Phase 0):**

| Scenario | Description | Output Words | Tokens (×1.3) | Reduction vs Phase 0 |
|----------|-------------|--------------|---------------|----------------------|
| 1 | "analyze auth.py for bugs" | 122 | 158 | 373 tokens (70.2%) |
| 2 | "modify config.yaml" | 71 | 92 | 391 tokens (80.9%) |
| 3 | "find all validation functions" | 65 | 84 | 391 tokens (82.3%) |
| 4 | "test small skill" | 85 | 110 | 375 tokens (77.3%) |
| 5 | "test large skill" | 85 | 110 | 375 tokens (77.3%) |
| **Average** | - | **85.6** | **111** | **383 tokens (77.5%)** |

**Source:** `docs/phase1-metrics.md`

---

#### Phase 2 Measurements (2025-11-27)

**25-Prompt Session:**

| Prompt # | Description | Baseline Words | Phase 2 Words | Skills Recommended |
|----------|-------------|----------------|---------------|-------------------|
| 1 | Analyze hook | 112 | 112 | 6 skills (first time) |
| 2 | Read hook | 90 | 35 | open (new) |
| 3 | Compare hooks | 55 | 55 | base-analysis reuse |
| 4 | Open skill-rules | 90 | 48 | partial match |
| 5 | List markdown | 55 | 0 | (cached) |
| 6 | Analyze file-writer | 66 | 0 | (cached) |
| 7 | Review base-research | 89 | 0 | (cached) |
| 8 | Examine 4d-evaluation | 77 | 30 | compact reuse |
| 9 | Analyze list.md | 90 | 0 | (cached) |
| 10 | Read open.md | 90 | 33 | open reuse |
| ... | ... | ... | ... | ... |
| 25 | List agent files | 77 | 37 | list (new) |
| **Total** | - | **1,971** | **513** | **11 unique skills** |
| **Tokens** | - | **2,562** | **666** | **74.0% reduction** |

**Source:** `docs/phase2-validation-report.md`

**Cache Behavior:**
- Zero-output prompts: 9 / 25 (36%)
- Cache hit rate: 13 / 25 (52%)
- Average per prompt: 26.6 tokens (vs 111 tokens in Phase 1)

---

### Appendix B: Test Artifacts

#### Test Files

**Prompt Set:**
- Location: `docs/25-prompts.txt`
- Format: One prompt per line
- Count: 25 prompts
- Coverage: Code analysis, file operations, research, documentation

**Test Scripts:**
- `test-remaining-baseline.sh` - Simulates Phase 1 behavior (reset before each)
- `test-remaining-phase2.sh` - Tests Phase 2 with caching

**Sample Prompts:**
```
Analyze the subagent-skill-discovery.js hook
Read the maestro-agent-suggester.js hook
Compare the work-tracker.sh hook with the other hooks
Open the skill-rules.json and show defer_loading structure
List all markdown files in .claude/skills directory
...
```

---

#### Context States

**Initial Context (fresh session):**
```json
{
  "version": "1.0",
  "skillTracking": {
    "recommended": [],
    "used": [],
    "sessionStart": "2025-11-27T12:00:00.000Z"
  }
}
```

**Context After Prompt 1 (6 skills recommended):**
```json
{
  "version": "1.0",
  "skillTracking": {
    "recommended": [
      "4d-evaluation",
      "hallucination-detection",
      "read",
      "base-analysis",
      "base-research",
      "write"
    ],
    "used": [],
    "sessionStart": "2025-11-27T12:00:00.000Z"
  },
  "lastUpdated": "2025-11-27T12:00:15.000Z"
}
```

**Context After 25 Prompts (11 skills accumulated):**
```json
{
  "version": "1.0",
  "skillTracking": {
    "recommended": [
      "4d-evaluation",
      "hallucination-detection",
      "read",
      "base-analysis",
      "base-research",
      "write",
      "open",
      "list",
      "fetch",
      "test-skill-a",
      "test-skill-b"
    ],
    "used": [],
    "sessionStart": "2025-11-27T12:00:00.000Z"
  },
  "lastUpdated": "2025-11-27T12:30:00.000Z"
}
```

---

### Appendix C: Quick Reference Commands

#### Reset Context
```bash
echo '{"version":"1.0","skillTracking":{"recommended":[],"used":[],"sessionStart":"'$(date -u +%Y-%m-%dT%H:%M:%S.000Z)'"}}' > .claude/context.json
```

#### Measure Single Prompt
```bash
echo "your prompt here" | node .claude/hooks/subagent-skill-discovery.js | wc -w
```

#### Calculate Tokens
```bash
words=123
tokens=$((words * 13 / 10))
echo "$tokens tokens"
```

#### Run Baseline Simulation (reset before each prompt)
```bash
while IFS= read -r prompt; do
  echo '{"version":"1.0","skillTracking":{"recommended":[],"used":[]}}' > .claude/context.json
  echo "$prompt" | node .claude/hooks/subagent-skill-discovery.js | wc -w
done < prompts.txt
```

#### Run Phase 2 Test (reset once, accumulate)
```bash
echo '{"version":"1.0","skillTracking":{"recommended":[],"used":[]}}' > .claude/context.json
while IFS= read -r prompt; do
  echo "$prompt" | node .claude/hooks/subagent-skill-discovery.js | wc -w
done < prompts.txt
```

#### Check Context State
```bash
cat .claude/context.json | jq '.skillTracking.recommended'
```

#### Validate JSON
```bash
cat .claude/skills/skill-rules.json | jq '.' > /dev/null && echo "Valid JSON"
```

---

## Document Maintenance

**Update Frequency:** After each phase measurement, or when methodology changes

**Version History:**
- v1.0 (2025-11-27): Initial comprehensive methodology document

**Reviewers:** Engineering team, measurement validators

**Related Standards:**
- `defer-loading-design.md` - Implementation design
- `baseline-metrics.md` - Phase 0 measurements
- `phase1-metrics.md` - Phase 1 measurements
- `phase2-validation-report.md` - Phase 2 measurements

---

**End of Token Measurement Methodology**
