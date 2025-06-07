// MCP Connection handler for communicating with the MCP server
export class MCPConnection {
  private ws: WebSocket | null = null;
  private messageHandlers: ((message: any) => void)[] = [];
  private isConnected = false;

  async initialize() {
    try {
      // Connect to MCP server (will be running on localhost:3000)
      this.ws = new WebSocket("ws://localhost:3000");

      this.ws.onopen = () => {
        console.log("MCP WebSocket connected");
        this.isConnected = true;
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.messageHandlers.forEach((handler) => handler(message));
        } catch (error) {
          console.error("Error parsing MCP message:", error);
        }
      };

      this.ws.onclose = () => {
        console.log("MCP WebSocket disconnected");
        this.isConnected = false;
        // Attempt to reconnect after 5 seconds
        setTimeout(() => this.initialize(), 5000);
      };

      this.ws.onerror = (error) => {
        console.error("MCP WebSocket error:", error);
      };
    } catch (error) {
      console.error("Failed to initialize MCP connection:", error);
      // Retry connection after 5 seconds
      setTimeout(() => this.initialize(), 5000);
    }
  }

  onMessage(handler: (message: any) => void) {
    this.messageHandlers.push(handler);
  }

  async sendMessage(message: any): Promise<void> {
    if (!this.isConnected || !this.ws) {
      console.warn("MCP not connected, message queued");
      return;
    }

    try {
      this.ws.send(JSON.stringify(message));
    } catch (error) {
      console.error("Error sending MCP message:", error);
    }
  }

  async sendResponse(response: any): Promise<void> {
    await this.sendMessage(response);
  }
}
