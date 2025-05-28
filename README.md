# A1D MCP Server - Universal AI Tools

A powerful MCP (Model Context Protocol) server that provides AI image and video processing tools for any MCP-compatible client. Ready to use with zero setup required.

## 🤖 Available AI Tools

| Tool | Description | Use Cases |
|------|-------------|-----------|
| **remove_bg** | AI background removal | Remove backgrounds from photos, product images |
| **image_upscaler** | AI image enhancement | Upscale images 2x, 4x, 8x, 16x resolution |
| **video_upscaler** | AI video enhancement | Improve video quality and resolution |
| **image_vectorization** | Convert to vectors | Turn images into scalable SVG graphics |
| **image_extends** | Smart image extension | Expand image boundaries intelligently |
| **image_generator** | Text-to-image AI | Generate images from text descriptions |

## 🚀 Quick Setup (2 minutes)

### 1. Get Your API Key
- Visit [A1D.ai](https://a1d.ai/home/api) to get your free API key
- Optional: [Purchase credits](https://a1d.ai/pricing) for extended usage

### 2. Connect Your MCP Client

**For Claude Desktop:**
Add this to your Claude Desktop configuration file:

```json
{
  "mcpServers": {
    "a1d": {
      "command": "npx",
      "args": [
        "mcp-remote@latest",
        "https://mcp.a1d.ai/sse",
        "--header",
        "api_key:${MCP_API_KEY}"
      ],
      "env": {
        "MCP_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

**For MCP Inspector:**
- Start: `npx @modelcontextprotocol/inspector`
- Transport Type: `SSE`
- URL: `https://mcp.a1d.ai/sse`
- Add header: `api_key: your_api_key_here`

**For other MCP clients:**
- Server URL: `https://mcp.a1d.ai/sse`
- Authentication: Header `api_key: your_api_key_here`

### 3. Restart Your Client
That's it! You'll see the AI tools available in your MCP client.

## 💡 How to Use

Once configured, simply ask your AI assistant to help with image or video tasks:

- *"Remove the background from this image"*
- *"Upscale this image to 4x resolution"*
- *"Convert this photo to a vector graphic"*
- *"Generate an image of a sunset over mountains"*

## 🔧 Configuration Help

### Claude Desktop Configuration File Locations

**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Linux:** `~/.config/Claude/claude_desktop_config.json`

### Troubleshooting

**Tools not showing up?**
- Restart your MCP client after adding configuration
- Verify your API key is correct
- Check the configuration file syntax

**Connection issues?**
```bash
# Test the connection directly
npx mcp-remote https://mcp.a1d.ai/sse --header "api_key:your_api_key"
```

**Clear cache if needed:**
```bash
rm -rf ~/.mcp-auth
```

## 📚 Resources

- **[API Documentation](https://a1d.ai/api/quick-start)** - Detailed API reference
- **[Get API Key](https://a1d.ai/home/api)** - Free registration
- **[Pricing](https://a1d.ai/pricing)** - Credit packages

## 🛠️ For Developers

Want to add more tools or customize the server? This repository contains the complete source code with a configuration-driven architecture.

### Local Development
```bash
git clone https://github.com/AIGC-Hackers/a1d-mcp-server.git
cd a1d-mcp-server
npm install
npm run start
```

The local server will start on `http://localhost:8787`. You can test it with your API key by adding the `api_key` header to requests.

### Adding New Tools
Simply edit `src/config/tools.json` to add new AI tools without writing code:

```json
{
  "name": "new_tool",
  "description": "Tool description",
  "apiEndpoint": "/api/endpoint",
  "inputSchema": { /* ... */ },
  "zodValidation": { /* ... */ }
}
```

See [docs/ADD_NEW_TOOL.md](docs/ADD_NEW_TOOL.md) for detailed instructions.

## 🔐 Security

- **User-provided credentials**: This server expects users to provide their own A1D API keys via headers
- **No stored secrets**: All API keys are passed through request headers, nothing is stored server-side
- **Report vulnerabilities**: See [SECURITY.md](SECURITY.md) for responsible disclosure

## 🤝 Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch
3. Follow the existing code style
4. Add tests for new features
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <strong>Built with ❤️ by the A1D Team</strong><br>
  <a href="https://a1d.ai">A1D.ai</a> • 
  <a href="https://github.com/AIGC-Hackers/a1d-mcp-server">GitHub</a> • 
  <a href="https://a1d.ai/api/quick-start">API Docs</a>
</div>
