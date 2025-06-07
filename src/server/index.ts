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
import WebSocket from "ws";

class BrowserAgentMCPServer {
  private server: Server;
  private wsServer: WebSocket.Server;
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
    this.wsServer = new WebSocket.Server({ port: 3000 });
    this.setupWebSocketServer();
    this.setupMCPHandlers();
  }

  private setupWebSocketServer() {
    this.wsServer.on("connection", (ws) => {
      console.log("Chrome extension connected");
      this.extensionConnection = ws;

      ws.on("message", (data) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleExtensionMessage(message);
        } catch (error) {
          console.error("Error parsing extension message:", error);
        }
      });

      ws.on("close", () => {
        console.log("Chrome extension disconnected");
        this.extensionConnection = null;
      });

      ws.on("error", (error) => {
        console.error("WebSocket error:", error);
      });
    });

    console.log("WebSocket server listening on port 3000");
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
        reject(new Error("Extension not connected"));
        return;
      }

      const messageId = Math.random().toString(36).substr(2, 9);
      const messageWithId = { ...message, id: messageId };

      // Set up response handler
      const timeout = setTimeout(() => {
        reject(new Error("Extension request timeout"));
      }, 10000);

      const responseHandler = (data: WebSocket.Data) => {
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
    console.log("Received from extension:", message);
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.log("Browser Agent MCP Server started");
  }
}

// Start the server
const server = new BrowserAgentMCPServer();
server.start().catch(console.error);
