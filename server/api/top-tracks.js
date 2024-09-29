import { defineEventHandler, getQuery } from "h3";
import axios from "axios";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const { time_range = "medium_term", limit = 50, offset = 0 } = query;
  const token = event.node.req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return { error: "No Spotify token provided" };
  }

  try {
    // Fetch top tracks from Spotify API
    const response = await axios.get(
      `https://api.spotify.com/v1/me/top/tracks`,
      {
        params: { time_range, limit, offset },
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const tracks = response.data.items;

    if (!tracks || tracks.length === 0) {
      return { error: "No tracks found" };
    }

    // Fetch audio features for the top tracks
    const trackIds = tracks.map((track) => track.id).join(",");
    const audioFeaturesResponse = await axios.get(
      `https://api.spotify.com/v1/audio-features`,
      {
        params: { ids: trackIds },
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const audioFeatures = audioFeaturesResponse.data.audio_features;

    // Combine tracks with their audio features
    const tracksWithAudioFeatures = tracks.map((track) => {
      const audioFeature = audioFeatures.find(
        (feature) => feature.id === track.id
      );
      return { ...track, audio_features: audioFeature };
    });

    return { tracks: tracksWithAudioFeatures };
  } catch (error) {
    console.error("Error fetching top tracks and audio features:", error);
    return { error: "Failed to fetch top tracks and audio features" };
  }
});
