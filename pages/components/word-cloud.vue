<template>
  <div class="chart-container-transparent">
    <div v-if="loading" class="loading-spinner">Loading...</div>
    <div v-if="error" class="error-message">{{ error }}</div>
    <div ref="wordCloudRef" class="word-cloud-container"></div>
  </div>
</template>

<script setup>
import * as d3 from "d3";
import cloud from "d3-cloud";
import { ref, watch, onMounted, onBeforeUnmount } from "vue";
import { useNuxtApp } from "#app";

// Local state for genres data, loading, and error state
const genres = ref([]);
const loading = ref(false);
const error = ref(null);

const wordCloudRef = ref(null);
let clickTimeout = null;
let isHovering = false;

const { $axios } = useNuxtApp();

// Function to fetch genres data
const fetchGenres = async () => {
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
    const response = await $axios.get(`/genres/`, { headers });

    genres.value = response.data.genres || [];
  } catch (err) {
    error.value = "Error fetching data.";
    console.error(err);
  } finally {
    loading.value = false;
  }
};

// Function to draw the word cloud
const drawWordCloud = (genresData) => {
  const container = wordCloudRef.value;
  const width = container.clientWidth;
  const height = container.clientHeight;

  d3.select(container).selectAll("svg").remove(); // Clear previous SVG

  const svg = d3
    .select(container)
    .append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", `0 0 800 600`)
    .classed("svg-content-responsive", true)
    .style("background-color", "transparent");

  const maxCount = d3.max(genresData, (d) => d.count);
  const fontSizeScale = d3.scaleSqrt().domain([0, maxCount]).range([10, 40]);

  const layout = cloud()
    .size([800, 600])
    .words(
      genresData.map((d) => ({
        text: d.genre,
        displayText:
          d.genre.length > 15 ? `${d.genre.slice(0, 15)}...` : d.genre,
        size: fontSizeScale(d.count),
      }))
    )
    .padding(5)
    .rotate(() => (Math.random() > 0.5 ? 0 : 90))
    .fontSize((d) => d.size)
    .on("end", draw);

  layout.start();

  function draw(words) {
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

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

    svg
      .append("g")
      .attr("transform", `translate(400,300)`)
      .selectAll("text")
      .data(words)
      .enter()
      .append("text")
      .style("font-size", (d) => `${d.size}px`)
      .style("font-family", "Poppins")
      .style("fill", (d) => colorScale(d.text))
      .style("font-weight", "bold")
      .style("stroke", "white")
      .style("stroke-width", 0.5)
      .style("stroke-linejoin", "round")
      .attr("text-anchor", "middle")
      .attr("transform", (d) => `translate(${[d.x, d.y]})rotate(${d.rotate})`)
      .text((d) => d.displayText)
      .on("mouseover", function (event, d) {
        isHovering = true;
        d3.select(this).style("cursor", "pointer");
        d3.select(this).append("title").text(d.text); // Show full name on hover
      })
      .on("click", function (event, d) {
        if (isHovering) return;

        tooltip
          .style("display", "block")
          .html(`<strong>${d.text}</strong><br/>`)
          .style("top", `${event.pageY}px`)
          .style("left", `${event.pageX}px`);

        clearTimeout(clickTimeout);
        clickTimeout = setTimeout(() => {
          tooltip.style("display", "none");
        }, 1000); // Hide the tooltip after 1 second
      });
  }
};

// Watch for changes in the genres and redraw the word cloud
watch(genres, (newGenres) => {
  if (newGenres.length > 0) {
    drawWordCloud(newGenres);
  }
});

// Resize listener to handle window resizing and redraw the word cloud
const handleResize = () => {
  if (genres.value.length > 0) {
    drawWordCloud(genres.value);
  }
};

onMounted(() => {
  fetchGenres();
  window.addEventListener("resize", handleResize); // Listen for resize events
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize); // Clean up resize listener
});
</script>

<style scoped>
.word-cloud-container {
  flex: 1;
  padding: 10px;
  border-radius: 10px;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.tooltip {
  font-size: 12px;
  font-family: "Inter", sans-serif;
  font-weight: normal;
  color: #333;
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
</style>
