# defer_loading User Guide

**Document Version:** 1.0
**Last Updated:** 2025-11-27
**Status:** Production Ready

---

## What is defer_loading?

The defer_loading feature is an optimization that reduces the amount of repetitive skill information you see in Claude's responses. Instead of showing full skill descriptions every time a skill matches your task, defer_loading shows them only once per session, then uses minimal references for subsequent matches.

### Simple Explanation

**Before defer_loading:** Every prompt shows full skill guidance (too much repetition)
**With defer_loading:** First time you see full guidance, next times you see compact references only

### Example: Code Analysis Workflow

#### First Prompt (New Session)
```
You: "Analyze auth.py for security vulnerabilities"

Claude Response:
[Your actual response...]

# Skill Recommendations

Based on your task, the following skills may be helpful:

## 🟡 read (high priority)
Brief: Deep file/codebase analysis
Activate: Skill(skill: "read")

## 🟡 base-analysis (medium priority)
Brief: Code/system quality evaluation
Activate: Skill(skill: "base-analysis")
```

#### Second Prompt in Same Session (Code Analysis Again)
```
You: "Analyze config.yaml for issues"

Claude Response:
[Your actual response...]

# Skills Available

🟡 read, 🟡 base-analysis

Use Skill(skill: "name") to activate.
```

#### Third Prompt in Same Session (Different Task)
```
You: "Modify the auth handler"

Claude Response:
[Your actual response...]

# New Skills Available

## 🟠 write (high priority)
Brief: Code/file modifications
Activate: Skill(skill: "write")

Previously recommended: 🟡 read, 🟡 base-analysis, 🟠 write
```

**Token Savings:** 74% reduction across a 25-prompt session (2,562 → 666 tokens)

---

## How It Works

### Three Output Formats

#### Format 1: Full Discovery (New Session or New Skill)
Shows complete information for genuinely new skills:
- Skill name and priority level
- Brief description (2-3 sentences)
- How to activate the skill
- Usage instructions

**When you see this:** First time a skill is recommended, or after 30 minutes of inactivity

**Token cost:** ~40-50 tokens per new skill

#### Format 2: Incremental (Mix of New and Cached)
Shows new skills in full, references existing ones compactly:
```
# New Skills Available

## 🟡 fetch (medium priority)
Brief: External data retrieval
Activate: Skill(skill: "fetch")

Previously recommended: 🟠 read, 🟡 base-analysis
Use Skill(skill: "name") to activate.
```

**When you see this:** When new skills match your task, but some are already cached

**Token cost:** ~30-40 tokens (new skills only)

#### Format 3: All Cached (No New Skills)
Just a reminder of available skills, no new recommendations:
```
# Skills Available

🟡 read, 🟡 base-analysis, 🟠 write

Use Skill(skill: "name") to activate.
```

**When you see this:** All matching skills were already recommended earlier in session

**Token cost:** ~10-20 tokens (ultra-minimal)

### Session Tracking

**Session Duration:** 30 minutes of activity
**Session Reset:** Automatic after 30 minutes of inactivity
**Manual Reset:** Start a new Claude Code session (new tab/window)

**What gets tracked:**
- Skills recommended so far
- Session start time
- Skill activation history (optional)

**What gets reset:**
- Recommended skills list (after timeout)
- Session timer
- Skill tracking resets to empty

---

## Benefits

### For Token Usage
- **Initial session:** 77.5% reduction per prompt (111 vs 494 tokens)
- **With caching:** 74% cumulative reduction (666 vs 2,562 tokens on 25-prompt session)
- **Long sessions:** Savings compound as session extends

### For Response Quality
- **Less noise:** Fewer repeated descriptions cluttering responses
- **Better focus:** Full skill info when you need it, minimal when you don't
- **Cleaner context:** Less repetition in Claude's context window

### For User Experience
- **Faster responses:** Smaller skill discovery overhead
- **Relevant skills:** Still discover new applicable skills as you work
- **Progressive learning:** Activate full skill SKILL.md when you need details

---

## How to Use defer_loading

### You Don't Need to Do Anything!

defer_loading is completely automatic. It works transparently without any special commands or settings.

### Activating Skills

When you see a skill recommendation, activate it using the Skill tool:

```
Skill(skill: "read")
Skill(skill: "write")
Skill(skill: "base-analysis")
```

This loads the full SKILL.md documentation for that skill, with:
- Complete guidance and methodology
- Asset files with deep dives
- Examples and anti-patterns
- Troubleshooting guide

### Seeing All Available Skills

If you want to see what skills are available in your current session:

```
You: "Show me what skills are available"

Claude Response:
# Skills Available

🔴 4d-evaluation, 🟠 read, 🟡 write, 🟡 base-analysis, 🟡 base-research, 🟡 list, 🟠 open

Use Skill(skill: "name") to activate any of these for full guidance.
```

### Forcing Full Recommendations

If you explicitly ask for skill information, you'll get full descriptions even if skills are cached:

```
You: "What skills can help me refactor this code?"

Claude Response:
# Skill Recommendations

[Full descriptions shown, even if previously recommended in session]
```

---

## What You'll Notice

### First Interaction of Session

When you start a new Claude Code session or after 30 minutes of inactivity:
- Full skill recommendations appear
- Detailed descriptions included
- All available skills shown

**Example:** 112 words describing 6 skills

### Continuing in Same Domain

When you work within the same general domain (e.g., code analysis):
- Skill names shown briefly with priorities
- Previous recommendations are remembered
- New skills highlighted if domain shifts

**Example:** 20-30 words for follow-up code analysis prompt

### New Domain Shift

If you switch to a different type of work (e.g., from code to documentation):
- New applicable skills recommended in full
- Previous skills listed compactly
- Smooth transition between domains

**Example:** Full write/documentation skill, compact references to previous skills

### Long Sessions (50+ Prompts)

After many prompts in related domains:
- Most recommendations are cached (minimal output)
- Only genuinely new skills show in full
- Context stays clean and focused

**Example:** Most prompts show 0 words of skill discovery (100% cache hits)

---

## Troubleshooting

### Q: I'm not seeing skill recommendations anymore

**A:** Your session has likely timed out. This happens after 30 minutes of inactivity.

**Solution:**
- Start a new Claude Code session (refresh browser or new tab)
- Or wait for the natural session reset
- You can also explicitly ask "What skills are available?" for a reminder

**Why this happens:** This is intentional - longer sessions shouldn't keep repeating the same recommendations. The timeout prevents stale skill tracking.

---

### Q: I want to see full skill details again

**A:** Use the Skill tool to activate the skill and see its complete SKILL.md:

```
Skill(skill: "read")
Skill(skill: "write")
Skill(skill: "base-analysis")
```

This loads the full guidance document with:
- Methodology and best practices
- Deep-dive asset files
- Examples and patterns
- Troubleshooting guides

---

### Q: How do I know which skills are available?

**A:** Skills are automatically tracked during your session. To see them:

**Option 1:** Look at the skill recommendations - they're listed with priority icons:
- 🔴 Critical
- 🟠 High
- 🟡 Medium
- 🟢 Low

**Option 2:** Ask explicitly - "What skills are available to help me?"

**Option 3:** Activate a skill to explore - Use `Skill(skill: "skill-name")` to see full documentation

---

### Q: Skills aren't being recommended when I expect them

**A:** This usually means:

1. **The skill is cached** - It was recommended earlier in this session
   - Solution: Use `Skill(skill: "name")` directly to activate it

2. **Your session has timed out** - 30 minutes of inactivity reset tracking
   - Solution: Refresh your session or explicitly ask about skills

3. **The skill doesn't match your task** - Recommendation matching is contextual
   - Solution: Be more specific about your task so matching works better

**Example that works better:**
- Instead of: "help me"
- Try: "analyze this Python file for bugs"

---

### Q: I'm seeing duplicate skill recommendations

**A:** This shouldn't happen with defer_loading. If it does:

1. **Check your session age** - It may have reset if > 30 minutes old
2. **Refresh Claude Code** - Clear any stale state
3. **Check the format** - Skills listed compactly are "previously recommended"

**Report if:** You see the same skill with full descriptions twice in the same session

---

### Q: The skill descriptions seem too brief now

**A:** This is intentional! The brief descriptions (20-50 characters) are designed to:
- Save tokens by reducing repetition
- Point you to activate the full skill guidance
- Keep context clean and focused

**To see full descriptions:** Use `Skill(skill: "name")` to load the complete SKILL.md

---

### Q: I want to manually reset my skill tracking

**A:** Start a new Claude Code session:
1. Refresh the page or open a new tab
2. All skill tracking resets automatically
3. Your next prompt will show full skill recommendations again

---

## FAQ

### Q: Does defer_loading affect skill discovery accuracy?

**A:** No. Skill matching accuracy is unchanged. The only difference is:
- **Before:** Full descriptions shown every time
- **After:** Brief descriptions/references for cached skills

The actual skill discovery logic (which skills match your task) is identical.

---

### Q: Will defer_loading work with new skills I add?

**A:** Yes! New skills added to `.claude/skills/` will:
1. Be discovered normally in matching situations
2. Get cached like other skills after first recommendation
3. Benefit from defer_loading automatically if configured

No special setup required - defer_loading is transparent.

---

### Q: What happens if my context.json file gets corrupted?

**A:** The system has automatic recovery:
1. Detects corrupted JSON on load
2. Resets tracking to fresh state
3. Continues working normally
4. Session recommendations restart from full descriptions

No user action needed - the system recovers gracefully.

---

### Q: How does defer_loading interact with the Maestro framework?

**A:** defer_loading is integrated into Maestro's skill discovery:
- Maestro agents discover skills the same way
- Defer_loading reduces their discovery overhead
- Each agent session tracks its own skills independently
- Switching between agents resets tracking (independent sessions)

---

### Q: Does defer_loading work offline?

**A:** Yes. Skill tracking uses local `context.json`:
- Works fully offline
- No cloud dependencies
- Tracking stored locally in `.claude/context.json`
- Session timeout still applies (30 minutes)

---

### Q: Can I disable defer_loading?

**A:** Yes, though there's normally no reason to:

**Option 1: Individual skill** - Remove `defer_loading` from that skill's config in `skill-rules.json`

**Option 2: All skills** - Modify `.claude/hooks/subagent-skill-discovery.js` to ignore defer_loading

**Note:** Disabling defer_loading increases token usage by ~77% per prompt (returns to 494 tokens baseline)

---

### Q: How do I know my session hasn't timed out?

**A:** Check your inactivity time:
- Less than 30 minutes since last prompt = Session active
- More than 30 minutes of inactivity = Session resets
- New prompt after timeout = Fresh session, full recommendations

**Practical indicator:** If you see full skill descriptions again, your session likely reset.

---

### Q: Does defer_loading affect skill accuracy in code analysis?

**A:** No. The skill matching logic (what skills match your code task) is unchanged. The only difference is output format:
- **Accuracy:** Identical before/after
- **Output size:** Reduced by caching
- **Relevance:** Same skills recommended

---

### Q: What skills are affected by defer_loading?

**Enabled for these skills:**
- `read` - Deep file/codebase analysis
- `write` - Code/file modifications
- `base-research` - Information gathering
- `base-analysis` - Code/system quality evaluation
- `4d-evaluation` - Quality assessment
- `fetch` - External data retrieval
- `list` - Directory/file listing
- `open` - File reading operations
- `hallucination-detection` - Output verification

**All 11 core skills** have defer_loading enabled.

---

### Q: Will I miss important skill recommendations?

**A:** No. New skills are still discovered and recommended in full:
- When a new matching skill is found, it shows in full
- Cached skills are listed compactly, but available
- You can activate any skill with `Skill(skill: "name")`
- Nothing is hidden or lost

---

### Q: How long does a session last?

**A:** Standard session: **30 minutes of activity**

**Session clock:**
- Resets on each prompt/interaction
- If idle >30 minutes: session expires
- New prompt after expiry: new session, tracking resets
- No explicit timer shown - happens automatically

**For extended work:**
- Stay active (prompt at least every 30 minutes)
- System tracks automatically
- No intervention needed

---

### Q: Can I check my session state?

**A:** You can see the context state at:
`.claude/context.json`

**View recommended skills:**
```bash
cat .claude/context.json | jq '.skillTracking.recommended'
```

**Output example:**
```json
[
  "read",
  "write",
  "base-analysis",
  "4d-evaluation"
]
```

---

## Tips for Best Experience

### Tip 1: Use Explicit Skill Activation
When you know which skill you need, activate it directly:
```
Skill(skill: "read")
```
Faster than waiting for recommendations.

### Tip 2: Describe Your Task Clearly
More specific task descriptions → better skill matching:
- ✓ "Analyze this Python auth module for security vulnerabilities"
- ✗ "help me analyze something"

### Tip 3: Use Skills for Deep Dives
When you need full guidance, activate the skill:
```
Skill(skill: "base-analysis")
```
Gets you the complete methodology + examples.

### Tip 4: Trust the Compact Format
Cached skills shown compactly are still fully available:
```
🟡 read, 🟡 write, 🟠 base-analysis
```
Use `Skill(skill: "name")` to activate any of them.

### Tip 5: Leverage Session Continuity
Skills recommended once stay available for 30 minutes:
- No re-recommendations for same tasks
- Skill context stays clean
- Perfect for focused work sessions

---

## Related Documentation

- **Developer Guide:** `docs/DEFER_LOADING_DEVELOPER_GUIDE.md` - Implementation details
- **Rollback Procedure:** `docs/DEFER_LOADING_ROLLBACK.md` - Emergency procedures
- **Design Document:** `docs/defer-loading-design.md` - Original specifications
- **Validation Report:** `docs/phase2-validation-report.md` - Performance metrics
- **Token Methodology:** `docs/token-measurement-methodology.md` - How savings are measured

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-11-27 | Initial user guide, production ready |

---

**Last Updated:** 2025-11-27
**Status:** Production Ready
**Next Review:** 2025-12-27 (monthly validation)
