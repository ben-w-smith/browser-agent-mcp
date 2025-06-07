// Popup script for Browser Agent MCP extension
document.addEventListener("DOMContentLoaded", async () => {
  const statusElement = document.getElementById("status");

  if (!statusElement) return;

  try {
    // Check if background script is running
    const response = await chrome.runtime.sendMessage({ type: "PING" });

    if (response?.success) {
      statusElement.textContent = "Connected to MCP Server";
      statusElement.className = "status connected";
    } else {
      statusElement.textContent = "MCP Server Disconnected";
      statusElement.className = "status disconnected";
    }
  } catch (error) {
    statusElement.textContent = "Extension Error";
    statusElement.className = "status disconnected";
    console.error("Popup error:", error);
  }
});
