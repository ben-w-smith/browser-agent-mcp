// DevTools Manager for Chrome DevTools integration
export class DevToolsManager {
  private consoleLogs: Map<number, any[]> = new Map();
  private networkRequests: Map<number, any[]> = new Map();
  private attachedTabs: Set<number> = new Set();

  initialize() {
    console.log("DevToolsManager initialized");
  }

  async attachToTab(tabId: number): Promise<void> {
    if (this.attachedTabs.has(tabId)) {
      return; // Already attached
    }

    try {
      // Attach debugger to tab
      await chrome.debugger.attach({ tabId }, "1.3");
      this.attachedTabs.add(tabId);

      // Enable Console domain
      await chrome.debugger.sendCommand({ tabId }, "Console.enable");

      // Enable Network domain
      await chrome.debugger.sendCommand({ tabId }, "Network.enable");

      // Listen for console messages
      chrome.debugger.onEvent.addListener((source, method, params) => {
        if (source.tabId === tabId) {
          this.handleDebuggerEvent(tabId, method, params);
        }
      });

      console.log(`DevTools attached to tab ${tabId}`);
    } catch (error) {
      console.error(`Failed to attach DevTools to tab ${tabId}:`, error);
    }
  }

  async detachFromTab(tabId: number): Promise<void> {
    if (!this.attachedTabs.has(tabId)) {
      return; // Not attached
    }

    try {
      await chrome.debugger.detach({ tabId });
      this.attachedTabs.delete(tabId);
      console.log(`DevTools detached from tab ${tabId}`);
    } catch (error) {
      console.error(`Failed to detach DevTools from tab ${tabId}:`, error);
    }
  }

  private handleDebuggerEvent(tabId: number, method: string, params: any) {
    switch (method) {
      case "Console.messageAdded":
        this.handleConsoleMessage(tabId, params);
        break;
      case "Network.requestWillBeSent":
        this.handleNetworkRequest(tabId, params);
        break;
      case "Network.responseReceived":
        this.handleNetworkResponse(tabId, params);
        break;
    }
  }

  private handleConsoleMessage(tabId: number, params: any) {
    if (!this.consoleLogs.has(tabId)) {
      this.consoleLogs.set(tabId, []);
    }

    const logs = this.consoleLogs.get(tabId)!;
    logs.push({
      level: params.level,
      text: params.text,
      timestamp: Date.now(),
      source: params.source,
      line: params.line,
      column: params.column,
    });

    // Keep only last 1000 logs per tab
    if (logs.length > 1000) {
      logs.splice(0, logs.length - 1000);
    }
  }

  private handleNetworkRequest(tabId: number, params: any) {
    if (!this.networkRequests.has(tabId)) {
      this.networkRequests.set(tabId, []);
    }

    const requests = this.networkRequests.get(tabId)!;
    requests.push({
      requestId: params.requestId,
      url: params.request.url,
      method: params.request.method,
      headers: params.request.headers,
      timestamp: params.timestamp,
      type: "request",
    });

    // Keep only last 500 requests per tab
    if (requests.length > 500) {
      requests.splice(0, requests.length - 500);
    }
  }

  private handleNetworkResponse(tabId: number, params: any) {
    if (!this.networkRequests.has(tabId)) {
      return;
    }

    const requests = this.networkRequests.get(tabId)!;
    const request = requests.find((r) => r.requestId === params.requestId);

    if (request) {
      request.response = {
        status: params.response.status,
        statusText: params.response.statusText,
        headers: params.response.headers,
        mimeType: params.response.mimeType,
      };
    }
  }

  async getConsoleLogs(tabId: number): Promise<any[]> {
    // Ensure we're attached to the tab
    await this.attachToTab(tabId);

    return this.consoleLogs.get(tabId) || [];
  }

  async getNetworkRequests(tabId: number): Promise<any[]> {
    // Ensure we're attached to the tab
    await this.attachToTab(tabId);

    return this.networkRequests.get(tabId) || [];
  }

  clearLogs(tabId: number) {
    this.consoleLogs.delete(tabId);
    this.networkRequests.delete(tabId);
  }
}
