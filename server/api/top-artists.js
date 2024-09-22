// server/api/top-artists.js
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

    return response.data;
  } catch (error) {
    console.error(error);
    return { error: "Failed to fetch top artists" };
  }
});
