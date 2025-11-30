import { z } from "zod";
export function registerPrompts(server) {
    // Movie Review Prompt
    server.prompt("movie-review", "Create a movie review based on provided details", {
        title: z.string().describe("Title of the movie"),
        rating: z.string().describe("Your rating of the movie (1-10)"),
        style: z.string().optional().describe("Review style (brief, detailed, critical)"),
    }, ({ title, rating, style = "detailed" }) => ({
        messages: [
            {
                role: "user",
                content: {
                    type: "text",
                    text: `Write a ${style} review for the movie "${title}" with a rating of ${rating}/10. Include your thoughts on the plot, characters, direction, and overall experience.`,
                },
            },
        ],
    }));
    // Movie Recommendation Prompt
    server.prompt("movie-recommendation", "Get personalized movie recommendations", {
        genres: z.string().describe("Preferred genres (comma-separated)"),
        mood: z.string().optional().describe("Current mood (happy, thoughtful, excited, etc.)"),
        avoidGenres: z.string().optional().describe("Genres to avoid (comma-separated)"),
    }, ({ genres, mood = "any", avoidGenres = "" }) => ({
        messages: [
            {
                role: "user",
                content: {
                    type: "text",
                    text: `Recommend movies in the following genres: ${genres}. I'm in a ${mood} mood. Please avoid these genres if possible: ${avoidGenres}. Include a brief description of why you're recommending each movie.`,
                },
            },
        ],
    }));
    console.log("✓ Registered 2 TMDB prompts");
}
