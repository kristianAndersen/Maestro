# Async 4-D Evaluation Workaround

**Status:** Design — pre-implementation  
**Problem:** TeammateIdle/TaskCompleted hooks cannot spawn subagents. 4-D evaluation must still gate every teammate output before acceptance.

---

## Constraint Summary (from API verification)

- Hook exit 0: allow completion
- Hook exit 2 + stderr: block completion, deliver stderr as feedback to teammate
- Agent-type hooks: read files only, NO Agent/Task tools
- Team Lead: CAN spawn subagents, CAN send mailbox messages
- Teammates: CAN spawn subagents, cannot spawn nested teams
- Mailbox path: `~/.claude/teams/{team-name}/inboxes/{teammate-name}/`
- Hook stdin fields: `session_id`, `transcript_path`, `cwd`, `hook_event_name`, `teammate_name`, `team_name`, `task_id`, `task_subject`, `task_description`

---

## Pattern A: Teammate Self-Evaluation

Hook exits 2, instructs the teammate to spawn 4d-evaluation itself, then re-attempt completion after writing a verdict marker file.

```
TaskCompleted hook fires
       |
       v (exit 2)
"QUALITY GATE: spawn 4d-evaluation, write verdict marker, re-attempt"
       |
       v
Teammate spawns 4d-evaluation subagent
       |
   EXCELLENT          NEEDS REFINEMENT
       |                    |
Write marker file      Teammate iterates
eval-done/{task_id}    (up to 3x), then loops
       |
Re-attempt completion
       |
Hook reads marker -> exit 0
```

**Hook pseudocode:**
```javascript
const event = JSON.parse(readFileSync('/dev/stdin', 'utf8'));
const { task_id, team_name } = event;
const markerPath = `~/.claude/teams/${team_name}/eval-done/${task_id}`;

if (existsSync(markerPath)) {
  const { verdict } = JSON.parse(readFileSync(markerPath));
  if (verdict === 'EXCELLENT') process.exit(0);
}

process.stderr.write(
  `QUALITY GATE task ${task_id}: spawn 4d-evaluation agent with your complete work product. ` +
  `If EXCELLENT: write {"verdict":"EXCELLENT","task_id":"${task_id}"} to ${markerPath} then re-attempt completion. ` +
  `If NEEDS REFINEMENT: iterate then loop. Max 3 iterations.`
);
process.exit(2);
```

**Pros:** No polling, evaluation runs with full access to teammate's work artifacts, low latency.

**Cons:** Reliability depends entirely on the teammate correctly following freeform text instructions. Teammate can fake EXCELLENT by writing a false marker. Quality guarantee is weak.

**Failure modes:**
- Teammate ignores feedback: loops until session timeout, no recovery
- Teammate writes fake marker: bypasses quality gate entirely
- Marker from prior session persists: add `session_id` to marker path to isolate

---

## Pattern B: File Queue + Team Lead Polling

Hook writes an evaluation request to a queue file and blocks completion. Team Lead polls the queue, runs evaluation independently, writes an approval file. Hook exits 0 on re-attempt when approval exists.

```
TaskCompleted hook fires
       |
       v
Write eval-queue/{task_id}.json
{task_id, teammate_name, transcript_path, queued_at}
       |
       v (exit 2)
"Evaluation queued. Awaiting Team Lead."
       |
       v (teammate idles)
Team Lead polls eval-queue/ (after each task)
       |
Team Lead spawns 4d-evaluation subagent
       |
   EXCELLENT          NEEDS REFINEMENT
       |                    |
Write eval-approved/   Send mailbox message
{task_id}              to teammate with coaching
Delete queue entry     Teammate iterates, loops
       |
Re-attempt completion
       |
Hook reads approval file -> exit 0
```

**Hook pseudocode:**
```javascript
const event = JSON.parse(readFileSync('/dev/stdin', 'utf8'));
const { task_id, team_name, teammate_name, transcript_path } = event;
const base = `~/.claude/teams/${team_name}`;

if (existsSync(`${base}/eval-approved/${task_id}`)) process.exit(0);

mkdirSync(`${base}/eval-queue`, { recursive: true });
writeFileSync(`${base}/eval-queue/${task_id}.json`, JSON.stringify({
  task_id, teammate_name, transcript_path, queued_at: new Date().toISOString()
}));
process.stderr.write(`Task ${task_id} queued for 4-D evaluation. Re-attempt completion after approval.`);
process.exit(2);
```

**Team Lead system prompt addition:**
```
After completing any task, check ~/.claude/teams/{team}/eval-queue/ for pending entries.
For each entry: read transcript_path, spawn 4d-evaluation agent with full work product.
If EXCELLENT: write approval file to eval-approved/{task_id}, delete queue entry.
If NEEDS REFINEMENT: send mailbox message to teammate_name with coaching (cite iteration count, max 3).
```

**Pros:** Quality guarantee is strong — Team Lead controls evaluation, teammate cannot fake approval. Clean audit trail via queue files.

**Cons:** Latency is high — teammate blocks until Team Lead processes queue. Team Lead must have a reliable trigger to poll; no native timer mechanism exists.

**Failure modes:**
- Team Lead never polls: queue grows, all teammates blocked indefinitely. Mitigation: make queue-check the first action in Team Lead's idle cycle.
- Team Lead reads incomplete transcript: snapshot work product into queue entry, not just path.
- Approval file from prior session: include session_id in approval file; hook validates it.
- Team Lead crashes mid-evaluation: queue entry remains, no forward progress. Mitigation: add a `locked_at` field; re-process entries locked >5 minutes.

---

## Pattern C: Hook-Driven Redirect with Embedded Marker

Hook checks work output file for a structured verdict marker. If absent: exit 2 with instruction to evaluate and embed verdict. If present: parse verdict, exit 0 (EXCELLENT) or exit 2 with coaching text (NEEDS REFINEMENT).

```
TaskCompleted hook fires
       |
Read outputs/{task_id}.md for <!-- EVAL_VERDICT --> marker
       |
  absent               present
    |                     |
  exit 2          EXCELLENT -> exit 0
"Evaluate,        NEEDS_REFINEMENT -> exit 2
embed marker,       with coaching from marker
re-attempt"
       |
Teammate spawns 4d-evaluation
Appends marker to output file:
<!-- EVAL_VERDICT: EXCELLENT
Coaching: n/a  Iteration: 1 -->
       |
Re-attempt -> hook reads marker -> exit 0
```

**Pros:** No separate state files, coaching travels with the artifact, low latency.

**Cons:** Teammate controls marker content — can write fake EXCELLENT. Output must go to a known convention path. Parsing structured data from freeform output is brittle.

**Failure modes:**
- Teammate writes marker to wrong path: hook never finds it, infinite loop
- Malformed marker: regex fails, treats valid evaluation as absent
- Multiple markers appended: read last match, not first
- Fake EXCELLENT marker: no mitigation within pattern — this is the core weakness

---

## Pattern D: External Process Bridge

Hook spawns a background shell script that uses the `claude` CLI to message the Team Lead. Team Lead evaluates and writes an approval file. Hook polls briefly, exits 0 or 2 based on result.

```
TaskCompleted hook fires
       |
       v
Spawn eval-bridge.sh {task_id} {team_name} (detached)
       |
       v (exit 2 immediately)
"External evaluation started. Re-attempt after mailbox coaching or approval."
       |
eval-bridge.sh:
  claude --team {team} --message "EVAL_REQUEST: task_id={id}"
       |
Team Lead receives message, spawns 4d-evaluation
       |
   EXCELLENT          NEEDS REFINEMENT
       |                    |
Write eval-approved/   Write to teammate mailbox
{task_id}
       |
Re-attempt -> hook reads approval -> exit 0
```

**Pros:** Evaluation in Team Lead context (strong quality guarantee). Hook does minimal work.

**Cons:** Requires `claude --team --message` CLI API — this is unverified. No documented inter-team messaging CLI flag exists as of this writing. Entire pattern fails silently if the API does not exist.

**Failure modes:**
- CLI API does not exist: pattern is completely broken with no fallback
- Background script times out: teammate blocked with no forward path
- Team Lead ignores message type: no approval or coaching written, permanent block

---

## Comparison

| Criterion | A: Self-Eval | B: Queue+Poll | C: Redirect | D: Ext. Bridge |
|---|---|---|---|---|
| Quality guarantee | Weak (teammate controls) | Strong (Team Lead controls) | Weak (teammate controls) | Strong (Team Lead controls) |
| Latency | Low | High | Low | Medium |
| Bypassable by teammate | Yes | No | Yes | No |
| Verified API surface | Yes | Yes | Yes | No (CLI unverified) |
| Complexity | Low | Medium | Medium | High |

---

## Recommendation: Pattern B as Primary, Pattern A as Opt-Out

**Use Pattern B (Queue + Team Lead Polling) as the default.**

It is the only pattern where the quality guarantee is not in the teammate's hands. The Team Lead independently evaluates and writes the approval — a teammate cannot fake EXCELLENT. This preserves Maestro's core invariant: every output passes 4-D evaluation before acceptance. The latency cost is real but bounded by how frequently the Team Lead checks the queue.

**Allow Pattern A as an explicit opt-out for research/exploration tasks** — tasks where the output is informational rather than a deliverable, and speed matters more than the quality gate. Gate this with a `quality_gate: self` field in the task description that the hook reads before deciding which path to take.

**Do not implement Pattern D** until the `claude --team --message` CLI API is confirmed to exist. Building on an unverified API surface wastes implementation time with no recovery path.

**Do not use Pattern C as primary.** Embedding verdict metadata in work artifacts mixes concerns and is bypassable.

### Implementation Checklist for Pattern B

1. Implement `task-completed-queue.js` hook writing to `eval-queue/`
2. Add queue-check step to Team Lead system prompt (mandatory after each task)
3. Team Lead writes `eval-approved/{task_id}` or sends mailbox coaching
4. Add cleanup: remove queue/approval files older than 24h
5. Add `quality_gate: self` opt-in for Pattern A on low-stakes tasks
6. Before any Pattern D work: verify `claude --team --message` CLI exists

