# defer_loading Implementation Plan

## Purpose

This document provides a comprehensive, trackable implementation plan for integrating the `defer_loading` parameter into Maestro's skill discovery system. The implementation follows a phased approach prioritizing foundation stability before optimization.

**Timeline**: 12 weeks (3 months)
**Expected Benefits**:
- 40-60% reduction in skill loading costs (from $0.003-0.004 to $0.001-0.002 per skill)
- Improved response time for skill-heavy operations
- Foundation for future Haiku optimization (additional 93% cost reduction)
- Better context management and user experience

---

## Quick Status Dashboard

```
Phase 1: defer_loading Foundation [Weeks 1-8]
├─ Week 1-2: Analysis & Design               [ ] 0%
├─ Week 3-4: Core Implementation             [ ] 0%
├─ Week 5-6: Hook Integration                [ ] 0%
└─ Week 7-8: Testing & Documentation         [ ] 0%

Phase 2: Haiku Optimization [Weeks 9-12]
├─ Week 9-10: Dual Model Implementation      [ ] 0%
└─ Week 11-12: Validation & Launch           [ ] 0%

Phase 3: Advanced Optimization [Deferred]
└─ Selective skill loading (Future)

Overall Progress: 0/52 tasks complete (0%)
```

---

## Phase 1: defer_loading Foundation (Weeks 1-8)

### Week 1: Analysis & Design (5 tasks, ~12 hours)

#### 1.1 Document Current Skill Loading Flow
- [ ] **Task**: Map complete skill loading flow from user request to skill activation
- **Files**: Document in `docs/skill-loading-architecture.md`
- **Details**:
  - Trace through `subagent-skill-discovery.js` hook
  - Document how skills are read and passed to subagents
  - Identify all points where skill content is loaded
  - Map token usage at each stage
- **Estimated Time**: 2 hours
- **Evidence**: Architecture diagram showing current flow with token counts
- **Dependencies**: None

#### 1.2 Design defer_loading Integration Points
- [ ] **Task**: Design where and how `defer_loading` will be integrated
- **Files**: Create `docs/defer-loading-design.md`
- **Details**:
  - Identify modification points in hook system
  - Design skill reference format (path + metadata only)
  - Plan fallback strategy for resources/*.md files
  - Define success criteria for Phase 1
- **Estimated Time**: 3 hours
- **Evidence**: Design document with API contracts and data structures
- **Dependencies**: Task 1.1 complete

#### 1.3 Create Test Skill Set
- [ ] **Task**: Create minimal test skills for validation
- **Files**: `.claude/skills/test-skill-a/`, `.claude/skills/test-skill-b/`
- **Details**:
  - Create 2-3 test skills with known sizes
  - Include SKILL.md + resources/ structure
  - Document expected token counts
  - Add to `skill-rules.json` with test triggers
- **Estimated Time**: 2 hours
- **Evidence**: Test skills registered and discoverable via hooks
- **Dependencies**: None

#### 1.4 Baseline Performance Metrics
- [ ] **Task**: Establish baseline measurements before changes
- **Files**: `docs/baseline-metrics.md`
- **Details**:
  - Measure current skill loading cost (tokens/cost)
  - Time skill discovery and activation
  - Document current user experience flow
  - Create test scenarios for before/after comparison
- **Estimated Time**: 3 hours
- **Evidence**: Spreadsheet with baseline metrics for 5+ test scenarios
- **Dependencies**: Task 1.3 complete

#### 1.5 Risk Assessment
- [ ] **Task**: Identify and document potential risks
- **Files**: Add "Risks & Mitigation" section to `docs/defer-loading-design.md`
- **Details**:
  - Backward compatibility concerns
  - Failure modes (what if defer_loading doesn't work?)
  - Impact on existing skills
  - Rollback strategy
- **Estimated Time**: 2 hours
- **Evidence**: Risk matrix with mitigation strategies
- **Dependencies**: Task 1.2 complete

**Week 1 Completion Criteria**: Design approved, test environment ready, baseline metrics documented

---

### Week 2: Prototype & Validation (6 tasks, ~14 hours)

#### 2.1 Create Skill Reference Format
- [ ] **Task**: Implement minimal skill reference structure
- **Files**: Create `lib/skill-reference.js`
- **Details**:
  ```javascript
  // Example structure:
  {
    name: "write",
    path: "/absolute/path/to/.claude/skills/write/SKILL.md",
    description: "Provides guidance for file modifications",
    trigger_matched: "write_operation",
    defer_resources: true
  }
  ```
- **Estimated Time**: 2 hours
- **Evidence**: Module exports createSkillReference() function with tests
- **Dependencies**: Task 1.2 complete

#### 2.2 Modify subagent-skill-discovery.js Hook
- [ ] **Task**: Update hook to generate skill references instead of full content
- **Files**: `.claude/hooks/subagent-skill-discovery.js`
- **Details**:
  - Keep existing trigger matching logic
  - Replace fs.readFileSync() with reference generation
  - Add feature flag: `DEFER_LOADING_ENABLED=true`
  - Preserve backward compatibility (flag=false uses old behavior)
- **Estimated Time**: 3 hours
- **Evidence**: Hook outputs skill references when flag enabled
- **Dependencies**: Task 2.1 complete

#### 2.3 Update Subagent Prompts
- [ ] **Task**: Modify base agents to handle skill references
- **Files**: `.claude/agents/file-writer.md`, `.claude/agents/file-reader.md`
- **Details**:
  - Add instructions to use Skill tool with defer_loading
  - Update "Skills to Discover" section format
  - Add fallback: "If defer_loading not available, request full content"
  - Keep instructions framework-agnostic
- **Estimated Time**: 2 hours
- **Evidence**: Updated agent prompts with defer_loading instructions
- **Dependencies**: Task 2.2 complete

#### 2.4 Manual Testing - Happy Path
- [ ] **Task**: Test defer_loading with test skills manually
- **Files**: Document in `docs/defer-loading-test-log.md`
- **Details**:
  - Enable DEFER_LOADING_ENABLED flag
  - Trigger test-skill-a via user request
  - Verify Skill tool activates with defer_loading=true
  - Confirm skill content loads correctly
  - Compare token usage vs baseline
- **Estimated Time**: 3 hours
- **Evidence**: Test log showing successful defer_loading activation
- **Dependencies**: Tasks 2.2, 2.3 complete

#### 2.5 Manual Testing - Fallback Path
- [ ] **Task**: Test backward compatibility (flag disabled)
- **Files**: Append to `docs/defer-loading-test-log.md`
- **Details**:
  - Disable DEFER_LOADING_ENABLED flag
  - Verify hook still loads full skill content
  - Confirm subagents work without defer_loading
  - Test with mix of old/new agent prompts
- **Estimated Time**: 2 hours
- **Evidence**: Test log showing graceful fallback
- **Dependencies**: Task 2.4 complete

#### 2.6 Measure Prototype Performance
- [ ] **Task**: Compare prototype metrics vs baseline
- **Files**: `docs/prototype-metrics.md`
- **Details**:
  - Run same test scenarios as baseline (Task 1.4)
  - Measure token reduction percentage
  - Measure response time changes
  - Calculate cost savings
  - Identify any regressions
- **Estimated Time**: 2 hours
- **Evidence**: Side-by-side comparison showing 40-60% token reduction
- **Dependencies**: Task 2.4 complete

**Week 2 Completion Criteria**: Prototype demonstrates 40%+ token reduction, no regressions, fallback works

---

### Week 3-4: Core Implementation (10 tasks, ~22 hours)

#### 3.1 Implement Skill Reference Module
- [ ] **Task**: Productionize skill reference generation
- **Files**: `lib/skill-reference.js`
- **Details**:
  - Add input validation (skill path exists, readable)
  - Handle edge cases (missing description, malformed YAML)
  - Add error handling with graceful degradation
  - Include JSDoc comments
- **Estimated Time**: 2 hours
- **Evidence**: Module handles all edge cases with tests
- **Dependencies**: Task 2.1 complete

#### 3.2 Add Skill Reference Tests
- [ ] **Task**: Create unit tests for skill reference module
- **Files**: `tests/skill-reference.test.js`
- **Details**:
  - Test valid skill reference creation
  - Test missing file handling
  - Test malformed YAML handling
  - Test defer_resources flag behavior
- **Estimated Time**: 2 hours
- **Evidence**: Test suite with 90%+ coverage
- **Dependencies**: Task 3.1 complete

#### 3.3 Production Hook Implementation
- [ ] **Task**: Finalize subagent-skill-discovery.js with defer_loading
- **Files**: `.claude/hooks/subagent-skill-discovery.js`
- **Details**:
  - Refactor to use skill-reference.js module
  - Add comprehensive error handling
  - Add logging for debugging
  - Include performance metrics collection
  - Keep feature flag for staged rollout
- **Estimated Time**: 3 hours
- **Evidence**: Hook code is production-ready with error handling
- **Dependencies**: Task 3.1 complete

#### 3.4 Update All Base Agents (8 agents)
- [ ] **Task**: Update all agent prompts to support defer_loading
- **Files**:
  - `.claude/agents/list.md`
  - `.claude/agents/open.md`
  - `.claude/agents/file-reader.md`
  - `.claude/agents/file-writer.md`
  - `.claude/agents/fetch.md`
  - `.claude/agents/base-research.md`
  - `.claude/agents/base-analysis.md`
  - `.claude/agents/4d-evaluation.md`
- **Details**: For each agent:
  - Update "Skills to Discover" section
  - Add defer_loading usage instructions
  - Add fallback instructions
  - Verify framework-agnostic language
- **Estimated Time**: 4 hours (30 min per agent)
- **Evidence**: All 8 agents updated consistently
- **Dependencies**: Task 2.3 complete

#### 3.5 Update skill-rules.json Schema
- [ ] **Task**: Add metadata to support defer_loading
- **Files**: `.claude/skills/skill-rules.json`
- **Details**:
  - Add optional `deferResources` field per skill
  - Add optional `estimatedTokens` field (for metrics)
  - Validate schema with all existing skills
  - Document new fields in comments
- **Estimated Time**: 1 hour
- **Evidence**: Updated schema validated against all skills
- **Dependencies**: None

#### 3.6 Update Skill Template
- [ ] **Task**: Update skill creation template
- **Files**: `templates/SKILL_TEMPLATE.md`
- **Details**:
  - Add YAML frontmatter for defer_loading metadata
  - Update instructions for skill creators
  - Add guidance on resource organization
  - Include examples of defer_loading-friendly structure
- **Estimated Time**: 2 hours
- **Evidence**: Template includes defer_loading best practices
- **Dependencies**: Task 3.5 complete

#### 3.7 Integration Testing - Single Skill
- [ ] **Task**: Test complete flow with one real skill
- **Files**: Test with `.claude/skills/write/SKILL.md`
- **Details**:
  - Enable defer_loading flag
  - Trigger skill via file modification request
  - Verify skill activates correctly
  - Verify resources load on-demand
  - Check token usage matches expectations
- **Estimated Time**: 2 hours
- **Evidence**: Write skill works end-to-end with defer_loading
- **Dependencies**: Tasks 3.3, 3.4 complete

#### 3.8 Integration Testing - Multiple Skills
- [ ] **Task**: Test with multiple skills in one session
- **Files**: Test with `write`, `read`, `4d-evaluation` skills
- **Details**:
  - Create user request triggering 3+ skills
  - Verify all skills discover correctly
  - Verify defer_loading works for each
  - Check no interference between skills
  - Measure cumulative token savings
- **Estimated Time**: 3 hours
- **Evidence**: Multi-skill session shows expected token savings
- **Dependencies**: Task 3.7 complete

#### 3.9 Edge Case Testing
- [ ] **Task**: Test failure modes and edge cases
- **Files**: Document in `docs/edge-case-test-results.md`
- **Details**:
  - Test skill file missing/unreadable
  - Test malformed YAML frontmatter
  - Test skill with no resources/ directory
  - Test defer_loading=false explicitly
  - Verify graceful degradation in all cases
- **Estimated Time**: 2 hours
- **Evidence**: All edge cases handled gracefully
- **Dependencies**: Task 3.8 complete

#### 3.10 Performance Regression Testing
- [ ] **Task**: Verify no performance regressions
- **Files**: Update `docs/performance-metrics.md`
- **Details**:
  - Run baseline test suite again
  - Compare response times
  - Verify 40-60% token reduction achieved
  - Check no increase in error rates
  - Document any unexpected behaviors
- **Estimated Time**: 1 hour
- **Evidence**: Metrics confirm improvement, no regressions
- **Dependencies**: Task 3.9 complete

**Week 3-4 Completion Criteria**: All base agents support defer_loading, integration tests pass, 40-60% token reduction confirmed

---

### Week 5-6: Hook Integration & Refinement (8 tasks, ~16 hours)

#### 5.1 Add Hook Performance Monitoring
- [ ] **Task**: Instrument hook for performance tracking
- **Files**: `.claude/hooks/subagent-skill-discovery.js`
- **Details**:
  - Add timing measurements (hook execution time)
  - Count skills discovered per request
  - Track defer_loading usage rate
  - Log to `.maestro-performance.log`
- **Estimated Time**: 2 hours
- **Evidence**: Performance log shows detailed metrics
- **Dependencies**: Task 3.3 complete

#### 5.2 Implement Feature Flag System
- [ ] **Task**: Create robust feature flag management
- **Files**: Create `lib/feature-flags.js`
- **Details**:
  - Support environment variables (DEFER_LOADING_ENABLED)
  - Support config file (`.claude/feature-flags.json`)
  - Add per-skill override capability
  - Include flag validation
- **Estimated Time**: 2 hours
- **Evidence**: Feature flags configurable via multiple methods
- **Dependencies**: None

#### 5.3 Add Hook Error Recovery
- [ ] **Task**: Improve error handling in skill discovery hook
- **Files**: `.claude/hooks/subagent-skill-discovery.js`
- **Details**:
  - Wrap all operations in try-catch
  - Log errors to `.maestro-errors.log`
  - Fall back to no-suggestion on critical error
  - Never block user request due to hook failure
- **Estimated Time**: 2 hours
- **Evidence**: Hook gracefully handles all error scenarios
- **Dependencies**: Task 5.1 complete

#### 5.4 Update maestro-agent-suggester.js
- [ ] **Task**: Ensure agent suggester works with defer_loading
- **Files**: `.claude/hooks/maestro-agent-suggester.js`
- **Details**:
  - Verify compatibility with skill references
  - Test agent + skill suggestions together
  - Ensure no context bloat from suggestions
  - Add defer_loading metadata to suggestions
- **Estimated Time**: 2 hours
- **Evidence**: Agent suggester works harmoniously with skill discovery
- **Dependencies**: Task 3.3 complete

#### 5.5 Update work-tracker.sh Hook
- [ ] **Task**: Ensure work tracker records defer_loading usage
- **Files**: `.claude/hooks/work-tracker.sh`
- **Details**:
  - Track when defer_loading is used
  - Log skill activation counts
  - Record token savings metrics
  - Append to `.maestro-work-log.txt`
- **Estimated Time**: 1 hour
- **Evidence**: Work log shows defer_loading usage patterns
- **Dependencies**: Task 5.1 complete

#### 5.6 End-to-End Workflow Testing
- [ ] **Task**: Test complete Maestro workflow with defer_loading
- **Files**: Document in `docs/e2e-test-scenarios.md`
- **Details**:
  - Test: User request → Agent selection → Skill discovery → Task completion
  - Scenario 1: File modification (writer + write skill)
  - Scenario 2: Code analysis (reader + read skill)
  - Scenario 3: Research task (base-research + research skill)
  - Verify hooks coordinate correctly
  - Measure total token savings per scenario
- **Estimated Time**: 4 hours
- **Evidence**: 3 complete workflows tested end-to-end
- **Dependencies**: Tasks 5.3, 5.4, 5.5 complete

#### 5.7 User Experience Validation
- [ ] **Task**: Verify defer_loading is invisible to users
- **Files**: Document in `docs/ux-validation.md`
- **Details**:
  - Test that responses are equivalent with/without defer_loading
  - Verify no "skill not found" errors
  - Check response quality unchanged
  - Confirm response time improvements
- **Estimated Time**: 2 hours
- **Evidence**: User-facing behavior identical or better
- **Dependencies**: Task 5.6 complete

#### 5.8 Create Rollback Plan
- [ ] **Task**: Document procedure to disable defer_loading if needed
- **Files**: `docs/defer-loading-rollback.md`
- **Details**:
  - Step-by-step rollback instructions
  - How to disable feature flag
  - How to revert agent prompts if needed
  - Expected impact of rollback
  - Monitoring to confirm rollback success
- **Estimated Time**: 1 hour
- **Evidence**: Clear rollback procedure documented
- **Dependencies**: Task 5.2 complete

**Week 5-6 Completion Criteria**: Hooks work together seamlessly, feature flags enable staged rollout, rollback plan ready

---

### Week 7-8: Testing & Documentation (10 tasks, ~20 hours)

#### 7.1 Create Automated Test Suite
- [ ] **Task**: Build automated tests for defer_loading
- **Files**: `tests/defer-loading.test.js`
- **Details**:
  - Test skill reference generation
  - Test hook integration
  - Test feature flag system
  - Test error handling
  - Test performance benchmarks
- **Estimated Time**: 3 hours
- **Evidence**: Automated test suite with 85%+ coverage
- **Dependencies**: Tasks 3.1, 3.3, 5.2 complete

#### 7.2 Stress Testing
- [ ] **Task**: Test defer_loading under load
- **Files**: Document in `docs/stress-test-results.md`
- **Details**:
  - Test with 10+ skills in one session
  - Test with rapid successive requests
  - Test with large skill files (edge of 500 line limit)
  - Monitor memory usage
  - Check for race conditions
- **Estimated Time**: 2 hours
- **Evidence**: System stable under stress, no resource leaks
- **Dependencies**: Task 5.6 complete

#### 7.3 Compatibility Testing
- [ ] **Task**: Verify backward compatibility
- **Files**: Document in `docs/compatibility-matrix.md`
- **Details**:
  - Test with old agent prompts (no defer_loading support)
  - Test with new agents + old hooks (flag disabled)
  - Test with mixed skill versions
  - Verify no breaking changes
- **Estimated Time**: 2 hours
- **Evidence**: Full backward compatibility confirmed
- **Dependencies**: Task 5.8 complete

#### 7.4 Write User Documentation
- [ ] **Task**: Create user-facing documentation
- **Files**: `docs/DEFER_LOADING_USER_GUIDE.md`
- **Details**:
  - Explain what defer_loading is (simple terms)
  - Expected benefits for users
  - How to enable/disable
  - Troubleshooting common issues
  - FAQ section
- **Estimated Time**: 2 hours
- **Evidence**: Clear, user-friendly documentation
- **Dependencies**: Task 7.3 complete

#### 7.5 Write Developer Documentation
- [ ] **Task**: Create developer-facing documentation
- **Files**: `docs/DEFER_LOADING_DEVELOPER_GUIDE.md`
- **Details**:
  - Architecture overview
  - API documentation for skill references
  - Hook integration guide
  - How to create defer_loading-compatible skills
  - Troubleshooting and debugging
- **Estimated Time**: 3 hours
- **Evidence**: Comprehensive developer guide
- **Dependencies**: Task 7.4 complete

#### 7.6 Update MAESTRO_BLUEPRINT.md
- [ ] **Task**: Add defer_loading to architecture documentation
- **Files**: `MAESTRO_BLUEPRINT.md`
- **Details**:
  - Add to "Progressive Disclosure" section
  - Update "Skill Discovery System" section
  - Add performance characteristics
  - Update diagrams if needed
- **Estimated Time**: 2 hours
- **Evidence**: Blueprint reflects defer_loading integration
- **Dependencies**: Task 7.5 complete

#### 7.7 Update CLAUDE.md
- [ ] **Task**: Add defer_loading to project overview
- **Files**: `CLAUDE.md`
- **Details**:
  - Update "Key Design Patterns" section
  - Add to "Working with Skills" guidance
  - Include defer_loading in skill creation instructions
- **Estimated Time**: 1 hour
- **Evidence**: CLAUDE.md reflects new capabilities
- **Dependencies**: Task 7.6 complete

#### 7.8 Create Migration Guide
- [ ] **Task**: Guide for updating existing custom skills
- **Files**: `docs/DEFER_LOADING_MIGRATION_GUIDE.md`
- **Details**:
  - How to update custom skill structure
  - Checklist for defer_loading compatibility
  - Common migration issues and solutions
  - Testing your migrated skill
- **Estimated Time**: 2 hours
- **Evidence**: Clear migration path for custom skills
- **Dependencies**: Task 7.5 complete

#### 7.9 Final Validation Testing
- [ ] **Task**: Complete test pass before Phase 1 completion
- **Files**: Document in `docs/phase1-validation-report.md`
- **Details**:
  - Run all automated tests
  - Execute all manual test scenarios
  - Verify all documentation accurate
  - Confirm 40-60% token reduction achieved
  - Check all completion criteria met
- **Estimated Time**: 2 hours
- **Evidence**: Validation report with all checks passed
- **Dependencies**: All Week 7-8 tasks complete

#### 7.10 Phase 1 Retrospective
- [ ] **Task**: Document lessons learned and next steps
- **Files**: `docs/phase1-retrospective.md`
- **Details**:
  - What went well
  - What could be improved
  - Unexpected challenges
  - Recommendations for Phase 2
  - Metrics summary (token savings, time saved)
- **Estimated Time**: 1 hour
- **Evidence**: Retrospective document for future reference
- **Dependencies**: Task 7.9 complete

**Week 7-8 Completion Criteria**: All tests pass, documentation complete, 40-60% token reduction validated, ready for production

---

## Phase 2: Haiku Optimization (Weeks 9-12)

### Week 9-10: Dual Model Implementation (8 tasks, ~18 hours)

#### 9.1 Research Haiku 3.5 Capabilities
- [ ] **Task**: Understand Haiku 3.5 for skill discovery
- **Files**: Document in `docs/haiku-capabilities-analysis.md`
- **Details**:
  - Test Haiku's ability to parse skill-rules.json
  - Test pattern matching accuracy vs Sonnet
  - Measure false positive/negative rates
  - Document edge cases where Haiku struggles
- **Estimated Time**: 3 hours
- **Evidence**: Capability matrix showing Haiku vs Sonnet
- **Dependencies**: Phase 1 complete

#### 9.2 Design Dual Model Architecture
- [ ] **Task**: Design system for Haiku + Sonnet coordination
- **Files**: Create `docs/dual-model-architecture.md`
- **Details**:
  - Define when to use Haiku vs Sonnet
  - Design handoff mechanism (Haiku discovers, Sonnet validates)
  - Plan fallback strategy (Haiku failure → Sonnet)
  - Define confidence thresholds
- **Estimated Time**: 2 hours
- **Evidence**: Architecture diagram with decision flows
- **Dependencies**: Task 9.1 complete

#### 9.3 Implement Model Selection Logic
- [ ] **Task**: Create module for model selection
- **Files**: Create `lib/model-selector.js`
- **Details**:
  - Implement decision logic (Haiku for discovery, Sonnet for complex)
  - Add confidence scoring
  - Include override mechanism
  - Add logging for model selection decisions
- **Estimated Time**: 3 hours
- **Evidence**: Module selects appropriate model based on task
- **Dependencies**: Task 9.2 complete

#### 9.4 Update subagent-skill-discovery.js for Haiku
- [ ] **Task**: Modify hook to support dual models
- **Files**: `.claude/hooks/subagent-skill-discovery.js`
- **Details**:
  - Integrate model-selector.js
  - Add Haiku-specific skill matching logic
  - Keep Sonnet validation layer
  - Add feature flag: HAIKU_DISCOVERY_ENABLED
  - Maintain backward compatibility
- **Estimated Time**: 3 hours
- **Evidence**: Hook uses Haiku when appropriate
- **Dependencies**: Task 9.3 complete

#### 9.5 Create Haiku-Specific Test Suite
- [ ] **Task**: Build tests for Haiku skill discovery
- **Files**: `tests/haiku-discovery.test.js`
- **Details**:
  - Test Haiku pattern matching accuracy
  - Test Sonnet validation layer
  - Test fallback scenarios
  - Measure performance vs Sonnet-only
  - Test confidence scoring
- **Estimated Time**: 2 hours
- **Evidence**: Test suite validates Haiku accuracy
- **Dependencies**: Task 9.4 complete

#### 9.6 Validate Haiku Accuracy
- [ ] **Task**: Compare Haiku vs Sonnet skill discovery
- **Files**: Document in `docs/haiku-accuracy-validation.md`
- **Details**:
  - Run 50+ test scenarios through both models
  - Compare skill suggestions
  - Measure false positive rate
  - Measure false negative rate
  - Calculate accuracy percentage
  - Target: 95%+ agreement with Sonnet
- **Estimated Time**: 3 hours
- **Evidence**: Haiku achieves 95%+ accuracy vs Sonnet baseline
- **Dependencies**: Task 9.5 complete

#### 9.7 Performance Benchmarking
- [ ] **Task**: Measure cost and speed improvements
- **Files**: `docs/haiku-performance-metrics.md`
- **Details**:
  - Measure Haiku vs Sonnet cost per skill discovery
  - Calculate total cost savings (defer_loading + Haiku)
  - Measure response time differences
  - Project monthly cost savings
  - Target: 93% cost reduction on skill discovery
- **Estimated Time**: 1 hour
- **Evidence**: Metrics show 93%+ cost reduction
- **Dependencies**: Task 9.6 complete

#### 9.8 Edge Case Handling
- [ ] **Task**: Identify and fix Haiku edge cases
- **Files**: Update `lib/model-selector.js` and hook
- **Details**:
  - Document cases where Haiku fails
  - Implement automatic Sonnet fallback
  - Add confidence thresholds
  - Test complex multi-skill scenarios
  - Ensure no quality degradation
- **Estimated Time**: 1 hour
- **Evidence**: All edge cases handled gracefully
- **Dependencies**: Task 9.7 complete

**Week 9-10 Completion Criteria**: Haiku integrated, 95%+ accuracy, 93% cost reduction, no quality regression

---

### Week 11-12: Validation & Launch (5 tasks, ~10 hours)

#### 11.1 Integration Testing - Full System
- [ ] **Task**: Test complete system with both optimizations
- **Files**: Document in `docs/phase2-integration-tests.md`
- **Details**:
  - Test defer_loading + Haiku together
  - Run all Phase 1 test scenarios again
  - Verify cumulative benefits achieved
  - Check for interaction issues
  - Measure total cost reduction (baseline → Phase 2)
- **Estimated Time**: 3 hours
- **Evidence**: Full system tests pass, cumulative savings validated
- **Dependencies**: All Week 9-10 tasks complete

#### 11.2 User Acceptance Testing
- [ ] **Task**: Validate with real-world usage patterns
- **Files**: Document in `docs/phase2-uat-results.md`
- **Details**:
  - Test with realistic user requests
  - Verify response quality unchanged
  - Confirm cost savings in production
  - Gather user feedback if available
  - Identify any usability issues
- **Estimated Time**: 2 hours
- **Evidence**: UAT confirms production readiness
- **Dependencies**: Task 11.1 complete

#### 11.3 Update All Documentation
- [ ] **Task**: Reflect Haiku integration in docs
- **Files**:
  - `docs/DEFER_LOADING_USER_GUIDE.md`
  - `docs/DEFER_LOADING_DEVELOPER_GUIDE.md`
  - `MAESTRO_BLUEPRINT.md`
  - `CLAUDE.md`
- **Details**:
  - Add Haiku optimization section
  - Update performance characteristics
  - Add dual model architecture diagrams
  - Update troubleshooting guides
- **Estimated Time**: 2 hours
- **Evidence**: Documentation reflects Phase 2 capabilities
- **Dependencies**: Task 11.2 complete

#### 11.4 Create Launch Checklist
- [ ] **Task**: Final checks before production rollout
- **Files**: `docs/phase2-launch-checklist.md`
- **Details**:
  - [ ] All tests passing
  - [ ] Documentation complete and reviewed
  - [ ] Feature flags configured correctly
  - [ ] Rollback plan updated for Haiku
  - [ ] Monitoring/logging in place
  - [ ] Performance metrics baseline established
  - [ ] Team trained on new system (if applicable)
- **Estimated Time**: 1 hour
- **Evidence**: Checklist completed with all items checked
- **Dependencies**: Task 11.3 complete

#### 11.5 Phase 2 Retrospective & Metrics Summary
- [ ] **Task**: Document final results and lessons learned
- **Files**: `docs/phase2-retrospective.md`
- **Details**:
  - Total cost savings achieved (percentage and dollars)
  - Performance improvements measured
  - Lessons learned from Haiku integration
  - Recommendations for Phase 3
  - Success metrics summary
  - Known limitations and future work
- **Estimated Time**: 2 hours
- **Evidence**: Comprehensive retrospective with metrics
- **Dependencies**: Task 11.4 complete

**Week 11-12 Completion Criteria**: Haiku + defer_loading in production, 93%+ cost reduction achieved, documentation complete

---

## Phase 3: Advanced Optimization (Deferred)

### Why Deferred

Phase 3 focuses on selective skill loading (only loading skills that will actually be used, determined by Maestro's task delegation). This is deferred because:

1. **Diminishing Returns**: Phase 1 + 2 achieve ~93% cost reduction; Phase 3 adds marginal gains
2. **Complexity**: Requires deep integration with Maestro's delegation logic
3. **Risk**: More complex = more potential for bugs
4. **Validation Needed**: Need real-world data from Phase 1+2 to inform Phase 3 design

### Phase 3 Scope (Future)
- Maestro pre-analyzes user request
- Identifies which skills will be needed
- Only loads those specific skills
- Requires predictive model for skill usage
- Target: Additional 10-20% cost reduction on multi-skill scenarios

### Criteria for Revisiting Phase 3

Consider Phase 3 when:
- [ ] Phase 2 has been in production for 3+ months
- [ ] Real-world usage data shows significant multi-skill scenarios (>30% of requests)
- [ ] Cost analysis shows Phase 3 ROI justifies complexity
- [ ] Predictive skill usage model achieves 90%+ accuracy in testing

---

## Work Log Integration

### Using `.maestro-work-log.txt`

The work log tracks all modifications and progress across sessions. Here's how to integrate it with this implementation plan:

#### When Starting Work
```bash
# Check current work log
tail -20 .maestro-work-log.txt

# Review what was done previously
grep "defer_loading" .maestro-work-log.txt
```

#### When Completing Tasks
1. **Check the checkbox** in this document (change `[ ]` to `[x]`)
2. **Update work log** with evidence:
   ```bash
   echo "[$(date)] Completed Task 1.1: Documented skill loading flow in docs/skill-loading-architecture.md" >> .maestro-work-log.txt
   echo "[$(date)] Evidence: Architecture diagram created with token counts" >> .maestro-work-log.txt
   ```

#### When Resuming Sessions
1. Review this plan to see which tasks are checked
2. Check work log for context on completed work
3. Start from first unchecked task

#### Automated Work Log Updates

The `work-tracker.sh` hook automatically logs:
- Tool usage (Read, Write, Edit, Bash)
- File modifications
- Git commits

Manual entries needed for:
- Task completion checkmarks
- Milestone achievements
- Important decisions or blockers

### Work Log Format
```
[YYYY-MM-DD HH:MM] Phase 1, Task X.Y: [Description]
[YYYY-MM-DD HH:MM] Evidence: [What proves completion]
[YYYY-MM-DD HH:MM] Metrics: [Relevant measurements]
[YYYY-MM-DD HH:MM] Notes: [Context, decisions, blockers]
```

---

## Testing & Validation Strategy

### Phase 1 Success Criteria
- [ ] All 52 Phase 1 tasks completed
- [ ] 40-60% token reduction on skill loading measured
- [ ] No regressions in response quality
- [ ] Backward compatibility maintained
- [ ] All automated tests passing (85%+ coverage)
- [ ] Documentation complete and reviewed
- [ ] Rollback plan tested

### Phase 2 Success Criteria
- [ ] All 13 Phase 2 tasks completed
- [ ] Haiku achieves 95%+ accuracy vs Sonnet baseline
- [ ] 93% cost reduction on skill discovery operations
- [ ] No quality degradation in skill suggestions
- [ ] Dual model system stable and performant
- [ ] Updated documentation reflects Haiku integration

### Key Metrics to Track

| Metric | Baseline | Phase 1 Target | Phase 2 Target | Actual |
|--------|----------|----------------|----------------|--------|
| Tokens per skill load | ~15,000 | ~6,000 | ~6,000 | TBD |
| Cost per skill load | $0.003-0.004 | $0.001-0.002 | $0.0001 | TBD |
| Skill discovery accuracy | 100% (Sonnet) | 100% | 95%+ (Haiku) | TBD |
| Response time | Baseline | -10% or better | -15% or better | TBD |
| False positive rate | 0% | <2% | <5% | TBD |
| Monthly cost savings | $0 | $50-100 | $200-300 | TBD |

### Testing Checklist

#### Unit Tests
- [ ] Skill reference generation
- [ ] Feature flag system
- [ ] Model selection logic
- [ ] Error handling and fallbacks

#### Integration Tests
- [ ] Hook coordination (agent suggester + skill discovery)
- [ ] Skill activation with defer_loading
- [ ] Multi-skill scenarios
- [ ] Backward compatibility

#### End-to-End Tests
- [ ] File modification workflow (writer + write skill)
- [ ] Code analysis workflow (reader + read skill)
- [ ] Research workflow (base-research + research skill)

#### Performance Tests
- [ ] Token usage measurement
- [ ] Response time benchmarking
- [ ] Stress testing (10+ skills)
- [ ] Memory usage monitoring

#### Acceptance Tests
- [ ] User-facing behavior validation
- [ ] Response quality comparison
- [ ] Real-world scenario testing

---

## Rollback Plan

### Phase 1 Rollback (defer_loading)

#### When to Rollback
- Critical bugs affecting skill loading
- Token usage not reducing as expected
- User-facing errors or degraded quality
- Performance regression >10%

#### Rollback Steps
1. **Disable Feature Flag**
   ```bash
   # In .claude/feature-flags.json or environment
   export DEFER_LOADING_ENABLED=false
   ```

2. **Verify Fallback**
   - Test that hooks load full skill content
   - Confirm subagents work without defer_loading
   - Check that no errors appear

3. **Revert Agent Prompts (if needed)**
   - If agents broken without defer_loading, revert to previous version
   - Use git to restore: `git checkout HEAD~1 .claude/agents/`

4. **Monitor**
   - Check error logs: `tail -f .maestro-errors.log`
   - Verify token usage returns to baseline
   - Confirm user requests working

5. **Investigate**
   - Review logs to identify root cause
   - Document issue in `docs/defer-loading-issues.md`
   - Fix and re-test before re-enabling

#### Expected Impact of Rollback
- Token usage returns to baseline (pre-Phase 1)
- All functionality should work as before
- No data loss or corruption
- Users may notice slightly slower responses (due to larger context)

### Phase 2 Rollback (Haiku)

#### When to Rollback
- Haiku accuracy drops below 90%
- High false positive/negative rate
- Quality degradation in skill suggestions
- Haiku API issues or instability

#### Rollback Steps
1. **Disable Haiku Flag**
   ```bash
   export HAIKU_DISCOVERY_ENABLED=false
   ```

2. **Verify Sonnet Fallback**
   - Test that Sonnet handles all skill discovery
   - Confirm accuracy back to 100%
   - Check that performance acceptable

3. **Monitor Costs**
   - Cost should return to Phase 1 levels (still better than baseline)
   - defer_loading still active, providing 40-60% savings

4. **Investigate Haiku Issues**
   - Review accuracy validation results
   - Check Haiku API status/updates
   - Test edge cases individually

#### Expected Impact of Rollback
- Costs increase from Phase 2 to Phase 1 levels (still 40-60% better than baseline)
- Accuracy returns to 100% (Sonnet)
- defer_loading benefits retained

---

## Dependencies & Prerequisites

### Required Before Starting
- [ ] Node.js installed (for hook scripts)
- [ ] npm package `minimatch` installed (`npm install`)
- [ ] Git repository initialized
- [ ] Baseline Maestro system functional
- [ ] Access to Claude API (Sonnet + Haiku for Phase 2)

### Required Knowledge
- Understanding of Maestro's skill system (read MAESTRO_BLUEPRINT.md)
- Familiarity with Claude Code hooks
- Basic JavaScript for hook modifications
- Markdown for agent/skill updates

### Tools Needed
- Code editor
- Command line access
- Git for version control
- Test environment for validation

---

## Estimated Time Investment

### Phase 1 (Weeks 1-8)
- **Week 1**: 12 hours (Analysis & Design)
- **Week 2**: 14 hours (Prototype & Validation)
- **Week 3-4**: 22 hours (Core Implementation)
- **Week 5-6**: 16 hours (Hook Integration)
- **Week 7-8**: 20 hours (Testing & Documentation)
- **Total Phase 1**: ~84 hours (~10.5 days)

### Phase 2 (Weeks 9-12)
- **Week 9-10**: 18 hours (Dual Model Implementation)
- **Week 11-12**: 10 hours (Validation & Launch)
- **Total Phase 2**: ~28 hours (~3.5 days)

### Grand Total
- **Total Implementation Time**: ~112 hours (~14 days of focused work)
- **Expected Cost Savings**: $200-300/month (payback in <1 month if heavily used)
- **Token Reduction**: 93% on skill discovery operations

---

## Questions & Support

### Common Questions

**Q: Can I skip Phase 1 and go straight to Haiku?**
A: No. Haiku optimization depends on defer_loading foundation. Phase 1 must be complete and stable first.

**Q: What if defer_loading doesn't reduce tokens by 40%?**
A: Review skill structure - they may already be small. Optimization is most valuable for skills with large resources/ directories.

**Q: Can I enable defer_loading for some skills but not others?**
A: Yes. Use the `deferResources` field in skill-rules.json to control per-skill.

**Q: What if Haiku accuracy is below 95%?**
A: Phase 2 includes fallback to Sonnet. If Haiku consistently underperforms, stay in Phase 1 (still 40-60% savings).

### Getting Help

- Review documentation in `docs/` directory
- Check work log for context: `cat .maestro-work-log.txt`
- Review test results in `docs/*-test-results.md` files
- Consult MAESTRO_BLUEPRINT.md for architecture questions

---

## Progress Tracking

Update this section weekly:

### Week 1 Status
- [ ] Week 1 complete
- **Tasks Completed**: 0/5
- **Blockers**: None yet
- **Notes**:

### Week 2 Status
- [ ] Week 2 complete
- **Tasks Completed**: 0/6
- **Blockers**:
- **Notes**:

### Week 3-4 Status
- [ ] Week 3-4 complete
- **Tasks Completed**: 0/10
- **Blockers**:
- **Notes**:

### Week 5-6 Status
- [ ] Week 5-6 complete
- **Tasks Completed**: 0/8
- **Blockers**:
- **Notes**:

### Week 7-8 Status
- [ ] Week 7-8 complete
- **Tasks Completed**: 0/10
- **Blockers**:
- **Notes**:

### Week 9-10 Status
- [ ] Week 9-10 complete
- **Tasks Completed**: 0/8
- **Blockers**:
- **Notes**:

### Week 11-12 Status
- [ ] Week 11-12 complete
- **Tasks Completed**: 0/5
- **Blockers**:
- **Notes**:

---

## Final Notes

This implementation plan is designed to be:
- **Incremental**: Each task builds on previous work
- **Measurable**: Clear success criteria and metrics
- **Flexible**: Can pause between phases if needed
- **Safe**: Rollback plans and feature flags throughout
- **Trackable**: Checkboxes and work log integration

Remember:
- Complete tasks in order (dependencies matter)
- Document evidence for each task
- Update work log regularly
- Test thoroughly before moving to next phase
- Don't skip testing tasks (they prevent costly mistakes)

Good luck with implementation! 🚀
