import type { ToolConfig, ToolsConfig } from "../types/toolConfig";
import toolsConfigJson from "./tools.json";

/**
 * Tool Manager
 * Tool configuration manager responsible for loading and managing tool configurations
 */
export class ToolManager {
	private static instance: ToolManager;
	private toolsConfig: ToolsConfig;

	private constructor() {
		this.toolsConfig = toolsConfigJson as unknown as ToolsConfig;
	}

	/**
	 * Get singleton instance
	 */
	static getInstance(): ToolManager {
		if (!ToolManager.instance) {
			ToolManager.instance = new ToolManager();
		}
		return ToolManager.instance;
	}

	/**
	 * Get all tool configurations
	 */
	getAllToolConfigs(): ToolConfig[] {
		return this.toolsConfig.tools;
	}

	/**
	 * Get tool configuration by name
	 */
	getToolConfig(name: string): ToolConfig | undefined {
		return this.toolsConfig.tools.find((tool) => tool.name === name);
	}

	/**
	 * Check if tool exists
	 */
	hasToolConfig(name: string): boolean {
		return this.toolsConfig.tools.some((tool) => tool.name === name);
	}

	/**
	 * Get list of tool names
	 */
	getToolNames(): string[] {
		return this.toolsConfig.tools.map((tool) => tool.name);
	}

	/**
	 * Validate tool configuration integrity
	 */
	validateToolConfig(config: ToolConfig): boolean {
		// Check required fields
		const requiredFields = [
			"name",
			"description",
			"apiEndpoint",
			"methodName",
			"inputSchema",
			"requestBodyMapping",
			"zodValidation",
		];

		for (const field of requiredFields) {
			if (!config[field as keyof ToolConfig]) {
				throw new Error(`Tool config missing required field: ${field}`);
			}
		}

		// Check if required fields in input schema are defined in zodValidation
		for (const requiredField of config.inputSchema.required) {
			if (!config.zodValidation[requiredField]) {
				throw new Error(
					`Required field ${requiredField} missing zodValidation in tool ${config.name}`,
				);
			}
		}

		// Validate default values (if exists)
		if (config.defaultValues) {
			for (const [field, defaultValue] of Object.entries(config.defaultValues)) {
				// Check if default value field is defined in zodValidation
				if (!config.zodValidation[field]) {
					throw new Error(
						`Default value field ${field} missing zodValidation in tool ${config.name}`,
					);
				}
				// Check if default value field is defined in requestBodyMapping
				if (
					!config.requestBodyMapping[field] &&
					!Object.values(config.requestBodyMapping).includes(field)
				) {
					throw new Error(
						`Default value field ${field} not found in requestBodyMapping for tool ${config.name}`,
					);
				}
			}
		}

		return true;
	}

	/**
	 * Validate all tool configurations
	 */
	validateAllConfigs(): boolean {
		for (const config of this.toolsConfig.tools) {
			this.validateToolConfig(config);
		}
		return true;
	}

	/**
	 * Add new tool configuration (runtime)
	 */
	addToolConfig(config: ToolConfig): void {
		// Validate configuration
		this.validateToolConfig(config);

		// Check if already exists
		if (this.hasToolConfig(config.name)) {
			throw new Error(`Tool ${config.name} already exists`);
		}

		// Add configuration
		this.toolsConfig.tools.push(config);
	}

	/**
	 * Update tool configuration (runtime)
	 */
	updateToolConfig(name: string, config: ToolConfig): void {
		const index = this.toolsConfig.tools.findIndex((tool) => tool.name === name);
		if (index === -1) {
			throw new Error(`Tool ${name} not found`);
		}

		// Validate configuration
		this.validateToolConfig(config);

		// Update configuration
		this.toolsConfig.tools[index] = config;
	}

	/**
	 * Delete tool configuration (runtime)
	 */
	removeToolConfig(name: string): boolean {
		const index = this.toolsConfig.tools.findIndex((tool) => tool.name === name);
		if (index === -1) {
			return false;
		}

		this.toolsConfig.tools.splice(index, 1);
		return true;
	}
}
