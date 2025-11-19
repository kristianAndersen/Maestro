# jq - JSON Processor Reference

Comprehensive guide for using jq, the lightweight command-line JSON processor for parsing, filtering, mapping, and transforming JSON data.

## Overview

**jq** is like `sed`, `awk`, and `grep` for JSON data. It's:
- Written in portable C with zero runtime dependencies
- Available on macOS by default or via `brew install jq`
- Perfect for working with APIs, configuration files, and structured data

**Official documentation:** https://jqlang.org/

---

## When to Use jq

### ✅ Use jq When:
- Parsing JSON files or API responses
- Extracting specific values from JSON
- Filtering arrays of JSON objects
- Transforming JSON structure
- Pretty-printing JSON
- Combining multiple JSON operations
- Working with package.json, config files, API data

### ⚠️ Consider Alternatives When:
- Simple value extraction from small JSON (Read + manual parse may be simpler)
- Need to modify JSON and save back (jq is read-only; use Read + Edit)
- Complex multi-step transformations (might be clearer in script)

---

## Basic Syntax

```bash
jq [options] 'filter' [files...]
```

### Common Options

| Option | Description | Example |
|--------|-------------|---------|
| `-r` | Raw output (no quotes) | `jq -r '.version'` |
| `-c` | Compact output (one line) | `jq -c '.data'` |
| `-S` | Sort object keys | `jq -S '.'` |
| `-e` | Exit with status based on output | `jq -e '.error'` |
| `-n` | Use null as input | `jq -n '{foo: "bar"}'` |
| `-s` | Read all inputs into array | `jq -s '.'` |
| `--arg` | Pass string variable | `jq --arg name "value"` |
| `--argjson` | Pass JSON variable | `jq --argjson obj '{"a":1}'` |

---

## Core Filters

### Identity: `.`

Returns input unchanged. Useful for pretty-printing.

```bash
# Pretty-print JSON
echo '{"name":"Alice","age":30}' | jq '.'

# Output:
{
  "name": "Alice",
  "age": 30
}
```

### Object Field Access: `.field`

Extract value of a field.

```bash
# Get version from package.json
jq '.version' package.json
# Output: "1.0.0"

# Get nested field
jq '.dependencies.vue' package.json
# Output: "^3.3.4"

# Raw output (no quotes)
jq -r '.version' package.json
# Output: 1.0.0
```

### Optional Field: `.field?`

Doesn't fail if field is missing.

```bash
# Safe access - returns null if missing
jq '.optionalField?' data.json

# Without ?, would error if field doesn't exist
```

### Array Access: `.[index]`

Access array elements by index (0-based).

```bash
# Get first item
echo '[1, 2, 3]' | jq '.[0]'
# Output: 1

# Get last item
echo '[1, 2, 3]' | jq '.[-1]'
# Output: 3

# Get range (slice)
echo '[1, 2, 3, 4, 5]' | jq '.[1:3]'
# Output: [2, 3]
```

### Array Iterator: `.[]`

Iterate over array elements.

```bash
# Output each element on separate line
echo '[1, 2, 3]' | jq '.[]'
# Output:
# 1
# 2
# 3

# Get all dependency names
jq -r '.dependencies | keys[]' package.json
```

---

## Common Patterns

### Pattern 1: Extract Single Value

```bash
# Get version from package.json
jq -r '.version' package.json

# Get script command
jq -r '.scripts.build' package.json

# Get nested value
jq -r '.config.api.baseUrl' settings.json
```

### Pattern 2: Extract Multiple Values

```bash
# Get name and version
jq '{name: .name, version: .version}' package.json

# Multiple fields as object
jq '{name, version, description}' package.json
```

### Pattern 3: Get Object Keys

```bash
# Get all dependency names
jq '.dependencies | keys' package.json

# Get keys as array of strings
jq -r '.dependencies | keys[]' package.json
```

### Pattern 4: Filter Arrays

```bash
# Filter array by condition
jq '.users[] | select(.active == true)' users.json

# Filter by field existence
jq '.items[] | select(.price)' items.json

# Filter by value comparison
jq '.products[] | select(.price > 100)' products.json
```

### Pattern 5: Map Over Arrays

```bash
# Extract field from each array element
jq '.users[].name' users.json

# Transform array elements
jq '.items | map(.name)' data.json

# Map with transformation
jq '.users | map({name, email})' users.json
```

### Pattern 6: Count Elements

```bash
# Count array elements
jq '.users | length' data.json

# Count object keys
jq '.dependencies | keys | length' package.json
```

### Pattern 7: Sort Arrays

```bash
# Sort array
jq '.items | sort' data.json

# Sort by field
jq '.users | sort_by(.age)' users.json

# Sort descending
jq '.users | sort_by(.age) | reverse' users.json
```

### Pattern 8: Combine/Merge Objects

```bash
# Merge two objects
jq '. + {newField: "value"}' data.json

# Merge arrays
jq '.arr1 + .arr2' data.json

# Deep merge
jq '. * {config: {debug: true}}' settings.json
```

---

## Working with package.json

### Common package.json Tasks

```bash
# Get project name
jq -r '.name' package.json

# Get version
jq -r '.version' package.json

# List all scripts
jq '.scripts' package.json

# Get specific script
jq -r '.scripts.build' package.json

# List dependencies
jq '.dependencies' package.json

# Get dependency names only
jq -r '.dependencies | keys[]' package.json

# Check if dependency exists
jq 'has("dependencies") and (.dependencies | has("vue"))' package.json

# Count dependencies
jq '.dependencies | length' package.json

# Get all dev dependency versions
jq '.devDependencies' package.json

# Extract both dependencies and devDependencies
jq '{dependencies, devDependencies}' package.json
```

---

## Advanced Filters

### select()

Filter elements matching condition.

```bash
# Select objects where active is true
jq '.[] | select(.active == true)' data.json

# Select by multiple conditions
jq '.[] | select(.age > 18 and .country == "US")' users.json

# Select by field existence
jq '.[] | select(has("email"))' users.json
```

### map()

Transform each element in array.

```bash
# Extract specific field
jq '.users | map(.name)' data.json

# Transform objects
jq '.items | map({id, name: .title})' data.json

# Apply function to each element
jq '.prices | map(. * 1.1)' data.json
```

### keys / keys_unsorted

Get object keys or array indices.

```bash
# Get sorted object keys
jq 'keys' package.json

# Get unsorted keys (original order)
jq 'keys_unsorted' package.json

# Get keys from nested object
jq '.dependencies | keys' package.json
```

### has()

Check if object has key.

```bash
# Check if field exists
jq 'has("version")' package.json

# Check nested field
jq '.dependencies | has("vue")' package.json
```

### length

Get length of array, object, string, or null.

```bash
# Array length
jq '.items | length' data.json

# Object key count
jq '.dependencies | keys | length' package.json

# String length
jq '.name | length' data.json
```

### sort / sort_by()

Sort arrays.

```bash
# Sort simple array
jq 'sort' numbers.json

# Sort by field
jq 'sort_by(.name)' users.json

# Sort by multiple fields
jq 'sort_by(.lastName, .firstName)' users.json
```

### group_by()

Group array elements.

```bash
# Group by field
jq 'group_by(.category)' products.json

# Group and count
jq 'group_by(.status) | map({status: .[0].status, count: length})' items.json
```

### unique / unique_by()

Remove duplicates.

```bash
# Get unique values
jq 'unique' array.json

# Unique by field
jq 'unique_by(.email)' users.json
```

### min / max / min_by() / max_by()

Find minimum or maximum.

```bash
# Min value in array
jq 'min' numbers.json

# Max by field
jq 'max_by(.price)' products.json

# Min by field
jq 'min_by(.age)' users.json
```

### add

Sum array elements or merge objects.

```bash
# Sum numbers
jq 'add' numbers.json

# Merge objects
jq '[.obj1, .obj2] | add' data.json
```

---

## Pipes and Composition

jq filters can be piped together with `|`:

```bash
# Chain operations
jq '.users | map(.name) | sort' data.json

# Filter then transform
jq '.items[] | select(.active) | {id, name}' data.json

# Multi-step transformation
jq '.products | map(select(.price > 50)) | sort_by(.price)' data.json
```

---

## Conditionals

### if-then-else

```bash
# Simple conditional
jq 'if .status == "active" then "✅" else "❌" end' data.json

# Conditional transformation
jq '.items[] | if .price > 100 then .price * 0.9 else .price end' data.json

# Multiple conditions
jq 'if .age < 18 then "minor" elif .age < 65 then "adult" else "senior" end' user.json
```

---

## String Operations

```bash
# Concatenate strings
jq '.firstName + " " + .lastName' user.json

# String interpolation
jq '"Hello, \(.name)!"' user.json

# Convert to string
jq '.version | tostring' package.json

# Convert to number
jq '.port | tonumber' config.json

# Split string
jq 'split(" ")' string.json

# Join array
jq 'join(", ")' array.json

# String contains
jq 'contains("substring")' string.json

# Regex test
jq 'test("^[0-9]+$")' string.json

# Regex match
jq 'match("([0-9]+)")' string.json
```

---

## Creating New JSON

### Construct Objects

```bash
# Create new object
jq '{name: .name, age: .age}' user.json

# Shorthand (same key names)
jq '{name, age}' user.json

# Computed values
jq '{name, age, decade: (.age / 10 | floor * 10)}' user.json

# Nested objects
jq '{user: {name, email}, timestamp: now}' data.json
```

### Construct Arrays

```bash
# Create array
jq '[.name, .email]' user.json

# Array from multiple objects
jq '[.users[] | {name, email}]' data.json
```

---

## Variables

```bash
# Define variable
jq '.data as $d | $d.field1 + $d.field2' data.json

# Pass variable from command line
jq --arg name "Alice" '{name: $name}' <<< '{}'

# Pass JSON variable
jq --argjson config '{"debug": true}' '. + $config' settings.json
```

---

## Common Use Cases

### Use Case 1: API Response Parsing

```bash
# Extract specific fields from API response
curl -s https://api.example.com/user | jq '{name, email, created_at}'

# Get array of IDs
curl -s https://api.example.com/users | jq '[.users[].id]'

# Filter and extract
curl -s https://api.example.com/products | jq '[.products[] | select(.inStock) | {id, name, price}]'
```

### Use Case 2: Configuration File Management

```bash
# Read config value
jq -r '.database.host' config.json

# Check if feature is enabled
jq '.features.darkMode' config.json

# Get all API endpoints
jq '.api.endpoints | keys' config.json
```

### Use Case 3: Package.json Operations

```bash
# Update version (read, modify, write back)
# Note: jq is read-only, so use Read + Edit for modifications

# Read version
jq -r '.version' package.json

# List outdated patterns (get versions)
jq -r '.dependencies | to_entries[] | "\(.key)@\(.value)"' package.json
```

### Use Case 4: Data Transformation

```bash
# Transform array structure
jq '.users | map({userId: .id, fullName: (.firstName + " " + .lastName)})' data.json

# Flatten nested structure
jq '[.categories[].items[]]' catalog.json

# Group and aggregate
jq 'group_by(.category) | map({category: .[0].category, count: length, total: map(.price) | add})' sales.json
```

### Use Case 5: Debugging JSON

```bash
# Pretty-print minified JSON
jq '.' minified.json

# Sort keys for consistent diffing
jq -S '.' data.json

# Count items at each level
jq 'paths(type == "object") | length' data.json
```

---

## Integration with Other Tools

### Pipe from curl

```bash
curl -s https://api.github.com/repos/vuejs/core | jq '.stargazers_count'
```

### Pipe to other commands

```bash
# Extract emails and copy to clipboard
jq -r '.users[].email' users.json | pbcopy

# Count lines
jq -r '.logs[]' data.json | wc -l

# Sort with system sort
jq -r '.names[]' data.json | sort
```

### Combine with grep

```bash
# Filter JSON, then grep output
jq -r '.users[] | "\(.name) \(.email)"' users.json | grep "@gmail"
```

### Read from stdin

```bash
# Parse command output
npm list --json | jq '.dependencies'

# Parse clipboard JSON
pbpaste | jq '.'
```

---

## Error Handling

```bash
# Exit with error if field missing
jq -e '.required_field' data.json || echo "Field not found"

# Provide default value
jq '.optional // "default"' data.json

# Alternative operator for null/false
jq '.field // empty' data.json

# Try-catch pattern
jq 'try .field catch "error"' data.json
```

---

## Performance Tips

1. **Use `-r` for raw output** when you don't need JSON formatting
2. **Filter early** in the pipeline to reduce data size
3. **Use `keys` instead of iterating** when you just need key names
4. **Avoid unnecessary sorting** if order doesn't matter
5. **Use `--stream`** for very large files (streaming parser)

---

## Common Patterns in This Project

### Working with form-structure.json

```bash
# Get all field types
jq '[.fields[].type] | unique' src/assets/form-structure.json

# Find fields with validation
jq '.fields[] | select(.validation) | {id: .id, validation}' src/assets/form-structure.json

# Count fields by type
jq '.fields | group_by(.type) | map({type: .[0].type, count: length})' src/assets/form-structure.json
```

### Working with formdata.json

```bash
# Get all submitted values
jq '.data' src/assets/formdata.json

# Check if field has value
jq 'has("fieldName")' src/assets/formdata.json
```

### Working with translations

```bash
# Get all translation keys
jq 'keys' src/translations/da-DK.json

# Find missing translations (compare two files)
jq -n --slurpfile en en.json --slurpfile da da.json \
  '($en[0] | keys) - ($da[0] | keys)'
```

---

## Quick Reference Table

| Task | Command |
|------|---------|
| Pretty-print | `jq '.' file.json` |
| Get value | `jq '.field' file.json` |
| Raw output | `jq -r '.field' file.json` |
| Array element | `jq '.[0]' file.json` |
| Iterate array | `jq '.[]' file.json` |
| Object keys | `jq 'keys' file.json` |
| Filter array | `jq '.[] \| select(.active)' file.json` |
| Map array | `jq 'map(.name)' file.json` |
| Length | `jq 'length' file.json` |
| Sort | `jq 'sort_by(.name)' file.json` |

---

## Common Mistakes

### ❌ Mistake 1: Not Using Raw Output

```bash
# Wrong: Output includes quotes
jq '.version' package.json
# Output: "1.0.0"

# Right: Use -r for raw output
jq -r '.version' package.json
# Output: 1.0.0
```

### ❌ Mistake 2: Not Handling Missing Fields

```bash
# Wrong: Errors if field doesn't exist
jq '.missingField' data.json

# Right: Use optional access
jq '.missingField?' data.json
# Output: null
```

### ❌ Mistake 3: Forgetting Quotes in Filter

```bash
# Wrong: Shell interprets special characters
jq .field file.json

# Right: Quote the filter
jq '.field' file.json
```

### ❌ Mistake 4: Not Escaping Shell Variables

```bash
# Wrong: Variable not expanded properly
field="version"
jq '.$field' package.json

# Right: Use --arg or string interpolation
jq --arg f "$field" '.[$f]' package.json
```

---

## When NOT to Use jq

1. **Simple JSON in small files**: Read tool + manual parsing might be simpler
2. **Modifying JSON**: jq is read-only; use Read + Edit to modify files
3. **Complex multi-step operations**: Consider a script (Python, Node.js)
4. **Binary data**: jq is for JSON text only

---

## Integration with Claude Code Workflow

### Pattern 1: Read + jq for Complex JSON

```markdown
Task: Get specific config value from large JSON

Option 1: Use jq via Bash (preferred for complex extraction)
Bash: jq -r '.api.endpoints.production.url' config.json

Option 2: Read + manual parse (preferred for simple cases)
Read: config.json
Then extract value manually
```

### Pattern 2: jq + pbcopy for Quick Copy

```bash
# Extract and copy to clipboard
jq -r '.version' package.json | pbcopy
```

### Pattern 3: API Response Processing

```bash
# Fetch and extract
curl -s https://api.example.com/data | jq '.results[] | {id, name}'
```

---

## Resources

- **Official Docs**: https://jqlang.org/
- **Manual**: https://jqlang.org/manual/
- **jq Play** (online tester): https://jqplay.org/
- **Tutorial**: https://jqlang.org/tutorial/

---

**Remember:** jq is powerful for JSON extraction and transformation, but it's read-only. For modifying JSON files, use Read + Edit tools instead of trying to pipe jq output back to files.
