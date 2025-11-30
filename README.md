# TMDB MCP Server

This project implements a Model Context Protocol (MCP) server that integrates with The Movie Database (TMDB) API. It enables AI assistants like Claude to interact with movie data, providing capabilities for searching, retrieving details, and generating content related to movies.

## Transport Modes

This server supports two transport modes:

| Mode | Command | Use Case |
|------|---------|----------|
| **stdio** | `npm start` | Claude Desktop, VS Code Copilot, MCP Inspector (default) |
| **Streamable HTTP** | `npm run start:http` | Remote clients, web apps, Flask backends |

## Features

### Resources
- **Static Resources**:
  - `tmdb://info` - Information about TMDB API
  - `tmdb://trending` - Currently trending movies
  
- **Resource Templates**:
  - `tmdb://movie/{id}` - Detailed information about a specific movie

### Prompts
- **Movie Review**: Generate a customized movie review with specified style and rating
- **Movie Recommendation**: Get personalized movie recommendations based on genres and mood

### Tools
- **Search Movies**: Find movies by title or keywords
- **Get Trending Movies**: Retrieve trending movies for day or week
- **Get Similar Movies**: Find movies similar to a specified movie

## Setup Instructions

### Prerequisites
- Node.js (v16 or later)
- npm or yarn
- TMDB API key

### Installation

1. Clone this repository
   ```
   git clone https://github.com/mpelossi/tmdb-mcp.git   cd tmdb-mcp
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Configure your TMDB API key
   - Create a `.env` file in the project root (alternative: edit `src/config.ts` directly)
   - Add your TMDB API key: `TMDB_API_KEY=your_api_key_here`

4. Build the project
   ```
   npm run build
   ```

5. Start the server
   ```
   npm start
   ```

### Running with Streamable HTTP Transport

For remote connections or web-based clients, use the HTTP transport:

```bash
npm run start:http
```

This starts the server at `http://localhost:3001/mcp` with the following endpoints:
- `POST /mcp` - Send JSON-RPC messages
- `GET /mcp` - SSE stream for server-to-client messages
- `DELETE /mcp` - Terminate session
- `GET /health` - Health check

### Setup for Claude Desktop

1. Open Claude Desktop
2. Go to Settings > Developer tab
3. Click "Edit Config" to open the configuration file
4. Add the following to your configuration:

```json
{
  "mcpServers": {
    "tmdb-mcp": {
      "command": "node",
      "args": ["/absolute/path/to/your/tmdb-mcp/build/index.js"]
    }
  }
}
```

5. Restart Claude Desktop

## Usage Examples

### Using Static Resources

- "What is TMDB?"
- "Show me currently trending movies"

### Using Resource Templates

- "Get details about movie with ID 550" (Fight Club)
- "Tell me about the movie with ID 155" (The Dark Knight)

### Using Prompts

- "Write a detailed review for Inception with a rating of 9/10"
- "Recommend sci-fi movies for a thoughtful mood"

### Using Tools

- "Search for movies about space exploration"
- "What are the trending movies today?"
- "Find movies similar to The Matrix"

## Development

### Project Structure

```
tmdb-mcp/
├── src/
│   ├── index.ts                # stdio transport server
│   ├── index-streamable.ts     # Streamable HTTP transport server
│   ├── config.ts               # Configuration and API keys
│   ├── handlers.ts             # Request handlers (stdio)
│   ├── register-tools.ts       # Tool registration (HTTP)
│   ├── register-resources.ts   # Resource registration (HTTP)
│   ├── register-prompts.ts     # Prompt registration (HTTP)
│   ├── resources.ts            # Static resources
│   ├── resource-templates.ts   # Dynamic resource templates
│   ├── prompts.ts              # Prompt definitions
│   ├── tools.ts                # Tool implementations
│   └── tmdb-api.ts             # TMDB API wrapper
├── package.json
├── tsconfig.json
└── README.md
```

### Testing

Use the MCP Inspector to test your server during development:

#### Testing stdio transport (default)
```bash
npx @modelcontextprotocol/inspector node build/index.js
```

#### Testing Streamable HTTP transport

1. Start the HTTP server in one terminal:
   ```bash
   npm run dev:http
   ```

2. In another terminal, connect the inspector:
   ```bash
   npx @modelcontextprotocol/inspector --url http://localhost:3001/mcp
   ```

Alternatively, run `npx @modelcontextprotocol/inspector` and in the UI:
1. Select **"Streamable HTTP"** as the transport type
2. Enter URL: `http://localhost:3001/mcp`
3. Click **Connect**

### Connecting from a Python/Flask App

You can connect to the Streamable HTTP server from Python using the MCP SDK:

```python
from mcp import ClientSession
from mcp.client.streamable_http import streamablehttp_client

async with streamablehttp_client("http://localhost:3001/mcp") as (read, write, _):
    async with ClientSession(read, write) as session:
        await session.initialize()
        
        # List available tools
        tools = await session.list_tools()
        
        # Call a tool
        result = await session.call_tool("search-movies", {"query": "inception"})
```

Install the MCP Python SDK: `pip install mcp`

## License

MIT

## Acknowledgements

- [The Movie Database (TMDB)](https://www.themoviedb.org/)
- [Model Context Protocol](https://modelcontextprotocol.github.io/)