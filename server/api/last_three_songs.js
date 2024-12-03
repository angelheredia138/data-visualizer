import { defineEventHandler } from "h3";
import axios from "axios";

export default defineEventHandler(async (event) => {
  const token = event.node.req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return { error: "No Spotify token provided" };
  }

  try {
    // Fetch recently played tracks
    const recentlyPlayedRes = await axios.get(
      "https://api.spotify.com/v1/me/player/recently-played?limit=50", // Increase limit to get more tracks for filtering
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // Filter out duplicate songs by track ID
    const seenTrackIds = new Set();
    const uniqueSongs = [];

    for (const item of recentlyPlayedRes.data.items) {
      const trackId = item.track.id; // Unique track identifier
      if (!seenTrackIds.has(trackId)) {
        uniqueSongs.push({
          name: item.track.name,
          artist: item.track.artists.map((artist) => artist.name).join(", "),
          albumImage: item.track.album.images[0]?.url || "",
        });
        seenTrackIds.add(trackId);
      }
      if (uniqueSongs.length === 3) break; // Stop after collecting 3 unique songs
    }

    return { lastThreeSongs: uniqueSongs };
  } catch (error) {
    console.error(error);
    return { error: "Failed to fetch last three songs." };
  }
});
