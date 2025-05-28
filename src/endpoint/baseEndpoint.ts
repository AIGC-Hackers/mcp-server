import { z } from "zod";
import type { Env, ToolResponse } from "../types";
import type { ToolConfig, ZodValidationConfig } from "../types/toolConfig";
import { BaseService } from "../service/baseService";
import { logger } from "../utils/helpers";

/**
 * Base Endpoint
 * Generic endpoint base class that handles common logic for all tool endpoints
 */
export class BaseEndpoint {
	private service: BaseService;

	constructor(
		private env: Env,
		private apiKey: string,
		private config: ToolConfig,
	) {
		this.service = new BaseService(env, apiKey, config);
	}

	/**
	 * Get tool definition
	 */
	getToolDefinition() {
		return {
			name: this.config.name,
			description: this.config.description,
			inputSchema: this.config.inputSchema,
		};
	}

	/**
	 * Get input validation schema
	 */
	getInputSchema() {
		const schema: Record<string, any> = {};

		for (const [key, validationConfig] of Object.entries(this.config.zodValidation)) {
			const isRequired = this.config.inputSchema.required.includes(key);
			schema[key] = this.createZodValidator(validationConfig, isRequired);
		}

		return schema;
	}

	/**
	 * Handle tool execution
	 */
	async execute(input: Record<string, any>): Promise<ToolResponse> {
		logger.info(`${this.config.name} tool execution started`, input);

		try {
			// Input validation
			const validatedInput = this.validateInput(input);

			// Execute service
			const result = await this.service.doExecuteTask(validatedInput);

			logger.info(`${this.config.name} tool execution completed successfully`);
			return result;
		} catch (error) {
			logger.error(`${this.config.name} tool execution failed`, error);
			const errorMessage = error instanceof Error ? error.message : String(error);
			return {
				content: [
					{ type: "text", text: `${this.config.description} failed: ${errorMessage}` },
				],
			};
		}
	}

	/**
	 * Validate input parameters
	 */
	private validateInput(input: Record<string, any>): Record<string, any> {
		// Use zod validation
		const schema = z.object(this.getInputSchema());
		const validated = schema.parse(input);
		return validated;
	}

	/**
	 * Create Zod validator
	 */
	private createZodValidator(config: ZodValidationConfig, isRequired: boolean): z.ZodType<any> {
		let validator: z.ZodType<any>;

		switch (config.type) {
			case "string":
				if (config.validation === "url") {
					validator = z.string().url(config.errorMessage);
				} else {
					validator = z.string({ message: config.errorMessage });
				}
				break;

			case "number":
				validator = z.number({ message: config.errorMessage });
				break;

			case "union":
				if (config.values) {
					const literals = config.values.map((value) => z.literal(value));
					validator = z.union(
						literals as [z.ZodLiteral<any>, z.ZodLiteral<any>, ...z.ZodLiteral<any>[]],
					);
				} else {
					throw new Error(
						`Union validation requires values for ${JSON.stringify(config)}`,
					);
				}
				break;

			default:
				throw new Error(`Unsupported validation type: ${config.type}`);
		}

		// If not required parameter, make it optional
		return isRequired ? validator : validator.optional();
	}

	/**
	 * Get Zod Schema for tool registration
	 */
	getZodSchemaForRegistration(): Record<string, z.ZodType<any>> {
		const schema: Record<string, z.ZodType<any>> = {};

		for (const [key, validationConfig] of Object.entries(this.config.zodValidation)) {
			const isRequired = this.config.inputSchema.required.includes(key);
			schema[key] = this.createZodValidator(validationConfig, isRequired);
		}

		return schema;
	}
}
