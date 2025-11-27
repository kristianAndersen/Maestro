# Quality Standards and Communication Anti-Patterns

This document catalogs common mistakes in quality standards and communication, their symptoms, why they're problematic, and how to correct them.

## Category 5: Quality Standard Failures

### Anti-Pattern 5.1: No Evidence Requirements

**What it looks like:**
```markdown
# BAD - No evidence required
@base-analysis

**PRODUCT:** Security analysis

**PERFORMANCE:**
- Identify vulnerabilities
- Provide recommendations

[Agent returns:]
"There are SQL injection risks and weak validation"
[No file references, no code snippets, no proof]
```

**Why it's wrong:**
- Can't verify claims
- May be hallucinations
- Not actionable
- Can't reproduce findings

**Correct approach:**
```markdown
# GOOD - Evidence required
@base-analysis

**PRODUCT:** Security analysis

**PERFORMANCE:**
- Every finding MUST include:
  - File path and line number (e.g., src/auth/login.py:45)
  - Code snippet showing the issue
  - Severity rating: CRITICAL, HIGH, MEDIUM, LOW
  - Specific fix with code example

**Example of required format:**
```
CRITICAL: SQL Injection Vulnerability
Location: src/auth/login.py:45
Code:
  cursor.execute(f"SELECT * FROM users WHERE username='{username}'")
Issue: Direct string interpolation allows SQL injection
Fix:
  cursor.execute("SELECT * FROM users WHERE username=?", (username,))
```

No vague claims accepted.

[Agent returns with concrete evidence]
```

**Evidence checklist:**
- [ ] File path and line number for every claim
- [ ] Code snippets proving the issue
- [ ] Concrete examples, not descriptions
- [ ] Reproducible findings
- [ ] Actionable fixes with code

**Symptoms:**
- Vague findings
- Unverifiable claims
- Can't locate issues
- Potential hallucinations

**Fix:**
1. Require file:line references
2. Require code snippets
3. Require concrete examples
4. Reject vague claims in evaluation

### Anti-Pattern 5.2: Accepting Incomplete Work

**What it looks like:**
```markdown
@4d-evaluation returns:

Product Discernment: Mostly good, but missing analysis of validators.py

# BAD - Accepting incomplete work
"It's 90% complete, good enough"

# BAD - Making excuses
"The validators.py analysis isn't critical"

# BAD - User pressure
"User is waiting, ship it now"
```

**Why it's wrong:**
- Violates completeness requirement
- Sets bad precedent
- May cause issues later
- Not meeting stated objectives

**Correct approach:**
```markdown
@4d-evaluation returns:

Product Discernment: Missing analysis of validators.py

# GOOD - Require completeness
@base-analysis (REFINEMENT)

**PRODUCT:** Security analysis (revised)

**Coaching:**
Your analysis of login.py and session.py is excellent, but you missed validators.py entirely.

The PRODUCT requirement was: "Analyze ALL authentication files"
Files specified:
- login.py ✓ (you covered this)
- session.py ✓ (you covered this)
- validators.py ✗ (MISSING)

Please add complete analysis of validators.py to your report.
```

**Rule:** Complete means complete. All requirements must be met.

**Symptoms:**
- Partial deliverables
- Missing components
- "Almost done" syndrome
- Requirements not fully met

**Fix:**
1. Check all requirements met
2. Reject if anything missing
3. Specify exactly what's incomplete
4. Iterate until 100% complete

### Anti-Pattern 5.3: Framework Bias

**What it looks like:**
```markdown
User: "Recommend authentication approach"

# BAD - Biased recommendation
@base-research

[Returns:]
"Use Auth0 for authentication. It's the best."
[No consideration of alternatives]
[No evaluation criteria]
[Assumes cloud solution]
```

**Why it's wrong:**
- Maestro should be framework-agnostic
- Doesn't consider context
- May not match user needs
- Appears to push specific solutions

**Correct approach:**
```markdown
User: "Recommend authentication approach"

# GOOD - Framework-agnostic analysis
@base-research

**PRODUCT:** Research authentication approaches for this project

**PROCESS:**
1. Understand current project context
2. Research multiple approaches: OAuth, JWT, sessions, SSO, etc.
3. Evaluate each against criteria:
   - Complexity
   - Scalability
   - Cost
   - Maintenance
   - Security
   - Team expertise
4. Present options objectively

**PERFORMANCE:**
- Multiple options presented
- Objective pros/cons for each
- Context-aware recommendations
- No bias toward specific frameworks

[Returns balanced analysis of options]
```

**Rule:** Present options objectively. Let user decide based on their context.

**Symptoms:**
- Single recommendation without alternatives
- Strong preference statements
- Lack of context consideration
- "Best practice" claims without justification

**Fix:**
1. Research multiple approaches
2. Evaluate objectively
3. Present pros/cons for each
4. Recommend based on user's specific context
5. Avoid absolutes like "best" or "always use"

## Category 6: Communication Failures

### Anti-Pattern 6.1: No Progress Updates

**What it looks like:**
```markdown
User: "Analyze all 50 files in the project"

[Long silence]
[30 minutes pass]
[User has no idea what's happening]
```

**Why it's wrong:**
- Poor user experience
- User doesn't know if working
- Can't estimate completion
- Appears stuck or broken

**Correct approach:**
```markdown
User: "Analyze all 50 files in the project"

# GOOD - Progress updates
"I'll analyze all 50 files. This is a large task, so I'll break it into phases:

Phase 1: Research (identifying file types and categories)
Phase 2: Analysis (evaluating each category)
Phase 3: Synthesis (combining findings)

Starting Phase 1..."

[After Phase 1]
"Phase 1 complete. Found:
- 20 Python files
- 15 JavaScript files
- 10 configuration files
- 5 documentation files

Starting Phase 2: Analysis..."

[After Phase 2]
"Phase 2 complete. Key findings:
- Security issues: 8
- Performance issues: 12
- Code quality issues: 15

Starting Phase 3: Synthesis..."

[Final]
"Analysis complete. Delivering comprehensive report..."
```

**Rule:** For long-running tasks, provide periodic updates.

**Symptoms:**
- Long periods of silence
- User asking "are you still working?"
- Uncertainty about progress
- User terminating tasks prematurely

**Fix:**
1. Break large tasks into phases
2. Announce each phase
3. Provide progress checkpoints
4. Summarize before final delivery

### Anti-Pattern 6.2: Hiding Failures

**What it looks like:**
```markdown
@agent fails or produces poor results

# BAD - Hiding the issue
[Tries multiple times silently]
[Eventually gives up]
"I couldn't complete this task"
[No explanation of what was tried or why it failed]
```

**Why it's wrong:**
- User doesn't understand the problem
- Can't help resolve blockers
- Wastes time on impossible tasks
- Poor transparency

**Correct approach:**
```markdown
@agent fails or produces poor results

# GOOD - Transparent communication
"I've attempted to analyze the authentication code, but encountering challenges:

**Attempts made:**
1. First attempt: Missing file references (refined)
2. Second attempt: Incomplete coverage (refined)
3. Third attempt: Same issues persisting

**Root cause:**
The agent seems unable to provide file:line references consistently, despite specific coaching.

**Options:**
1. Try different agent (base-research to locate, then file-reader to analyze)
2. Simplify task (analyze one file at a time)
3. Manual intervention needed (you review the files)

How would you like me to proceed?"
```

**Rule:** Be transparent about challenges. Give user options.

**Symptoms:**
- Mysterious failures
- Long delays without explanation
- Vague "couldn't complete" messages
- User confusion about what happened

**Fix:**
1. Explain what was attempted
2. Identify root cause
3. Present options for proceeding
4. Let user decide

### Anti-Pattern 6.3: Technical Jargon Overload

**What it looks like:**
```markdown
# BAD - Jargon-heavy communication
"I'll orchestrate a fanout parallelization pattern with barrier synchronization, followed by a gather-reduce synthesis operation utilizing the 4-D discernment framework for quality gate checkpointing."
```

**Why it's wrong:**
- User may not understand
- Sounds overly complex
- Reduces clarity
- Intimidating

**Correct approach:**
```markdown
# GOOD - Clear communication
"I'll analyze security and performance in parallel (faster), then combine the findings into one report. Each analysis will be quality-checked before combining."
```

**Rule:** Communicate clearly. Explain complex concepts simply.

**Symptoms:**
- User confusion
- Requests for clarification
- "What does that mean?" questions
- Reduced user confidence

**Fix:**
1. Use plain language
2. Explain technical terms when necessary
3. Focus on what, not how (unless asked)
4. Prioritize clarity over precision

## Summary

**Quality Standard Anti-Patterns:**
1. No Evidence Requirements - Claims without proof
2. Accepting Incomplete Work - Delivering partial results
3. Framework Bias - Pushing specific solutions without objectivity

**Communication Anti-Patterns:**
1. No Progress Updates - Long silence on big tasks
2. Hiding Failures - Mysterious failures without explanation
3. Technical Jargon Overload - Incomprehensible explanations

**Key Principles:**
- Require concrete evidence (file:line, code snippets)
- Complete means 100% complete
- Stay framework-agnostic
- Provide progress updates on long tasks
- Be transparent about challenges
- Communicate clearly and simply

## Recognition Guide

**When you see:**
- Claims without file:line → Anti-Pattern 5.1
- "Missing X" accepted → Anti-Pattern 5.2
- "Use Framework Y, it's best" → Anti-Pattern 5.3
- Long silence on big task → Anti-Pattern 6.1
- Mystery failures → Anti-Pattern 6.2
- Incomprehensible explanation → Anti-Pattern 6.3

**Apply the fix for the identified anti-pattern.**
