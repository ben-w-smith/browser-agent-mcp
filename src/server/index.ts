#!/usr/bin/env node

// Browser Agent MCP Server
// Implements the Model Context Protocol for browser automation

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { WebSocketServer, WebSocket } from "ws";
import path from "path";
import { fileURLToPath } from "url";

// Helper function for conditional logging
const debug = (...args: any[]) => {
  // Only log if not in production MCP mode or if DEBUG is set
  if (process.env.NODE_ENV !== "production" || process.env.DEBUG) {
    console.log(...args);
  }
};

const debugError = (...args: any[]) => {
  // Always log errors, but to stderr to not interfere with MCP stdio
  if (process.env.NODE_ENV === "production") {
    console.error(...args);
  } else {
    console.error(...args);
  }
};

class BrowserAgentMCPServer {
  private server: Server;
  private wsServer!: WebSocketServer;
  private extensionConnection: WebSocket | null = null;

  constructor() {
    this.server = new Server(
      {
        name: "browser-agent-mcp",
        version: "0.1.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Create WebSocket server for extension communication
    // Try different ports if 3000 is busy
    this.setupWebSocketServer();
    this.setupMCPHandlers();
  }

  private setupWebSocketServer() {
    // Try ports 3000-3005 to find an available one
    this.tryStartWebSocketServer(3000);
  }

  private tryStartWebSocketServer(port: number) {
    try {
      this.wsServer = new WebSocketServer({ port });

      this.wsServer.on("error", (error: any) => {
        if (error.code === "EADDRINUSE" && port < 3005) {
          debug(`Port ${port} in use, trying ${port + 1}...`);
          this.tryStartWebSocketServer(port + 1);
        } else {
          debugError("WebSocket server error:", error);
        }
      });

      this.wsServer.on("listening", () => {
        debug(`WebSocket server listening on port ${port}`);
      });

      this.setupWebSocketHandlers();
    } catch (error) {
      if (port < 3005) {
        this.tryStartWebSocketServer(port + 1);
      } else {
        debugError("Could not start WebSocket server on any port 3000-3005");
      }
    }
  }

  private setupWebSocketHandlers() {
    this.wsServer.on("connection", (ws) => {
      debug("🎯 Chrome extension connected to MCP server");
      this.extensionConnection = ws;

      ws.on("message", (data) => {
        try {
          const message = JSON.parse(data.toString());
          debug("📨 Received message from extension:", message);
          this.handleExtensionMessage(message);
        } catch (error) {
          debugError("Error parsing extension message:", error);
        }
      });

      ws.on("close", () => {
        debug("❌ Chrome extension disconnected");
        this.extensionConnection = null;
      });

      ws.on("error", (error) => {
        debugError("WebSocket error:", error);
      });
    });
  }

  private setupMCPHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: "dom_query",
            description: "Query DOM elements on the current page",
            inputSchema: {
              type: "object",
              properties: {
                selector: {
                  type: "string",
                  description: "CSS selector to query elements",
                },
                action: {
                  type: "string",
                  enum: ["query", "getText", "getAttributes", "getHTML"],
                  description: "Action to perform on the elements",
                  default: "query",
                },
                tabId: {
                  type: "number",
                  description:
                    "Tab ID (optional, uses active tab if not specified)",
                },
              },
              required: ["selector"],
            },
          },
          {
            name: "get_console_logs",
            description: "Get console logs from the current page",
            inputSchema: {
              type: "object",
              properties: {
                tabId: {
                  type: "number",
                  description:
                    "Tab ID (optional, uses active tab if not specified)",
                },
                level: {
                  type: "string",
                  enum: ["log", "error", "warn", "info"],
                  description: "Filter by log level (optional)",
                },
              },
            },
          },
          {
            name: "get_network_requests",
            description: "Get network requests from the current page",
            inputSchema: {
              type: "object",
              properties: {
                tabId: {
                  type: "number",
                  description:
                    "Tab ID (optional, uses active tab if not specified)",
                },
                filter: {
                  type: "string",
                  description: "Filter requests by URL pattern (optional)",
                },
              },
            },
          },
          {
            name: "get_page_info",
            description: "Get general information about the current page",
            inputSchema: {
              type: "object",
              properties: {
                tabId: {
                  type: "number",
                  description:
                    "Tab ID (optional, uses active tab if not specified)",
                },
              },
            },
          },
          {
            name: "click_element",
            description: "Click on an element",
            inputSchema: {
              type: "object",
              properties: {
                selector: {
                  type: "string",
                  description: "CSS selector of the element to click",
                },
                tabId: {
                  type: "number",
                  description:
                    "Tab ID (optional, uses active tab if not specified)",
                },
              },
              required: ["selector"],
            },
          },
          {
            name: "type_text",
            description: "Type text into an input element",
            inputSchema: {
              type: "object",
              properties: {
                selector: {
                  type: "string",
                  description: "CSS selector of the input element",
                },
                text: {
                  type: "string",
                  description: "Text to type",
                },
                clear: {
                  type: "boolean",
                  description: "Whether to clear existing text first",
                  default: true,
                },
                tabId: {
                  type: "number",
                  description:
                    "Tab ID (optional, uses active tab if not specified)",
                },
              },
              required: ["selector", "text"],
            },
          },
        ] as Tool[],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      if (!this.extensionConnection) {
        throw new Error("Chrome extension not connected");
      }

      try {
        switch (name) {
          case "dom_query":
            return await this.handleDOMQuery(args);
          case "get_console_logs":
            return await this.handleGetConsoleLogs(args);
          case "get_network_requests":
            return await this.handleGetNetworkRequests(args);
          case "get_page_info":
            return await this.handleGetPageInfo(args);
          case "click_element":
            return await this.handleClickElement(args);
          case "type_text":
            return await this.handleTypeText(args);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        throw new Error(`Tool execution failed: ${(error as Error).message}`);
      }
    });
  }

  private async sendToExtension(message: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.extensionConnection) {
        reject(
          new Error(
            "Chrome extension not connected. Please ensure the Browser Agent MCP extension is loaded and active in Chrome."
          )
        );
        return;
      }

      const messageId = Math.random().toString(36).substr(2, 9);
      const messageWithId = { ...message, id: messageId };

      // Set up response handler
      const timeout = setTimeout(() => {
        reject(new Error("Extension request timeout"));
      }, 10000);

      const responseHandler = (data: any) => {
        try {
          const response = JSON.parse(data.toString());
          if (response.id === messageId) {
            clearTimeout(timeout);
            this.extensionConnection?.off("message", responseHandler);

            if (response.success) {
              resolve(response.data);
            } else {
              reject(new Error(response.error || "Extension request failed"));
            }
          }
        } catch (error) {
          // Ignore parsing errors for other messages
        }
      };

      this.extensionConnection.on("message", responseHandler);
      this.extensionConnection.send(JSON.stringify(messageWithId));
    });
  }

  private async handleDOMQuery(args: any) {
    const result = await this.sendToExtension({
      type: "DOM_QUERY",
      payload: args,
    });

    return {
      content: [
        {
          type: "text",
          text: `Found ${result.length} elements matching "${
            args.selector
          }":\n\n${JSON.stringify(result, null, 2)}`,
        },
      ],
    };
  }

  private async handleGetConsoleLogs(args: any) {
    const result = await this.sendToExtension({
      type: "GET_CONSOLE_LOGS",
      payload: args,
    });

    const filteredLogs = args.level
      ? result.filter((log: any) => log.level === args.level)
      : result;

    return {
      content: [
        {
          type: "text",
          text: `Console logs (${
            filteredLogs.length
          } entries):\n\n${JSON.stringify(filteredLogs, null, 2)}`,
        },
      ],
    };
  }

  private async handleGetNetworkRequests(args: any) {
    const result = await this.sendToExtension({
      type: "GET_NETWORK_REQUESTS",
      payload: args,
    });

    const filteredRequests = args.filter
      ? result.filter((req: any) => req.url.includes(args.filter))
      : result;

    return {
      content: [
        {
          type: "text",
          text: `Network requests (${
            filteredRequests.length
          } entries):\n\n${JSON.stringify(filteredRequests, null, 2)}`,
        },
      ],
    };
  }

  private async handleGetPageInfo(args: any) {
    const result = await this.sendToExtension({
      type: "GET_PAGE_INFO",
      payload: args,
    });

    return {
      content: [
        {
          type: "text",
          text: `Page information:\n\n${JSON.stringify(result, null, 2)}`,
        },
      ],
    };
  }

  private async handleClickElement(args: any) {
    await this.sendToExtension({
      type: "DOM_CLICK",
      payload: args,
    });

    return {
      content: [
        {
          type: "text",
          text: `Successfully clicked element: ${args.selector}`,
        },
      ],
    };
  }

  private async handleTypeText(args: any) {
    await this.sendToExtension({
      type: "DOM_TYPE",
      payload: args,
    });

    return {
      content: [
        {
          type: "text",
          text: `Successfully typed "${args.text}" into element: ${args.selector}`,
        },
      ],
    };
  }

  private handleExtensionMessage(message: any) {
    // Handle messages from the extension (like console logs, network requests)
    debug("✅ Processing extension message:", message);

    // Respond to test messages
    if (message.type === "connection_test") {
      debug(
        "🎉 Connection test successful! Extension is communicating with MCP server"
      );

      // Send a response back to confirm two-way communication
      if (this.extensionConnection) {
        this.extensionConnection.send(
          JSON.stringify({
            type: "connection_test_response",
            message: "MCP server received your message successfully!",
            originalMessage: message,
            timestamp: new Date().toISOString(),
          })
        );
      }
    }
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    debug("Browser Agent MCP Server started");
  }
}

// Handle command line arguments
const args = process.argv.slice(2);

if (args.includes("--help") || args.includes("-h")) {
  console.log(`
Browser Agent MCP Server

Usage:
  browser-agent-mcp [command]

Commands:
  setup    Show setup instructions
  --help   Show this help message

Default: Start the MCP server
`);
  process.exit(0);
}

if (args.includes("setup")) {
  // Show setup instructions
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const extensionPath = path.resolve(__dirname, "../extension");

  console.log(`
🛠️  Browser Agent MCP Setup Guide

📁 Extension Location:
   ${extensionPath}

📖 Setup Instructions:

1. Load Chrome Extension:
   • Open chrome://extensions/
   • Enable "Developer mode" (toggle in top right)
   • Click "Load unpacked"
   • Select: ${extensionPath}

2. Configure MCP Client:

   For Cursor (~/.cursor/mcp.json):
   {
     "mcpServers": {
       "browser-agent": {
         "command": "npx",
         "args": ["browser-agent-mcp"]
       }
     }
   }

   For Claude Desktop:
   {
     "mcpServers": {
       "browser-agent": {
         "command": "browser-agent-mcp"
       }
     }
   }

3. Start using browser automation commands!

📚 Documentation: https://github.com/ben-w-smith/browser-agent-mcp#setup
`);
  process.exit(0);
} else {
  // Start the server
  const server = new BrowserAgentMCPServer();
  server.start().catch(debugError);
}
