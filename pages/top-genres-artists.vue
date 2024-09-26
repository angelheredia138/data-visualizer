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
      <div class="explanation-section mx-auto" style="max-width: 800px">
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

      <!-- Grid Layout for Charts -->
      <v-row class="mt-4 grid-container" align="center" justify="center">
        <!-- Most Played Genres Grid Cell -->
        <v-col cols="12" md="6" class="grid-cell mb-4">
          <div class="grid-item">
            <h3 class="grid-title">Most Played Genres</h3>
            <div class="graph-container">
              <MostPlayedGenres />
            </div>
          </div>
        </v-col>

        <!-- Artist Leaderboard Grid Cell -->
        <v-col cols="12" md="6" class="grid-cell mb-4">
          <div class="grid-item">
            <h3 class="grid-title">Artist Leaderboard</h3>
            <div class="graph-container">
              <ArtistLeaderboard />
            </div>
          </div>
        </v-col>
      </v-row>

      <!-- Random Genre Generator Button Component -->
      <v-row justify="center" class="mt-4">
        <RandomGenreButton />
      </v-row>
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
</script>

<style scoped>
/* Global box-sizing and overflow handling */
*,
*::before,
*::after {
  box-sizing: border-box; /* Include padding and border in width and height */
}

html,
body,
#app {
  height: 100%;
  margin: 0;
  padding: 0;
  overflow-y: auto; /* Allow the entire page to scroll vertically */
  overflow-x: hidden; /* Prevent horizontal scrolling */
}

/* Main Container Styling */
.animated-background {
  background: linear-gradient(270deg, #4299e1, #48bb78, #4299e1);
  background-size: 600% 600%;
  animation: gradientAnimation 10s ease infinite;
  min-height: 100vh; /* Ensure the container covers the full viewport */
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: auto;
  justify-content: flex-start; /* Align items at the top */
  padding: 20px; /* Adjust padding to accommodate fixed header */
  box-sizing: border-box; /* Include padding and border in width and height */
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
  z-index: 9999; /* Ensure it is on top of all other elements */
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
  margin-bottom: 20px; /* Space between header and explanation card */
  flex-shrink: 0; /* Prevent shrinking of header */
}

.page-title {
  color: white;
  font-size: 2.5em;
  font-weight: 700;
  margin-bottom: 10px;
}

.back-button {
  background-color: #e53e3e !important; /* Red color */
  color: white;
  text-transform: none;
  font-size: 1.1em;
  width: 150px;
  height: 40px;
}

.back-button:hover {
  background-color: #c53030 !important; /* Slightly darker red */
}

/* Explanation Section */
.explanation-section {
  background-color: rgba(255, 255, 255, 0.85); /* Semi-transparent white */
  padding: 20px;
  border-radius: 8px; /* Rounded corners */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* Slight shadow */
  margin-bottom: 20px; /* Space below the explanation section */
  width: 100%; /* Ensure the section takes full width */
  max-width: 800px; /* Limit the max width for better layout */
  flex-shrink: 0; /* Prevent shrinking */
}

/* Grid Container for Charts */
.grid-container {
  width: 100%;
  max-width: 1200px;
  flex-grow: 1; /* Allow grid container to grow */
  box-sizing: border-box; /* Include padding and border in width and height */
  overflow: visible; /* Allow content to flow outside if necessary */
}

/* Grid Cell Styling */
.grid-cell {
  padding: 15px; /* Space around each grid cell */
}

/* Grid Item Styling */
.grid-item {
  background-color: rgba(255, 255, 255, 0.85); /* Semi-transparent white */
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  min-height: 400px; /* Minimum height for grid items */
  overflow: hidden; /* Hide any overflowing content */
}

/* Grid Title */
.grid-title {
  font-size: 1.2em;
  font-weight: 600;
  text-align: center;
  margin-bottom: 15px;
}

/* Graph Container */
.graph-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
  overflow: hidden; /* Hide any overflowing content */
}

/* Random Genre Button Centering */
.v-row {
  justify-content: center;
  align-items: center;
}

/* Responsive Adjustments */
@media (max-width: 768px) {
  /* For mobile view, stack the grid cells vertically */
  .header-container {
    margin-bottom: 20px;
  }

  .page-title {
    font-size: 2em;
  }

  .explanation-section {
    max-width: 100%;
  }

  .grid-cell {
    padding: 10px; /* Adjust padding for better fit on mobile */
  }

  .grid-item {
    padding: 15px; /* Adjust padding inside grid item */
    min-height: 300px; /* Reduced height for mobile */
  }

  .graph-container {
    height: 300px; /* Adjust height for better fit on mobile */
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
