<template>
  <LoaderComponent message="Redirecting..." />
</template>

<script setup>
import { useRouter } from "vue-router";
import { onMounted, nextTick } from "vue";
import LoaderComponent from "~/pages/components/loader.vue";

const router = useRouter();

onMounted(async () => {
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

/* Loader Component styles */
.loader-component {
  display: flex;
  justify-content: center;
  align-items: center;
  color: #2f855a; /* Match color with theme */
  font-size: 1.5em;
}

/* Responsive adjustments for mobile */
@media (max-width: 768px) {
  .loader-component {
    font-size: 1.2em; /* Slightly smaller font size on mobile */
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
