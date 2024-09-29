<template>
  <v-container fluid class="animated-background">
    <!-- Fullscreen Loading Spinner and Message -->
    <div v-show="showLoadingOverlay" class="loading-overlay">
      <v-progress-circular
        :size="80"
        :width="8"
        indeterminate
        color="white"
        class="loading-spinner"
      ></v-progress-circular>
      <div class="loading-message">Loading...</div>
    </div>

    <!-- Content to show behind loading overlay -->
    <div>
      <!-- Fixed Title and Back Button -->
      <div class="header-container">
        <h1 class="page-title">Genre Ranking and Artist Leaderboard!</h1>

        <v-btn color="primary" class="back-button" @click="goBack">
          Back to Home
        </v-btn>
      </div>

      <!-- Top Section for Chart Explanations -->
      <div class="explanation-section" style="max-width: 800px">
        <h2 class="subtitle">Chart Explanations</h2>
        <p class="explanation-text">
          <strong>Most Played Genres:</strong> Displays the top genres you have
          listened to in the selected time range. Hover or tap on the bars to
          see the count of artists contributing to each genre.
        </p>
        <p class="explanation-text">
          <strong>Artist Leaderboard:</strong> Shows the most listened-to
          artists in the selected time range. Hover or tap on the bars to get
          more details about each artist and their popularity.
        </p>
        <p class="explanation-text">
          <strong>Random Genre Generator:</strong> Generate a random genre you
          have listened to at least once. This can help you discover less
          frequently played genres in your listening history.
        </p>
        <p class="explanation-text">These charts are created using D3.js.</p>
      </div>

      <!-- Graphs Section -->
      <div class="graphs-container">
        <!-- Most Played Genres -->
        <div class="graph-item">
          <h3 class="graph-title">Most Played Genres</h3>
          <div class="graph-content">
            <MostPlayedGenres />
          </div>
        </div>

        <!-- Artist Leaderboard -->
        <div class="graph-item">
          <h3 class="graph-title">Artist Leaderboard</h3>
          <div class="graph-content">
            <ArtistLeaderboard />
          </div>
        </div>
      </div>

      <!-- Random Genre Generator Button Component -->
      <div class="random-genre-generator">
        <RandomGenreButton />
      </div>
    </div>
  </v-container>
</template>

<script setup>
import { useRouter } from "vue-router";
import MostPlayedGenres from "~/pages/components/most-played-genres.vue";
import ArtistLeaderboard from "~/pages/components/artist-leaderboard.vue";
import RandomGenreButton from "~/pages/components/random-genre.vue"; // Import the Random Genre Button component
import { ref, reactive, onMounted, onBeforeUnmount } from "vue";

// State for showing the loading overlay
const showLoadingOverlay = ref(true);

// Responsive screen size state
const screenSize = reactive({
  width: window.innerWidth,
  height: window.innerHeight,
  isSmall: window.innerWidth < 768,
});

// Function to update screen size state
const updateScreenSize = () => {
  screenSize.width = window.innerWidth;
  screenSize.height = window.innerHeight;
  screenSize.isSmall = window.innerWidth < 768;
};

// Add event listener on mount
onMounted(() => {
  window.addEventListener("resize", updateScreenSize);
  updateScreenSize(); // Initialize with current size

  // Hide the loading overlay after 2 seconds (or whatever duration you need)
  setTimeout(() => {
    showLoadingOverlay.value = false;
  }, 2000); // 2 seconds delay
});

// Remove event listener on before unmount
onBeforeUnmount(() => {
  window.removeEventListener("resize", updateScreenSize);
});

// Navigation handler to go back to the home page
const router = useRouter();
const goBack = () => {
  router.push("/main");
};
// Update the window title using useHead
useHead({
  title: "Genre Ranking and Artist Leaderboard!",
});
</script>

<style scoped>
/* Global box-sizing and overflow handling */
*,
*::before,
*::after {
  box-sizing: border-box;
}

html,
body,
#app {
  height: 100%;
  margin: 0;
  padding: 0;
  overflow-y: auto;
  overflow-x: hidden;
}

/* Main Container Styling */
.animated-background {
  background: linear-gradient(270deg, #4299e1, #48bb78, #4299e1);
  background-size: 600% 600%;
  animation: gradientAnimation 10s ease infinite;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center; /* Center on mobile */
  justify-content: flex-start;
  padding: 30px;
  box-sizing: border-box;
  overflow-x: hidden; /* Prevent horizontal scrolling */
}

/* Remove padding from v-container */
.v-application .v-application--wrap .v-container {
  padding: 0 !important;
  overflow-x: hidden;
}

/* Loading Overlay for Spinner and Message */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(270deg, #4299e1, #48bb78, #4299e1);
  background-size: 600% 600%;
  animation: gradientAnimation 10s ease infinite;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.loading-spinner {
  margin-bottom: 20px;
}

.loading-message {
  font-size: 1.5em;
  font-weight: bold;
  color: white;
}

/* Fixed Title and Button */
.header-container {
  width: 100%;
  text-align: center;
  margin-bottom: 30px;
  flex-shrink: 0;
}

.page-title {
  color: white;
  font-size: 2.5em;
  font-weight: 700;
  margin-bottom: 15px;
}

.back-button {
  background-color: #e53e3e !important;
  color: white;
  text-transform: none;
  font-size: 1.2em;
  width: 150px;
  height: 42px;
}

.back-button:hover {
  background-color: #c53030 !important;
}

/* Explanation Section */
.explanation-section {
  background-color: rgba(255, 255, 255, 0.85);
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  width: 100%;
  max-width: 800px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-left: auto;
  margin-right: auto;
}

.subtitle {
  font-size: 1.4em;
  text-align: center;
}

.explanation-text {
  font-size: 1em;
  margin-bottom: 10px;
}

/* Graphs Container */
.graphs-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  align-items: center; /* Center graphs on mobile */
}

@media (min-width: 769px) {
  .animated-background {
    align-items: stretch; /* Stretch on desktop */
    padding: 0; /* Remove padding on desktop */
  }
  .graphs-container {
    flex-direction: row;
    justify-content: center; /* Center graphs horizontally */
    align-items: flex-start;
  }
}

/* Graph Item */
.graph-item {
  width: 100%;
  max-width: 600px; /* Limit the width on mobile */
  margin: 20px 0;
  background-color: rgba(
    255,
    255,
    255,
    0.85
  ); /* Slightly transparent white background */
  border-radius: 8px;
  padding: 20px;
  box-sizing: border-box;
}

@media (min-width: 769px) {
  .graph-item {
    flex: 0 0 37.5%; /* Reduce size by 25% */
    margin: 0 20px; /* Add space between graphs */
    max-width: none; /* Remove max-width constraint */
  }
}

.graph-title {
  font-size: 1.8em;
  color: black;
  text-align: center;
  margin-bottom: 15px;
}

.graph-content {
  width: 100%;
  height: 100%;
}

/* Ensure the graph components fill their containers */
.graph-content > * {
  width: 100%;
  height: 100%;
}

/* Random Genre Generator Styling */
.random-genre-generator {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

.random-genre-btn {
  width: 130px;
  height: 40px;
  font-size: 1em;
  text-transform: none;
  margin-top: 12px;
}

/* Responsive Adjustments */
@media (max-width: 768px) {
  /* Reduce the font size of the page title */
  .page-title {
    font-size: 1.2em; /* Reduced font size for mobile */
  }

  /* Adjust the header container */
  .header-container {
    margin-bottom: 10px; /* Reduced space below the header */
    padding: 0 15px; /* Add padding to avoid touching the edge */
  }

  /* Explanation Section */
  .explanation-section {
    width: 85%; /* Slightly wider to use more space */
    padding: 10px; /* Increase padding */
    margin: 0 auto; /* Center the section */
  }

  .subtitle {
    font-size: 0.9em; /* Reduce font size of subtitle */
  }

  .explanation-text {
    font-size: 0.4em; /* Reduce font size of explanation text */
    margin-bottom: 8px; /* Adjust spacing */
  }

  /* Graph Item */
  .graph-item {
    max-width: 80%; /* Reduce max-width to make graphs smaller */
    padding: 0px; /* Increase padding to avoid touching edges */
  }

  .graph-content {
    height: 350px; /* Reduce height of graphs */
  }

  .graph-title {
    font-size: 1.2em; /* Reduce font size */
    margin-bottom: 10px; /* Adjust spacing */
  }

  /* Random Genre Generator Button */
  .random-genre-btn {
    width: 150px; /* Match the width of the back button */
    height: 42px; /* Match the height of the back button */
    font-size: 1em; /* Adjust font size */
  }

  /* Adjust the random genre generator container */
  .random-genre-generator {
    margin-top: 20px; /* Reduce top margin */
  }
}

/* Animation for the background gradient */
@keyframes gradientAnimation {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
</style>
