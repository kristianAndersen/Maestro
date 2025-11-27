# Delegation and Evaluation Anti-Patterns

This document catalogs common mistakes in delegation and evaluation, their symptoms, why they're problematic, and how to correct them.

## Category 1: Delegation Failures

### Anti-Pattern 1.1: Direct Execution (Conductor Does the Work)

**What it looks like:**
```markdown
User: "Analyze these files for security issues"

# BAD - Maestro doing the work directly
Let me read file1.py...
[reads file directly]
I found these issues...
[performs analysis directly]
```

**Why it's wrong:**
- Maestro should conduct, not perform
- Violates delegation-first principle
- Pollutes conductor context
- Misses skill activation opportunities
- No quality gate evaluation

**Correct approach:**
```markdown
User: "Analyze these files for security issues"

# GOOD - Maestro delegates
@base-analysis

**PRODUCT:** Security analysis of specified files

**PROCESS:**
1. Activate base-analysis skill for security frameworks
2. Read file1.py, file2.py, file3.py
3. Check against OWASP Top 10
4. Document findings with evidence

**PERFORMANCE:**
- File:line references for all findings
- Severity ratings
- Actionable remediation steps

↓

@4d-evaluation: Evaluate the analysis output
```

**Symptoms:**
- Maestro using Read, Grep, Glob directly
- Long conductor context
- No agent delegation happening
- No evaluation checkpoints

**Fix:**
1. Identify the operation type
2. Select appropriate specialized agent
3. Craft 3P delegation
4. Delegate and evaluate

### Anti-Pattern 1.2: Over-Delegation (Trivial Task Delegation)

**What it looks like:**
```markdown
User: "Show me the README"

# BAD - Over-engineering simple task
@open

**PRODUCT:** Display the contents of README.md

**PROCESS:**
1. Locate README.md in repository root
2. Read the file contents
3. Return formatted output

**PERFORMANCE:**
- Complete file contents
- Proper formatting
- No errors

↓

@4d-evaluation: Evaluate the file reading operation
```

**Why it's wrong:**
- Adds unnecessary complexity
- Evaluation overhead for trivial task
- Slower than direct execution
- Wastes context window

**Correct approach:**
```markdown
User: "Show me the README"

# GOOD - Handle simple task directly if truly trivial
[Read README.md directly and display]
```

**Rule of thumb:**
- Simple display/list operations: handle directly
- Any analysis, modification, or multi-file operation: delegate

**Symptoms:**
- Delegating file listings
- Delegating single file reads with no analysis
- Evaluation of trivial operations
- Unnecessary agent spawns

**Fix:**
1. Assess task complexity
2. If truly trivial (no thinking required): handle directly
3. If any analysis/modification needed: delegate

### Anti-Pattern 1.3: Wrong Agent Selection

**What it looks like:**
```markdown
# BAD - Using list agent for analysis
@list

**PRODUCT:** Analyze src/auth/login.py for security vulnerabilities

# BAD - Using file-writer for research
@file-writer

**PRODUCT:** Find all authentication files in the codebase

# BAD - Using fetch for local files
@fetch

**PRODUCT:** Get the contents of local config file
```

**Why it's wrong:**
- Agents lack capabilities for the task
- Will fail or produce poor results
- Wastes iteration cycles
- Confuses agent's purpose

**Correct approach:**
```markdown
# GOOD - Use base-analysis for analysis
@base-analysis

**PRODUCT:** Analyze src/auth/login.py for security vulnerabilities

# GOOD - Use base-research for finding files
@base-research

**PRODUCT:** Find all authentication files in the codebase

# GOOD - Use open or file-reader for local files
@file-reader

**PRODUCT:** Read and understand local config file
```

**Agent capability quick reference:**
- **list**: Directory listings only
- **open**: Single file display
- **file-reader**: Deep code comprehension
- **file-writer**: File creation/modification
- **base-research**: Finding/searching
- **base-analysis**: Evaluation/assessment
- **fetch**: External data retrieval
- **4d-evaluation**: Quality gate evaluation

**Symptoms:**
- Agent confusion about task
- Poor results requiring immediate refinement
- Agent stating it can't perform task
- Multiple failed iterations

**Fix:**
1. Review agent capability reference
2. Match task type to agent domain
3. Re-delegate to correct agent

### Anti-Pattern 1.4: Vague Delegation (Missing 3P Structure)

**What it looks like:**
```markdown
# BAD - No structure
@base-analysis

Please analyze the authentication code and tell me if there are any issues.

# BAD - Missing PROCESS
@file-writer

**PRODUCT:** Fix the login bug

**PERFORMANCE:** Make it work

# BAD - Missing PERFORMANCE
@base-research

**PRODUCT:** Find auth files

**PROCESS:** Search for auth patterns
```

**Why it's wrong:**
- Ambiguous expectations
- Agent doesn't know how to proceed
- Missing quality criteria
- Higher refinement likelihood

**Correct approach:**
```markdown
# GOOD - Complete 3P structure
@base-analysis

**PRODUCT:** Security analysis of authentication module

**Files to analyze:**
- src/auth/login.py
- src/auth/session.py
- src/auth/validators.py

**Deliverable:** Security assessment report

**PROCESS:**
1. Activate base-analysis skill for security frameworks
2. Read each authentication file
3. Check against OWASP Top 10 vulnerabilities
4. Search for: hardcoded secrets, weak validation, injection risks
5. Document each finding with evidence

**Skills to use:**
- base-analysis (security evaluation)
- read (code comprehension)

**PERFORMANCE:**
- Every finding includes file:line reference
- Severity rated: CRITICAL, HIGH, MEDIUM, LOW
- Actionable remediation steps provided
- No false positives
- Return structured report: Summary, Critical, High, Medium, Low sections
- Evidence: actual code snippets demonstrating issues
```

**3P Checklist:**
- [ ] PRODUCT: Clear objective, specific targets, expected deliverables
- [ ] PROCESS: Ordered steps, skills to use, constraints
- [ ] PERFORMANCE: Evidence requirements, format, excellence criteria

**Symptoms:**
- Agent asks clarifying questions
- Output doesn't match expectations
- Frequent refinement needed
- Inconsistent results

**Fix:**
1. Always use 3P structure
2. Make objectives specific
3. Provide step-by-step process
4. Define excellence criteria clearly

## Category 2: Evaluation Failures

### Anti-Pattern 2.1: Skipping Evaluation

**What it looks like:**
```markdown
# BAD - No evaluation
@base-analysis

**PRODUCT:** Analyze code quality

[Receives output]
[Accepts without evaluation]
[Delivers to user]
```

**Why it's wrong:**
- No quality control
- May deliver incorrect/incomplete work
- Violates Maestro core principle
- No refinement opportunity
- Trust without verification

**Correct approach:**
```markdown
# GOOD - Always evaluate
@base-analysis

**PRODUCT:** Analyze code quality

[Receives output]

↓

@4d-evaluation

**PRODUCT:** Evaluate the code quality analysis

**PROCESS:**
1. Activate 4d-evaluation skill
2. Check delegation appropriateness
3. Verify completeness
4. Apply product discernment (correct, elegant, complete)
5. Apply process discernment (sound reasoning)
6. Apply performance discernment (excellence standards)

**PERFORMANCE:**
- Return verdict: EXCELLENT or NEEDS REFINEMENT
- If refinement needed, provide specific coaching
- Evidence-based evaluation

↓

If EXCELLENT → Accept and deliver
If NEEDS REFINEMENT → Coach and re-delegate
```

**Rule:** Every subagent output must pass through 4d-evaluation before acceptance.

**Exceptions:** None. Even simple tasks should be evaluated if delegated.

**Symptoms:**
- Accepting work immediately
- No @4d-evaluation calls
- Poor quality deliverables
- User complaints about results

**Fix:**
1. After every delegation, evaluate
2. Use 4d-evaluation agent
3. Accept only EXCELLENT outputs
4. Refine NEEDS REFINEMENT outputs

### Anti-Pattern 2.2: Accepting "Good Enough"

**What it looks like:**
```markdown
@4d-evaluation returns: NEEDS REFINEMENT

Issues:
- Missing file references
- No severity ratings
- Vague recommendations

# BAD - Accepting despite issues
"This is good enough, let's deliver it"

# BAD - Making excuses
"The agent tried their best, we'll deliver as-is"

# BAD - User pressure
"The user wants it fast, so we'll skip refinement"
```

**Why it's wrong:**
- Violates excellence standard
- Trains agents poorly
- Degrades overall quality
- Maestro's job is excellence, not speed

**Correct approach:**
```markdown
@4d-evaluation returns: NEEDS REFINEMENT

Issues:
- Missing file references
- No severity ratings
- Vague recommendations

# GOOD - Iterate until excellent
@base-analysis (REFINEMENT)

**PRODUCT:** Security analysis (revised)

**Coaching from evaluation:**
You provided good findings, but missing critical details:

1. Add file:line references for EVERY finding
2. Rate each finding: CRITICAL, HIGH, MEDIUM, LOW
3. Provide specific remediation steps (not "fix this")

Example of what I need:
```
CRITICAL: SQL Injection vulnerability
Location: src/auth/login.py:45
Code: cursor.execute(f"SELECT * FROM users WHERE username='{username}'")
Remediation: Use parameterized query: cursor.execute("SELECT * FROM users WHERE username=?", (username,))
```

Please revise with this level of detail for all findings.

↓

@4d-evaluation (again)

↓

Iterate until EXCELLENT
```

**Rule:** Never deliver NEEDS REFINEMENT work. Iterate until EXCELLENT.

**Symptoms:**
- Justifying incomplete work
- Speed prioritized over quality
- Incremental degradation of standards
- User dissatisfaction

**Fix:**
1. Reject NEEDS REFINEMENT outputs
2. Provide specific coaching
3. Re-delegate with corrections
4. Iterate until EXCELLENT
5. If stuck after 5 iterations, escalate to user

### Anti-Pattern 2.3: Vague Coaching (Unhelpful Refinement Feedback)

**What it looks like:**
```markdown
@4d-evaluation returns: NEEDS REFINEMENT

# BAD - Vague feedback
"The output needs improvement. Try again."

# BAD - No specific issues
"This doesn't meet standards. Please revise."

# BAD - No examples
"Add more details and improve quality."
```

**Why it's wrong:**
- Agent doesn't know what to fix
- Likely to repeat same mistakes
- Wastes iteration cycles
- Frustrates agents and users

**Correct approach:**
```markdown
@4d-evaluation returns: NEEDS REFINEMENT

# GOOD - Specific, actionable coaching
@base-analysis (REFINEMENT)

**PRODUCT:** Security analysis (revised)

**Specific issues from evaluation:**

1. **Product Discernment Issues:**
   - Missing analysis of session.py (you only covered login.py)
   - No severity ratings provided for any finding

2. **Process Discernment Issues:**
   - OWASP Top 10 framework not applied (you were supposed to check each category)
   - No evidence provided (claims need code snippets)

3. **Performance Discernment Issues:**
   - Missing file:line references (requirement was file:line for EVERY finding)
   - Recommendations too vague (example: "fix validation" - need specific steps)

**What to fix:**

1. Add complete analysis of session.py (you missed this file)
2. Apply OWASP Top 10: check each category explicitly
3. Rate every finding: CRITICAL, HIGH, MEDIUM, LOW
4. Add file:line reference format: `src/auth/login.py:45`
5. Show actual code snippets proving the issue
6. Make recommendations specific:

**Bad recommendation:** "Fix the validation"
**Good recommendation:** "Add email format validation using regex: re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email)"

Please revise addressing ALL six points above.
```

**Coaching checklist:**
- [ ] Specific issues identified (not vague)
- [ ] Categorized by discernment type (Product/Process/Performance)
- [ ] Examples of what's wrong
- [ ] Examples of what's right
- [ ] Actionable steps to fix
- [ ] Clear acceptance criteria

**Symptoms:**
- Multiple iterations with same issues
- Agent seems confused
- No improvement between iterations
- Refinement loops not converging

**Fix:**
1. Be specific about what's wrong
2. Provide examples of good vs bad
3. Give actionable fix steps
4. Reference discernment categories
5. Show desired outcome format

## Summary

**Delegation Anti-Patterns:**
1. Direct Execution - Maestro doing work instead of delegating
2. Over-Delegation - Delegating trivial tasks unnecessarily
3. Wrong Agent Selection - Using wrong specialist for task
4. Vague Delegation - Missing clear 3P structure

**Evaluation Anti-Patterns:**
1. Skipping Evaluation - No quality gate checkpoint
2. Accepting "Good Enough" - Delivering NEEDS REFINEMENT work
3. Vague Coaching - Unhelpful refinement feedback

**Key Principles:**
- Maestro delegates, doesn't execute
- Use 3P format for all delegations
- Always evaluate before accepting
- Never deliver "good enough" - iterate to excellent
- Provide specific, actionable coaching
- Choose correct agent for each task
