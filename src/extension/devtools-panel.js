// DevTools panel functionality
let isConnected = false;

const statusIndicator = document.getElementById("status-indicator");
const statusText = document.getElementById("status-text");
const connectBtn = document.getElementById("connect-btn");
const clearLogsBtn = document.getElementById("clear-logs-btn");

const consoleLogsContainer = document.getElementById("console-logs");
const networkRequestsContainer = document.getElementById("network-requests");
const domOperationsContainer = document.getElementById("dom-operations");

const addLogEntry = (container, message, type = "info") => {
  const entry = document.createElement("div");
  entry.className = `log-entry ${type}`;
  entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
  container.appendChild(entry);
  container.scrollTop = container.scrollHeight;
};

const updateConnectionStatus = (connected) => {
  isConnected = connected;
  statusIndicator.className = `status-indicator ${
    connected ? "connected" : ""
  }`;
  statusText.textContent = connected ? "Connected" : "Disconnected";
  connectBtn.textContent = connected ? "Disconnect" : "Connect to MCP Server";
};

connectBtn.addEventListener("click", () => {
  if (isConnected) {
    // Disconnect logic
    updateConnectionStatus(false);
    addLogEntry(consoleLogsContainer, "Disconnected from MCP server", "warn");
  } else {
    // Connect logic
    updateConnectionStatus(true);
    addLogEntry(consoleLogsContainer, "Connected to MCP server", "info");
  }
});

clearLogsBtn.addEventListener("click", () => {
  consoleLogsContainer.innerHTML = "";
  networkRequestsContainer.innerHTML = "";
  domOperationsContainer.innerHTML = "";
  addLogEntry(consoleLogsContainer, "Logs cleared", "info");
});

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "DEVTOOLS_LOG") {
    const { category, message: logMessage, level } = message.payload;

    switch (category) {
      case "console":
        addLogEntry(consoleLogsContainer, logMessage, level);
        break;
      case "network":
        addLogEntry(networkRequestsContainer, logMessage, level);
        break;
      case "dom":
        addLogEntry(domOperationsContainer, logMessage, level);
        break;
    }
  }
});

// Initialize
addLogEntry(consoleLogsContainer, "DevTools panel ready", "info");
