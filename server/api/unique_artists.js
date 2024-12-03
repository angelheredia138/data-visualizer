import { defineEventHandler } from "h3";
import axios from "axios";

export default defineEventHandler(async (event) => {
  const token = event.node.req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return { error: "No Spotify token provided" };
  }

  try {
    const response = await axios.get(
      "https://api.spotify.com/v1/me/top/artists?time_range=short_term&limit=50",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    return { unique_artists: response.data.items.length };
  } catch (error) {
    console.error(error);
    return { error: "Failed to fetch unique artists." };
  }
});
