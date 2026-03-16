# Maestro Memory Database Module

Comprehensive database system for storing, searching, and retrieving conversation history with full-text search capabilities, structured schema, and optimized performance settings.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Installation & Setup](#installation--setup)
- [API Reference](#api-reference)
- [CLI Usage](#cli-usage)
- [Performance](#performance)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

---

## Overview

The Maestro Memory Database provides persistent storage for conversation history including:

- **Conversation metadata** - Start/end times, primary agent, duration, token usage
- **Messages** - Full conversation messages with roles and timestamps
- **Agent delegations** - 3P format delegations (Product, Process, Performance)
- **Evaluations** - 4-D evaluation results with verdicts and refinement notes
- **Tool calls** - Complete tool invocation history with parameters and results
- **Skills used** - Track which skills were activated during conversations
- **Files modified** - Monitor file changes throughout conversations

### Key Features

- **Full-Text Search (FTS5)**: Lightning-fast search across messages and delegations
- **Optimized Indexes**: Fast queries by conversation, agent, skill, file, date range
- **Referential Integrity**: Foreign key constraints ensure data consistency
- **Performance Tuned**: WAL mode, 64MB cache, memory-mapped I/O, in-memory temp storage
- **Transaction Safety**: All writes use atomic transactions
- **CLI Tool**: Complete command-line interface for all operations

---

## Architecture

### Database Schema

The database consists of 7 main tables with referential integrity:

#### `conversations`
Stores conversation-level metadata.

```sql
CREATE TABLE conversations (
  id TEXT PRIMARY KEY,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  primary_agent TEXT,
  message_count INTEGER NOT NULL,
  duration INTEGER NOT NULL,
  token_usage TEXT
);
```

**Indexes:**
- `idx_conversations_start_time` - For date range queries
- `idx_conversations_primary_agent` - For agent-specific queries

#### `messages`
Stores individual conversation messages.

```sql
CREATE TABLE messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  conversation_id TEXT NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  metadata TEXT,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
);
```

**Indexes:**
- `idx_messages_conversation_id` - Fast message retrieval by conversation
- `idx_messages_timestamp` - Chronological ordering

**Full-Text Search:**
- `messages_fts` - FTS5 virtual table for content search

#### `delegations`
Stores agent delegation records in 3P format.

```sql
CREATE TABLE delegations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  conversation_id TEXT NOT NULL,
  agent_name TEXT NOT NULL,
  product TEXT NOT NULL,
  process TEXT NOT NULL,
  performance TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  delegated_by TEXT,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
);
```

**Indexes:**
- `idx_delegations_conversation_id` - Fast delegation retrieval
- `idx_delegations_agent_name` - Agent-specific queries

**Full-Text Search:**
- `delegations_fts` - FTS5 virtual table for delegation search

#### `evaluations`
Stores 4-D evaluation results.

```sql
CREATE TABLE evaluations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  conversation_id TEXT NOT NULL,
  verdict TEXT NOT NULL,
  dimensions TEXT NOT NULL,
  refinement_needed TEXT,
  timestamp TEXT NOT NULL,
  evaluated_agent TEXT,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
);
```

#### `tool_calls`
Stores tool invocation history.

```sql
CREATE TABLE tool_calls (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  conversation_id TEXT NOT NULL,
  tool_name TEXT NOT NULL,
  parameters TEXT NOT NULL,
  result TEXT,
  timestamp TEXT NOT NULL,
  success INTEGER NOT NULL,
  error_message TEXT,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
);
```

**Index:**
- `idx_tool_calls_conversation_id` - Fast tool call retrieval

#### `skills_used`
Tracks skill activation during conversations.

```sql
CREATE TABLE skills_used (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  conversation_id TEXT NOT NULL,
  skill_name TEXT NOT NULL,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
);
```

**Index:**
- `idx_skills_used_conversation_id` - Fast skill retrieval

#### `files_modified`
Tracks file modifications during conversations.

```sql
CREATE TABLE files_modified (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  conversation_id TEXT NOT NULL,
  file_path TEXT NOT NULL,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
);
```

**Index:**
- `idx_files_modified_conversation_id` - Fast file tracking

### Full-Text Search (FTS5)

Two FTS5 virtual tables enable lightning-fast text search:

- **`messages_fts`**: Searches message content
- **`delegations_fts`**: Searches delegation product/process/performance

Automatic synchronization is handled via triggers (insert, update, delete).

---

## Installation & Setup

### Prerequisites

- **Bun** >= 1.0.0 (includes built-in SQLite support)

### Initialize Database

```bash
# Option 1: Use CLI tool
cd .claude/services/database
bun cli-db-tool.ts init

# Option 2: Programmatic initialization
import { initializeDatabase } from "./init";
initializeDatabase("/path/to/conversations.db");
```

Default database location: `.claude/memory/conversations.db`

---

## API Reference

### Connection Module (`connection.ts`)

#### `openDatabase(dbPath: string): Database`

Opens a SQLite database connection with performance optimizations.

**PRAGMA Settings:**
- `journal_mode=WAL` - Write-Ahead Logging for concurrency
- `synchronous=NORMAL` - Balance performance and durability
- `foreign_keys=ON` - Enforce referential integrity
- `cache_size=-64000` - 64MB page cache for frequently accessed data
- `temp_store=MEMORY` - In-memory temporary tables/indexes
- `mmap_size=30000000000` - Memory-mapped I/O (30GB) for faster reads

**Example:**
```typescript
import { openDatabase, closeDatabase } from "./connection";

const db = openDatabase("/path/to/conversations.db");
try {
  // Use database...
} finally {
  closeDatabase(db);
}
```

#### `closeDatabase(db: Database): void`

Closes database connection and flushes changes.

---

### Initialization Module (`init.ts`)

#### `initializeDatabase(dbPath: string): void`

Initializes database schema from `schema.sql`. Idempotent (safe to run multiple times).

**Example:**
```typescript
import { initializeDatabase } from "./init";

initializeDatabase("/Users/me/.claude/memory/conversations.db");
// Database ready for use
```

---

### Storage Module (`storage.ts`)

#### `storeConversation(dbPath: string, parsed: ParsedConversation): string`

Stores a parsed conversation into the database using atomic transactions.

**Returns:** Generated conversation ID (UUID)

**Example:**
```typescript
import { storeConversation } from "./storage";
import { parseConversation } from "../memory/parser";

const parsed = parseConversation(sessionData);
const conversationId = storeConversation("/path/to/db", parsed);
console.log(`Stored: ${conversationId}`);
```

**Transaction includes:**
- Conversation metadata
- All messages
- All delegations
- All evaluations
- All tool calls
- Skills used
- Files modified

**Error handling:** On failure, entire transaction is rolled back (no partial data).

---

### Search Module (`search.ts`)

Full-text search capabilities using FTS5.

#### `searchMessages(dbPath: string, query: string, limit?: number): SearchResult[]`

Search message content only.

**Example:**
```typescript
import { searchMessages } from "./search";

const results = searchMessages("/path/to/db", "agent delegation", 10);
results.forEach(result => {
  console.log(`[${result.type}] ${result.snippet}`);
  console.log(`  Conversation: ${result.conversationId}`);
});
```

#### `searchDelegations(dbPath: string, query: string, limit?: number): SearchResult[]`

Search delegation product/process/performance text.

**Example:**
```typescript
import { searchDelegations } from "./search";

const results = searchDelegations("/path/to/db", "file writer", 20);
```

#### `searchAll(dbPath: string, query: string, limit?: number): SearchResult[]`

Search across both messages and delegations, merged and sorted by relevance.

**Example:**
```typescript
import { searchAll } from "./search";

const results = searchAll("/path/to/db", "maestro orchestration", 50);
```

**SearchResult interface:**
```typescript
interface SearchResult {
  type: "message" | "delegation";
  conversationId: string;
  snippet: string;         // Matched text excerpt
  timestamp: string;
  agent?: string;          // Optional agent name
}
```

---

### Queries Module (`queries.ts`)

Structured queries for conversation discovery.

#### `getRecentConversations(dbPath: string, limit?: number): ConversationSummary[]`

Get most recent conversations ordered by start time.

**Example:**
```typescript
import { getRecentConversations } from "./queries";

const recent = getRecentConversations("/path/to/db", 20);
recent.forEach(conv => {
  console.log(`${conv.id}: ${conv.messageCount} messages, ${conv.primaryAgent}`);
});
```

#### `getConversationsByAgent(dbPath: string, agentName: string, limit?: number): ConversationSummary[]`

Find conversations by primary agent.

**Example:**
```typescript
import { getConversationsByAgent } from "./queries";

const fileWriterConvs = getConversationsByAgent("/path/to/db", "file-writer", 10);
```

#### `getConversationsByDateRange(dbPath: string, startDate: string, endDate: string): ConversationSummary[]`

Find conversations within date range (ISO 8601 format).

**Example:**
```typescript
import { getConversationsByDateRange } from "./queries";

const convs = getConversationsByDateRange(
  "/path/to/db",
  "2025-12-01T00:00:00Z",
  "2025-12-31T23:59:59Z"
);
```

#### `getConversationsBySkill(dbPath: string, skillName: string, limit?: number): ConversationSummary[]`

Find conversations where a specific skill was used.

**Example:**
```typescript
import { getConversationsBySkill } from "./queries";

const writeSkillConvs = getConversationsBySkill("/path/to/db", "write", 15);
```

#### `getConversationsByFile(dbPath: string, filePath: string, limit?: number): ConversationSummary[]`

Find conversations where a specific file was modified.

**Example:**
```typescript
import { getConversationsByFile } from "./queries";

const convs = getConversationsByFile(
  "/path/to/db",
  ".claude/agents/maestro.md"
);
```

#### `getConversationStatsByDate(dbPath: string, days?: number): Array<{ date: string; count: number }>`

Get conversation counts grouped by date (useful for activity tracking).

**Example:**
```typescript
import { getConversationStatsByDate } from "./queries";

const stats = getConversationStatsByDate("/path/to/db", 30);
stats.forEach(({ date, count }) => {
  console.log(`${date}: ${count} conversations`);
});
```

**ConversationSummary interface:**
```typescript
interface ConversationSummary {
  id: string;
  startTime: string;
  endTime: string;
  primaryAgent: string | null;
  messageCount: number;
  duration: number;
  skillsUsed: string[];
  filesModified: string[];
}
```

---

### Retrieval Module (`retrieval.ts`)

Complete conversation retrieval with all related data.

#### `getConversationById(dbPath: string, id: string): ParsedConversation | null`

Retrieve full conversation details including messages, delegations, evaluations, and tool calls.

**Example:**
```typescript
import { getConversationById } from "./retrieval";

const conversation = getConversationById("/path/to/db", "abc-123-uuid");
if (conversation) {
  console.log(`Messages: ${conversation.messages.length}`);
  console.log(`Delegations: ${conversation.delegations?.length || 0}`);
  console.log(`Skills: ${conversation.metadata.skillsUsed.join(", ")}`);
}
```

#### `getConversationsByIds(dbPath: string, ids: string[]): ParsedConversation[]`

Retrieve multiple conversations efficiently.

**Example:**
```typescript
import { getConversationsByIds } from "./retrieval";

const conversations = getConversationsByIds("/path/to/db", [
  "abc-123",
  "def-456",
  "ghi-789"
]);
```

#### `conversationExists(dbPath: string, id: string): boolean`

Check if a conversation exists without loading full data.

**Example:**
```typescript
import { conversationExists } from "./retrieval";

if (conversationExists("/path/to/db", "abc-123")) {
  console.log("Conversation found");
}
```

#### `getMessageCount(dbPath: string, id: string): number | null`

Get message count for a conversation.

**Example:**
```typescript
import { getMessageCount } from "./retrieval";

const count = getMessageCount("/path/to/db", "abc-123");
console.log(`Messages: ${count}`);
```

---

## CLI Usage

The CLI tool provides complete command-line access to all database operations.

### Installation

```bash
cd .claude/services/database
chmod +x cli-db-tool.ts
```

### Commands

#### `init` - Initialize Database

Creates database schema at default location (`.claude/memory/conversations.db`).

```bash
bun cli-db-tool.ts init

# Custom location
bun cli-db-tool.ts --db /custom/path/db.sqlite init
```

**Output:**
```
Initializing database at: .claude/memory/conversations.db
✅ Database initialized successfully!

Tables created:
  • conversations
  • messages
  • messages_fts
  • delegations
  • delegations_fts
  • evaluations
  • tool_calls
  • skills_used
  • files_modified
```

---

#### `search` - Full-Text Search

Search across all messages and delegations.

```bash
bun cli-db-tool.ts search "agent delegation"

# JSON output
bun cli-db-tool.ts search "maestro" --json
```

**Output:**
```
🔍 Found 3 result(s) for: "agent delegation"
────────────────────────────────────────────────────────────────────────────────

1. [MESSAGE]
   Conversation: abc-123-uuid
   Timestamp: 12/17/2025, 10:30:45 AM
   Agent: maestro

   The maestro agent delegates work to specialized agents using the 3P format...
────────────────────────────────────────────────────────────────────────────────
```

---

#### `list` - List Recent Conversations

Shows recent conversations with summary information.

```bash
bun cli-db-tool.ts list

# Limit results
bun cli-db-tool.ts list --limit 10

# JSON output
bun cli-db-tool.ts list --json
```

**Output:**
```
📋 Recent conversations (5):
────────────────────────────────────────────────────────────────────────────────

1. abc-123-uuid
   Started: 12/17/2025, 10:00:00 AM
   Duration: 325s
   Messages: 45
   Agent: file-writer
   Skills: write, read
   Files: .claude/agents/maestro.md, README.md
```

---

#### `show` - Show Conversation Details

Display full conversation details including all messages, delegations, evaluations, and tool calls.

```bash
bun cli-db-tool.ts show abc-123-uuid

# JSON output
bun cli-db-tool.ts show abc-123-uuid --json
```

**Output:**
```
╔══════════════════════════════════════════════════════════════╗
║              CONVERSATION DETAILS                            ║
╚══════════════════════════════════════════════════════════════╝

ID: abc-123-uuid
Started: 12/17/2025, 10:00:00 AM
Ended: 12/17/2025, 10:05:25 AM
Duration: 325s
Primary Agent: file-writer

Skills Used (2):
  • write
  • read

Files Modified (2):
  • .claude/agents/maestro.md
  • README.md

────────────────────────────────────────────────────────────────
MESSAGES (45):
────────────────────────────────────────────────────────────────

[1] user - 12/17/2025, 10:00:00 AM
Create a new agent for handling database operations...
```

---

#### `stats` - Database Statistics

Show database statistics including totals, top agents, top skills, and recent activity.

```bash
bun cli-db-tool.ts stats

# JSON output
bun cli-db-tool.ts stats --json
```

**Output:**
```
╔══════════════════════════════════════════════════════════════╗
║              DATABASE STATISTICS                             ║
╚══════════════════════════════════════════════════════════════╝

TOTALS:
  Conversations: 127
  Messages: 5,423
  Delegations: 342
  Evaluations: 89
  Tool Calls: 1,256

TOP AGENTS:
  maestro: 45 conversations
  file-writer: 32 conversations
  base-research: 28 conversations

TOP SKILLS:
  write: 67 uses
  read: 54 uses
  fetch: 31 uses

RECENT ACTIVITY (Last 7 Days):
  2025-12-17: 15 conversations
  2025-12-16: 23 conversations
  2025-12-15: 18 conversations
```

---

#### `import` - Import Conversation

Import conversation from parser JSON output.

```bash
bun cli-db-tool.ts import session-output.json

# Custom database
bun cli-db-tool.ts --db /custom/db.sqlite import session.json
```

**Output:**
```
Reading file: session-output.json
Importing conversation...
✅ Conversation imported successfully!

Conversation ID: xyz-789-uuid
Messages: 34
Delegations: 5
Evaluations: 2
Tool Calls: 28
```

---

### Global Options

#### `--db <path>` - Custom Database Path

Use a database at a custom location.

```bash
bun cli-db-tool.ts --db /tmp/test.db init
bun cli-db-tool.ts --db /tmp/test.db list
```

#### `--json` - JSON Output

Output results in JSON format (useful for scripting/integration).

```bash
bun cli-db-tool.ts list --json | jq '.[] | .id'
bun cli-db-tool.ts search "maestro" --json | jq '.[] | .snippet'
```

---

## Performance

### PRAGMA Optimizations

The database connection module applies several performance optimizations:

#### `cache_size = -64000` (64MB page cache)
Keeps frequently accessed database pages in memory for faster queries. Negative value indicates size in KB.

**Impact:** Significantly reduces disk I/O for repeated queries.

#### `temp_store = MEMORY`
Stores temporary tables and indexes in memory instead of on disk.

**Impact:** Faster sorting, grouping, and temporary view operations.

#### `mmap_size = 30000000000` (30GB memory-mapped I/O)
Maps database file into process memory space for direct access.

**Impact:** Dramatically speeds up read operations on larger databases by avoiding system calls.

#### `journal_mode = WAL` (Write-Ahead Logging)
Allows concurrent readers and writers (readers don't block writers).

**Impact:** Better concurrency, faster commits, improved reliability.

#### `synchronous = NORMAL`
Balances performance and durability (syncs at critical moments but not every write).

**Impact:** 2-3x faster writes compared to FULL synchronous mode while maintaining crash safety.

### Index Strategy

All foreign keys and frequently queried columns have indexes:

- **Conversation queries**: Indexed by `start_time`, `primary_agent`
- **Message queries**: Indexed by `conversation_id`, `timestamp`
- **Delegation queries**: Indexed by `conversation_id`, `agent_name`
- **Tool call queries**: Indexed by `conversation_id`
- **Skill tracking**: Indexed by `conversation_id`
- **File tracking**: Indexed by `conversation_id`

### Full-Text Search Performance

FTS5 provides:
- Sub-millisecond search on thousands of messages
- Relevance ranking (BM25 algorithm)
- Phrase matching and prefix queries
- Automatic tokenization and stemming

**Benchmark (10,000 messages):**
- Simple search: ~1-2ms
- Complex phrase search: ~3-5ms
- Wildcard search: ~5-10ms

### Transaction Strategy

All multi-row operations use transactions for:
- **Atomicity**: All-or-nothing (no partial writes)
- **Performance**: Batch commits reduce disk sync overhead
- **Consistency**: Referential integrity maintained

---

## Testing

### Run All Tests

```bash
cd .claude/services/database/__tests__
bun test
```

### Run Specific Test Suite

```bash
# Connection tests
bun test connection.test.ts

# Storage tests
bun test storage.test.ts

# Search tests
bun test search.test.ts

# Query tests
bun test queries.test.ts

# Retrieval tests
bun test retrieval.test.ts

# Initialization tests
bun test init.test.ts

# Integration tests
bun test integration.test.ts
```

### Test Coverage

Expected test coverage:

- **connection.test.ts**: PRAGMA settings, connection lifecycle
- **init.test.ts**: Schema creation, idempotency, table structure
- **storage.test.ts**: Conversation storage, transactions, error handling
- **search.test.ts**: FTS5 queries, relevance ranking, result formatting
- **queries.test.ts**: Structured queries, filters, date ranges
- **retrieval.test.ts**: Full conversation retrieval, relationship loading
- **integration.test.ts**: End-to-end workflows (store → search → retrieve)

### Writing Tests

All tests use in-memory databases for isolation:

```typescript
import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { openDatabase, closeDatabase } from "../connection";

describe("My Feature", () => {
  let db: Database;

  beforeEach(() => {
    db = openDatabase(":memory:");
    // Initialize schema...
  });

  afterEach(() => {
    closeDatabase(db);
  });

  test("should do something", () => {
    // Test implementation...
  });
});
```

---

## Troubleshooting

### Database Not Found

**Error:** `Database not found at: .claude/memory/conversations.db`

**Solution:**
```bash
bun cli-db-tool.ts init
```

---

### PRAGMA Settings Not Applied

**Symptoms:** Slow queries, high disk I/O

**Diagnosis:**
```typescript
import { openDatabase } from "./connection";

const db = openDatabase("/path/to/db");
console.log(db.query("PRAGMA cache_size").get());
console.log(db.query("PRAGMA journal_mode").get());
console.log(db.query("PRAGMA synchronous").get());
```

**Expected values:**
- `cache_size`: -64000
- `journal_mode`: wal
- `synchronous`: 1 (NORMAL)

---

### Full-Text Search Not Working

**Symptoms:** No search results despite data in database

**Diagnosis:**
```typescript
const db = openDatabase("/path/to/db");

// Check FTS tables exist
const tables = db.query(
  "SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%fts%'"
).all();
console.log(tables);

// Check FTS content
const ftsCount = db.query("SELECT COUNT(*) as count FROM messages_fts").get();
console.log(ftsCount);
```

**Solution:** Rebuild FTS tables if triggers failed:
```sql
DELETE FROM messages_fts;
INSERT INTO messages_fts (rowid, content)
  SELECT id, content FROM messages;

DELETE FROM delegations_fts;
INSERT INTO delegations_fts (rowid, product, process, performance)
  SELECT id, product, process, performance FROM delegations;
```

---

### Foreign Key Constraint Failed

**Error:** `FOREIGN KEY constraint failed`

**Cause:** Attempting to insert related data without parent conversation.

**Solution:** Ensure conversation exists before inserting related data:
```typescript
import { conversationExists } from "./retrieval";

if (!conversationExists(dbPath, conversationId)) {
  throw new Error(`Conversation ${conversationId} not found`);
}
```

---

### Transaction Rollback

**Symptoms:** Partial data not saved, "transaction aborted" errors

**Cause:** Error during multi-row insert causes full rollback (expected behavior).

**Solution:** Check for data validation errors before starting transaction:
```typescript
// Validate all data first
if (!parsed.messages || parsed.messages.length === 0) {
  throw new Error("No messages to store");
}

// Then store (transaction will succeed)
const conversationId = storeConversation(dbPath, parsed);
```

---

### Performance Degradation

**Symptoms:** Queries getting slower over time

**Diagnosis:**
```sql
-- Check database size
SELECT page_count * page_size as size FROM pragma_page_count(), pragma_page_size();

-- Check fragmentation
PRAGMA integrity_check;

-- Check index usage
EXPLAIN QUERY PLAN SELECT * FROM conversations WHERE primary_agent = 'maestro';
```

**Solutions:**

1. **Vacuum database** (reclaim space, reduce fragmentation):
```bash
sqlite3 conversations.db "VACUUM;"
```

2. **Analyze statistics** (update query planner statistics):
```bash
sqlite3 conversations.db "ANALYZE;"
```

3. **Rebuild indexes**:
```sql
REINDEX;
```

---

### WAL File Growing Large

**Symptoms:** `*-wal` file grows very large, taking up disk space

**Cause:** WAL checkpoint not running (normal with high write load).

**Solution:** Manually checkpoint WAL:
```typescript
const db = openDatabase("/path/to/db");
db.exec("PRAGMA wal_checkpoint(TRUNCATE);");
closeDatabase(db);
```

Or automate with periodic checkpoints:
```typescript
setInterval(() => {
  const db = openDatabase("/path/to/db");
  db.exec("PRAGMA wal_checkpoint(PASSIVE);");
  closeDatabase(db);
}, 60000); // Every minute
```

---

## Advanced Usage

### Batch Import

Import multiple conversations efficiently:

```typescript
import { storeConversation } from "./storage";
import { openDatabase, closeDatabase } from "./connection";

const db = openDatabase("/path/to/db");

try {
  db.exec("BEGIN TRANSACTION");

  for (const file of conversationFiles) {
    const parsed = JSON.parse(readFileSync(file, "utf-8"));
    storeConversation(dbPath, parsed);
  }

  db.exec("COMMIT");
} catch (err) {
  db.exec("ROLLBACK");
  throw err;
} finally {
  closeDatabase(db);
}
```

### Custom Queries

Execute custom SQL queries:

```typescript
import { openDatabase, closeDatabase } from "./connection";

const db = openDatabase("/path/to/db");

// Find conversations with high evaluation scores
const results = db.query(`
  SELECT c.id, c.primary_agent, COUNT(e.id) as eval_count
  FROM conversations c
  JOIN evaluations e ON c.id = e.conversation_id
  WHERE e.verdict = 'EXCELLENT'
  GROUP BY c.id
  ORDER BY eval_count DESC
  LIMIT 10
`).all();

closeDatabase(db);
```

### Export Data

Export conversations to JSON:

```typescript
import { getConversationById } from "./retrieval";
import { writeFileSync } from "fs";

const conversation = getConversationById("/path/to/db", "abc-123");
if (conversation) {
  writeFileSync(
    "export.json",
    JSON.stringify(conversation, null, 2)
  );
}
```

---

## Contributing

When contributing to the database module:

1. **Write tests first** - All new features need tests
2. **Maintain indexes** - Update schema.sql with new indexes
3. **Document changes** - Update this README with new APIs
4. **Preserve performance** - Don't remove PRAGMA optimizations
5. **Test migrations** - Ensure backwards compatibility

---

## License

Part of the Maestro framework. See main repository for license details.
