<template>
    <v-container fluid class="animated-background" style="min-height: 100vh; width: 100vw;">
      <v-card elevation="8" class="d-flex flex-column justify-center align-center" style="padding: 32px;">
        <v-row>
          <v-col class="text-center">
            <v-heading size="h2" style="font-size: 2em; font-weight: bold;">
              Welcome to Spotify Visualizer
            </v-heading>
            <p class="mt-2" style="font-size: 1.1em;">
              This website offers an interactive and visually engaging way to explore your Spotify listening habits. Dive into detailed analyses and visualizations of your top genres, artists, tracks, and more.
            </p>
          </v-col>
        </v-row>
  
        <v-row v-if="visualizations.length > 0" class="mt-6" justify="center" style="width: 100%">
          <v-col
            v-for="(vis, index) in visualizations"
            :key="index"
            cols="12"
            md="4"
            class="d-flex justify-center"
          >
            <v-card
              elevation="2"
              class="grid-item"
              outlined
              @click="handleExpand(index)"
              style="cursor: pointer; padding: 16px; background-color: white; color: black;"
            >
              <v-card-title>{{ vis.title }}</v-card-title>
            </v-card>
          </v-col>
        </v-row>
  
        <!-- Expanded Box -->
        <v-card v-if="expanded !== null" class="mt-6 expanded-box text-center">
          <v-card-title>{{ visualizations[expanded].title }}</v-card-title>
          <v-card-text class="mt-4">
            {{ visualizations[expanded].description }}
          </v-card-text>
          <v-row justify="center">
            <v-btn class="mt-4" color="blue" @click="handleNavigate(visualizations[expanded].path)">
              View {{ visualizations[expanded].title }}
            </v-btn>
            <v-btn class="mt-4 ml-4" color="red" @click="handleExpand(null)">
              Close
            </v-btn>
          </v-row>
        </v-card>
  
        <!-- Logout Button -->
        <v-btn class="mt-6" color="red" @click="handleLogout">
          Logout
        </v-btn>
      </v-card>
    </v-container>
  </template>
  
  <script setup>
  import { useRouter } from 'vue-router'
  import { ref } from 'vue'
  
  const router = useRouter()
  
  const expanded = ref(null)
  const visualizations = ref([
    {
      title: 'Top Genres and Artists',
      description: 'Discover your most played genres and artists with interactive charts and detailed insights.',
      path: '/top-genres-artists',
    },
    {
      title: 'Audio Features',
      description: 'Visualize attributes like danceability, energy, tempo, and valence of your top tracks with radar charts or scatter plots.',
      path: '/audio-features',
    },
    {
      title: 'Listening History',
      description: 'Explore your recently played tracks displayed on a clock timeline, showcasing your listening patterns.',
      path: '/listening-history',
    },
    {
      title: 'Genres',
      description: 'Understand the distribution of genres you listen to with pie charts or word clouds.',
      path: '/genres',
    },
    {
      title: 'Playlists',
      description: 'Explore your created and followed playlists using network graphs showing relationships between playlists, tracks, and artists.',
      path: '/playlists',
    },
    {
      title: 'Classic Spotify Wrapped',
      description: 'Relive your music journey with a nostalgic view of your top tracks, artists, and genres, with engaging visualizations.',
      path: '/wrapped',
    }
  ])
  
  // Function to expand/collapse visualization cards
  const handleExpand = (index) => {
    expanded.value = expanded.value === index ? null : index
  }
  
  // Handle navigation to a specific visualization
  const handleNavigate = (path) => {
    router.push(path)
  }
  
  // Handle logout and redirect to login
  const handleLogout = () => {
    localStorage.removeItem('spotify_access_token')
    localStorage.removeItem('spotify_refresh_token')
    sessionStorage.removeItem('spotifyCallbackHandled')
    router.push('/')
  }
  </script>
  
  <style scoped>
  /* Style for expanded box */
  .expanded-box {
    padding: 24px;
    background-color: white;
    color: black;
    border-radius: 8px;
  }
  
  /* Style for grid items */
  .grid-item {
    transition: transform 0.2s;
  }
  .grid-item:hover {
    transform: scale(1.05);
  }
  
  .animated-background {
    background-color: #e0f7fa; /* Modify this to your background */
    padding: 20px;
  }
  </style>
  