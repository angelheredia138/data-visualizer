import { defineEventHandler } from "h3";
import axios from "axios";

export default defineEventHandler(async (event) => {
  const token = event.node.req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return { error: "No Spotify token provided" };
  }

  try {
    const response = await axios.get(
      "https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=20",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const genres = {};
    const artists = new Set();

    for (const track of response.data.items) {
      const artistResponse = await axios.get(
        `https://api.spotify.com/v1/artists/${track.artists[0].id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      artistResponse.data.genres.forEach((genre) => {
        genres[genre] = (genres[genre] || 0) + 1;
      });

      artists.add(track.artists[0].name);
    }

    const topGenres = Object.entries(genres)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([genre]) => genre);

    return {
      trends: `Your top genres are ${topGenres.join(
        ", "
      )} and you've listened to ${artists.size} different artists recently.`,
    };
  } catch (error) {
    console.error(error);
    return { error: "Failed to fetch trends insights." };
  }
});
