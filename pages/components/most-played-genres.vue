<template>
  <div class="chart-container-transparent">
    <!-- Chart container -->
    <svg id="d3-genres-chart"></svg>

    <!-- Time range selection dropdown using native select -->
    <div class="time-range-controls">
      <label for="timeRangeSelect" class="dropdown-label">Time Range:</label>
      <select
        id="timeRangeSelect"
        v-model="localTimeRange"
        @change="fetchTopGenres"
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

// Local state for genres data, loading, and error state
const topGenres = ref([]); // Local state for top genres
const processedGenres = ref([]); // Local state for processed genres (top 10)
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

// Function to fetch top genres data from the API
const fetchTopGenres = async () => {
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
      `/top-genres?time_range=${localTimeRange.value}`, // Fetch genres based on selected time range
      { headers }
    );

    // Update the local state with fetched data
    topGenres.value = response.data.top_genres.map((genre) => ({
      genre: genre.genre,
      count: genre.count,
      artists: genre.artists, // Ensure the artists data is stored
    }));

    // Process and limit to top 10 most popular genres based on artist count
    processedGenres.value = preprocessGenres(topGenres.value);
  } catch (err) {
    error.value = "Error fetching top genres data.";
    console.error(error.value, err);
  } finally {
    loading.value = false;
  }
};

// Function to preprocess and limit genres data to top 10 based on artist count
const preprocessGenres = (genres) => {
  return genres
    .sort((a, b) => b.count - a.count) // Sort genres by count in descending order
    .slice(0, 10); // Limit to top 10 genres
};

// Function to draw the genres chart
const drawGenresChart = (genres) => {
  const svg = d3
    .select("#d3-genres-chart")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", `0 0 ${1200} ${1000}`) // Increased viewBox size for better scaling
    .classed("svg-content-responsive", true)
    .style("background-color", "transparent");

  svg.selectAll("*").remove(); // Clear the chart before drawing

  const margin = {
    top: 20, // Increased top margin for better spacing
    right: 30,
    bottom: 150, // Increased bottom margin for better x-axis label display
    left: 150, // Increased left margin for better y-axis label display
  };

  const width = 1200 - margin.left - margin.right; // Adjusted width
  const height = 1000 - margin.top - margin.bottom; // Adjusted height

  const x = d3
    .scaleBand()
    .domain(genres.map((d) => d.genre))
    .range([0, width])
    .padding(0.1);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(genres, (d) => d.count)])
    .nice()
    .range([height, 0]);

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
    .attr("result", "blur"); // Ensure correct chaining

  filter
    .append("feOffset")
    .attr("in", "blur")
    .attr("dx", 2)
    .attr("dy", 2)
    .attr("result", "offsetBlur"); // Ensure correct chaining

  const feMerge = filter.append("feMerge");

  feMerge.append("feMergeNode").attr("in", "offsetBlur");
  feMerge.append("feMergeNode").attr("in", "SourceGraphic");

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
    .data(genres)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", (d) => x(d.genre))
    .attr("y", (d) => y(d.count))
    .attr("width", x.bandwidth())
    .attr("height", (d) => height - y(d.count))
    .style("fill", "steelblue")
    .style("filter", "url(#drop-shadow)")
    .on("mouseover", function (event, d) {
      isHovering = true;
      const artists =
        d.artists && d.artists.length > 0
          ? d.artists.join(", ")
          : "No artists available";
      const maxArtists = 5;
      const displayedArtists = artists
        .split(", ")
        .slice(0, maxArtists)
        .join(", ");
      const ellipsis = artists.split(", ").length > maxArtists ? "..." : "";
      const finalDescription = `Artists: ${displayedArtists}${ellipsis}`;
      tooltip
        .style("display", "block")
        .html(
          `<strong>${d.genre}</strong><br/>Artists Count: ${d.count}<br/> ${finalDescription}`
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
        const artists =
          d.artists && d.artists.length > 0
            ? d.artists.join(", ")
            : "No artists available";
        const maxArtists = 5;
        const displayedArtists = artists
          .split(", ")
          .slice(0, maxArtists)
          .join(", ");
        const ellipsis = artists.split(", ").length > maxArtists ? "..." : "";
        const finalDescription = `Artists: ${displayedArtists}${ellipsis}`;
        tooltip
          .style("display", "block")
          .html(
            `<strong>${d.genre}</strong><br/>Artists Count: ${d.count}<br/> ${finalDescription}`
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
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end")
    .style("font-size", "20px")
    .style("font-family", "'Inter', sans-serif")
    .style("font-weight", "bold");

  chart
    .append("g")
    .call(d3.axisLeft(y).tickFormat(d3.format("d"))) // Ensure solid numbers on y-axis
    .selectAll("text")
    .style("font-size", "20px")
    .style("font-family", "'Inter', sans-serif")
    .style("font-weight", "bold");

  // Wrap text for x-axis labels
  xAxis.each(function () {
    d3.select(this)
      .attr("dy", "1em")
      .attr("transform", "rotate(-45)")
      .attr("text-anchor", "end")
      .call(wrapText, 150); // Increase the width for text wrapping
  });

  function wrapText(text, width) {
    text.each(function () {
      const text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        lineHeight = 1.1, // ems
        y = text.attr("y"),
        dy = parseFloat(text.attr("dy"));

      let line = [],
        lineNumber = 0,
        tspan = text
          .text(null)
          .append("tspan")
          .attr("x", 0)
          .attr("y", y)
          .attr("dy", `${dy}em`);

      while (words.length > 0) {
        const word = words.pop();
        line.push(word);
        tspan.text(line.join(" "));
        if (tspan.node().getComputedTextLength() > width) {
          line.pop();
          tspan.text(line.join(" "));
          line = [word];
          tspan = text
            .append("tspan")
            .attr("x", 0)
            .attr("y", y)
            .attr("dy", `${++lineNumber * lineHeight + dy}em`)
            .text(word);
        }
      }
    });
  }

  // Add y-axis label
  svg
    .append("text")
    .attr("x", -(height / 2) - margin.top)
    .attr("y", margin.left - 50) // Adjusted y-axis label position
    .attr("transform", "rotate(-90)")
    .attr("text-anchor", "middle")
    .style("font-size", "20px")
    .style("font-family", "'Inter', sans-serif")
    .text("Artists")
    .style("font-weight", "bold");
};

// Watch for changes in processedGenres and draw chart
watch(
  processedGenres,
  (newGenres) => {
    if (newGenres && newGenres.length > 0) {
      drawGenresChart(newGenres);
    }
  },
  { immediate: true }
);

// Watch for changes in localTimeRange and refetch genres
watch(localTimeRange, (newTimeRange) => {
  fetchTopGenres(); // Fetch new data based on the selected time range
});

// Draw genres chart on mount if data exists
onMounted(() => {
  fetchTopGenres(); // Fetch data immediately on component mount
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
  width: 100%; /* Ensure full width */
  height: 100%; /* Ensure full height */
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
/* Custom dropdown styling */
.custom-dropdown {
  width: 200px;
  font-family: Inter;
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
