import Database from 'better-sqlite3';
import { mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { homedir } from 'os';

const DB_DIR = join(homedir(), '.claude', 'ccchat');
const DB_PATH = join(DB_DIR, 'ccchat.db');

let db;

export function getDb() {
  if (db) return db;

  if (!existsSync(DB_DIR)) {
    mkdirSync(DB_DIR, { recursive: true });
  }

  db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS agents (
      name TEXT PRIMARY KEY,
      role TEXT NOT NULL DEFAULT 'peer',
      project_path TEXT,
      rooms TEXT NOT NULL DEFAULT '["general"]',
      first_seen TEXT NOT NULL DEFAULT (datetime('now')),
      last_seen TEXT NOT NULL DEFAULT (datetime('now')),
      online INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      seq INTEGER UNIQUE,
      type TEXT NOT NULL,
      from_agent TEXT,
      to_agent TEXT,
      room TEXT NOT NULL DEFAULT 'general',
      content TEXT,
      parent_id TEXT,
      question_id TEXT,
      timestamp TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS consensus (
      question_id TEXT PRIMARY KEY,
      room TEXT NOT NULL DEFAULT 'general',
      state TEXT NOT NULL DEFAULT 'open',
      proposed_answer_id TEXT,
      proposed_by TEXT,
      participants TEXT NOT NULL DEFAULT '[]',
      votes TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      timeout_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS read_cursors (
      agent_name TEXT NOT NULL,
      room TEXT NOT NULL,
      last_seq INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (agent_name, room)
    );

    CREATE INDEX IF NOT EXISTS idx_messages_room_seq ON messages(room, seq);
    CREATE INDEX IF NOT EXISTS idx_messages_question_id ON messages(question_id);
    CREATE INDEX IF NOT EXISTS idx_consensus_state ON consensus(state);
  `);

  return db;
}

// Sequence counter
export function nextSeq() {
  const d = getDb();
  const row = d.prepare('SELECT COALESCE(MAX(seq), 0) + 1 AS next FROM messages').get();
  return row.next;
}

// Messages
export function insertMessage({ type, from_agent, to_agent, room, content, parent_id, question_id }) {
  const d = getDb();
  const id = randomUUID();
  const seq = nextSeq();
  d.prepare(`
    INSERT INTO messages (id, seq, type, from_agent, to_agent, room, content, parent_id, question_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, seq, type, from_agent || null, to_agent || null, room || 'general', content, parent_id || null, question_id || null);
  return { id, seq };
}

export function getMessagesSince(sinceSeq, room, limit = 50) {
  const d = getDb();
  return d.prepare(`
    SELECT * FROM messages
    WHERE seq > ? AND room = ?
    ORDER BY seq ASC
    LIMIT ?
  `).all(sinceSeq, room, limit);
}

export function getMessage(id) {
  const d = getDb();
  return d.prepare('SELECT * FROM messages WHERE id = ?').get(id);
}

// Read cursors
export function getUnreadCount(agentName, room) {
  const d = getDb();
  const cursor = d.prepare('SELECT last_seq FROM read_cursors WHERE agent_name = ? AND room = ?').get(agentName, room);
  const lastSeq = cursor ? cursor.last_seq : 0;
  const row = d.prepare('SELECT COUNT(*) AS cnt FROM messages WHERE room = ? AND seq > ?').get(room, lastSeq);
  return row.cnt;
}

export function updateCursor(agentName, room, seq) {
  const d = getDb();
  d.prepare(`
    INSERT INTO read_cursors (agent_name, room, last_seq)
    VALUES (?, ?, ?)
    ON CONFLICT(agent_name, room) DO UPDATE SET last_seq = ?
  `).run(agentName, room, seq, seq);
}

export function getCursor(agentName, room) {
  const d = getDb();
  const row = d.prepare('SELECT last_seq FROM read_cursors WHERE agent_name = ? AND room = ?').get(agentName, room);
  return row ? row.last_seq : 0;
}

// Initialize cursor to current max seq if agent has no cursor for this room.
// This prevents new agents from seeing all historical messages.
export function initCursorIfNew(agentName, room) {
  const d = getDb();
  const existing = d.prepare('SELECT 1 FROM read_cursors WHERE agent_name = ? AND room = ?').get(agentName, room);
  if (!existing) {
    const maxSeq = d.prepare('SELECT COALESCE(MAX(seq), 0) AS seq FROM messages WHERE room = ?').get(room);
    d.prepare(`
      INSERT INTO read_cursors (agent_name, room, last_seq) VALUES (?, ?, ?)
    `).run(agentName, room, maxSeq.seq);
  }
}

// Agents
export function upsertAgent({ name, role, project_path, room }) {
  const d = getDb();

  // Get existing rooms and merge in the new one
  let rooms = ['general'];
  const existing = d.prepare('SELECT rooms FROM agents WHERE name = ?').get(name);
  if (existing) {
    try { rooms = JSON.parse(existing.rooms); } catch { rooms = ['general']; }
  }
  if (room && !rooms.includes(room)) rooms.push(room);

  d.prepare(`
    INSERT INTO agents (name, role, project_path, rooms, online, last_seen)
    VALUES (?, ?, ?, ?, 1, datetime('now'))
    ON CONFLICT(name) DO UPDATE SET
      role = ?,
      project_path = COALESCE(?, project_path),
      rooms = ?,
      online = 1,
      last_seen = datetime('now')
  `).run(name, role || 'peer', project_path || null, JSON.stringify(rooms), role || 'peer', project_path || null, JSON.stringify(rooms));
}

export function setAgentOffline(name) {
  const d = getDb();
  d.prepare('UPDATE agents SET online = 0, last_seen = datetime(\'now\') WHERE name = ?').run(name);
}

export function getOnlineAgents() {
  const d = getDb();
  // Agents are "active" if they have a live connection OR were seen in the last 10 minutes.
  // This handles script-based agents that connect briefly and disconnect.
  return d.prepare(`
    SELECT * FROM agents
    WHERE online = 1
       OR last_seen >= datetime('now', '-10 minutes')
  `).all();
}

export function getAllAgents() {
  const d = getDb();
  return d.prepare('SELECT * FROM agents').all();
}

export function removeAgent(name) {
  const d = getDb();
  d.prepare('DELETE FROM read_cursors WHERE agent_name = ?').run(name);
  d.prepare('DELETE FROM agents WHERE name = ?').run(name);
}

export function purgeStaleAgents(maxAgeMinutes = 60) {
  const d = getDb();
  d.prepare(`
    DELETE FROM agents
    WHERE online = 0
      AND last_seen < datetime('now', '-' || ? || ' minutes')
  `).run(maxAgeMinutes);
}

export function getAgentsByRoom(room) {
  // We track room membership via recent messages or join events
  // For simplicity, return online agents (room tracking is done via WebSocket connections)
  return getOnlineAgents();
}

// Consensus
export function createConsensus({ question_id, room, participants, timeout_minutes }) {
  const d = getDb();
  const timeout_at = new Date(Date.now() + (timeout_minutes || 5) * 60 * 1000).toISOString();
  d.prepare(`
    INSERT INTO consensus (question_id, room, state, participants, timeout_at)
    VALUES (?, ?, 'open', ?, ?)
  `).run(question_id, room || 'general', JSON.stringify(participants || []), timeout_at);
}

export function getConsensus(question_id) {
  const d = getDb();
  const row = d.prepare('SELECT * FROM consensus WHERE question_id = ?').get(question_id);
  if (row) {
    row.participants = JSON.parse(row.participants);
    row.votes = JSON.parse(row.votes);
  }
  return row;
}

export function getActiveConsensus(room) {
  const d = getDb();
  const rows = d.prepare("SELECT * FROM consensus WHERE room = ? AND state IN ('open', 'proposed', 'debating')").all(room || 'general');
  return rows.map(r => ({ ...r, participants: JSON.parse(r.participants), votes: JSON.parse(r.votes) }));
}

export function getAllActiveConsensus() {
  const d = getDb();
  const rows = d.prepare("SELECT * FROM consensus WHERE state IN ('open', 'proposed', 'debating')").all();
  return rows.map(r => ({ ...r, participants: JSON.parse(r.participants), votes: JSON.parse(r.votes) }));
}

export function updateConsensus(question_id, updates) {
  const d = getDb();
  const fields = [];
  const values = [];
  for (const [key, val] of Object.entries(updates)) {
    if (key === 'participants' || key === 'votes') {
      fields.push(`${key} = ?`);
      values.push(JSON.stringify(val));
    } else {
      fields.push(`${key} = ?`);
      values.push(val);
    }
  }
  fields.push("updated_at = datetime('now')");
  values.push(question_id);
  d.prepare(`UPDATE consensus SET ${fields.join(', ')} WHERE question_id = ?`).run(...values);
}

export function closeDb() {
  if (db) {
    db.close();
    db = null;
  }
}
