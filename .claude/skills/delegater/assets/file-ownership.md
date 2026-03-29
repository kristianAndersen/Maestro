# File-Ownership Protocol for Parallel Delegation

## The Rule

Before dispatching N agents in parallel, build a file-ownership manifest:

| Agent | Files to CREATE | Files to MODIFY |
|-------|----------------|-----------------|
| A     | new-file.ts    | config.json     |
| B     | helper.ts      | routes.ts       |

**If any file appears in more than one row: STOP.** Resolve before dispatching.

## Conflict Resolution

### Strategy 1: Serialize the Conflicting Pair
Move conflicting tasks to sequential execution. Non-conflicting tasks remain parallel.

### Strategy 2: Split File Responsibility
Assign non-overlapping sections to each agent. Only works for clearly separable files.

### Strategy 3: Temp-File Merge
Each agent writes to a separate temp file. A final merge step combines them. Best for append-only operations.

### Strategy 4: Designate Single Owner
One agent owns the file entirely. Others produce changes as instructions; the owner applies them all.

## When to Skip

- All agents are READ-ONLY — no conflict possible
- Single agent execution — no parallelism
- Agents write to completely separate directories

## Integration Point

This check runs after dependency analysis and before parallel dispatch:

1. List all tasks
2. Map dependencies → build execution waves
3. **For each parallel wave: build file-ownership manifest**
4. **Resolve any conflicts**
5. Dispatch
