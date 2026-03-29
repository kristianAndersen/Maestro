---
name: figma
description: Use this skill whenever working with Figma designs — creating frames, cloning banners, modifying layouts, reading design files, or executing any design operation in the Figma canvas. Activate when the user mentions Figma or asks to create, edit, or inspect a design.
---

# Figma Skill

Design operations in Figma through the websocket bridge.

## Quick Start

```bash
# Join channel
bun .claude/scripts/figma-bridge.js --channel="CH_ID" --command=join

# Read document
bun .claude/scripts/figma-bridge.js --channel="CH_ID" --command=get_document_info

# Create a frame
bun .claude/scripts/figma-bridge.js --channel="CH_ID" --command=create_frame --params='{"x":0,"y":0,"width":1080,"height":1080,"name":"Banner v2"}'
```

## Batch Mode

Send multiple commands in one connection (saves ~200ms per command):

```bash
echo '[
  {"id":"doc","command":"get_document_info"},
  {"id":"sel","command":"get_selection"},
  {"id":"node1","command":"get_node_info","params":{"nodeId":"123:456"},"maxDepth":2}
]' | bun .claude/scripts/figma-bridge.js --channel="CH_ID" --batch
```

Returns ID-keyed results:
```json
{"batchResults":{"doc":{...},"sel":{...},"node1":{...}},"summary":{"total":3,"succeeded":3,"failed":0}}
```

**Note:** Figma plugin is single-threaded — commands execute sequentially. Batching saves connection overhead, not execution time.

## Response Trimming

Large responses (e.g. `get_node_info` returns 6MB+) blow up context. Use trimming:

```bash
# Depth limit — great for exploration
--maxDepth=3

# Field projection — great when you know what you need
--fields='id,name,type,absoluteBoundingBox'

# Size safety net — prevents context blowup
--maxSize=50000
```

Per-command in batch mode:
```json
{"id":"deep","command":"get_node_info","params":{"nodeId":"X"},"maxDepth":2}
```

## ⚠️ Color Format — THREE Different Shapes

| Context | Format |
|---------|--------|
| `set_fill_color`, `set_stroke_color` | `{"color":{"r":1,"g":0,"b":0,"a":1}}` (nested) |
| `set_selection_colors` | `{"r":1,"g":0,"b":0,"a":1}` (flat) |
| `create_frame`, `create_ellipse`, etc. | `{"fillColor":{"r":1,"g":0,"b":0,"a":1}}` (named) |
| `create_text` | `{"fontColor":{"r":1,"g":0,"b":0,"a":1}}` |
| `create_sticky` (FigJam) | `{"color":"pink"}` (string!) |

Convert hex: divide each channel by 255. `#3366CC` → `r:0.2, g:0.4, b:0.8`

## Coordinates

- All positions are **local** (relative to parent)
- `get_node_info` returns `absoluteBoundingBox` (global) AND `localPosition` (local)
- **Always use `localPosition` for `move_node`** — using absolute coords will misplace nodes

## Font Loading

```bash
# REQUIRED before set_font_name / set_font_weight:
load_font_async → set_font_name

# NOT required for create_text (handles loading internally)
```

Load each style separately — loading "Regular" does NOT grant "Bold".

## Workflow Patterns

### Read → Plan → Create → Verify
1. `get_document_info` — understand what exists
2. Plan structure (frames, positions, hierarchy)
3. Create top-down: frames → shapes → text
4. `get_node_info` on created nodes to verify

### Banner Cloning
1. `get_node_info` on source banner (use `--maxDepth=2` to keep response small)
2. `clone_node` with new x,y position
3. `get_node_info` on clone — get new child IDs
4. Batch-modify clone children (text, colors, images)
5. `rename_node` on clone

### Common Sizes
| Format | Width | Height |
|--------|-------|--------|
| Instagram Post | 1080 | 1080 |
| Instagram Story | 1080 | 1920 |
| Facebook Post | 1200 | 630 |
| Twitter/X Post | 1200 | 675 |
| LinkedIn Post | 1200 | 627 |

## Deep Dives

- `assets/commands.md` — Full command catalog with all parameters
- `assets/patterns.md` — Design patterns for banners, layouts, text styling
- `assets/gotchas.md` — Known parameter inconsistencies and surprises
