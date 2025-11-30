/**
 * MCP Server with Streamable HTTP Transport
 * Run with: npm run start:streamable
 * 
 * This implements the MCP transport specification (2025-11-25).
 * Connect with:
 * - MCP Inspector: npx @modelcontextprotocol/inspector --url http://localhost:3001/mcp
 * - Claude Code: claude mcp add --transport http tmdb-mcp http://localhost:3001/mcp
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express, { Request, Response } from "express";
import cors from "cors";
import { config } from "dotenv";
import { randomUUID } from "crypto";

// Import tool/resource/prompt registration functions
import { registerTools } from "./register-tools.js";
import { registerResources } from "./register-resources.js";
import { registerPrompts } from "./register-prompts.js";

config();

const PORT = parseInt(process.env.MCP_PORT || "3001");

const app = express();

// CORS configuration for browser-based clients
app.use(cors({
  origin: "*",
  exposedHeaders: ["Mcp-Session-Id"],
  allowedHeaders: ["Content-Type", "mcp-session-id", "mcp-protocol-version", "Accept"]
}));

app.use(express.json());

// Store transports by session ID
const transports: Record<string, StreamableHTTPServerTransport> = {};

/**
 * Check if a request body is an MCP initialization request
 */
function isInitializeRequest(body: unknown): boolean {
  if (typeof body !== "object" || body === null) return false;
  const msg = body as Record<string, unknown>;
  return msg.method === "initialize" && msg.jsonrpc === "2.0";
}

/**
 * Create and configure a new MCP server instance
 */
function createMcpServer(): McpServer {
  const server = new McpServer({
    name: "tmdb-mcp",
    version: "1.0.0",
  });

  registerTools(server);
  registerResources(server);
  registerPrompts(server);

  return server;
}

// Health check endpoint
app.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    server: "tmdb-mcp",
    version: "1.0.0",
    transport: "streamable-http",
    activeSessions: Object.keys(transports).length,
    tmdbApiKey: process.env.TMDB_API_KEY ? "configured" : "missing"
  });
});

/**
 * Streamable HTTP MCP Endpoint
 * - POST: Client sends JSON-RPC messages
 * - GET: Server sends SSE stream to client  
 * - DELETE: Client terminates session
 */
app.all("/mcp", async (req: Request, res: Response) => {
  const sessionId = req.headers["mcp-session-id"] as string | undefined;

  if (req.method === "POST") {
    let transport: StreamableHTTPServerTransport;

    if (sessionId && transports[sessionId]) {
      // Reuse existing transport
      transport = transports[sessionId];
    } else if (!sessionId && isInitializeRequest(req.body)) {
      // New initialization request
      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        onsessioninitialized: (newSessionId: string) => {
          transports[newSessionId] = transport;
          console.log(`✓ New session: ${newSessionId}`);
        },
        enableJsonResponse: true
      });

      transport.onclose = () => {
        if (transport.sessionId) {
          delete transports[transport.sessionId];
          console.log(`✗ Session closed: ${transport.sessionId}`);
        }
      };

      const server = createMcpServer();
      await server.connect(transport);
    } else {
      res.status(400).json({
        jsonrpc: "2.0",
        error: { code: -32000, message: "Bad Request: No valid session ID" },
        id: null
      });
      return;
    }

    await transport.handleRequest(req, res, req.body);

  } else if (req.method === "GET") {
    if (!sessionId || !transports[sessionId]) {
      res.status(400).send("Invalid or missing session ID");
      return;
    }
    await transports[sessionId].handleRequest(req, res);

  } else if (req.method === "DELETE") {
    if (!sessionId || !transports[sessionId]) {
      res.status(400).send("Invalid or missing session ID");
      return;
    }
    await transports[sessionId].handleRequest(req, res);

  } else {
    res.status(405).send("Method Not Allowed");
  }
});

app.listen(PORT, () => {
  console.log("=".repeat(50));
  console.log("  TMDB MCP Server (Streamable HTTP)");
  console.log("=".repeat(50));
  console.log(`  Endpoint: http://localhost:${PORT}/mcp`);
  console.log(`  TMDB API: ${process.env.TMDB_API_KEY ? "✓" : "✗ MISSING"}`);
  console.log("=".repeat(50));
});
