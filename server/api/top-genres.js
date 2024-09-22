// server/api/top-genres.js
import { defineEventHandler, getQuery } from "h3";
import axios from "axios";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const { time_range } = query;
  const token = event.node.req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return { error: "No Spotify token provided" };
  }

  try {
    const response = await axios.get(
      `https://api.spotify.com/v1/me/top/artists?time_range=${time_range}&limit=50`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const artists = response.data.items;
    const genreMap = new Map();
    artists.forEach((artist) => {
      artist.genres.forEach((genre) => {
        if (genreMap.has(genre)) {
          genreMap.set(genre, genreMap.get(genre) + 1);
        } else {
          genreMap.set(genre, 1);
        }
      });
    });

    const topGenres = Array.from(genreMap.entries()).map(([genre, count]) => ({
      genre,
      count,
      artists: artists
        .filter((artist) => artist.genres.includes(genre))
        .map((artist) => artist.name),
    }));

    return { top_genres: topGenres };
  } catch (error) {
    console.error(error);
    return { error: "Failed to fetch top genres" };
  }
});
