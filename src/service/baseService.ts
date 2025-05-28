import type { Env, TaskResponse, ToolResponse } from "../types";
import type { ToolConfig, RequestBodyMappingValue } from "../types/toolConfig";
import {
	ensureHttpsPrefix,
	logger,
	createSuccessResponse,
	createErrorResponse,
} from "../utils/helpers";

/**
 * Base Service
 * Generic service base class that handles common logic for all tools
 */
export class BaseService {
	constructor(
		private env: Env,
		private apiKey: string,
		private config: ToolConfig,
	) {}

	/**
	 * Submit task to API
	 */
	async doSubmitTask(input: Record<string, any>): Promise<TaskResponse> {
		const apiUrl = ensureHttpsPrefix(`${this.env.SERVER_HOST}${this.config.apiEndpoint}`);

		// Map request body according to configuration
		const requestBody = this.mapRequestBody(input);

		// Add MCP source identifier
		requestBody.source = "mcp";

		logger.info(`Submitting ${this.config.name} task`, {
			apiUrl,
			input: requestBody,
		});

		const response = await fetch(apiUrl, {
			method: "POST",
			headers: {
				accept: "application/json",
				"Content-Type": "application/json",
				Authorization: `KEY ${this.apiKey}`,
			},
			body: JSON.stringify(requestBody),
		});

		if (!response.ok) {
			const errorText = await response.text().catch(() => "Unable to read error response");
			logger.error(`API request failed: ${response.status} ${response.statusText}`, {
				url: response.url,
				response: errorText,
			});
			throw new Error(`API request failed(${response.status}): ${errorText}`);
		}

		const taskStatus = (await response.json()) as TaskResponse;
		logger.info("Task submitted successfully", taskStatus);

		return taskStatus;
	}

	/**
	 * Monitor task status via SSE
	 */
	async doMonitorTaskViaSSE(taskId: string): Promise<ToolResponse> {
		const sseUrl = ensureHttpsPrefix(`${this.env.SERVER_HOST}/api/task/${taskId}/sse`);
		logger.info("Starting SSE connection", { sseUrl, taskId });

		const response = await fetch(sseUrl, {
			headers: {
				accept: "text/event-stream",
				Authorization: `KEY ${this.apiKey}`,
			},
		});

		if (!response.ok) {
			const errorText = await response.text().catch(() => "Unable to read error response");
			logger.error(
				`SSE connection failed: ${response.status} ${response.statusText}`,
				errorText,
			);
			throw new Error(`SSE connection failed(${response.status}): ${errorText}`);
		}

		if (!response.body) {
			throw new Error("SSE response did not provide a data stream");
		}

		return this.processSSEStream(response.body);
	}

	/**
	 * Process SSE data stream
	 */
	private async processSSEStream(body: ReadableStream<Uint8Array>): Promise<ToolResponse> {
		const reader = body.getReader();
		const decoder = new TextDecoder();
		let buffer = "";

		try {
			while (true) {
				const { value, done } = await reader.read();
				if (done) break;

				buffer += decoder.decode(value, { stream: true });

				// Process events
				const lines = buffer.split("\n\n");
				buffer = lines.pop() || "";

				for (const line of lines) {
					if (line.trim() === "") continue;

					logger.debug("SSE event received", line);

					// Extract data part
					if (line.startsWith("data:")) {
						try {
							const eventData = JSON.parse(line.slice(5).trim()) as TaskResponse;
							logger.info("Task status update", { status: eventData.status });

							if (eventData.status === "FINISHED") {
								reader.cancel();
								
								// Build richer success message
								let successMessage = `Task completed: ${eventData.imageUrl}`;
								if (eventData.duration) {
									successMessage += `\nDuration: ${eventData.duration}s`;
								}
								if (eventData.mimeType) {
									successMessage += `\nMime Type: ${eventData.mimeType}`;
								}
								if (eventData.thumbUrl) {
									successMessage += `\nThumbnail: ${eventData.thumbUrl}`;
								}
								
								return createSuccessResponse(successMessage);
							}
							if (eventData.status === "FAILED") {
								reader.cancel();
								throw new Error("Task failed");
							}
						} catch (e) {
							logger.error("Failed to parse SSE data", e);
						}
					}
				}
			}

			// If SSE stream ends without result, return timeout error
			throw new Error("Task monitoring timed out");
		} finally {
			reader.releaseLock();
		}
	}

	/**
	 * Execute complete task workflow
	 */
	async doExecuteTask(input: Record<string, any>): Promise<ToolResponse> {
		try {
			// 1. Submit task
			const taskStatus = await this.doSubmitTask(input);

			// 2. If task is already completed, return result directly
			if (taskStatus.status === "FINISHED" && taskStatus.imageUrl) {
				logger.info("Task completed immediately", taskStatus.imageUrl);
				return createSuccessResponse(`Task completed: ${taskStatus.imageUrl}`);
			}

			// 3. Monitor task status via SSE
			return await this.doMonitorTaskViaSSE(taskStatus.taskId);
		} catch (error) {
			logger.error(`${this.config.name} process failed`, error);
			return createErrorResponse(error instanceof Error ? error : new Error(String(error)));
		}
	}

	/**
	 * Map request body according to configuration
	 */
	private mapRequestBody(input: Record<string, any>): Record<string, any> {
		// Apply default values
		const inputWithDefaults = { ...input };
		if (this.config.defaultValues) {
			for (const [key, defaultValue] of Object.entries(this.config.defaultValues)) {
				if (inputWithDefaults[key] === undefined) {
					inputWithDefaults[key] = defaultValue;
				}
			}
		}

		const requestBody: Record<string, any> = {};

		for (const [targetKey, mapping] of Object.entries(this.config.requestBodyMapping)) {
			if (typeof mapping === "string") {
				// Simple string mapping, could be field name or static value
				if (mapping in inputWithDefaults) {
					// Get value from input
					requestBody[targetKey] = inputWithDefaults[mapping];
				} else {
					// Static value (like "web")
					requestBody[targetKey] = mapping;
				}
			} else {
				// Complex mapping object
				if (mapping.source === "input" && mapping.value in inputWithDefaults) {
					requestBody[targetKey] = inputWithDefaults[mapping.value];
				} else if (mapping.source === "static") {
					requestBody[targetKey] = mapping.value;
				}
			}
		}

		return requestBody;
	}
}
