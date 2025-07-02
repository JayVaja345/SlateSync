const WebSocket = require("ws");
const http = require("http");

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("WebSocket server is running");
});

const wss = new WebSocket.Server({
  server,
  clientTracking: true,
  maxPayload: 1048576, // 1MB max payload
});

// Connection timeout (30 seconds)
const heartbeatInterval = 30000;

wss.on("connection", (ws) => {
  console.log("✅ New client connected");

  let heartbeat = setInterval(() => {
    if (ws.readyState === ws.OPEN) {
      ws.ping();
    }
  }, heartbeatInterval);

  ws.on("pong", () => {
    console.debug("❤️ Received heartbeat");
  });

  ws.on("close", () => {
    console.log("❌ Client disconnected");
    clearInterval(heartbeat);
  });

  ws.on("error", (error) => {
    console.error("⚠️ WebSocket error:", error);
  });
});

// Monitor connections
setInterval(() => {
  console.log(`📊 Active connections: ${wss.clients.size}`);
}, 5000);

server.listen(1234, () => {
  console.log("🚀 YJS WebSocket server running on ws://localhost:1234");
});
