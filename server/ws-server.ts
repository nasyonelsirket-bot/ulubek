import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import type { LiveEvent } from "../src/lib/live/types";

const PORT = parseInt(process.env.WS_PORT || "3001", 10);
const SECRET = process.env.WS_BROADCAST_SECRET || "ulubek-ws-dev-secret";

const clients = new Set<WebSocket>();

function broadcast(event: LiveEvent) {
  const payload = JSON.stringify(event);
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  }
}

function readBody(req: import("http").IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks).toString()));
    req.on("error", reject);
  });
}

const httpServer = createServer(async (req, res) => {
  if (req.method === "POST" && req.url === "/broadcast") {
    const auth = req.headers.authorization;
    if (auth !== `Bearer ${SECRET}`) {
      res.writeHead(401);
      res.end("Unauthorized");
      return;
    }

    try {
      const body = await readBody(req);
      const event = JSON.parse(body) as LiveEvent;
      broadcast(event);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: true, clients: clients.size }));
    } catch {
      res.writeHead(400);
      res.end("Invalid JSON");
    }
    return;
  }

  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true, clients: clients.size }));
    return;
  }

  res.writeHead(404);
  res.end("Not found");
});

const wss = new WebSocketServer({ server: httpServer, path: "/live" });

wss.on("connection", (ws) => {
  clients.add(ws);

  ws.send(
    JSON.stringify({
      type: "CONNECTED",
      timestamp: new Date().toISOString(),
    } satisfies LiveEvent)
  );

  ws.on("close", () => clients.delete(ws));
  ws.on("error", () => clients.delete(ws));
});

setInterval(() => {
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.ping();
    }
  }
}, 30000);

httpServer.listen(PORT, () => {
  console.log(`[WS] Son dakika sunucusu: ws://localhost:${PORT}/live`);
  console.log(`[WS] Broadcast API: http://localhost:${PORT}/broadcast`);
});
