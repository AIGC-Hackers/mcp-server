import type { Env } from "../types";

/**
 * Application configuration management
 */
export class Config {
	constructor(private env: Env) {}

	/**
	 * Get API configuration
	 */
	getApiConfig() {
		return {
			apiKey: this.env.API_KEY,
			serverHost: this.env.SERVER_HOST,
		};
	}

	/**
	 * Get timeout configuration
	 */
	getTimeoutConfig() {
		return {
			sseTimeout: 30000, // 30 seconds
			requestTimeout: 10000, // 10 seconds
		};
	}

	/**
	 * Get logging configuration
	 */
	getLogConfig() {
		return {
			level: this.env.LOG_LEVEL || "info",
			enableDebug: this.env.ENABLE_DEBUG === "true",
		};
	}

	/**
	 * Validate required environment variables
	 */
	validateEnvironment(): void {
		const required = ["API_KEY", "SERVER_HOST"];
		const missing = required.filter((key) => !this.env[key]);

		if (missing.length > 0) {
			throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
		}
	}
}

/**
 * Application constants
 */
export const CONSTANTS = {
	MCP: {
		SERVER_NAME: "A1D MCP Server",
		VERSION: "1.0.0",
	},
	API: {
		ENDPOINTS: {
			REMOVE_BG: "/api/remove-bg",
			IMAGE_UPSCALER: "/api/image-upscaler",
			TASK_SSE: "/api/task/{taskId}/sse",
		},
		HEADERS: {
			ACCEPT_JSON: "application/json",
			ACCEPT_SSE: "text/event-stream",
			CONTENT_TYPE_JSON: "application/json",
		},
		SOURCE: {
			WEB: "web",
		},
	},
	SSE: {
		DATA_PREFIX: "data:",
		EVENT_SEPARATOR: "\n\n",
	},
} as const;
