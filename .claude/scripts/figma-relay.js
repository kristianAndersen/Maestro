#!/usr/bin/env node
/**
 * Maestro Figma Relay — WebSocket pub/sub server
 * 
 * Works with both Bun and Node.js (22+).
 * Channels connect the bridge CLI ↔ Figma plugin.
 * 
 * Usage:
 *   bun figma-relay.js [--port=3055] [--quiet]
 *   node figma-relay.js [--port=3055] [--quiet]
 */

const args = Object.fromEntries(
  process.argv.slice(2)
    .filter(a => a.startsWith("--"))
    .map(a => { const m = a.match(/^--(\w+)(?:=(.+))?$/); return m ? [m[1], m[2] ?? true] : null; })
    .filter(Boolean)
);

const PORT = parseInt(args.port || "3055");
const QUIET = args.quiet === true;

const channels = new Map(); // channel → Set<ws>
const stats = { connections: 0, active: 0, messages: 0 };

function log(msg) { if (!QUIET) console.log(`[relay] ${msg}`); }

// ── Detect runtime and start appropriate server ──────────────

const isBun = typeof Bun !== "undefined";

if (isBun) {
  startBunServer();
} else {
  startNodeServer();
}

// ── Protocol handler (shared by both runtimes) ───────────────

function handleMessage(ws, raw, sendFn, closeFn) {
  stats.messages++;
  let data;
  try { data = JSON.parse(raw); } catch { return; }

  // JOIN
  if (data.type === "join") {
    const ch = data.channel;
    if (!ch || typeof ch !== "string") {
      sendFn(ws, JSON.stringify({ type: "error", message: "Channel name is required" }));
      return;
    }
    if (!channels.has(ch)) channels.set(ch, new Set());
    channels.get(ch).add(ws);
    ws._channel = ch;
    log(`join → #${ch} (${channels.get(ch).size} members)`);

    sendFn(ws, JSON.stringify({ type: "system", message: `Joined channel: ${ch}`, channel: ch }));
    sendFn(ws, JSON.stringify({ type: "system", message: { id: data.id, result: "Connected to channel: " + ch }, channel: ch }));
    broadcast(ch, ws, { type: "system", message: "A new client has joined the channel", channel: ch }, sendFn);
    return;
  }

  // MESSAGE
  if (data.type === "message") {
    const ch = data.channel;
    const members = channels.get(ch);
    if (!members || !members.has(ws)) {
      sendFn(ws, JSON.stringify({ type: "error", message: "You must join the channel first" }));
      return;
    }
    for (const client of members) {
      sendFn(client, JSON.stringify({
        type: "broadcast",
        message: data.message,
        sender: client === ws ? "You" : "User",
        channel: ch
      }));
    }
    return;
  }

  // PROGRESS
  if (data.type === "progress_update") {
    const members = channels.get(data.channel);
    if (!members) return;
    const payload = JSON.stringify(data);
    for (const client of members) sendFn(client, payload);
  }
}

function handleClose(ws) {
  stats.active--;
  const ch = ws._channel;
  log(`disconnect${ch ? ` from #${ch}` : ""}`);
  if (ch && channels.has(ch)) {
    channels.get(ch).delete(ws);
    if (channels.get(ch).size === 0) {
      channels.delete(ch);
      log(`channel #${ch} empty, removed`);
    }
  }
}

function broadcast(channel, exclude, data, sendFn) {
  const members = channels.get(channel);
  if (!members) return;
  const payload = JSON.stringify(data);
  for (const client of members) {
    if (client !== exclude) sendFn(client, payload);
  }
}

function statusResponse() {
  return JSON.stringify({ status: "running", port: PORT, channels: channels.size, uptime: Math.floor(process.uptime()), ...stats });
}

// ── Bun server ───────────────────────────────────────────────

function startBunServer() {
  Bun.serve({
    port: PORT,
    fetch(req, server) {
      const url = new URL(req.url);
      if (req.method === "OPTIONS") {
        return new Response(null, { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, OPTIONS" } });
      }
      if (url.pathname === "/status") {
        return new Response(statusResponse(), { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });
      }
      if (server.upgrade(req, { headers: { "Access-Control-Allow-Origin": "*" } })) return;
      return new Response("🎼 Maestro Figma Relay", { headers: { "Access-Control-Allow-Origin": "*" } });
    },
    websocket: {
      open(ws) { stats.connections++; stats.active++; ws._channel = null; log("connect"); ws.send(JSON.stringify({ type: "system", message: "Please join a channel" })); },
      message(ws, raw) { handleMessage(ws, raw, (w, d) => w.send(d)); },
      close(ws) { handleClose(ws); },
      drain() {}
    }
  });
  console.log(`🎼 Maestro Figma Relay running on ws://localhost:${PORT} (Bun)`);
  console.log(`   Status: http://localhost:${PORT}/status`);
}

// ── Node.js server ───────────────────────────────────────────

async function startNodeServer() {
  const http = await import("http");
  
  // Try to load ws package, fall back to instruction
  let WebSocketServer;
  try {
    const ws = await import("ws");
    WebSocketServer = ws.WebSocketServer || ws.default.WebSocketServer;
  } catch {
    console.error("Missing 'ws' package. Install it:");
    console.error("  npm install ws");
    console.error("  # or: npx -y ws  (one-shot)");
    console.error("\nAlternatively, use Bun which has WebSocket built-in:");
    console.error("  bun figma-relay.js");
    process.exit(1);
  }

  const server = http.createServer((req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    if (req.method === "OPTIONS") { res.writeHead(204); res.end(); return; }
    if (req.url === "/status") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(statusResponse());
      return;
    }
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("🎼 Maestro Figma Relay");
  });

  const wss = new WebSocketServer({ server });

  wss.on("connection", (ws) => {
    stats.connections++;
    stats.active++;
    ws._channel = null;
    log("connect");
    ws.send(JSON.stringify({ type: "system", message: "Please join a channel" }));

    ws.on("message", (raw) => {
      handleMessage(ws, raw.toString(), (w, d) => { if (w.readyState === 1) w.send(d); });
    });
    ws.on("close", () => handleClose(ws));
  });

  server.listen(PORT, () => {
    console.log(`🎼 Maestro Figma Relay running on ws://localhost:${PORT} (Node.js)`);
    console.log(`   Status: http://localhost:${PORT}/status`);
  });
}
