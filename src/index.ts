import { A1DMCPAgent } from './agents/mcpAgent';

// Export the refactored MCP Agent class with the original name
export { A1DMCPAgent as MyMCP };

// Create the default export following the original pattern
export default {
	fetch(request: Request, env: any, ctx: ExecutionContext) {
		const url = new URL(request.url);
		console.log("url", url);

		// Extract API key from request header
		const api_key = request.headers.get('api_key');
		// Print header values for debugging
		const headerObj: Record<string, string> = {};
		request.headers.forEach((value, key) => {
			headerObj[key] = value;
		});

		// Set API key in context if provided
		if (api_key) {
			ctx.props.API_KEY = api_key;
		} else {
			// throw error
			throw new Error("API key is required");
		}

		// Route requests based on path
		if (url.pathname === "/sse" || url.pathname === "/sse/message") {
			console.log("Handling SSE request with env:", env);
			// Using binding name for environment variable passing
			return (A1DMCPAgent.serveSSE("/sse") as any).fetch(request, env, ctx);
		}

		if (url.pathname === "/mcp") {
			console.log("Handling MCP request with env:", env);
			// Using binding name for environment variable passing
			return (A1DMCPAgent.serve("/mcp") as any).fetch(request, env, ctx);
		}

		return new Response("Not found", { status: 404 });
	},
};
