#!/usr/bin/env node
/**
 * Figma Bridge — WebSocket client for Maestro's Figma agent
 * 
 * Single command:
 *   bun figma-bridge.js --channel=<id> --command=<name> [--params='<json>'] [--fields=<paths>] [--maxDepth=<n>] [--maxSize=<bytes>]
 * 
 * Batch mode (stdin):
 *   echo '[{"id":"c1","command":"get_document_info"},{"id":"c2","command":"get_selection"}]' | bun figma-bridge.js --channel=<id> --batch
 * 
 * Batch items can include per-command: { id, command, params, fields, maxDepth }
 */

const RELAY_URL = process.env.FIGMA_RELAY_URL || "ws://localhost:3055";
const TIMEOUTS = {
  connect: 10_000,
  join: 12_000,
  default: 60_000,
  export: 120_000,
  image: 60_000,
};

function parseArgs() {
  const args = {};
  for (const arg of process.argv.slice(2)) {
    const match = arg.match(/^--(\w+)=(.+)$/);
    if (match) args[match[1]] = match[2];
    else if (arg.startsWith("--")) args[arg.slice(2)] = true;
  }
  return args;
}

function getTimeout(command) {
  if (command === "join") return TIMEOUTS.join;
  if (command === "export_node_as_image" || command === "get_svg") return TIMEOUTS.export;
  if (command.startsWith("set_image") || command.startsWith("replace_image")) return TIMEOUTS.image;
  return TIMEOUTS.default;
}

function output(data) { console.log(JSON.stringify(data, null, 2)); }
function done(data) { output(data); process.exit(0); }
function fail(message, details) { output({ error: message, ...details }); process.exit(1); }

// --- Response trimming ---

function trimDepth(obj, maxDepth, current = 0) {
  if (current >= maxDepth) {
    if (Array.isArray(obj)) return `[...${obj.length} items]`;
    if (typeof obj === "object" && obj !== null) return `{...${Object.keys(obj).length} keys}`;
    return obj;
  }
  if (Array.isArray(obj)) return obj.map(item => trimDepth(item, maxDepth, current + 1));
  if (typeof obj === "object" && obj !== null) {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [k, trimDepth(v, maxDepth, current + 1)])
    );
  }
  return obj;
}

function getPath(obj, parts) {
  let current = obj;
  for (const part of parts) {
    if (part.endsWith("[]")) {
      const key = part.slice(0, -2);
      current = current?.[key];
      if (!Array.isArray(current)) return undefined;
      // Continue with array — next parts apply to each element
      const remaining = parts.slice(parts.indexOf(part) + 1);
      if (remaining.length === 0) return current;
      return current.map(item => getPath(item, remaining)).filter(v => v !== undefined);
    }
    current = current?.[part];
    if (current === undefined) return undefined;
  }
  return current;
}

function projectFields(obj, spec) {
  if (!spec || !obj) return obj;
  const fields = spec.split(",").map(f => f.trim());
  const result = {};
  for (const field of fields) {
    const parts = field.split(".");
    const value = getPath(obj, parts);
    if (value !== undefined) {
      // Simple: set at top level with the leaf key name
      const key = parts[parts.length - 1].replace("[]", "");
      result[key] = value;
    }
  }
  return result;
}

function applyTrimming(data, opts) {
  if (!data) return data;
  let result = data;
  if (opts.fields) result = projectFields(result, opts.fields);
  else if (opts.maxDepth != null) result = trimDepth(result, parseInt(opts.maxDepth));
  
  if (opts.maxSize) {
    const json = JSON.stringify(result);
    const max = parseInt(opts.maxSize);
    if (json.length > max) {
      return {
        _truncated: true,
        _originalSize: json.length,
        _maxSize: max,
        _hint: "Use --fields or --maxDepth to reduce response size",
      };
    }
  }
  return result;
}

// --- Stdin reader for batch mode ---

async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8").trim();
}

// --- Main ---

async function main() {
  const args = parseArgs();
  if (!args.channel) fail("Missing --channel argument");

  const channel = args.channel;
  const isBatch = args.batch === true;

  let commands;
  if (isBatch) {
    const raw = await readStdin();
    try { commands = JSON.parse(raw); } catch (e) { fail("Invalid batch JSON from stdin", { parseError: e.message }); }
    if (!Array.isArray(commands)) fail("Batch input must be a JSON array");
    // Ensure all have IDs
    commands = commands.map((c, i) => ({ id: c.id || `cmd-${i}`, ...c }));
  } else {
    if (!args.command) fail("Missing --command argument");
    let params = {};
    if (args.params) {
      try { params = JSON.parse(args.params); } catch (e) { fail("Invalid JSON in --params", { parseError: e.message }); }
    }
    commands = [{
      id: crypto.randomUUID(),
      command: args.command,
      params,
      fields: args.fields,
      maxDepth: args.maxDepth != null ? parseInt(args.maxDepth) : undefined,
      maxSize: args.maxSize,
    }];
  }

  // Connect
  let ws;
  try { ws = new WebSocket(RELAY_URL); } catch (e) { fail("Cannot create WebSocket", { error: e.message }); }

  const connectTimeout = setTimeout(() => fail("Connection timeout", { timeoutMs: TIMEOUTS.connect }), TIMEOUTS.connect);

  const joinId = crypto.randomUUID();
  let finished = false;

  // Batch timeout = max of all individual timeouts
  const batchTimeoutMs = Math.max(...commands.map(c => getTimeout(c.command)));
  let batchTimer = null;

  // Pending responses for batch
  const pending = new Map();
  const results = {};

  function checkBatchComplete() {
    if (pending.size === 0 && !finished) {
      finished = true;
      if (batchTimer) clearTimeout(batchTimer);
      
      if (isBatch) {
        const succeeded = Object.values(results).filter(r => r.success).length;
        done({ batchResults: results, summary: { total: commands.length, succeeded, failed: commands.length - succeeded } });
      } else {
        done(Object.values(results)[0]);
      }
    }
  }

  ws.onopen = () => {
    clearTimeout(connectTimeout);
    ws.send(JSON.stringify({
      id: joinId, type: "join", channel,
      message: { id: joinId, command: "join", params: { channel, commandId: joinId } }
    }));
  };

  ws.onmessage = (event) => {
    if (finished) return;
    let data;
    try { data = JSON.parse(event.data); } catch { return; }

    // Join confirmation
    if (data.type === "system") {
      const msg = data.message;
      if (typeof msg === "object" && msg.id === joinId) {
        // If command is "join", we're done
        if (commands.length === 1 && commands[0].command === "join") {
          finished = true;
          done({ success: true, channel, message: msg.result || "Joined" });
          return;
        }

        // Fire all commands
        for (const cmd of commands) {
          const cmdId = cmd.id;
          pending.set(cmdId, { meta: cmd });
          ws.send(JSON.stringify({
            id: cmdId, type: "message", channel,
            message: { id: cmdId, command: cmd.command, params: { ...(cmd.params || {}), commandId: cmdId } }
          }));
        }

        // Start batch timeout
        batchTimer = setTimeout(() => {
          if (!finished) {
            finished = true;
            // Resolve remaining as timeouts
            for (const [id, entry] of pending) {
              results[id] = { error: "timeout", command: entry.meta.command };
            }
            const succeeded = Object.values(results).filter(r => r.success).length;
            if (isBatch) {
              done({ batchResults: results, summary: { total: commands.length, succeeded, failed: commands.length - succeeded } });
            } else {
              done(Object.values(results)[0]);
            }
          }
        }, batchTimeoutMs);
      }
      return;
    }

    // Broadcast responses
    if (data.type === "broadcast") {
      let msg = data.message;
      if (typeof msg === "string") { try { msg = JSON.parse(msg); } catch { return; } }
      if (msg?.command) return; // self-echo

      const entry = pending.get(msg?.id);
      if (!entry) return;

      const trimOpts = {
        fields: entry.meta.fields,
        maxDepth: entry.meta.maxDepth,
        maxSize: entry.meta.maxSize,
      };

      if (msg.error) {
        results[msg.id] = { error: msg.error, command: entry.meta.command };
      } else if (msg.result?.error) {
        results[msg.id] = { error: msg.result.error, command: entry.meta.command };
      } else {
        const trimmed = applyTrimming(msg.result, trimOpts);
        results[msg.id] = { success: true, command: entry.meta.command, result: trimmed };
      }

      pending.delete(msg.id);
      checkBatchComplete();
    }
  };

  ws.onerror = (err) => {
    if (!finished) fail("WebSocket error", { error: err.message || "Connection failed" });
  };

  ws.onclose = () => {
    if (!finished) fail("WebSocket closed before commands completed");
  };
}

main().catch(e => fail("Unexpected error", { error: e.message }));
