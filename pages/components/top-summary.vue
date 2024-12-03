<template>
  <div class="chart-container-transparent">
    <canvas ref="confettiCanvas" class="confetti-canvas"></canvas>

    <div v-if="error" class="error-message">{{ error }}</div>

    <div v-if="loading" class="loading-spinner">
      <v-progress-circular
        :size="40"
        :width="4"
        indeterminate
        color="white"
        class="loading-spinner"
      ></v-progress-circular>
    </div>

    <div v-else-if="!dataRevealed">
      <v-btn
        v-if="!countdownActive"
        color="primary"
        @click="startCountdown"
        class="reveal-button"
      >
        Reveal Highlights
      </v-btn>

      <transition name="fade">
        <h3 v-if="countdownActive && countdown > 0" class="countdown-message">
          {{ countdown }}
        </h3>
      </transition>
    </div>

    <div v-else>
      <div class="highlight">
        <h3>Top Artist</h3>
        <img :src="topArtist.image" alt="Top Artist" class="highlight-image" />
        <p>{{ topArtist.name }}</p>
      </div>
      <div class="highlight">
        <h3>Top Song</h3>
        <p>
          <strong>{{ topSong.title }}</strong> by {{ topSong.artist }}
        </p>
      </div>
      <div class="highlight">
        <h3>Top Genre</h3>
        <p>{{ topGenre }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import confetti from "canvas-confetti";

const topArtist = ref({});
const topSong = ref({});
const topGenre = ref("");
const countdown = ref(3);
const countdownActive = ref(false);
const dataRevealed = ref(false);
const loading = ref(false);
const error = ref(null);

// Confetti setup
const confettiCanvas = ref(null);
let confettiInstance;

onMounted(() => {
  confettiInstance = confetti.create(confettiCanvas.value, {
    resize: true,
    useWorker: true,
  });
  fetchHighlightsData();
});

onBeforeUnmount(() => {
  if (confettiInstance) {
    confettiInstance.reset();
  }
});

const { $axios } = useNuxtApp();

const fetchHighlightsData = async () => {
  try {
    loading.value = true;
    const token = localStorage.getItem("spotify_access_token");
    if (!token) throw new Error("No Spotify token found.");

    const headers = { Authorization: `Bearer ${token}` };
    const response = await $axios.get(`/wrapped/`, { headers });

    topArtist.value = response.data.top_artist;
    topSong.value = response.data.top_track;
    topGenre.value = response.data.top_genre;
  } catch (err) {
    error.value = "Error fetching highlights data.";
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const startCountdown = () => {
  countdownActive.value = true;
  let counter = countdown.value;

  const interval = setInterval(() => {
    counter--;
    countdown.value = counter;

    if (counter === 0) {
      clearInterval(interval);
      countdownActive.value = false;
      dataRevealed.value = true;
      triggerConfetti();
    }
  }, 1000);
};

const triggerConfetti = () => {
  if (confettiInstance) {
    confettiInstance({
      angle: 90,
      spread: 45,
      startVelocity: 45,
      particleCount: 100,
      origin: { x: 0.5, y: 0.5 },
    });
  }
};
</script>

<style scoped>
.chart-container-transparent {
  padding: 20px;
  text-align: center;
  position: relative;
}

.countdown-message {
  font-size: 3rem;
  color: blue;
  font-weight: bold;
}

.reveal-button {
  background-color: #38a169 !important; /* Green for action (Reveal) */
  color: white;
  font-size: 1.2rem;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.reveal-button:hover {
  background-color: #2f855a !important;
}

.highlight {
  margin-top: 20px;
}

.highlight h3 {
  font-size: 1.5rem;
}

.highlight-image {
  max-width: 200px;
  border-radius: 50%;
  margin: 10px 0;
}

.loading-spinner {
  color: green;
  font-weight: bold;
  font-size: 1.5rem;
}

.error-message {
  color: red;
  font-weight: bold;
  font-size: 1.2rem;
}

.confetti-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
