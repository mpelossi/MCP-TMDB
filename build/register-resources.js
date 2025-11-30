import { getTrendingMovies } from "./tmdb-api.js";
export function registerResources(server) {
    // Static TMDB Info Resource
    server.resource("tmdb-info", "tmdb://info", {
        description: "Information about The Movie Database API",
        mimeType: "text/plain",
    }, async () => ({
        contents: [
            {
                uri: "tmdb://info",
                text: "The Movie Database (TMDB) is a popular, user-editable database for movies and TV shows. This MCP server provides access to TMDB data through resources, prompts, and tools.",
            },
        ],
    }));
    // Dynamic Trending Movies Resource
    server.resource("tmdb-trending", "tmdb://trending", {
        description: "Currently trending movies on TMDB",
        mimeType: "application/json",
    }, async () => {
        try {
            const trendingData = await getTrendingMovies();
            return {
                contents: [
                    {
                        uri: "tmdb://trending",
                        text: JSON.stringify(trendingData, null, 2),
                    },
                ],
            };
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Unknown error";
            return {
                contents: [
                    {
                        uri: "tmdb://trending",
                        text: `Error fetching trending movies: ${message}`,
                    },
                ],
            };
        }
    });
    console.log("✓ Registered 2 TMDB resources");
}
