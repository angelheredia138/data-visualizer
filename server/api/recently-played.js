import { defineEventHandler } from "h3";
import axios from "axios";

export default defineEventHandler(async (event) => {
  const token = event.node.req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return { error: "No Spotify token provided" };
  }

  // Get the current time in Unix timestamp (milliseconds)
  const currentTime = Date.now();
  // Subtract 24 hours (in milliseconds) to get the time from 24 hours ago
  const oneDayAgo = currentTime - 24 * 60 * 60 * 1000;

  try {
    const response = await axios.get(
      `https://api.spotify.com/v1/me/player/recently-played?limit=50&after=${oneDayAgo}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(error);
    return { error: "Failed to fetch recently played tracks" };
  }
});
