require("dotenv").config();
const express = require("express");
const http = require("http");
const app = express();
require("./Config/db");
const cors = require("cors");
const router = require("./Routes/Router");
const { WebSocketServer } = require("ws");
const Y = require("yjs");

const port = process.env.PORT || 6000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(router);

// Create HTTP server
const server = http.createServer(app);

// ==================== YJS Collaboration Server ====================
const wss = new WebSocketServer({ noServer: true });
const docs = new Map(); // Store Y.Doc instances by room ID

// Handle WebSocket upgrades
server.on("upgrade", (request, socket, head) => {
  const pathname = request.url.split("?")[0];

  // Verify correct path format: /api/collaboration/{roomId}
  const pathParts = pathname.split("/").filter(Boolean);
  if (
    pathParts.length !== 3 ||
    pathParts[0] !== "api" ||
    pathParts[1] !== "collaboration"
  ) {
    console.error("Invalid WebSocket path:", pathname);
    socket.write("HTTP/1.1 400 Bad Request\r\n\r\n");
    socket.destroy();
    return;
  }

  const roomId = pathParts[2];
  const token = new URLSearchParams(request.url.split("?")[1]).get("token");

  if (!token) {
    console.error("No token provided");
    socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
    socket.destroy();
    return;
  }

  // Verify token (pseudo-code)
  try {
    // jwt.verify(token, process.env.JWT_SECRET)
    wss.handleUpgrade(request, socket, head, (ws) => {
      // Get or create Y.Doc for this room
      if (!docs.has(roomId)) {
        docs.set(roomId, new Y.Doc());
      }
      const ydoc = docs.get(roomId);

      // Store room ID on the connection
      ws.roomId = roomId;
      ws.ydoc = ydoc;

      wss.emit("connection", ws, request);
      console.log(`✅ Client connected to room ${roomId}`);
    });
  } catch (err) {
    console.error("Invalid token:", err);
    socket.write("HTTP/1.1 403 Forbidden\r\n\r\n");
    socket.destroy();
  }
});

// Handle WebSocket connections
wss.on("connection", (ws) => {
  console.log(`Client connected to room ${ws.roomId}`);

  // Forward messages to all clients in the same room
  ws.on("message", (message) => {
    wss.clients.forEach((client) => {
      if (client !== ws && client.roomId === ws.roomId) {
        client.send(message);
      }
    });
  });

  ws.on("close", () => {
    console.log(`❌ Client disconnected from room ${ws.roomId}`);

    // Clean up if no more clients in this room
    const clientsInRoom = Array.from(wss.clients).filter(
      (client) => client.roomId === ws.roomId
    ).length;

    if (clientsInRoom === 0) {
      docs.delete(ws.roomId);
      console.log(`🧹 Cleaned up room ${ws.roomId}`);
    }
  });

  ws.on("error", (error) => {
    console.error(`WebSocket error in room ${ws.roomId}:`, error);
  });
});
// ================================================================

// Start server
server.listen(port, () => {
  console.log(`
  Server is running on port ${port}
  Main API: http://localhost:${port}
  YJS WebSocket: ws://localhost:${port}/api/collaboration/{roomId}
  `);
});
