# Figma Bridge: Known Gotchas

## 🔴 Critical — Will Cause Bugs

### Color parameter shapes are inconsistent
Three different formats depending on the command type:

| Context | Format | Example |
|---------|--------|---------|
| **Modification** (`set_fill_color`, `set_stroke_color`) | Nested `color` object | `{"nodeId":"X","color":{"r":1,"g":0,"b":0,"a":1}}` |
| **Selection** (`set_selection_colors`) | Flat RGBA | `{"nodeId":"X","r":1,"g":0,"b":0,"a":1}` |
| **Creation** (`create_frame`, `create_ellipse`, etc.) | Named object | `{"fillColor":{"r":1,"g":0,"b":0,"a":1}}` |
| **Text creation** (`create_text`) | Named `fontColor` | `{"fontColor":{"r":1,"g":0,"b":0,"a":1}}` |
| **FigJam stickies** (`create_sticky`) | String name | `{"color":"pink"}` (NOT RGBA!) |

### `create_rectangle` has NO color params
Unlike `create_frame`, `create_ellipse`, `create_polygon`, `create_star` — rectangles cannot be colored at creation. You must:
1. `create_rectangle` → get ID
2. `set_fill_color` with the ID

### Coordinates: `absoluteBoundingBox` vs `localPosition`
- `get_node_info` returns BOTH global (`absoluteBoundingBox`) and local (`localPosition`) coordinates
- `move_node` and all creation commands use **local** coordinates (relative to parent)
- Using `absoluteBoundingBox` values with `move_node` will misplace nodes unless parent is at canvas origin
- **Always use `localPosition` for movement**

### Font loading is required before font changes
```
✅ Correct:
1. load_font_async({ family: "Inter", style: "Bold" })
2. set_font_name({ nodeId, family: "Inter", style: "Bold" })

❌ Wrong — will error:
1. set_font_name({ nodeId, family: "Inter", style: "Bold" })
```
BUT: `create_text` does NOT need `load_font_async` — it handles loading internally. This asymmetry is by design.

Loading "Regular" does NOT grant access to "Bold" — load each style separately.

### `get_node_info` silently filters out VECTOR nodes
The response processor returns `null` for VECTOR type nodes. SVG imports create VECTOR children that are invisible to `get_node_info` traversal. No error is thrown.

---

## 🟡 Important — Will Cause Confusion

### `set_fill_color` vs `set_selection_colors`
- `set_fill_color` — changes ONE node's direct fill
- `set_selection_colors` — recursively changes ALL fills AND strokes in node + descendants
- Use `set_selection_colors` for icon recoloring, `set_fill_color` for individual elements

### `set_guide` / `set_grid` REPLACE everything
Both replace all existing guides/grids — no additive mode. To add one guide:
1. `get_guide` — read existing
2. Append your new guide to the array
3. `set_guide` with the full merged list

### `set_image` vs `set_image_fill` — two tools, same purpose
| Tool | Location | Param name | Accepts URL? |
|------|----------|-----------|-------------|
| `set_image` | modification-tools | `imageData` (base64 only) | No |
| `set_image_fill` | image-tools | `imageSource` + `sourceType` | Yes |

Use `set_image_fill` — it's more flexible.

### Image tools throw differently
Image tools (`set_image_fill`, `replace_image_fill`, `apply_image_transform`, `set_image_filters`) throw errors instead of returning error content blocks. All other tools return `{ content: [{ type: "text", text: "Error: ..." }] }`.

### `create_component_instance` needs `componentKey`, NOT `componentId`
`get_local_components` returns objects with both `key` and `id`. Use the `key` field to instantiate. Passing `id` will fail.

### `reorder_node` — index 0 is the BOTTOM
`index: 0` = back of the stack (behind everything). This is the opposite of Figma's visual layer panel where top = top.

---

## 🟢 Minor — Good to Know

### Alpha `a: 0` creates invisible nodes silently
Passing `a: 0` succeeds — node gets the fill but is fully transparent. No warning.

### `rotate_node` bypasses lock state
Locked nodes can still be rotated programmatically. `set_node_properties({ locked: true })` does NOT prevent `rotate_node`.

### `set_annotation` / `get_annotation` need Proposed API
Requires Figma Desktop with `enableProposedApi`. Will error in browser or without the flag.

### `get_image_bytes` is broken / commented out
Do not attempt — not registered, will fail.

### `set_stroke_color` default weight is 1, not 0
Omitting `strokeWeight` sends `1`. Pass `strokeWeight: 0` explicitly if you want no stroke.

### `set_multiple_text_contents` outer `nodeId` is mostly ignored
The actual replacements are driven by the inner `[{ nodeId, text }]` array. The outer `nodeId` is informational.

### `boolean_operation` requires same parent
All nodes must share the same parent. Not validated in the bridge — error comes from Figma.

### `create_connector` (FigJam) — all endpoint params are optional
Schema allows calling with no start or end. Will error from Figma side.

### Timeout reference
| Command | Timeout |
|---------|---------|
| Default | 60s |
| `export_node_as_image`, `get_svg` | 120s |
| `join` / `ping` | 12s |
| WebSocket connect | 10s |
| Progress inactivity | 120s (auto-resets) |
