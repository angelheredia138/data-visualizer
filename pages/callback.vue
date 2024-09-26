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
