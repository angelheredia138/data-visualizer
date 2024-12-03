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
        <h1 class="page-title">Listening History</h1>

        <v-btn color="primary" class="back-button" @click="goBack">
          Back to Home
        </v-btn>
      </div>

      <!-- Top Section for Chart Explanations -->
      <div class="explanation-section" style="max-width: 800px">
        <h2 class="subtitle">Chart Explanation</h2>
        <p class="explanation-text">
          <strong>Recently Played Timeline:</strong> This chart displays your
          recently played tracks on a clock timeline, allowing you to see your
          listening patterns and identify the most recent track played. Each dot
          on the timeline represents a track, and the position of the dot
          corresponds to the time you listened to the track.
        </p>
        <p class="explanation-text">These charts are created using D3.js.</p>
      </div>

      <!-- Graphs Section -->
      <div class="graphs-container">
        <!-- Timeline Chart -->
        <div class="graph-item">
          <h3 class="graph-title">Timeline Chart</h3>
          <div class="graph-content">
            <Timeline :timeRange="localTimeRange" />
            <p class="explanation-text">
              This clock actively updates as the day goes on, displaying what
              song you were listening to at what time.
            </p>
            <p class="explanation-text">
              Gray data points are from the day before, and the colored data
              points are from today.
            </p>
          </div>
        </div>
      </div>
    </div>
  </v-container>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import Timeline from "~/pages/components/timeline.vue"; // Import the Timeline component

// State for loading overlay
const showLoadingOverlay = ref(true);

// Responsive screen size state
const screenSize = reactive({
  width: 0,
  height: 0,
  isSmall: false,
});

// Time range selection
const localTimeRange = ref("medium_term");

// Function to update screen size state
const updateScreenSize = () => {
  if (typeof window !== "undefined") {
    screenSize.width = window.innerWidth;
    screenSize.height = window.innerHeight;
    screenSize.isSmall = window.innerWidth < 768;
  }
};

// Router navigation
const router = useRouter();
const goBack = () => {
  router.push("/main");
};

// Add event listener on mount
onMounted(() => {
  if (typeof window !== "undefined") {
    window.addEventListener("resize", updateScreenSize);
    updateScreenSize(); // Initialize with current size
  }

  // Hide the loading overlay after 2 seconds (adjust as needed)
  setTimeout(() => {
    showLoadingOverlay.value = false;
  }, 2000);
});

// Remove event listener on before unmount
onBeforeUnmount(() => {
  if (typeof window !== "undefined") {
    window.removeEventListener("resize", updateScreenSize);
  }
});

// Update the window title using useHead
useHead({
  title: "Listening History",
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
  align-items: center;
  justify-content: flex-start;
  padding: 20px;
  box-sizing: border-box;
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
  font-size: 1.2em; /* Smaller font size */
  font-weight: bold;
  color: white;
}

/* Fixed Title and Button */
.header-container {
  width: 100%;
  text-align: center;
  margin-bottom: 20px; /* Reduce margin */
  flex-shrink: 0;
}

.page-title {
  color: white;
  font-size: 2em; /* Reduce font size */
  font-weight: 700;
  margin-bottom: 10px;
}

.back-button {
  background-color: #e53e3e !important;
  color: white;
  text-transform: none;
  font-size: 1em; /* Reduce button size */
  width: 120px; /* Smaller width */
  height: 40px;
}

.back-button:hover {
  background-color: #c53030 !important;
}

/* Explanation Section */
.explanation-section {
  background-color: rgba(255, 255, 255, 0.85);
  padding: 15px; /* Reduce padding */
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 15px; /* Reduce margin */
  width: 100%;
  max-width: 700px; /* Reduce width */
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-left: auto;
  margin-right: auto;
}

.subtitle {
  font-size: 1.2em; /* Reduce font size */
  text-align: center;
}

.explanation-text {
  font-size: 0.9em; /* Reduce font size */
  margin-bottom: 8px; /* Adjust margin */
}

/* Graphs Container */
.graphs-container {
  margin-bottom: 15px; /* Reduce margin */
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
  max-width: 500px; /* Limit the width on mobile */
  margin: 15px 0; /* Reduce margin */
  background-color: rgba(
    255,
    255,
    255,
    0.85
  ); /* Slightly transparent white background */
  border-radius: 8px;
  padding: 15px; /* Reduce padding */
  box-sizing: border-box;
}

@media (min-width: 769px) {
  .graph-item {
    flex: 0 0 35%; /* Reduce size */
    margin: 0 15px; /* Reduce margin */
    max-width: none; /* Remove max-width constraint */
  }
}

.graph-title {
  font-size: 1.5em; /* Reduce font size */
  color: black;
  text-align: center;
  margin-bottom: 10px;
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

/* Responsive Adjustments */
@media (max-width: 768px) {
  .page-title {
    font-size: 1.2em;
  }

  .header-container {
    margin-bottom: 10px;
    padding: 0 15px;
  }

  .explanation-section {
    width: 85%;
    padding: 10px;
    margin: 0 auto;
  }

  .subtitle {
    font-size: 0.9em;
  }

  .explanation-text {
    font-size: 0.8em;
    margin-bottom: 8px;
  }

  .graph-item {
    max-width: 80%;
    padding: 10px;
  }

  .graph-content {
    height: 300px; /* Reduce height of the chart */
  }

  .graph-title {
    font-size: 1.2em;
    margin-bottom: 10px;
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

/* Additional mobile-specific styles */
@media (max-width: 768px) {
  .graph-content {
    position: relative;
    height: auto;
  }

  .graph-content svg {
    width: 100%;
    height: auto;
  }

  .explanation-text {
    margin-top: 10px;
  }
}
</style>
