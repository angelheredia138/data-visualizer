// server/api/top-five-artists.js
import { defineEventHandler, getQuery } from "h3";
import axios from "axios";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const { time_range } = query; // e.g., long_term, medium_term, short_term
  const token = event.node.req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return { error: "No Spotify token provided" };
  }

  try {
    const response = await axios.get(
      `https://api.spotify.com/v1/me/top/artists?time_range=${time_range}&limit=5`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const topArtists = response.data.items.map((artist) => ({
      name: artist.name,
      popularity: artist.popularity,
      image: artist.images[0]?.url || "", // Use the first available image
    }));

    return { topArtists };
  } catch (error) {
    console.error(error);
    return { error: "Failed to fetch top artists" };
  }
});
