# Smart Agent & Skill Detection Suggestions

The current implementation of `maestro-agent-suggester.js` and `subagent-skill-discovery.js` relies on **deterministic keyword and regex matching**. While fast and predictable, it lacks the nuance to understand user intent, synonyms, or complex context.

Here are four levels of improvements to make the system "smarter," ranging from immediate enhancements to advanced AI integration.

## 1. Semantic Intent Classification (The "Maestro" Way)
**Impact**: High | **Complexity**: Medium

Instead of hardcoded keywords, use a lightweight LLM call (e.g., Claude Haiku) to classify the user's intent. This is the most robust solution as it understands natural language nuances.

- **Mechanism**:
  1. The hook constructs a prompt with the user's input and a concise list of available agents/skills (definitions).
  2. It asks the LLM to return the best match and a confidence score in JSON format.
- **Pros**: Handles synonyms ("fix this" vs "debug this" vs "it's broken"), complex instructions, and negative constraints ("don't delete anything").
- **Cons**: Adds a small latency (1-2s) and requires API access in the hook environment.

## 2. Fuzzy Matching & Synonym Expansion
**Impact**: Medium | **Complexity**: Low

Users don't always use the exact terminology defined in your registry.

- **Fuzzy Matching**: Use a library like `fuse.js` instead of strict regex. This handles typos (e.g., "analyz" instead of "analyze") and partial matches.
- **Synonym Expansion**: Enhance `agent-registry.json` and `skill-rules.json` to include a `synonyms` field.
  - *Example*: For `write` agent, add: `["create", "generate", "scaffold", "implement", "refactor", "tweak"]`.
  - *Example*: For `base-research`, add: `["investigate", "look up", "find out", "how to", "search"]`.

## 3. Context-Aware Scoring
**Impact**: Medium | **Complexity**: Medium

The current system is largely blind to the *state* of the project.

- **File Context**: If the user references a file, check its extension.
  - `.log` or `.txt` → Boost `read` or `base-analysis`.
  - `.js`, `.py`, `.rs` → Boost `write` or `base-analysis`.
- **Project State**: Check for specific project markers.
  - `package.json` exists? → Boost Node.js related skills if available.
  - `.git` exists? → Enable git-related skills.
- **History**: Track the last 3 used agents. If a user is in a "debugging loop" (repeatedly using `base-analysis`), prioritize that agent for vague follow-up prompts.

## 4. Hybrid "Fast-Slow" System
**Impact**: High | **Complexity**: High

Combine the speed of regex with the intelligence of LLMs.

- **Logic**:
  1. Run the current fast keyword matcher.
  2. **If** the top score is **High Confidence** (> 50), return immediately (Fast Path).
  3. **If** the score is **Low/Ambiguous** (or multiple agents are tied), trigger the **LLM Classifier** (Slow Path) to resolve the ambiguity.
- **Benefit**: Keeps the system snappy for obvious commands ("read file.txt") while providing intelligence for complex requests ("figure out why the build is failing").

## Specific Recommendations for Your Files

### `maestro-agent-suggester.js`
- **Current**: Uses `matchKeywords`, `matchIntentPatterns`, `matchOperations`.
- **Suggestion**: Add a `matchContext` function.
  ```javascript
  function matchContext(prompt) {
     // Check if prompt implies a question (starts with "why", "how", "what") -> Boost 'base-research'
     // Check if prompt implies modification ("change", "fix", "update") -> Boost 'write'
  }
  ```

### `subagent-skill-discovery.js`
- **Current**: Uses `minimatch` for file paths.
- **Suggestion**: Enhance `context` object. Pass the *content summary* or *file type* of the active file to the matching logic.
  - If the active file is a test file (`*.test.js`), boost testing-related skills.
  - If the active file is a markdown doc, boost documentation skills.

## 5. Insights from Infrastructure Showcase
**Source**: `claude-code-infrastructure-showcase-main`

I analyzed the showcase repository and found two powerful patterns that can be adapted for Maestro using Node.js and Bash (avoiding the TypeScript complexity of the showcase).

### A. Context Tracking via PostToolUse Hook
The showcase uses `post-tool-use-tracker.sh` to monitor file changes and detect the "active domain" (e.g., frontend vs backend).

- **Concept**: Every time a tool edits a file, a hook runs to:
  1. Identify the file's location (e.g., `src/components/` implies Frontend).
  2. Update a `.claude/context.json` or similar state file.
  3. Cache relevant build/test commands for that context.
- **Application to Maestro**:
  - Create `.claude/hooks/context-tracker.js` (Node.js) triggered by `PostToolUse`.
  - It updates a lightweight state file: `{"activeDomain": "frontend", "lastEdited": "src/App.js"}`.
  - `maestro-agent-suggester.js` reads this state. If the user says "fix it", and `activeDomain` is "frontend", it boosts the `frontend-helper` agent (if it exists) or relevant skills.

### B. Proactive Agent Invocation
The showcase uses `trigger-build-resolver.sh` to automatically spawn an agent when specific conditions are met (e.g., git changes in a service directory).

- **Concept**: A hook monitors system state (git status, file changes) and *proactively* suggests or runs an agent.
- **Application to Maestro**:
  - Instead of just waiting for a prompt, Maestro could have a "Health Check" hook.
  - If a build fails (detected via terminal output or log file), it suggests: "Build failed. Run `build-fixer` agent?"

## 6. Concrete Implementation Plan (Node.js & Bash)

### Step 1: Create Context Tracker
Create `.claude/hooks/context-tracker.js`:
```javascript
// Simplified Node.js implementation of the showcase's bash script
const fs = require('fs');
// ... logic to parse tool input ...
// ... logic to detect domain based on file path ...
// ... write to .claude/context.json ...
```

### Step 2: Enhance Suggester
Update `.claude/hooks/maestro-agent-suggester.js`:
```javascript
// Load context
const context = JSON.parse(fs.readFileSync('.claude/context.json'));

// Boost score based on context
if (context.activeDomain === 'backend' && agent.domain === 'backend') {
  score += 10;
}
```

### Step 3: Enhance Skill Discovery
Update `.claude/hooks/subagent-skill-discovery.js`:
```javascript
// Pass context to matching logic
const matches = findRelevantSkills(skillRules, task, {
  ...context, // Injected from tracker
  files: context.recentFiles
});
```
