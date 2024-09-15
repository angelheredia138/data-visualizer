<template>
  <v-container fluid class="animated-background">
    <!-- Main Login Card with increased padding for the bottom -->
    <v-card class="mx-auto p-8 text-center" max-width="500" elevation="8" style="padding-bottom: 20px;">
      <!-- Heading with a slightly smaller font size -->
      <v-card-title class="text-center" style="color: #2f855a; font-size: 2em; font-weight: 700;">
        Spotify Data Visualizer
      </v-card-title>
      <!-- Subtitle: Smaller text and centered -->
      <v-card-text class="text-center" style="font-size: 1em;">
        Log in to view your Spotify listening habits.
      </v-card-text>
      <!-- Green Login Button: centered, non-uppercase, and hover effect -->
      <v-btn
        class="mt-4 py-2 font-weight-bold centered-button"
        style="background-color: #2f855a; font-size: 1.1em; width: 200px; margin: 0 auto; color: white; text-transform: none;"
        @mouseover="hoverButton"
        @mouseleave="unhoverButton"
        @click="handleLogin"
      >
        Log in with Spotify
      </v-btn>
    </v-card>
  </v-container>
</template>

<script setup>
const config = useRuntimeConfig()

const handleLogin = () => {
  const clientId = config.public.spotifyClientId;
  const redirectUri = config.public.spotifyRedirectUri;
  const scope = 'user-read-recently-played user-top-read'; // Corrected scope

  const spotifyAuthUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&redirect_uri=${redirectUri}&scope=${scope}&show_dialog=true`;

  window.location.href = spotifyAuthUrl;}

// Hover effect to slightly darken the button
const hoverButton = (event) => {
  event.target.style.backgroundColor = '#276749'; // Slightly darker green
}

const unhoverButton = (event) => {
  event.target.style.backgroundColor = '#2f855a'; // Original green
}
</script>

<style scoped>
.centered-button {
  display: block;
  margin-left: auto;
  margin-right: auto;
  text-align: center;
  transition: background-color 0.3s ease;
}
</style>
