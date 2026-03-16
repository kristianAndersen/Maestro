import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';
import { writeFileSync, mkdirSync, existsSync, unlinkSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { randomUUID } from 'crypto';
import {
  getDb, insertMessage, getMessagesSince, getMessage,
  upsertAgent, setAgentOffline, getOnlineAgents, getAllAgents,
  removeAgent, purgeStaleAgents,
  getUnreadCount, updateCursor, getCursor, initCursorIfNew,
  createConsensus, getConsensus, getActiveConsensus, getAllActiveConsensus,
  closeDb,
} from './db.js';
import { proposeAnswer, castVote, checkTimeouts } from './consensus.js';

const PORT = parseInt(process.env.CCCHAT_PORT || '3737', 10);
const PID_DIR = join(homedir(), '.claude', 'ccchat');
const PID_FILE = join(PID_DIR, 'server.pid');
const IDLE_TIMEOUT = 4 * 60 * 60 * 1000; // 4 hours
const PING_INTERVAL = 30_000;

// Track connections: Map<WebSocket, { name, rooms: Set<string> }>
const clients = new Map();
// Track rooms: Map<room, Set<WebSocket>>
const rooms = new Map();
// Track recent joins to suppress duplicate announcements: Map<"name:room", timestamp>
const recentJoins = new Map();

let lastActivity = Date.now();

function touch() { lastActivity = Date.now(); }

// Initialize DB
getDb();

// HTTP server for health/status endpoints
const httpServer = createServer((req, res) => {
  touch();
  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('OK');
    return;
  }
  if (req.method === 'GET' && req.url === '/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    purgeStaleAgents(10);
    const agents = getOnlineAgents();
    const activeRooms = [...rooms.keys()];
    const consensus = getAllActiveConsensus();
    res.end(JSON.stringify({ agents, rooms: activeRooms, consensus }, null, 2));
    return;
  }
  res.writeHead(404);
  res.end('Not found');
});

const wss = new WebSocketServer({ server: httpServer });

function broadcast(room, message, excludeWs) {
  const roomClients = rooms.get(room);
  if (!roomClients) return;
  const data = JSON.stringify(message);
  for (const ws of roomClients) {
    if (ws !== excludeWs && ws.readyState === WebSocket.OPEN) {
      ws.send(data);
    }
  }
}

function joinRoom(ws, room) {
  if (!rooms.has(room)) rooms.set(room, new Set());
  rooms.get(room).add(ws);
  const info = clients.get(ws);
  if (info) info.rooms.add(room);
}

function leaveRoom(ws, room) {
  const roomClients = rooms.get(room);
  if (roomClients) {
    roomClients.delete(ws);
    if (roomClients.size === 0) rooms.delete(room);
  }
  const info = clients.get(ws);
  if (info) info.rooms.delete(room);
}

function handleMessage(ws, data) {
  touch();
  let msg;
  try {
    msg = JSON.parse(data);
  } catch {
    ws.send(JSON.stringify({ type: 'error', error: 'Invalid JSON' }));
    return;
  }

  const info = clients.get(ws);

  switch (msg.type) {
    case 'join': {
      const name = msg.name;
      const role = msg.role || 'peer';
      const room = msg.room || 'general';
      const project_path = msg.project_path || null;

      clients.set(ws, { name, rooms: new Set(), listener: !!msg.listener });
      joinRoom(ws, room);
      // Listeners (e.g. background watchers) join the room to receive messages
      // but don't register as an agent or mark themselves online
      if (!msg.listener) {
        upsertAgent({ name, role, project_path, room });
        // New agents in long-running rooms start with cursor at current max
        // to avoid historical message flood. Skip for ephemeral rooms (council-*)
        // where members need to see the question posted before they joined.
        if (!room.startsWith('council-')) {
          initCursorIfNew(name, room);
        }
      }

      // Get agents in this room
      const roomAgents = [];
      const roomClients = rooms.get(room);
      if (roomClients) {
        for (const c of roomClients) {
          const ci = clients.get(c);
          if (ci && ci.name !== name) roomAgents.push(ci.name);
        }
      }

      const unread = getUnreadCount(name, room);
      ws.send(JSON.stringify({ type: 'joined', name, room, agents: roomAgents, unread }));

      // Only announce if not silent AND not a duplicate join within 60s
      if (!msg.silent) {
        const joinKey = `${name}:${room}`;
        const lastJoin = recentJoins.get(joinKey) || 0;
        const now = Date.now();
        if (now - lastJoin > 60_000) {
          broadcast(room, { type: 'agent_joined', name, role, room }, ws);
          insertMessage({ type: 'system', from_agent: name, room, content: `${name} joined ${room}` });
        }
        recentJoins.set(joinKey, now);
      }
      break;
    }

    case 'message': {
      if (!info) { ws.send(JSON.stringify({ type: 'error', error: 'Not joined' })); return; }
      const room = msg.room || 'general';
      const { id, seq } = insertMessage({
        type: 'message',
        from_agent: info.name,
        to_agent: msg.to || null,
        room,
        content: msg.content,
        parent_id: msg.parent_id || null,
      });
      const messageData = { id, seq, type: 'message', from_agent: info.name, to_agent: msg.to || null, content: msg.content, room, timestamp: new Date().toISOString() };
      // Send ack to sender
      ws.send(JSON.stringify({ type: 'message_sent', message: messageData }));
      // Broadcast to others
      broadcast(room, { type: 'deliver', message: messageData }, ws);
      break;
    }

    case 'question': {
      if (!info) { ws.send(JSON.stringify({ type: 'error', error: 'Not joined' })); return; }
      const room = msg.room || 'general';
      const question_id = `q-${randomUUID().slice(0, 8)}`;
      const { id, seq } = insertMessage({
        type: 'question',
        from_agent: info.name,
        room,
        content: msg.content,
        question_id,
      });

      // Determine participants
      let participants = [];
      if (msg.participants) {
        participants = msg.participants;
      } else {
        // All agents currently in the room
        const roomClients = rooms.get(room);
        if (roomClients) {
          for (const c of roomClients) {
            const ci = clients.get(c);
            if (ci && ci.name !== info.name) participants.push(ci.name);
          }
        }
      }

      createConsensus({
        question_id,
        room,
        participants,
        timeout_minutes: msg.timeout_minutes || 5,
      });

      const deliverMsg = {
        type: 'deliver',
        message: { id, seq, type: 'question', from_agent: info.name, content: msg.content, room, question_id, timestamp: new Date().toISOString() },
      };
      broadcast(room, deliverMsg, null);
      ws.send(JSON.stringify({ type: 'question_created', question_id, participants }));
      break;
    }

    case 'answer': {
      if (!info) { ws.send(JSON.stringify({ type: 'error', error: 'Not joined' })); return; }
      const { question_id, content } = msg;
      const consensus = getConsensus(question_id);
      if (!consensus) { ws.send(JSON.stringify({ type: 'error', error: 'Unknown question' })); return; }

      const { id, seq } = insertMessage({
        type: 'answer',
        from_agent: info.name,
        room: consensus.room,
        content,
        question_id,
      });

      try {
        const updated = proposeAnswer(question_id, id, info.name);
        broadcast(consensus.room, {
          type: 'deliver',
          message: { id, seq, type: 'answer', from_agent: info.name, content, room: consensus.room, question_id, timestamp: new Date().toISOString() },
        }, null);
        broadcast(consensus.room, {
          type: 'consensus_update',
          question_id,
          state: updated.state,
          proposed_by: info.name,
          votes: updated.votes,
        }, null);
      } catch (e) {
        ws.send(JSON.stringify({ type: 'error', error: e.message }));
      }
      break;
    }

    case 'agree':
    case 'disagree': {
      if (!info) { ws.send(JSON.stringify({ type: 'error', error: 'Not joined' })); return; }
      const { question_id, reason } = msg;
      try {
        const updated = castVote(question_id, info.name, msg.type, reason);
        broadcast(updated.room, {
          type: 'consensus_update',
          question_id,
          state: updated.state,
          votes: updated.votes,
        }, null);
      } catch (e) {
        ws.send(JSON.stringify({ type: 'error', error: e.message }));
      }
      break;
    }

    case 'read': {
      if (!info) { ws.send(JSON.stringify({ type: 'error', error: 'Not joined' })); return; }
      const room = msg.room || 'general';
      const sinceSeq = msg.since_seq ?? getCursor(info.name, room);
      const limit = msg.limit || 50;
      const messages = getMessagesSince(sinceSeq, room, limit);
      const has_more = messages.length === limit;

      // Update read cursor
      if (messages.length > 0) {
        const maxSeq = messages[messages.length - 1].seq;
        updateCursor(info.name, room, maxSeq);
      }

      ws.send(JSON.stringify({ type: 'read_response', messages, has_more, room }));
      break;
    }

    case 'status': {
      // Purge agents offline for more than 10 minutes on each status query
      purgeStaleAgents(10);
      const agents = getOnlineAgents();
      const activeRooms = [...rooms.keys()];
      const consensus = getAllActiveConsensus();
      ws.send(JSON.stringify({ type: 'status_response', agents, rooms: activeRooms, consensus }));
      break;
    }

    case 'leave': {
      // Explicit leave — remove agent from DB entirely
      const leaveName = msg.name || info?.name;
      if (leaveName) {
        removeAgent(leaveName);
        for (const room of (info?.rooms || [])) {
          broadcast(room, { type: 'agent_left', name: leaveName, room }, ws);
          leaveRoom(ws, room);
        }
        if (info) info.name = null;
      }
      ws.send(JSON.stringify({ type: 'left', name: leaveName }));
      break;
    }

    case 'ping': {
      ws.send(JSON.stringify({ type: 'pong' }));
      break;
    }

    default:
      ws.send(JSON.stringify({ type: 'error', error: `Unknown type: ${msg.type}` }));
  }
}

wss.on('connection', (ws) => {
  touch();
  clients.set(ws, { name: null, rooms: new Set() });

  ws.on('message', (data) => handleMessage(ws, data.toString()));

  ws.on('close', () => {
    const info = clients.get(ws);
    if (info && info.name) {
      // Listeners (background watchers) don't affect agent online status
      if (!info.listener) {
        setAgentOffline(info.name);
        for (const room of info.rooms) {
          broadcast(room, { type: 'agent_left', name: info.name, room }, ws);
        }
      }
      for (const room of info.rooms) {
        leaveRoom(ws, room);
      }
    }
    clients.delete(ws);
  });

  ws.on('error', () => {
    // handled by close
  });
});

// Ping/pong
const pingTimer = setInterval(() => {
  for (const ws of clients.keys()) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.ping();
    }
  }
}, PING_INTERVAL);

// Consensus timeout checker
const timeoutTimer = setInterval(async () => {
  try {
    const timedOut = await checkTimeouts();
    for (const qid of timedOut) {
      const c = getConsensus(qid);
      if (c) {
        broadcast(c.room, { type: 'consensus_update', question_id: qid, state: 'timeout', votes: c.votes }, null);
      }
    }
  } catch { /* ignore */ }
}, 30_000);

// Idle auto-shutdown
const idleTimer = setInterval(() => {
  if (Date.now() - lastActivity > IDLE_TIMEOUT && clients.size <= 1) {
    console.log('Idle timeout reached, shutting down.');
    shutdown();
  }
}, 60_000);

function shutdown() {
  clearInterval(pingTimer);
  clearInterval(timeoutTimer);
  clearInterval(idleTimer);
  for (const ws of clients.keys()) {
    ws.close();
  }
  wss.close();
  httpServer.close();
  closeDb();
  try { unlinkSync(PID_FILE); } catch { /* ok */ }
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Write PID file
if (!existsSync(PID_DIR)) mkdirSync(PID_DIR, { recursive: true });
writeFileSync(PID_FILE, String(process.pid));

httpServer.listen(PORT, '127.0.0.1', () => {
  console.log(`ccchat server running on ws://127.0.0.1:${PORT} (pid: ${process.pid})`);
});
