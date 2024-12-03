<template>
  <v-container fluid class="animated-background">
    <!-- Main Login Card with increased padding for the bottom -->
    <v-card
      class="mx-auto p-8 text-center"
      max-width="500"
      elevation="8"
      style="padding-bottom: 20px"
    >
      <!-- Heading with a slightly smaller font size -->
      <v-card-title
        class="text-center"
        style="color: #2f855a; font-size: 2em; font-weight: 700"
      >
        Spotify Data Visualizer
      </v-card-title>
      <!-- Subtitle: Smaller text and centered -->
      <v-card-text class="text-center" style="font-size: 1em">
        Log in to view your Spotify listening habits.
      </v-card-text>
      <!-- Green Login Button: centered, non-uppercase, and hover effect -->
      <v-btn color="primary" class="hoverable-btn" @click="handleLogin">
        Log in with Spotify
      </v-btn>
    </v-card>
  </v-container>
</template>

<script setup>
const config = useRuntimeConfig();

const handleLogin = () => {
  const clientId = config.public.spotifyClientId;
  const redirectUri = config.public.spotifyRedirectUri;
  const scope =
    "user-read-recently-played user-read-currently-playing user-top-read"; // Corrected scope

  const spotifyAuthUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&redirect_uri=${redirectUri}&scope=${scope}&show_dialog=true`;

  window.location.href = spotifyAuthUrl;
};
useHead({
  title: "Data Visualizer",
});
</script>

<style scoped>
/* Prevent scrolling on body */
body,
html {
  overflow: hidden !important; /* Disable scrolling on the entire page */
  height: 100%;
  margin: 0;
}

/* Container styles */
.animated-background {
  background: linear-gradient(270deg, #4299e1, #48bb78, #4299e1);
  background-size: 600% 600%;
  animation: gradientAnimation 10s ease infinite;
  min-height: 100vh;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  position: fixed; /* Fix the container position to prevent scroll */
  overflow: hidden; /* Prevent scrolling within the container */
}

/* Main Login Card styles */
.v-card {
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
}

/* Button styles */
.hoverable-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-left: auto;
  margin-right: auto;
  background-color: #2f855a !important;
  color: white !important;
  font-size: 1.1em;
  width: 200px;
  height: 48px;
  text-transform: none;
}

.hoverable-btn:hover {
  background-color: #276749 !important;
  transform: scale(1.05) !important;
  color: white !important;
}

/* Responsive adjustments for mobile */
@media (max-width: 768px) {
  .v-card {
    padding: 8px !important; /* Reduce padding on mobile */
    max-width: 70%; /* Make the card full-width with padding */
  }

  .v-card-title {
    font-size: 1.5em !important; /* Smaller font size for mobile */
    text-align: center;
  }

  .v-card-text {
    font-size: 0.9em !important; /* Smaller font size for text on mobile */
  }

  .hoverable-btn {
    width: 180px; /* Smaller button width */
    height: 44px; /* Smaller button height */
    font-size: 1em; /* Smaller font size for button */
  }
}

/* Background animation */
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
