# Adding New Tools Guide

This document explains how to add new MCP tools using the configuration-driven approach.

## Overview

The new configuration-driven system allows you to add new tools by simply modifying JSON configuration files, without writing additional code. All tools share the same base logic, differing only in API endpoints, parameters, and validation rules.

## Adding New Tools

### 1. Modify Tool Configuration File

Edit the `src/config/tools.json` file and add a new tool configuration to the `tools` array:

```json
{
  "name": "your_tool_name",
  "description": "Tool description",
  "apiEndpoint": "/api/your-endpoint",
  "methodName": "doYourAction",
  "inputSchema": {
    "type": "object",
    "properties": {
      "param1": {
        "type": "string",
        "description": "Parameter 1 description",
        "validation": "url"
      },
      "param2": {
        "type": "number",
        "enum": [1, 2, 3],
        "description": "Parameter 2 description"
      }
    },
    "required": ["param1", "param2"]
  },
  "requestBodyMapping": {
    "apiParam1": "param1",
    "apiParam2": "param2",
    "staticValue": "fixed_value"
  },
  "zodValidation": {
    "param1": {
      "type": "string",
      "validation": "url",
      "errorMessage": "Invalid URL format"
    },
    "param2": {
      "type": "union",
      "values": [1, 2, 3],
      "errorMessage": "Value must be 1, 2, or 3"
    }
  },
  "defaultValues": {
    "scale": 2,
    "quality": 80,
    "format": "jpeg"
  }
}
```

### 2. Configuration Field Descriptions

- **name**: Tool name, used as the tool identifier in MCP protocol
- **description**: Tool description, displayed in tool definitions
- **apiEndpoint**: Backend API path
- **methodName**: Method name (mainly used for logging and identification)
- **inputSchema**: MCP tool input schema definition
- **requestBodyMapping**: Mapping from input parameters to API request body
- **zodValidation**: Zod validation configuration
- **defaultValues** (optional): Default values for parameters, used to set defaults for optional parameters

### 3. requestBodyMapping Details

The mapping supports two types of values:

1. **String values**: Can be input field names or static values
   ```json
   {
     "imageUrl": "image_url",  // Get image_url field from input
     "scale": "scale"          // Get scale field from input
   }
   ```

2. **Object values** (not yet implemented, but type-supported):
   ```json
   {
     "imageUrl": {
       "source": "input",
       "value": "image_url"
     },
     "staticValue": {
       "source": "static", 
       "value": "fixed_value"
     }
   }
   ```

**Note**: The system automatically adds `source: "mcp"` parameter to all requests, no need to manually add it in configuration.

### 4. zodValidation Configuration

Supported validation types:

- **string**: String validation
  ```json
  {
    "type": "string",
    "validation": "url",  // Optional: URL validation
    "errorMessage": "Error message"
  }
  ```

- **number**: Number validation
  ```json
  {
    "type": "number",
    "errorMessage": "Error message"
  }
  ```

- **union**: Union type (enum values)
  ```json
  {
    "type": "union",
    "values": [2, 4, 8, 16],
    "errorMessage": "Error message"
  }
  ```

### 5. defaultValues Configuration

When certain parameters are optional and have default values, configure them in `defaultValues`:

```json
{
  "defaultValues": {
    "scale": 2,
    "quality": 80,
    "format": "jpeg"
  }
}
```

**Usage Rules**:
- Parameters with default values don't need to be listed in `inputSchema.required`
- Default values are automatically applied when users don't provide parameters
- Must define validation rules in `zodValidation`
- Must have corresponding mapping in `requestBodyMapping`

**Example**: The `scale` parameter in the `image_upscaler` tool defaults to 2, users can omit this parameter.

## Example: Adding Image Compression Tool

Suppose we want to add an image compression tool:

```json
{
  "name": "image_compressor",
  "description": "Compress images with specified quality",
  "apiEndpoint": "/api/image-compressor",
  "methodName": "doCompressImage",
  "inputSchema": {
    "type": "object",
    "properties": {
      "image_url": {
        "type": "string",
        "description": "The URL of the image to compress",
        "validation": "url"
      },
      "quality": {
        "type": "number",
        "description": "Compression quality (1-100)"
      },
      "format": {
        "type": "string",
        "enum": ["jpeg", "webp", "png"],
        "description": "Output format"
      }
    },
    "required": ["image_url", "quality"]
  },
  "requestBodyMapping": {
    "imageUrl": "image_url",
    "quality": "quality",
    "format": "format"
  },
  "zodValidation": {
    "image_url": {
      "type": "string",
      "validation": "url",
      "errorMessage": "Invalid image URL format"
    },
    "quality": {
      "type": "number",
      "errorMessage": "Quality must be a number"
    },
    "format": {
      "type": "union",
      "values": ["jpeg", "webp", "png"],
      "errorMessage": "Format must be jpeg, webp, or png"
    }
  },
  "defaultValues": {
    "format": "jpeg"
  }
}
```

## Restart Service

After adding new tool configuration, restart the service to automatically load the new tool:

```bash
npm start
```

## Validate Tool Configuration

The system automatically validates all tool configurations at startup. If there are configuration errors, error messages will be displayed in the logs.

## Advantages

1. **No code required**: Only need to modify JSON configuration files
2. **Unified error handling**: All tools share the same error handling logic
3. **Automated validation**: Input validation and type checking handled automatically
4. **Easy maintenance**: Centralized management of all tool configurations
5. **Runtime management**: Support for dynamic addition and removal of tools (future feature)

## Notes

1. Ensure `apiEndpoint` matches the backend API path
2. Field names in `requestBodyMapping` must match the field names expected by the backend API
3. `zodValidation` must cover all fields in `inputSchema.required`
4. Tool names must be unique 