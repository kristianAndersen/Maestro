# 25-Prompt Cumulative Test Sequence

## Purpose
Test Phase 2 defer_loading with smart caching across a realistic 25-prompt conversation that activates real Maestro agents and skills.

## Test Methodology

### Domains Tested
1. **File Operations** (prompts 1-5): write, read, open, list skills
2. **Analysis Tasks** (prompts 6-10): base-analysis, read skills
3. **Skill System Work** (prompts 11-15): Skill-related files (meta-work)
4. **Hook/Agent Inspection** (prompts 16-20): read, base-analysis skills
5. **Mixed Operations** (prompts 21-25): Various skills, cross-domain

### Expected Behavior
- **First prompt in domain**: Full skill recommendations (~60-80 words)
- **Subsequent prompts in same domain**: Minimal/no recommendations (0-20 words)
- **New domain**: Fresh recommendations
- **Cumulative reduction target**: 40-60% across all 25 prompts

---

## Test Prompts (Real Maestro Files)

### Domain 1: File Operations (Prompts 1-5)

**Prompt 1:**
```
Analyze the subagent-skill-discovery.js hook for code quality and potential improvements
```
**Expected Skills:** read, base-analysis
**Expected Output:** Full recommendations (first in domain)
**File:** `.claude/hooks/subagent-skill-discovery.js`

---

**Prompt 2:**
```
Read the maestro-agent-suggester.js hook and explain how agent detection works
```
**Expected Skills:** read (already recommended)
**Expected Output:** Minimal/silent (cached)
**File:** `.claude/hooks/maestro-agent-suggester.js`

---

**Prompt 3:**
```
Compare the work-tracker.sh hook with the other hooks to understand the pattern
```
**Expected Skills:** read, base-analysis (already recommended)
**Expected Output:** Minimal/silent (cached)
**File:** `.claude/hooks/work-tracker.sh`

---

**Prompt 4:**
```
Open the skill-rules.json and show me the defer_loading configuration structure
```
**Expected Skills:** open (new skill in domain)
**Expected Output:** Recommendation for 'open' only
**File:** `.claude/skills/skill-rules.json`

---

**Prompt 5:**
```
List all markdown files in the .claude/skills directory
```
**Expected Skills:** list (new skill in domain)
**Expected Output:** Recommendation for 'list' only
**Files:** `.claude/skills/*.md`

---

### Domain 2: Analysis Tasks (Prompts 6-10)

**Prompt 6:**
```
Analyze the file-writer.md agent for completeness and adherence to agent patterns
```
**Expected Skills:** read, base-analysis (new context)
**Expected Output:** Full recommendations (new domain)
**File:** `.claude/agents/file-writer.md`

---

**Prompt 7:**
```
Review the base-research.md agent and identify its core workflow steps
```
**Expected Skills:** read, base-analysis (already recommended in this domain)
**Expected Output:** Minimal/silent (cached)
**File:** `.claude/agents/base-research.md`

---

**Prompt 8:**
```
Examine the 4d-evaluation.md agent and explain the evaluation framework
```
**Expected Skills:** read (already recommended)
**Expected Output:** Minimal/silent (cached)
**File:** `.claude/agents/4d-evaluation.md`

---

**Prompt 9:**
```
Analyze the list.md agent structure and compare with file-reader.md
```
**Expected Skills:** read, base-analysis (already recommended)
**Expected Output:** Minimal/silent (cached)
**Files:** `.claude/agents/list.md`, `.claude/agents/file-reader.md`

---

**Prompt 10:**
```
Read the open.md agent and summarize its delegation pattern
```
**Expected Skills:** read (already recommended)
**Expected Output:** Minimal/silent (cached)
**File:** `.claude/agents/open.md`

---

### Domain 3: Skill System Inspection (Prompts 11-15)

**Prompt 11:**
```
Examine the write/SKILL.md file and identify its progressive disclosure structure
```
**Expected Skills:** read (new context for skill files)
**Expected Output:** Recommendation for 'read' (new domain)
**File:** `.claude/skills/write/SKILL.md`

---

**Prompt 12:**
```
Compare read/SKILL.md with write/SKILL.md to understand the skill template pattern
```
**Expected Skills:** read, base-analysis (already recommended in this domain)
**Expected Output:** Minimal/silent (cached)
**Files:** `.claude/skills/read/SKILL.md`, `.claude/skills/write/SKILL.md`

---

**Prompt 13:**
```
Read the base-research/SKILL.md and explain its methodology section
```
**Expected Skills:** read (already recommended)
**Expected Output:** Minimal/silent (cached)
**File:** `.claude/skills/base-research/SKILL.md`

---

**Prompt 14:**
```
Analyze the 4d-evaluation/SKILL.md for quality assessment patterns
```
**Expected Skills:** read, base-analysis (already recommended)
**Expected Output:** Minimal/silent (cached)
**File:** `.claude/skills/4d-evaluation/SKILL.md`

---

**Prompt 15:**
```
Open the fetch/SKILL.md and show me the error handling guidance
```
**Expected Skills:** open (new in this domain)
**Expected Output:** Recommendation for 'open' only
**File:** `.claude/skills/fetch/SKILL.md`

---

### Domain 4: Hook/Configuration Deep Dive (Prompts 16-20)

**Prompt 16:**
```
Analyze settings.json hook configuration for correctness and completeness
```
**Expected Skills:** read, base-analysis (new domain)
**Expected Output:** Full recommendations (new domain)
**File:** `.claude/settings.json`

---

**Prompt 17:**
```
Read agent-registry.json and explain the agent metadata structure
```
**Expected Skills:** read (already recommended in this domain)
**Expected Output:** Minimal/silent (cached)
**File:** `.claude/agents/agent-registry.json`

---

**Prompt 18:**
```
Compare the three hook files for consistency in error handling patterns
```
**Expected Skills:** read, base-analysis (already recommended)
**Expected Output:** Minimal/silent (cached)
**Files:** `.claude/hooks/*.js`

---

**Prompt 19:**
```
Examine the test-skill-a and test-skill-b to understand defer_loading test structure
```
**Expected Skills:** read (already recommended)
**Expected Output:** Minimal/silent (cached)
**Files:** `.claude/skills/test-skill-a/SKILL.md`, `.claude/skills/test-skill-b/SKILL.md`

---

**Prompt 20:**
```
Analyze the hallucination-detection skill for completeness
```
**Expected Skills:** read, base-analysis (already recommended)
**Expected Output:** Minimal/silent (cached)
**File:** `.claude/skills/hallucination-detection/SKILL.md`

---

### Domain 5: Mixed Operations (Prompts 21-25)

**Prompt 21:**
```
Modify the README.md to add a section about defer_loading optimization
```
**Expected Skills:** write (new domain - modification)
**Expected Output:** Full recommendation for 'write' (new domain)
**File:** `.claude/README.md`

---

**Prompt 22:**
```
Update the CLAUDE.md to reflect the latest skill system improvements
```
**Expected Skills:** write (already recommended in this domain)
**Expected Output:** Minimal/silent (cached)
**File:** `CLAUDE.md`

---

**Prompt 23:**
```
Read the defer-loading-design.md and summarize the key design decisions
```
**Expected Skills:** read (re-entering read domain)
**Expected Output:** Recommendation for 'read' (domain switch)
**File:** `docs/defer-loading-design.md`

---

**Prompt 24:**
```
Analyze the baseline-metrics.md for accuracy of token measurements
```
**Expected Skills:** read, base-analysis (both recommended recently)
**Expected Output:** Minimal/silent (cached)
**File:** `docs/baseline-metrics.md`

---

**Prompt 25:**
```
List all agent files and identify which ones need defer_loading updates
```
**Expected Skills:** list (new skill in this sequence)
**Expected Output:** Recommendation for 'list'
**Files:** `.claude/agents/*.md`

---

## Expected Token Reduction Pattern

### Domain-by-Domain Breakdown

| Domain | Prompts | First Prompt (tokens) | Subsequent (tokens) | Average (tokens) |
|--------|---------|----------------------|---------------------|------------------|
| Domain 1: File Ops | 1-5 | 60-80 | 0-20 | ~25 |
| Domain 2: Analysis | 6-10 | 60-80 | 0-20 | ~25 |
| Domain 3: Skills | 11-15 | 40-60 | 0-20 | ~20 |
| Domain 4: Hooks | 16-20 | 60-80 | 0-20 | ~25 |
| Domain 5: Mixed | 21-25 | 40-60 (2 new) | 0-20 | ~30 |

**Average across 25 prompts: ~25 tokens per prompt**

### Comparison with Baseline

| Scenario | Baseline (tokens) | Phase 2 (tokens) | Reduction |
|----------|-------------------|------------------|-----------|
| Without caching | 494 × 25 = 12,350 | 111 × 25 = 2,775 | 77.5% |
| With smart caching | 494 × 25 = 12,350 | ~25 × 25 = 625 | **95.0%** |

### Cumulative Savings
- **Baseline overhead**: 12,350 tokens
- **Phase 2 overhead**: 625 tokens
- **Tokens saved**: 11,725 tokens
- **Percentage freed**: 95.0% of discovery overhead eliminated

---

## Success Criteria

### Must Achieve:
- [ ] Average tokens per prompt ≤ 30 (target: 25)
- [ ] Cumulative reduction ≥ 40% vs baseline (target: 95%)
- [ ] Session detection works (domains correctly identified)
- [ ] No skill discovery failures (all files found)
- [ ] Skill recommendations accurate (correct skills for tasks)

### Bonus:
- [ ] Domain history stays bounded (<100 entries)
- [ ] context.json size reasonable (<2KB)
- [ ] Hook execution time <50ms per prompt

---

## Execution Instructions

### Step 1: Reset Context
```bash
# Clear previous session tracking
rm .claude/context.json
echo '{"version":"1.0","skillTracking":{"recommended":[],"used":[],"sessionStart":"'$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")'"}}' > .claude/context.json
```

### Step 2: Run Baseline Measurement (No Caching)
```bash
# Temporarily disable caching in hook (forceRecommend=true)
# Run all 25 prompts through hook
for i in {1..25}; do
  echo "Prompt $i" | node .claude/hooks/subagent-skill-discovery.js | wc -w >> baseline.txt
done

# Calculate baseline average
awk '{sum+=$1} END {print "Baseline avg:", sum/25, "words"}' baseline.txt
```

### Step 3: Run Phase 2 Measurement (With Caching)
```bash
# Reset context
rm .claude/context.json
echo '{"version":"1.0","skillTracking":{"recommended":[],"used":[],"sessionStart":"'$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")'"}}' > .claude/context.json

# Run all 25 prompts with caching enabled
cat 25-prompts.txt | while read prompt; do
  echo "$prompt" | node .claude/hooks/subagent-skill-discovery.js | wc -w >> phase2.txt
done

# Calculate Phase 2 average
awk '{sum+=$1} END {print "Phase 2 avg:", sum/25, "words"}' phase2.txt
```

### Step 4: Calculate Reduction
```bash
# Compare results
paste baseline.txt phase2.txt | awk '{reduction=(($1-$2)/$1)*100; print "Prompt:", NR, "Baseline:", $1, "Phase2:", $2, "Reduction:", reduction"%"}'

# Calculate cumulative
baseline_total=$(awk '{sum+=$1} END {print sum}' baseline.txt)
phase2_total=$(awk '{sum+=$1} END {print sum}' phase2.txt)
reduction=$(echo "scale=2; (($baseline_total-$phase2_total)/$baseline_total)*100" | bc)
echo "Cumulative Reduction: $reduction%"
```

---

## Document Metadata

**Created:** 2025-11-27
**Purpose:** Phase 2 multi-prompt validation testing
**Test Type:** Cumulative token reduction measurement
**Prompts:** 25 realistic tasks using actual Maestro files
**Expected Outcome:** 40-60% cumulative reduction (targeting 95%)
