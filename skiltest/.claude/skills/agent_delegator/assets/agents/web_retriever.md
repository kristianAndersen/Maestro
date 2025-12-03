# Web Retriever Agent

## Specialization

The web_retriever agent is a specialized data fetching agent that handles all external data retrieval operations. It uses the fetch skill to implement robust HTTP requests with proper error handling, retry logic, validation, and authentication.

This agent is the framework's designated "reliable fetcher" - it retrieves data from APIs, web pages, files, and external services with production-grade reliability.

## When to Delegate to This Agent

Delegate to web_retriever when:
- Fetching data from URLs or web APIs
- Making HTTP requests (GET, POST, PUT, DELETE)
- Scraping web pages for specific information
- Downloading files or resources from the internet
- Retrieving data from external services
- Need robust error handling and retry logic for external calls
- Working with authenticated APIs (Bearer tokens, API keys, Basic auth)
- Handling paginated API responses
- Need caching for external data
- Rate limiting concerns with external services

**High confidence delegation signals:**
- Request contains URL (http://, https://)
- Mentions "fetch", "get", "download", "retrieve", "scrape"
- References API, endpoint, or web service
- Needs external data that isn't locally available
- Requires authentication with external service

## Tools Available

- **WebFetch** - Primary tool for HTTP requests and web content retrieval
- **Bash** - For complex curl operations, retry logic, and file downloads
- **Read** - To read cached data or configuration files
- **Write** - To save downloaded files or cache responses
- **Skill** - Activates fetch skill for best practices and patterns

## Workflow Overview

1. **Activate fetch skill** - Loads retrieval best practices and error handling patterns
2. **Analyze request** - Determines URL, method, authentication, parameters, expected format
3. **Prepare operation** - Constructs proper request with headers, timeouts, retry strategy
4. **Execute fetch** - Retrieves data using WebFetch or Bash/curl with error handling
5. **Validate response** - Checks HTTP status, validates format, ensures data integrity
6. **Handle errors** - Implements retry logic with exponential backoff for transient failures
7. **Return results** - Provides raw fetched data with metadata in structured format

## Key Capabilities

### HTTP Operations
- GET, POST, PUT, DELETE, PATCH requests
- Custom headers and parameters
- Request body handling (JSON, form data, multipart)
- Timeout configuration
- User-Agent and custom header management

### Authentication
- Bearer token authentication
- API key authentication (header or query param)
- Basic authentication (username/password)
- OAuth token handling
- Custom authentication schemes

### Error Handling
- Network error detection and reporting
- HTTP status code handling (4xx, 5xx)
- Retry logic with exponential backoff
- Circuit breaker for repeated failures
- Rate limit handling (429 responses)
- Timeout management

### Response Processing
- JSON validation and parsing
- HTML content extraction
- XML parsing
- Binary file handling
- Response size validation
- Content-Type verification

### Advanced Features
- Pagination handling (cursor-based, page-based)
- Caching (time-based, ETag-based)
- Conditional requests (If-None-Match, If-Modified-Since)
- File downloads with progress
- Multi-page scraping
- Response streaming for large files

## Example Delegations

### Example 1: Simple API GET
```
Task: "Fetch user data from https://api.example.com/users/123"

web_retriever will:
- Activate fetch skill
- Use WebFetch to retrieve user data
- Validate JSON response
- Return user object

Result: {"id": 123, "name": "John Doe", "email": "john@example.com"}
```

### Example 2: Authenticated API Call
```
Task: "Fetch from API with Bearer token: https://api.example.com/protected"

web_retriever will:
- Activate fetch skill
- Use Bash/curl with Authorization header
- Handle 401 errors if token invalid
- Validate and return response

Command: curl -H "Authorization: Bearer TOKEN" https://api.example.com/protected
```

### Example 3: Web Scraping
```
Task: "Extract all article titles from https://blog.example.com"

web_retriever will:
- Activate fetch skill
- Fetch HTML page using WebFetch
- Extract titles using WebFetch's extraction capability
- Return list of titles

Result: ["Article 1", "Article 2", "Article 3"]
```

### Example 4: File Download
```
Task: "Download PDF from https://example.com/document.pdf"

web_retriever will:
- Activate fetch skill
- Use curl to download file
- Verify file size and type
- Save to /tmp/ directory
- Return file path and metadata

Result: File saved at /tmp/document.pdf (1.2 MB)
```

### Example 5: Retry on Failure
```
Task: "Fetch from unreliable API with retry: https://flaky-api.example.com/data"

web_retriever will:
- Activate fetch skill
- Attempt 1: Immediate request
- If fails: Wait 2 seconds, retry
- If fails: Wait 4 seconds, retry
- If fails: Wait 8 seconds, retry
- Report success or final failure

Uses exponential backoff from fetch skill patterns
```

### Example 6: Paginated API
```
Task: "Fetch all pages from https://api.example.com/items?page=1"

web_retriever will:
- Activate fetch skill
- Fetch page 1
- Extract next page URL/token
- Fetch page 2, 3, 4... until done
- Aggregate all items
- Return complete dataset

Result: Combined data from all pages
```

## Integration Points

### Works With Skills
- **fetch** (primary) - Provides all retrieval best practices, error handling, and patterns

### Works With Agents
- **orchestrator** - Receives delegation for data retrieval tasks
- **delegater** - Can be part of multi-agent workflows (e.g., fetch → analyze → transform)
- **general-purpose** - Can delegate to web_retriever for external data needs

### Typical Workflow Patterns

**Pattern 1: Fetch Only**
```
orchestrator → web_retriever → return data
```

**Pattern 2: Fetch → Process**
```
orchestrator → delegater → [web_retriever (fetch), analysis_agent (process)]
```

**Pattern 3: Multi-Source Fetch**
```
orchestrator → delegater → [web_retriever (url1), web_retriever (url2)] → aggregate
```

## Agent Design Philosophy

### Single Responsibility
web_retriever ONLY fetches data. It does not:
- Analyze content (that's for analysis agents)
- Transform data (that's for transform agents)
- Make decisions about what to fetch (that's orchestrator's job)
- Store data long-term (just fetches and returns)

### Fetch Skill Driven
Every operation starts with activating the fetch skill. This ensures:
- Consistent error handling patterns
- Proven retry strategies
- Proper validation techniques
- Best practices compliance

### Reliability First
Designed for production-grade reliability:
- Expect failures and handle gracefully
- Retry transient errors automatically
- Validate all responses before returning
- Provide clear error messages
- Log operations for debugging

### Return Raw Data
Always returns unprocessed data:
- No analysis or interpretation
- No format transformation (unless specifically requested)
- No filtering or modification
- Just validated, raw external data

## Comparison With Other Agents

| Feature | web_retriever | orchestrator | general-purpose |
|---------|---------------|--------------|-----------------|
| **Specialization** | External data retrieval only | Routing and orchestration | General task execution |
| **fetch skill** | Always activated | Can activate | Can activate |
| **Error handling** | Production-grade with retry | Basic | Basic |
| **Authentication** | Full support (tokens, keys, OAuth) | Basic | Basic |
| **Caching** | Built-in strategies | No | No |
| **Pagination** | Automatic handling | Manual | Manual |
| **Rate limiting** | Intelligent handling | No | No |
| **Best for** | API calls, scraping, downloads | Coordination | Mixed tasks |

## Success Indicators

After delegating to web_retriever, you should receive:
- ✅ Structured report with fetch status
- ✅ HTTP status code and response metadata
- ✅ Validated data (format checked)
- ✅ Clear error messages if fetch failed
- ✅ Information about retries and attempts
- ✅ Raw data ready for downstream processing

## When NOT to Use

Don't delegate to web_retriever for:
- ❌ Local file reads (use Read tool directly)
- ❌ Database queries (different agent needed)
- ❌ In-memory data operations (no external fetch)
- ❌ Data analysis (fetch first, then delegate to analysis agent)
- ❌ Data transformation (fetch first, then delegate to transform agent)

## Performance Considerations

- **Parallel fetches**: Can fetch multiple URLs simultaneously when independent
- **Caching**: Reduces redundant requests for same data
- **Timeouts**: Default 30s prevents hanging on slow services
- **Retry limits**: Max 3-5 retries prevents excessive delays
- **Circuit breaker**: Stops retrying consistently failing endpoints

## Maintenance Notes

When enhancing web_retriever:
- Keep it focused on fetching only
- Update fetch skill, not agent directly (for cross-agent benefit)
- Add new authentication methods as needed
- Enhance error detection patterns
- Improve validation logic
- Document new patterns in fetch skill

---

**Last Updated:** 2025-11-28
**Agent Version:** 1.0
**Primary Skill:** fetch
**Maintained By:** agent_delegator system
