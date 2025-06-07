// DevTools page for Browser Agent MCP
// This creates a panel in Chrome DevTools for advanced debugging

chrome.devtools.panels.create(
  "Browser Agent MCP",
  "",
  "devtools-panel.html",
  (panel) => {
    console.log("Browser Agent MCP DevTools panel created");
  }
);
