# Browser Agent MCP

[![npm version](https://img.shields.io/npm/v/browser-agent-mcp.svg)](https://www.npmjs.com/package/browser-agent-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A comprehensive browser automation MCP (Model Context Protocol) server that combines full browser automation capabilities with Chrome DevTools access. Works with existing Chrome browser instances through a Chrome extension and MCP server architecture.

**Architecture**: AI Agent → MCP Server → Chrome Extension → Web Pages

## 🚀 Features

- **DOM Query & Manipulation**: Query, read, and interact with web page elements
- **Console Logs Access**: Read browser console logs for debugging
- **Network Request Monitoring**: Monitor and analyze network traffic
- **Page Information**: Get detailed page metadata and state
- **Element Interaction**: Click buttons, fill forms, and interact with web elements
- **Real Browser Integration**: Works with your existing Chrome browser session
- **DevTools Protocol**: Advanced browser control capabilities

## 📦 Installation

### Global Installation (Recommended)

```bash
npm install -g browser-agent-mcp
```

### Local Installation

```bash
npm install browser-agent-mcp
```

### Using pnpm

```bash
pnpm add -g browser-agent-mcp
```

## 🛠️ Setup

### 1. Install the Package

```bash
npm install -g browser-agent-mcp
```

### 2. Load the Chrome Extension

After installation, the extension files will be available. Load them into Chrome:

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Navigate to your installation and select the `dist/extension` folder
   - Global install: Usually in `/usr/local/lib/node_modules/browser-agent-mcp/dist/extension`
   - Local install: `./node_modules/browser-agent-mcp/dist/extension`

### 3. Configure Your MCP Client

#### For Cursor

Add to your `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "browser-agent": {
      "command": "npx",
      "args": ["browser-agent-mcp"]
    }
  }
}
```

#### For Claude Desktop

Add to your MCP configuration:

```json
{
  "mcpServers": {
    "browser-agent": {
      "command": "browser-agent-mcp"
    }
  }
}
```

## 🎯 Usage

Once set up, you can use natural language commands with your AI agent:

### DOM Queries

- "Find all buttons on this page"
- "Get all links in the navigation"
- "Show me the form inputs"

### Page Information

- "What's the current page title and URL?"
- "Get the page's meta description"

### Element Interaction

- "Click the submit button"
- "Fill in the email field with test@example.com"

### Console & Network Monitoring

- "Show me any JavaScript errors on this page"
- "What network requests were made?"

## 🔧 Available MCP Tools

### `dom_query`

Query DOM elements on the current page.

**Parameters:**

- `selector` (string): CSS selector to query elements
- `action` (string): Action to perform (`query`, `getText`, `getAttributes`, `getHTML`)
- `tabId` (number, optional): Specific tab ID

### `get_console_logs`

Get console logs from the current page.

**Parameters:**

- `tabId` (number, optional): Specific tab ID
- `level` (string, optional): Filter by log level (`log`, `error`, `warn`, `info`)

### `get_network_requests`

Get network requests from the current page.

**Parameters:**

- `tabId` (number, optional): Specific tab ID
- `filter` (string, optional): Filter requests by URL pattern

### `get_page_info`

Get general information about the current page.

**Parameters:**

- `tabId` (number, optional): Specific tab ID

### `click_element`

Click on an element.

**Parameters:**

- `selector` (string): CSS selector of element to click
- `tabId` (number, optional): Specific tab ID

### `type_text`

Type text into an input element.

**Parameters:**

- `selector` (string): CSS selector of input element
- `text` (string): Text to type
- `clear` (boolean, optional): Whether to clear existing text first
- `tabId` (number, optional): Specific tab ID

## 🏗️ Development

### Building from Source

```bash
git clone https://github.com/ben-w-smith/browser-agent-mcp.git
cd browser-agent-mcp
pnpm install
pnpm run build
```

### Running in Development Mode

```bash
pnpm run dev
```

This will start both the extension and server in watch mode.

### Testing

```bash
pnpm test
```

## 🤝 Comparison with Other Solutions

| Feature                  | Browser Agent MCP | Playwright MCP | Browser MCP |
| ------------------------ | ----------------- | -------------- | ----------- |
| Real Browser Integration | ✅                | ❌             | ✅          |
| DevTools Access          | ✅                | ❌             | ⚠️          |
| Navigation Automation    | ✅                | ✅             | ❌          |
| Form Interaction         | ✅                | ✅             | ❌          |
| Console Log Access       | ✅                | ❌             | ✅          |
| Network Monitoring       | ✅                | ❌             | ✅          |
| Reliability              | ✅                | ✅             | ⚠️          |

## 📋 Requirements

- **Node.js**: >= 18.0.0
- **Chrome**: Latest version recommended
- **Operating System**: Windows, macOS, or Linux

## 🐛 Troubleshooting

### Extension Not Loading

- Ensure Chrome Developer mode is enabled
- Check that the extension path is correct
- Try reloading the extension

### MCP Server Not Connecting

- Verify the server is running: `npx browser-agent-mcp`
- Check if ports 3000-3005 are available
- Restart your MCP client (Cursor, Claude Desktop, etc.)

### Extension Connection Issues

- Ensure the extension is loaded and enabled
- Check Chrome's extension console for errors
- Try refreshing the target web page

## 📚 Documentation

- [Development Guide](./DEVELOPMENT.md)
- [API Documentation](https://github.com/ben-w-smith/browser-agent-mcp/wiki)
- [Examples](https://github.com/ben-w-smith/browser-agent-mcp/tree/main/examples)

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](./CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- Built on the [Model Context Protocol](https://github.com/modelcontextprotocol) by Anthropic
- Inspired by existing browser automation tools
- Thanks to the Chrome Extension API team

## 📞 Support

- 🐛 [Report Issues](https://github.com/ben-w-smith/browser-agent-mcp/issues)
- 💬 [Discussions](https://github.com/ben-w-smith/browser-agent-mcp/discussions)
- 📧 [Contact](mailto:support@browser-agent-mcp.com)
