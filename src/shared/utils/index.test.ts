// Tests for shared utilities
// Demonstrates Vitest testing patterns

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createMCPError,
  generateMessageId,
  isValidUrl,
  extractDomain,
  formatTimestamp,
  delay,
  safeJsonParse,
  safeJsonStringify,
  isValidTabId,
} from "./index";

describe("Shared Utilities", () => {
  describe("createMCPError", () => {
    it("should create error with code and message", () => {
      // Arrange
      const expectedCode = "TEST_ERROR";
      const expectedMessage = "Test error message";

      // Act
      const actualError = createMCPError(expectedCode, expectedMessage);

      // Assert
      expect(actualError).toEqual({
        code: expectedCode,
        message: expectedMessage,
        details: undefined,
      });
    });

    it("should create error with details", () => {
      // Arrange
      const expectedCode = "TEST_ERROR";
      const expectedMessage = "Test error message";
      const expectedDetails = { selector: "#test", timeout: 5000 };

      // Act
      const actualError = createMCPError(
        expectedCode,
        expectedMessage,
        expectedDetails
      );

      // Assert
      expect(actualError).toEqual({
        code: expectedCode,
        message: expectedMessage,
        details: expectedDetails,
      });
    });
  });

  describe("generateMessageId", () => {
    it("should generate unique IDs", () => {
      // Act
      const id1 = generateMessageId();
      const id2 = generateMessageId();

      // Assert
      expect(id1).not.toBe(id2);
      expect(typeof id1).toBe("string");
      expect(typeof id2).toBe("string");
    });

    it("should generate IDs with timestamp prefix", () => {
      // Arrange
      const beforeTimestamp = Date.now();

      // Act
      const messageId = generateMessageId();

      // Assert
      const afterTimestamp = Date.now();
      const idTimestamp = parseInt(messageId.split("-")[0]);
      expect(idTimestamp).toBeGreaterThanOrEqual(beforeTimestamp);
      expect(idTimestamp).toBeLessThanOrEqual(afterTimestamp);
    });
  });

  describe("isValidUrl", () => {
    it("should return true for valid URLs", () => {
      // Arrange
      const validUrls = [
        "https://example.com",
        "http://localhost:3000",
        "https://sub.domain.com/path?query=value",
        "ftp://files.example.com",
      ];

      // Act & Assert
      validUrls.forEach((url) => {
        expect(isValidUrl(url)).toBe(true);
      });
    });

    it("should return false for invalid URLs", () => {
      // Arrange
      const invalidUrls = [
        "not-a-url",
        "",
        "://invalid",
        "http://",
        "https://",
      ];

      // Act & Assert
      invalidUrls.forEach((url) => {
        expect(isValidUrl(url)).toBe(false);
      });
    });
  });

  describe("extractDomain", () => {
    it("should extract domain from valid URLs", () => {
      // Arrange
      const testCases = [
        { url: "https://example.com", expected: "example.com" },
        { url: "http://sub.domain.com/path", expected: "sub.domain.com" },
        { url: "https://localhost:3000", expected: "localhost" },
      ];

      // Act & Assert
      testCases.forEach(({ url, expected }) => {
        expect(extractDomain(url)).toBe(expected);
      });
    });

    it("should return null for invalid URLs", () => {
      // Arrange
      const invalidUrls = ["not-a-url", "", "http://"];

      // Act & Assert
      invalidUrls.forEach((url) => {
        expect(extractDomain(url)).toBeNull();
      });
    });
  });

  describe("formatTimestamp", () => {
    it("should format timestamp to ISO string", () => {
      // Arrange
      const timestamp = 1640995200000; // 2022-01-01T00:00:00.000Z

      // Act
      const formatted = formatTimestamp(timestamp);

      // Assert
      expect(formatted).toBe("2022-01-01T00:00:00.000Z");
    });
  });

  describe("delay", () => {
    it("should resolve after specified delay", async () => {
      // Arrange
      const delayMs = 100;
      const startTime = Date.now();

      // Act
      await delay(delayMs);

      // Assert
      const endTime = Date.now();
      const actualDelay = endTime - startTime;
      expect(actualDelay).toBeGreaterThanOrEqual(delayMs - 10); // Allow 10ms tolerance
    });
  });

  describe("safeJsonParse", () => {
    it("should parse valid JSON", () => {
      // Arrange
      const validJson = '{"key": "value", "number": 42}';
      const expected = { key: "value", number: 42 };

      // Act
      const result = safeJsonParse(validJson);

      // Assert
      expect(result).toEqual(expected);
    });

    it("should return null for invalid JSON", () => {
      // Arrange
      const invalidJson = '{"invalid": json}';

      // Act
      const result = safeJsonParse(invalidJson);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("safeJsonStringify", () => {
    it("should stringify valid objects", () => {
      // Arrange
      const obj = { key: "value", number: 42 };
      const expected = '{"key":"value","number":42}';

      // Act
      const result = safeJsonStringify(obj);

      // Assert
      expect(result).toBe(expected);
    });

    it("should return null for circular references", () => {
      // Arrange
      const circularObj: any = { key: "value" };
      circularObj.self = circularObj;

      // Act
      const result = safeJsonStringify(circularObj);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("isValidTabId", () => {
    it("should return true for valid tab IDs", () => {
      // Arrange
      const validTabIds = [1, 42, 999];

      // Act & Assert
      validTabIds.forEach((tabId) => {
        expect(isValidTabId(tabId)).toBe(true);
      });
    });

    it("should return false for invalid tab IDs", () => {
      // Arrange
      const invalidTabIds = [0, -1, 1.5, "1", null, undefined, NaN];

      // Act & Assert
      invalidTabIds.forEach((tabId) => {
        expect(isValidTabId(tabId)).toBe(false);
      });
    });
  });
});
