#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
  JSONRPCError
} from "@modelcontextprotocol/sdk/types.js";
import fetch, { Response } from "node-fetch";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { createServer, IncomingMessage, ServerResponse } from "node:http";
import { parse } from "node:url";
import { randomUUID } from "node:crypto";

/**
 * YGOCDB API 参考:
 * - https://ygocdb.com/api/v0/?search=
 * 
 * 图片API:
 * - https://cdn.233.momobako.com/ygopro/pics/<id>.jpg
 *
 * 服务端提供以下工具:
 * 1) search_cards - 通过关键字搜索卡牌
 * 2) get_card_by_id - 通过卡牌ID获取单张卡牌
 * 3) get_card_image - 通过卡牌ID获取卡牌图片
 */

// 定义基础URL
const BASE_URL = "https://ygocdb.com/api/v0";

// 错误响应格式
interface YgocdbError {
  message: string;
}

// 搜索卡牌工具
const SEARCH_CARDS_TOOL: Tool = {
  name: "search_cards",
  description:
    "通过关键字搜索游戏王卡牌，可以搜索卡牌名称、效果文本等。",
  inputSchema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "搜索关键字，可以是卡牌名称、效果描述等"
      }
    },
    required: ["query"]
  },
  annotations: {
    title: "通过关键字搜索游戏王卡牌",
    readOnlyHint: true,
    openWorldHint: true
  }
};

// 通过ID获取卡牌工具
const GET_CARD_BY_ID_TOOL: Tool = {
  name: "get_card_by_id",
  description: "通过卡牌ID获取单张游戏王卡牌的详细信息",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "游戏王卡牌ID，通常为八位数字"
      }
    },
    required: ["id"]
  },
  annotations: {
    title: "通过ID获取单张游戏王卡牌",
    readOnlyHint: true,
    openWorldHint: true
  }
};

// 获取卡牌图片工具
const GET_CARD_IMAGE_TOOL: Tool = {
  name: "get_card_image",
  description: "通过卡牌ID获取游戏王卡牌的图片",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "游戏王卡牌ID，可以使用search_cards工具搜索"
      }
    },
    required: ["id"]
  },
  annotations: {
    title: "通过ID获取游戏王卡牌图片",
    readOnlyHint: true,
    openWorldHint: true
  }
};

// 返回我们的工具集
const YGOCDB_TOOLS = [
  SEARCH_CARDS_TOOL,
  GET_CARD_BY_ID_TOOL,
  GET_CARD_IMAGE_TOOL
] as const;

// 处理响应的通用函数
async function handleYgocdbResponse(response: Response) {
  if (!response.ok) {
    // 尝试解析错误
    let errorObj: YgocdbError | null = null;
    try {
      errorObj = await response.json() as YgocdbError;
    } catch {
      // 回退到通用错误
    }
    
    if (errorObj && errorObj.message) {
      return {
        content: [
          {
            type: "text",
            text: `YGOCDB API 错误: ${errorObj.message} (状态码: ${response.status})`
          }
        ],
        isError: true
      };
    } else {
      return {
        content: [
          {
            type: "text",
            text: `HTTP 错误 ${response.status}: ${response.statusText}`
          }
        ],
        isError: true
      };
    }
  }
  
  // 如果正常，解析 JSON
  const data = await response.json();
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(data, null, 2)
      }
    ],
    isError: false
  };
}

// 搜索卡牌处理函数
async function handleSearchCards(query: string) {
  const url = `${BASE_URL}/?search=${encodeURIComponent(query)}`;
  const response = await fetch(url);
  return handleYgocdbResponse(response);
}

// 通过ID获取卡牌处理函数
async function handleGetCardById(id: string) {
  const url = `${BASE_URL}/?search=${encodeURIComponent(id)}`;
  const response = await fetch(url);
  return handleYgocdbResponse(response);
}

// 通过ID获取卡牌图片处理函数
async function handleGetCardImage(id: string) {
  const url = `https://cdn.233.momobako.com/ygopro/pics/${encodeURIComponent(id)}.jpg`;
  
  try {
    const response = await fetch(url);
    
    // 处理错误响应
    if (!response.ok) {
      return {
        content: [
          {
            type: "text",
            text: `获取卡牌图片失败: HTTP 错误 ${response.status}: ${response.statusText}`
          }
        ],
        isError: true
      };
    }
    
    // 处理成功响应 - 读取图片数据
    const buffer = await response.arrayBuffer();
    const base64Data = Buffer.from(buffer).toString('base64');
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    
    // 返回图像内容
    return {
      content: [
        {
          type: "text",
          text: `卡牌图片 (ID: ${id})`
        },
        {
          type: "image",
          data: base64Data,
          mimeType: contentType
        }
      ],
      isError: false
    };
  } catch (error) {
    // 捕获所有其他错误（网络错误、解析错误等）
    return {
      content: [
        {
          type: "text",
          text: `获取卡牌图片失败: ${(error as Error).message}`
        }
      ],
      isError: true
    };
  }
}

// 创建服务端实例
function createYgocdbServer() {
  const newServer = new Server(
    {
      name: "mcp-server/ygocdb",
      version: "1.0.0"
    },
    {
      capabilities: {
        tools: {}
      }
    }
  );

  // 设置工具列表处理器
  newServer.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: YGOCDB_TOOLS
  }));

  // 设置工具调用处理器
  newServer.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
      const { name, arguments: args } = request.params;
      switch (name) {
        case "search_cards": {
          const { query } = args as { query: string };
          return await handleSearchCards(query);
        }
        case "get_card_by_id": {
          const { id } = args as { id: string };
          return await handleGetCardById(id);
        }
        case "get_card_image": {
          const { id } = args as { id: string };
          return await handleGetCardImage(id);
        }
        default:
          return {
            content: [
              {
                type: "text",
                text: `错误: 未知的工具名称 "${name}"`
              }
            ],
            isError: true
          };
      }
    } catch (err) {
      return {
        content: [
          {
            type: "text",
            text: `错误: ${(err as Error).message}`
          }
        ],
        isError: true
      };
    }
  });

  return newServer;
}

// 创建错误响应
function createErrorResponse(message: string): JSONRPCError {
  return {
    jsonrpc: '2.0',
    error: {
      code: -32000,
      message: message,
    },
    id: randomUUID(),
  };
}

// 启动服务端
async function runServer() {
  const argv = await yargs(hideBin(process.argv))
    .option("http", {
      type: "boolean",
      description: "使用 Streamable HTTP 传输而不是 stdio",
      default: false
    })
    .option("port", {
      type: "number",
      description: "HTTP 传输使用的端口",
      default: 3000
    })
    .help().argv;

  if (argv.http) {
    // 创建一个全局的无状态Server实例
    const ygocdbServer = createYgocdbServer();
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined, // 设置为undefined表示无状态模式
    });
    
    // 连接传输和服务端
    await ygocdbServer.connect(transport);
    
    const httpServer = createServer(
      async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
        const url = parse(req.url ?? "", true);

        // 统一端点
        if (url.pathname === "/mcp") {
          if (req.method === "POST") {
            // 获取请求体
            const chunks: Buffer[] = [];
            for await (const chunk of req) {
              chunks.push(Buffer.from(chunk));
            }
            const body = Buffer.concat(chunks).toString();
            let jsonBody;
            
            try {
              jsonBody = JSON.parse(body);
            } catch (e) {
              res.writeHead(400, { "Content-Type": "application/json" });
              res.end(JSON.stringify(createErrorResponse("Invalid JSON")));
              return;
            }
            
            try {
              // 在无状态模式下，直接处理请求
              await transport.handleRequest(req, res, jsonBody);
            } catch (error) {
              console.error("处理请求时出错:", error);
              if (!res.headersSent) {
                res.writeHead(500, { "Content-Type": "application/json" });
                res.end(JSON.stringify(createErrorResponse("内部服务端错误")));
              }
            }
            return;
          } else {
            // 无状态模式不支持GET/DELETE方法，直接返回405
            res.writeHead(405, {
              "Content-Type": "application/json",
              "Allow": "POST"
            });
            res.end(JSON.stringify(createErrorResponse("Method Not Allowed")));
            return;
          }
        } else {
          // 任何其他路径都返回404
          res.writeHead(404, "Not Found");
          res.end(JSON.stringify(createErrorResponse("Not Found")));
          return;
        }
      }
    );

    httpServer.listen(argv.port, () => {
      console.error(
        `YGOCDB MCP 服务端监听中 http://localhost:${argv.port} (无状态 Streamable HTTP模式)`
      );
      console.error(
        `Streamable HTTP 端点: http://localhost:${argv.port}/mcp`
      );
    });
  } else {
    // Standard stdio mode
    const server = createYgocdbServer();
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("YGOCDB MCP 服务端在 stdio 上运行");
  }
}

runServer().catch((error) => {
  console.error("启动 YGOCDB 服务端时发生致命错误:", error);
  process.exit(1);
});
