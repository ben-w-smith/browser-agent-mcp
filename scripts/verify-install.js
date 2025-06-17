#!/usr/bin/env node

import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("🔍 Verifying Browser Agent MCP Installation...\n");

// Check if dist/extension exists
const extensionPath = path.join(__dirname, "..", "dist", "extension");
const manifestPath = path.join(extensionPath, "manifest.json");

console.log("✅ Checking extension build...");
if (fs.existsSync(manifestPath)) {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  console.log(`   Extension v${manifest.version} ready`);
  console.log(`   📁 Extension path: ${extensionPath}`);
} else {
  console.log("❌ Extension not built. Run: npm run build");
  process.exit(1);
}

// Check if server build exists
const serverPath = path.join(__dirname, "..", "dist", "server", "index.js");
console.log("\n✅ Checking server build...");
if (fs.existsSync(serverPath)) {
  console.log("   Server build ready");
} else {
  console.log("❌ Server not built. Run: npm run build");
  process.exit(1);
}

// Test server startup (brief)
console.log("\n🚀 Testing server startup...");
const server = spawn("node", [serverPath], {
  stdio: ["pipe", "pipe", "pipe"],
  timeout: 3000,
});

let serverOutput = "";
server.stdout.on("data", (data) => {
  serverOutput += data.toString();
});

server.stderr.on("data", (data) => {
  serverOutput += data.toString();
});

setTimeout(() => {
  server.kill();

  if (serverOutput.includes("WebSocket server listening")) {
    console.log("✅ Server starts successfully");
    console.log(
      "\n🎉 Installation verified! Browser Agent MCP is ready to use."
    );
    console.log("\n📖 Next steps:");
    console.log("1. Load the Chrome extension from:", extensionPath);
    console.log("2. Configure your MCP client (see examples/ folder)");
    console.log("3. Start using browser automation commands!");
  } else {
    console.log("❌ Server startup test failed");
    console.log("Output:", serverOutput);
    process.exit(1);
  }
}, 2000);
