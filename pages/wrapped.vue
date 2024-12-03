<template>
  <v-container fluid class="animated-background">
    <!-- Fullscreen Loading Spinner and Message -->
    <div v-show="loading" class="loading-overlay">
      <v-progress-circular
        :size="80"
        :width="8"
        indeterminate
        color="white"
        class="loading-spinner"
      ></v-progress-circular>
      <div class="loading-message">Loading...</div>
    </div>

    <!-- Main Content -->

    <!-- Header with Title and Back Button -->
    <div class="header-container">
      <h1 class="page-title">Classic Spotify Wrapped</h1>
      <v-btn color="primary" class="back-button" @click="navigateToHome">
        Back to Home
      </v-btn>

      <!-- Graphs Container -->
      <div class="graphs-container">
        <!-- Section 1 -->
        <div id="section1" class="graph-item">
          <h3 class="graph-title">Your Top Highlights</h3>
          <div class="graph-content">
            <TopSummary
              :topArtist="data.top_artist"
              :topSong="data.top_track"
              :topGenre="data.top_genre"
            />
            <p class="description-text">
              This summary showcases your top artist, song, and genre of all
              time. It's a quick glimpse into what you've been vibing to the
              most as a Spotify Listener!
            </p>
          </div>
          <v-btn
            @click="scrollToNext('section2', 0)"
            color="primary"
            class="next-button"
            :disabled="buttonStates[0]"
          >
            Next
          </v-btn>
        </div>

        <!-- Section 2 -->
        <div id="section2" class="graph-item">
          <h3 class="graph-title">Your Top Artists</h3>
          <div class="graph-content">
            <TopArtists :artists="data.top_artists || []" />
            <p class="description-text">
              Dive deeper into your listening habits by exploring the artists
              you've enjoyed the most. This chart is a testament to your diverse
              taste in music!
            </p>
          </div>
          <v-btn
            @click="scrollToNext('section3', 1)"
            class="next-button"
            color="primary"
            :disabled="buttonStates[1]"
          >
            Next
          </v-btn>
        </div>

        <!-- Section 3 -->
        <div id="section3" class="graph-item">
          <h3 class="graph-title">Your Listening Summary</h3>
          <div class="graph-content">
            <Summary
              :listeningTime="data.listening_time"
              :uniqueGenres="data.unique_genres"
              :uniqueArtists="data.unique_artists"
              :trends="data.trends"
            />
            <p class="description-text">
              Discover the last three songs you've listened to, the number of
              unique genres explored, and the variety of artists you've
              encountered. It's a comprehensive view of your musical journey!
            </p>
          </div>
          <v-btn
            @click="scrollToNext('section4', 2)"
            class="next-button"
            color="primary"
            :disabled="buttonStates[2]"
          >
            Next
          </v-btn>
        </div>

        <!-- Section 4 -->
        <div id="section4" class="graph-item">
          <h3 class="graph-title">Thank You!</h3>
          <div class="graph-content">
            <p class="final-text">
              Thank you for exploring your Spotify Wrapped! This experience is a
              celebration of your unique taste in music. We hope these insights
              bring a smile to your face and remind you of the joy music brings.
            </p>
            <p class="description-text">
              Remember to keep listening, discovering, and enjoying your
              favorite tunes. Every play is a part of your story!
            </p>
          </div>
          <v-btn color="primary" @click="navigateToHome" class="back-button">
            Back to Home
          </v-btn>
        </div>
      </div>
    </div>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import TopSummary from "~/pages/components/top-summary.vue";
import TopArtists from "~/pages/components/top-artists.vue";
import Summary from "~/pages/components/summary.vue";

const router = useRouter();
const data = ref({
  top_artist: {},
  top_track: {},
  top_genre: "",
  top_artists: [],
  listening_time: 0,
  unique_genres: 0,
  unique_artists: 0,
  trends: "",
});
const loading = ref(true);
const buttonStates = ref([false, false, false]); // Array to track the disabled state of each button

const navigateToHome = () => {
  router.push("/main");
};

const scrollToNext = (id, buttonIndex) => {
  const target = document.getElementById(id);
  if (target) {
    target.scrollIntoView({ behavior: "smooth" });
    buttonStates.value[buttonIndex] = true; // Disable the clicked button
  }
};

// Responsive screen size state
const screenSize = ref({
  width: 0,
  height: 0,
  isSmall: false,
});

// Function to update screen size state
const updateScreenSize = () => {
  if (typeof window !== "undefined") {
    screenSize.value.width = window.innerWidth;
    screenSize.value.height = window.innerHeight;
    screenSize.value.isSmall = window.innerWidth < 768;
  }
};

onMounted(() => {
  if (typeof window !== "undefined") {
    window.addEventListener("resize", updateScreenSize);
    updateScreenSize(); // Initialize with current size
  }

  // Simulate loading delay
  setTimeout(() => {
    loading.value = false;
  }, 2000);
});

onBeforeUnmount(() => {
  if (typeof window !== "undefined") {
    window.removeEventListener("resize", updateScreenSize);
  }
});
</script>

<style scoped>
/* General Styles for Responsiveness */
html,
body,
#app {
  margin: 0;
  padding: 0;
  overflow-x: hidden; /* Prevent horizontal scrolling */
  overflow-y: auto;
}

/* Main Container Styling */
.animated-background {
  background: linear-gradient(270deg, #4299e1, #48bb78, #4299e1);
  background-size: 600% 600%;
  animation: gradientAnimation 10s ease infinite;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center; /* Center content on mobile */
  justify-content: flex-start;
  overflow-x: hidden; /* Prevent horizontal scrolling */
  padding: 30px;
  box-sizing: border-box;
}

/* Loading Overlay */
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
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
}

/* Header */
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
  font-size: 1.2rem;
  width: 150px;
  margin-bottom: 15px;
  height: 42px;
}

.back-button:hover {
  background-color: #c53030 !important;
}

/* Graphs Container */
.graphs-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  align-items: center; /* Center graphs on mobile */
  justify-content: flex-start;
}

/* Graph Item */
.graph-item {
  background: rgba(255, 255, 255, 0.85);
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  width: 100%;
  max-width: 700px;
  text-align: center;
}

.graph-title {
  font-size: 1.8rem;
  margin-bottom: 10px;
}

.graph-content {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

/* Button Styling */
.next-button {
  background-color: #38a169 !important;
  color: white;
  font-size: 1.2rem;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 20px;
}

.next-button:hover {
  background-color: #2f855a !important;
}

/* Responsive Adjustments for Mobile */
@media (max-width: 768px) {
  .page-title {
    font-size: 1.8rem; /* Adjusted font size for mobile */
  }

  .header-container {
    margin-bottom: 10px; /* Reduced space below header */
    text-align: center; /* Center text */
    padding: 0 15px; /* Add padding for edge spacing */
    align-items: center; /* Center horizontally */
    justify-content: center; /* Center vertically */
  }

  .graphs-container {
    gap: 10px; /* Reduce spacing between graphs */
  }

  .graph-item {
    max-width: 90%; /* Adjust graph width for mobile */
    padding: 15px; /* Reduce padding */
  }

  .graph-title {
    font-size: 1.2rem; /* Adjust font size */
  }

  .graph-content {
    margin-bottom: 10px; /* Reduce spacing */
  }

  .next-button {
    width: 100px; /* Adjust button width */
    height: 35px; /* Adjust button height */
    font-size: 0.9rem; /* Adjust font size */
  }

  .description-text {
    font-size: 0.85rem; /* Smaller description text */
    line-height: 1.4; /* Maintain readability */
    padding: 0 10px; /* Add padding for better spacing */
  }

  .back-button {
    width: 120px; /* Adjust width for back button */
    height: 35px; /* Adjust height for back button */
    font-size: 0.9rem; /* Adjust font size */
  }
}

/* Animation for the Background Gradient */
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
