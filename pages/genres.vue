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
    <div v-if="!showLoadingOverlay">
      <!-- Fixed Title and Back Button -->
      <div class="header-container">
        <h1 class="page-title">Genre Pie Chart and Word Cloud!</h1>
        <v-btn color="primary" class="back-button" @click="goBack">
          Back to Home
        </v-btn>
      </div>

      <!-- Top Section for Chart Explanations -->
      <div class="explanation-section" style="max-width: 800px">
        <h2 class="subtitle">Chart Explanations</h2>
        <p class="explanation-text">
          <strong>Genre Distribution Pie Chart:</strong> Displays the
          distribution of your favorite genres in a pie chart format. Hover or
          tap on each slice to see more details. Genres with only one artist
          listen are grouped together and listed below the chart.
        </p>
        <p class="explanation-text">These charts are created using D3.js.</p>
      </div>

      <!-- Graphs Section -->
      <div class="graphs-container">
        <!-- Genre Pie Chart -->
        <div class="graph-item">
          <h3 class="graph-title">Genre Pie Chart</h3>
          <div class="graph-content">
            <client-only>
              <PieChart />
            </client-only>
          </div>
        </div>
      </div>
    </div>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

// State for loading overlay
const showLoadingOverlay = ref(true);

// Router navigation
const router = useRouter();
const goBack = () => {
  router.push("/main");
};

// Dynamic import of the WordCloud component
const WordCloud = ref(null);
const PieChart = ref(null);

onMounted(() => {
  // Dynamically import components on the client-side
  import("~/pages/components/word-cloud.vue").then((module) => {
    WordCloud.value = module.default;
  });
  import("~/pages/components/pie-chart.vue").then((module) => {
    PieChart.value = module.default;
  });

  // Simulate loading delay
  setTimeout(() => {
    showLoadingOverlay.value = false;
  }, 2000);
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
  align-items: center; /* Center charts on smaller screens */
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
    flex: 0 0 37.5%; /* Ensure both graphs take up 37.5% */
    margin: 20px 20px; /* Space between the graphs */
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
  height: 400px;
}

/* Ensure the graph components fill their containers */
.graph-content > * {
  width: 100%;
  height: 100%;
}

/* Responsive Adjustments */
@media (max-width: 768px) {
  /* Reduce the font size of the page title */
  .page-title {
    font-size: 1.2em;
  }

  /* Adjust the header container */
  .header-container {
    margin-bottom: 10px;
    padding: 0 15px;
  }

  /* Explanation Section */
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

  /* Graph Item */
  .graph-item {
    max-width: 100%;
    padding: 10px;
  }

  .graph-content {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: visible;
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
