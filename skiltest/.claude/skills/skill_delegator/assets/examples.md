# Skill Routing Examples

Real-world examples of user requests and how skill_delegator routes them to the appropriate skill.

---

## Data Retrieval Examples

### Example 1: Direct URL Fetch

**User Request:**
> "Get the content from https://www.hvadsigerjakob.dk/"

**Analysis:**
- Contains URL (https://)
- Action verb: "get"
- Clear data retrieval intent

**Decision:** Activate `fetch` skill
**Confidence:** High
**Reasoning:** Direct URL + retrieval verb = clear fetch operation

---

### Example 2: API Request

**User Request:**
> "Fetch the latest user data from the /api/users endpoint"

**Analysis:**
- Contains "fetch" keyword
- Mentions API endpoint
- Data retrieval context

**Decision:** Activate `fetch` skill
**Confidence:** High
**Reasoning:** API endpoint reference + fetch verb

---

### Example 3: Web Scraping

**User Request:**
> "Extract all the blog post titles from https://example.com/blog"

**Analysis:**
- Contains URL
- Action: "extract" (data retrieval)
- Web content focused

**Decision:** Activate `fetch` skill
**Confidence:** High
**Reasoning:** Web scraping is a fetch operation

---

### Example 4: File Download

**User Request:**
> "Download the PDF from this link: https://example.com/document.pdf"

**Analysis:**
- Contains "download" keyword
- URL present
- File retrieval

**Decision:** Activate `fetch` skill
**Confidence:** High
**Reasoning:** Download is a type of fetch operation

---

### Example 5: Generic Data Request

**User Request:**
> "Can you get the weather data?"

**Analysis:**
- Contains "get" keyword
- Implies external data source
- No specific URL or endpoint

**Decision:** Activate `fetch` skill
**Confidence:** Medium
**Reasoning:** Likely needs external API, but unclear source

---

## Non-Skill Examples

### Example 6: Local File Operation

**User Request:**
> "Read the contents of config.json"

**Analysis:**
- No URL or external source
- Local file operation
- Basic file read

**Decision:** No skill needed
**Confidence:** N/A
**Reasoning:** Simple local file read, use Read tool directly

---

### Example 7: Code Writing

**User Request:**
> "Write a function that calculates fibonacci numbers"

**Analysis:**
- Code generation task
- No external data
- No matching skill patterns

**Decision:** No skill needed
**Confidence:** N/A
**Reasoning:** Pure code generation, no specialized skill available

---

### Example 8: General Question

**User Request:**
> "What is the difference between REST and GraphQL?"

**Analysis:**
- Informational question
- No action to perform
- Conversational

**Decision:** No skill needed
**Confidence:** N/A
**Reasoning:** Question answering doesn't require specialized skill

---

## Edge Cases

### Example 9: Ambiguous Request

**User Request:**
> "Get me the user data"

**Analysis:**
- Contains "get" keyword
- Unclear if local or external
- Missing context

**Decision:** Ask for clarification OR assume `fetch` skill
**Confidence:** Low
**Reasoning:** Could be local database or external API - need more context

---

### Example 10: Multi-Step Request

**User Request:**
> "Fetch data from the API and then save it to a file"

**Analysis:**
- First action: fetch (external)
- Second action: save (local)
- Multiple steps

**Decision:** Activate `fetch` skill for the fetch portion
**Confidence:** High
**Reasoning:** Start with fetch skill, then proceed with file operations

---

## Pattern Summary

| Request Pattern | Skill | Confidence |
|----------------|-------|------------|
| URL + retrieval verb | fetch | High |
| "API" + endpoint | fetch | High |
| "download" + URL | fetch | High |
| "scrape" + website | fetch | High |
| Generic "get" data | fetch | Medium |
| Local file read | None | N/A |
| Code generation | None | N/A |
| Questions | None | N/A |

---

## Decision Tree

```
User Request
    ↓
Contains URL or API reference?
    ↓ Yes                    ↓ No
Activate fetch skill    Contains retrieval verb? (get, fetch, download)
                            ↓ Yes                    ↓ No
                        Context implies external?    No skill needed
                            ↓ Yes        ↓ No
                        Activate fetch   No skill needed
```
