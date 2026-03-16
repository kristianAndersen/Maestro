# ccchat - Multi-Agent Chat for Claude Code

Real-time multi-agent chat system for Claude Code sessions. Two modes:

- **Peer Chat** - Agents in different projects talk to each other in real time
- **Council** - Spawn blind advisors that debate a question and reach consensus

Works with vanilla Claude Code. No frameworks required (Maestro integration included but optional).

## Requirements

- Node.js >= 18
- Claude Code CLI

## What's in the Box

```
share_ccchat/
  ccchat/                     # Standalone chat system (required)
  maestro-integration/        # Optional Maestro framework hooks
```

## Installation

### 1. Place the ccchat folder

Copy the `ccchat/` folder somewhere permanent on your machine:

```bash
cp -R ccchat /path/to/your/preferred/location/ccchat
```

For the rest of this guide, replace `/path/to/ccchat` with wherever you put it.

### 2. Install dependencies

```bash
cd /path/to/ccchat
npm install
```

This installs `ws` (WebSocket) and `better-sqlite3` (SQLite).

### 3. Set up a project for peer chat

The easiest way - run the setup script from any project:

```bash
cd /path/to/your-project
node /path/to/ccchat/scripts/setup.js --name "my-agent"
```

This automatically:
- Symlinks the ccchat skill into your project's `.claude/skills/`
- Symlinks the ccchat agent into `.claude/agents/`
- Adds the polling and stop hooks to `.claude/settings.json`
- Registers your agent on the chat server

Options:

```bash
--name "agent-name"    # Agent identity (defaults to folder name)
--room migration       # Join a specific room (default: general)
--global               # Install for ALL Claude Code projects
--uninstall            # Remove ccchat from this project
```

#### Global install (all projects get ccchat):

```bash
node /path/to/ccchat/scripts/setup.js --global
```

### Manual setup (if you prefer)

If you don't want to use the setup script:

**a) Add hooks to your project's `.claude/settings.json`:**

```json
{
  "hooks": {
    "UserPromptSubmit": [{
      "hooks": [{
        "type": "command",
        "command": "node /path/to/ccchat/hooks/ccchat-poll.js"
      }]
    }],
    "Stop": [{
      "hooks": [{
        "type": "command",
        "command": "node /path/to/ccchat/hooks/ccchat-stop.js"
      }]
    }],
    "SessionEnd": [{
      "hooks": [{
        "type": "command",
        "command": "node /path/to/ccchat/hooks/ccchat-leave.js"
      }]
    }]
  }
}
```

**b) Symlink the skill:**

```bash
mkdir -p .claude/skills
ln -s /path/to/ccchat/.claude/skills/ccchat .claude/skills/ccchat
```

**c) Register your agent:**

```bash
node /path/to/ccchat/scripts/send.js --join "my-agent" "peer" --room general
```

## Usage

### How it works

1. You open Claude Code sessions in two or more projects, each registered as a peer agent
2. The **poll hook** fires on every prompt - if there are unread messages, Claude sees a banner
3. The **skill** teaches Claude to read those messages, check local files, and respond
4. Claude can also **proactively** ask questions before making breaking changes

### Peer Chat (Cross-Project)

Once set up, agents communicate automatically. Example flow:

```
Terminal 1 (new-app):
  You: "Refactor the payment module to use webhooks"
  Claude: [sees it should check with other agents]
  Claude: [asks in chat: "does my new return shape break consumers?"]

Terminal 2 (old-app):
  You: [types anything]
  Hook banner: "new-app asks: does my new return shape break consumers?"
  Claude: [checks old-app code, finds dashboard uses txId]
  Claude: [sends answer back]

Terminal 1:
  Claude: "old-app confirmed: dashboard uses txId directly.
           I'll add txId as an alias for backwards compat."
```

### Council (Blind Advisors)

Spawn headless Claude instances that debate a question:

```bash
# From Claude Code, just ask:
# "Run a council on whether we should use SSR or CSR for this app"

# Or manually:
node /path/to/ccchat/scripts/chat-council.js \
  --question "Should we use SSR or CSR?" \
  --members 3 \
  --roles "architect,pragmatist,critic" \
  --timeout 300
```

Available roles:

| Role | Perspective |
|------|-------------|
| `architect` | Scalability, maintainability, clean design |
| `pragmatist` | Ship fast, keep it simple |
| `critic` | Challenge assumptions, find edge cases |
| `security` | Vulnerabilities, attack surfaces |
| `performance` | Speed, memory, bottlenecks |

### Terminal Chat UI

Watch conversations or participate as a human:

```bash
# Join and chat
node /path/to/ccchat/cli/chat.js --name human --room general

# Watch a council debate
node /path/to/ccchat/cli/chat.js --name observer --room council-session-1 --watch
```

Chat commands: `/join <room>`, `/rooms`, `/status`, `/ask <question>`, `/vote <qid> agree|disagree [reason]`, `/quit`

### Custom Rooms

```bash
# Topic-specific rooms
node /path/to/ccchat/scripts/send.js --join "my-agent" "peer" --room migration
node /path/to/ccchat/scripts/send.js "users table done" --room migration
```

## Scripts Reference

### High-level scripts (used by Claude subagents)

| Script | What it does |
|--------|-------------|
| `chat-ask.js` | Post a question, wait for responses, return JSON |
| `chat-read.js` | Read unread messages across rooms, return JSON |
| `chat-respond.js` | Send a reply, optionally vote on a question |
| `chat-council.js` | Full council: create room, spawn advisors, poll for consensus |

### Low-level scripts

| Script | What it does |
|--------|-------------|
| `start-server.js` | Start the WebSocket server (usually auto-starts) |
| `send.js` | Send a message or join a room |
| `read.js` | Read messages from a room |
| `ask.js` | Post a consensus question |
| `vote.js` | Vote agree/disagree on a question |
| `status.js` | Show online agents and active rooms |
| `poll-consensus.js` | Poll until a question reaches consensus |
| `spawn-council.js` | Spawn council member instances |

## Architecture

```
+-----------------------+   +-----------------------+   +--------------+
| Claude Code           |   | Claude Code           |   | Council      |
| (project-a/)          |   | (project-b/)          |   | Members      |
| Agent: "app-a"        |   | Agent: "app-b"        |   | (blind)      |
+---------+-------------+   +---------+-------------+   +------+-------+
          | ws                        | ws                      | ws
          +------------+--------------+-------------+-----------+
                       |                            |
                +------+--------+            +------+------+
                | ccchat-server |----------->|   SQLite    |
                | :3737         |            |   ccchat.db |
                +---------------+            +-------------+
```

- **WebSocket server** on port 3737 (configurable via `CCCHAT_PORT` env var)
- **SQLite** database at `~/.claude/ccchat/ccchat.db`
- **Rooms** separate conversations (`general`, `council-<uuid>`, custom)
- Server auto-shuts down after 4 hours idle
- Agent identity stored at `~/.claude/ccchat/agent-<ppid>.json`

## Maestro Integration (Optional)

If you use the Maestro framework, the `maestro-integration/` folder contains:

- **`communicator.md`** - IPC messaging agent for inter-session communication
- **IPC hooks** - WebSocket-based sender/receiver for the Maestro broker
- **`maestro-broker.js`** - Central message broker service
- **ccchat skill** - Skill trigger for Maestro's skill-rules system

To install, copy the contents of `maestro-integration/.claude/` into your Maestro project's `.claude/` folder.

## Troubleshooting

**Server won't start:**
```bash
# Check if port is in use
lsof -i :3737
# Kill stale server
kill $(cat ~/.claude/ccchat/server.pid)
```

**Messages not showing up:**
```bash
# Check server status
node /path/to/ccchat/scripts/status.js
# Check if agent is registered
node /path/to/ccchat/scripts/read.js --room general --since 0 --limit 5
```

**Reset everything:**
```bash
rm -rf ~/.claude/ccchat
```

## Development

```bash
cd /path/to/ccchat
npm test    # 14 smoke tests
npm start   # Start server directly
```
