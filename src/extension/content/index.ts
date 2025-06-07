// Content script for DOM manipulation and monitoring
// Runs in the context of web pages

class ContentScript {
  private isInitialized = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    if (this.isInitialized) return;

    console.log("Browser Agent MCP: Content script initializing...");

    // Set up message listeners
    this.setupMessageListeners();

    // Monitor console logs
    this.setupConsoleMonitoring();

    // Monitor network requests
    this.setupNetworkMonitoring();

    this.isInitialized = true;
    console.log("Browser Agent MCP: Content script initialized");
  }

  private setupMessageListeners() {
    // Listen for messages from background script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse);
      return true; // Keep message channel open for async response
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
          const result = await this.handleDOMQuery(message.payload);
          sendResponse({ success: true, data: result });
          break;

        case "DOM_CLICK":
          await this.handleDOMClick(message.payload);
          sendResponse({ success: true });
          break;

        case "DOM_TYPE":
          await this.handleDOMType(message.payload);
          sendResponse({ success: true });
          break;

        case "GET_PAGE_INFO":
          const pageInfo = await this.getPageInfo();
          sendResponse({ success: true, data: pageInfo });
          break;

        default:
          sendResponse({ success: false, error: "Unknown message type" });
      }
    } catch (error) {
      console.error("Content script error:", error);
      sendResponse({ success: false, error: (error as Error).message });
    }
  }

  private async handleDOMQuery(payload: any): Promise<any> {
    const { selector, action = "query" } = payload;

    switch (action) {
      case "query":
        return this.queryElements(selector);
      case "getText":
        return this.getElementText(selector);
      case "getAttributes":
        return this.getElementAttributes(selector);
      case "getHTML":
        return this.getElementHTML(selector);
      default:
        throw new Error(`Unknown DOM action: ${action}`);
    }
  }

  private queryElements(selector: string): any[] {
    try {
      const elements = document.querySelectorAll(selector);
      return Array.from(elements).map((el, index) => ({
        index,
        tagName: el.tagName.toLowerCase(),
        textContent: el.textContent?.trim() || "",
        innerHTML: el.innerHTML,
        outerHTML: el.outerHTML,
        attributes: this.getElementAttributesMap(el),
        boundingRect: el.getBoundingClientRect(),
        visible: this.isElementVisible(el),
        clickable: this.isElementClickable(el),
      }));
    } catch (error) {
      throw new Error(`DOM query failed: ${(error as Error).message}`);
    }
  }

  private getElementText(selector: string): string {
    const element = document.querySelector(selector);
    if (!element) throw new Error(`Element not found: ${selector}`);
    return element.textContent?.trim() || "";
  }

  private getElementAttributes(selector: string): Record<string, string> {
    const element = document.querySelector(selector);
    if (!element) throw new Error(`Element not found: ${selector}`);
    return this.getElementAttributesMap(element);
  }

  private getElementHTML(selector: string): {
    innerHTML: string;
    outerHTML: string;
  } {
    const element = document.querySelector(selector);
    if (!element) throw new Error(`Element not found: ${selector}`);
    return {
      innerHTML: element.innerHTML,
      outerHTML: element.outerHTML,
    };
  }

  private getElementAttributesMap(element: Element): Record<string, string> {
    const attributes: Record<string, string> = {};
    for (let i = 0; i < element.attributes.length; i++) {
      const attr = element.attributes[i];
      attributes[attr.name] = attr.value;
    }
    return attributes;
  }

  private isElementVisible(element: Element): boolean {
    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);

    return (
      rect.width > 0 &&
      rect.height > 0 &&
      style.visibility !== "hidden" &&
      style.display !== "none" &&
      parseFloat(style.opacity) > 0
    );
  }

  private isElementClickable(element: Element): boolean {
    const clickableTags = ["a", "button", "input", "select", "textarea"];
    const tagName = element.tagName.toLowerCase();

    return (
      clickableTags.includes(tagName) ||
      element.hasAttribute("onclick") ||
      element.hasAttribute("role") ||
      window.getComputedStyle(element).cursor === "pointer"
    );
  }

  private async handleDOMClick(payload: any): Promise<void> {
    const { selector } = payload;
    const element = document.querySelector(selector) as HTMLElement;

    if (!element) {
      throw new Error(`Element not found: ${selector}`);
    }

    // Scroll element into view
    element.scrollIntoView({ behavior: "smooth", block: "center" });

    // Wait a bit for scroll to complete
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Click the element
    element.click();
  }

  private async handleDOMType(payload: any): Promise<void> {
    const { selector, text, clear = true } = payload;
    const element = document.querySelector(selector) as
      | HTMLInputElement
      | HTMLTextAreaElement;

    if (!element) {
      throw new Error(`Element not found: ${selector}`);
    }

    // Focus the element
    element.focus();

    // Clear existing text if requested
    if (clear) {
      element.value = "";
    }

    // Type the text
    element.value += text;

    // Trigger input events
    element.dispatchEvent(new Event("input", { bubbles: true }));
    element.dispatchEvent(new Event("change", { bubbles: true }));
  }

  private async getPageInfo(): Promise<any> {
    return {
      url: window.location.href,
      title: document.title,
      readyState: document.readyState,
      timestamp: Date.now(),
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      scroll: {
        x: window.scrollX,
        y: window.scrollY,
      },
      forms: this.getForms(),
      links: this.getLinks(),
      images: this.getImages(),
    };
  }

  private getForms(): any[] {
    const forms = document.querySelectorAll("form");
    return Array.from(forms).map((form, index) => ({
      index,
      action: form.action,
      method: form.method,
      fields: Array.from(form.elements).map((el) => ({
        name: (el as HTMLInputElement).name,
        type: (el as HTMLInputElement).type,
        tagName: el.tagName.toLowerCase(),
      })),
    }));
  }

  private getLinks(): any[] {
    const links = document.querySelectorAll("a[href]");
    return Array.from(links).map((link, index) => ({
      index,
      href: (link as HTMLAnchorElement).href,
      text: link.textContent?.trim() || "",
      target: (link as HTMLAnchorElement).target,
    }));
  }

  private getImages(): any[] {
    const images = document.querySelectorAll("img");
    return Array.from(images).map((img, index) => ({
      index,
      src: (img as HTMLImageElement).src,
      alt: (img as HTMLImageElement).alt,
      width: (img as HTMLImageElement).width,
      height: (img as HTMLImageElement).height,
    }));
  }

  private setupConsoleMonitoring() {
    // Override console methods to capture logs
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;
    const originalInfo = console.info;

    const sendConsoleMessage = (level: string, args: any[]) => {
      chrome.runtime
        .sendMessage({
          type: "CONSOLE_LOG",
          payload: {
            level,
            message: args
              .map((arg) =>
                typeof arg === "object" ? JSON.stringify(arg) : String(arg)
              )
              .join(" "),
            timestamp: Date.now(),
          },
        })
        .catch(() => {
          // Ignore errors if background script is not available
        });
    };

    console.log = (...args) => {
      originalLog.apply(console, args);
      sendConsoleMessage("log", args);
    };

    console.error = (...args) => {
      originalError.apply(console, args);
      sendConsoleMessage("error", args);
    };

    console.warn = (...args) => {
      originalWarn.apply(console, args);
      sendConsoleMessage("warn", args);
    };

    console.info = (...args) => {
      originalInfo.apply(console, args);
      sendConsoleMessage("info", args);
    };
  }

  private setupNetworkMonitoring() {
    // Override fetch to monitor network requests
    const originalFetch = window.fetch;

    window.fetch = async (...args) => {
      const startTime = Date.now();
      const url =
        typeof args[0] === "string" ? args[0] : (args[0] as Request).url;
      const method = args[1]?.method || "GET";

      try {
        const response = await originalFetch.apply(window, args);

        chrome.runtime
          .sendMessage({
            type: "NETWORK_REQUEST",
            payload: {
              url,
              method,
              status: response.status,
              timestamp: startTime,
              duration: Date.now() - startTime,
            },
          })
          .catch(() => {
            // Ignore errors if background script is not available
          });

        return response;
      } catch (error) {
        chrome.runtime
          .sendMessage({
            type: "NETWORK_REQUEST",
            payload: {
              url,
              method,
              status: 0,
              error: (error as Error).message,
              timestamp: startTime,
              duration: Date.now() - startTime,
            },
          })
          .catch(() => {
            // Ignore errors if background script is not available
          });

        throw error;
      }
    };
  }
}

// Initialize content script
new ContentScript();
