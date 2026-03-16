-- Maestro Memory System Database Schema
-- SQLite with FTS5 Full-Text Search Support
-- Version: v1
-- Created: 2025-12-16

-- =============================================================================
-- SCHEMA VERSION TRACKING
-- =============================================================================

-- Track schema versions for migration management
CREATE TABLE IF NOT EXISTS schema_version (
    version TEXT PRIMARY KEY,
    applied_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Insert initial version
INSERT INTO schema_version (version) VALUES ('v1');

-- =============================================================================
-- CORE TABLES
-- =============================================================================

-- conversations: Top-level container for each Maestro session/conversation
CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY,  -- UUID from session file
    timestamp TEXT NOT NULL,  -- ISO 8601 timestamp when conversation started
    duration_ms INTEGER,  -- Duration in milliseconds (calculated on completion)
    message_count INTEGER DEFAULT 0,  -- Total number of messages in conversation
    primary_agent TEXT,  -- Primary agent used (e.g., 'maestro', 'file-reader')
    skills_used TEXT,  -- JSON array of skill names used during conversation
    files_modified TEXT,  -- JSON array of file paths modified during conversation
    created_at TEXT NOT NULL DEFAULT (datetime('now'))  -- Record creation timestamp
);

-- Index for querying conversations by primary agent and time
CREATE INDEX idx_conversations_agent_timestamp
    ON conversations(primary_agent, timestamp);

-- Index for querying recent conversations
CREATE INDEX idx_conversations_created_at
    ON conversations(created_at DESC);

-- =============================================================================

-- messages: Individual messages within a conversation (user and assistant)
CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,  -- UUID for message
    conversation_id TEXT NOT NULL,  -- Foreign key to conversations
    role TEXT NOT NULL CHECK(role IN ('user', 'assistant')),  -- Message sender role
    content TEXT NOT NULL,  -- Full message content (for full-text search)
    timestamp TEXT NOT NULL,  -- ISO 8601 timestamp when message was created
    metadata TEXT,  -- JSON object with additional metadata (tool calls, attachments, etc.)

    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
);

-- Index for querying messages by conversation and time
CREATE INDEX idx_messages_conversation_timestamp
    ON messages(conversation_id, timestamp);

-- Index for querying by role
CREATE INDEX idx_messages_role
    ON messages(role);

-- =============================================================================

-- delegations: Track agent delegations using 3P format (PRODUCT, PROCESS, PERFORMANCE)
CREATE TABLE IF NOT EXISTS delegations (
    id TEXT PRIMARY KEY,  -- UUID for delegation
    conversation_id TEXT NOT NULL,  -- Foreign key to conversations
    message_id TEXT NOT NULL,  -- Foreign key to messages (where delegation occurred)
    agent_name TEXT NOT NULL,  -- Name of agent being delegated to
    product TEXT NOT NULL,  -- PRODUCT section: what to deliver
    process TEXT NOT NULL,  -- PROCESS section: how to work
    performance TEXT NOT NULL,  -- PERFORMANCE section: excellence criteria
    timestamp TEXT NOT NULL,  -- ISO 8601 timestamp when delegation was created

    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE
);

-- Index for querying delegations by agent and time
CREATE INDEX idx_delegations_agent_timestamp
    ON delegations(agent_name, timestamp);

-- Index for querying delegations by conversation
CREATE INDEX idx_delegations_conversation
    ON delegations(conversation_id, timestamp);

-- =============================================================================

-- evaluations: Track 4-D evaluation results for quality assessment
CREATE TABLE IF NOT EXISTS evaluations (
    id TEXT PRIMARY KEY,  -- UUID for evaluation
    conversation_id TEXT NOT NULL,  -- Foreign key to conversations
    message_id TEXT NOT NULL,  -- Foreign key to messages (evaluation content)
    verdict TEXT NOT NULL CHECK(verdict IN ('EXCELLENT', 'NEEDS_REFINEMENT')),  -- Final verdict
    product_score INTEGER CHECK(product_score BETWEEN 1 AND 10),  -- Product discernment score (1-10)
    process_score INTEGER CHECK(process_score BETWEEN 1 AND 10),  -- Process discernment score (1-10)
    performance_score INTEGER CHECK(performance_score BETWEEN 1 AND 10),  -- Performance discernment score (1-10)
    refinement_needed TEXT,  -- Specific refinement guidance if NEEDS_REFINEMENT
    timestamp TEXT NOT NULL,  -- ISO 8601 timestamp when evaluation was created

    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE
);

-- Index for querying evaluations by verdict
CREATE INDEX idx_evaluations_verdict
    ON evaluations(verdict);

-- Index for querying evaluations by conversation
CREATE INDEX idx_evaluations_conversation
    ON evaluations(conversation_id, timestamp);

-- Index for querying low-scoring evaluations
CREATE INDEX idx_evaluations_scores
    ON evaluations(product_score, process_score, performance_score);

-- =============================================================================

-- tool_calls: Track tool invocations during conversations
CREATE TABLE IF NOT EXISTS tool_calls (
    id TEXT PRIMARY KEY,  -- UUID for tool call
    conversation_id TEXT NOT NULL,  -- Foreign key to conversations
    message_id TEXT NOT NULL,  -- Foreign key to messages (where tool was called)
    tool_name TEXT NOT NULL,  -- Name of tool (e.g., 'Read', 'Write', 'Grep', 'Bash')
    parameters TEXT,  -- JSON object with tool parameters
    result TEXT,  -- JSON object with tool result/output
    success INTEGER NOT NULL DEFAULT 1 CHECK(success IN (0, 1)),  -- 1 if successful, 0 if failed
    timestamp TEXT NOT NULL,  -- ISO 8601 timestamp when tool was called

    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE
);

-- Index for querying tool calls by tool name
CREATE INDEX idx_tool_calls_tool_name
    ON tool_calls(tool_name, timestamp);

-- Index for querying tool calls by conversation
CREATE INDEX idx_tool_calls_conversation
    ON tool_calls(conversation_id, timestamp);

-- Index for querying failed tool calls
CREATE INDEX idx_tool_calls_success
    ON tool_calls(success);

-- =============================================================================
-- FTS5 FULL-TEXT SEARCH TABLES
-- =============================================================================

-- messages_fts: Full-text search index for message content
-- Uses unicode61 tokenizer with diacritics removal for better multilingual support
CREATE VIRTUAL TABLE IF NOT EXISTS messages_fts USING fts5(
    message_id UNINDEXED,  -- Reference to messages.id (not searchable)
    content,  -- Full message content (searchable)
    tokenize='unicode61 remove_diacritics 2'
);

-- delegations_fts: Full-text search index for delegation 3P sections
-- Allows searching across PRODUCT, PROCESS, and PERFORMANCE sections
CREATE VIRTUAL TABLE IF NOT EXISTS delegations_fts USING fts5(
    delegation_id UNINDEXED,  -- Reference to delegations.id (not searchable)
    agent_name,  -- Agent name (searchable)
    product,  -- PRODUCT section (searchable)
    process,  -- PROCESS section (searchable)
    performance,  -- PERFORMANCE section (searchable)
    tokenize='unicode61 remove_diacritics 2'
);

-- =============================================================================
-- TRIGGERS FOR FTS5 SYNCHRONIZATION
-- =============================================================================

-- Trigger: Sync messages_fts on INSERT
CREATE TRIGGER messages_fts_insert AFTER INSERT ON messages
BEGIN
    INSERT INTO messages_fts(message_id, content)
    VALUES (NEW.id, NEW.content);
END;

-- Trigger: Sync messages_fts on UPDATE
CREATE TRIGGER messages_fts_update AFTER UPDATE ON messages
BEGIN
    UPDATE messages_fts
    SET content = NEW.content
    WHERE message_id = NEW.id;
END;

-- Trigger: Sync messages_fts on DELETE
CREATE TRIGGER messages_fts_delete AFTER DELETE ON messages
BEGIN
    DELETE FROM messages_fts WHERE message_id = OLD.id;
END;

-- Trigger: Sync delegations_fts on INSERT
CREATE TRIGGER delegations_fts_insert AFTER INSERT ON delegations
BEGIN
    INSERT INTO delegations_fts(delegation_id, agent_name, product, process, performance)
    VALUES (NEW.id, NEW.agent_name, NEW.product, NEW.process, NEW.performance);
END;

-- Trigger: Sync delegations_fts on UPDATE
CREATE TRIGGER delegations_fts_update AFTER UPDATE ON delegations
BEGIN
    UPDATE delegations_fts
    SET agent_name = NEW.agent_name,
        product = NEW.product,
        process = NEW.process,
        performance = NEW.performance
    WHERE delegation_id = NEW.id;
END;

-- Trigger: Sync delegations_fts on DELETE
CREATE TRIGGER delegations_fts_delete AFTER DELETE ON delegations
BEGIN
    DELETE FROM delegations_fts WHERE delegation_id = OLD.id;
END;

-- =============================================================================
-- UTILITY VIEWS
-- =============================================================================

-- View: Recent conversations with aggregated stats
CREATE VIEW IF NOT EXISTS recent_conversations AS
SELECT
    c.id,
    c.timestamp,
    c.duration_ms,
    c.message_count,
    c.primary_agent,
    c.skills_used,
    c.files_modified,
    COUNT(DISTINCT e.id) AS evaluation_count,
    SUM(CASE WHEN e.verdict = 'EXCELLENT' THEN 1 ELSE 0 END) AS excellent_count,
    SUM(CASE WHEN e.verdict = 'NEEDS_REFINEMENT' THEN 1 ELSE 0 END) AS refinement_count
FROM conversations c
LEFT JOIN evaluations e ON c.id = e.conversation_id
GROUP BY c.id
ORDER BY c.timestamp DESC;

-- View: Agent performance summary
CREATE VIEW IF NOT EXISTS agent_performance AS
SELECT
    d.agent_name,
    COUNT(DISTINCT d.id) AS delegation_count,
    COUNT(DISTINCT e.id) AS evaluation_count,
    SUM(CASE WHEN e.verdict = 'EXCELLENT' THEN 1 ELSE 0 END) AS excellent_count,
    SUM(CASE WHEN e.verdict = 'NEEDS_REFINEMENT' THEN 1 ELSE 0 END) AS refinement_count,
    ROUND(AVG(e.product_score), 2) AS avg_product_score,
    ROUND(AVG(e.process_score), 2) AS avg_process_score,
    ROUND(AVG(e.performance_score), 2) AS avg_performance_score
FROM delegations d
LEFT JOIN evaluations e ON d.conversation_id = e.conversation_id
GROUP BY d.agent_name
ORDER BY delegation_count DESC;

-- View: Tool usage statistics
CREATE VIEW IF NOT EXISTS tool_usage_stats AS
SELECT
    tool_name,
    COUNT(*) AS total_calls,
    SUM(success) AS successful_calls,
    COUNT(*) - SUM(success) AS failed_calls,
    ROUND(100.0 * SUM(success) / COUNT(*), 2) AS success_rate
FROM tool_calls
GROUP BY tool_name
ORDER BY total_calls DESC;

-- =============================================================================
-- SAMPLE QUERIES (for testing and reference)
-- =============================================================================

-- Query 1: Full-text search for messages containing "delegation"
-- SELECT m.* FROM messages m
-- JOIN messages_fts fts ON m.id = fts.message_id
-- WHERE messages_fts MATCH 'delegation'
-- ORDER BY m.timestamp DESC;

-- Query 2: Find delegations to specific agent with keyword in PRODUCT
-- SELECT d.* FROM delegations d
-- JOIN delegations_fts fts ON d.id = fts.delegation_id
-- WHERE delegations_fts MATCH 'agent_name:file-writer AND product:schema'
-- ORDER BY d.timestamp DESC;

-- Query 3: Get conversation with all messages and delegations
-- SELECT c.*, m.role, m.content, d.agent_name, d.product
-- FROM conversations c
-- LEFT JOIN messages m ON c.id = m.conversation_id
-- LEFT JOIN delegations d ON c.id = d.conversation_id
-- WHERE c.id = ?
-- ORDER BY m.timestamp, d.timestamp;

-- Query 4: Find conversations where specific skill was used
-- SELECT * FROM conversations
-- WHERE json_extract(skills_used, '$') LIKE '%write%'
-- ORDER BY timestamp DESC;

-- Query 5: Get evaluation trends over time
-- SELECT
--     DATE(timestamp) as eval_date,
--     verdict,
--     COUNT(*) as count,
--     AVG(product_score) as avg_product,
--     AVG(process_score) as avg_process,
--     AVG(performance_score) as avg_performance
-- FROM evaluations
-- GROUP BY DATE(timestamp), verdict
-- ORDER BY eval_date DESC;

-- =============================================================================
-- END OF SCHEMA
-- =============================================================================
