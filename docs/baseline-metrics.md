# Baseline Performance Metrics

## Document Overview

This document establishes baseline performance metrics for the current Maestro skill system before defer_loading implementation. All measurements are taken 2025-11-25 with the unmodified system.

**Purpose:** Provide quantitative baseline for comparison after defer_loading implementation (Week 1, Task 1.4).

---

## Executive Summary

### Key Findings

**Discovery Overhead (per prompt):**
- Skill-rules.json: 122 lines (~400 tokens estimated)
- Recommendation output: 58-101 words (75-131 tokens estimated)
- **Total overhead: 475-531 tokens per prompt**

**Skill Content (on activation):**
- Test-skill-a SKILL.md: 709 words = **922 tokens**
- Test-skill-b SKILL.md: 1,550 words = **2,015 tokens**
- Production write skill: 1,453 words = **1,889 tokens**
- Production read skill: 1,513 words = **1,967 tokens**

**Asset Content (on load):**
- Test-skill-a asset: 566 words = **736 tokens**
- Test-skill-b asset: 1,202 words = **1,563 tokens**

**Cumulative Impact (50 prompts):**
- Discovery overhead alone: 50 × 500 = **25,000 tokens**
- Percentage of 200K budget: **12.5%**

---

## Test Environment

### System Configuration

```
Date: 2025-11-25
Location: /Users/awesome/dev/devtest/Maestro
Branch: master (after test skills added)
Node.js: v18+ (requirement)
Hook: .claude/hooks/subagent-skill-discovery.js (255 lines, unmodified)
Configuration: .claude/skills/skill-rules.json (146 lines, with test skills)
```

### Skills Registered

| Skill | Type | Priority | Lines | Words (SKILL.md) |
|-------|------|----------|-------|------------------|
| write | domain | high | 428 | 1,453 |
| read | domain | high | 461 | 1,513 |
| list | domain | medium | 275 | 1,303 |
| open | domain | medium | 360 | 1,531 |
| fetch | domain | medium | 389 | 1,245 |
| base-research | domain | high | 318 | 967 |
| base-analysis | domain | high | 334 | 1,149 |
| 4d-evaluation | guardrail | critical | 369 | 1,198 |
| hallucination-detection | guardrail | critical | 49 | 498 |
| test-skill-a | domain | low | 205 | 709 |
| test-skill-b | domain | medium | 437 | 1,550 |

**Total:** 11 skills registered

---

## Baseline Measurements

### Test Scenario 1: Code Analysis Request

**Prompt:** "analyze auth.py for bugs"

**Expected Skills:** read, base-analysis

**Measured Output:**
```bash
$ echo "analyze auth.py for bugs" | node .claude/hooks/subagent-skill-discovery.js | wc -w
101
```

**Token Breakdown:**
- Output words: 101
- Estimated tokens: 101 × 1.3 = **131 tokens**
- Plus skill-rules.json overhead: ~400 tokens
- **Total discovery overhead: 531 tokens**

**Skills Recommended:**
- 🟠 read (high priority)
- 🟠 base-analysis (high priority)

**Analysis:**
- 2 skills recommended (both high priority)
- Both relevant to task
- Discovery accurate

---

### Test Scenario 2: File Modification Request

**Prompt:** "modify config.yaml"

**Expected Skills:** write

**Measured Output:**
```bash
$ echo "modify config.yaml" | node .claude/hooks/subagent-skill-discovery.js | wc -w
64
```

**Token Breakdown:**
- Output words: 64
- Estimated tokens: 64 × 1.3 = **83 tokens**
- Plus skill-rules.json overhead: ~400 tokens
- **Total discovery overhead: 483 tokens**

**Skills Recommended:**
- 🟠 write (high priority)

**Analysis:**
- 1 skill recommended
- Correct skill for task
- Minimal output (only one relevant skill)

---

### Test Scenario 3: Research/Search Request

**Prompt:** "find all validation functions"

**Expected Skills:** base-research

**Measured Output:**
```bash
$ echo "find all validation functions" | node .claude/hooks/subagent-skill-discovery.js | wc -w
58
```

**Token Breakdown:**
- Output words: 58
- Estimated tokens: 58 × 1.3 = **75 tokens**
- Plus skill-rules.json overhead: ~400 tokens
- **Total discovery overhead: 475 tokens**

**Skills Recommended:**
- 🟠 base-research (high priority)

**Analysis:**
- 1 skill recommended
- Correct for search/research task
- Lowest output seen (minimal recommendation)

---

### Test Scenario 4: Test Skill A (Small)

**Prompt:** "test small skill"

**Expected Skills:** test-skill-a, test-skill-b

**Measured Output:**
```bash
$ echo "test small skill" | node .claude/hooks/subagent-skill-discovery.js | wc -w
65
```

**Token Breakdown:**
- Output words: 65
- Estimated tokens: 65 × 1.3 = **85 tokens**
- Plus skill-rules.json overhead: ~400 tokens
- **Total discovery overhead: 485 tokens**

**Skills Recommended:**
- 🟡 test-skill-b (medium priority) - ranked first
- 🟢 test-skill-a (low priority) - ranked second

**Analysis:**
- Both test skills discovered
- Ranking by priority works correctly
- Output similar to single-skill scenario

**Full Skill Load Cost:**
- Discovery: 485 tokens
- test-skill-a SKILL.md: 709 words = 922 tokens
- test-skill-a asset: 566 words = 736 tokens
- **Total (with asset): 2,143 tokens**

---

### Test Scenario 5: Test Skill B (Large)

**Prompt:** "test large skill"

**Expected Skills:** test-skill-b, test-skill-a

**Measured Output:**
```bash
$ echo "test large skill" | node .claude/hooks/subagent-skill-discovery.js | wc -w
65
```

**Token Breakdown:**
- Output words: 65
- Estimated tokens: 65 × 1.3 = **85 tokens**
- Plus skill-rules.json overhead: ~400 tokens
- **Total discovery overhead: 485 tokens**

**Skills Recommended:**
- 🟡 test-skill-b (medium priority) - ranked first
- 🟢 test-skill-a (low priority) - ranked second

**Analysis:**
- Same output as scenario 4 (both keywords match)
- Discovery overhead identical regardless of skill size
- Priority ranking determines order

**Full Skill Load Cost:**
- Discovery: 485 tokens
- test-skill-b SKILL.md: 1,550 words = 2,015 tokens
- test-skill-b asset: 1,202 words = 1,563 tokens
- **Total (with asset): 4,063 tokens**

---

## Skill Content Measurements

### Test Skills (Created for Baseline)

| Skill | SKILL.md Words | SKILL.md Tokens | Asset Words | Asset Tokens | Total Tokens |
|-------|----------------|-----------------|-------------|--------------|--------------|
| test-skill-a | 709 | 922 | 566 | 736 | 1,658 |
| test-skill-b | 1,550 | 2,015 | 1,202 | 1,563 | 3,578 |

**Ratio:** test-skill-b is 2.2x larger than test-skill-a

### Production Skills (Existing)

| Skill | SKILL.md Words | SKILL.md Tokens | Assets (each) | Total w/ 1 Asset | Total w/ All Assets |
|-------|----------------|-----------------|---------------|------------------|---------------------|
| write | 1,453 | 1,889 | ~1,100 | ~3,320 | ~7,200 |
| read | 1,513 | 1,967 | ~1,300 | ~3,657 | ~7,400 |
| list | 1,303 | 1,694 | ~950 | ~2,930 | ~6,800 |
| open | 1,531 | 1,990 | ~1,250 | ~3,615 | ~7,600 |
| base-research | 967 | 1,257 | ~275 | ~1,615 | ~2,300 |
| base-analysis | 1,149 | 1,494 | ~1,050 | ~2,859 | ~6,200 |
| 4d-evaluation | 1,198 | 1,557 | ~1,150 | ~3,052 | ~6,500 |

**Average Production SKILL.md:** ~1,300 words = ~1,690 tokens

---

## Discovery Overhead Analysis

### Components of Discovery Overhead

| Component | Measurement | Tokens | Percentage |
|-----------|-------------|--------|------------|
| skill-rules.json loading | 146 lines, ~400 words | ~400 | 80-84% |
| Recommendation generation | 58-101 words | 75-131 | 16-20% |
| Context.json loading | ~15 words (when present) | ~20 | ~3% |
| **Total Discovery Overhead** | - | **475-531** | **100%** |

**Key Insight:** skill-rules.json represents 80%+ of discovery overhead. This is the primary target for defer_loading optimization.

### Overhead Across Different Prompts

| Scenario | Recommendation Words | Est. Tokens | skill-rules.json | Total Overhead |
|----------|----------------------|-------------|------------------|----------------|
| Code analysis (2 skills) | 101 | 131 | 400 | **531** |
| File modification (1 skill) | 64 | 83 | 400 | **483** |
| Research task (1 skill) | 58 | 75 | 400 | **475** |
| Test skills (2 skills) | 65 | 85 | 400 | **485** |

**Range:** 475-531 tokens per prompt
**Average:** 494 tokens per prompt

### Overhead Variation Analysis

**Factors affecting overhead:**
1. Number of skills recommended (1-3 typically)
2. Length of skill descriptions (fixed in current system)
3. skill-rules.json size (constant: 400 tokens)

**Variation:**
- Minimum: 475 tokens (1 skill, base-research)
- Maximum: 531 tokens (2 skills, read + base-analysis)
- **Range: 56 tokens (11.8% variation)**

**Conclusion:** Discovery overhead is relatively constant (~500 tokens ±50), making it an excellent target for optimization.

---

## Cumulative Cost Projections

### Short Conversation (10 prompts)

**Current System:**
- Discovery: 10 × 500 = 5,000 tokens
- Skill usage: Assume 2 skills activated (SKILL.md only) = 2 × 1,690 = 3,380 tokens
- **Total: 8,380 tokens (4.2% of 200K budget)**

**With defer_loading (projected 50% reduction):**
- Discovery: 10 × 250 = 2,500 tokens
- Skill usage: 3,380 tokens (unchanged)
- **Total: 5,880 tokens**
- **Savings: 2,500 tokens (30% reduction in skill system cost)**

---

### Medium Conversation (50 prompts)

**Current System:**
- Discovery: 50 × 500 = 25,000 tokens
- Skill usage: Assume 5 skills activated = 5 × 1,690 = 8,450 tokens
- **Total: 33,450 tokens (16.7% of 200K budget)**

**With defer_loading (projected):**
- Discovery: 50 × 250 = 12,500 tokens
- Skill usage: 8,450 tokens
- **Total: 20,950 tokens**
- **Savings: 12,500 tokens (37% reduction)**

---

### Long Conversation (100 prompts)

**Current System:**
- Discovery: 100 × 500 = 50,000 tokens
- Skill usage: Assume 8 skills activated = 8 × 1,690 = 13,520 tokens
- **Total: 63,520 tokens (31.8% of 200K budget)**

**With defer_loading (projected):**
- Discovery: 100 × 250 = 25,000 tokens
- Skill usage: 13,520 tokens
- **Total: 38,520 tokens**
- **Savings: 25,000 tokens (39% reduction)**

---

### Maestro Orchestration (4 agents, 3 prompts each)

**Current System:**
- Discovery: 12 × 500 = 6,000 tokens (each subagent triggers discovery)
- Skill usage: Assume 4 skills (1 per agent) = 4 × 1,690 = 6,760 tokens
- **Total: 12,760 tokens**

**With defer_loading (projected):**
- Discovery: 12 × 250 = 3,000 tokens
- Skill usage: 6,760 tokens
- **Total: 9,760 tokens**
- **Savings: 3,000 tokens (24% reduction)**

---

## Performance Benchmarks

### Hook Execution Time

**Test methodology:**
```bash
time echo "test" | node .claude/hooks/subagent-skill-discovery.js > /dev/null
```

**Measured (10 runs, average):**
- Real time: ~45ms
- User time: ~38ms
- Sys time: ~7ms

**Analysis:**
- Execution time negligible (<50ms)
- Not a performance bottleneck
- Token cost is the primary concern, not execution speed

---

## Comparison Tables

### Discovery Overhead Summary

| Metric | Current System | defer_loading Target | Reduction |
|--------|----------------|----------------------|-----------|
| Per prompt (avg) | 494 tokens | 250 tokens | 49% |
| 10 prompts | 4,940 tokens | 2,500 tokens | 49% |
| 50 prompts | 24,700 tokens | 12,500 tokens | 49% |
| 100 prompts | 49,400 tokens | 25,000 tokens | 49% |

### Skill Content Costs (Unchanged by defer_loading)

| Skill Size | Words | Tokens | With 1 Asset | With All Assets |
|------------|-------|--------|--------------|-----------------|
| Small (test-a) | 709 | 922 | 1,658 | 1,658 |
| Large (test-b) | 1,550 | 2,015 | 3,578 | 3,578 |
| Production avg | 1,300 | 1,690 | 3,000 | 6,500 |

**Note:** defer_loading does NOT reduce skill content costs (which are already loaded on-demand). It only reduces discovery overhead.

---

## Test Scenarios for Before/After Comparison

### Scenario 1: First-Time User (10 prompts, learning system)

**Profile:**
- New to Maestro
- Exploring capabilities
- Sees skill recommendations frequently
- Activates 2-3 skills to learn

**Current Cost:**
- Discovery: 10 × 500 = 5,000 tokens
- Skill exploration: 3 × 3,000 = 9,000 tokens
- **Total: 14,000 tokens**

**defer_loading Cost:**
- Discovery: 10 × 250 = 2,500 tokens
- Skill exploration: 9,000 tokens (unchanged)
- **Total: 11,500 tokens**
- **Savings: 2,500 tokens (18%)**

---

### Scenario 2: Experienced User (50 prompts, focused work)

**Profile:**
- Familiar with skills
- Uses 2-3 skills regularly
- Discovery overhead is waste (knows what skills exist)

**Current Cost:**
- Discovery: 50 × 500 = 25,000 tokens
- Skill usage: 3 × 1,690 = 5,070 tokens
- **Total: 30,070 tokens**

**defer_loading Cost:**
- Discovery: 50 × 250 = 12,500 tokens (reduced)
- Plus: Tracking suppresses repeated recommendations
- Actual: 50 × 150 = 7,500 tokens (with tracking)
- Skill usage: 5,070 tokens
- **Total: 12,570 tokens**
- **Savings: 17,500 tokens (58%)**

---

### Scenario 3: Maestro Orchestration (Complex multi-agent task)

**Profile:**
- Maestro spawns 3 subagents
- Each subagent has 3-5 prompts
- Each context runs discovery independently

**Current Cost:**
- Maestro: 3 prompts × 500 = 1,500 tokens
- Subagent 1: 4 prompts × 500 = 2,000 tokens
- Subagent 2: 3 prompts × 500 = 1,500 tokens
- Subagent 3: 5 prompts × 500 = 2,500 tokens
- **Discovery total: 7,500 tokens**
- Skill usage: 4 × 1,690 = 6,760 tokens
- **Total: 14,260 tokens**

**defer_loading Cost:**
- Discovery: 15 prompts × 250 = 3,750 tokens
- Skill usage: 6,760 tokens
- **Total: 10,510 tokens**
- **Savings: 3,750 tokens (26%)**

---

### Scenario 4: Iterative Development (100+ prompts, long session)

**Profile:**
- Working on large feature
- Repeated code/test cycles
- Same skills recommended repeatedly

**Current Cost:**
- Discovery: 100 × 500 = 50,000 tokens
- Skill usage: 5 × 1,690 = 8,450 tokens
- **Total: 58,450 tokens (29% of 200K budget)**

**defer_loading Cost:**
- Discovery (with tracking): 1 × 500 + 99 × 150 = 15,350 tokens
- Skill usage: 8,450 tokens
- **Total: 23,800 tokens**
- **Savings: 34,650 tokens (59%)**

**Impact:** Frees up nearly 35K tokens for actual work (equivalent to ~25,000 words of code/documentation).

---

### Scenario 5: Minimal Skill Usage (Research/reading only)

**Profile:**
- Reading code, asking questions
- No file modifications
- Rarely activates skills

**Current Cost:**
- Discovery: 30 × 500 = 15,000 tokens
- Skill usage: 0 tokens
- **Total: 15,000 tokens (pure overhead)**

**defer_loading Cost:**
- Discovery: 30 × 250 = 7,500 tokens
- Skill usage: 0 tokens
- **Total: 7,500 tokens**
- **Savings: 7,500 tokens (50%)**

**Impact:** Pure discovery overhead cases see full 50% savings.

---

## Success Metrics for defer_loading Implementation

### Primary Metrics (Must Achieve)

| Metric | Baseline | Target | Measurement Method |
|--------|----------|--------|-------------------|
| Discovery overhead (per prompt) | 494 tokens | ≤ 250 tokens | Test scenarios 1-5 |
| Discovery accuracy | 100% | 100% | All skills still discoverable |
| Backward compatibility | 100% | 100% | All existing skills work |
| Token reduction (50 prompts) | 24,700 | ≤ 12,500 | Cumulative test |

### Secondary Metrics (Nice to Have)

| Metric | Baseline | Target | Measurement Method |
|--------|----------|--------|-------------------|
| Recommendation suppression | 0% | 70% | Test repeated prompts |
| Hook execution time | 45ms | ≤ 50ms | Benchmark |
| Context.json size | ~50 tokens | ≤ 150 tokens | File size check |

### Phase 1 Exit Criteria

Before moving to Phase 2:
- [x] Baseline measurements documented
- [x] Test scenarios defined (5 scenarios)
- [x] Success metrics established
- [ ] Comparison framework ready
- [x] Test skills created and validated

---

## Measurement Reproducibility

### How to Reproduce These Measurements

#### Step 1: Environment Setup
```bash
cd /Users/awesome/dev/devtest/Maestro
git status  # Verify on correct branch
node --version  # Verify Node.js v18+
```

#### Step 2: Run Discovery Tests
```bash
# Test each scenario
echo "analyze auth.py for bugs" | node .claude/hooks/subagent-skill-discovery.js | wc -w
echo "modify config.yaml" | node .claude/hooks/subagent-skill-discovery.js | wc -w
echo "find all validation functions" | node .claude/hooks/subagent-skill-discovery.js | wc -w
echo "test small skill" | node .claude/hooks/subagent-skill-discovery.js | wc -w
echo "test large skill" | node .claude/hooks/subagent-skill-discovery.js | wc -w
```

#### Step 3: Measure Skill Content
```bash
# Count words in all skills
wc -w .claude/skills/*/SKILL.md

# Count words in test skills
wc -w .claude/skills/test-skill-a/SKILL.md .claude/skills/test-skill-a/assets/*.md
wc -w .claude/skills/test-skill-b/SKILL.md .claude/skills/test-skill-b/assets/*.md
```

#### Step 4: Calculate Tokens
```bash
# Formula: tokens = words × 1.3
# Example:
words=709
tokens=$((words * 13 / 10))
echo "$tokens tokens"
```

#### Step 5: Benchmark Performance
```bash
# Time hook execution
time echo "test" | node .claude/hooks/subagent-skill-discovery.js > /dev/null

# Run 10 times for average
for i in {1..10}; do
  time echo "test" | node .claude/hooks/subagent-skill-discovery.js > /dev/null
done 2>&1 | grep real
```

---

## Key Insights

### Insight 1: Discovery Overhead is Constant

Discovery overhead ranges from 475-531 tokens (±5.6%) regardless of:
- Number of skills in registry (11 skills tested)
- Size of skills (test-skill-a vs test-skill-b)
- Complexity of prompt

**Implication:** defer_loading can target a predictable optimization.

### Insight 2: skill-rules.json Dominates Overhead

skill-rules.json loading represents 80%+ of discovery overhead (400 of 500 tokens).

**Implication:** Optimizing skill-rules.json size/structure has maximum impact.

### Insight 3: Skill Content is Already On-Demand

SKILL.md files are only loaded when Skill tool is explicitly invoked. Assets are only loaded when agents explicitly read them.

**Implication:** defer_loading cannot optimize skill content loading (already optimized). Focus must be on discovery phase.

### Insight 4: Cumulative Impact is Significant

In 50-prompt conversations, discovery overhead consumes 25,000 tokens (12.5% of 200K budget).

**Implication:** Long conversations and iterative workflows see highest benefit from optimization.

### Insight 5: Hook Performance is Not a Bottleneck

Hook execution averages 45ms per prompt (negligible).

**Implication:** Optimization should focus on token reduction, not execution speed.

---

## Recommendations for Implementation

### High-Priority Optimizations

1. **Slim skill-rules.json** - Reduce from 400 → 200 tokens (50% reduction)
   - Move verbose descriptions to SKILL.md
   - Use short_description field
   - Reduce unnecessary metadata

2. **Implement tracking** - Skip repeated recommendations
   - Add skillTracking to context.json
   - Suppress recommendations for already-suggested skills
   - Reset on session timeout

3. **Minimal recommendations** - Reduce output verbosity
   - Show skill name + priority only
   - Remove "When to use" descriptions
   - Add "Use Skill tool for details" instruction

### Medium-Priority Optimizations

4. **Session detection** - Reset tracking after timeout
   - 30-minute timeout
   - Detect new conversations
   - Prevent stale tracking

5. **Conditional discovery** - Skip for non-code prompts
   - Pre-check heuristics
   - Skip purely conversational prompts
   - Always run if "skill" mentioned

### Low-Priority Enhancements

6. **Usage analytics** - Track which skills are actually used
7. **Dynamic descriptions** - Context-aware recommendations
8. **Skill bundles** - Group related skills

---

## Document Metadata

**Author:** Autonomous agent (Task 1.4)
**Date:** 2025-11-25
**Measurements Date:** 2025-11-25
**Environment:** Unmodified system (before defer_loading)
**Test Skills:** test-skill-a, test-skill-b
**Status:** ✅ BASELINE ESTABLISHED

**Next Steps:**
- Implement defer_loading (Week 2)
- Re-run all measurements
- Compare results to baseline
- Validate 50% reduction target achieved

---

## Appendix: Raw Measurement Data

### Discovery Output Samples

**Scenario 1 (101 words):**
```
# Skill Recommendations

Based on your task, the following skills may be helpful:

## 🟠 read (high priority)
**When to use:** Deep file and codebase analysis with pattern recognition and systematic methodology

## 🟠 base-analysis (high priority)
**When to use:** Code and system evaluation for quality, security, maintainability, and performance

## Using Skills

To activate a skill, use the Skill tool:
```
Skill(skill: "skill-name")
```

Skills provide progressive guidance - start with SKILL.md, then load resources/* as needed.
```

**Token calculation:** 101 words × 1.3 = 131 tokens

---

**Scenario 2 (64 words):**
```
# Skill Recommendations

Based on your task, the following skills may be helpful:

## 🟠 write (high priority)
**When to use:** Code and file modifications with guidance on Edit vs Write tool selection and safety checks

## Using Skills

To activate a skill, use the Skill tool:
```
Skill(skill: "skill-name")
```

Skills provide progressive guidance - start with SKILL.md, then load resources/* as needed.
```

**Token calculation:** 64 words × 1.3 = 83 tokens

---

## Appendix: File Sizes

| File | Lines | Words | Characters | Est. Tokens |
|------|-------|-------|------------|-------------|
| skill-rules.json | 146 | ~400 | ~4,100 | ~400 |
| test-skill-a/SKILL.md | 205 | 709 | ~5,300 | 922 |
| test-skill-a/assets/deep-dive.md | - | 566 | ~4,300 | 736 |
| test-skill-b/SKILL.md | 437 | 1,550 | ~11,800 | 2,015 |
| test-skill-b/assets/patterns.md | - | 1,202 | ~9,100 | 1,563 |
| write/SKILL.md | 428 | 1,453 | ~10,900 | 1,889 |
| read/SKILL.md | 461 | 1,513 | ~11,400 | 1,967 |

---

**End of Baseline Metrics**
