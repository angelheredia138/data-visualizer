<template>
  <div class="chart-container-transparent">
    <div class="last-played">Your Top Artists</div>
    <svg id="artists-chart"></svg>
    <div v-if="error" class="error-message">{{ error }}</div>
    <div v-if="loading" class="loading-spinner">Loading...</div>
  </div>
</template>

<script setup>
import * as d3 from "d3";
import { ref, onMounted } from "vue";
import { useNuxtApp } from "#app";

const artists = ref([]);
const loading = ref(false);
const error = ref(null);

const { $axios } = useNuxtApp();

const fetchArtistsData = async () => {
  try {
    loading.value = true;
    const token = localStorage.getItem("spotify_access_token");
    if (!token) throw new Error("No Spotify token found.");

    const headers = { Authorization: `Bearer ${token}` };
    const response = await $axios.get(`/top-artists/`, { headers });

    artists.value = response.data.items.map((artist) => ({
      name: artist.name,
      image: artist.images[0]?.url || "",
      popularity: artist.popularity,
    }));

    drawArtistsChart();
  } catch (err) {
    error.value = "Error fetching artists data.";
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const drawArtistsChart = () => {
  const svg = d3.select("#artists-chart").attr("viewBox", `0 0 400 300`);
  svg.selectAll("*").remove();

  artists.value.slice(0, 5).forEach((artist, i) => {
    svg
      .append("text")
      .attr("x", 50)
      .attr("y", 50 + i * 30)
      .text(`${artist.name} - Popularity: ${artist.popularity}`)
      .style("font-family", "Inter, sans-serif")
      .style("font-size", "14px");
  });
};

onMounted(() => {
  fetchArtistsData();
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
