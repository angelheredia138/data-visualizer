<template>
  <v-container fluid class="animated-background">
    <!-- Floating Title and Back Button -->
    <div class="header-container">
      <h1 class="page-title">Genre Ranking and Artist Leaderboard!</h1>
      <v-btn class="back-button" @click="goBack">Back to Home</v-btn>
    </div>

    <!-- Top Card for Chart Explanations -->
    <v-card class="explanation-card mx-auto" max-width="1000" elevation="4">
      <v-card-text>
        <h2
          class="text-center"
          style="color: #2f855a; font-size: 1.5em; font-weight: 700"
        >
          Chart Explanations
        </h2>
        <p class="text-center" style="font-size: 1em">
          <strong>Most Played Genres:</strong> Displays the top genres you have
          listened to in the selected time range. Hover or tap on the bars to
          see the count of artists contributing to each genre.
        </p>
        <p class="text-center" style="font-size: 1em">
          <strong>Artist Leaderboard:</strong> Shows the most listened-to
          artists in the selected time range. Hover or tap on the bars to get
          more details about each artist and their popularity.
        </p>
        <p class="text-center" style="font-size: 1em">
          <strong>Random Genre Generator:</strong> Generate a random genre you
          have listened to at least once. This can help you discover less
          frequently played genres in your listening history.
        </p>
        <p class="text-center" style="font-size: 1em">
          These charts are created using D3.js.
        </p>
      </v-card-text>
    </v-card>

    <!-- Responsive layout for the graph cards -->
    <v-row class="mt-4" align="center" justify="center">
      <!-- Most Played Genres Card -->
      <v-col cols="12" md="5" class="d-flex justify-center mb-4">
        <v-card max-width="500" elevation="4" class="graph-card">
          <v-card-title class="text-center">Most Played Genres</v-card-title>
          <v-card-text>
            <MostPlayedGenres />
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Artist Leaderboard Card -->
      <v-col cols="12" md="5" class="d-flex justify-center mb-4">
        <v-card max-width="500" elevation="4" class="graph-card">
          <v-card-title class="text-center">Artist Leaderboard</v-card-title>
          <v-card-text>
            <ArtistLeaderboard />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Loading Spinner -->
    <v-row v-if="loading" justify="center" class="mt-6">
      <v-progress-circular indeterminate color="green"></v-progress-circular>
    </v-row>
  </v-container>
</template>

<script setup>
import { useRouter } from "vue-router";
import MostPlayedGenres from "~/pages/components/most-played-genres.vue";
import ArtistLeaderboard from "~/pages/components/artist-leaderboard.vue";
import { ref } from "vue";

// State for loading
const loading = ref(true);

// Mock loading delay for demonstration (Remove in production)
setTimeout(() => {
  loading.value = false;
}, 2000);

// Navigation handler to go back to the home page
const router = useRouter();
const goBack = () => {
  router.push("/");
};
</script>

<style scoped>
.animated-background {
  background: linear-gradient(270deg, #4299e1, #48bb78, #4299e1);
  background-size: 600% 600%;
  animation: gradientAnimation 10s ease infinite;
  height: 100vh;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

/* Floating Title and Button */
.header-container {
  position: fixed;
  top: 20px;
  left: 0;
  width: 100%;
  text-align: center;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.page-title {
  color: #2f855a;
  font-size: 2.5em;
  font-weight: 700;
  margin-bottom: 10px;
}

.back-button {
  background-color: #e53e3e !important; /* Red color */
  color: white !important;
  text-transform: none;
  font-size: 1.1em;
  width: 150px;
  height: 40px;
}

.back-button:hover {
  background-color: #c53030 !important; /* Slightly darker red */
}

/* Explanation Card */
.explanation-card {
  background-color: rgba(255, 255, 255, 0.85); /* Semi-transparent white */
  padding: 20px;
}

/* Graph Cards */
.graph-card {
  padding: 20px;
  background-color: rgba(255, 255, 255, 0.85); /* Semi-transparent white */
}

@media (max-width: 768px) {
  /* For mobile view, stack the graph cards vertically */
  .header-container {
    position: static;
    margin-bottom: 20px;
  }

  .page-title {
    font-size: 2em;
  }

  .explanation-card {
    max-width: 100%;
  }

  .graph-card {
    max-width: 100%;
  }
}
</style>
