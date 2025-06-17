# Browser Agent MCP

A Chrome extension and MCP (Model Context Protocol) server that enables AI agents to fully automate and interact with web browsers using your existing Chrome instance.

## 🎯 Project Goals

This project aims to create the **most comprehensive browser automation MCP** that combines the best features of existing solutions while addressing their limitations:

- **Full browser automation** (navigation, clicking, typing, form filling)
- **Complete Chrome DevTools access** (console logs, network monitoring, element inspection)
- **DOM manipulation and querying** (search elements, extract data, modify content)
- **Works with your existing Chrome browser** (no separate browser instances required)
- **Reliable and fast** (direct extension APIs, no flaky WebSocket connections)

## 🚀 Why This Project?

### Current Browser MCP Limitations

| Tool                         | Navigation | DevTools | Existing Browser | Reliability |
| ---------------------------- | ---------- | -------- | ---------------- | ----------- |
| **Microsoft Playwright MCP** | ✅         | ❌       | ❌               | ✅          |
| **Browser MCP**              | ❌         | ⚠️       | ✅               | ⚠️          |
| **BrowserTools MCP**         | ❌         | ✅       | ✅               | ⚠️          |
| **Our Solution**             | ✅         | ✅       | ✅               | ✅          |

### Key Problems We're Solving

1. **Navigation Gap**: Existing browser-based MCPs don't provide navigation automation
2. **Reliability Issues**: Current solutions are flaky and prone to connection drops
3. **Limited DevTools Access**: Most tools only provide basic console/network monitoring
4. **Complex Setup**: CDP-based solutions require debug mode and complex configuration

## 🏗️ Architecture Overview

```
AI Agent (Claude/Cursor/etc.)
    ↓ MCP Protocol
MCP Server (Node.js)
    ↓ WebSocket/Native Messaging
Chrome Extension
    ↓ Chrome APIs + Content Scripts
Web Pages (DOM Manipulation)
```

### Components

1. **Chrome Extension**

   - Content scripts for DOM interaction
   - Background service worker for tab management
   - DevTools integration for debugging access
   - Native messaging for MCP communication

2. **MCP Server**

   - Implements Model Context Protocol
   - Translates AI commands to browser actions
   - Manages extension communication
   - Provides structured responses to AI agents

3. **Communication Bridge**
   - WebSocket or Native Messaging
   - Real-time bidirectional communication
   - Event streaming for live updates
   - Error handling and reconnection logic

## 🛠️ Planned Features

### Core Automation

- ✅ **Navigation**: `navigate(url)`, `back()`, `forward()`, `reload()`
- ✅ **Element Interaction**: `click(selector)`, `type(selector, text)`, `submit(form)`
- ✅ **Waiting**: `waitForElement(selector)`, `waitForNavigation()`, `waitForText(text)`
- ✅ **Scrolling**: `scrollTo(selector)`, `scrollIntoView(element)`

### Advanced Interaction

- ✅ **Form Handling**: `fillForm(data)`, `selectOption(selector, value)`, `uploadFile(selector, path)`
- ✅ **Drag & Drop**: `dragAndDrop(from, to)`
- ✅ **Keyboard/Mouse**: `pressKey(key)`, `hover(selector)`, `rightClick(selector)`
- ✅ **Multi-tab**: `openTab(url)`, `switchTab(index)`, `closeTab()`

### DevTools Integration

- ✅ **Console Access**: Live console logs, error monitoring, JavaScript execution
- ✅ **Network Monitoring**: Request/response tracking, performance metrics
- ✅ **Element Inspector**: DOM tree access, CSS inspection, element highlighting
- ✅ **Performance**: Memory usage, CPU profiling, page load metrics

### DOM & Data Extraction

- ✅ **Element Querying**: `querySelector()`, `findByText()`, `findByAttribute()`
- ✅ **Data Extraction**: `getText()`, `getAttribute()`, `getHTML()`, `getTableData()`
- ✅ **Page Analysis**: `getLinks()`, `getForms()`, `getImages()`, `getMetadata()`
- ✅ **Screenshot**: `captureScreenshot()`, `captureElement(selector)`

### AI-Friendly Features

- ✅ **Smart Element Detection**: Find clickable elements, form fields, navigation menus
- ✅ **Content Understanding**: Extract structured data, identify page sections
- ✅ **Error Recovery**: Automatic retry logic, fallback selectors
- ✅ **Context Awareness**: Track page state, navigation history, user sessions

## 🎯 Target Use Cases

### Web Automation

- **Form Filling**: Automatically fill out job applications, surveys, registrations
- **Data Extraction**: Scrape product information, research data, contact details
- **Testing**: Automated UI testing, regression testing, accessibility testing
- **Monitoring**: Track website changes, price monitoring, availability checking

### AI Agent Integration

- **Research Tasks**: Navigate websites, extract information, compile reports
- **E-commerce**: Product research, price comparison, order tracking
- **Social Media**: Content posting, engagement tracking, audience analysis
- **Productivity**: Calendar management, email automation, document processing

### Development & Debugging

- **Performance Analysis**: Page speed testing, resource optimization
- **Accessibility Auditing**: WCAG compliance checking, screen reader testing
- **Cross-browser Testing**: Compatibility verification, feature detection
- **API Testing**: Frontend-backend integration testing

## 🚀 Getting Started

### Prerequisites

- Chrome browser (latest version)
- Node.js 18+
- MCP-compatible AI client (Claude Desktop, Cursor, etc.)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/browser-agent-mcp.git
cd browser-agent-mcp

# Install dependencies
npm install

# Build the extension
npm run build

# Load extension in Chrome
# 1. Open chrome://extensions/
# 2. Enable "Developer mode"
# 3. Click "Load unpacked" and select the dist/ folder

# Start the MCP server
npm run start
```

### Configuration

```json
{
  "mcpServers": {
    "browser-agent": {
      "command": "node",
      "args": ["path/to/browser-agent-mcp/server.js"]
    }
  }
}
```

## 🤝 Contributing

We welcome contributions! This project aims to be the definitive browser automation solution for AI agents.

### Development Priorities

1. **Core automation features** (navigation, clicking, typing)
2. **DevTools integration** (console, network, elements)
3. **Reliability improvements** (error handling, reconnection)
4. **AI-friendly APIs** (smart element detection, context awareness)
5. **Performance optimization** (efficient DOM queries, memory management)

### Areas for Contribution

- **Extension Development**: Chrome APIs, content scripts, background workers
- **MCP Server**: Protocol implementation, command handling, response formatting
- **Testing**: Automated testing, browser compatibility, edge case handling
- **Documentation**: API docs, tutorials, example use cases

## 📋 Roadmap

### Minimal Viable Product (MVP)

Core features needed for basic AI agent browser interaction:

- [ ] **DOM Read Access**: Query elements, extract text/attributes, get page structure
- [ ] **Console Logs Read Access**: Monitor JavaScript console output, errors, warnings
- [ ] **Network Logs Read Access**: Track HTTP requests/responses, API calls, resource loading

### Phase 1: Foundation (Weeks 1-2)

- [ ] Basic Chrome extension structure (manifest, content scripts, background worker)
- [ ] MCP server implementation (protocol handling, command routing)
- [ ] **MVP: DOM read access** (`querySelector`, `getText`, `getAttributes`, `getHTML`)
- [ ] **MVP: Console logs monitoring** (capture console.log, errors, warnings)
- [ ] **MVP: Network request tracking** (monitor XHR, fetch, resource requests)

### Phase 2: Core Automation (Weeks 3-4)

- [ ] Navigation commands (`navigate`, `back`, `forward`, `reload`)
- [ ] Element interaction (`click`, `type`, `submit`)
- [ ] Basic waiting mechanisms (`waitForElement`, `waitForNavigation`)
- [ ] Screenshot capabilities (`captureScreenshot`, `captureElement`)

### Phase 3: Advanced Features (Weeks 5-6)

- [ ] Form automation (`fillForm`, `selectOption`, `uploadFile`)
- [ ] Multi-tab management (`openTab`, `switchTab`, `closeTab`)
- [ ] Advanced DOM querying (`findByText`, `findByAttribute`, `getTableData`)
- [ ] Drag & drop functionality (`dragAndDrop`)

### Phase 4: AI Optimization (Weeks 7-8)

- [ ] Smart element detection (find clickable elements, form fields, navigation menus)
- [ ] Context-aware responses (track page state, navigation history)
- [ ] Error recovery mechanisms (automatic retry logic, fallback selectors)
- [ ] Performance optimization (efficient DOM queries, memory management)

### Phase 5: Polish & Distribution (Weeks 9-10)

- [ ] Comprehensive testing (automated testing, browser compatibility)
- [ ] Documentation completion (API docs, tutorials, example use cases)
- [ ] Chrome Web Store preparation (store listing, permissions review)
- [ ] Community feedback integration (user testing, feature requests)

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

Inspired by and building upon:

- [Microsoft Playwright MCP](https://github.com/microsoft/playwright-mcp)
- [AgentDesk BrowserTools MCP](https://github.com/AgentDeskAI/browser-tools-mcp)
- [Browser MCP Extension](https://chromewebstore.google.com/detail/browser-mcp)

---

**Goal**: Create the most comprehensive, reliable, and AI-friendly browser automation MCP that works seamlessly with your existing Chrome browser.
