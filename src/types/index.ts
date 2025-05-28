// Types for API responses
export interface ApiResponse<T = any> {
	code: number;
	message: string;
	data: T;
}

export interface TaskResponse {
	taskId: string;
	status: "WAITING" | "PROCESSING" | "FINISHED" | "FAILED";
	imageUrl?: string;
	mimeType?: string;
	thumbUrl?: string;
	duration?: number;
}

// Legacy interface for backward compatibility
export interface LegacyTaskResponse {
	taskId: string;
	taskDetails: {
		id: string;
		status: "WAITING" | "PROCESSING" | "FINISHED" | "FAILED";
		result: {
			data: {
				result_url: string;
				[key: string]: unknown;
			};
		};
	};
}

// MCP Tool response types
export type ToolResponse = {
	content: Array<{
		type: "text";
		text: string;
	}>;
};

// Environment interface
export interface Env {
	API_KEY: string;
	SERVER_HOST: string;
	[key: string]: any;
}
