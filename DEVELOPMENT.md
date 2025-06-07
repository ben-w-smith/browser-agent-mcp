# Development Guide

## Phase 1 MVP Setup

This guide will help you set up and test the Phase 1 MVP features:

- DOM read access
- Console logs read access
- Network logs read access

## Prerequisites

- Node.js 18+ and npm/pnpm
- Chrome browser
- Basic understanding of Chrome extensions

## Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Build the project:**

   ```bash
   npm run build
   ```

3. **Load the Chrome extension:**

   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `dist/extension` folder
   - The "Browser Agent MCP" extension should now be loaded

4. **Start the MCP server:**
   ```bash
   npm start
   ```

## Testing Phase 1 MVP Features

### 1. DOM Read Access

The extension can query DOM elements on any webpage:

**Available DOM operations:**

- `dom_query` - Query elements with CSS selectors
- `get_page_info` - Get general page information

**Test it:**

1. Navigate to any webpage
2. Open the extension popup to verify connection
3. Use an MCP client to call `dom_query` with a CSS selector

### 2. Console Logs Read Access

The extension monitors and captures console logs:

**Features:**

- Captures all console.log, console.error, console.warn, console.info
- Filters by log level
- Includes timestamps and source information

**Test it:**

1. Open a webpage with console activity
2. Open browser DevTools and run: `console.log("Test message")`
3. Use MCP client to call `get_console_logs`

### 3. Network Logs Read Access

The extension monitors network requests:

**Features:**

- Captures fetch() requests
- Records URL, method, status, timing
- Filters by URL patterns

**Test it:**

1. Navigate to a webpage that makes API calls
2. Use MCP client to call `get_network_requests`

## Development Commands

```bash
# Build everything
npm run build

# Build only extension
npm run build:extension

# Build only server
npm run build:server

# Development mode (watch for changes)
npm run dev

# Start MCP server
npm start

# Lint code
npm run lint

# Clean build artifacts
npm run clean
```

## Architecture

```
┌─────────────────┐    WebSocket    ┌─────────────────┐    MCP Protocol    ┌─────────────────┐
│  Chrome         │◄──────────────►│  MCP Server     │◄─────────────────►│  AI Agent       │
│  Extension      │                 │  (Node.js)      │                    │  (Claude, etc)  │
└─────────────────┘                 └─────────────────┘                    └─────────────────┘
        │
        ▼
┌─────────────────┐
│  Web Pages      │
│  (DOM, Console, │
│   Network)      │
└─────────────────┘
```

## Troubleshooting

### Extension not connecting to MCP server

- Ensure MCP server is running on port 3000
- Check browser console for WebSocket errors
- Verify extension is loaded and active

### DOM queries not working

- Check that content script is injected
- Verify CSS selectors are valid
- Check browser console for errors

### Console/Network logs not captured

- Ensure debugger permissions are granted
- Check that DevTools integration is working
- Verify tab is properly attached

## Next Steps

After Phase 1 is working:

- Phase 2: Add click/type automation
- Phase 3: Advanced DevTools features
- Phase 4: AI optimization features
