// Shared constants for Browser Agent MCP
// Used across extension and server components

export const MCP_SERVER_CONFIG = {
  PORT: 3000,
  RECONNECT_INTERVAL: 5000,
  MAX_RECONNECT_ATTEMPTS: 10,
} as const;

export const DOM_QUERY_CONFIG = {
  DEFAULT_TIMEOUT: 5000,
  DEFAULT_INTERVAL: 100,
  MAX_ELEMENTS: 1000,
} as const;

export const MESSAGE_TYPES = {
  // Extension to Background
  DOM_QUERY: "DOM_QUERY",
  DOM_CLICK: "DOM_CLICK",
  DOM_TYPE: "DOM_TYPE",
  GET_PAGE_INFO: "GET_PAGE_INFO",
  CONSOLE_LOG: "CONSOLE_LOG",
  NETWORK_REQUEST: "NETWORK_REQUEST",

  // Background to MCP Server
  MCP_CONNECT: "MCP_CONNECT",
  MCP_DISCONNECT: "MCP_DISCONNECT",
  MCP_MESSAGE: "MCP_MESSAGE",
} as const;

export const MCP_METHODS = {
  DOM_QUERY: "dom/query",
  DOM_CLICK: "dom/click",
  DOM_TYPE: "dom/type",
  GET_PAGE_INFO: "page/getInfo",
  GET_CONSOLE_LOGS: "console/getLogs",
  GET_NETWORK_REQUESTS: "network/getRequests",
} as const;

export const ERROR_CODES = {
  // General errors
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
  INVALID_PARAMS: "INVALID_PARAMS",
  TIMEOUT: "TIMEOUT",

  // DOM errors
  ELEMENT_NOT_FOUND: "ELEMENT_NOT_FOUND",
  INVALID_SELECTOR: "INVALID_SELECTOR",
  ELEMENT_NOT_CLICKABLE: "ELEMENT_NOT_CLICKABLE",
  ELEMENT_NOT_VISIBLE: "ELEMENT_NOT_VISIBLE",

  // Tab errors
  TAB_NOT_FOUND: "TAB_NOT_FOUND",
  TAB_NOT_ACCESSIBLE: "TAB_NOT_ACCESSIBLE",

  // Connection errors
  MCP_CONNECTION_FAILED: "MCP_CONNECTION_FAILED",
  EXTENSION_NOT_CONNECTED: "EXTENSION_NOT_CONNECTED",

  // DevTools errors
  DEVTOOLS_ATTACH_FAILED: "DEVTOOLS_ATTACH_FAILED",
  DEVTOOLS_COMMAND_FAILED: "DEVTOOLS_COMMAND_FAILED",
} as const;

export const CONSOLE_LOG_LEVELS = {
  LOG: "log",
  ERROR: "error",
  WARN: "warn",
  INFO: "info",
} as const;

export const HTTP_METHODS = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  DELETE: "DELETE",
  PATCH: "PATCH",
  HEAD: "HEAD",
  OPTIONS: "OPTIONS",
} as const;

export const CLICKABLE_TAGS = [
  "a",
  "button",
  "input",
  "select",
  "textarea",
  "label",
  "option",
] as const;

export const INPUT_TYPES = [
  "text",
  "email",
  "password",
  "number",
  "tel",
  "url",
  "search",
  "textarea",
] as const;

export const EXTENSION_CONFIG = {
  POPUP_WIDTH: 400,
  POPUP_HEIGHT: 600,
  CONTENT_SCRIPT_RETRY_DELAY: 1000,
  BACKGROUND_HEARTBEAT_INTERVAL: 30000,
} as const;
