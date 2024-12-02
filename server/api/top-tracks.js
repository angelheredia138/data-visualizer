import { defineEventHandler, getQuery } from "h3";
import axios from "axios";
import { getSpotifyAccessToken } from "./utils";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const { time_range = "medium_term", limit = 50, offset = 0 } = query;

  const token = getSpotifyAccessToken(); // Replace this with your token-fetching logic
  if (!token) {
    return { error: "Spotify token not available" };
  }

  const url = `https://api.spotify.com/v1/me/top/tracks?time_range=${time_range}&limit=${limit}&offset=${offset}`;
  const headers = { Authorization: `Bearer ${token}` };

  try {
    const response = await axios.get(url, { headers });
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching top tracks:",
      error.response?.data || error.message
    );
    return { error: "Failed to fetch top tracks." };
  }
});
