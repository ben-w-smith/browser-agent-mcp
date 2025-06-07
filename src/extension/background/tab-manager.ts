// Tab Manager for handling Chrome tab operations
export class TabManager {
  private activeTabs: Map<number, chrome.tabs.Tab> = new Map();

  initialize() {
    // Listen for tab updates
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (tab) {
        this.activeTabs.set(tabId, tab);
      }
    });

    // Listen for tab removal
    chrome.tabs.onRemoved.addListener((tabId) => {
      this.activeTabs.delete(tabId);
    });

    // Listen for tab activation
    chrome.tabs.onActivated.addListener(async (activeInfo) => {
      try {
        const tab = await chrome.tabs.get(activeInfo.tabId);
        this.activeTabs.set(activeInfo.tabId, tab);
      } catch (error) {
        console.error("Error getting active tab:", error);
      }
    });

    console.log("TabManager initialized");
  }

  async getActiveTabId(): Promise<number> {
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (tab?.id) {
        return tab.id;
      }
      throw new Error("No active tab found");
    } catch (error) {
      console.error("Error getting active tab ID:", error);
      throw error;
    }
  }

  async getTab(tabId: number): Promise<chrome.tabs.Tab | null> {
    try {
      return await chrome.tabs.get(tabId);
    } catch (error) {
      console.error("Error getting tab:", error);
      return null;
    }
  }

  async getAllTabs(): Promise<chrome.tabs.Tab[]> {
    try {
      return await chrome.tabs.query({});
    } catch (error) {
      console.error("Error getting all tabs:", error);
      return [];
    }
  }

  getActiveTabsMap(): Map<number, chrome.tabs.Tab> {
    return this.activeTabs;
  }
}
