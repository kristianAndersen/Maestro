# Figma Design Patterns

## Banner Creation Pattern

### Step 1: Create the container frame
```bash
bun .claude/scripts/figma-bridge.js --channel="$CH" --command=create_frame \
  --params='{"x":0,"y":0,"width":1080,"height":1080,"name":"Banner - Spring Sale","fillColor":{"r":0.95,"g":0.95,"b":0.95,"a":1}}'
```
Save the returned `id` — all children go inside this frame.

### Step 2: Add background shape (if gradient/complex)
```bash
bun .claude/scripts/figma-bridge.js --channel="$CH" --command=create_rectangle \
  --params='{"x":0,"y":0,"width":1080,"height":1080,"parentId":"FRAME_ID","name":"bg"}'

bun .claude/scripts/figma-bridge.js --channel="$CH" --command=set_gradient \
  --params='{"nodeId":"RECT_ID","type":"GRADIENT_LINEAR","stops":[{"position":0,"color":{"r":0.1,"g":0.2,"b":0.8,"a":1}},{"position":1,"color":{"r":0.5,"g":0.1,"b":0.9,"a":1}}]}'
```

### Step 3: Add text elements
```bash
# Headline
bun .claude/scripts/figma-bridge.js --channel="$CH" --command=create_text \
  --params='{"x":100,"y":300,"text":"SPRING SALE","fontSize":72,"fontWeight":700,"fontColor":{"r":1,"g":1,"b":1,"a":1},"parentId":"FRAME_ID","name":"headline"}'

# Subtext
bun .claude/scripts/figma-bridge.js --channel="$CH" --command=create_text \
  --params='{"x":100,"y":400,"text":"Up to 50% off","fontSize":36,"fontWeight":400,"fontColor":{"r":1,"g":1,"b":1,"a":0.8},"parentId":"FRAME_ID","name":"subtext"}'
```

### Step 4: Add CTA button
```bash
# Button background
bun .claude/scripts/figma-bridge.js --channel="$CH" --command=create_rectangle \
  --params='{"x":100,"y":500,"width":300,"height":60,"parentId":"FRAME_ID","name":"cta-bg"}'

bun .claude/scripts/figma-bridge.js --channel="$CH" --command=set_fill_color \
  --params='{"nodeId":"CTA_BG_ID","color":{"r":1,"g":0.8,"b":0,"a":1}}'

bun .claude/scripts/figma-bridge.js --channel="$CH" --command=set_corner_radius \
  --params='{"nodeId":"CTA_BG_ID","radius":30}'

# Button text
bun .claude/scripts/figma-bridge.js --channel="$CH" --command=create_text \
  --params='{"x":140,"y":515,"text":"SHOP NOW","fontSize":20,"fontWeight":700,"fontColor":{"r":0,"g":0,"b":0,"a":1},"parentId":"FRAME_ID","name":"cta-text"}'
```

---

## Banner Cloning/Versioning Pattern

Use this when creating variations of existing banners.

### Step 1: Read the source
```bash
# Get full structure
bun .claude/scripts/figma-bridge.js --channel="$CH" --command=get_node_info \
  --params='{"nodeId":"SOURCE_BANNER_ID"}'
```
Note: children array, their types, positions, and IDs.

### Step 2: Clone
```bash
# Position clone next to original (offset by width + gap)
bun .claude/scripts/figma-bridge.js --channel="$CH" --command=clone_node \
  --params='{"nodeId":"SOURCE_BANNER_ID","x":1200,"y":0}'
```

### Step 3: Get clone's child IDs
```bash
bun .claude/scripts/figma-bridge.js --channel="$CH" --command=get_node_info \
  --params='{"nodeId":"CLONE_ID"}'
```
Map original child names to clone child IDs.

### Step 4: Modify the clone
```bash
# Change headline text
bun .claude/scripts/figma-bridge.js --channel="$CH" --command=set_text_content \
  --params='{"nodeId":"CLONE_HEADLINE_ID","text":"SUMMER SALE"}'

# Change background color
bun .claude/scripts/figma-bridge.js --channel="$CH" --command=set_fill_color \
  --params='{"nodeId":"CLONE_BG_ID","color":{"r":1,"g":0.5,"b":0,"a":1}}'

# Rename
bun .claude/scripts/figma-bridge.js --channel="$CH" --command=rename_node \
  --params='{"nodeId":"CLONE_ID","name":"Banner - Summer Sale"}'
```

---

## Section-Based Organization

When creating new banner versions, organize them in a section:

```bash
# Create a section frame to hold all versions
bun .claude/scripts/figma-bridge.js --channel="$CH" --command=create_frame \
  --params='{"x":0,"y":1200,"width":5000,"height":1200,"name":"Banner Versions v2"}'

# Clone banners into the section
bun .claude/scripts/figma-bridge.js --channel="$CH" --command=clone_node \
  --params='{"nodeId":"ORIGINAL_ID","x":50,"y":50}'

# Move clone into the section frame
bun .claude/scripts/figma-bridge.js --channel="$CH" --command=insert_child \
  --params='{"parentId":"SECTION_FRAME_ID","childId":"CLONE_ID"}'
```

---

## Text Styling Pattern

```bash
# Load a custom font first
bun .claude/scripts/figma-bridge.js --channel="$CH" --command=load_font_async \
  --params='{"family":"Inter","style":"Bold"}'

# Apply font
bun .claude/scripts/figma-bridge.js --channel="$CH" --command=set_font_name \
  --params='{"nodeId":"TEXT_ID","family":"Inter","style":"Bold"}'

# Set size and spacing
bun .claude/scripts/figma-bridge.js --channel="$CH" --command=set_font_size \
  --params='{"nodeId":"TEXT_ID","fontSize":48}'

bun .claude/scripts/figma-bridge.js --channel="$CH" --command=set_letter_spacing \
  --params='{"nodeId":"TEXT_ID","letterSpacing":2}'

bun .claude/scripts/figma-bridge.js --channel="$CH" --command=set_line_height \
  --params='{"nodeId":"TEXT_ID","lineHeight":56}'
```

---

## Shadow/Effect Pattern

```bash
bun .claude/scripts/figma-bridge.js --channel="$CH" --command=set_effects \
  --params='{"nodeId":"NODE_ID","effects":[{"type":"DROP_SHADOW","color":{"r":0,"g":0,"b":0,"a":0.25},"offset":{"x":0,"y":4},"radius":12,"spread":0,"visible":true}]}'
```

Multiple effects:
```bash
--params='{"nodeId":"NODE_ID","effects":[
  {"type":"DROP_SHADOW","color":{"r":0,"g":0,"b":0,"a":0.15},"offset":{"x":0,"y":2},"radius":4},
  {"type":"DROP_SHADOW","color":{"r":0,"g":0,"b":0,"a":0.1},"offset":{"x":0,"y":8},"radius":24}
]}'
```
