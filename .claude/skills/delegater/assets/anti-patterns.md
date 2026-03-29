# Delegater: Anti-Patterns

Detailed anti-pattern pairs with examples. Load this when you need to verify your coordination plan avoids common failure modes, or when debugging a broken multi-agent workflow.

---

## Anti-Pattern 1: Sequential When Parallel Possible

Unnecessary sequencing wastes execution time proportional to the number of independent tasks.

```
BAD:
  Fetch url1
  Wait
  Fetch url2
  Wait
  Fetch url3
  Total time: 3x fetch time

GOOD:
  Fetch url1, url2, url3 in parallel (one message, 3 Task calls)
  Wait for all
  Continue
  Total time: 1x fetch time
```

**Rule:** If tasks don't share a data dependency, run them in the same message.

---

## Anti-Pattern 2: Parallel When Dependencies Exist

Running a dependent task before its prerequisite completes means it has no input to work with.

```
BAD:
  Call analyze() before fetch() completes
  → analyze has no data
  → produces garbage output or fails

GOOD:
  Call fetch() first
  Wait for result
  Call analyze() with fetch result
  → analyze has real data to process
```

**Rule:** Always ask "Does B need A's output?" before deciding parallel vs sequential.

---

## Anti-Pattern 3: Lost Data Flow

Calling a downstream agent without passing the upstream result is the most common silent failure in pipelines.

```
BAD:
  Agent A returns: "Result: important_data"
  Agent B receives: "Do your thing"  ← no data passed
  → B has nothing to work with

GOOD:
  Agent A returns: "Result: important_data"
  Agent B receives: "Process this: important_data"  ← data explicitly included
```

**Rule:** Extract the relevant output from each agent and explicitly include it in the next agent's prompt.

---

## Anti-Pattern 4: No Progress Tracking

Long workflows without progress visibility leave Maestro and the user unable to distinguish "working" from "stuck."

```
BAD:
  10-step workflow
  No phase summaries in return reports
  → Maestro has no idea what completed, what's pending

GOOD:
  Include phase status in each agent return report:
    "Phase 1: Data collection — completed"
    "Phase 2: Processing — in progress"
    "Phase 3: Report — pending"
```

**Rule:** For 3+ step workflows, always include a phase status block in each return report.

---

## Anti-Pattern 5: Over-Coordination

Using the delegater skill for single-agent tasks adds cognitive overhead with no benefit.

```
BAD:
  Single task: "Fetch this URL"
  Apply delegater coordination patterns
  Build execution plan, dependency matrix
  → Unnecessary complexity

GOOD:
  Single task: Call fetch directly
  Delegater is for multi-agent workflows only
```

**Rule:** If there's only one agent involved, execute directly. Delegater adds value at 2+ agents.

---

## Anti-Pattern 6: Parallel File Collision

Two agents writing to the same file in parallel causes silent data loss — one agent's changes overwrite the other's without error.

```
BAD:
  Agent A writes to config.json  ─┐
  Agent B writes to config.json  ─┘ (parallel)
  → One agent's changes silently lost
  → No error raised, no warning

GOOD:
  Before parallel dispatch:
  1. List files each agent will touch
  2. If overlap found → serialize those tasks OR split file responsibilities
  3. Only dispatch when each file has exactly one owner
```

**Rule:** Build a file-ownership manifest before every parallel dispatch. See `assets/file-ownership.md` for the full protocol.

---

## Anti-Pattern 7: Passing Entire Agent Output as Next Input

Passing a full agent report (including headers, metadata, status sections) as the next agent's input pollutes the context and can confuse the downstream agent.

```
BAD:
  Agent A returns 400-line report with headers, evidence, metrics
  Agent B receives: "Process this: [entire 400-line report]"
  → B must parse noise to find signal
  → Context pollution, higher error rate

GOOD:
  Agent A returns 400-line report
  Extract: the 3-line summary or the specific data field needed
  Agent B receives: "Process this: [extracted 3-line result]"
```

**Rule:** Transform outputs before passing. Extract only what the next agent needs.

---

## Anti-Pattern 8: Ignoring Partial Failures in Parallel Batches

When one of several parallel tasks fails, silently discarding it or crashing the whole workflow both lose value.

```
BAD (crash everything):
  fetch(url1) → SUCCESS
  fetch(url2) → FAIL
  fetch(url3) → SUCCESS
  → Stop workflow entirely because url2 failed
  → Lose url1 and url3 results

BAD (silent discard):
  Same scenario
  → Continue as if url2 succeeded
  → Downstream agent receives incomplete data with no warning

GOOD:
  fetch(url1) → SUCCESS: content1
  fetch(url2) → FAIL: note failure
  fetch(url3) → SUCCESS: content3
  → Continue with content1 + content3
  → Include explicit note in final result: "url2 unavailable — results based on url1 and url3 only"
```

**Rule:** Partial failures in optional parallel tasks should continue with available data, documented. Partial failures in required parallel tasks should fail fast.
