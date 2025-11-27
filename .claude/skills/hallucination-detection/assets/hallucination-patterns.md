# Hallucination Detection Patterns

This document provides detailed patterns for detecting hallucinations across different domains. Use these specific checks during evaluation when a subagent has worked on one of these areas.

---

### 1. API/Library Code

**Hallucination Triggers:**
- Generation of code involving third-party libraries (`axios`, `react`, `django-rest-framework`, etc.).
- Implementation of methods interacting with internal project modules.

**Detection Protocol:**
1.  **Check Dependencies:** Does the library exist in the project's dependency file (e.g., `package.json`, `requirements.txt`)? Is the version correct?
2.  **Verify Method Signatures:**
    - `grep` or `search` the codebase or official documentation for the exact method name: `grep -r "functionName" .`
    - Check the number and order of parameters.
    - Look for examples of its usage elsewhere in the project to confirm the pattern.
3.  **Flag Invented Methods:** Be highly suspicious of any method that is not explicitly found. Common hallucinations include adding pluralization where it doesn't exist (e.g., `getUsers()` instead of `getUser()`) or inventing chained methods (e.g., `.users.findByName()`).

---

### 2. Configuration Files

**Hallucination Triggers:**
- Modifications to `.json`, `.yaml`, `.xml`, `.conf`, or other configuration files.
- Setting up project tools, linters, compilers, or CI/CD pipelines.

**Detection Protocol:**
1.  **Find the Schema:** Does the tool or framework provide a JSON schema or a documented list of all valid options? Validate the configuration against it.
2.  **Use ONLY Documented Options:** Cross-reference every single key-value pair with official documentation. Hallucinations often manifest as convenient but non-existent flags (e.g., `enableMagicFeature: true`).
3.  **Provide References:** When evaluating, demand references to the official documentation for any questionable configuration option.

---

### 3. Database Operations

**Hallucination Triggers:**
- Writing or modifying SQL queries.
- Using an ORM (e.g., Prisma, SQLAlchemy, TypeORM) to interact with a database.

**Detection Protocol:**
1.  **Verify SQL Syntax:** Is the SQL dialect correct for the specific database being used (e.g., PostgreSQL vs. MySQL vs. SQLite)?
2.  **Check Schema:** Do the referenced tables and columns actually exist in the database schema? Look for schema definition files (`schema.prisma`, `models.py`, `*.sql` migrations).
3.  **Validate Data Types and Constraints:** Ensure the code respects `NOT NULL` constraints, foreign keys, and data types. Hallucinated code often forgets these details.
4.  **Check ORM Methods:** ORMs have very specific method names for operations. Verify that methods like `findUnique`, `filter`, `select_related` exist and are used correctly for the ORM version in use.

---

### 4. Security-Critical Code

**Hallucination Triggers:**
- Authentication, authorization, or session management code.
- Input sanitization and data validation.
- Cryptographic operations.

**Detection Protocol:**
1.  **Reference Security Best Practices:** Does the code align with known security patterns (e.g., OWASP Top 10)?
2.  **Scrutinize Crypto:** Cryptographic libraries have rigid APIs. Hallucinating a parameter (e.g., a made-up algorithm name in `jwt.sign()`) can have severe consequences. Verify every parameter against documentation.
3.  **Flag Experimental Approaches:** If the code uses a novel or "clever" security approach, it's a major red flag. Security code should be standard and boring. Demand that the subagent re-implement using a well-documented, standard pattern.
