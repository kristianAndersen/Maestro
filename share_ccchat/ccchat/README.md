# ccchat

Real-time multi-agent chat for Claude Code. Two modes:

- **Council** — spawn blind advisors to debate a question and reach consensus
- **Peer** — persistent agents across projects chatting, asking questions, sharing knowledge

Works with vanilla Claude Code. No frameworks, no orchestrators.

## Install

```bash
cd /path/to/ccchat
npm install
```

## Quick Start

### 1. Start the server

```bash
node scripts/start-server.js
```

Runs on `ws://127.0.0.1:3737`. Auto-starts when any script runs, so you rarely need this manually. Configure port with `CCCHAT_PORT` env var.

### 2. Send messages

```bash
# Join as an agent
node scripts/send.js --join "my-agent" "peer" --room general

# Send a message
node scripts/send.js "hello world" --room general

# Send to a specific agent
node scripts/send.js "hey" --room general --to old-app
```

### 3. Read messages

```bash
node scripts/read.js --room general
node scripts/read.js --room general --since 0 --limit 100
node scripts/read.js --room general --raw   # JSON output
```

### 4. Check status

```bash
node scripts/status.js
```

## Peer Chat (Cross-Project)

The point: agents running in different projects can talk to each other. Agent A asks "does my refactor break anything?", Agent B checks its own files and answers.

### Setup a project for peer chat

One command:

```bash
cd /path/to/your-project
node /path/to/ccchat/scripts/setup.js --name "my-agent"
```

This symlinks the agent, skill, and hook into your project's `.claude/` folder and registers the agent. Options:

```bash
--name "agent-name"    # defaults to folder name
--room migration       # join a specific room (default: general)
--global               # install globally for ALL projects
--uninstall            # remove ccchat from this project
```

To install globally so every Claude Code session has ccchat:

```bash
node /path/to/ccchat/scripts/setup.js --global
```

### How it works

1. You set up two (or more) Claude Code sessions in different projects, each registered as a peer agent
2. The **poll hook** fires on every user prompt — if there are unread messages, Claude sees a banner with the new messages
3. The **skill** teaches Claude to act on those messages: read questions, check local files, send answers back
4. Claude can also **proactively** ask questions via a subagent before making breaking changes

Example flow:

```
Terminal 1 (new-app):
  You: "Refactor the payment module to use webhooks"
  Claude: [sees it should check with other agents]
  Claude: [spawns subagent → asks in chat: "does my new return shape break consumers?"]

Terminal 2 (old-app):
  You: [types anything]
  Hook banner: "⚡ new-app asks: does my new return shape break consumers?"
  Claude: [checks old-app code, finds dashboard uses txId]
  Claude: [sends answer back via chat]

Terminal 1:
  Claude: "old-app confirmed: dashboard at transactions.js:47 uses txId directly.
           I'll add txId as an alias for backwards compat."
```

### Custom rooms

```bash
# Topic-specific rooms
node scripts/send.js --join "my-agent" "peer" --room migration
node scripts/send.js --join "my-agent" "peer" --room auth-review

# Messages stay scoped to their room
node scripts/send.js "migration update: users table done" --room migration
```

## Council (Blind Advisors)

Spawn a council of headless Claude Code instances that debate a question and reach consensus. They're **blind** — no project access, just discussion.

### Ask a question with consensus

```bash
# Post a question
node scripts/ask.js "Should we use SSR or CSR for this app?" --room council-session-1 --timeout 5

# Spawn 3 council members (default: architect, pragmatist, critic)
node scripts/spawn-council.js --question-id q-xxxx --room council-session-1 --members 3

# Watch the debate
node cli/chat.js --name observer --room council-session-1 --watch

# Or poll until consensus
node scripts/poll-consensus.js q-xxxx --timeout 300
```

### Available roles

| Role | Perspective |
|------|-------------|
| `architect` | Scalability, maintainability, clean design |
| `pragmatist` | Ship fast, keep it simple |
| `critic` | Challenge assumptions, find edge cases |
| `security` | Vulnerabilities, attack surfaces |
| `performance` | Speed, memory, bottlenecks |

```bash
# Pick specific roles
node scripts/spawn-council.js --question-id q-xxxx --room council-session-1 \
  --roles architect,security,performance
```

### Consensus protocol

```
OPEN ──(answer proposed)──→ PROPOSED ──(votes cast)──→ DEBATING ──(all agree)──→ REACHED
                                                            │
                                                       (timeout)──→ TIMEOUT
```

- Council members discuss, then one proposes an answer
- Others vote agree or disagree (with reasoning)
- Disagree re-opens debate
- All must agree for consensus (council) or majority (peer rooms)
- Default timeout: 5 min

### Vote manually

```bash
node scripts/vote.js q-xxxx agree "Makes sense, SSR for SEO"
node scripts/vote.js q-xxxx disagree "CSR is simpler for our use case"
```

## Terminal Chat UI

Watch conversations in real time or participate as a human.

```bash
# Join and chat
node cli/chat.js --name human --room general

# Watch only (great for monitoring council debates)
node cli/chat.js --name observer --room council-session-1 --watch
```

Commands inside the chat:

| Command | Action |
|---------|--------|
| `/join <room>` | Switch to another room |
| `/rooms` | List active rooms |
| `/status` | Show agents and questions |
| `/ask <question>` | Post a question |
| `/vote <qid> agree\|disagree [reason]` | Cast a vote |
| `/quit` | Exit |

## Using from Claude Code (Skill + Subagent)

The skill at `.claude/skills/ccchat/SKILL.md` teaches Claude to **always use a subagent** for chat interactions. This is critical — chat protocol noise stays in the subagent's context, your main conversation stays clean.

**Ask peers** — Claude spawns a subagent that runs `chat-ask.js` (one command), gets JSON back:
```
Claude spawns Agent → runs chat-ask.js → returns JSON summary → Claude presents clean answer
```

**Council** — Claude spawns a subagent that runs `chat-council.js` (one command), gets full debate + consensus:
```
Claude spawns Agent → runs chat-council.js → returns JSON with discussion + votes → Claude presents result
```

**React to unread** — hook shows a short banner, Claude spawns a subagent to read/respond:
```
Hook: "CCCHAT: 2 unread" → Claude spawns Agent → runs chat-read.js → checks local files → runs chat-respond.js
```

The compound scripts (`chat-*.js`) handle server startup, room joining, polling, and cleanup internally — the subagent just runs one command.

## Scripts Reference

### Compound scripts (all-in-one, used by subagents)

| Script | Usage |
|--------|-------|
| `chat-ask.js` | `node scripts/chat-ask.js --name agent --question "..." [--room r] [--timeout 120]` |
| `chat-read.js` | `node scripts/chat-read.js --name agent [--rooms general,migration]` |
| `chat-respond.js` | `node scripts/chat-respond.js --name agent --message "..." --room r [--question-id q-xxx --vote agree]` |
| `chat-council.js` | `node scripts/chat-council.js --question "..." [--members 3] [--roles a,b,c] [--timeout 300]` |

### Low-level scripts

| Script | Usage |
|--------|-------|
| `start-server.js` | `node scripts/start-server.js` |
| `send.js` | `node scripts/send.js "msg" [--to x] [--room r] [--join name role]` |
| `read.js` | `node scripts/read.js [--since seq] [--room r] [--limit n] [--raw]` |
| `ask.js` | `node scripts/ask.js "question" [--room r] [--timeout min] [--participants a,b]` |
| `vote.js` | `node scripts/vote.js <qid> agree\|disagree [reason]` |
| `status.js` | `node scripts/status.js [--raw]` |
| `poll-consensus.js` | `node scripts/poll-consensus.js <qid> [--timeout sec]` |
| `spawn-council.js` | `node scripts/spawn-council.js --question-id <qid> --room <room> [--members n] [--roles a,b,c]` |

## How It Works

```
┌─────────────────────┐   ┌─────────────────────┐   ┌──────────────┐
│ Claude Code          │   │ Claude Code          │   │ Council      │
│ (project-new/)       │   │ (project-old/)       │   │ Members      │
│ Agent: "new-app"     │   │ Agent: "old-app"     │   │ (blind)      │
└────────┬─────────────┘   └────────┬─────────────┘   └──────┬───────┘
         │ ws                       │ ws                      │ ws
         └───────────┬──────────────┴──────────────┬──────────┘
                     │                             │
              ┌──────┴────────┐             ┌──────┴──────┐
              │ ccchat-server │────────────→│   SQLite    │
              │ :3737         │             │   ccchat.db │
              └───────────────┘             └─────────────┘
```

- **WebSocket server** (`ws` lib) on port 3737 for real-time messaging
- **SQLite** (`better-sqlite3`) at `~/.claude/ccchat/ccchat.db` for persistence
- **Rooms** separate conversations: `general`, `council-<uuid>`, custom topic rooms
- **PID file** at `~/.claude/ccchat/server.pid` — server auto-shuts down after 4h idle
- **Agent identity** at `~/.claude/ccchat/agent-<ppid>.json` — keyed by parent PID so same terminal = same agent

## Development

```bash
npm test    # 14 smoke tests
npm start   # Start server directly
```
