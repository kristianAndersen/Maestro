# Verification Protocols

Step-by-step guides for actually verifying suspicious code elements. These protocols turn vague suspicion into concrete evidence.

---

## Protocol 1: Verify a Method or Function Exists

Use this when code calls a method and you need to confirm it's real.

**Step 1 — Search the project first**
```bash
grep -r "methodName" . --include="*.js" --include="*.ts" --include="*.py"
```
If found: check the callers to see if the signature matches what's being generated.

**Step 2 — Check the dependency manifest**
- Node.js: read `package.json` → `dependencies` and `devDependencies`
- Python: read `requirements.txt` or `pyproject.toml`
- Find the exact version number — this determines which API docs to consult

**Step 3 — Verify in official docs**
Use the version number from Step 2. Look for the method in:
- The library's official changelog for the installed version
- The library's API reference docs
- The library's source code on GitHub (tag to the installed version)

**Step 4 — Record your finding**
- Found matching usage in project → VERIFIED (cite file path and line)
- Found in docs for installed version → VERIFIED (cite doc URL or source)
- Not found anywhere → CONFIRMED HALLUCINATION (cite what was searched)
- Only found in different version → SUSPECTED VERSION MISMATCH

---

## Protocol 2: Verify a Parameter Signature

Use when a function exists but you suspect the arguments are wrong.

**Step 1 — Find real usage in the codebase**
```bash
grep -rn "functionName(" . --include="*.js" --include="*.ts"
```
Compare the argument pattern in the project with what was generated.

**Step 2 — Check the type definition**
For TypeScript projects: find the `.d.ts` file or the `@types/` package.
```bash
cat node_modules/@types/library/index.d.ts | grep -A 5 "functionName"
```
Or for Python:
```bash
python3 -c "import library; help(library.functionName)"
```

**Step 3 — Check common inversion patterns**
High-risk inversions:
- `jwt.sign(payload, secret)` vs `jwt.sign(secret, payload)`
- `bcrypt.compare(plain, hashed)` vs `bcrypt.compare(hashed, plain)`
- `path.join(base, relative)` — always positional, order matters
- `Object.assign(target, source)` — which side gets mutated?

**Step 4 — Document the correct signature**
When flagging: always include the CORRECT signature alongside the hallucinated one.

---

## Protocol 3: Verify a Configuration Option

Use when config files have been generated or modified.

**Step 1 — Find the tool's config schema**
Most tools publish their schema. Common locations:
- Search: `[tool name] config schema JSON` or `[tool name] configuration reference`
- Check the tool's `node_modules/tool-name/schema.json` or similar
- ESLint: `https://eslint.org/docs/latest/use/configure/`
- TypeScript: `https://www.typescriptlang.org/tsconfig`
- Webpack: check the version-specific docs at webpack.js.org

**Step 2 — Validate each key against the schema**
Go key by key through the generated config. Every key must appear in the schema.

**Step 3 — Check nesting**
Hallucinated configs often put options at wrong nesting levels.
- The option may be real but belong at a different depth
- Note: `output.filename` is different from `optimization.output.filename`

**Step 4 — Check the version**
```bash
cat package.json | grep '"tool-name"'
```
Configs for v1.x may be completely different from v2.x. Verify docs match the installed version.

---

## Protocol 4: Verify a Database Schema Reference

Use when ORM queries or SQL references tables/columns.

**Step 1 — Find the schema definition**
```bash
# Prisma
cat prisma/schema.prisma

# Django
grep -r "class.*Model" . --include="*.py"

# SQL migrations
ls -la migrations/ db/migrate/
```

**Step 2 — Check the exact column/table name**
Note: casing conventions differ.
- Prisma uses camelCase fields that map to snake_case columns
- Django uses snake_case
- TypeORM can vary by configuration

**Step 3 — Verify relation names**
```bash
grep -A 10 "model User" prisma/schema.prisma
```
Check that the relation field name (`user.posts`) exactly matches the schema definition.

**Step 4 — Verify ORM method exists for installed version**
```bash
cat package.json | grep prisma
# or
pip show sqlalchemy
```
Then check version-specific ORM docs for the method being called.

---

## Protocol 5: Verify LLM API Usage

Use when code integrates with an AI/LLM API.

**Step 1 — Identify the SDK and version**
```bash
cat package.json | grep -E "anthropic|openai|cohere|google-generative"
```

**Step 2 — Verify the model ID**
Model IDs expire and change. Cross-reference with current provider docs:
- Anthropic: check `docs.anthropic.com/en/docs/models-overview`
- OpenAI: check `platform.openai.com/docs/models`
- Do not rely on memory for model IDs — they change frequently

**Step 3 — Verify the request schema**
The SDK version determines the parameter names:
```bash
# Find the type definitions
cat node_modules/@anthropic-ai/sdk/dist/index.d.ts | grep -A 20 "MessageCreateParams"
cat node_modules/openai/dist/index.d.ts | grep -A 20 "ChatCompletionCreateParams"
```

**Step 4 — Verify the response shape**
```bash
grep -rn "response\." . --include="*.ts" | grep -E "choices|content|completion"
```
Compare how the rest of the codebase reads responses vs what was generated.

---

## Protocol 6: Verify Import Paths

Use when imports look suspicious.

**Step 1 — Check if the package exists**
```bash
cat package.json | grep '"package-name"'
ls node_modules/package-name/
```

**Step 2 — Verify the deep import path**
```bash
ls node_modules/lodash/
# Does 'fp.js' exist? Does it export 'debounce'?
```

**Step 3 — Check path aliases**
```bash
cat tsconfig.json | grep -A 10 '"paths"'
cat webpack.config.js | grep -A 10 "alias"
```

**Step 4 — Verify relative paths**
From the importing file's directory, manually trace the relative path:
- `../utils/auth` from `src/components/Login.tsx` → `src/utils/auth`
- Does `src/utils/auth.ts` (or `.js`, `/index.ts`) exist?

**Step 5 — Check named vs default exports**
```bash
grep -n "export" src/utils/auth.ts
```
- `export default` → use `import auth from './auth'`
- `export const auth` → use `import { auth } from './auth'`
- Both? Either works.

---

## Decision Tree: Flag or Pass?

```
Suspicious element found
├── Have I searched the project for usage?
│   └── No → Search first (grep/Glob/Read)
│
├── Found matching usage in project?
│   └── Yes, same signature → VERIFIED (cite file:line)
│
├── Found in official docs for installed version?
│   └── Yes → VERIFIED (cite source)
│
├── Found in docs but different version than installed?
│   └── → SUSPECTED VERSION MISMATCH (HIGH severity)
│
├── Found similar but different signature?
│   └── → SUSPECTED (HIGH severity) — specify the discrepancy
│
├── Not found anywhere after thorough search?
│   └── → CONFIRMED HALLUCINATION — specify severity
│
└── No access to docs/source to check?
    └── → UNVERIFIABLE — flag for manual review, do not confirm
```

---

## Severity Assignment Guide

After classification, assign severity:

| Scenario | Severity |
|---|---|
| Will crash at runtime | CRITICAL |
| Security/auth/crypto parameter wrong | CRITICAL |
| Silent wrong behavior (no crash, wrong output) | HIGH |
| Data integrity risk (wrong schema reference) | HIGH |
| Deprecated but functional | MEDIUM |
| Style/convention divergence only | LOW |
| Cannot verify but seems plausible | UNVERIFIABLE |

---

## Self-Check Before Finalizing Report

Before writing your final report, ask yourself:

1. Did I search the codebase before flagging each item — or did I flag from memory?
2. Did I check the actual installed version — or assume the latest?
3. Am I reporting CONFIRMED only for items with evidence — or did I conflate SUSPECTED with CONFIRMED?
4. Did I check for project-internal utilities that might legitimately define the "invented" method?
5. Is my stated "correct alternative" itself verified — or is it also from memory?

If you can't answer yes to all of these, do the additional search before finalizing.
