// server/api/get_playlists.js
import { defineEventHandler } from "h3";
import axios from "axios";

export default defineEventHandler(async (event) => {
  const token = event.node.req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return { error: "Token not available" };
  }

  try {
    const url = "https://api.spotify.com/v1/me/playlists?limit=50";
    const headers = { Authorization: `Bearer ${token}` };
    const response = await axios.get(url, { headers });

    const playlists = response.data.items || [];
    const playlistData = [];

    for (const playlist of playlists) {
      const playlistId = playlist.id;
      const playlistName = playlist.name;

      const tracksResponse = await axios.get(
        `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
        { headers }
      );

      if (tracksResponse.status === 200) {
        const tracks = tracksResponse.data.items || [];
        const artists = new Set();

        tracks.forEach((item) => {
          const track = item.track;
          if (track) {
            track.artists.forEach((artist) => {
              artists.add(artist.name);
            });
          }
        });

        playlistData.push({
          id: playlistId,
          name: playlistName,
          artists: Array.from(artists),
        });
      }
    }

    return { playlists: playlistData };
  } catch (error) {
    console.error(error);
    return { error: "Failed to fetch playlists data" };
  }
});
