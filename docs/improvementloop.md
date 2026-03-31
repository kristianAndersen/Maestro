# Self-Improvement Loop for Maestro Skills

## Origin

Inspired by [karpathy/autoresearch](https://github.com/karpathy/autoresearch) — an autonomous ML research loop that modifies code, runs experiments, measures a single metric (val_bpb), and keeps/reverts based on improvement. We adapted this concept for Maestro skill self-improvement.

## Core Concept

```
1. Pick a skill to improve
2. Run a benchmark task through it → capture quality score
3. Analyze evaluation coaching for improvement ideas
4. Modify the skill file with one targeted change
5. git commit
6. Re-run the same benchmark → capture new score
7. If improved → keep. If equal/worse → git reset
8. Loop
```

## The Metric Problem

Autoresearch uses val_bpb — a single, objective, reproducible number. Skill quality has no equivalent. The current 4D evaluation gives EXCELLENT/NEEDS_REFINEMENT (binary), which is too coarse to detect incremental improvements.

### ccchat Consensus (2026-03-23)

Three independent agents (lifeasaanllm, ccchat-improve, blank-project) converged on the same design:

**Layer 1 — Deterministic Structural Checks (primary metric):**
- Does the output parse correctly?
- Does it contain all required sections?
- Does it respect length bounds?
- Does it satisfy explicit constraints from the skill definition?
- Are there hallucinated references?
- Score = count of passing checks / total checks

**Layer 2 — LLM Binary Gate (not a gradient):**
- Pass/fail only — not 0-10 scoring
- Only evaluated when Layer 1 is passing
- Keep changes that pass the gate AND improve structural metrics

**Key objections raised:**
- **Goodhart's Law** — A single number invites gaming. The loop will optimize the metric while degrading unmeasured dimensions.
- **Determinism vs granularity tradeoff** — Binary is reproducible BECAUSE it's coarse. Finer granularity introduces noise.
- **LLM judge variance** — LLM-as-judge inherits temperature variance, model version drift, and position bias. Run the same eval 10 times and you get different scores.
- **Two sources of variance** — Skill output variance x eval variance. Must isolate them separately.

## Noise Floor Test — Phase 1 Results

### Protocol

- **Input:** One frozen base-research output (SQLite WAL vs journal mode tradeoffs)
- **Eval:** 4D evaluation run 20 times on the identical frozen output
- **Purpose:** Isolate pure eval variance (judge noise, not skill noise)
- **Controls:** Fresh context each run, all runs within same hour

### Raw Results

| Run | Verdict | Product | Process | Performance |
|-----|---------|---------|---------|-------------|
| 1 | NEEDS REFINEMENT | FAIL | PASS | FAIL |
| 2 | NEEDS REFINEMENT | FAIL | PASS | FAIL |
| 3 | EXCELLENT | PASS | PASS | PASS |
| 4 | EXCELLENT | PASS | PASS | PASS |
| 5 | EXCELLENT | PASS | PASS | PASS |
| 6 | EXCELLENT | PASS | PASS | PASS |
| 7 | EXCELLENT | PASS | PASS | PASS |
| 8 | EXCELLENT | PASS | PASS | PASS |
| 9 | NEEDS REFINEMENT | FAIL | PASS | FAIL |
| 10 | EXCELLENT | PASS | PASS | PASS |
| 11 | EXCELLENT | PASS | PASS | PASS |
| 12 | EXCELLENT | PASS | PASS | PASS |
| 13 | EXCELLENT | PASS | PASS | PASS |
| 14 | EXCELLENT | PASS | PASS | PASS |
| 15 | EXCELLENT | PASS | PASS | PASS |
| 16 | EXCELLENT | PASS | PASS | PASS |
| 17 | EXCELLENT | PASS | PASS | PASS |
| 18 | EXCELLENT | PASS | PASS | PASS |
| 19 | NEEDS REFINEMENT | FAIL | PASS | FAIL |
| 20 | EXCELLENT | PASS | PASS | PASS |

### Statistics

- **EXCELLENT:** 16/20 (80%)
- **NEEDS REFINEMENT:** 4/20 (20%)
- **Wilson 95% CI:** ~59%-92% for EXCELLENT rate
- **Process Discernment:** 20/20 PASS (100% stable)
- **Product Discernment:** 16/20 PASS (the noisy dimension)
- **Performance Discernment:** 16/20 PASS (always co-fails with Product, never independently)

### Key Findings

1. **The noise is systematic, not random.** Every NEEDS REFINEMENT run has the identical reasoning: "the work product is a summary of a report, not the report itself." The evaluator is split on whether a compressed summary constitutes a valid deliverable.

2. **Process Discernment is perfectly stable** (20/20). The noise lives entirely in Product + Performance, and they always move together.

3. **Root cause is identifiable.** The evaluator has no clear guidance on whether a summary-format output satisfies a "research" requirement. Some runs interpret the summary as sufficient, others as incomplete.

4. **80% consistency falls in the "fix the noisy dimension" range** (70-90% per our protocol). Not stable enough for a self-improvement loop that needs to detect 5% improvements.

## Remaining Test Protocol (Not Yet Run)

### Phase 2: End-to-End Variance
- 2 skills (base-research + base-analysis) x 1 frozen input each x 20-30 runs x fresh context = 40-60 runs
- Measures combined skill output variance + eval variance
- Only run if Phase 1 passes (it didn't cleanly — fix noise first, then retest)

### Phase 2 Controls
- Temperature=0 on eval calls
- 1 warmup run discarded (prompt cache effects)
- Vary a throwaway token to prevent caching artificial consistency
- All runs in tight time window (same hour)
- Report: verdict consistency + Wilson CI per skill, per-dimension flip rates

## Implementation Plan

### Step 1: Fix Eval Noise (prerequisite)

The spec-compliance dimension we added to 4D evaluation (2026-03-23) should address this. If delegations explicitly specify expected deliverable format ("deliver a full report" vs "deliver a summary"), the evaluator has an unambiguous check instead of subjectively judging completeness.

**Action:** Ensure all benchmark delegations include explicit format expectations in the PRODUCT.Acceptance and PRODUCT.Done-When fields.

**Retest:** Run Phase 1 again with the spec-compliance dimension active and format expectations in the delegation. Target: >95% consistency.

### Step 2: Build Structural Check Layer

Create a scoring function that checks deterministic properties of skill outputs:

```
Structural checks (per skill type):
- [ ] Output parses correctly (valid markdown, expected sections present)
- [ ] Required sections exist (Skills Used, Actions Taken, Evidence, etc.)
- [ ] Length within bounds (not too short = stub, not too long = bloat)
- [ ] Evidence citations present (file paths, line numbers, URLs)
- [ ] No hallucinated file references (Grep to verify cited paths exist)
- [ ] Self-assessment checklist completed
- [ ] Constraint adherence (skill-specific rules followed)

Score = passing checks / total checks (0.0 to 1.0)
```

This score is deterministic, reproducible, and granular enough to detect small improvements.

### Step 3: Build Benchmark Suite

Create 3-5 reproducible benchmark tasks per skill:

```
benchmarks/
  base-research/
    task-1-sqlite-wal.md      # Frozen input
    task-1-expected.md         # Expected output structure
    task-2-rest-vs-graphql.md
    task-2-expected.md
  base-analysis/
    task-1-auth-review.md
    task-1-expected.md
```

Each benchmark includes:
- Frozen input (exact delegation text)
- Expected output structure (sections, evidence requirements)
- Structural check criteria specific to this task
- Reference "known good" output for paired comparison

### Step 4: Build Self-Improvement Agent

A new agent (`skill-improver.md`) that:

1. Selects a skill and benchmark task
2. Runs the benchmark N times (5 minimum) to establish baseline score
3. Reads 4D evaluation coaching from the runs for improvement ideas
4. Makes ONE targeted modification to the skill file
5. git commits the change
6. Runs the same benchmark N times with the modified skill
7. Compares: structural score improved AND LLM gate still passes?
8. If yes → keep commit. If no → git reset
9. Logs result to `improvement-results.tsv`
10. Loops

**Constraints:**
- One file modified per iteration (like autoresearch's train.py constraint)
- N=5 minimum runs per variant to filter noise
- Only structural score drives accept/reject (LLM gate is pass/fail only)
- Maximum 3 consecutive rejections before trying a different improvement strategy

### Step 5: Run and Validate

1. Start with one skill (base-research — most test data available)
2. Run 10 improvement iterations manually, observe results
3. If improvements compound → automate with the agent
4. If improvements plateau or regress → revisit metric design

## Recommendations

1. **Fix eval noise first.** The 80% consistency means 1 in 5 evaluations gives a different verdict on identical input. No self-improvement loop can detect signal through that noise. The spec-compliance dimension should help — retest after it's been active for a few sessions.

2. **Start with structural checks, not LLM judgment.** The deterministic checks are the foundation. LLM judgment is the gate, not the gradient. Don't try to extract a 0-10 score from an LLM — binary pass/fail is more honest about what it can reliably deliver.

3. **Budget 5 runs per variant minimum.** At N=1, you're measuring luck. At N=5, outliers are dampened. The cost is real (5x API calls per iteration) but the alternative is accepting noise as signal.

4. **Scope to skills first, agents later.** Skills are shorter files with clearer structure — easier to measure, easier to modify, easier to validate. Agent self-improvement is a harder problem (longer files, more behavioral, harder to benchmark).

5. **This is a multi-session project.** Don't try to build and validate the entire loop in one session. The phases are: fix noise → build checks → build benchmarks → build agent → validate. Each phase should be validated before proceeding to the next.

## Open Questions for ccchat Discussion

1. Is 5 runs per variant sufficient, or should we budget for 10? The noise floor data suggests even 5 may not be enough if eval consistency is below 90%.

2. Should the structural check layer be skill-type-specific (different checks for research vs analysis vs write skills) or universal? Skill-specific is more accurate but harder to maintain.

3. How do we handle the "plateau problem"? After N improvements, structural score will max out (all checks pass). At that point, only LLM judgment can detect further improvements — but we've established that LLM judgment is noisy. Is there a graceful transition?

4. Should improvements be monotonic (only accept strict improvements) or allow lateral moves (accept equal scores if code is simpler)? Autoresearch rejects equal scores, but for skills, a simpler formulation at equal quality is genuinely better.

5. What's the right cadence? Run the loop overnight like autoresearch? On-demand per session? Scheduled weekly?
