# 百鸽(ygocdb.com) MCP Server

[English](README/README.en.md) | 中文

一个基于 [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) 的服务端，用于与 [百鸽(ygocdb.com)](https://ygocdb.com/)等 API 交互。提供了一系列工具来查询游戏王中文卡牌信息。

[![smithery badge](https://smithery.ai/badge/@lieyanqzu/ygocdb-mcp)](https://smithery.ai/server/@lieyanqzu/ygocdb-mcp)

<a href="https://glama.ai/mcp/servers/@lieyanqzu/ygocdb-mcp">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/@lieyanqzu/ygocdb-mcp/badge" />
</a>

## API 文档

本服务端基于游戏王卡牌数据库的公开 API。

- 卡牌搜索: `https://ygocdb.com/api/v0/?search=关键字`
- 卡牌图片: `https://cdn.233.momobako.com/ygopro/pics/<id>.jpg`

## 使用示例

![使用示例](README/use_case.png)

## 功能特性

- **search_cards**  
  通过关键字搜索游戏王卡牌，可以搜索卡牌名称、效果文本等。
  
- **get_card_by_id**  
  通过卡牌ID获取单张游戏王卡牌的详细信息。
  
- **get_card_image**  
  通过卡牌ID获取游戏王卡牌的图片。

## 使用方法

服务端支持两种运行模式：

1. 标准 stdio 模式（默认）
2. 无状态 Streamable HTTP 模式，提供 HTTP 端点

### 使用 NPX

如果你本地安装了 Node.js：

```bash
# Stdio 模式
npx ygocdb-mcp-server

# Streamable HTTP 模式
npx ygocdb-mcp-server --http
```

### 连接到服务端

#### Stdio 模式

你的应用程序或环境（如 Claude Desktop）可以通过 stdio 直接与服务端通信。

#### Streamable HTTP 模式

当使用 Streamable HTTP 模式运行时（使用 `--http` 参数）：

服务端将在以下端点可用：

- Streamable HTTP 端点：`http://localhost:3000/mcp`

该模式为无状态模式，不维护会话信息，提供更简化和高效的通信方式。

### 在 claude_desktop_config.json 中集成

stdio 模式的示例配置：

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

或使用 npx：

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

### 使用 Docker 构建

```bash
docker build -t mcp/ygocdb .
```

然后你可以在 stdio 模式下运行：

```bash
docker run -i --rm mcp/ygocdb
```

或在 Streamable HTTP 模式下运行：

```bash
docker run -i --rm -p 3000:3000 mcp/ygocdb --http
```
