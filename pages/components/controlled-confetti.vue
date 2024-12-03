<template>
  <canvas ref="confettiCanvas" class="confetti-canvas"></canvas>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from "vue";
import confetti from "canvas-confetti";

// Define props
const props = defineProps({
  run: {
    type: Boolean,
    required: true,
  },
});

// Refs
const confettiCanvas = ref(null);
let confettiInstance = null;

// Config object
const config = {
  angle: 90,
  spread: 45,
  startVelocity: 45,
  particleCount: 15,
  gravity: 1 - 0.1, // Adjusted from dragFriction
  ticks: Math.floor(3000 / (1000 / 60)), // Convert duration to ticks
  colors: ["#FFC700", "#FF0000", "#00FF00", "#0000FF", "#FF00FF"],
  shapes: ["square", "circle"],
  scalar: 1,
  // Additional properties can be added as needed
};

// Create confetti instance on mount
onMounted(() => {
  confettiInstance = confetti.create(confettiCanvas.value, {
    resize: true,
    useWorker: true,
  });
});

// Clean up on unmount
onBeforeUnmount(() => {
  if (confettiInstance) {
    confettiInstance.reset();
  }
});

// Watch for changes in 'run' prop
watch(
  () => props.run,
  (newVal) => {
    if (newVal && confettiInstance) {
      confettiInstance({
        ...config,
        origin: { x: 0.5, y: 0.5 }, // Center of the canvas
      });
    }
  }
);
</script>

<style scoped>
.confetti-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none; /* Allows clicks to pass through */
}
</style>
