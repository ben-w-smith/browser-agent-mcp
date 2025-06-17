#!/usr/bin/env node

import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const extensionPath = path.join(__dirname, "..", "dist", "extension");
const manifestPath = path.join(extensionPath, "manifest.json");

console.log("\n🎉 Browser Agent MCP installed successfully!\n");

// Check if extension is built
if (fs.existsSync(manifestPath)) {
  console.log("✅ Chrome extension is ready to load");
  console.log(`📁 Extension location: ${extensionPath}`);
} else {
  console.log("⚠️  Chrome extension needs to be built");
  console.log("   Run: npm run build");
}

console.log("\n📖 Setup Instructions:");
console.log("1. Load the Chrome extension:");
console.log("   • Open chrome://extensions/");
console.log('   • Enable "Developer mode"');
console.log('   • Click "Load unpacked" and select:');
console.log(`     ${extensionPath}`);
console.log("");
console.log("2. Start the MCP server:");
console.log("   • Run: npx browser-agent-mcp");
console.log("   • Or: npm start");
console.log("");
console.log("3. Add to your MCP client config (e.g., Cursor):");
console.log("   {");
console.log('     "mcpServers": {');
console.log('       "browser-agent": {');
console.log('         "command": "npx",');
console.log('         "args": ["browser-agent-mcp"]');
console.log("       }");
console.log("     }");
console.log("   }");
console.log("");
console.log(
  "📚 Documentation: https://github.com/ben-w-smith/browser-agent-mcp"
);
console.log(
  "🐛 Issues: https://github.com/ben-w-smith/browser-agent-mcp/issues"
);
console.log("");
