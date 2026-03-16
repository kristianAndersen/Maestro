---
name: hallucination-detection
description: Systematic framework for detecting hallucinations in AI-generated code, configurations, and technical outputs. Activate this skill whenever you are reviewing AI-generated code, running 4D-Evaluation on subagent work, verifying API calls or library usage, checking configurations for correctness, or any time you sense that generated code is "too convenient" or uses methods/features you can't immediately verify exist. This skill is essential not just for the 4D-Evaluation agent but for any agent performing code review, analysis, or quality assessment. Do not skip it just because the code looks reasonable — hallucinations often look correct at a glance.
---

# Hallucination Detection Skill

## Purpose

Hallucinations in AI-generated code are silent killers. They look syntactically correct, follow naming conventions, and fit seamlessly into surrounding code — but they invoke methods that don't exist, pass parameters in the wrong order, use configuration keys that were never implemented, or reference schemas that differ from reality. This skill gives you a systematic process for catching them before they become runtime errors, security vulnerabilities, or correctness bugs.

**This skill applies to any context where AI-generated output is being evaluated** — not just 4D-Evaluation. If you're reviewing code, checking a config, verifying an API integration, or assessing a subagent's work, activate this skill.

---

## Hallucination Taxonomy

Understanding the categories helps you know where to look. Hallucinations cluster into 10 types:

### 1. Method/Function Existence
The most common type. A function is called that doesn't exist in the library, module, or class.
- `user.findByEmail()` when the ORM only has `User.find({ email })`
- `axios.postJSON()` — invented convenience wrapper
- `crypto.hashPassword()` — not part of Node's crypto module

### 2. Parameter Signature
The function exists but the arguments are wrong — wrong count, wrong order, or wrong types.
- `jwt.sign(secret, payload)` instead of `jwt.sign(payload, secret)`
- `fs.readFile(path)` missing the required encoding/callback
- `Array.from(obj, length)` — second arg is a map function, not a length

### 3. Return Shape
The function exists and is called correctly, but the code assumes a return value that doesn't match reality.
- Destructuring `{ user, token }` from a call that returns `{ data: { user }, accessToken }`
- Treating a paginated response as a flat array

### 4. Configuration Option
A config key or flag is used that doesn't exist in the tool's documented schema.
- `eslint: { enableAutoFix: true }` — that's a CLI flag, not a config key
- `webpack: { output: { generateIndexHTML: true } }` — invented option
- `tsconfig: { paths: { strict: true } }` — `strict` doesn't go inside `paths`

### 5. Import / Module Path
The import statement references a path or package that doesn't exist or has moved.
- `import { debounce } from 'lodash/utils'` — actual path is `'lodash'` or `'lodash/debounce'`
- `from '../utils/auth'` when the file is at `../lib/auth`
- A package that exists in the docs but isn't installed (not in `package.json`/`requirements.txt`)

### 6. Type / Interface Shape (TypeScript)
Generated TypeScript uses types or interfaces that don't match the actual definitions.
- Adding `.userId` to a type that only has `.id`
- Using a union type as if it were always one branch
- Referencing a generic parameter incorrectly

### 7. Database Schema
The code references tables, columns, or relationships that differ from the actual schema.
- Querying `users.username` when the column is `users.user_name`
- A JOIN on a foreign key that doesn't exist
- Using an ORM relation that wasn't defined in the schema

### 8. CLI Arguments / Commands
Shell commands or CLI invocations use flags or subcommands that don't exist.
- `git commit --no-hooks` — the real flag is `--no-verify`
- `docker run --detach-all` — invented flag
- `npm run build --watch=true` — wrong flag format for npm scripts

### 9. Environment Variables / Secrets
Code references env vars using names that differ from what's actually configured.
- `process.env.API_SECRET_KEY` when the codebase uses `process.env.SECRET_KEY`
- Assuming an env var exists that is never set in any `.env.example`

### 10. Framework Convention
Code misapplies framework-specific patterns — wrong file locations, wrong lifecycle hooks, wrong export shapes.
- Using `getServerSideProps` in a Next.js App Router project (which uses `async` server components)
- A React hook called outside a component or inside a conditional
- Django URL patterns using the wrong syntax for the installed version

### 11. LLM / AI API
A fast-growing category. Calls to AI APIs use model IDs, parameter names, or endpoint patterns that don't exist.
- Using `gpt-4-turbo-preview` when that alias has been retired
- `anthropic.messages.create({ max_tokens_to_sample: 1000 })` — that param is Claude 2 syntax
- Inventing streaming response shapes that differ from the actual SDK

---

## Verification Methodology

Knowing the categories isn't enough. Here is the **systematic process** for catching hallucinations:

### Step 1: Read Before You Judge
Before flagging anything, search for evidence. "I don't recognize this" is not evidence of hallucination. Unfamiliar code is not automatically hallucinated code — it might be a project-internal utility, a dependency you haven't seen, or a legitimate abstraction.

### Step 2: The Three-Source Rule
For any suspicious element, check these three sources in order:

1. **The project itself** — Search the codebase (`grep`, `Glob`, `Read`) for existing usages of the same function/method. If others use it the same way, it likely exists.
2. **The dependency manifest** — Check `package.json`, `requirements.txt`, `Cargo.toml`, etc. Is the library actually installed? What version?
3. **Official documentation** — Cross-reference the specific version being used. Version-specific APIs differ significantly.

Only after exhausting these sources can you confirm a hallucination with confidence.

### Step 3: Distinguish Confirmed vs Suspected vs Unverifiable

| Status | Meaning | What to do |
|---|---|---|
| **CONFIRMED** | Actively searched, found no evidence of existence | Flag as hallucination with evidence |
| **SUSPECTED** | Found similar but with different signature | Flag with specific discrepancy |
| **UNVERIFIABLE** | No access to source/docs to check | Flag as unverifiable, not hallucination |
| **VERIFIED** | Found matching evidence in project/docs | Clear, note the source |

Never report SUSPECTED as CONFIRMED. Be precise.

### Step 4: Check Version Alignment
Once you know the library version (from manifest), ensure the API being used matches that version. Many hallucinations are real APIs from the wrong version — either newer (not yet available) or older (deprecated/removed).

### Step 5: Apply the False Positive Guard
Before finalizing a hallucination flag, ask:
- Could this be an internal project utility not yet read?
- Could this be a monkey-patched or extended method?
- Could this be a wrapper around a real API?
- Could the naming convention be intentional and documented elsewhere?

If any answer is plausibly yes — read more before flagging.

---

## Severity Framework

Not all hallucinations are equal. Classify each finding:

### CRITICAL
Will cause runtime failure, security vulnerability, or data corruption. Must block approval.
- Nonexistent method called in production path
- Wrong parameter order in security-sensitive code (auth, crypto, permissions)
- Incorrect schema reference that corrupts data
- Fictional security function (e.g., invented sanitization that doesn't run)

### HIGH
Will cause incorrect behavior or logic bugs, may not crash immediately.
- Wrong return shape assumed (silent wrong data flowing through)
- Missing required parameter silently ignored by the runtime
- Incorrect ORM query returning wrong dataset

### MEDIUM
Code smell or inconsistency that degrades maintainability or reliability.
- Deprecated API used but still functional
- Inconsistent naming convention that diverges from codebase
- Wrong import path that works due to re-exports but is brittle

### LOW
Minor deviation unlikely to cause issues but worth noting.
- Naming style inconsistency
- Optional parameter passed incorrectly but defaulting to desired behavior

---

## Evidence Standards

A hallucination claim must include:
1. **The specific element** — exact function name, parameter, or key being flagged
2. **What was searched** — what sources were checked (project files, docs, package version)
3. **What was found** — either nothing, or something different with the specific discrepancy
4. **Severity** — CRITICAL / HIGH / MEDIUM / LOW with reasoning

Example of a well-evidenced finding:
> `user.findByEmail(email)` — CONFIRMED HALLUCINATION (CRITICAL)
> Searched codebase: `grep -r "findByEmail" .` returns 0 results.
> Checked `package.json`: Prisma 5.x is installed.
> Checked Prisma 5 docs: `findByEmail` does not exist. Correct method is `prisma.user.findUnique({ where: { email } })`.

---

## Output Report Format

Use this structure when reporting hallucination findings:

```
## Hallucination Detection Report

### CONFIRMED Hallucinations
- [SEVERITY] `element` — description, evidence, correct alternative

### SUSPECTED Issues
- [SEVERITY] `element` — what was found vs what was expected, needs verification

### UNVERIFIABLE Claims
- `element` — cannot verify without access to [source]. Recommend manual check.

### VERIFIED (Spot-checked Clean)
- `element` — verified via [source]

### Verdict
PASS / FAIL / NEEDS-VERIFICATION
```

---

## Meta-Hallucination Warning

You — the evaluator — can also hallucinate. Watch for:
- Flagging a real API as nonexistent because you don't recognize it
- Citing incorrect documentation from memory without actually searching
- Asserting a "correct" signature that is itself wrong

If you find yourself writing "the correct syntax is X" from memory rather than from a searched source, verify your own claim before including it in the report.

---

## Anti-Patterns to Watch For

- **"It Should Exist"** — logic-plausible but unverified methods
- **"Convenient Helpers"** — perfectly-suited utility functions with no definition anywhere
- **"API Magic"** — assuming a perfect response shape without checking docs
- **"Version Blindness"** — using latest syntax in a project locked to an older version
- **"Familiar-Sounding Names"** — pluralization tricks (`getUsers` vs `getUser`), camelCase variants, chaining that doesn't exist

---

## Integration with 4-D Evaluation

### Product Discernment
- A single CRITICAL hallucination means the product is incorrect — verdict must be NEEDS REFINEMENT
- MEDIUM/LOW hallucinations should be noted but weighed against overall quality

### Process Discernment
- Did the subagent verify its API usage against sources? Or just assert?
- A good process leaves evidence of verification (grep outputs, doc references)
- Absence of verification evidence is itself a process gap

---

## Assets (Progressive Disclosure)

Load these when you need deeper domain-specific guidance:

- `assets/hallucination-patterns.md` — Domain-specific detection protocols for 11 categories (API/Library, Config, Database, Security, LLM/AI APIs, TypeScript, imports, CLI, env vars, framework conventions)
- `assets/verification-protocols.md` — Step-by-step "how to actually verify" guides, source lookup strategies, and decision trees for ambiguous cases
