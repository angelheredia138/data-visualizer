import { defineEventHandler } from "h3";
import axios from "axios";

export default defineEventHandler(async (event) => {
  const token = event.node.req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return { error: "No Spotify token provided" };
  }

  try {
    // Fetch Top Artist
    const topArtistResponse = await axios.get(
      "https://api.spotify.com/v1/me/top/artists?limit=1&time_range=long_term",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const topArtist = topArtistResponse.data.items?.[0] || null;

    // Fetch Top Song
    const topSongResponse = await axios.get(
      "https://api.spotify.com/v1/me/top/tracks?limit=1&time_range=long_term",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const topSong = topSongResponse.data.items?.[0] || null;

    // Fetch Top Genre
    const genresResponse = await axios.get(
      "https://api.spotify.com/v1/me/top/artists?limit=50&time_range=long_term",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const genres = genresResponse.data.items?.reduce((acc, artist) => {
      artist.genres.forEach((genre) => {
        acc[genre] = (acc[genre] || 0) + 1;
      });
      return acc;
    }, {});

    const topGenre =
      Object.keys(genres || {}).sort((a, b) => genres[b] - genres[a])[0] ||
      null;

    return {
      top_artist: {
        name: topArtist?.name || "No artist available",
        image: topArtist?.images?.[0]?.url || "",
      },
      top_track: {
        title: topSong?.name || "No song available",
        artist: topSong?.artists?.[0]?.name || "Unknown artist",
      },
      top_genre: topGenre || "No genre available",
    };
  } catch (error) {
    console.error("Error fetching wrapped data:", error);
    return { error: "Failed to fetch wrapped data" };
  }
});
