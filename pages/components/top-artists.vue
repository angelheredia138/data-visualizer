<template>
  <div class="chart-container-transparent">
    <canvas ref="confettiCanvas" class="confetti-canvas"></canvas>

    <div v-if="error" class="error-message">{{ error }}</div>

    <div v-else-if="!dataRevealed">
      <v-btn
        v-if="!countdownActive"
        color="primary"
        @click="startCountdown"
        class="reveal-button"
      >
        Reveal Top Artists
      </v-btn>

      <transition name="fade">
        <h3 v-if="countdownActive && countdown > 0" class="countdown-message">
          {{ countdown }}
        </h3>
      </transition>
    </div>

    <div v-else>
      <div class="artists-list">
        <div
          v-for="(artist, index) in topArtists"
          :key="index"
          class="artist-card"
        >
          <img :src="artist.image" :alt="artist.name" class="artist-image" />
          <div>
            <h3>{{ artist.name }}</h3>
            <p>Popularity: {{ artist.popularity }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import confetti from "canvas-confetti";

const topArtists = ref([]);
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
  fetchTopArtists();
});

onBeforeUnmount(() => {
  if (confettiInstance) {
    confettiInstance.reset();
  }
});

const { $axios } = useNuxtApp();

const fetchTopArtists = async () => {
  try {
    loading.value = true;
    const token = localStorage.getItem("spotify_access_token");
    if (!token) throw new Error("No Spotify token found.");

    const headers = { Authorization: `Bearer ${token}` };
    const response = await $axios.get(
      `/top-five-artists?time_range=long_term`,
      {
        headers,
      }
    );

    topArtists.value = response.data.topArtists;
  } catch (err) {
    error.value = "Error fetching top artists data.";
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

.artists-list {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.artist-card {
  display: flex;
  align-items: center;
  gap: 20px;
  border: 1px solid #e2e8f0;
  padding: 10px;
  border-radius: 8px;
}

.artist-image {
  width: 80px;
  height: 80px;
  border-radius: 50%;
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
