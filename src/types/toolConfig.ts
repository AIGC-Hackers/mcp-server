export interface ToolConfig {
	name: string;
	description: string;
	apiEndpoint: string;
	methodName: string;
	inputSchema: {
		type: "object";
		properties: Record<string, PropertyConfig>;
		required: string[];
	};
	requestBodyMapping: Record<string, string | RequestBodyMappingValue>;
	zodValidation: Record<string, ZodValidationConfig>;
	defaultValues?: Record<string, any>;
}

export interface RequestBodyMappingValue {
	source: "input" | "static";
	value: string;
}

export interface PropertyConfig {
	type: string;
	description: string;
	validation?: string;
	enum?: (string | number)[];
}

export interface ZodValidationConfig {
	type: "string" | "number" | "union";
	validation?: string;
	values?: (string | number)[];
	errorMessage: string;
}

export interface ToolsConfig {
	tools: ToolConfig[];
}
