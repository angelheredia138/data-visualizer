<template>
  <v-container fluid class="pt-4">
    <!-- Child Components for Most Played Genres and Artist Leaderboard -->
    <v-row>
      <v-col>
        <h3>Most Played Genres</h3>
        <MostPlayedGenres />
      </v-col>

      <v-col>
        <h3>Artist Leaderboard</h3>
        <ArtistLeaderboard />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
// No need to import ref, useNuxtApp, or axios here anymore
// Simply import the child components
import MostPlayedGenres from "~/pages/components/most-played-genres.vue";
import ArtistLeaderboard from "~/pages/components/artist-leaderboard.vue";
</script>

<style scoped>
pre {
  background-color: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto;
}
</style>
