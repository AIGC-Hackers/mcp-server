# Configuration-Driven Tool Management System Architecture

## Overview

This project implements a highly configurable MCP (Model Context Protocol) tool management system that dramatically simplifies the process of adding new tools through a configuration file-driven approach.

## Design Philosophy

### Core Principles

1. **Configuration over Code**: Adding new tools only requires modifying JSON configuration, no code writing needed
2. **DRY Principle**: Avoid repetitive boilerplate code, all tools share base logic
3. **Type Safety**: Complete TypeScript support with compile-time error checking
4. **Unified Standards**: All tools follow the same error handling, validation, and monitoring patterns

### Architectural Advantages

- **Development Efficiency**: Adding new tools reduced from hours to minutes
- **Maintainability**: Centralized management, reduced code duplication
- **Consistency**: Unified error handling and user experience
- **Extensibility**: Support for runtime dynamic addition/removal of tools

## System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Tool Config    │───▶│  Tool Manager   │───▶│   MCP Agent     │
│  tools.json     │    │  ToolManager    │    │  A1DMCPAgent    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │                        │
                              ▼                        ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Base Endpoint  │◀───│  Base Service   │◀───│   MCP Server    │
│  BaseEndpoint   │    │  BaseService    │    │  McpServer      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Core Components

### 1. Tool Configuration File (`src/config/tools.json`)

Contains configuration information for all tools, serving as the core data source:

```json
{
  "tools": [
    {
      "name": "tool_name",
      "description": "Tool description",
      "apiEndpoint": "/api/endpoint",
      "methodName": "doAction",
      "inputSchema": {...},
      "requestBodyMapping": {...},
      "zodValidation": {...}
    }
  ]
}
```

### 2. Tool Manager (`src/config/toolManager.ts`)

- Singleton pattern for managing tool configurations
- Provides configuration validation functionality
- Supports runtime configuration modifications

### 3. Base Service Class (`src/service/baseService.ts`)

Abstracts common logic for all tools:
- API request handling
- SSE status monitoring
- Error handling
- Request body mapping

### 4. Base Endpoint Class (`src/endpoint/baseEndpoint.ts`)

Handles MCP protocol-related logic:
- Tool definition generation
- Input validation
- Zod Schema creation
- Tool execution

### 5. MCP Agent (`src/agents/mcpAgent.ts`)

- Dynamically loads tool configurations
- Automatically registers MCP tools
- Manages tool lifecycle

## Data Flow

```
1. Configuration Loading: ToolManager reads tools.json
2. Configuration Validation: Checks configuration completeness and correctness
3. Endpoint Creation: Creates BaseEndpoint instances for each tool
4. Tool Registration: Registers tools in MCP server
5. Request Processing: Through BaseEndpoint -> BaseService -> API
6. Result Return: Unified response format and error handling
```

## Configuration Mapping Mechanism

### Input Parameter Mapping

Maps MCP input parameters to API request body through `requestBodyMapping`:

```json
{
  "requestBodyMapping": {
    "imageUrl": "image_url",    // Field mapping
    "scale": "scale",           // Field mapping
    "source": "web"             // Static value
  }
}
```

### Validation Configuration

Defines input validation rules through `zodValidation`:

```json
{
  "zodValidation": {
    "image_url": {
      "type": "string",
      "validation": "url",
      "errorMessage": "Invalid URL"
    },
    "scale": {
      "type": "union",
      "values": [2, 4, 8, 16],
      "errorMessage": "Invalid scale"
    }
  }
}
```

## Type System

```typescript
interface ToolConfig {
  name: string;
  description: string;
  apiEndpoint: string;
  methodName: string;
  inputSchema: InputSchema;
  requestBodyMapping: Record<string, string>;
  zodValidation: Record<string, ZodValidationConfig>;
  defaultValues?: Record<string, any>;
}
```

## Extension Points

### 1. New Validation Types

Add new validation types in `BaseEndpoint.createZodValidator()`:

```typescript
case "email":
  return z.string().email(config.errorMessage);
```

### 2. Complex Mapping Logic

Handle complex parameter mapping in `BaseService.mapRequestBody()`.

### 3. Custom Middleware

Add tool-specific middleware logic in `BaseService.doExecuteTask()`.

## Best Practices

### Configuration Design

1. **Clear Naming**: Use descriptive tool names
2. **Complete Descriptions**: Provide detailed tool and parameter descriptions
3. **Appropriate Validation**: Set proper validation rules
4. **Consistent Mapping**: Maintain consistency in parameter mapping

### Error Handling

1. **Unified Error Format**: All errors handled through `createErrorResponse`
2. **Detailed Logging**: Record sufficient debugging information
3. **User-Friendly Messages**: Provide meaningful error messages

### Performance Optimization

1. **Configuration Caching**: ToolManager uses singleton pattern for configuration caching
2. **Lazy Loading**: Create tool instances on demand
3. **Connection Reuse**: Proper management of SSE connections

## Current Tool Implementations

The system currently supports the following AI-powered tools:

1. **remove_bg**: Remove background from images using AI
2. **image_upscaler**: Upscale images with configurable scale factors (2, 4, 8, 16)
3. **video_upscaler**: Upscale videos using AI
4. **image_vectorization**: Convert images to vector format
5. **image_extends**: Extend images using AI
6. **image_generator**: Generate images from text prompts

All tools follow the same pattern:
- URL-based input validation
- Asynchronous task processing with SSE monitoring
- Unified error handling and response formatting

## Future Improvements

1. **Configuration Hot Reload**: Support updating configurations without service restart
2. **Tool Version Management**: Support version control for tools
3. **Plugin Mechanism**: Support third-party tool plugins
4. **Configuration UI**: Graphical configuration management interface
5. **Performance Monitoring**: Performance statistics for tool calls
6. **Advanced Validation**: Support for more complex validation rules
7. **Batch Processing**: Support for processing multiple items simultaneously

## Summary

This configuration-driven system reduces the complexity of adding new tools from "developing new features" to "filling out configuration forms" through abstraction and standardization, greatly improving development efficiency and system maintainability. The architecture provides a solid foundation for scaling AI tool integrations while maintaining consistency and reliability. 