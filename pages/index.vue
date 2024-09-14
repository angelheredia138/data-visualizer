<template>
  <v-container fluid class="animated-background">
    <!-- Main Login Card with increased padding -->
    <v-card class="mx-auto py-6 px-4 text-center" max-width="450" elevation="8">
      <!-- Heading with a slightly smaller font size -->
      <v-card-title class="text-center" style="color: #2f855a; font-size: 1.8em; font-weight: 700;">
        Spotify Data Visualizer
      </v-card-title>
      <!-- Subtitle: Smaller text and centered -->
      <v-card-text class="text-center" style="font-size: 0.9em;">
        Log in to view your Spotify listening habits.
      </v-card-text>
      <!-- Green Login Button: centered, non-uppercase, and hover effect -->
      <v-btn
        class="mt-3 py-2 font-weight-bold centered-button"
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
import { ref } from 'vue'

// Use the .env file for the client ID
const clientId = process.env.SPOTIFY_CLIENT_ID;

const handleLogin = () => {
  const redirectUri = 'https://angel-heredia.com/spotify-visualizer-frontend/callback'
  const apiUrl = 'https://accounts.spotify.com/authorize'
  const scope = 'user-read-recently-played user-top-read'

  window.location.href = `${apiUrl}?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code&show_dialog=true`
}

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
