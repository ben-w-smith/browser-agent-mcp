// MCP Connection handler for communicating with the MCP server
export class MCPConnection {
  private ws: WebSocket | null = null;
  private messageHandlers: ((message: any) => void)[] = [];
  private isConnected = false;
  private currentPort = 3000;
  private maxPort = 3005;

  async initialize() {
    await this.tryConnectToServer(this.currentPort);
  }

  private async tryConnectToServer(port: number): Promise<void> {
    try {
      console.log(`🔍 Attempting to connect to MCP server on port ${port}...`);

      // Connect to MCP server
      this.ws = new WebSocket(`ws://localhost:${port}`);

      this.ws.onopen = () => {
        console.log(
          `🚀 MCP WebSocket connected successfully to localhost:${port}`
        );
        this.isConnected = true;
        this.currentPort = port;

        // Send a test message to verify connection
        this.sendMessage({
          type: "connection_test",
          message: "Extension connected successfully!",
          timestamp: new Date().toISOString(),
        });
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log("📥 Received message from MCP server:", message);

          // Handle connection test response
          if (message.type === "connection_test_response") {
            console.log(
              "🎉 Two-way communication confirmed! MCP server responded:",
              message.message
            );
          }

          this.messageHandlers.forEach((handler) => handler(message));
        } catch (error) {
          console.error("Error parsing MCP message:", error);
        }
      };

      this.ws.onclose = () => {
        console.log(`MCP WebSocket disconnected from port ${port}`);
        this.isConnected = false;
        // Attempt to reconnect after 5 seconds, starting from port 3000
        setTimeout(() => this.tryConnectToServer(3000), 5000);
      };

      this.ws.onerror = (error) => {
        console.error(`MCP WebSocket error on port ${port}:`, error);
        this.handleConnectionError(port);
      };
    } catch (error) {
      console.error(
        `Failed to initialize MCP connection on port ${port}:`,
        error
      );
      this.handleConnectionError(port);
    }
  }

  private handleConnectionError(failedPort: number): void {
    // Try next port if available
    if (failedPort < this.maxPort) {
      console.log(`Port ${failedPort} failed, trying ${failedPort + 1}...`);
      setTimeout(() => this.tryConnectToServer(failedPort + 1), 1000);
    } else {
      console.log(
        `All ports (3000-${this.maxPort}) failed, retrying from 3000 in 5 seconds...`
      );
      // Retry from the beginning after 5 seconds
      setTimeout(() => this.tryConnectToServer(3000), 5000);
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
