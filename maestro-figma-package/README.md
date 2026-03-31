# 🎼 Maestro Figma Bridge

Talk to Figma from Claude Code. No MCP, no third-party dependencies — just a WebSocket bridge that lets Claude read and modify Figma designs directly.

Works with **Node.js 22+** or **Bun 1.0+**.

## What's in the box

```
.claude/
├── scripts/
│   ├── figma-relay.js        # WebSocket relay server (run this first)
│   └── figma-bridge.js       # CLI bridge (Claude uses this to talk to Figma)
├── plugins/figma/
│   ├── manifest.json          # Figma plugin manifest
│   ├── code.js                # 86+ Figma API command handlers
│   ├── ui.html                # Plugin UI with WebSocket client
│   └── setcharacters.js       # Mixed-font text helper
├── commands/
│   └── figma.md               # /figma slash command (start|stop|status|connect)
├── agents/
│   └── figma.md               # Agent definition (tells Claude how to use the bridge)
└── skills/figma/
    ├── SKILL.md               # Quick reference (batch mode, trimming, colors)
    └── assets/
        ├── commands.md         # Full command catalog (86+ commands)
        ├── patterns.md         # Design workflow patterns
        └── gotchas.md          # 25 documented gotchas and edge cases
```

## Requirements

- [Node.js](https://nodejs.org) >= 22 or [Bun](https://bun.sh) >= 1.0
- [Figma](https://figma.com) desktop app
- [Claude Code](https://claude.ai/code) CLI
- `ws` npm package (Node.js relay only — `npm install ws`)

## Quick Start

### 1. Install

```bash
# Clone/download this package, then:
./setup.sh /path/to/your/project

# Or install to current directory:
./setup.sh .
```

### 2. Start the relay

```bash
# With Node.js (needs: npm install ws)
node .claude/scripts/figma-relay.js

# With Bun (no extra packages needed)
bun .claude/scripts/figma-relay.js
```

This runs a WebSocket server on `localhost:3055`. Keep it running.

Or use the slash command inside Claude Code:
```
/figma start
```

### 3. Load the plugin in Figma

1. Open Figma desktop app
2. Go to **Plugins → Development → Import plugin from manifest**
3. Select `.claude/plugins/figma/manifest.json`
4. Run the plugin — it appears as "🎼 Maestro Figma Bridge"
5. Click **Connect** — note the channel ID displayed

### 4. Test

```bash
# Verify connection (use node or bun)
node .claude/scripts/figma-bridge.js --channel="YOUR_CHANNEL" --command=ping

# Read the document
node .claude/scripts/figma-bridge.js --channel="YOUR_CHANNEL" --command=get_document_info
```

### 5. Use with Claude Code

Start Claude Code in your project. The figma agent activates when you mention Figma, design, banner, or similar keywords. Tell Claude the channel ID and start designing.

### /figma Command

Control the relay from inside Claude Code:

```
/figma start              Start the relay server
/figma stop               Stop the relay server
/figma status             Check relay & connection status
/figma connect <channel>  Connect and test a channel
```

## How it works

```
Claude Code → figma-bridge.js → WebSocket relay (:3055) → Figma plugin → Figma API
```

- **Relay** (`figma-relay.js`): Channel-based WebSocket pub/sub. Auto-detects Bun vs Node.js runtime. Both the bridge and plugin join the same channel.
- **Bridge** (`figma-bridge.js`): Stateless CLI. Each call connects, joins channel, sends command, gets response, exits. Works with both Node.js and Bun.
- **Plugin** (`plugins/figma/`): Runs inside Figma. Receives commands via WebSocket, executes them against the Figma API, returns results.

## Features

### Batch Mode

Send multiple commands in one connection (~200ms saved per command):

```bash
echo '[
  {"id":"doc","command":"get_document_info"},
  {"id":"sel","command":"get_selection"}
]' | node .claude/scripts/figma-bridge.js --channel="CH_ID" --batch
```

### Response Trimming

Prevent large responses from blowing up context:

```bash
# Limit depth
--maxDepth=3

# Project specific fields
--fields='id,name,type,absoluteBoundingBox'

# Size safety net
--maxSize=50000
```

### 86+ Commands

Create frames, rectangles, text, ellipses. Set colors, fonts, effects. Clone nodes, export images, manage pages. Full catalog in `skills/figma/assets/commands.md`.

## ⚠️ Color Gotcha

Figma uses THREE different color formats depending on the command:

| Command | Format |
|---------|--------|
| `set_fill_color` | `{"color":{"r":1,"g":0,"b":0,"a":1}}` (nested) |
| `create_frame` | `{"fillColor":{"r":1,"g":0,"b":0,"a":1}}` (named) |
| `create_text` | `{"fontColor":{"r":1,"g":0,"b":0,"a":1}}` |

Colors are 0-1 floats, not 0-255. Convert: divide each channel by 255.

See `skills/figma/assets/gotchas.md` for all 25 documented gotchas.

## License

MIT
