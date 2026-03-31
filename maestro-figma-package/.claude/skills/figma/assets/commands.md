# Figma Commands — Full Reference

## Document & Pages

### get_document_info
No params. Returns document name, pages, selection info.

### get_selection
No params. Returns currently selected nodes with properties.

### get_node_info
| Param | Required | Type | Description |
|-------|----------|------|-------------|
| nodeId | ✅ | string | Node ID (e.g. "123:456") |

Returns full node properties: type, position, size, fills, strokes, effects, children.

### get_nodes_info
| Param | Required | Type | Description |
|-------|----------|------|-------------|
| nodeIds | ✅ | string[] | Array of node IDs |

### get_pages
No params. Returns `{ pages: [{ id, name }] }`.

### create_page
| Param | Required | Type |
|-------|----------|------|
| name | ✅ | string |

### set_current_page
| Param | Required | Type |
|-------|----------|------|
| pageId | ✅ | string |

### scan_text_nodes
| Param | Required | Type | Description |
|-------|----------|------|-------------|
| nodeId | ✅ | string | Root node to scan |
| useChunking | | boolean | Enable chunked scanning |
| chunkSize | | number | Items per chunk |

### export_node_as_image
| Param | Required | Type | Description |
|-------|----------|------|-------------|
| nodeId | ✅ | string | Node to export |
| format | | PNG/JPG/SVG/PDF | Default: PNG |
| scale | | number | Export scale |

Returns `{ imageData: "base64...", mimeType: "image/png" }`.

---

## Creation

### create_frame
| Param | Required | Type | Description |
|-------|----------|------|-------------|
| x, y | ✅ | number | Position (local) |
| width, height | ✅ | number | Size |
| name | | string | Frame name |
| parentId | | string | Parent node (canvas if omitted) |
| fillColor | | {r,g,b,a} | Background color |
| strokeColor | | {r,g,b,a} | Border color |
| strokeWeight | | number | Border width |

### create_rectangle
| Param | Required | Type |
|-------|----------|------|
| x, y | ✅ | number |
| width, height | ✅ | number |
| name, parentId | | string |

### create_text
| Param | Required | Type | Description |
|-------|----------|------|-------------|
| x, y | ✅ | number | Position |
| text | ✅ | string | Content |
| fontSize | | number | Default: 14 |
| fontWeight | | number | 400=Regular, 700=Bold |
| fontColor | | {r,g,b,a} | Text color |
| name, parentId | | string | |
| textAlignHorizontal | | LEFT/CENTER/RIGHT | |
| textAutoResize | | string | Auto-resize mode |
| width | | number | Fixed width |

### create_ellipse
| Param | Required | Type |
|-------|----------|------|
| x, y | ✅ | number |
| width, height | ✅ | number |
| name, parentId | | string |
| fillColor, strokeColor | | {r,g,b,a} |

### clone_node
| Param | Required | Type | Description |
|-------|----------|------|-------------|
| nodeId | ✅ | string | Source node |
| x | | number | New X position |
| y | | number | New Y position |

Returns `{ id, name }` of the clone.

### group_nodes
| Param | Required | Type |
|-------|----------|------|
| nodeIds | ✅ | string[] |
| name | | string |

### insert_child
| Param | Required | Type |
|-------|----------|------|
| parentId | ✅ | string |
| childId | ✅ | string |
| index | | number |

---

## Modification

### set_fill_color
| Param | Required | Type |
|-------|----------|------|
| nodeId | ✅ | string |
| color | ✅ | {r,g,b,a} |

⚠️ Color is **nested** in a `color` object.

### set_stroke_color
| Param | Required | Type |
|-------|----------|------|
| nodeId | ✅ | string |
| color | ✅ | {r,g,b,a} |
| strokeWeight | | number |

### move_node
| Param | Required | Type |
|-------|----------|------|
| nodeId | ✅ | string |
| x, y | ✅ | number |

### resize_node
| Param | Required | Type |
|-------|----------|------|
| nodeId | ✅ | string |
| width, height | ✅ | number |

### set_corner_radius
| Param | Required | Type |
|-------|----------|------|
| nodeId | ✅ | string |
| radius | ✅ | number |
| corners | | [bool,bool,bool,bool] |

### set_auto_layout
| Param | Required | Type |
|-------|----------|------|
| nodeId | ✅ | string |
| layoutMode | ✅ | HORIZONTAL/VERTICAL/NONE |
| paddingTop/Bottom/Left/Right | | number |
| itemSpacing | | number |
| primaryAxisAlignItems | | string |
| counterAxisAlignItems | | string |

### set_effects
| Param | Required | Type |
|-------|----------|------|
| nodeId | ✅ | string |
| effects | ✅ | array |

Effect object: `{ type: "DROP_SHADOW", color: {r,g,b,a}, offset: {x,y}, radius, spread, visible, blendMode }`

### set_gradient
| Param | Required | Type |
|-------|----------|------|
| nodeId | ✅ | string |
| type | ✅ | GRADIENT_LINEAR/RADIAL/ANGULAR/DIAMOND |
| stops | ✅ | [{position: 0-1, color: {r,g,b,a}}] (min 2) |

### rename_node / delete_node
| Param | Required | Type |
|-------|----------|------|
| nodeId | ✅ | string |
| name | ✅ (rename) | string |

### rotate_node
| Param | Required | Type |
|-------|----------|------|
| nodeId | ✅ | string |
| angle | ✅ | number |
| relative | | boolean |

---

## Text

### set_text_content
| Param | Required | Type |
|-------|----------|------|
| nodeId | ✅ | string |
| text | ✅ | string |

### set_font_name
| Param | Required | Type |
|-------|----------|------|
| nodeId | ✅ | string |
| family | ✅ | string |
| style | | string |

### set_font_size / set_font_weight
| Param | Required | Type |
|-------|----------|------|
| nodeId | ✅ | string |
| fontSize / weight | ✅ | number |

### set_text_align
| Param | Required | Type |
|-------|----------|------|
| nodeId | ✅ | string |
| textAlignHorizontal | | LEFT/CENTER/RIGHT/JUSTIFIED |
| textAlignVertical | | TOP/CENTER/BOTTOM |

---

## Components

### get_local_components
No params. Returns all local components.

### create_component_instance
| Param | Required | Type |
|-------|----------|------|
| componentKey | ✅ | string |
| x, y | ✅ | number |

### set_instance_variant
| Param | Required | Type |
|-------|----------|------|
| nodeId | ✅ | string |
| properties | ✅ | Record<string, string> |

---

## Images

### set_image_fill
| Param | Required | Type | Description |
|-------|----------|------|-------------|
| nodeId | ✅ | string | Target node |
| imageSource | ✅ | string | URL or base64 data |
| sourceType | ✅ | url/base64 | Source format |
| scaleMode | | FILL/FIT/CROP/TILE | Default: FILL |

### replace_image_fill
| Param | Required | Type |
|-------|----------|------|
| nodeId | ✅ | string |
| newImageSource | ✅ | string |
| sourceType | ✅ | url/base64 |
| preserveTransform | | boolean |
