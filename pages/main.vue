<template>
  <v-container
    fluid
    class="animated-background"
    style="
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    "
  >
    <div
      class="content-wrapper"
      style="
        width: 100%;
        max-width: 1200px;
        text-align: center;
        justify-content: center;
      "
    >
      <!-- Welcome Message & Subtitle -->
      <v-row class="mb-8" justify="center">
        <v-col cols="12" class="text-center">
          <h1 style="font-size: 2.5em; font-weight: bold; color: white">
            Welcome to Spotify Visualizer
          </h1>
          <p style="font-size: 1.2em; color: white; margin-top: 10px">
            This website offers an interactive and visually engaging way to
            explore your Spotify listening habits. Dive into detailed analyses
            and visualizations of your top genres, artists, tracks, and more.
          </p>
        </v-col>
      </v-row>

      <!-- Centered Visualization Buttons -->
      <v-row class="mb-4" style="justify-content: center">
        <v-col
          v-for="(vis, index) in visualizations"
          :key="index"
          cols="12"
          md="3"
          class="d-flex justify-center mb-4"
          style="display: flex; justify-content: center"
        >
          <v-btn
            color="primary"
            class="grid-item"
            outlined
            @click="handleNavigate(vis.path)"
          >
            {{ vis.title }}
          </v-btn>
        </v-col>
      </v-row>

      <!-- Logout Button -->
      <v-row style="justify-content: center" class="mt-4">
        <v-btn color="primary" class="logout-btn" @click="handleLogout">
          Logout
        </v-btn>
      </v-row>
    </div>
  </v-container>
</template>

<script setup>
import { useRouter } from "vue-router";
import { ref } from "vue";

const router = useRouter();

const visualizations = ref([
  {
    title: "Top Genres and Artists",
    path: "/top-genres-artists",
  },
  {
    title: "Audio Features",
    path: "/audio-features",
  },
  {
    title: "Listening History",
    path: "/listening-history",
  },
  {
    title: "Genres",
    path: "/genres",
  },
  {
    title: "Playlists",
    path: "/playlists",
  },
  {
    title: "Wrapped",
    path: "/wrapped",
  },
]);

// Handle navigation to a specific visualization
const handleNavigate = (path) => {
  router.push(path);
};

// Handle logout and redirect to login
const handleLogout = () => {
  localStorage.removeItem("spotify_access_token");
  localStorage.removeItem("spotify_refresh_token");
  router.push("/");
};
</script>

<style scoped>
/* Background for consistency with login page */
.animated-background {
  background-color: #e0f7fa;
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Wrapper for the content so it is centered */
.content-wrapper {
  width: 100%;
  max-width: 1200px;
  text-align: center;
}

/* Style for grid buttons hover effect */
.grid-item {
  border-radius: 8px;
  background-color: white !important; /* Initial background */
  color: black !important; /* Initial text color */
  font-size: 1.3em;
  font-weight: bold;
  height: 80px;
  width: 100%;
  max-width: 300px;
  text-transform: none;
  cursor: pointer;
}

.grid-item:hover {
  transform: scale(1.05); /* Button grows on hover */
  background-color: #f0f0f0 !important; /* Light background on hover */
  color: black !important; /* Ensure text color stays black */
}

/* Style for logout button */
.logout-btn {
  background-color: red !important; /* Initial background */
  color: white; /* Initial text color set to white */
  width: 150px;
  text-transform: none;
}

.logout-btn:hover {
  background-color: darkred !important; /* Darker background color on hover */
  transform: scale(1.05); /* Button grows on hover */
  color: white; /* Ensures text remains white and visible */
}
</style>
