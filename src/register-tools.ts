/**
 * Register tools with McpServer for Streamable HTTP transport
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
  searchMovies,
  getTrendingMovies,
  getSimilarMovies,
  getMovieDetails,
} from "./tmdb-api.js";

export function registerTools(server: McpServer): void {
  // Search Movies Tool
  server.tool(
    "search-movies",
    "Search for movies by title or keywords",
    {
      query: z.string().describe("Search query"),
      page: z.number().optional().describe("Page number for results (default: 1)"),
    },
    async ({ query, page = 1 }) => {
      try {
        const results = await searchMovies(query, page);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(results, null, 2),
            },
          ],
        };
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return {
          content: [{ type: "text", text: `Error: ${message}` }],
          isError: true,
        };
      }
    }
  );

  // Get Trending Movies Tool
  server.tool(
    "get-trending",
    "Get trending movies for day or week",
    {
      timeWindow: z.enum(["day", "week"]).optional().describe("Time window for trending movies (default: week)"),
    },
    async ({ timeWindow = "week" }) => {
      try {
        const results = await getTrendingMovies(timeWindow);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(results, null, 2),
            },
          ],
        };
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return {
          content: [{ type: "text", text: `Error: ${message}` }],
          isError: true,
        };
      }
    }
  );

  // Get Similar Movies Tool
  server.tool(
    "get-similar",
    "Get movies similar to a given movie",
    {
      movieId: z.string().describe("ID of the movie to find similar movies for"),
    },
    async ({ movieId }) => {
      try {
        const results = await getSimilarMovies(movieId);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(results, null, 2),
            },
          ],
        };
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return {
          content: [{ type: "text", text: `Error: ${message}` }],
          isError: true,
        };
      }
    }
  );

  // Get Movie Details Tool
  server.tool(
    "get-movie-details",
    "Get detailed information about a specific movie",
    {
      movieId: z.string().describe("ID of the movie to get details for"),
    },
    async ({ movieId }) => {
      try {
        const results = await getMovieDetails(movieId);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(results, null, 2),
            },
          ],
        };
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return {
          content: [{ type: "text", text: `Error: ${message}` }],
          isError: true,
        };
      }
    }
  );

  console.log("✓ Registered 4 TMDB tools");
}
