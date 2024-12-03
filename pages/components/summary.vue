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
        Reveal Summary
      </v-btn>

      <transition name="fade">
        <h3 v-if="countdownActive && countdown > 0" class="countdown-message">
          {{ countdown }}
        </h3>
      </transition>
    </div>

    <div v-else>
      <!-- Last Three Songs -->
      <div class="songs-list">
        <h3>Your Last Three Songs</h3>
        <div
          v-for="(song, index) in lastThreeSongs"
          :key="index"
          class="song-card"
        >
          <img :src="song.albumImage" alt="Album Art" class="artist-image" />
          <div>
            <h3>{{ song.name }}</h3>
            <p>{{ song.artist }}</p>
          </div>
        </div>
      </div>

      <!-- Listening Trends -->
      <div class="summary-section">
        <h3>Listening Trends</h3>
        <p>{{ summary.trends }}</p>
      </div>

      <!-- Unique Genres -->
      <div class="summary-section">
        <h3>Unique Genres</h3>
        <p>{{ getGenresText(summary.uniqueGenres) }}</p>
      </div>

      <!-- Unique Artists -->
      <div class="summary-section">
        <h3>Unique Artists</h3>
        <p>{{ getArtistsText(summary.uniqueArtists) }}</p>
      </div>
    </div>
    <!-- Currently Playing -->
    <div v-if="nowPlaying" class="now-playing-card">
      <h3>YOU'RE LISTENING TO MUSIC RIGHT NOW!</h3>
      <p>HERE'S THE SONG:</p>
      <img :src="nowPlaying.albumImage" alt="Album Art" class="artist-image" />
      <h3>{{ nowPlaying.name }}</h3>
      <p>{{ nowPlaying.artist }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import confetti from "canvas-confetti";

const lastThreeSongs = ref([]);
const nowPlaying = ref(null);
const summary = ref({
  uniqueGenres: null,
  uniqueArtists: null,
  trends: null,
});
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
  fetchListeningData();
  pollNowPlaying(); // Start polling the now-playing endpoint
});

onBeforeUnmount(() => {
  if (confettiInstance) {
    confettiInstance.reset();
  }
});

const { $axios } = useNuxtApp();

const fetchListeningData = async () => {
  try {
    loading.value = true;
    const token = localStorage.getItem("spotify_access_token");
    if (!token) throw new Error("No Spotify token found.");

    const headers = { Authorization: `Bearer ${token}` };

    // Fetch last three songs
    const lastThreeRes = await $axios.get("/last_three_songs", { headers });
    lastThreeSongs.value = lastThreeRes.data.lastThreeSongs;

    // Fetch currently playing song
    const nowPlayingRes = await $axios.get("/now_playing", { headers });
    nowPlaying.value = nowPlayingRes.data.nowPlaying;

    // Fetch listening trends, unique genres, and unique artists
    const [uniqueGenresRes, uniqueArtistsRes, trendsRes] = await Promise.all([
      $axios.get("/unique_genres", { headers }),
      $axios.get("/unique_artists", { headers }),
      $axios.get("/trends_insights", { headers }),
    ]);

    summary.value = {
      uniqueGenres: uniqueGenresRes.data.unique_genres,
      uniqueArtists: uniqueArtistsRes.data.unique_artists,
      trends: trendsRes.data.trends,
    };
  } catch (err) {
    error.value = "Error fetching listening data.";
    console.error(err);
  } finally {
    loading.value = false;
  }
};

// Poll now-playing endpoint every 5 seconds
const pollNowPlaying = () => {
  setInterval(async () => {
    try {
      const token = localStorage.getItem("spotify_access_token");
      if (!token) return;

      const headers = { Authorization: `Bearer ${token}` };
      const nowPlayingRes = await $axios.get("/now_playing", { headers });
      nowPlaying.value = nowPlayingRes.data.nowPlaying;
    } catch (err) {
      console.error("Error polling now playing:", err);
    }
  }, 5000);
};

const getGenresText = (genres) => {
  if (!genres) return "Unveiling the genres you've explored...";
  if (genres > 50)
    return `You've explored over ${genres} unique genres. You're musically adventurous!`;
  if (genres > 20) return `${genres} unique genres—quite diverse!`;
  return `${genres} genres. You know what you like!`;
};

const getArtistsText = (artists) => {
  if (!artists) return "Compiling a list of your favorite artists...";
  if (artists > 200)
    return `Incredible! ${artists} artists made it to your playlist last month.`;
  if (artists > 100) return `${artists} artists—a wide range of favorites!`;
  return `${artists} artists. You prefer quality over quantity.`;
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

.songs-list,
.now-playing-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  margin-top: 20px;
}

.now-playing-card {
  justify-content: center; /* Center content vertically */
  text-align: center;
  margin: 40px auto; /* Center horizontally */
  max-width: 400px;
}

.song-card {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 10px;
  border-radius: 8px;
  max-width: 400px;
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
