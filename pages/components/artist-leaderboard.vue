<template>
  <div class="chart-container-transparent" style="flex: 1; padding: 10px">
    <!-- Chart container -->
    <svg id="d3-leaderboard" style="width: 100%; height: 100%"></svg>

    <!-- Time range selection dropdown using native select below the chart -->
    <div class="time-range-controls">
      <label for="timeRangeSelect" class="dropdown-label">Time Range:</label>
      <select
        id="timeRangeSelect"
        v-model="localTimeRange"
        @change="fetchTopArtists"
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

    <!-- Message for full artist names -->
    <p
      v-if="fullArtistNames.length > 0"
      style="margin-top: 16px; font-size: 12px; color: gray"
    >
      * Full artist names: {{ fullArtistNames.join(", ") }}
    </p>

    <!-- Error message -->
    <div v-if="error" class="error-message">{{ error }}</div>

    <!-- Loading spinner -->
    <div v-if="loading" class="loading-spinner">Loading...</div>
  </div>
</template>
<script setup>
import * as d3 from "d3";
import { ref, computed, onMounted, watch } from "vue";
import { useNuxtApp } from "#app";

// Local state for artists data, loading, and error state
const artists = ref([]);
const processedArtists = ref([]);
const loading = ref(false);
const error = ref(null);

// Default time range used by the API, set it to 'medium_term' or whichever is the API's default
const defaultTimeRange = "medium_term";

// Local state for time range selection
const localTimeRange = ref(defaultTimeRange); // Initialize to the default value expected by the API

// Time range options
const timeRangeOptions = [
  { value: "short_term", text: "Last 4 weeks" },
  { value: "medium_term", text: "Last 6 months" },
  { value: "long_term", text: "All time" },
];

// Get the axios instance from the Nuxt app
const { $axios } = useNuxtApp();

// Function to fetch top artists data from the API based on selected time range
const fetchTopArtists = async () => {
  try {
    loading.value = true;
    error.value = null; // Reset error

    const token = localStorage.getItem("spotify_access_token");
    if (!token) {
      error.value = "No Spotify access token found in localStorage.";
      loading.value = false;
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };
    const response = await $axios.get(
      `/top-artists?time_range=${localTimeRange.value}&limit=10`, // Fetch artists based on selected time range
      {
        headers,
      }
    );

    // Update the local state with fetched data

    artists.value = response.data.items;
    processedArtists.value = preprocessArtistNames(artists.value);
  } catch (err) {
    error.value = "Error fetching top artists data.";
    console.error(error.value, err);
  } finally {
    loading.value = false;
  }
};

// Helper function to preprocess artist names
const preprocessArtistNames = (artists) => {
  const truncateLimit = 18;
  return artists.slice(0, 10).map((artist) => {
    // Added slice to limit processed artists to 10
    if (artist.name.length > truncateLimit && artist.name.includes(" ")) {
      const abbreviation = artist.name
        .split(" ")
        .map((word) => word[0])
        .join("");
      return {
        ...artist,
        displayName: abbreviation + "*",
        fullName: artist.name,
      };
    } else {
      return { ...artist, displayName: artist.name, fullName: artist.name };
    }
  });
};

// Computed property to generate a list of full artist names for abbreviated ones
const fullArtistNames = computed(() => {
  return processedArtists.value
    .filter((artist) => artist.displayName.includes("*"))
    .map(
      (artist) => `${artist.displayName.replace("*", "")}: ${artist.fullName}`
    );
});

// Function to draw the leaderboard
const drawLeaderboard = () => {
  const svg = d3
    .select("#d3-leaderboard")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", `0 0 ${1000} ${800}`)
    .classed("svg-content-responsive", true)
    .style("background-color", "transparent");

  svg.selectAll("*").remove(); // Clear the chart before drawing

  const margin = { top: 20, right: 30, bottom: 150, left: 150 };
  const width = 1000 - margin.left - margin.right;
  const height = 800 - margin.top - margin.bottom;

  const x = d3
    .scaleLinear()
    .domain([0, d3.max(processedArtists.value, (d) => d.popularity)])
    .nice()
    .range([0, width]);

  const y = d3
    .scaleBand()
    .domain(processedArtists.value.map((d) => d.displayName))
    .range([0, height])
    .padding(0.1);

  const chart = svg
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Add drop shadow filter
  const defs = svg.append("defs");
  const filter = defs
    .append("filter")
    .attr("id", "drop-shadow")
    .attr("height", "130%");

  filter
    .append("feGaussianBlur")
    .attr("in", "SourceAlpha")
    .attr("stdDeviation", 3)
    .attr("result", "blur");

  filter
    .append("feOffset")
    .attr("in", "blur")
    .attr("dx", 2)
    .attr("dy", 2)
    .attr("result", "offsetBlur");

  const feMerge = filter.append("feMerge");

  feMerge.append("feMergeNode").attr("in", "offsetBlur");
  feMerge.append("feMergeNode").attr("in", "SourceGraphic");

  // Tooltip for artists
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
  let hoverTimeout = null;
  let clickTimeout = null;

  chart
    .append("g")
    .selectAll("rect")
    .data(processedArtists.value)
    .enter()
    .append("rect")
    .attr("x", 0)
    .attr("y", (d) => y(d.displayName))
    .attr("width", (d) => x(d.popularity))
    .attr("height", y.bandwidth())
    .style("fill", "steelblue")
    .style("filter", "url(#drop-shadow)")
    .on("mouseover", function (event, d) {
      isHovering = true;
      tooltip
        .style("display", "block")
        .html(
          `<strong>${d.fullName}</strong><br/>Popularity: ${
            d.popularity
          }<br/>Genres: ${d.genres.join(", ")}`
        );
      d3.select(this).style("fill", "darkblue");
    })
    .on("mousemove", function (event) {
      tooltip
        .style("top", event.pageY - 10 + "px")
        .style("left", event.pageX + 10 + "px");
      hoverTimeout = setTimeout(() => {
        tooltip.style("display", "none");
      }, 15000); // Hide the tooltip after 15 seconds
    })
    .on("mouseout", function () {
      isHovering = false;
      tooltip.style("display", "none");
      d3.select(this).style("fill", function () {
        return d3.select(this).classed("highlighted")
          ? "darkblue"
          : "steelblue";
      });
    })
    .on("click", function (event, d) {
      if (isHovering) return;

      const rect = d3.select(this);
      const isHighlighted = rect.classed("highlighted");

      // Remove highlight from all bars
      d3.selectAll("rect")
        .classed("highlighted", false)
        .style("fill", "steelblue");

      if (!isHighlighted) {
        tooltip
          .style("display", "block")
          .html(
            `<strong>${d.fullName}</strong><br/>Popularity: ${
              d.popularity
            }<br/>Genres: ${d.genres.join(", ")}`
          );
        rect.classed("highlighted", true).style("fill", "darkblue");
      } else {
        tooltip.style("display", "none");
        rect.classed("highlighted", false).style("fill", "steelblue");
      }

      clearTimeout(clickTimeout); // Clear any existing timeout
      clickTimeout = setTimeout(() => {
        tooltip.style("display", "none");
        rect.classed("highlighted", false).style("fill", "steelblue");
      }, 5000); // Hide the tooltip after 5 seconds
    });

  const xAxis = chart
    .append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).tickFormat(d3.format("d"))) // Ensure solid numbers on x-axis
    .selectAll("text")
    .style("font-size", "20px")
    .style("font-family", "'Poppins', sans-serif")
    .style("font-weight", "bold");

  const yAxis = chart
    .append("g")
    .call(d3.axisLeft(y).tickSize(0))
    .selectAll("text")
    .style("font-size", "20px")
    .style("font-family", "'Poppins', sans-serif")
    .style("font-weight", "bold")
    .attr("transform", "translate(-10,0) rotate(-45)") // Tilt the text
    .style("text-anchor", "end");

  // Add x-axis label
  svg
    .append("text")
    .attr("x", width / 2 + margin.left)
    .attr("y", height + margin.top + 50)
    .attr("text-anchor", "middle")
    .style("font-size", "20px")
    .style("font-family", "'Poppins', sans-serif")
    .style("font-weight", "bold")
    .text("Popularity");

  svg
    .append("foreignObject")
    .attr("x", margin.left)
    .attr("y", height + margin.top + 65)
    .attr("width", width) // Set width to ensure text wrapping
    .attr("height", 100) // Adjust height as needed
    .append("xhtml:div")
    .style("font-size", "20px") // Increase font size
    .style("font-family", "'Poppins', sans-serif")
    .style("font-weight", "normal")
    .style("color", "#333")
    .style("text-align", "center")
    .html(
      "Popularity is a metric provided by Spotify that indicates how popular an artist is based on the number of streams, album sales, and other factors."
    );
};

// Watch for changes in `processedArtists` and update the chart
watch(
  processedArtists,
  (newArtists) => {
    if (newArtists.length > 0) {
      drawLeaderboard();
    }
  },
  { immediate: true }
);

// Watch for changes in `localTimeRange` and fetch new artists data
watch(localTimeRange, (newTimeRange) => {
  fetchTopArtists(); // Fetch new data based on the selected time range
});

// Draw leaderboard on mount if data exists
onMounted(() => {
  fetchTopArtists(); // Fetch data immediately on component mount
});
</script>

<style scoped>
#d3-genres-chart,
#d3-leaderboard {
  display: block; /* Display block to center using margin auto */
  margin: auto; /* Center the SVG horizontally */
}
.chart-container-transparent {
  flex: 1;
  padding: 10px;
  /* Add additional styling as needed */
}

/* Tooltip styling */
.tooltip {
  font-size: 12px;
  font-family: "Poppins", sans-serif;
  font-weight: normal;
  color: #333;
}

/* Custom dropdown styling */
.custom-dropdown {
  margin-top: 16px;
  width: 200px;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
}

/* Error message styling */
.error-message {
  color: red;
  font-weight: bold;
  margin-top: 10px;
}

/* Loading spinner styling */
.loading-spinner {
  color: green;
  font-weight: bold;
  margin-top: 10px;
}
</style>
