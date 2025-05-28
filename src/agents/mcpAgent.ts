import { McpAgent } from "agents/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { Env } from "../types";
import { BaseEndpoint } from "../endpoint/baseEndpoint";
import { ToolManager } from "../config/toolManager";
import { logger } from "../utils/helpers";

/**
 * A1D MCP Agent
 * Main MCP agent class responsible for registering and managing all tools
 */
export class A1DMCPAgent extends McpAgent<Env> {
	server = new McpServer({
		name: "A1D MCP Server",
		version: "1.0.0",
	});

	private toolManager!: ToolManager;
	private endpoints: Map<string, BaseEndpoint> = new Map();

	async init() {
		logger.info("Initializing A1D MCP Agent");

		try {
			// Initialize tool manager
			this.toolManager = ToolManager.getInstance();

			// Validate all tool configurations
			this.toolManager.validateAllConfigs();

			// Initialize endpoint controllers
			this.initializeEndpoints();

			// Register tools
			this.registerTools();

			logger.info("A1D MCP Agent initialized successfully");
		} catch (error) {
			logger.error("Failed to initialize A1D MCP Agent", error);
			throw error;
		}
	}

	/**
	 * Initialize all endpoint controllers
	 */
	private initializeEndpoints() {
		const apiKey = this.props.API_KEY as string;
		if (!apiKey) {
			throw new Error("API_KEY not found in environment variables");
		}

		logger.info("Initializing endpoints with API key");

		// Create endpoints for each tool configuration
		const toolConfigs = this.toolManager.getAllToolConfigs();
		for (const config of toolConfigs) {
			const endpoint = new BaseEndpoint(this.env, apiKey, config);
			this.endpoints.set(config.name, endpoint);
			logger.info(`Initialized endpoint for tool: ${config.name}`);
		}
	}

	/**
	 * Register all MCP tools
	 */
	private registerTools() {
		logger.info("Registering MCP tools");

		// Dynamically register all configured tools
		const toolConfigs = this.toolManager.getAllToolConfigs();
		for (const config of toolConfigs) {
			this.registerTool(config.name);
		}

		logger.info(`Successfully registered ${toolConfigs.length} tools`);
	}

	/**
	 * Register a single tool
	 */
	private registerTool(toolName: string) {
		const endpoint = this.endpoints.get(toolName);
		if (!endpoint) {
			logger.error(`Endpoint not found for tool: ${toolName}`);
			return;
		}

		const toolConfig = this.toolManager.getToolConfig(toolName);
		if (!toolConfig) {
			logger.error(`Config not found for tool: ${toolName}`);
			return;
		}

		logger.info(`Registering tool: ${toolName}`);

		try {
			// Get Zod Schema
			const zodSchema = endpoint.getZodSchemaForRegistration();

			this.server.tool(toolName, zodSchema, async (input: Record<string, any>) => {
				const toolEndpoint = this.endpoints.get(toolName);
				if (!toolEndpoint) {
					throw new Error(`Endpoint not available for tool: ${toolName}`);
				}
				return await toolEndpoint.execute(input);
			});

			logger.info(`Successfully registered tool: ${toolName}`);
		} catch (error) {
			logger.error(`Failed to register tool ${toolName}:`, error);
		}
	}

	/**
	 * Dynamically add new tool (runtime)
	 */
	async addTool(toolName: string): Promise<boolean> {
		try {
			// Check if tool configuration exists
			const config = this.toolManager.getToolConfig(toolName);
			if (!config) {
				logger.error(`Tool config not found: ${toolName}`);
				return false;
			}

			// Check if already registered
			if (this.endpoints.has(toolName)) {
				logger.info(`Tool already registered: ${toolName}`);
				return true;
			}

			// Create endpoint
			const apiKey = this.props.API_KEY as string;
			const endpoint = new BaseEndpoint(this.env, apiKey, config);
			this.endpoints.set(toolName, endpoint);

			// Register tool
			this.registerTool(toolName);

			logger.info(`Successfully added tool: ${toolName}`);
			return true;
		} catch (error) {
			logger.error(`Failed to add tool ${toolName}:`, error);
			return false;
		}
	}

	/**
	 * Remove tool (runtime)
	 */
	removeTool(toolName: string): boolean {
		try {
			// Remove endpoint
			const removed = this.endpoints.delete(toolName);

			if (removed) {
				logger.info(`Successfully removed tool: ${toolName}`);
			} else {
				logger.info(`Tool not found: ${toolName}`);
			}

			return removed;
		} catch (error) {
			logger.error(`Failed to remove tool ${toolName}:`, error);
			return false;
		}
	}

	/**
	 * Get list of registered tools
	 */
	getRegisteredTools(): string[] {
		return Array.from(this.endpoints.keys());
	}
}
