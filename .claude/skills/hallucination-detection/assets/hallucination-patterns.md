# Hallucination Detection Patterns — Domain Reference

Detailed detection protocols by domain. Load the section(s) relevant to the code being evaluated.

---

## 1. API / Library Code

**Triggers:** Any third-party library usage (`axios`, `express`, `react-query`, `prisma`, `stripe`, etc.) or calls to internal project modules.

**Detection Protocol:**
1. **Verify the library is installed** — check `package.json` / `requirements.txt` / `Cargo.toml`. If it's not listed, it can't be imported without crashing.
2. **Check the exact version** — APIs change between major versions. Note the version, then check version-specific docs.
3. **Search the codebase for usage patterns** — `grep -r "methodName" .` finds how the rest of the project uses the same library. Divergence from existing patterns is a red flag.
4. **Verify method existence** — the method must appear in the library's official docs or source for the installed version.
5. **Verify parameter signature** — count, order, and types must match. Hallucinations often swap positional args or add non-existent named params.

**High-Frequency Hallucination Patterns:**
- Pluralization tricks: `getUser()` exists, `getUsers()` doesn't (or vice versa)
- Convenience methods that don't exist: `.postJSON()`, `.putWithRetry()`, `.fetchAll()`
- Chained methods: `.users.findByEmail()` when the real API is `client.findUser({ email })`
- Nested namespace mistakes: `axios.http.get()` instead of `axios.get()`
- Callback vs Promise API confusion: using `.then()` on a function that is callback-only in older versions

---

## 2. Configuration Files

**Triggers:** Any `.json`, `.yaml`, `.toml`, `.xml`, `.conf`, `.env` modification. CI/CD pipelines, linter configs, compiler configs, build tool configs.

**Detection Protocol:**
1. **Locate the official schema** — most tools publish a JSON Schema or documented option reference. Use it as ground truth.
2. **Validate every key** — every single key-value pair must be in the documentation. No inferred or "logical" keys.
3. **Check nesting depth** — hallucinations often put options at the wrong nesting level (`output.filename` vs `output.asset.filename`).
4. **Check value types** — booleans vs strings vs numbers vs arrays are not interchangeable. `"true"` vs `true` matters in JSON/YAML.
5. **Check for renamed options** — tools frequently rename options between versions. Old option names silently do nothing in newer versions.

**High-Frequency Hallucination Patterns:**
- `enableFeature: true` — invented boolean toggles
- Options that are CLI-only being placed in config files (common in ESLint, webpack, Jest)
- Merged/split options: `sourceMap: true` was split into separate options in some tool versions
- Wrong key for the tool: tsconfig options appearing in a babel config
- Environment-specific config at wrong scope level

---

## 3. Database / ORM

**Triggers:** SQL queries, ORM calls (Prisma, SQLAlchemy, TypeORM, ActiveRecord, Sequelize, Drizzle), migration files, schema definitions.

**Detection Protocol:**
1. **Locate the schema** — find `schema.prisma`, `models.py`, `*.sql` migration files, or equivalent. This is ground truth for table/column names.
2. **Verify table and column names** — check exact casing and spelling. `user_name` vs `username` vs `userName` all differ.
3. **Check ORM method names** — each ORM has its own vocabulary:
   - Prisma: `findUnique`, `findFirst`, `findMany`, `upsert`, `createMany`
   - SQLAlchemy: `session.query()`, `filter()`, `filter_by()`, `first()`, `all()`
   - TypeORM: `getRepository()`, `findOne()`, `save()`, `createQueryBuilder()`
   - Verify the method exists for the **specific ORM version** installed
4. **Check relation traversal** — `user.posts` only works if the relation is defined in the schema with that exact name
5. **Validate query structure** — WHERE clauses, JOIN conditions, and nested selects must respect the schema constraints

**High-Frequency Hallucination Patterns:**
- Using `findByX()` magic methods (common in Rails) in ORMs that don't support them
- Accessing a relation that exists in the model but wasn't included in the query (`include: { posts: true }` in Prisma)
- Using snake_case column names in camelCase ORM API or vice versa
- Missing `await` on async ORM calls
- Using raw SQL syntax inside ORM methods that don't accept it

---

## 4. Security-Critical Code

**Triggers:** Authentication, authorization, session management, input sanitization, cryptographic operations, JWT, OAuth, password hashing.

**Detection Protocol:**
1. **Cross-reference with OWASP** — does the implementation align with documented secure patterns?
2. **Verify crypto API signatures precisely** — cryptographic APIs are strict. A wrong parameter, even if logically plausible, can produce silently insecure output.
   - `crypto.createHmac('sha256', key).update(data).digest('hex')` — every method in this chain matters
   - `bcrypt.hash(password, saltRounds)` — `saltRounds` must be a number, not a salt string
3. **Check JWT library specifics** — `jsonwebtoken` vs `jose` vs `@auth/core` have different APIs. A param valid in one is hallucinated in another.
4. **Flag "clever" security approaches** — security code must be boring and standard. Novel implementations are red flags regardless of apparent correctness.
5. **Verify algorithm names are valid strings** — `'aes-256-gcm'` vs `'AES-256-GCM'` — some libraries are case-sensitive.

**High-Frequency Hallucination Patterns:**
- `jwt.verify()` and `jwt.sign()` parameter order swapped
- Using synchronous crypto functions where only async exists
- `bcrypt.hashSync()` vs `bcrypt.hash()` confusion
- Invented sanitization functions: `sanitize.html(input)` that don't actually exist
- Assuming middleware runs in the correct order when it hasn't been registered

---

## 5. LLM / AI APIs

**Triggers:** Calls to OpenAI, Anthropic, Google AI, Cohere, HuggingFace, or any LLM SDK. Also: prompt construction, token counting, embedding generation, tool/function calling.

**Detection Protocol:**
1. **Verify the model ID is currently valid** — model IDs are frequently deprecated, renamed, or restricted. Check current docs.
   - `gpt-4` vs `gpt-4-turbo` vs `gpt-4o` — these are different models with different endpoints
   - `claude-2` params differ from `claude-3` (messages API vs completions API)
2. **Check parameter names exactly** — LLM APIs evolve rapidly and parameter names change:
   - Anthropic: `max_tokens` (not `max_tokens_to_sample` in the messages API)
   - OpenAI: `max_completion_tokens` replaced `max_tokens` in newer models
3. **Verify response shape** — destructuring response fields that don't exist is extremely common:
   - OpenAI: `response.choices[0].message.content` not `response.text`
   - Anthropic: `response.content[0].text` not `response.completion`
4. **Check streaming API patterns** — streaming has different response shapes than non-streaming. They are not interchangeable.
5. **Verify tool/function calling schema** — the JSON schema format for function definitions is strict. Invented fields are ignored or cause errors.

**High-Frequency Hallucination Patterns:**
- Using deprecated completions API (`/v1/completions`) for models that require chat completions (`/v1/chat/completions`)
- `model: 'claude-3-sonnet'` — wrong ID (correct: `'claude-3-sonnet-20240229'` or newer)
- Mixing OpenAI and Anthropic response shapes
- Assuming `.usage.total_tokens` exists on all providers (it doesn't)
- Inventing streaming helper methods that don't exist in the SDK

---

## 6. TypeScript Types and Interfaces

**Triggers:** TypeScript code with type annotations, interfaces, generics, or type assertions.

**Detection Protocol:**
1. **Find the type definition** — search for the interface or type in project files and `node_modules/@types`. Use `grep -r "interface TypeName"`.
2. **Verify field names exactly** — TypeScript interfaces use exact field names. `user.userId` vs `user.id` is a type error.
3. **Check generic parameter usage** — `Array<T>` vs `T[]` vs `ReadonlyArray<T>` are not always interchangeable in context.
4. **Verify union type handling** — if a type is `string | null`, code that treats it as always `string` is a latent bug.
5. **Check utility type usage** — `Partial<T>`, `Required<T>`, `Pick<T, K>`, `Omit<T, K>` have specific behaviors that are frequently misused.

**High-Frequency Hallucination Patterns:**
- Adding fields to an interface that aren't defined (type error that passes if `any` is used elsewhere)
- Incorrect generic constraints: `T extends object` vs `T extends Record<string, unknown>`
- `as any` casts hiding a type error rather than resolving it
- `!` non-null assertion on values that legitimately can be null

---

## 7. Import / Module Paths

**Triggers:** Any `import` statement, `require()`, or dynamic `import()`. Package imports, relative path imports, path alias imports.

**Detection Protocol:**
1. **Check package imports** — is the package in `package.json`/`requirements.txt`? Check the exact package name (case-sensitive on Linux).
2. **Verify deep imports** — `import { x } from 'lodash/fp'` — does that sub-path actually export `x`?
3. **Check path aliases** — `@/utils/auth` — is `@` defined in `tsconfig.json` `paths` or `webpack.config.js`? What does it resolve to?
4. **Verify relative paths** — `../utils/auth` — does that file actually exist at that path relative to the importing file?
5. **Check named vs default exports** — `import auth from './auth'` vs `import { auth } from './auth'` — which does the file export?

**High-Frequency Hallucination Patterns:**
- `import { useRouter } from 'next/router'` in App Router (correct: `import { useRouter } from 'next/navigation'`)
- Deep importing from packages that don't support it
- Wrong relative path depth (`../` vs `../../`)
- Importing a type as a value without `import type`

---

## 8. CLI Arguments and Commands

**Triggers:** Shell scripts, Makefiles, CI/CD pipeline commands, Dockerfile RUN commands, npm scripts, any shell invocation.

**Detection Protocol:**
1. **Verify the command exists** — is the binary available? Is it installed?
2. **Check the exact flag syntax** — flags are often long-form (`--verbose`) or short-form (`-v`) but not always both. Check `--help` output or man pages.
3. **Verify positional argument order** — many CLIs are strict about argument order.
4. **Check subcommand structure** — `docker container run` vs `docker run` — both exist but not all subcommands work both ways.
5. **Check for version-specific flags** — flags added in newer versions silently fail or error in older versions.

**High-Frequency Hallucination Patterns:**
- `git commit --no-hooks` — correct flag is `--no-verify`
- `npm install --save` — `--save` is default since npm 5, but `--save-dev` is still needed for dev deps
- `curl -X POST --data` vs `--data-raw` vs `--json` — these behave differently
- Invented `--dry-run` flags for tools that don't support them

---

## 9. Environment Variables

**Triggers:** `process.env.X`, `os.environ['X']`, `ENV['X']`, `.env` files, Docker ENV, CI/CD secrets.

**Detection Protocol:**
1. **Check `.env.example` or `.env.template`** — this is the authoritative list of env vars the project uses.
2. **Search the codebase** — `grep -r "process.env\." .` to find all usages and verify naming consistency.
3. **Check for naming conventions** — the project may use `APP_` prefix, `NEXT_PUBLIC_` prefix (for Next.js client-side), or other conventions.
4. **Verify public vs private** — Next.js: `NEXT_PUBLIC_*` is exposed to the browser, others are server-only. This is a security concern if wrong.

**High-Frequency Hallucination Patterns:**
- `API_SECRET_KEY` when codebase uses `SECRET_KEY` or `API_KEY`
- Using server-side env vars in client-side code (leaks secrets)
- `DATABASE_URL` vs `DB_URL` vs `POSTGRES_URL` — project-specific naming varies

---

## 10. Framework Conventions

**Triggers:** React, Next.js, Vue, Nuxt, Angular, Django, Rails, FastAPI, or any framework with strong conventions.

**Detection Protocol:**
1. **Identify the framework version** — conventions change significantly between major versions (e.g., Next.js Pages Router vs App Router)
2. **Check file location requirements** — many frameworks require files in specific directories with specific names (`pages/`, `app/`, `routes/`, `views/`)
3. **Verify lifecycle method names** — framework lifecycle hooks have exact names and signatures
4. **Check export requirements** — `export default` vs `export const` vs named exports matter for many frameworks

**High-Frequency Hallucination Patterns:**

**React:**
- Hooks called conditionally or outside a component
- `useEffect` with missing or wrong dependency array
- Mutating state directly instead of via setter

**Next.js:**
- `getServerSideProps` used in App Router (doesn't work — use `async` server components)
- `useRouter` from `'next/router'` in App Router (correct: `'next/navigation'`)
- Missing `'use client'` directive on components that use browser APIs

**Django:**
- `url()` in newer Django versions (use `path()` or `re_path()`)
- Middleware in wrong order (authentication before session)

**FastAPI:**
- `@app.route()` (that's Flask) — use `@app.get()`, `@app.post()`, etc.
- Missing `async def` for async path handlers
