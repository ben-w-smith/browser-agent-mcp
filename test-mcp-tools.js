// Simple test to verify MCP tools work
import WebSocket from "ws";

async function testMCPTools() {
  console.log("🧪 Testing MCP Server Tools...");

  // Connect to the WebSocket server
  const ws = new WebSocket("ws://localhost:3000");

  ws.on("open", async () => {
    console.log("✅ Connected to MCP WebSocket server");

    // Test DOM query tool
    const domQuery = {
      method: "dom_query",
      params: {
        selector: "body",
        action: "query",
      },
      id: "test-1",
    };

    console.log("📤 Sending DOM query:", domQuery);
    ws.send(JSON.stringify(domQuery));
  });

  ws.on("message", (data) => {
    const message = JSON.parse(data.toString());
    console.log("📥 Received response:", message);
  });

  ws.on("error", (error) => {
    console.error("❌ WebSocket error:", error);
  });

  ws.on("close", () => {
    console.log("🔌 WebSocket connection closed");
  });
}

testMCPTools();
