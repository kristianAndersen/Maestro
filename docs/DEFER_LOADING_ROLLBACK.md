# defer_loading Rollback Procedure

**Document Version:** 1.0
**Last Updated:** 2025-11-27
**Status:** Production Ready
**Audience:** Operations, Emergency Response

---

## When to Rollback

Initiate rollback if ANY of these occur:

### Critical Issues (Rollback Immediately)

- **Complete discovery failure** - Skills not being discovered at all
- **System crashes** - Hook execution failing on every prompt
- **Data corruption** - context.json corruption causing errors
- **Security issue** - Vulnerability discovered in implementation

### Performance Issues (Rollback if Unresolved)

- **Token usage increases unexpectedly** - Not achieving expected savings
- **Hook performance degrades** - Response times increase >100ms
- **Memory leaks** - context.json grows unbounded despite cleanup

### User-Facing Issues (Rollback if Unresolved)

- **Skill recommendations missing** - Users report skills unavailable when needed
- **Session tracking failures** - Skills not being cached properly
- **Inconsistent behavior** - Unpredictable recommendation output

### Safety Threshold

Rollback triggers if:
- **Impact affects >10% of users**
- **Issue remains unresolved >4 hours**
- **Root cause unknown/unfixable**
- **Backward compatibility broken**

---

## Quick Rollback (Emergency - 5 minutes)

Use this if you need immediate recovery without investigating root cause.

### Step 1: Reset Context State

```bash
# Remove context tracking to disable caching
rm .claude/context.json

# Or reset to fresh state
echo '{"version":"1.0","skillTracking":{"recommended":[],"used":[],"sessionStart":"'$(date -u +%Y-%m-%dT%H:%M:%S.000Z)'"}}' > .claude/context.json
```

**Effect:** Disables caching, shows full recommendations every time (returns to Phase 1 behavior)

**Impact:**
- Token usage: 111 tokens/prompt (vs 26.6 with caching)
- Still 77.5% better than Phase 0 baseline
- Skills work normally without caching benefit

### Step 2: Verify Skills Still Work

```bash
# Test skill discovery
echo "analyze code" | node .claude/hooks/subagent-skill-discovery.js > /dev/null
if [ $? -eq 0 ]; then
  echo "✓ Skills working"
else
  echo "✗ Skills broken - proceed to Full Rollback"
  exit 1
fi
```

### Step 3: Monitor and Decide

**After quick reset:**
- Monitor for 30 minutes
- Check if issue persists
- If issue gone: Context reset solved it (likely corruption)
- If issue remains: Proceed to Full Rollback

**Success indicators:**
- Skills are being discovered
- No errors in hook execution
- Token usage at Phase 1 levels (~111 tokens/prompt)
- Users report normal skill availability

---

## Full Rollback - Phase 1 (Partial Revert - 30 minutes)

Use this to revert to defer_loading without smart caching.

**Impact:** Reduces token usage to Phase 1 baseline (111 tokens/prompt, 77.5% reduction)

### Step 1: Force Revert Caching Logic

**Modify subagent-skill-discovery.js to disable caching:**

Locate line ~500 in main():
```javascript
// BEFORE
const forceRecommend = isExplicitRequest || sessionStatus === true;

// AFTER (disable caching)
const forceRecommend = true; // Always force full recommendations
```

**Effect:** Every prompt gets full skill recommendations (no caching suppression)

### Step 2: Reset Context

```bash
# Clear context to start fresh
rm .claude/context.json

# Or reset
echo '{"version":"1.0","skillTracking":{"recommended":[],"used":[],"sessionStart":"'$(date -u +%Y-%m-%dT%H:%M:%S.000Z)'"}}' > .claude/context.json
```

### Step 3: Verify Operation

```bash
# Test prompt 1
echo "analyze code" | node .claude/hooks/subagent-skill-discovery.js | wc -w
# Expected: ~120 words (full output)

# Test prompt 2
echo "modify file" | node .claude/hooks/subagent-skill-discovery.js | wc -w
# Expected: ~120 words (NOT cached, full output again)

# Test prompt 3
echo "check config" | node .claude/hooks/subagent-skill-discovery.js | wc -w
# Expected: ~120 words (still full output - caching disabled)
```

### Step 4: Validate and Document

**Verification checklist:**
- [ ] Every prompt shows full skill recommendations
- [ ] No caching behavior observed (all ~120 words)
- [ ] No errors in execution
- [ ] Token usage at ~111 tokens/prompt average
- [ ] All 11 skills discoverable

**Document:**
```bash
# Log rollback
echo "Phase 1 Rollback: $(date) - Caching disabled" >> .maestro-rollback-log.txt

# Record token measurements
echo "Token usage: 111 avg (Phase 1 baseline)" >> .maestro-rollback-log.txt
```

**This state represents:**
- defer_loading ENABLED (brief descriptions used)
- Caching DISABLED (no session tracking)
- Token usage: 111 tokens/prompt (77.5% vs Phase 0)
- Functionality: Normal skill discovery, no caching benefit

---

## Full Rollback - Phase 0 (Complete Revert - 30 minutes)

Use this to completely revert to original system before ANY defer_loading.

**Impact:** Returns to original baseline (494 tokens/prompt)

### Step 1: Restore Previous Hook Version

```bash
# Find the commit before defer_loading implementation
cd /Users/awesome/dev/devtest/Maestro
git log --oneline .claude/hooks/subagent-skill-discovery.js | head -5
# Look for commit before "implement defer_loading"

# Example: commit abc1234 is before defer_loading
git show abc1234:.claude/hooks/subagent-skill-discovery.js > .claude/hooks/subagent-skill-discovery.js
```

**Verify commit is correct:**
```bash
# Check it's the old version
head -20 .claude/hooks/subagent-skill-discovery.js
# Should not have defer_loading comments

# Check file size (old version is smaller, ~450 lines vs 550 current)
wc -l .claude/hooks/subagent-skill-discovery.js
```

### Step 2: Remove defer_loading from skill-rules.json

**Option A: Restore old version**
```bash
git show abc1234:.claude/skills/skill-rules.json > .claude/skills/skill-rules.json
```

**Option B: Remove defer_loading objects manually**

For each skill with defer_loading, remove the block:
```json
"defer_loading": {
  "enabled": true,
  "short_description": "..."
},
```

```bash
# Validate JSON after editing
cat .claude/skills/skill-rules.json | jq '.' > /dev/null
echo "✓ Valid JSON"
```

### Step 3: Remove Context Tracking

```bash
# Delete context file completely
rm .claude/context.json

# Or restore minimal version
echo '{"version":"1.0"}' > .claude/context.json
```

### Step 4: Verify Rollback

```bash
# Test skill discovery
echo "analyze code" | node .claude/hooks/subagent-skill-discovery.js > output.txt

# Check output format (should be verbose, not brief)
grep -q "When to use:" output.txt && echo "✓ Legacy format detected"

# Measure tokens
words=$(wc -w < output.txt)
tokens=$((words * 13 / 10))
echo "Output: $words words = $tokens tokens"
# Expected: ~494 tokens (Phase 0 baseline)
```

### Step 5: Validate Everything Works

```bash
# Test all skills are discoverable
skills=("read" "write" "list" "open" "fetch" "base-research" "base-analysis" "4d-evaluation")

for skill in "${skills[@]}"; do
  result=$(echo "test $skill" | node .claude/hooks/subagent-skill-discovery.js)
  if echo "$result" | grep -q "$skill"; then
    echo "✓ $skill discoverable"
  else
    echo "✗ FAILED: $skill"
  fi
done

# All should show ✓
```

---

## Rollback Impact Assessment

### Phase 1 → Phase 0 Transition

When fully reverting:

| Metric | Phase 1 | Phase 0 | Change |
|--------|---------|---------|--------|
| Per-prompt tokens | 111 | 494 | +383 tokens (+345%) |
| Reduction vs original | 77.5% | 0% | Loss of 77.5% savings |
| Output format | Brief + activate | Verbose full text | More detailed |
| Caching | Enabled | None | Session tracking removed |
| User experience | Minimal repetition | Full repetition | More text per prompt |

**Token impact over time:**
- Single prompt: 383 more tokens
- 10-prompt session: 3,830 more tokens
- 50-prompt session: 19,150 more tokens

### Phase 1 → Phase 1.5 (Caching Disabled)

When disabling caching only:

| Metric | Phase 2 | Phase 1 | Change |
|--------|---------|---------|--------|
| Per-prompt tokens | 26.6 avg | 111 | +84.4 tokens (+317%) |
| Session total (25 prompts) | 666 | 2,775 | +2,109 tokens |
| Cache hit rate | 52% | 0% | Loss of caching |
| Output format | Varies (3 formats) | Consistent (brief) | Consistent output |

**Less severe than Phase 0 revert** - still maintains defer_loading benefits

---

## Post-Rollback Actions

### Step 1: Investigate Root Cause

**Check logs and error messages:**
```bash
# View hook output for errors
echo "test" | node .claude/hooks/subagent-skill-discovery.js 2>&1

# Check context.json validity
cat .claude/context.json | jq '.' 2>&1

# Check file permissions
ls -la .claude/context.json
```

**Common causes:**
1. **context.json corruption** - Invalid JSON or permission issue
2. **Hook error** - Syntax error in defer_loading logic
3. **Skill-rules.json malformed** - Invalid defer_loading config
4. **Session timeout logic bug** - Incorrect session detection
5. **Domain history bloat** - Cleanup function not working

### Step 2: Document the Issue

**Create incident report:**
```bash
cat > .maestro-rollback-incident-$(date +%s).txt << EOF
Rollback Date: $(date)
Trigger: [Select: crash/performance/accuracy/other]
Impact: [Number of users affected]
Root Cause: [Investigation findings]
Symptoms: [What users reported]
Solution: [What was rolled back]
Prevention: [How to prevent recurrence]
EOF
```

### Step 3: Fix or Plan Redeployment

**Three paths forward:**

**Path A: Quick Fix and Redeploy**
- Root cause identified
- Fix is simple and low-risk
- Retest and redeploy Phase 2

**Path B: Refined Implementation**
- Root cause identified
- Fix requires code changes
- Test in staging first
- Plan staged rollout

**Path C: Investigate Further**
- Root cause unknown
- Keep Phase 1 active
- Investigate over days/weeks
- Plan fix when clear

### Step 4: Preventive Measures

**Add monitoring:**
```bash
# Daily health check for context.json
cat > .claude/hooks/health-check.sh << 'EOF'
#!/bin/bash

# Check 1: Hook executable
echo "test" | node .claude/hooks/subagent-skill-discovery.js > /dev/null 2>&1 || echo "ERROR: Hook failed"

# Check 2: context.json valid JSON
jq empty .claude/context.json 2>/dev/null || echo "ERROR: context.json invalid"

# Check 3: context.json reasonable size
size=$(wc -c < .claude/context.json)
[ $size -gt 5000 ] && echo "WARNING: context.json >5KB"

# Check 4: skill-rules.json valid
jq empty .claude/skills/skill-rules.json 2>/dev/null || echo "ERROR: skill-rules.json invalid"

echo "Health check complete"
EOF

chmod +x .claude/hooks/health-check.sh
```

**Add validation:**
```bash
# Before important operations, run health check
./.claude/hooks/health-check.sh || {
  echo "Health check failed, aborting"
  exit 1
}
```

---

## Testing Rollback Procedure

Before an emergency, test the rollback in a safe environment.

### Setup Test Environment

```bash
# Create test directory
mkdir -p /tmp/maestro-rollback-test
cd /tmp/maestro-rollback-test

# Copy relevant files
cp -r /Users/awesome/dev/devtest/Maestro/.claude .
cp /Users/awesome/dev/devtest/Maestro/docs/*.md .
```

### Test Phase 1 Rollback

```bash
# Backup current state
cp .claude/hooks/subagent-skill-discovery.js subagent-skill-discovery.js.bak

# Apply Phase 1 changes (disable caching)
# ... apply changes ...

# Test
echo "test prompt 1" | node .claude/hooks/subagent-skill-discovery.js | wc -w
echo "test prompt 2" | node .claude/hooks/subagent-skill-discovery.js | wc -w
# Both should be ~120 words (not cached)

# Restore
cp subagent-skill-discovery.js.bak .claude/hooks/subagent-skill-discovery.js
```

### Test Phase 0 Rollback

```bash
# Document current git commit
current_commit=$(git rev-parse HEAD)
echo "Current: $current_commit"

# Find pre-defer_loading commit
target_commit=$(git log --oneline .claude/hooks/subagent-skill-discovery.js | grep -i "defer\|optim" -B 1 | tail -1 | awk '{print $1}')
echo "Target: $target_commit"

# Test revert
git show $target_commit:.claude/hooks/subagent-skill-discovery.js > subagent-test.js

# Validate syntax
node -c subagent-test.js && echo "✓ Valid syntax"

# Return to current
git checkout .claude/hooks/subagent-skill-discovery.js
```

### Test Validation Steps

```bash
# Ensure all tests pass
for script in test-*.sh; do
  echo "Running $script..."
  bash "$script" || echo "✗ FAILED"
done
```

---

## Rollback Success Criteria

After rollback, verify:

- [ ] **Skills discovered** - All skills are being recommended
- [ ] **No errors** - Hook executes without errors
- [ ] **Token usage** - At expected level for rollback phase
- [ ] **Context.json valid** - Contains valid JSON (or doesn't exist)
- [ ] **All skills work** - Each skill is discoverable
- [ ] **User requests complete** - No hanging prompts
- [ ] **Performance acceptable** - Hook runs <50ms

**Full verification script:**
```bash
#!/bin/bash

echo "=== Rollback Verification ==="

# 1. Skills discovered
echo -n "Skills: "
echo "test code" | node .claude/hooks/subagent-skill-discovery.js | grep -c "##" && echo "✓" || echo "✗"

# 2. No errors
echo -n "Errors: "
echo "test" | node .claude/hooks/subagent-skill-discovery.js 2>&1 | grep -i "error" && echo "✗" || echo "✓"

# 3. Token usage
echo -n "Tokens: "
words=$(echo "test" | node .claude/hooks/subagent-skill-discovery.js | wc -w | xargs)
tokens=$((words * 13 / 10))
echo "$tokens (expected ~494 for Phase 0)"

# 4. context.json valid
echo -n "Context: "
jq empty .claude/context.json 2>/dev/null && echo "✓" || echo "✗"

# 5. All skills work
echo -n "All skills: "
for skill in read write list open fetch base-research base-analysis 4d-evaluation; do
  echo "test $skill" | node .claude/hooks/subagent-skill-discovery.js | grep -q "$skill" || echo "FAIL: $skill"
done
echo "✓"

echo "=== Verification Complete ==="
```

---

## Emergency Contacts

**For Production Issues:**
- On-call engineer: [Contact info]
- Team Slack: [Channel]
- Escalation: [Manager]

**For Questions:**
- Documentation: See `DEFER_LOADING_DEVELOPER_GUIDE.md`
- Design: See `docs/defer-loading-design.md`
- Metrics: See `docs/phase2-validation-report.md`

---

## Known Rollback Issues

### Issue 1: Git History Revert

**Problem:** Rolling back to old hook version via git loses recent work

**Solution:**
- Create branch before reverting: `git checkout -b rollback-backup`
- Revert to old commit: `git checkout <commit> -- .claude/hooks/subagent-skill-discovery.js`
- Later can diff to understand what broke

### Issue 2: Partial Rollback Complexity

**Problem:** Disabling caching in Phase 1.5 requires code change, not just config

**Solution:**
- Keep modification simple: `forceRecommend = true;`
- Document location clearly (line ~500)
- Revert by removing that line when redeploying

### Issue 3: context.json State After Rollback

**Problem:** Old context.json with tracking causes confusion in Phase 0

**Solution:**
- Always delete/reset context.json during rollback
- Clean start prevents phantom tracking
- Users won't see old cached skills after revert

---

## Rollback Communication

### Message to Users (if widespread)

```
We've rolled back the skill discovery optimization (defer_loading) to investigate an issue.

What changed for you:
- Skill recommendations may be more verbose (full descriptions again)
- Token usage may increase slightly
- All functionality remains the same

Expected timeline:
- We're investigating the root cause
- Will redeploy improved version within 24 hours
- Thank you for your patience

Questions? See the documentation or contact support.
```

### Internal Status Update

```
INCIDENT ROLLBACK: defer_loading

Time: [timestamp]
Severity: [Critical/High/Medium]
Affected users: [%]
Root cause: [description]
Action taken: [Rolled back to Phase 1/Phase 0]
Recovery ETA: [timestamp]
Status: [Investigating/Implementing fix/Ready to redeploy]

Timeline:
- T+0: Issue detected
- T+5: Quick rollback initiated
- T+10: Basic functionality restored
- T+30: Full testing of rollback
- T+60: Root cause investigation underway
- T+240: [Estimated fix ready]
```

---

## Rollback History

| Date | Incident | Rollback Phase | Root Cause | Resolution |
|------|----------|-----------------|-----------|------------|
| [None yet] | [Preventive doc] | N/A | N/A | Production ready |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-11-27 | Initial rollback procedure, production ready |

---

**Last Updated:** 2025-11-27
**Status:** Production Ready
**Related:** `DEFER_LOADING_USER_GUIDE.md`, `DEFER_LOADING_DEVELOPER_GUIDE.md`
