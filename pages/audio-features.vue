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
        <h1 class="page-title">Top Tracks Audio Features</h1>

        <v-btn color="primary" class="back-button" @click="goBack">
          Back to Home
        </v-btn>
      </div>

      <!-- Top Section for Chart Explanations -->
      <div class="explanation-section" style="max-width: 800px">
        <h2 class="subtitle">Chart Explanations</h2>
        <p class="explanation-text">
          <strong>Scatter Plot:</strong> This scatter plot visualizes the audio
          features of your top tracks. Each point represents a track, plotted
          based on its energy and danceability. Hover or tap on a point to see
          more details about the track.
        </p>
        <p class="explanation-text">
          <strong>Radar Chart:</strong> This radar chart displays the audio
          features of selected tracks. The chart shows danceability, energy,
          tempo, and valence of each track. Hover or tap on the chart to see
          detailed information about each track.
        </p>
        <p class="explanation-text">These charts are created using D3.js.</p>
      </div>

      <!-- Graphs Section -->
      <div class="graphs-container">
        <!-- Audio Features Scatter Plot -->
        <div class="graph-item">
          <h3 class="graph-title">Scatter Plot</h3>
          <div class="graph-content">
            <ScatterPlot :timeRange="localTimeRange" />
          </div>
        </div>

        <!-- Audio Features Radar Chart -->
        <div class="graph-item">
          <h3 class="graph-title">Radar Chart</h3>
          <div class="graph-content">
            <RadarChart :timeRange="localTimeRange" />
          </div>
        </div>
      </div>

      <!-- Audio Features Explanation -->
      <div class="audio-features-explanation">
        <h3 class="graph-title">Audio Features Explanation</h3>
        <p class="explanation-text">
          <strong>Danceability:</strong> Describes how suitable a track is for
          dancing based on a combination of musical elements including tempo,
          rhythm stability, beat strength, and overall regularity. A value of
          0.0 is least danceable and 1.0 is most danceable.
        </p>
        <p class="explanation-text">
          <strong>Energy:</strong> A measure from 0.0 to 1.0 and represents a
          perceptual measure of intensity and activity. Typically, energetic
          tracks feel fast, loud, and noisy.
        </p>
        <p class="explanation-text">
          <strong>Tempo:</strong> The overall estimated tempo of a track in
          beats per minute (BPM). In musical terminology, tempo is the speed or
          pace of a given piece.
        </p>
        <p class="explanation-text">
          <strong>Valence:</strong> A measure from 0.0 to 1.0 describing the
          musical positiveness conveyed by a track. Tracks with high valence
          sound more positive (e.g. happy, cheerful, euphoric), while tracks
          with low valence sound more negative (e.g. sad, depressed, angry).
        </p>
      </div>
    </div>
  </v-container>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import ScatterPlot from "~/pages/components/scatter-plot.vue"; // Import the Scatter Plot component
import RadarChart from "~/pages/components/radar-chart.vue"; // Import the Radar Chart component

// State for loading overlay
const showLoadingOverlay = ref(true);

// Responsive screen size state
const screenSize = reactive({
  width: window.innerWidth,
  height: window.innerHeight,
  isSmall: window.innerWidth < 768,
});

// Time range selection
const localTimeRange = ref("medium_term");

// Function to update screen size state
const updateScreenSize = () => {
  screenSize.width = window.innerWidth;
  screenSize.height = window.innerHeight;
  screenSize.isSmall = window.innerWidth < 768;
};

// Router navigation
const router = useRouter();
const goBack = () => {
  router.push("/main");
};

// Add event listener on mount
onMounted(() => {
  window.addEventListener("resize", updateScreenSize);
  updateScreenSize(); // Initialize with current size

  // Hide the loading overlay after 2 seconds (adjust as needed)
  setTimeout(() => {
    showLoadingOverlay.value = false;
  }, 2000);
});

// Remove event listener on before unmount
onBeforeUnmount(() => {
  window.removeEventListener("resize", updateScreenSize);
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
  padding: 30px;
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

/* Graphs Container */
.graphs-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  align-items: center;
}

@media (min-width: 769px) {
  .animated-background {
    align-items: stretch; /* Stretch charts on larger screens */
    padding: 0;
  }
  .graphs-container {
    flex-direction: row;
    justify-content: center;
    align-items: flex-start;
  }
}

/* Graph Item */
.graph-item {
  width: 100%;
  max-width: 600px;
  margin: 20px 0;
  background-color: rgba(255, 255, 255, 0.85);
  border-radius: 8px;
  box-sizing: border-box;
}

@media (min-width: 769px) {
  .graph-item {
    max-width: 600px;
    flex: 0 0 35%;
    margin: 0 20px;
    max-width: none;
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
  max-height: 450px; /* Responsive height */
  display: flex;
  justify-content: center;
  margin-left: auto;
  margin-right: auto;
}

@media (min-width: 769px) {
  .graph-content {
    width: 90%;
    min-height: 700px;
  }
}

/* Audio Features Explanation */
.audio-features-explanation {
  margin-top: 20px;
  padding: 10px;
  background-color: rgba(255, 255, 255, 0.85);
  border-radius: 8px;
  width: 100%;
  max-width: 800px;
  box-sizing: border-box;
  font-size: 0.8em;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-left: auto;
  margin-right: auto;
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
    padding: 0px;
  }

  .graph-content {
    height: 340px;
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
</style>
