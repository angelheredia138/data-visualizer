<template>
  <div class="chart-container-transparent">
    <div class="last-played">Listening Summary for the Last Month</div>
    <svg id="summary-chart"></svg>
    <div v-if="error" class="error-message">{{ error }}</div>
    <div v-if="loading" class="loading-spinner">Loading...</div>
  </div>
</template>

<script setup>
import * as d3 from "d3";
import { ref, onMounted } from "vue";
import { useNuxtApp } from "#app";

const listeningTime = ref(null);
const uniqueGenres = ref(null);
const uniqueArtists = ref(null);
const trends = ref(null);
const loading = ref(false);
const error = ref(null);

const { $axios } = useNuxtApp();

const fetchSummaryData = async () => {
  try {
    loading.value = true;
    const token = localStorage.getItem("spotify_access_token");
    if (!token) throw new Error("No Spotify token found.");

    const headers = { Authorization: `Bearer ${token}` };
    const response = await $axios.get(`/wrapped/`, { headers });

    listeningTime.value = response.data.listening_time;
    uniqueGenres.value = response.data.unique_genres;
    uniqueArtists.value = response.data.unique_artists;
    trends.value = response.data.trends;

    drawSummaryChart();
  } catch (err) {
    error.value = "Error fetching summary data.";
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const drawSummaryChart = () => {
  const svg = d3.select("#summary-chart").attr("viewBox", `0 0 400 400`);
  svg.selectAll("*").remove();

  const data = [
    { label: "Listening Time", value: listeningTime.value || 0 },
    { label: "Unique Genres", value: uniqueGenres.value || 0 },
    { label: "Unique Artists", value: uniqueArtists.value || 0 },
  ];

  const radius = Math.min(400, 400) / 2;
  const arc = d3
    .arc()
    .innerRadius(radius - 50)
    .outerRadius(radius);
  const pie = d3.pie().value((d) => d.value);

  const color = d3.scaleOrdinal(d3.schemeCategory10);

  svg
    .append("g")
    .attr("transform", `translate(200,200)`)
    .selectAll("path")
    .data(pie(data))
    .join("path")
    .attr("d", arc)
    .attr("fill", (d) => color(d.data.label));
};

onMounted(() => {
  fetchSummaryData();
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
