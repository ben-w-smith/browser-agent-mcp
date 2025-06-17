// Background service worker for Browser Agent MCP
// Handles MCP server communication and coordinates extension functionality

import { MCPConnection } from "./mcp-connection";
import { TabManager } from "./tab-manager";
import { DevToolsManager } from "./devtools-manager";

class BackgroundService {
  private mcpConnection: MCPConnection;
  private tabManager: TabManager;
  private devToolsManager: DevToolsManager;

  constructor() {
    this.mcpConnection = new MCPConnection();
    this.tabManager = new TabManager();
    this.devToolsManager = new DevToolsManager();

    this.initialize();
  }

  private async initialize() {
    console.log("Browser Agent MCP: Background service starting...");

    // Set up message listeners
    this.setupMessageListeners();

    // Initialize MCP connection
    await this.mcpConnection.initialize();

    // Set up tab event listeners
    this.tabManager.initialize();

    // Set up DevTools integration
    this.devToolsManager.initialize();

    console.log("Browser Agent MCP: Background service initialized");
  }

  private setupMessageListeners() {
    // Listen for messages from content scripts
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse);
      return true; // Keep message channel open for async response
    });

    // Listen for messages from MCP server
    this.mcpConnection.onMessage((message) => {
      this.handleMCPMessage(message);
    });
  }

  private async handleMessage(
    message: any,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: any) => void
  ) {
    try {
      switch (message.type) {
        case "DOM_QUERY":
          const domResult = await this.handleDOMQuery(
            message.payload,
            sender.tab?.id
          );
          sendResponse({ success: true, data: domResult });
          break;

        case "CONSOLE_LOG":
          await this.handleConsoleLog(message.payload, sender.tab?.id);
          sendResponse({ success: true });
          break;

        case "NETWORK_REQUEST":
          await this.handleNetworkRequest(message.payload, sender.tab?.id);
          sendResponse({ success: true });
          break;

        default:
          sendResponse({ success: false, error: "Unknown message type" });
      }
    } catch (error) {
      console.error("Error handling message:", error);
      sendResponse({ success: false, error: (error as Error).message });
    }
  }

  private async handleMCPMessage(message: any) {
    // Handle incoming MCP commands and route to appropriate handlers
    console.log("Received MCP message:", message);

    try {
      let result;

      // Handle different message types from MCP server
      switch (message.type) {
        case "DOM_QUERY":
          result = await this.handleDOMQuery(message.payload);
          this.sendMCPResponse(message.id, { success: true, data: result });
          break;

        case "GET_CONSOLE_LOGS":
          result = await this.getConsoleLogs(message.payload);
          this.sendMCPResponse(message.id, { success: true, data: result });
          break;

        case "GET_NETWORK_REQUESTS":
          result = await this.getNetworkRequests(message.payload);
          this.sendMCPResponse(message.id, { success: true, data: result });
          break;

        case "GET_PAGE_INFO":
          result = await this.getPageInfo(message.payload);
          this.sendMCPResponse(message.id, { success: true, data: result });
          break;

        case "DOM_CLICK":
          await this.handleDOMClick(message.payload);
          this.sendMCPResponse(message.id, { success: true });
          break;

        case "DOM_TYPE":
          await this.handleDOMType(message.payload);
          this.sendMCPResponse(message.id, { success: true });
          break;

        // Legacy method-based messages (keep for compatibility)
        case "dom/query":
          await this.executeDOMQuery(message.params);
          break;
        case "console/getLogs":
          await this.getConsoleLogs(message.params);
          break;
        case "network/getRequests":
          await this.getNetworkRequests(message.params);
          break;

        default:
          if (message.type !== "connection_test_response") {
            console.warn("Unknown MCP message type:", message.type);
          }
      }
    } catch (error) {
      console.error("Error handling MCP message:", error);
      if (message.id) {
        this.sendMCPResponse(message.id, {
          success: false,
          error: (error as Error).message,
        });
      }
    }
  }

  private async handleDOMQuery(payload: any, tabId?: number): Promise<any> {
    const targetTabId =
      tabId || payload.tabId || (await this.tabManager.getActiveTabId());

    // Execute DOM query in the specified tab
    const results = await chrome.scripting.executeScript({
      target: { tabId: targetTabId },
      func: (selector: string, action: string = "query") => {
        const elements = document.querySelectorAll(selector);

        if (action === "getText") {
          return Array.from(elements).map((el) => el.textContent?.trim() || "");
        } else if (action === "getAttributes") {
          return Array.from(elements).map((el) =>
            Array.from(el.attributes).reduce((acc, attr) => {
              acc[attr.name] = attr.value;
              return acc;
            }, {} as Record<string, string>)
          );
        } else if (action === "getHTML") {
          return Array.from(elements).map((el) => el.outerHTML);
        } else {
          // Default "query" action
          return Array.from(elements).map((el) => ({
            tagName: el.tagName,
            textContent: el.textContent?.trim() || "",
            innerHTML: el.innerHTML,
            attributes: Array.from(el.attributes).reduce((acc, attr) => {
              acc[attr.name] = attr.value;
              return acc;
            }, {} as Record<string, string>),
          }));
        }
      },
      args: [payload.selector, payload.action],
    });

    return results[0]?.result || [];
  }

  private async handleConsoleLog(payload: any, tabId?: number) {
    // Forward console log to MCP server
    await this.mcpConnection.sendMessage({
      method: "console/log",
      params: {
        tabId,
        level: payload.level,
        message: payload.message,
        timestamp: payload.timestamp,
      },
    });
  }

  private async handleNetworkRequest(payload: any, tabId?: number) {
    // Forward network request to MCP server
    await this.mcpConnection.sendMessage({
      method: "network/request",
      params: {
        tabId,
        url: payload.url,
        method: payload.method,
        status: payload.status,
        timestamp: payload.timestamp,
      },
    });
  }

  private async executeDOMQuery(params: any) {
    const tabId = params.tabId || (await this.tabManager.getActiveTabId());
    const result = await this.handleDOMQuery(params, tabId);

    await this.mcpConnection.sendResponse({
      id: params.id,
      result,
    });
  }

  private async getConsoleLogs(params: any) {
    const logs = await this.devToolsManager.getConsoleLogs(params.tabId);

    await this.mcpConnection.sendResponse({
      id: params.id,
      result: logs,
    });
  }

  private async getNetworkRequests(params: any) {
    const requests = await this.devToolsManager.getNetworkRequests(
      params.tabId
    );

    await this.mcpConnection.sendResponse({
      id: params.id,
      result: requests,
    });
  }

  private async sendMCPResponse(messageId: string, response: any) {
    const responseMessage = {
      id: messageId,
      ...response,
    };
    await this.mcpConnection.sendMessage(responseMessage);
  }

  private async getPageInfo(params: any): Promise<any> {
    const tabId = params.tabId || (await this.tabManager.getActiveTabId());

    // Get page information using chrome.tabs API
    const tab = await chrome.tabs.get(tabId);

    return {
      title: tab.title,
      url: tab.url,
      favIconUrl: tab.favIconUrl,
      status: tab.status,
    };
  }

  private async handleDOMClick(params: any): Promise<void> {
    const tabId = params.tabId || (await this.tabManager.getActiveTabId());

    await chrome.scripting.executeScript({
      target: { tabId },
      func: (selector: string) => {
        const element = document.querySelector(selector) as HTMLElement;
        if (element) {
          element.click();
        } else {
          throw new Error(`Element not found: ${selector}`);
        }
      },
      args: [params.selector],
    });
  }

  private async handleDOMType(params: any): Promise<void> {
    const tabId = params.tabId || (await this.tabManager.getActiveTabId());

    await chrome.scripting.executeScript({
      target: { tabId },
      func: (selector: string, text: string, clear: boolean = true) => {
        const element = document.querySelector(selector) as HTMLInputElement;
        if (element) {
          if (clear) {
            element.value = "";
          }
          element.value += text;
          // Trigger input event
          element.dispatchEvent(new Event("input", { bubbles: true }));
        } else {
          throw new Error(`Element not found: ${selector}`);
        }
      },
      args: [params.selector, params.text, params.clear],
    });
  }
}

// Initialize the background service
new BackgroundService();
