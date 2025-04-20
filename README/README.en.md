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

The server supports two running modes:

1. Standard stdio mode (default)
2. Stateless Streamable HTTP mode, providing HTTP endpoints

### Using NPX

If you have Node.js installed locally:

```bash
# Stdio mode
npx ygocdb-mcp-server

# Streamable HTTP mode
npx ygocdb-mcp-server --http
```

### Connecting to the Server

#### Stdio Mode

Your application or environment (such as Claude Desktop) can communicate directly with the server through stdio.

#### Streamable HTTP Mode

When running in Streamable HTTP mode (using the `--http` parameter):

The server will be available at the following endpoint:

- Streamable HTTP endpoint: `http://localhost:3000/mcp`

This mode operates in a stateless manner, without maintaining session information, providing a simplified and more efficient communication method.

### Integration in claude_desktop_config.json

Example configuration for stdio mode:

```json
{
  "mcpServers": {
    "ygocdb": {
      "command": "docker",
      "args": ["run", "-i", "--rm", "mcp/ygocdb"]
    }
  }
}
```

Or using npx:

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

### Building with Docker

```bash
docker build -t mcp/ygocdb .
```

Then you can run in stdio mode:

```bash
docker run -i --rm mcp/ygocdb
```

Or in Streamable HTTP mode:

```bash
docker run -i --rm -p 3000:3000 mcp/ygocdb --http
``` 