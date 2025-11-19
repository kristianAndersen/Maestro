# Harry Wizard - Quick Reference

**Status:** Design Complete
**Date:** 2025-01-19

---

## 📋 WHAT IS HARRY?

Harry is a **meta-orchestrator agent** for the Maestro framework that enables users to create, update, audit, and heal framework components (agents, skills, hooks, commands) through an interactive wizard interface.

**Key Philosophy:** Harry delegates to specialized creator agents, never executes directly (pure Maestro pattern).

---

## 🎯 THREE USE CASES

### 1. Agent Not Found (Auto-Creation)
User requests domain work → No agent exists → Harry auto-activates → Creates agent + skill → Registry updated → New agent handles request

### 2. Skill Needed (Augmentation)
Agent lacks skill → Reports to Maestro → Harry creates skill → skill-rules.json updated → Agent re-runs with skill

### 3. Manual Maintenance (/harry command)
User runs `/harry` → Interactive menu → Create/Update components → Audit/healing loop → Integration

---

## 🏗️ ARCHITECTURE (3 TIERS)

```
┌──────────────────────────────────┐
│  TIER 1: Harry Orchestrator      │
│  - Pure delegation               │
│  - Interactive menus             │
│  - Audit/healing coordinator     │
│  - Registry manager              │
└──────────────────────────────────┘
              ↓
┌──────────────────────────────────┐
│  TIER 2: Creator Agents (5)      │
│  1. create-meta-prompts          │
│  2. create-subagents             │
│  3. create-agent-skills          │
│  4. create-hooks                 │
│  5. create-commands              │
└──────────────────────────────────┘
              ↓
┌──────────────────────────────────┐
│  TIER 3: Auditor Agents (3)      │
│  1. skill-auditor                │
│  2. subagent-auditor             │
│  3. command-auditor              │
└──────────────────────────────────┘
```

---

## 🔄 HARRY'S 9-STEP WORKFLOW

1. **Activation Analysis** - Auto/command/escalation
2. **Interactive Menu** - AskUserQuestion (8 options)
3. **Requirements Gathering** - → create-meta-prompts agent
4. **Creation Delegation** - → appropriate creator agent
5. **Mandatory Audit** - → appropriate auditor agent
6. **Healing Loop** - If score < 85, iterate with feedback
7. **Registry Integration** - Update JSON files
8. **Activation Test** - Optional user testing
9. **Completion Summary** - Report results, next steps

---

## 📦 RESOURCE INVENTORY

### From taches-cc-resources-main:

**5 Skills → Creator Agents:**
- create-subagents (308 lines + 5 refs)
- create-agent-skills (381 lines + 6 refs)
- create-meta-prompts (526 lines + 4 refs)
- create-hooks (333 lines + 6 refs)
- create-slash-commands (631 lines + 3 refs)

**3 Auditors (ready to use):**
- skill-auditor.md (378 lines)
- subagent-auditor.md (329 lines)
- slash-command-auditor.md (~300 lines)

**Total:** ~2,200 lines of core guidance + 30 reference files

---

## 🎭 4-D METHODOLOGY INTEGRATION

### Quality Gate Flow:
```
Creation → Audit (Score X/100) → [Pass >= 85 | Fail < 85]
                                        ↓              ↓
                                   Accept &      Healing Loop
                                   Integrate          ↓
                                        ↓        Extract Issues
                                   Registry           ↓
                                   Update        Re-delegate
                                        ↓              ↓
                                   Complete      Fix & Re-audit
                                                      ↓
                                                 [Loop until pass]
```

### 4-D Mapping:
- **D1 (Delegation):** Harry → Creators → Auditors
- **D2 (Description):** create-meta-prompts refines requirements
- **D3 (Discernment):** Auditors evaluate Product/Process/Performance
- **D4 (Diligence):** Healing loops iterate until excellent

---

## 📝 REGISTRY MANAGEMENT

### agent-registry.json
```json
{
  "new-agent": {
    "purpose": "...",
    "triggers": {
      "keywords": ["..."],
      "intentPatterns": ["..."],
      "operations": ["..."]
    },
    "complexity": "simple|medium|complex",
    "autonomy": "high|medium|low"
  }
}
```

### skill-rules.json
```json
{
  "new-skill": {
    "type": "domain|guardrail",
    "enforcement": "suggest|block|warn",
    "priority": "critical|high|medium|low",
    "triggers": {
      "promptTriggers": ["..."],
      "fileTriggers": ["**/*.ext"]
    }
  }
}
```

**Auto-Extraction:** Harry derives triggers from descriptions/domains

---

## 🗓️ 7-WEEK IMPLEMENTATION ROADMAP

### Week 1: Foundation
- Create harry.md orchestrator
- Create /harry command
- Update agent-registry.json
- **Deliverable:** Working Harry menu

### Weeks 2-3: Creators
- Convert 5 skills → agents (parallel)
- Test each independently
- **Deliverable:** 5 creator agents operational

### Week 4: Auditors & Healing
- Integrate 3 auditor agents
- Implement healing loop
- Add decision gates
- **Deliverable:** Audit/healing system working

### Week 5: Registry Management
- Implement extraction logic
- JSON merge operations
- Validation with jq
- **Deliverable:** Auto-registry updates

### Week 6: Integration Testing
- End-to-end all 3 use cases
- Edge case testing
- Error recovery
- **Deliverable:** Production-ready system

### Week 7: Documentation
- User guide
- Developer guide
- Examples library
- **Deliverable:** Complete documentation

---

## 🎯 SUCCESS CRITERIA

### Harry Works When:
- ✓ `/harry` shows interactive menu
- ✓ Creates components via wizard
- ✓ All components pass audit (>= 85/100)
- ✓ Registries updated automatically
- ✓ Components discoverable immediately
- ✓ Healing iterates until quality met
- ✓ User sees transparent progress

### Framework Works When:
- ✓ Users extend Maestro without coding
- ✓ Quality enforced automatically
- ✓ Framework stays agnostic
- ✓ System maintains itself
- ✓ 4-D applied consistently

---

## 📂 FILE STRUCTURE

```
.claude/
├── agents/
│   ├── agent-registry.json         # Harry updates
│   ├── harry.md                    # Orchestrator
│   ├── create-meta-prompts.md      # Creator 1
│   ├── create-subagents.md         # Creator 2
│   ├── create-agent-skills.md      # Creator 3
│   ├── create-hooks.md             # Creator 4
│   ├── create-commands.md          # Creator 5
│   ├── skill-auditor.md            # Auditor 1
│   ├── subagent-auditor.md         # Auditor 2
│   └── slash-command-auditor.md    # Auditor 3
│
├── skills/
│   └── skill-rules.json            # Harry updates
│
├── hooks/
│   └── hooks.json                  # Harry updates
│
└── commands/
    └── harry.md                    # /harry command
```

---

## 🔧 TECHNICAL SPECS

### Dependencies
**None** - Pure Claude Code ecosystem:
- Task (spawn subagents)
- AskUserQuestion (menus)
- Read, Write, Edit (files)
- Grep, Glob (search)
- Bash (validation: jq, chmod)

### Performance
- Harry: ~300 tokens (lightweight)
- Creator agents: 500-2000 tokens (isolated)
- Auditor agents: 400-800 tokens (isolated)
- **Total per creation:** ~3000-5000 tokens

### Context Management
- Harry stays lightweight (orchestration only)
- Heavy work in isolated creator contexts
- Main Maestro context unaffected

---

## 📖 DOCUMENTATION LOCATIONS

**Complete Design:**
`/Users/awesome/dev/devtest/Maestro/docs/designs/HARRY_WIZARD_COMPLETE_DESIGN.md`
- 1,200+ lines comprehensive specification
- All agent specs, workflows, patterns

**Research Summary:**
`/Users/awesome/dev/devtest/Maestro/docs/designs/HARRY_RESEARCH_SUMMARY.md`
- Research process and findings
- Resource analysis
- Performance evaluation

**Quick Reference:**
`/Users/awesome/dev/devtest/Maestro/docs/designs/HARRY_QUICK_REFERENCE.md`
- This document
- Fast lookup and navigation

---

## 🚀 NEXT STEPS

### To Begin Implementation:

1. **Review complete design:** Read HARRY_WIZARD_COMPLETE_DESIGN.md
2. **Start Phase 1:** Create harry.md orchestrator
3. **Test activation:** Verify /harry menu works
4. **Proceed to creators:** Begin skill conversions (Week 2)

### Key Resources:
- Vision: `/Users/awesome/dev/devtest/Maestro/harry.md`
- Skills: `/Users/awesome/dev/devtest/Maestro/taches-cc-resources-main/skills/`
- Auditors: `/Users/awesome/dev/devtest/Maestro/taches-cc-resources-main/agents/`
- Framework: `/Users/awesome/dev/devtest/Maestro/MAESTRO_BLUEPRINT.md`

---

## 💡 KEY INSIGHTS

1. **Skill → Agent conversion is straightforward** (1-2 days each)
2. **Auditors ready to use** (no conversion needed)
3. **Harry perfectly aligns with Maestro** (pure delegation)
4. **Self-sustaining system** (creates and maintains itself)
5. **Production-ready in 7 weeks** (phased, testable)

---

## ⚡ QUICK COMMANDS

```bash
# Start implementation
cd /Users/awesome/dev/devtest/Maestro

# Read complete design
cat docs/designs/HARRY_WIZARD_COMPLETE_DESIGN.md

# Review Phase 1 tasks
grep -A 20 "Phase 1:" docs/designs/HARRY_WIZARD_COMPLETE_DESIGN.md

# Create harry.md
touch .claude/agents/harry.md

# View existing registry
cat .claude/agents/agent-registry.json
```

---

**Research Complete** ✅
**Design Complete** ✅
**Ready for Implementation** ✅

**Estimated Timeline:** 7 weeks to production-ready Harry wizard system

**Confidence:** High - All resources analyzed, patterns validated, architecture aligned
