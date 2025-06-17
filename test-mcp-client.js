import { spawn } from "child_process";

// Test MCP server directly
console.log("🧪 Testing MCP server...");

const serverProcess = spawn("node", ["dist/server/index.js"], {
  stdio: ["pipe", "pipe", "pipe"],
});

// Send initialize request
const initMessage = {
  jsonrpc: "2.0",
  id: 1,
  method: "initialize",
  params: {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: {
      name: "test-client",
      version: "1.0.0",
    },
  },
};

console.log("📤 Sending initialize message...");
serverProcess.stdin.write(JSON.stringify(initMessage) + "\n");

// Send tools/list request
const toolsMessage = {
  jsonrpc: "2.0",
  id: 2,
  method: "tools/list",
  params: {},
};

setTimeout(() => {
  console.log("📤 Sending tools/list message...");
  serverProcess.stdin.write(JSON.stringify(toolsMessage) + "\n");
}, 1000);

serverProcess.stdout.on("data", (data) => {
  console.log("📥 Server response:", data.toString());
});

serverProcess.stderr.on("data", (data) => {
  console.log("❌ Server error:", data.toString());
});

serverProcess.on("close", (code) => {
  console.log("🔌 Server process closed with code:", code);
});

// Close after 5 seconds
setTimeout(() => {
  serverProcess.kill();
}, 5000);
