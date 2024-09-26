<template>
  <div class="loading-overlay">
    <v-progress-circular
      :size="80"
      :width="8"
      indeterminate
      color="white"
      class="loading-spinner"
    ></v-progress-circular>
    <div class="loading-message">{{ message }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";

// Prop to accept a custom message
const props = defineProps({
  message: {
    type: String,
    default: "Loading...",
  },
});
</script>

<style scoped>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(270deg, #4299e1, #48bb78, #4299e1);
  background-size: 600% 600%;
  animation: gradientAnimation 10s ease infinite;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 9999; /* Ensure it is on top of all other elements */
}

.loading-spinner {
  margin-bottom: 20px;
}

.loading-message {
  font-size: 1.5em;
  font-weight: bold;
  color: white;
}

/* Animation for the background gradient */
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
