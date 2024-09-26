<template>
  <div class="animated-background">
    <NuxtPage />
  </div>
</template>

<script setup>
// You can define head information globally here
useHead({
  link: [
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap",
    },
  ],
});
</script>
<style scoped>
.animated-background {
  background-color: #2f855a; /* Matching the green theme */
  display: flex;
  overflow: auto;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}
</style>
