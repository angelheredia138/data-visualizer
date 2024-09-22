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
  const scope = "user-read-recently-played user-top-read"; // Corrected scope

  const spotifyAuthUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&redirect_uri=${redirectUri}&scope=${scope}&show_dialog=true`;

  window.location.href = spotifyAuthUrl;
};
</script>

<style scoped>
.hoverable-btn {
  display: flex; /* Use flex to align content */
  justify-content: center; /* Center content horizontally */
  align-items: center; /* Center content vertically */
  margin-left: auto;
  margin-right: auto;
  text-align: center;
  background-color: #2f855a !important; /* Original green color */
  color: white !important;
  font-size: 1.1em;
  width: 200px;
  height: 48px; /* Fixed height for consistent sizing */
  text-transform: none;
}

.hoverable-btn:hover {
  background-color: #276749 !important; /* Slightly darker green */
  transform: scale(1.05) !important; /* Increase size on hover */
  color: white !important; /* Ensure text color stays white */
}
</style>
