import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";

export const ydoc = new Y.Doc();

export const getProvider = (roomId) => {
  const token = localStorage.getItem("token");

  // Fixed URL construction - removed duplicate room ID
  const wsUrl =
    process.env.NODE_ENV === "production"
      ? `wss://yourdomain.com/api/collaboration`
      : `ws://localhost:6060/api/collaboration`;

  console.log(`🔄 Connecting to YJS server at ${wsUrl}`);

  const provider = new WebsocketProvider(wsUrl, roomId, ydoc, {
    connect: true,
    params: { token },
    maxRetries: 3,
    resyncInterval: 5000,
  });

  // Enhanced error handling
  provider.on("status", (event) => {
    console.log("🔌 Connection status:", event.status);
    if (event.status === "disconnected") {
      console.warn("Disconnected - attempting to reconnect...");
    }
  });

  provider.on("connection-error", (error) => {
    console.error("❌ WebSocket error:", error);
    if (error.message.includes("failed")) {
      console.warn("Network error detected - will retry");
    }
  });

  return {
    provider,
    destroy: () => {
      try {
        provider.destroy();
        console.log("🧹 Cleaned up WebSocket provider");
      } catch (e) {
        console.error("Error cleaning up provider:", e);
      }
    },
  };
};
