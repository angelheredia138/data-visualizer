<template>
  <div class="chart-container-transparent">
    <!-- Chart container -->
    <svg id="d3-radar-chart"></svg>

    <!-- Time range selection dropdown -->
    <div class="time-range-controls">
      <label for="timeRangeSelect" class="dropdown-label">Time Range:</label>
      <select
        id="timeRangeSelect"
        v-model="localTimeRange"
        @change="fetchAudioFeatures"
        class="custom-dropdown"
      >
        <option
          v-for="option in timeRangeOptions"
          :key="option.value"
          :value="option.value"
        >
          {{ option.text }}
        </option>
      </select>
    </div>

    <!-- Error message -->
    <div v-if="error" class="error-message">{{ error }}</div>

    <!-- Loading spinner -->
    <div v-if="loading" class="loading-spinner">Loading...</div>
  </div>
</template>

<script setup>
import * as d3 from "d3";
import { ref, onMounted, watch } from "vue";
import { useNuxtApp } from "#app";

// Local state for tracks data, loading, and error state
const tracks = ref([]);
const processedTracks = ref([]);
const loading = ref(false);
const error = ref(null);

// Default time range used by the API, set to 'medium_term'
const defaultTimeRange = "medium_term";
const localTimeRange = ref(defaultTimeRange);

// Time range options
const timeRangeOptions = [
  { value: "short_term", text: "Last 4 weeks" },
  { value: "medium_term", text: "Last 6 months" },
  { value: "long_term", text: "All time" },
];

// Get the axios instance from the Nuxt app
const { $axios } = useNuxtApp();

// Function to fetch tracks and audio features from the API
const fetchAudioFeatures = async () => {
  try {
    loading.value = true;
    error.value = null;

    const token = localStorage.getItem("spotify_access_token");
    if (!token) {
      error.value = "No Spotify access token found in localStorage.";
      loading.value = false;
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };
    let fetchedTracks = [];
    let offset = 0;
    const limit = 50;

    while (fetchedTracks.length < 100) {
      const tracksResponse = await $axios.get(
        `/top-tracks/?time_range=${localTimeRange.value}&limit=${limit}&offset=${offset}`,
        { headers }
      );
      fetchedTracks = fetchedTracks.concat(tracksResponse.data.tracks);
      offset += limit;

      if (tracksResponse.data.tracks.length < limit) break;
    }

    const trackIds = fetchedTracks.map((track) => track.id).join(",");
    const audioFeaturesResponse = await $axios.get(
      `https://api.spotify.com/v1/audio-features?ids=${trackIds}`,
      { headers }
    );

    const tracksWithAudioFeatures = fetchedTracks.map((track) => {
      const audioFeatures = audioFeaturesResponse.data.audio_features.find(
        (feature) => feature.id === track.id
      );
      return { ...track, audio_features: audioFeatures };
    });

    tracks.value = tracksWithAudioFeatures;
    preprocessTracks(tracksWithAudioFeatures);
  } catch (err) {
    error.value = "Error fetching data.";
    console.error(err);
  } finally {
    loading.value = false;
  }
};

// Function to preprocess the tracks and filter those with audio features
const preprocessTracks = (tracks) => {
  const topOutliers = findTopOutliers(tracks);
  const balancedTracks = findMostBalancedTracks(tracks);
  const selectedTracks = [...topOutliers, ...balancedTracks].slice(0, 5);

  const maxTempo = d3.max(
    selectedTracks,
    (track) => track.audio_features.tempo
  );

  const processed = selectedTracks
    .filter((track) => track.audio_features)
    .map((track) => ({
      name: track.name,
      artist: track.artists[0].name, // Assuming the first artist is the main one
      danceability: track.audio_features.danceability || 0,
      energy: track.audio_features.energy || 0,
      tempo: (track.audio_features.tempo || 0) / maxTempo, // Normalize tempo
      valence: track.audio_features.valence || 0,
    }));

  processedTracks.value = processed;
};

// Helper functions for finding top outliers and balanced tracks
const findTopOutliers = (tracks) => {
  const topDanceability = tracks
    .sort(
      (a, b) => b.audio_features.danceability - a.audio_features.danceability
    )
    .slice(0, 1);
  const topEnergy = tracks
    .sort((a, b) => b.audio_features.energy - a.audio_features.energy)
    .slice(0, 1);
  const topTempo = tracks
    .sort((a, b) => b.audio_features.tempo - a.audio_features.tempo)
    .slice(0, 1);
  const topValence = tracks
    .sort((a, b) => b.audio_features.valence - a.audio_features.valence)
    .slice(0, 1);

  return [...topDanceability, ...topEnergy, ...topTempo, ...topValence];
};

const findMostBalancedTracks = (tracks) => {
  const meanDanceability = d3.mean(
    tracks,
    (track) => track.audio_features.danceability
  );
  const meanEnergy = d3.mean(tracks, (track) => track.audio_features.energy);
  const meanTempo = d3.mean(tracks, (track) => track.audio_features.tempo);
  const meanValence = d3.mean(tracks, (track) => track.audio_features.valence);

  const balancedTracks = tracks
    .map((track) => ({
      ...track,
      balanceScore:
        Math.abs(track.audio_features.danceability - meanDanceability) +
        Math.abs(track.audio_features.energy - meanEnergy) +
        Math.abs(track.audio_features.tempo - meanTempo) +
        Math.abs(track.audio_features.valence - meanValence),
    }))
    .sort((a, b) => a.balanceScore - b.balanceScore)
    .slice(0, 1);

  return balancedTracks;
};

// Function to draw the radar chart
const drawRadarChart = () => {
  const svg = d3
    .select("#d3-radar-chart")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", `0 0 ${800} ${800}`)
    .classed("svg-content-responsive", true)
    .style("background-color", "transparent");

  svg.selectAll("*").remove(); // Clear the chart before drawing

  const margin = { top: 50, right: 50, bottom: 50, left: 50 };
  const width = 800 - margin.left - margin.right;
  const height = 800 - margin.top - margin.bottom;
  const radius = Math.min(width, height) / 2;

  const chart = svg
    .append("g")
    .attr(
      "transform",
      `translate(${width / 2 + margin.left},${height / 2 + margin.top})`
    );

  const angleSlice = (2 * Math.PI) / 4;
  const levels = 5;

  const radarLine = d3
    .lineRadial()
    .radius((d) => radius * d.value)
    .angle((d, i) => i * angleSlice)
    .curve(d3.curveLinearClosed);

  const featureNames = ["danceability", "energy", "tempo", "valence"];

  // Create the circular grid
  const axisGrid = chart.append("g").attr("class", "axisWrapper");

  // Draw circular grid
  axisGrid
    .selectAll(".levels")
    .data(d3.range(1, levels + 1).reverse())
    .enter()
    .append("circle")
    .attr("class", "gridCircle")
    .attr("r", (d) => (radius / levels) * d)
    .style("fill", "#CDCDCD")
    .style("stroke", "#CDCDCD")
    .style("fill-opacity", 0.1);

  // Draw axis lines
  const axis = axisGrid
    .selectAll(".axis")
    .data(featureNames)
    .enter()
    .append("g")
    .attr("class", "axis");

  axis
    .append("line")
    .attr("x1", 0)
    .attr("y1", 0)
    .attr("x2", (d, i) => radius * Math.cos(angleSlice * i - Math.PI / 2))
    .attr("y2", (d, i) => radius * Math.sin(angleSlice * i - Math.PI / 2))
    .attr("class", "line")
    .style("stroke", "white")
    .style("stroke-width", "2px");

  // Draw axis labels
  axis
    .append("text")
    .attr("class", "legend")
    .style("font-size", "30px")
    .style("font-family", "'Inter', sans-serif")
    .style("font-weight", "bold")
    .attr("text-anchor", "middle")
    .attr("dy", "0.35em")
    .attr("x", (d, i) => (radius + 10) * Math.cos(angleSlice * i - Math.PI / 2)) // Moved closer
    .attr("y", (d, i) => (radius + 10) * Math.sin(angleSlice * i - Math.PI / 2)) // Moved closer
    .attr("transform", (d, i) => {
      const angle = angleSlice * i - Math.PI / 2;
      if (i === 1) {
        return `rotate(90 ${radius * Math.cos(angle)} ${
          radius * Math.sin(angle)
        })`; // For energy
      }
      if (i === 3) {
        return `rotate(-90 ${radius * Math.cos(angle)} ${
          radius * Math.sin(angle)
        })`; // For valence
      }
      return null; // No rotation for other labels
    })
    .text((d) => d);

  // Prepare radar chart data
  const radarData = processedTracks.value.map((track) => {
    return {
      name: track.name,
      artist: track.artist,
      axes: featureNames.map((feature) => ({
        axis: feature,
        value: track[feature],
      })),
    };
  });

  // Tooltip setup
  const tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("background", "#fff")
    .style("border", "1px solid #ccc")
    .style("padding", "10px")
    .style("border-radius", "5px")
    .style("pointer-events", "none")
    .style("display", "none");

  let isHovering = false;
  let selectedBlob = null; // Track the selected radar blob

  // Draw radar blobs
  radarData.forEach((data, i) => {
    const color = d3.schemeCategory10[i % 10];
    const blobWrapper = chart.append("g");

    // Draw radar areas
    const radarArea = blobWrapper
      .append("path")
      .datum(data.axes)
      .attr("class", "radarArea")
      .attr("d", radarLine)
      .style("fill", color)
      .style("fill-opacity", 0.1)
      .style("stroke", color)
      .style("stroke-width", "2px")
      .style("stroke-opacity", 0.6)
      .on("mouseover", function (event) {
        isHovering = true;
        if (!selectedBlob) {
          tooltip.style("display", "block").html(
            `<strong>${data.name} - ${data.artist}</strong><br/>
               Danceability: ${data.axes[0].value.toFixed(2)}<br/>
               Energy: ${data.axes[1].value.toFixed(2)}<br/>
               Tempo: ${data.axes[2].value.toFixed(2)}<br/>
               Valence: ${data.axes[3].value.toFixed(2)}`
          );
          d3.select(this).style("fill-opacity", 0.3);
        }
      })
      .on("mousemove", function (event) {
        tooltip
          .style("top", event.pageY - 10 + "px")
          .style("left", event.pageX + 10 + "px");
      })
      .on("mouseout", function () {
        isHovering = false;
        if (!selectedBlob) {
          tooltip.style("display", "none");
          d3.select(this).style("fill-opacity", 0.1);
        }
      })
      .on("click", function (event) {
        if (isHovering && window.matchMedia("(hover: hover)").matches) {
          return; // Block click if hovering
        }

        const radar = d3.select(this);
        const isHighlighted = radar.classed("highlighted");

        // Deselect the previously selected blob if it’s not the current one
        if (selectedBlob && selectedBlob !== radar) {
          selectedBlob.classed("highlighted", false).style("fill-opacity", 0.1);
          tooltip.style("display", "none");
          selectedBlob = null;
        }

        // Toggle the selection of the clicked blob
        if (isHighlighted) {
          radar.classed("highlighted", false).style("fill-opacity", 0.1);
          tooltip.style("display", "none");
          selectedBlob = null;
        } else {
          radar.classed("highlighted", true).style("fill-opacity", 0.3);

          tooltip
            .style("display", "block")
            .html(
              `<strong>${data.name} - ${data.artist}</strong><br/>
               Danceability: ${data.axes[0].value.toFixed(2)}<br/>
               Energy: ${data.axes[1].value.toFixed(2)}<br/>
               Tempo: ${data.axes[2].value.toFixed(2)}<br/>
               Valence: ${data.axes[3].value.toFixed(2)}`
            )
            .style("top", event.pageY - 10 + "px")
            .style("left", event.pageX + 10 + "px");

          selectedBlob = radar;
        }
      });

    // Add circles to radar areas
    blobWrapper
      .selectAll(`.radarCircle-${i}`)
      .data(data.axes)
      .enter()
      .append("circle")
      .attr("class", `radarCircle-${i}`)
      .attr("r", 4)
      .attr(
        "cx",
        (d, i) => radius * d.value * Math.cos(angleSlice * i - Math.PI / 2)
      )
      .attr(
        "cy",
        (d, i) => radius * d.value * Math.sin(angleSlice * i - Math.PI / 2)
      )
      .style("fill", color)
      .style("fill-opacity", 0.8);
  });
};

// Watch for changes in processedTracks and draw the chart
watch(
  processedTracks,
  (newTracks) => {
    if (newTracks.length > 0) {
      drawRadarChart();
    }
  },
  { immediate: true }
);

// Fetch data and draw chart on component mount
onMounted(() => {
  fetchAudioFeatures();
});
</script>

<style scoped>
#d3-radar-chart {
  display: block;
  margin: auto;
}

.chart-container-transparent {
  flex: 1;
  padding: 10px;
  width: 100%;
  height: 100%;
}

/* Tooltip styling */
.tooltip {
  font-size: 12px;
  font-family: "Inter", sans-serif;
  font-weight: normal;
  color: #333;
}

.dropdown-label {
  font-family: Inter;
  font-size: 14px;
}

.custom-dropdown {
  width: 200px;
  font-family: Inter;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
}

.error-message {
  color: red;
  font-weight: bold;
  margin-top: 10px;
}

.loading-spinner {
  color: green;
  font-weight: bold;
  margin-top: 10px;
}
</style>
