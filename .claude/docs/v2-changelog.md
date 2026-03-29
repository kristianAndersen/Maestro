# Maestro v2 Changelog

_Released: 2026-03-29_

## Summary

Nine improvements shipped to harden Maestro's delegation pipeline, quality gates, and configuration reliability.

---

### 1. context.json Atomic Writes
- **What:** Replaced direct `fs.writeFileSync` calls with atomic write pattern (write to temp file, then rename)
- **Why:** Prevents corrupted context.json from partial writes during concurrent hook execution
- **Impact:** Eliminates race conditions in multi-hook scenarios

### 2. agentType Resolution Fix
- **What:** Fixed agent type resolution logic to correctly match agent registry entries
- **Why:** Agents were sometimes misidentified, leading to wrong skill suggestions
- **Impact:** More accurate agent suggestions and skill activation

### 3. Pre-Delegation Validation
- **What:** Added mandatory validation before every Task delegation from Maestro
- **Why:** Catches incomplete 3P blocks, missing file paths, and context pollution before they reach subagents
- **Impact:** Prevents downstream failures from malformed delegations

### 4. Circuit Breaker (Hard Limit: 3 Iterations)
- **What:** Enforced a hard 3-iteration limit on refinement loops
- **Why:** Prevents infinite refinement cycles that waste tokens and time
- **Impact:** Maestro escalates to user after 3 failed iterations instead of looping forever

### 5. Feature Flags Fix
- **What:** Fixed feature flag evaluation logic in hook configuration
- **Why:** Some hooks were incorrectly enabled/disabled based on stale or malformed flag values
- **Impact:** Hooks now reliably respect their enable/disable configuration

### 6. Skill Cache Scoping
- **What:** Scoped skill recommendation cache by domain and session
- **Why:** Skills recommended in one domain were incorrectly suppressed in other domains
- **Impact:** Correct skill recommendations across domain switches within a session

### 7. 4D Log Enforcement
- **What:** Made 4D evaluation logging mandatory — every evaluation verdict is persisted
- **Why:** Evaluation results were sometimes lost, making it impossible to audit quality decisions
- **Impact:** Full audit trail of all quality gate decisions

### 8. PreToolUse Hook
- **What:** Added PreToolUse event hook for intercepting tool calls before execution
- **Why:** Enables validation, safety checks, and policy enforcement before tools run
- **Impact:** Foundation for hardened pre-delegation validation (v2 enforcement layer)

### 9. Delegation Schema
- **What:** Defined a formal JSON schema for delegation-context.json
- **Why:** Ad-hoc context tracking led to inconsistent field names and missing data
- **Impact:** Structured, validated delegation context for all Maestro operations
