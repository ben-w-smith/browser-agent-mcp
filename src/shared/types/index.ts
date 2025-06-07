// Shared types for Browser Agent MCP
// Used across extension and server components

export interface MCPMessage {
  readonly id: string;
  readonly method: string;
  readonly params?: Record<string, unknown>;
}

export interface MCPResponse {
  readonly id: string;
  readonly result?: unknown;
  readonly error?: MCPError;
}

export interface MCPError {
  readonly code: string;
  readonly message: string;
  readonly details?: Record<string, unknown>;
}

export interface DOMElement {
  readonly index: number;
  readonly tagName: string;
  readonly textContent: string;
  readonly innerHTML: string;
  readonly outerHTML: string;
  readonly attributes: Record<string, string>;
  readonly boundingRect: DOMRect;
  readonly visible: boolean;
  readonly clickable: boolean;
}

export interface DOMQueryParams {
  readonly selector: string;
  readonly action?: "query" | "getText" | "getAttributes" | "getHTML";
  readonly tabId?: number;
}

export interface DOMActionParams {
  readonly selector: string;
  readonly tabId?: number;
}

export interface TypeTextParams extends DOMActionParams {
  readonly text: string;
  readonly clear?: boolean;
}

export interface ConsoleLogEntry {
  readonly level: "log" | "error" | "warn" | "info";
  readonly message: string;
  readonly timestamp: number;
  readonly tabId?: number;
}

export interface NetworkRequest {
  readonly url: string;
  readonly method: string;
  readonly status?: number;
  readonly timestamp: number;
  readonly tabId?: number;
  readonly headers?: Record<string, string>;
  readonly responseBody?: string;
}

export interface PageInfo {
  readonly url: string;
  readonly title: string;
  readonly readyState: DocumentReadyState;
  readonly forms: FormInfo[];
  readonly links: LinkInfo[];
  readonly images: ImageInfo[];
}

export interface FormInfo {
  readonly id?: string;
  readonly name?: string;
  readonly action?: string;
  readonly method?: string;
  readonly inputs: InputInfo[];
}

export interface InputInfo {
  readonly type: string;
  readonly name?: string;
  readonly id?: string;
  readonly placeholder?: string;
  readonly required: boolean;
}

export interface LinkInfo {
  readonly href: string;
  readonly text: string;
  readonly target?: string;
}

export interface ImageInfo {
  readonly src: string;
  readonly alt?: string;
  readonly width?: number;
  readonly height?: number;
}

export interface ExtensionMessage {
  readonly type: string;
  readonly payload: Record<string, unknown>;
}

export interface ExtensionResponse {
  readonly success: boolean;
  readonly data?: unknown;
  readonly error?: string;
}

export interface TabInfo {
  readonly id: number;
  readonly url: string;
  readonly title: string;
  readonly active: boolean;
}

export interface DevToolsSession {
  readonly tabId: number;
  readonly sessionId: string;
  readonly attached: boolean;
}

// Tool-specific types
export interface ToolResult {
  readonly success: boolean;
  readonly data?: unknown;
  readonly error?: MCPError;
}

export interface DOMQueryResult extends ToolResult {
  readonly data?: DOMElement[];
}

export interface ConsoleLogsResult extends ToolResult {
  readonly data?: ConsoleLogEntry[];
}

export interface NetworkRequestsResult extends ToolResult {
  readonly data?: NetworkRequest[];
}

export interface PageInfoResult extends ToolResult {
  readonly data?: PageInfo;
}
