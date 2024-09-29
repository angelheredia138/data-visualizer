<template>
  <div class="chart-container-transparent">
    <svg id="d3-scatter-plot"></svg>

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
// Function to fetch tracks and audio features from the API
const fetchAudioFeatures = async () => {
  try {
    loading.value = true;
    error.value = null;

    const token = localStorage.getItem("spotify_access_token");
    if (!token) {
      error.value = "No Spotify access token found.";
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

      // Safely handle missing or incorrect response structure
      const tracksData = tracksResponse.data?.tracks;
      if (!tracksData) {
        error.value = "Unable to retrieve tracks.";
        break;
      }

      fetchedTracks = fetchedTracks.concat(tracksData);
      offset += limit;

      // Stop if fewer items are returned than requested
      if (tracksData.length < limit) break;
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
  } finally {
    loading.value = false;
  }
};

// Function to preprocess the tracks and filter those with audio features
const preprocessTracks = (tracks) => {
  const processed = tracks
    .filter((track) => track.audio_features)
    .map((track) => ({
      name: track.name,
      artist: track.artists.map((artist) => artist.name).join(", "),
      danceability: track.audio_features.danceability || 0,
      energy: track.audio_features.energy || 0,
      tempo: track.audio_features.tempo || 0,
      valence: track.audio_features.valence || 0,
    }));

  processedTracks.value = processed;
};

// Function to draw the scatter plot
const drawScatterPlot = () => {
  const svg = d3
    .select("#d3-scatter-plot")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", `0 0 ${800} ${800}`)
    .classed("svg-content-responsive", true)
    .style("background-color", "transparent");

  svg.selectAll("*").remove(); // Clear the chart before drawing

  const margin = { top: 60, right: 60, bottom: 120, left: 100 };
  const width = 800 - margin.left - margin.right;
  const height = 800 - margin.top - margin.bottom;

  const x = d3
    .scaleLinear()
    .domain([0, d3.max(processedTracks.value, (d) => d.energy)])
    .nice()
    .range([0, width]);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(processedTracks.value, (d) => d.danceability)])
    .nice()
    .range([height, 0]);

  const chart = svg
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

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
    .style("display", "none")
    .style("font-size", "12px");

  let isHovering = false;
  let selectedCircle = null; // Track the selected circle

  chart
    .selectAll("circle")
    .data(processedTracks.value)
    .enter()
    .append("circle")
    .attr("cx", (d) => x(d.energy))
    .attr("cy", (d) => y(d.danceability))
    .attr("r", 10)
    .style("fill", "steelblue")

    // Mouse hover to show the tooltip
    .on("mouseover", function (event, d) {
      isHovering = true;
      if (!selectedCircle) {
        tooltip
          .style("display", "block")
          .html(
            `<strong>${d.name}</strong><br/>Artist: ${
              d.artist
            }<br/>Danceability: ${d.danceability.toFixed(
              2
            )}<br/>Energy: ${d.energy.toFixed(2)}<br/>Tempo: ${
              d.tempo
            }<br/>Valence: ${d.valence.toFixed(2)}`
          );
        d3.select(this).style("fill", "darkblue");
      }
    })

    // Update tooltip position with mouse movement
    .on("mousemove", function (event) {
      tooltip
        .style("top", event.pageY - 10 + "px")
        .style("left", event.pageX + 10 + "px");
    })

    // Hide tooltip on mouse out
    .on("mouseout", function () {
      isHovering = false;
      if (!selectedCircle) {
        tooltip.style("display", "none");
        d3.select(this).style("fill", "steelblue");
      }
    })

    // Click event handler to toggle tooltip and highlight circle
    .on("click", function (event, d) {
      if (isHovering && window.matchMedia("(hover: hover)").matches) {
        return; // Block click if hovering
      }

      const circle = d3.select(this);
      const isHighlighted = circle.classed("highlighted");

      // Deselect the previously selected circle if it’s not the current one
      if (selectedCircle && selectedCircle !== circle) {
        selectedCircle.classed("highlighted", false).style("fill", "steelblue");
        tooltip.style("display", "none");
        selectedCircle = null;
      }

      // Toggle the selection of the clicked circle
      if (isHighlighted) {
        // If the circle is already highlighted, unselect it
        circle.classed("highlighted", false).style("fill", "steelblue");
        tooltip.style("display", "none");
        selectedCircle = null;
      } else {
        // If the circle is not highlighted, select it
        circle.classed("highlighted", true).style("fill", "darkblue");

        // Show tooltip when clicked
        tooltip
          .style("display", "block")
          .html(
            `<strong>${d.name}</strong><br/>Artist: ${
              d.artist
            }<br/>Danceability: ${d.danceability.toFixed(
              2
            )}<br/>Energy: ${d.energy.toFixed(2)}<br/>Tempo: ${
              d.tempo
            }<br/>Valence: ${d.valence.toFixed(2)}`
          )
          .style("top", event.pageY - 10 + "px")
          .style("left", event.pageX + 10 + "px");

        selectedCircle = circle;
      }
    });

  // X-axis
  chart
    .append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).ticks(10))
    .selectAll("text")
    .style("font-size", "30px")
    .style("font-family", "'Inter', sans-serif")
    .style("font-weight", "bold");

  chart
    .append("text")
    .attr("x", width / 2)
    .attr("y", height + margin.bottom - 40)
    .attr("text-anchor", "middle")
    .attr("fill", "#000")
    .style("font-size", "30px")
    .style("font-family", "'Inter', sans-serif")
    .style("font-weight", "bold")
    .text("Energy");

  // Y-axis
  chart
    .append("g")
    .call(d3.axisLeft(y).ticks(10))
    .selectAll("text")
    .style("font-size", "30px")
    .style("font-family", "'Inter', sans-serif")
    .style("font-weight", "bold");

  chart
    .append("text")
    .attr("x", -height / 2)
    .attr("y", -margin.left + 30)
    .attr("transform", "rotate(-90)")
    .attr("text-anchor", "middle")
    .attr("fill", "#000")
    .style("font-size", "30px")
    .style("font-family", "'Inter', sans-serif")
    .style("font-weight", "bold")
    .text("Danceability");
};

// Watch for changes in processedTracks and draw the chart
watch(
  processedTracks,
  (newTracks) => {
    if (newTracks.length > 0) {
      drawScatterPlot();
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
/* Styling */
#d3-scatter-plot {
  display: block;
  margin: auto;
}

.chart-container-transparent {
  flex: 1;
  padding: 10px;
  width: 100%;
  height: 100%;
}

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
