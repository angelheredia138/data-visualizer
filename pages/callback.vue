<template>
  <v-container fluid class="animated-background">
    <v-card elevation="8" class="redirect-card">
      <!-- 'Redirecting...' Message -->
      <v-card-title class="redirect-title"> Redirecting... </v-card-title>

      <!-- Spinning Loader -->
      <v-progress-circular
        :size="60"
        :width="6"
        indeterminate
        color="white"
        class="redirect-spinner"
        aria-label="Loading spinner"
      ></v-progress-circular>
    </v-card>
  </v-container>
</template>

<script setup>
import { useRouter } from "vue-router";
import { onMounted, nextTick } from "vue";

const router = useRouter();

onMounted(async () => {
  // Wait for the next DOM update cycle to ensure the spinner is rendered
  await nextTick();

  // Extract the token from the hash in the URL
  const hashParams = new URLSearchParams(window.location.hash.substring(1));
  const accessToken = hashParams.get("access_token");

  if (accessToken) {
    // Store the access token in localStorage
    localStorage.setItem("spotify_access_token", accessToken);

    // Redirect to /main page after a short delay to show the spinner
    setTimeout(() => {
      router.push("/main");
    }, 1500); // 1.5 seconds delay
  } else {
    // In case of any issues, redirect back to the login page after a short delay
    setTimeout(() => {
      router.push("/");
    }, 1500); // 1.5 seconds delay
  }
});
</script>

<style scoped>
.animated-background {
  background-color: #2f855a; /* Matching the green theme */
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

.redirect-card {
  padding: 40px;
  background-color: rgba(47, 133, 90, 0.9); /* Slightly transparent green */
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.redirect-title {
  font-size: 2em;
  font-weight: bold;
  color: white;
  margin-bottom: 20px;
}
</style>
