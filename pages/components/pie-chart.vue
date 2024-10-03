<template>
  <div class="chart-container-transparent">
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
import { ref, watch, onMounted } from "vue";
import { useNuxtApp } from "#app";

// Local state for genres data, loading, and error state
const genres = ref([]);
const oneCountGenres = ref([]);
const selectedSlice = ref(null);
const genreInfo = ref("");
const loading = ref(false);
const error = ref(null);

const pieChartRef = ref(null);
let hoverTimeout = null;
let clickTimeout = null;
let isHovering = false;

const { $axios } = useNuxtApp();

// Function to fetch genres
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
    oneCountGenres.value = genres.value.filter((d) => d.count === 1);

    drawPieChart(genres.value);
  } catch (err) {
    error.value = "Error fetching data.";
    console.error(err);
  } finally {
    loading.value = false;
  }
};

// Watch for changes in the `genres` and redraw the pie chart
watch(genres, (newGenres) => {
  if (newGenres.length > 0) {
    drawPieChart(newGenres);
  }
});

// Function to draw the pie chart
const drawPieChart = (genresData) => {
  const container = pieChartRef.value;
  const width = container.clientWidth;
  const height = container.clientHeight;
  const radius = Math.min(width, height) / 2;

  // Clear the previous SVG
  d3.select(container).selectAll("svg").remove();

  const svg = d3
    .select(container)
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .style("background-color", "transparent");

  const color = d3.scaleOrdinal(d3.schemeCategory10);
  const pie = d3.pie().value((d) => d.count);
  const arc = d3
    .arc()
    .outerRadius(radius - 10)
    .innerRadius(0);

  const otherGenres = genresData.filter((d) => d.count > 1);
  const data = [...otherGenres, { genre: "Other", count: 1 }];

  const g = svg
    .append("g")
    .attr("transform", `translate(${width / 2},${height / 2})`);

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

  const path = g
    .selectAll("path")
    .data(pie(data))
    .enter()
    .append("path")
    .attr("d", arc)
    .style("fill", (d) => color(d.data.genre))
    .on("mouseover", function (event, d) {
      if (selectedSlice.value !== d.data.genre) {
        isHovering = true;
        d3.select(this).transition().duration(200).attr("d", arc);

        clearTimeout(hoverTimeout);
        hoverTimeout = setTimeout(() => {
          if (selectedSlice.value !== d.data.genre) {
            d3.select(this.parentNode)
              .selectAll("text")
              .filter((textData) => textData.data.genre === d.data.genre)
              .transition()
              .duration(200)
              .style("font-size", "1px")
              .style("opacity", 0.2);
          }
        }, 1000);

        tooltip
          .style("display", "block")
          .html(
            d.data.genre === "Other"
              ? "Other genres, see below"
              : `${d.data.genre} - Artists: ${d.data.count}`
          );
      }
    })
    .on("mousemove", function (event) {
      tooltip
        .style("top", event.pageY - 10 + "px")
        .style("left", event.pageX + 10 + "px");
    })
    .on("mouseout", function (event, d) {
      if (selectedSlice.value !== d.data.genre) {
        isHovering = false;
        tooltip.style("display", "none");
      }
    })
    .on("click", function (event, d) {
      if (isHovering) return;

      selectedSlice.value = d.data.genre;

      let infoContent =
        d.data.genre === "Other"
          ? "Other genres, see below"
          : `${d.data.genre} - Artists: ${d.data.count}`;
      genreInfo.value = infoContent;

      clearTimeout(clickTimeout);
      clickTimeout = setTimeout(() => {
        genreInfo.value = "";
        selectedSlice.value = null;
      }, 1000);
    });
};

// Fetch genres on component mount
onMounted(() => {
  fetchGenres();
});
</script>

<style scoped>
.chart-container-transparent {
  flex: 1;
  padding: 10px;
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
</style>
