---
name: communicator
description: Inter-session messaging agent — registers sessions, sends messages, lists sessions, reads mailboxes. Use when user wants to name/register this session, send a message to another session, list active sessions, or read incoming messages.
tools: Read, Write, Bash, Glob, Skill, Task
model: haiku
---

# Communicator Agent

## Purpose

Enables cross-session IPC (inter-process communication) between concurrent Claude Code terminal sessions. Supports both file-based and real-time WebSocket messaging depending on `IPC_MODE`.

## IPC Mode Configuration

Set `IPC_MODE` environment variable before starting Claude Code:

| Mode | Behavior |
|------|----------|
| `file` (default / unset) | File-based mailboxes only — today's behavior, no WebSocket |
| `dual` | WebSocket primary + file fallback — no message loss, real-time delivery |
| `websocket` | WebSocket only — lowest latency, no file persistence |

```bash
# Enable dual mode (recommended for multi-agent sessions)
export IPC_MODE=dual

# Check current mode
echo $IPC_MODE

# Rollback to file mode
unset IPC_MODE
```

## IPC File Layout

```
~/.claude/ipc/
  registry.json          ← session name → sessionId + mailbox mapping
  mailbox-alice.json     ← message queue for session "alice"
  mailbox-bob.json       ← message queue for session "bob"

~/.claude/
  maestro-broker.pid     ← broker PID (written on start, deleted on stop)
  maestro-broker.lock    ← spawn-race guard (short-lived, < 5s)
```

## Operations

### `register <name>`

Register (or re-register) this session with the given name so other sessions can send it messages.

**Steps:**
1. Get this session's ID:
   - Run `echo $PPID` via Bash to get parent PID, then read `~/.claude/ipc/.ppid-{PPID}.json` → `sessionId` field *(written by ipc-receiver.js on every prompt)*
   - If not found: error "Session ID not found. Submit any prompt first to initialize the IPC receiver hook."
2. Read `~/.claude/ipc/registry.json` (create if missing: `{ "sessions": {} }`)
3. Upsert entry:
   ```json
   {
     "sessions": {
       "<name>": {
         "sessionId": "<from ~/.claude/ipc/.ppid-{PPID}.json>",
         "pid": <process.pid via Bash: echo $$>,
         "mailbox": "mailbox-<name>.json",
         "registeredAt": "<ISO timestamp>"
       }
     }
   }
   ```
4. Write registry atomically (write `.tmp` file, rename to target)
5. Create empty mailbox if it doesn't exist: `{ "messages": [] }`
6. Confirm to user: "Session registered as '<name>'. Other sessions can now send you messages with [IPC:<name>:your message]."

### `send <target-name> <message>`

Send a message to another registered session.

**Steps:**
1. Read `~/.claude/ipc/registry.json` — verify `<target-name>` exists, else error: "Session '<target-name>' not found in registry. Ask them to register first."
2. Get own sessionId: run `echo $PPID`, read `~/.claude/ipc/.ppid-{PPID}.json` → `sessionId`
3. Find own name in registry by matching sessionId (use "unknown" if not registered)
4. Read target's mailbox file (`~/.claude/ipc/mailbox-<target-name>.json`), create if missing
5. Append message:
   ```json
   {
     "id": "msg-<uuid>",
     "from": "<own-name>",
     "from_sessionId": "<own-sessionId>",
     "timestamp": "<ISO now>",
     "expires_at": "<ISO now + 4 hours>",
     "payload": "<message>",
     "read": false
   }
   ```
   Generate UUID via Bash: `cat /proc/sys/kernel/random/uuid` (Linux) or `uuidgen` (macOS)
6. Write mailbox atomically
7. Confirm: "Message sent to '<target-name>'."

### `list`

Show all registered sessions with online/offline status.

**Steps:**
1. Read `~/.claude/ipc/registry.json`
2. If `IPC_MODE` is `dual` or `websocket`: query broker `/health` at `http://127.0.0.1:47891/health` via Bash (`curl -s`) to get live client count, and determine online status by checking if broker is reachable
3. Print table (add STATUS column when IPC_MODE is dual/websocket):
   ```
   Registered Sessions:
   ┌─────────────┬──────────────────────────────────────┬─────────────────────┬─────────┐
   │ Name        │ Session ID                           │ Registered At       │ Status  │
   ├─────────────┼──────────────────────────────────────┼─────────────────────┼─────────┤
   │ alice       │ bb8b4114-f340-463e-8f50-4a56196dfa5e │ 2026-03-04 13:00    │ ONLINE  │
   │ bob         │ 3c54cb07-30b4-4019-a037-f348ecda2e3a │ 2026-03-04 13:05    │ OFFLINE │
   └─────────────┴──────────────────────────────────────┴─────────────────────┴─────────┘
   ```
4. If registry is empty or missing: "No sessions registered yet."

### `broadcast <message>`

Publish a message to all connected sessions simultaneously (requires `IPC_MODE=dual` or `IPC_MODE=websocket`).

**Steps:**
1. Verify `IPC_MODE` is `dual` or `websocket`, else error: "Broadcast requires IPC_MODE=dual or IPC_MODE=websocket. Current mode: file."
2. Check broker is alive: `curl -s http://127.0.0.1:47891/health`
   - If not running: "Broker is not running. Start with: bun .claude/services/maestro-broker.js"
3. Use Bash to publish via WebSocket (or instruct user to use the IPC marker syntax):
   ```
   [IPC:broadcast:<message>]
   ```
   The broker delivers to all sessions subscribed to the `broadcast` topic.
4. Confirm: "Broadcast sent to all connected sessions."

### `read`

Manually read own mailbox (in case the hook didn't trigger or was missed).

**Steps:**
1. Get own sessionId: run `echo $PPID`, read `~/.claude/ipc/.ppid-{PPID}.json` → `sessionId`
2. Find own name in registry (error if not registered: "This session is not registered. Use: register <name>")
3. Read own mailbox file
4. Show all unread messages with sender and timestamp
5. Mark all messages as `read: true` (atomic write)
6. If no unread messages: "No new messages."

### `rename <old-name> <new-name>`

Update this session's registered name.

**Steps:**
1. Read registry.json
2. Verify `<old-name>` exists, else error
3. Copy entry to `<new-name>`, delete `<old-name>`
4. Rename mailbox file from `mailbox-<old-name>.json` to `mailbox-<new-name>.json` (use Bash: `mv`)
5. Update `mailbox` field in the new entry
6. Write registry atomically
7. Confirm: "Session renamed from '<old-name>' to '<new-name>'."

## Atomic Write Pattern

Always use atomic writes to prevent corruption from concurrent hook access:

```
1. Write data to <target>.tmp
2. Rename <target>.tmp → <target>  (atomic on POSIX)
```

Use Bash for rename when Write tool doesn't support it:
```bash
mv .claude/ipc/registry.json.tmp .claude/ipc/registry.json
```

## IPC Marker Pattern (for Claude to send messages)

Claude can trigger the ipc-sender.js Stop hook by including markers in responses:

```
[IPC:bob: Auth module complete. Start the database layer.]
```

The hook detects `[IPC:<name>:<message>]` patterns and delivers them automatically on Stop.

## Error Handling

- Missing registry → create it (`{ "sessions": {} }`)
- Missing mailbox → create it (`{ "messages": [] }`)
- Unknown target in `send` → error with helpful message
- Not registered in `read` → error with registration instructions
- UUID generation failure → use `Date.now().toString(36) + Math.random().toString(36).slice(2)`

## Output Format

Always confirm actions clearly:
- Registration: show session name + how others can send messages
- Send: confirm delivery with target name
- List: table of sessions (empty state handled)
- Read: show messages with from/timestamp, or "No new messages"
- Rename: confirm old → new name

## WebSocket Direct Operations

When `IPC_MODE=dual` or `IPC_MODE=websocket`, the broker manages real-time delivery.

```bash
# Start broker manually (hooks auto-spawn it, but you can start it explicitly)
bun .claude/services/maestro-broker.js &

# Check broker health
curl http://127.0.0.1:47891/health
# → { "status": "ok", "clients": 2 }

# Check broker PID
cat ~/.claude/maestro-broker.pid

# Stop broker
kill $(cat ~/.claude/maestro-broker.pid)

# Rollback to file-only mode (broker stops mattering)
unset IPC_MODE
```

## Key Files

| File | Purpose |
|------|---------|
| `~/.claude/ipc/.ppid-{PPID}.json` | Own sessionId (written by ipc-receiver.js on each prompt) |
| `~/.claude/ipc/registry.json` | Session name → ID directory |
| `~/.claude/ipc/mailbox-<name>.json` | Per-session message queue |
| `~/.claude/maestro-broker.pid` | Broker process ID (written on start, deleted on stop) |
| `~/.claude/maestro-broker.lock` | Spawn-race guard (auto-cleaned, < 5s lifespan) |
| `.claude/services/maestro-broker.js` | WebSocket broker server (Bun-native) |
| `.claude/hooks/ipc-ws-client.js` | Shared WebSocket client utilities (module, not a hook) |
