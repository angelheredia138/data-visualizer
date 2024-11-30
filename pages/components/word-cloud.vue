<template>
  <div class="chart-container-transparent">
    <div v-if="loading" class="loading-spinner">Loading...</div>
    <div v-if="error" class="error-message">{{ error }}</div>
    <div ref="wordCloudRef" class="word-cloud-container"></div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from "vue";
import { useNuxtApp } from "#app";
import WordCloud from "wordcloud"; // Import wordcloud2.js

// Local state for genres data, loading, and error state
const genres = ref([]);
const loading = ref(false);
const error = ref(null);

const wordCloudRef = ref(null);
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

  // Clear previous content
  container.innerHTML = "";

  // Get the container's width and height
  const width = container.offsetWidth;
  const height = container.offsetHeight;
  // Limit the number of genres displayed
  const topGenres = genresData.sort((a, b) => b.count - a.count).slice(0, 100); // Adjust the number as needed

  // Prepare the word list
  const wordList = topGenres.map((d) => [d.genre, d.count]);

  // Determine the maximum and minimum counts
  const counts = topGenres.map((d) => d.count);
  const maxCount = Math.max(...counts);
  const minCount = Math.min(...counts);

  // Set desired minimum and maximum font sizes
  const minFontSize = 16; // Increase this value to make the smallest words larger
  const maxFontSize = 60; // Keep this as is

  // Configure word cloud options
  const options = {
    list: wordList,
    gridSize: Math.round((16 * width) / 1024),
    weightFactor: (size) => {
      // Adjust the weightFactor to scale with container size
      const factor = (size - minCount) / (maxCount - minCount);
      return factor * (height / 10) + minFontSize;
    },
    fontFamily: "Inter",
    color: () => {
      // Random colors
      const colors = [
        "#1f77b4",
        "#ff7f0e",
        "#2ca02c",
        "#d62728",
        "#9467bd",
        "#8c564b",
        "#e377c2",
        "#7f7f7f",
        "#bcbd22",
        "#17becf",
      ];
      return colors[Math.floor(Math.random() * colors.length)];
    },
    backgroundColor: "transparent",
    rotateRatio: 0.0, // Set to 0 to prevent rotation
    shuffle: true,
    drawOutOfBound: false,
    click: (item, dimension, event) => {
      // Implement custom click behavior if needed
      alert(`Genre: ${item[0]}, Count: ${item[1]}`);
    },
    // Optional hover effect
    hover: (item, dimension, event) => {
      // Implement custom hover behavior if needed
    },
  };

  // Generate the word cloud
  WordCloud(container, options);
};

// Watch for changes in the genres and redraw the word cloud
watch(genres, (newGenres) => {
  if (newGenres.length > 0) {
    drawWordCloud(newGenres);
  }
});

// Resize listener to handle window resizing and redraw the word cloud
let resizeObserver;

onMounted(() => {
  fetchGenres();

  // Observe the container size changes
  resizeObserver = new ResizeObserver(() => {
    if (genres.value.length > 0) {
      drawWordCloud(genres.value);
    }
  });
  resizeObserver.observe(wordCloudRef.value);
});

onBeforeUnmount(() => {
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
});
</script>

<style scoped>
.word-cloud-container {
  flex: 1;
  padding: 10px;
  border-radius: 10px;
  width: 100%;
  height: 100%; /* Allow it to fill the parent container's height */
  overflow: hidden;
  position: relative;
  font-family: "Inter", sans-serif; /* Ensure the font is applied */
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
