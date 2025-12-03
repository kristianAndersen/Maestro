#!/bin/bash
# Maestro Framework Enhancement Validation Script
# Tests all three priority enhancements from skiltest integration

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║     Maestro Framework Enhancement Validation                ║"
echo "║     Testing skiltest Priority 1, 2, 3 Implementations       ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

MAESTRO_DIR="/Users/awesome/dev/devtest/Maestro/.claude"
PASS_COUNT=0
FAIL_COUNT=0

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

function pass() {
    echo -e "${GREEN}✅ PASS${NC}: $1"
    ((PASS_COUNT++))
}

function fail() {
    echo -e "${RED}❌ FAIL${NC}: $1"
    ((FAIL_COUNT++))
}

function section() {
    echo ""
    echo -e "${YELLOW}═══════════════════════════════════════════════════${NC}"
    echo -e "${YELLOW}$1${NC}"
    echo -e "${YELLOW}═══════════════════════════════════════════════════${NC}"
}

# Test Priority 1: Delegater Agent & Coordination Layer
section "Priority 1: Delegater Agent & Coordination Layer"

# Test 1.1: Delegater agent file exists
if [ -f "$MAESTRO_DIR/agents/delegater.md" ]; then
    pass "Delegater agent file exists"
else
    fail "Delegater agent file missing"
fi

# Test 1.2: Delegater skill file exists
if [ -f "$MAESTRO_DIR/skills/delegater/SKILL.md" ]; then
    pass "Delegater skill file exists"
else
    fail "Delegater skill file missing"
fi

# Test 1.3: Delegater in agent-registry.json
if grep -q '"delegater"' "$MAESTRO_DIR/agents/agent-registry.json"; then
    pass "Delegater registered in agent-registry.json"
else
    fail "Delegater not registered in agent-registry.json"
fi

# Test 1.4: Delegater in skill-rules.json
if grep -q '"delegater"' "$MAESTRO_DIR/skills/skill-rules.json"; then
    pass "Delegater registered in skill-rules.json"
else
    fail "Delegater not registered in skill-rules.json"
fi

# Test 1.5: Agent registry JSON is valid
if jq empty "$MAESTRO_DIR/agents/agent-registry.json" 2>/dev/null; then
    pass "agent-registry.json is valid JSON"
else
    fail "agent-registry.json has JSON syntax errors"
fi

# Test 1.6: Skill rules JSON is valid
if jq empty "$MAESTRO_DIR/skills/skill-rules.json" 2>/dev/null; then
    pass "skill-rules.json is valid JSON"
else
    fail "skill-rules.json has JSON syntax errors"
fi

# Test 1.7: Delegater has required coordination patterns
if grep -q "Sequential Chain" "$MAESTRO_DIR/skills/delegater/SKILL.md" && \
   grep -q "Parallel + Aggregate" "$MAESTRO_DIR/skills/delegater/SKILL.md" && \
   grep -q "Fan-Out, Fan-In" "$MAESTRO_DIR/skills/delegater/SKILL.md" && \
   grep -q "Pipeline" "$MAESTRO_DIR/skills/delegater/SKILL.md"; then
    pass "Delegater skill contains all coordination patterns"
else
    fail "Delegater skill missing some coordination patterns"
fi

# Test 1.8: Maestro references delegater
if grep -q "Delegater" "$MAESTRO_DIR/agents/maestro.md" && \
   grep -q "multi-agent" "$MAESTRO_DIR/agents/maestro.md"; then
    pass "Maestro agent references delegater for multi-agent coordination"
else
    fail "Maestro agent missing delegater references"
fi

# Test 1.9: Delegater has dependency analysis
if grep -q "Dependency Analysis" "$MAESTRO_DIR/skills/delegater/SKILL.md" && \
   grep -q "parallel\|sequential" "$MAESTRO_DIR/skills/delegater/SKILL.md"; then
    pass "Delegater skill includes dependency analysis framework"
else
    fail "Delegater skill missing dependency analysis"
fi

# Test 1.10: Delegater uses TodoWrite for progress
if grep -q "TodoWrite" "$MAESTRO_DIR/agents/delegater.md"; then
    pass "Delegater agent uses TodoWrite for progress tracking"
else
    fail "Delegater agent missing TodoWrite usage"
fi

# Test Priority 2: Enhanced 4D-Evaluation with Hallucination Detection
section "Priority 2: Enhanced 4D-Evaluation with Hallucination Detection"

# Test 2.1: 4d-evaluation agent exists
if [ -f "$MAESTRO_DIR/agents/4d-evaluation.md" ]; then
    pass "4d-evaluation agent file exists"
else
    fail "4d-evaluation agent file missing"
fi

# Test 2.2: Hallucination-detection skill exists
if [ -f "$MAESTRO_DIR/skills/hallucination-detection/SKILL.md" ]; then
    pass "Hallucination-detection skill exists"
else
    fail "Hallucination-detection skill missing"
fi

# Test 2.3: 4d-evaluation references hallucination detection
if grep -q "hallucination" "$MAESTRO_DIR/agents/4d-evaluation.md"; then
    pass "4d-evaluation agent references hallucination detection"
else
    fail "4d-evaluation agent missing hallucination references"
fi

# Test 2.4: Two-phase evaluation process
if grep -q "Phase 1" "$MAESTRO_DIR/agents/4d-evaluation.md" && \
   grep -q "Phase 2" "$MAESTRO_DIR/agents/4d-evaluation.md"; then
    pass "4d-evaluation implements two-phase evaluation"
else
    fail "4d-evaluation missing two-phase structure"
fi

# Test 2.5: Mandatory hallucination check
if grep -q "MANDATORY" "$MAESTRO_DIR/agents/4d-evaluation.md" && \
   grep -q "hallucination" "$MAESTRO_DIR/agents/4d-evaluation.md"; then
    pass "Hallucination detection marked as MANDATORY"
else
    fail "Hallucination detection not enforced as mandatory"
fi

# Test 2.6: Verification using tools (Read, Grep, Bash)
if grep -q "Read tool" "$MAESTRO_DIR/agents/4d-evaluation.md" && \
   grep -q "Grep tool" "$MAESTRO_DIR/agents/4d-evaluation.md" && \
   grep -q "Bash tool" "$MAESTRO_DIR/agents/4d-evaluation.md"; then
    pass "4d-evaluation uses verification tools (Read, Grep, Bash)"
else
    fail "4d-evaluation missing tool-based verification"
fi

# Test 2.7: Hallucination checklist present
if grep -qi "non-existent method" "$MAESTRO_DIR/skills/hallucination-detection/SKILL.md" && \
   grep -qi "parameter" "$MAESTRO_DIR/skills/hallucination-detection/SKILL.md" && \
   grep -qi "configuration" "$MAESTRO_DIR/skills/hallucination-detection/SKILL.md"; then
    pass "Hallucination-detection skill has comprehensive checklist"
else
    fail "Hallucination-detection skill missing checklist items"
fi

# Test 2.8: Critical failure on hallucination
if grep -q "CRITICAL" "$MAESTRO_DIR/agents/4d-evaluation.md"; then
    pass "Hallucinations trigger CRITICAL FAILURE verdict"
else
    fail "Missing CRITICAL FAILURE handling for hallucinations"
fi

# Test Priority 3: Healing Loop with Iteration Limits
section "Priority 3: Healing Loop with Iteration Limits"

# Test 3.1: Healing loop section exists
if grep -q "Healing Loop" "$MAESTRO_DIR/agents/maestro.md"; then
    pass "Healing loop section exists in Maestro"
else
    fail "Healing loop section missing from Maestro"
fi

# Test 3.2: Maximum 3 iterations specified
if grep -q "3" "$MAESTRO_DIR/agents/maestro.md" && \
   grep -q "Maximum Iterations" "$MAESTRO_DIR/agents/maestro.md"; then
    pass "Maximum 3 iterations limit specified"
else
    fail "Iteration limit not specified or incorrect"
fi

# Test 3.3: User notification after limit
if grep -q "inform user" "$MAESTRO_DIR/agents/maestro.md" || \
   grep -q "transparently" "$MAESTRO_DIR/agents/maestro.md"; then
    pass "User notification after iteration limit"
else
    fail "Missing user notification after iteration limit"
fi

# Test 3.4: User options provided
if grep -q "options\|Options" "$MAESTRO_DIR/agents/maestro.md"; then
    pass "User options provided after iteration limit"
else
    fail "No user options after iteration limit"
fi

# Test 3.5: TodoWrite for iteration tracking
if grep -q "TodoWrite" "$MAESTRO_DIR/agents/maestro.md" && \
   grep -q "iteration" "$MAESTRO_DIR/agents/maestro.md"; then
    pass "TodoWrite used for iteration progress tracking"
else
    fail "TodoWrite not used for iteration tracking"
fi

# Test 3.6: Coaching feedback in refinement
if grep -q "coaching" "$MAESTRO_DIR/agents/maestro.md" && \
   grep -q "feedback" "$MAESTRO_DIR/agents/maestro.md"; then
    pass "Coaching feedback included in refinement loop"
else
    fail "Coaching feedback missing from refinement"
fi

# Test 3.7: Iteration count in re-delegation
if grep -q "Iteration.*of.*3\|iteration.*X.*of.*3" "$MAESTRO_DIR/agents/maestro.md"; then
    pass "Iteration count communicated in re-delegation"
else
    fail "Iteration count not included in re-delegation"
fi

# Test 3.8: No more "iterate without limit"
if ! grep -q "without limit\|no limit\|unlimited" "$MAESTRO_DIR/agents/maestro.md"; then
    pass "Removed 'iterate without limit' language"
else
    fail "Still contains 'iterate without limit' language"
fi

# Integration Tests
section "Integration & Consistency Tests"

# Test 4.1: All new files have proper frontmatter
if grep -q "^---$" "$MAESTRO_DIR/agents/delegater.md" && \
   grep -q "name:" "$MAESTRO_DIR/agents/delegater.md"; then
    pass "Delegater agent has proper frontmatter"
else
    fail "Delegater agent missing or malformed frontmatter"
fi

if grep -q "^---$" "$MAESTRO_DIR/skills/delegater/SKILL.md" && \
   grep -q "name:" "$MAESTRO_DIR/skills/delegater/SKILL.md"; then
    pass "Delegater skill has proper frontmatter"
else
    fail "Delegater skill missing or malformed frontmatter"
fi

# Test 4.2: Consistency in terminology
if grep -q "coordinate\|coordination" "$MAESTRO_DIR/agents/delegater.md" && \
   grep -q "coordinate\|coordination" "$MAESTRO_DIR/skills/delegater/SKILL.md"; then
    pass "Consistent coordination terminology across agent and skill"
else
    fail "Inconsistent terminology between delegater agent and skill"
fi

# Test 4.3: All files are non-empty
MIN_SIZE=1000  # bytes
delegater_agent_size=$(wc -c < "$MAESTRO_DIR/agents/delegater.md")
delegater_skill_size=$(wc -c < "$MAESTRO_DIR/skills/delegater/SKILL.md")

if [ "$delegater_agent_size" -gt "$MIN_SIZE" ] && [ "$delegater_skill_size" -gt "$MIN_SIZE" ]; then
    pass "All new files have substantial content (>1KB)"
else
    fail "Some new files are too small or empty"
fi

# Test 4.4: Documentation files created
if [ -f "/Users/awesome/dev/devtest/Maestro/ENHANCEMENT_SUMMARY.md" ]; then
    pass "Enhancement summary documentation exists"
else
    fail "Enhancement summary documentation missing"
fi

if [ -f "/Users/awesome/dev/devtest/Maestro/WHATS_NEW.md" ]; then
    pass "What's New user guide exists"
else
    fail "What's New user guide missing"
fi

# Summary
section "Test Summary"

TOTAL_TESTS=$((PASS_COUNT + FAIL_COUNT))
PASS_RATE=$((PASS_COUNT * 100 / TOTAL_TESTS))

echo ""
echo "Total Tests:  $TOTAL_TESTS"
echo -e "Passed:       ${GREEN}$PASS_COUNT${NC}"
echo -e "Failed:       ${RED}$FAIL_COUNT${NC}"
echo "Pass Rate:    $PASS_RATE%"
echo ""

if [ $FAIL_COUNT -eq 0 ]; then
    echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║     ✅ ALL TESTS PASSED - IMPLEMENTATION COMPLETE ✅         ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
    exit 0
else
    echo -e "${RED}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║     ❌ SOME TESTS FAILED - REVIEW NEEDED ❌                  ║${NC}"
    echo -e "${RED}╚══════════════════════════════════════════════════════════════╝${NC}"
    exit 1
fi
