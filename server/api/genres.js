import { defineEventHandler } from "h3";
import axios from "axios";

export default defineEventHandler(async (event) => {
  const token = event.node.req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return { error: "No Spotify token provided" };
  }

  try {
    // Fetch top artists from Spotify
    const response = await axios.get(
      `https://api.spotify.com/v1/me/top/artists?time_range=long_term&limit=50`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const artists = response.data.items;
    const genreMap = new Map();

    // Iterate through each artist and their genres
    artists.forEach((artist) => {
      artist.genres.forEach((genre) => {
        if (genreMap.has(genre)) {
          // Increment the count if genre already exists in the map
          genreMap.set(genre, {
            count: genreMap.get(genre).count + 1,
            artists: [...genreMap.get(genre).artists, artist.name],
          });
        } else {
          // Add the genre to the map with count 1 and the artist's name
          genreMap.set(genre, { count: 1, artists: [artist.name] });
        }
      });
    });

    // Convert the Map to an array of objects
    const genres = Array.from(genreMap.entries()).map(([genre, value]) => ({
      genre,
      count: value.count,
      artists: value.artists,
    }));

    // Return the list of genres
    return { genres };
  } catch (error) {
    console.error(error);
    return { error: "Failed to fetch genres" };
  }
});
