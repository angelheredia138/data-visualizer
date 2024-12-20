<template>
  <div class="chart-container">
    <div v-if="loading" class="loading-spinner">Loading...</div>
    <div v-if="error" class="error-message">{{ error }}</div>
    <div v-else>
      <p class="genre-info">{{ genreInfo }}</p>
      <svg id="d3-pie-chart" ref="pieChartRef"></svg>
    </div>
  </div>
</template>

<script setup>
import * as d3 from "d3";
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useNuxtApp } from "#app";

// State for genre data, loading, error, and pie chart references
const genres = ref([]);
const selectedSlice = ref(null);
const genreInfo = ref("");
const loading = ref(false);
const error = ref(null);

const pieChartRef = ref(null);
let resizeObserver;

const { $axios } = useNuxtApp();

// Function to fetch genres from the API
const fetchGenres = async () => {
  try {
    loading.value = true;
    error.value = null;

    const token = localStorage.getItem("spotify_access_token");
    if (!token) {
      error.value = "No Spotify token provided.";
      loading.value = false;
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };
    const response = await $axios.get(`/genres/`, { headers });

    genres.value = response.data.genres || [];

    drawPieChart(genres.value);
  } catch (err) {
    error.value = "Error fetching data.";
    console.error(err);
  } finally {
    loading.value = false;
  }
};

// Function to draw the pie chart
const drawPieChart = (genresData) => {
  const svg = d3.select(pieChartRef.value);

  // Clear the previous SVG content
  svg.selectAll("*").remove();

  // Get the container's width and height
  const width = svg.node().clientWidth;
  const height = svg.node().clientHeight;
  const radius = Math.min(width, height) / 2;

  svg
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .style("width", "100%")
    .style("height", "100%");

  const g = svg
    .append("g")
    .attr("transform", `translate(${width / 2},${height / 2})`);

  const color = d3.scaleOrdinal(d3.schemeCategory10);

  const sortedGenres = genresData
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const pie = d3.pie().value((d) => d.count);
  const data_ready = pie(sortedGenres);

  const arc = d3.arc().innerRadius(0).outerRadius(radius);
  const arcOver = d3
    .arc()
    .innerRadius(0)
    .outerRadius(radius + 10);

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

  const isHoverCapable = window.matchMedia("(hover: hover)").matches;

  g.selectAll("path")
    .data(data_ready)
    .enter()
    .append("path")
    .attr("d", arc)
    .attr("fill", (d) => color(d.data.genre))
    .attr("stroke", "white")
    .style("stroke-width", "2px")
    .on("mouseover", function (event, d) {
      if (isHoverCapable) {
        d3.select(this).transition().duration(200).attr("d", arcOver);
        tooltip
          .style("display", "block")
          .html(`${d.data.genre} - Artists: ${d.data.count}`)
          .style("top", `${event.pageY - 10}px`)
          .style("left", `${event.pageX + 10}px`);
      }
    })
    .on("mousemove", function (event) {
      if (isHoverCapable) {
        tooltip
          .style("top", `${event.pageY - 10}px`)
          .style("left", `${event.pageX + 10}px`);
      }
    })
    .on("mouseout", function () {
      if (isHoverCapable) {
        d3.select(this).transition().duration(200).attr("d", arc);
        tooltip.style("display", "none");
      }
    })
    .on("click", function (event, d) {
      if (!isHoverCapable) {
        const isSelected = d3.select(this).classed("selected");

        // Deselect if already selected
        if (isSelected) {
          d3.select(this)
            .classed("selected", false)
            .transition()
            .duration(200)
            .attr("d", arc); // Reset to original size
          tooltip.style("display", "none"); // Hide tooltip
        } else {
          // Select and show tooltip
          d3.selectAll("path").classed("selected", false); // Deselect others
          d3.select(this)
            .classed("selected", true)
            .transition()
            .duration(200)
            .attr("d", arcOver); // Highlight
          tooltip
            .style("display", "block")
            .html(`${d.data.genre} - Artists: ${d.data.count}`)
            .style("top", `${event.pageY - 10}px`)
            .style("left", `${event.pageX + 10}px`);
        }
      }
    });
  g.selectAll("text")
    .data(data_ready)
    .enter()
    .append("text")
    .text((d) => d.data.genre)
    .attr("transform", (d) => `translate(${arc.centroid(d)})`)
    .style("text-anchor", "middle")
    .style("font-size", "14px")
    .style("font-family", "Inter")
    .style("fill", "#000")
    .style("font-weight", "bold");
};

// Function to handle resize events
const handleResize = () => {
  if (genres.value.length > 0) {
    drawPieChart(genres.value);
  }
};

// Fetch genres and draw the pie chart when the component is mounted
onMounted(() => {
  fetchGenres();

  // Observe the container size changes
  resizeObserver = new ResizeObserver(handleResize);
  resizeObserver.observe(pieChartRef.value);
});

onBeforeUnmount(() => {
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
});
</script>

<style scoped>
.chart-container {
  width: 100%;
  align-content: center;
  justify-content: center;
  flex: 1;
  display: flex;
}

.genre-info {
  font-size: 16px;
  font-family: "Inter", sans-serif;
  text-align: center;
  margin-bottom: 10px;
}

.loading-spinner {
  color: green;
  font-weight: bold;
  margin-top: 10px;
}

.error-message {
  color: red;
  font-weight: bold;
  margin-top: 10px;
}

.tooltip {
  position: absolute;
  background: #fff;
  border: 1px solid #ccc;
  padding: 10px;
  border-radius: 5px;
  pointer-events: none;
  display: none;
}

#d3-pie-chart {
  width: 100%;
  height: 100%; /* Ensure the SVG fills its container */
}
</style>
