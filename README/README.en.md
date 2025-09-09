# Baige (ygocdb.com) MCP Server

English | [中文](../README.md)

A server based on [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) for interacting with the [Baige (ygocdb.com)](https://ygocdb.com/) API. Provides a set of tools for querying Yu-Gi-Oh! card information in Chinese.

[![smithery badge](https://smithery.ai/badge/@lieyanqzu/ygocdb-mcp)](https://smithery.ai/server/@lieyanqzu/ygocdb-mcp)

<a href="https://glama.ai/mcp/servers/@lieyanqzu/ygocdb-mcp">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/@lieyanqzu/ygocdb-mcp/badge" />
</a>

## API Documentation

This server is based on the public API of Baige (ygocdb.com).

- Card Search: `https://ygocdb.com/api/v0/?search=keyword`
- Card Images: `https://cdn.233.momobako.com/ygopro/pics/<id>.jpg`

## Features

- **search_cards**  
  Search Yu-Gi-Oh! cards by keywords, including card names and effect text.
  
- **get_card_by_id**  
  Get detailed information about a single Yu-Gi-Oh! card by its ID.
  
- **get_card_image**  
  Get the image of a Yu-Gi-Oh! card by its ID.

## Usage

### Using NPM Package

```bash
# Global installation
npm install -g ygocdb-mcp-server

# Or run directly (recommended)
npx ygocdb-mcp-server
```

### Local Development

```bash
# Clone the project
git clone <repository-url>
cd ygocdb-mcp

# Install dependencies
npm install

# Build the project
npm run build

# Run STDIO mode
npm run start:stdio

# Run HTTP mode
npm run start:http
```

### Running Modes

The server supports two running modes:

#### STDIO Mode (Default)
For direct integration with MCP clients like Claude Desktop:

```bash
npm run start:stdio
```

#### HTTP Mode
For container deployment or HTTP client access:

```bash
npm run start:http
```

The HTTP server will start on port 8081 with endpoint `http://localhost:8081/mcp`

### Integration with Claude Desktop

Add configuration to `claude_desktop_config.json`:

#### Using NPX (Recommended)
```json
{
  "mcpServers": {
    "ygocdb": {
      "command": "npx",
      "args": ["ygocdb-mcp-server"]
    }
  }
}
```

#### Using Local Build
```json
{
  "mcpServers": {
    "ygocdb": {
      "command": "node",
      "args": ["path/to/ygocdb-mcp/dist/index.js"],
      "cwd": "path/to/ygocdb-mcp"
    }
  }
}
```

### Docker Deployment

```bash
# Build image
docker build -t ygocdb-mcp .

# Run STDIO mode (for integration)
docker run -i --rm ygocdb-mcp

# Run HTTP mode (for service)
docker run -p 8081:8081 ygocdb-mcp
```

### Cross-Platform Support

The project uses `cross-env` to ensure proper environment variable setting across all platforms:

- **Windows**: `npm run start:http` or `npm run start:stdio`
- **macOS/Linux**: `npm run start:http` or `npm run start:stdio`
- **Docker**: Automatically uses HTTP mode 