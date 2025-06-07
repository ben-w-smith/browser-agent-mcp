// Shared utilities for Browser Agent MCP
// Used across extension and server components

import type { MCPError } from "../types";

/**
 * Creates a standardized MCP error object
 */
export const createMCPError = (
  code: string,
  message: string,
  details?: Record<string, unknown>
): MCPError => ({
  code,
  message,
  details,
});

/**
 * Generates a unique ID for MCP messages
 */
export const generateMessageId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Validates CSS selector syntax
 */
export const isValidSelector = (selector: string): boolean => {
  try {
    document.querySelector(selector);
    return true;
  } catch {
    return false;
  }
};

/**
 * Waits for an element to appear in the DOM
 */
export const waitForElement = async (
  selector: string,
  options: { timeout?: number; interval?: number } = {}
): Promise<Element | null> => {
  const { timeout = 5000, interval = 100 } = options;
  const startTime = Date.now();

  return new Promise((resolve) => {
    const checkElement = () => {
      const element = document.querySelector(selector);
      if (element) {
        resolve(element);
        return;
      }

      if (Date.now() - startTime >= timeout) {
        resolve(null);
        return;
      }

      setTimeout(checkElement, interval);
    };

    checkElement();
  });
};

/**
 * Debounces a function call
 */
export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Throttles a function call
 */
export const throttle = <T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let lastCall = 0;

  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
};

/**
 * Safely parses JSON with error handling
 */
export const safeJsonParse = <T = unknown>(json: string): T | null => {
  try {
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
};

/**
 * Safely stringifies JSON with error handling
 */
export const safeJsonStringify = (obj: unknown): string | null => {
  try {
    return JSON.stringify(obj);
  } catch {
    return null;
  }
};

/**
 * Validates tab ID
 */
export const isValidTabId = (tabId: unknown): tabId is number => {
  return typeof tabId === "number" && tabId > 0 && Number.isInteger(tabId);
};

/**
 * Sanitizes text input to prevent XSS
 */
export const sanitizeText = (text: string): string => {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
};

/**
 * Checks if a URL is valid
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Extracts domain from URL
 */
export const extractDomain = (url: string): string | null => {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
};

/**
 * Formats timestamp to readable string
 */
export const formatTimestamp = (timestamp: number): string => {
  return new Date(timestamp).toISOString();
};

/**
 * Creates a promise that resolves after specified delay
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Retries an async operation with exponential backoff
 */
export const retryWithBackoff = async <T>(
  operation: () => Promise<T>,
  options: {
    maxRetries?: number;
    baseDelay?: number;
    maxDelay?: number;
  } = {}
): Promise<T> => {
  const { maxRetries = 3, baseDelay = 1000, maxDelay = 10000 } = options;

  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxRetries) {
        throw lastError;
      }

      const delayMs = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
      await delay(delayMs);
    }
  }

  throw lastError!;
};

/**
 * Logs with timestamp and context
 */
export const createLogger = (context: string) => ({
  log: (message: string, ...args: unknown[]) => {
    console.log(
      `[${formatTimestamp(Date.now())}] [${context}] ${message}`,
      ...args
    );
  },
  error: (message: string, ...args: unknown[]) => {
    console.error(
      `[${formatTimestamp(Date.now())}] [${context}] ERROR: ${message}`,
      ...args
    );
  },
  warn: (message: string, ...args: unknown[]) => {
    console.warn(
      `[${formatTimestamp(Date.now())}] [${context}] WARN: ${message}`,
      ...args
    );
  },
  info: (message: string, ...args: unknown[]) => {
    console.info(
      `[${formatTimestamp(Date.now())}] [${context}] INFO: ${message}`,
      ...args
    );
  },
});
