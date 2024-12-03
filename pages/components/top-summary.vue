<template>
  <div class="chart-container-transparent">
    <div class="last-played">Your Top Highlights</div>
    <svg id="highlights-chart"></svg>
    <div v-if="error" class="error-message">{{ error }}</div>
    <div v-if="loading" class="loading-spinner">Loading...</div>
  </div>
</template>

<script setup>
import * as d3 from "d3";
import { ref, onMounted } from "vue";
import { useNuxtApp } from "#app";

const topArtist = ref({});
const topSong = ref({});
const topGenre = ref("");
const loading = ref(false);
const error = ref(null);

const { $axios } = useNuxtApp();

const fetchHighlightsData = async () => {
  try {
    loading.value = true;
    const token = localStorage.getItem("spotify_access_token");
    if (!token) throw new Error("No Spotify token found.");

    const headers = { Authorization: `Bearer ${token}` };
    const response = await $axios.get(`/wrapped/`, { headers });

    topArtist.value = response.data.top_artist;
    topSong.value = response.data.top_track;
    topGenre.value = response.data.top_genre;

    drawHighlightsChart();
  } catch (err) {
    error.value = "Error fetching highlights data.";
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const drawHighlightsChart = () => {
  const svg = d3.select("#highlights-chart").attr("viewBox", `0 0 400 200`);
  svg.selectAll("*").remove();

  const data = [
    { label: "Top Artist", value: topArtist.value.name || "N/A" },
    { label: "Top Song", value: topSong.value.title || "N/A" },
    { label: "Top Genre", value: topGenre.value || "N/A" },
  ];

  svg
    .append("g")
    .attr("transform", "translate(50,50)")
    .selectAll("text")
    .data(data)
    .join("text")
    .text((d) => `${d.label}: ${d.value}`)
    .attr("y", (d, i) => i * 30)
    .style("font-family", "Inter, sans-serif")
    .style("font-size", "16px");
};

onMounted(() => {
  fetchHighlightsData();
});
</script>

<style scoped>
.chart-container-transparent {
  flex: 1;
  padding: 20px;
  text-align: center;
}

.last-played {
  font-weight: bold;
  margin-bottom: 20px;
}

.loading-spinner,
.error-message {
  font-weight: bold;
  margin-top: 10px;
}

.loading-spinner {
  color: green;
}

.error-message {
  color: red;
}
</style>
