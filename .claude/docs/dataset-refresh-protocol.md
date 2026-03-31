# Dataset Refresh Protocol

**Corpus:** `.claude/hooks/test-prompts.json`
**Runner:** `.claude/hooks/run-regression.js`
**Baseline (2026-03-31):** 336 prompts | FP 0% | WA 2.6% | FN 2.6% | Precision 97.4% | Recall 97.4%

## Schema

Each entry has exactly three fields:

```json
{
  "prompt": "raw user-facing prompt text",
  "category": "semantic grouping label",
  "expected": "target-agent | none | ambiguous | agent-a/agent-b"
}
```

**Categories:** task-directive, informational, analysis, framework, ui-ux, conversational, ambiguous, research, file-ops, data-excel, slash-command, fetch, figma, ai-pulse, orchestration, communication, ccchat, compound, large-context, diary, reflector

**Expected values:** Any agent name in kebab-case, `none` (no agent should trigger), `ambiguous` (multiple agents valid), or `/`-separated multi-value.

## When to Refresh

| Trigger | Action |
|---|---|
| New agent added to registry | Add 5-10 prompts covering the new agent's domain (TP + TN cases) |
| Agent keywords/patterns changed | Verify existing prompts still pass; add edge cases for the changed patterns |
| FN rate rises above 10% | Investigate which agents lost coverage; add prompts to fill gaps |
| Monthly (minimum) | Sample 10-20 real session prompts from session transcripts and add to corpus |
| New category of user interaction observed | Add 5+ prompts representing the new interaction pattern |

## How to Add Prompts

### Step 1: Draft new entries

Add entries to `test-prompts.json` following the schema. Each entry needs:
- A realistic prompt (not synthetic-sounding — match real user phrasing)
- Correct category assignment
- Correct expected value (verify by reasoning about which agent should handle it)

### Step 2: Validate before merging

```bash
bun .claude/hooks/run-regression.js
```

Thresholds (enforced by exit code):
- FP must be 0%
- Precision must be >= 85%

> **Note:** The git pre-commit hook (`.git/hooks/pre-commit`) runs this automatically when `agent-registry.json` or `maestro-agent-suggester.js` is staged. Manual runs are still recommended during development before committing.

Additional soft targets:
- WA < 10%
- FN < 15%

### Step 3: Document the change

When adding prompts, note in the commit message:
- How many prompts added
- Which categories/agents they cover
- Why they were added (new agent, observed gap, monthly refresh)

## Sourcing Real Prompts

### Current limitation

There is no automated mechanism to harvest raw user prompts. The delegation logs (`.claude/logs/delegation.jsonl`) contain orchestration instructions, not user prompts. Raw user prompts live in session transcript files outside the repo.

### Manual harvesting process

1. After a session, review the session's work to identify prompts that exercised routing
2. Note which agent was actually invoked and whether that was correct
3. Add the prompt with the correct `expected` value (what SHOULD have been suggested, not necessarily what WAS suggested)
4. Run regression to validate

### Future automation (not yet built)

A `UserPromptSubmit` hook could capture each user prompt to a log file inside the repo, enabling automated corpus expansion. This is not currently implemented.

## Coverage Requirements

Every triggerable agent should have:
- At least 5 TP prompts (prompts that should trigger this agent)
- At least 2 TN prompts (prompts that mention agent-related words but should NOT trigger it)
- At least 1 edge case (ambiguous prompts near the decision boundary)

Current thin-coverage agents (fewer than 5 TP prompts):
- delegater: 4 entries (internal agent, may be acceptable)

Agents at minimum coverage (exactly 5 TP prompts):
- file-reader: 5 entries
- reflector: 6 entries

## Versioning

The corpus has no internal version field. Track changes through git history:

```bash
# See corpus change history
git log --oneline -- .claude/hooks/test-prompts.json

# Compare against a previous version
git diff <commit>..HEAD -- .claude/hooks/test-prompts.json | head -50
```

## Anti-Patterns

- **Don't add synthetic prompts that sound robotic.** "Please utilize the excel agent to process my spreadsheet" is not how users talk. Use natural phrasing.
- **Don't add prompts with ambiguous expectations without marking them `ambiguous`.** If you're unsure which agent should handle a prompt, mark it ambiguous — don't guess.
- **Don't remove prompts because they're currently failing.** FN and WA cases are valuable signal. Fix the routing, not the test.
- **Don't add duplicate or near-duplicate prompts.** They inflate corpus size without improving coverage. Each prompt should test a distinct routing decision.
- **Don't modify existing prompt text.** If a prompt's expected value was wrong, fix the expected value. If the prompt itself is bad, add a replacement and mark the original with a comment.
