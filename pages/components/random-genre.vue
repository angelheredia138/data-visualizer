<template>
  <div class="random-genre-generator">
    <!-- Button to generate random genre -->
    <v-btn
      @click="generateRandomGenre"
      :loading="loading"
      color="primary"
      class="random-genre-button rainbow-button"
    >
      <span class="rainbow-text">RANDOM GENRE GENERATOR</span>
    </v-btn>

    <!-- Display the random genre -->
    <div v-if="randomGenre" class="random-genre-display">
      <h3 class="random-genre-title">{{ randomGenre.genre }}</h3>
      <p class="random-genre-artists">
        Artist: {{ randomGenre.artists.join(", ") }}
      </p>
    </div>

    <!-- Error message -->
    <v-alert v-if="error" type="error">{{ error }}</v-alert>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useNuxtApp } from "#app";

// Local state
const leastGenres = ref([]);
const randomGenre = ref(null);
const loading = ref(false);
const error = ref(null);

// Get the axios instance from the Nuxt app
const { $axios } = useNuxtApp();

// Function to fetch the least listened-to genres from the API
const fetchLeastGenres = async () => {
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
    const response = await $axios.get("/least-genres", { headers });

    // Update the local state with fetched data
    leastGenres.value = response.data.least_genres;
    console.log("Fetched Least Listened Genres:", leastGenres.value);
  } catch (err) {
    error.value = "Error fetching least listened-to genres.";
    console.error(error.value, err);
  } finally {
    loading.value = false;
  }
};

// Function to generate a random genre from the least listened-to genres
const generateRandomGenre = () => {
  if (leastGenres.value.length > 0) {
    const randomIndex = Math.floor(Math.random() * leastGenres.value.length);
    randomGenre.value = leastGenres.value[randomIndex];
  } else {
    randomGenre.value = null;
  }
};

// Fetch the least genres on component mount
onMounted(() => {
  fetchLeastGenres(); // Fetch data immediately on component mount
});
</script>

<style scoped>
/* Container styling for the button and displayed genres */
.random-genre-generator {
  flex-direction: column;
  align-items: stretch;
}

/* Rainbow button styling */
.random-genre-button {
  font-size: 1.2em;
  padding: 0px 24px;
  border-radius: 10px;
  cursor: pointer;
  border: none;
  background-color: rgba(255, 255, 255, 0.85) !important;
}

.random-genre-button:hover {
  transform: scale(1.05);
}

/* Rainbow text styling */
.rainbow-text {
  background: linear-gradient(
    90deg,
    #c40000,
    #ff7f00,
    #c7c700,
    #00ff00,
    #0000ff,
    #4b0082,
    #8b00ff
  );
  -webkit-background-clip: text;
  color: transparent;
  background-size: 200% 200%;
  animation: rainbowText 5s linear infinite;
  font-weight: bold;
  text-transform: uppercase;
}

/* Displayed genre and artist information */
.random-genre-display {
  text-align: center;
}

.random-genre-title {
  font-size: 1.5em;
  font-weight: bold;
  color: black; /* Customize as needed */
}

.random-genre-artists {
  font-size: 1em;
  color: #2d3748; /* Customize as needed */
}

/* Rainbow Text Animation */
@keyframes rainbowText {
  0%,
  100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

/* Rainbow Button Animation */
@keyframes rainbowButton {
  0%,
  100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}
</style>
