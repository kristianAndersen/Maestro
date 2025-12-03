# Data Flow Management

Patterns for routing data between agents in multi-step workflows.

## Core Principle

**Agent outputs → Next agent inputs**

Each agent returns data that becomes the input for subsequent agents.

## Data Flow Patterns

### Pattern 1: Simple Pass-Through

**Flow:**
```
Agent A → data → Agent B → result
```

**Implementation:**
```
1. Call Agent A
2. Agent A returns: "The content is: Hello World"
3. Call Agent B with prompt: "Analyze this content: Hello World"
4. Return Agent B's result
```

### Pattern 2: Accumulation

**Flow:**
```
Agent A → data1 ┐
Agent B → data2 ├→ Agent C (receives all) → result
Agent D → data3 ┘
```

**Implementation:**
```
1. Call A, B, D in parallel
2. Collect: data1, data2, data3
3. Call Agent C with: "Process: data1, data2, data3"
4. Return result
```

### Pattern 3: Transformation Chain

**Flow:**
```
Agent A → raw → Agent B → formatted → Agent C → validated → result
```

**Implementation:**
```
1. Agent A returns raw data
2. Agent B receives raw, returns formatted
3. Agent C receives formatted, returns validated
4. Return validated result
```

### Pattern 4: Branching

**Flow:**
```
         ┌→ Agent B → result1
Agent A →┼→ Agent C → result2
         └→ Agent D → result3
```

**Implementation:**
```
1. Agent A returns data
2. Call B, C, D in parallel, all with same data
3. Collect results: result1, result2, result3
4. Return all results
```

## Data Format Considerations

### Keep Data Simple

**Good:**
```
"The content is: Hello World"
"The result: 42"
```

**Avoid:**
```
Complex nested objects that agents can't easily parse
```

### Structured Data

When passing structured data:

```
"Here is the data:
- Title: Example
- Content: Lorem ipsum
- Author: John"
```

### Large Data

For large content:

```
"I've fetched the content. Here are the first 500 characters:
[content preview...]

Full content available for next agent."
```

## Context Preservation

### Maintain Context Across Agents

**Pattern:**
```
fetch returns: "Content from https://example.com: ..."
  ↓
analyze receives: "Analyze this content from example.com: ..."
```

Include source/context information so later agents have full picture.

### Example

**Bad:**
```
fetch → "Hello World"
analyze → "Analyze: Hello World" (loses context of where it came from)
```

**Good:**
```
fetch → "Content from example.com: Hello World"
analyze → "Analyze this content from example.com: Hello World"
```

## Error Data Flow

### When Agent Fails

**Pattern:**
```
Agent A → ERROR
  ↓
Decision point:
- Stop (critical failure)
- Continue with partial data
- Retry Agent A
```

**Implementation:**
```
1. Agent A fails
2. Capture error: "fetch failed: timeout"
3. Decide: Can we proceed?
   - No: Return error to orchestrator
   - Yes: Continue with note: "Proceeding without data1"
```

## Aggregation Patterns

### Pattern 1: Concatenation

```
Agent A → "Part 1"
Agent B → "Part 2"
  ↓
Combine: "Part 1 + Part 2"
```

### Pattern 2: Comparison

```
Agent A → data1
Agent B → data2
  ↓
Compare agent receives: "Compare data1 vs data2"
```

### Pattern 3: Summary

```
Agent A → details1
Agent B → details2
Agent C → details3
  ↓
Summarize agent receives: "Summarize: details1, details2, details3"
```

## Data Passing Examples

### Example 1: Fetch and Analyze

```
Step 1: Call fetch agent
Response: "Fetched content from https://example.com:
The website contains information about..."

Step 2: Call analyze agent
Prompt: "Analyze this content from example.com: The website contains..."
Response: "Analysis: This content discusses..."

Step 3: Return
"Analysis: This content discusses..."
```

### Example 2: Multi-Fetch Comparison

```
Step 1: Call fetch agents in parallel
Response A: "Content from site1: Lorem ipsum..."
Response B: "Content from site2: Dolor sit..."

Step 2: Call compare agent
Prompt: "Compare these contents:
Site 1: Lorem ipsum...
Site 2: Dolor sit..."
Response: "Comparison: Site1 focuses on X, Site2 focuses on Y"

Step 3: Return
"Comparison: Site1 focuses on X, Site2 focuses on Y"
```

### Example 3: Pipeline

```
Step 1: fetch
"Raw HTML: <html>...</html>"

Step 2: extract (receives HTML)
"Extracted text: Hello World..."

Step 3: translate (receives text)
"Translated: Hola Mundo..."

Step 4: summarize (receives translation)
"Summary: A greeting in Spanish"

Return: "Summary: A greeting in Spanish"
```

## Best Practices

### 1. Clear Labeling

Label data with its source:
```
"Data from Agent A: ..."
"Result from fetch: ..."
```

### 2. Preserve Metadata

Keep useful metadata:
```
"URL: example.com
Status: 200
Content: ..."
```

### 3. Format Consistently

Use consistent format across agents:
```
All agents return: "AgentName result: [data]"
```

### 4. Validate Data

Before passing to next agent:
```
if data is valid:
  pass to next agent
else:
  return error
```

## Troubleshooting

### Issue: Data Lost

**Symptom:** Agent B doesn't have data from Agent A

**Solution:** Explicitly include Agent A's output in Agent B's prompt

### Issue: Context Lost

**Symptom:** Later agents don't know source of data

**Solution:** Include metadata with data (URL, source, timestamp)

### Issue: Format Mismatch

**Symptom:** Agent B can't parse Agent A's output

**Solution:** Standardize output format, or add transformation step
