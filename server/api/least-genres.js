// server/api/least-genres.js
import { defineEventHandler, getQuery } from "h3";
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

    // Filter out genres that have only one artist
    const leastGenres = Array.from(genreMap.entries())
      .filter(([_, value]) => value.count === 1)
      .map(([genre, value]) => ({
        genre,
        count: value.count,
        artists: value.artists,
      }));

    // Return the list of least listened-to genres
    return { least_genres: leastGenres };
  } catch (error) {
    console.error(error);
    return { error: "Failed to fetch least listened-to genres" };
  }
});
