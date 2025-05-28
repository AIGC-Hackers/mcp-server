import type { ToolResponse } from "../types";

/**
 * Logger utility for consistent logging across the application
 */
export const logger = {
	info: (message: string, ...args: any[]) => {
		console.log(`[INFO] ${message}`, ...args);
	},
	error: (message: string, ...args: any[]) => {
		console.error(`[ERROR] ${message}`, ...args);
	},
	debug: (message: string, ...args: any[]) => {
		console.debug(`[DEBUG] ${message}`, ...args);
	},
	warn: (message: string, ...args: any[]) => {
		console.warn(`[WARN] ${message}`, ...args);
	},
};

/**
 * Ensure URL starts with https://
 */
export function ensureHttpsPrefix(url: string): string {
	if (url.startsWith("https://") || url.startsWith("http://")) {
		return url;
	}
	return `https://${url}`;
}

/**
 * Create success response
 */
export function createSuccessResponse(message: string): ToolResponse {
	return {
		content: [{ type: "text", text: message }],
	};
}

/**
 * Create error response
 */
export function createErrorResponse(error: Error): ToolResponse {
	return {
		content: [{ type: "text", text: `Error: ${error.message}` }],
	};
} 