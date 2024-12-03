import { defineEventHandler } from "h3";
import axios from "axios";

export default defineEventHandler(async (event) => {
  const token = event.node.req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return { error: "No Spotify token provided" };
  }

  try {
    // Fetch currently playing track
    const nowPlayingRes = await axios.get(
      "https://api.spotify.com/v1/me/player/currently-playing",
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!nowPlayingRes.data || !nowPlayingRes.data.is_playing) {
      return { nowPlaying: null };
    }

    const nowPlaying = {
      name: nowPlayingRes.data.item.name,
      artist: nowPlayingRes.data.item.artists
        .map((artist) => artist.name)
        .join(", "),
      albumImage: nowPlayingRes.data.item.album.images[0]?.url || "",
    };

    return { nowPlaying };
  } catch (error) {
    console.error(error);
    return { error: "Failed to fetch now playing." };
  }
});
