<template>
  <div class="animated-background">
    <!-- Loading Overlay -->
    <div v-show="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <div class="loading-message">Loading...</div>
    </div>

    <!-- Content -->
    <div v-show="!loading">
      <h2 class="heading motion-heading">Classic Spotify Wrapped</h2>
      <div class="center-container">
        <button class="button back-button" @click="navigateToHome">
          Back to Home
        </button>
      </div>

      <!-- Sections -->
      <div id="section1" class="element">
        <div class="chart-container">
          <TopSummary
            :topArtist="data.top_artist"
            :topSong="data.top_track"
            :topGenre="data.top_genre"
          />
          <button @click="scrollToNext('section2')" :disabled="scrollLocked">
            Next
          </button>
        </div>
      </div>

      <div id="section2" class="element">
        <div class="chart-container">
          <TopArtists :artists="data.top_artists || []" />
          <button @click="scrollToNext('section3')" :disabled="scrollLocked">
            Next
          </button>
        </div>
      </div>

      <div id="section3" class="element">
        <div class="chart-container">
          <Summary
            :listeningTime="data.listening_time"
            :uniqueGenres="data.unique_genres"
            :uniqueArtists="data.unique_artists"
            :trends="data.trends"
          />
          <button @click="scrollToNext('section4')" :disabled="scrollLocked">
            Next
          </button>
        </div>
      </div>

      <div id="section4" class="element">
        <div class="chart-container">
          <h3 class="final-heading">Thank You for Viewing!</h3>
          <p class="final-text">We hope you enjoyed your Wrapped experience.</p>
          <div class="thank-you-container">
            <h3 class="thank-you-heading">A Special Thank You!</h3>
            <p class="thank-you-text">
              Your journey through this Wrapped experience means the world to
              me. This project has been a labor of love and seeing you reach
              this point is incredibly rewarding. I hope these insights bring a
              smile to your face and a song to your heart. Thank you.
            </p>
          </div>
          <button @click="navigateToHome" class="button">Back to Home</button>
        </div>
      </div>
    </div>
  </div>
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
const scrollLocked = ref(false);

const navigateToHome = () => {
  router.push("/main");
};

const scrollToNext = (id) => {
  unlockScroll();
  $scrollTo(`#${id}`, 800, { easing: "ease-in-out" });
};

const lockScroll = () => {
  document.body.style.overflow = "hidden";
  scrollLocked.value = true;
};

const unlockScroll = () => {
  document.body.style.overflow = "auto";
  scrollLocked.value = false;
};

onMounted(() => {
  // Simulate loading delay
  setTimeout(() => {
    loading.value = false;
  }, 2000);
});
</script>

<style scoped>
/* Animated Background */
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

/* Loading Overlay */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.loading-spinner {
  width: 80px;
  height: 80px;
  border: 8px solid rgba(255, 255, 255, 0.3);
  border-top: 8px solid white;
  border-radius: 50%;
  animation: spin 1.5s linear infinite;
}

.loading-message {
  font-size: 1.2rem;
  color: white;
  margin-top: 20px;
  font-weight: bold;
}

/* Header Styling */
.heading {
  font-size: 2rem;
  color: white;
  margin-top: 20px;
  text-align: center;
}

/* Button Styling */
.button {
  background-color: #e53e3e;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  transition: transform 0.2s ease-in-out;
}

.button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.button:hover {
  transform: scale(1.05);
}

.back-button {
  margin: 20px auto;
}

/* Chart Container */
.chart-container {
  margin: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* Section Container */
.element {
  padding: 2rem 0;
}

/* Final Section */
.final-heading {
  font-size: 1.5rem;
  margin-bottom: 10px;
}

.final-text {
  margin-bottom: 20px;
}

.thank-you-container {
  margin: 20px 0;
}

.thank-you-heading {
  font-size: 1.3rem;
  font-weight: bold;
  margin-bottom: 10px;
}

.thank-you-text {
  font-size: 1rem;
}

/* Gradient Animation */
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

/* Spinner Animation */
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
