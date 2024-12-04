<template>
  <v-container
    fluid
    class="animated-background"
    style="min-height: 100vh; display: flex"
  >
    <div class="content-wrapper">
      <!-- Welcome Message & Subtitle -->
      <v-row>
        <v-col>
          <h1 class="title">Welcome to Spotify Visualizer</h1>
          <p class="subtitle">
            This website offers an interactive and visually engaging way to
            explore your Spotify listening habits. Dive into detailed analyses
            and visualizations of your top genres, artists, tracks, and more.
          </p>
        </v-col>
      </v-row>

      <!-- Centered Visualization Buttons with dynamic columns -->
      <v-row
        class="mb-4 button-grid"
        :class="isMobile ? 'mobile-grid' : 'desktop-grid'"
      >
        <v-col v-for="(vis, index) in visualizations" :key="index" cols="12">
          <v-btn
            :class="['grid-item', { 'mobile-background': isMobile }]"
            color="primary"
            outlined
            @click="handleNavigate(vis.path)"
          >
            <div class="button-text">{{ vis.title }}</div>
          </v-btn>
        </v-col>
      </v-row>

      <!-- Logout Button -->
      <v-row class="mt-4">
        <v-btn color="primary" class="logout-btn" @click="handleLogout">
          Logout
        </v-btn>
      </v-row>
    </div>
  </v-container>
</template>

<script setup>
import { useRouter } from "vue-router";
import { ref, reactive, onMounted, onBeforeUnmount, computed } from "vue";

const router = useRouter();

const visualizations = ref([
  {
    title: "Top Genres\nand Artists",
    path: "/top-genres-artists",
  },
  {
    title: "Christmas Tree",
    path: "/christmas",
  },
  {
    title: "Listening History",
    path: "/listening-history",
  },
  {
    title: "Genres",
    path: "/genres",
  },
  {
    title: "Playlists",
    path: "/playlists",
  },
  {
    title: "Wrapped",
    path: "/wrapped",
  },
]);

// State to track the button layout based on screen size
const screenSize = reactive({
  isSmall: false,
});

// Computed property to determine if the user is on a mobile screen
const isMobile = computed(() => screenSize.isSmall);

// Watch for screen size changes
const updateScreenSize = () => {
  if (typeof window !== "undefined") {
    screenSize.isSmall = window.innerWidth < 768;
  }
};

// Handle navigation to a specific visualization
const handleNavigate = (path) => {
  router.push(path);
};

// Handle logout and redirect to login
const handleLogout = () => {
  localStorage.removeItem("spotify_access_token");
  localStorage.removeItem("spotify_refresh_token");
  router.push("/");
};

// Add event listener on mount
onMounted(() => {
  if (typeof window !== "undefined") {
    window.addEventListener("resize", updateScreenSize);
    updateScreenSize(); // Initialize with current size
  }
});

// Remove event listener on before unmount
onBeforeUnmount(() => {
  if (typeof window !== "undefined") {
    window.removeEventListener("resize", updateScreenSize);
  }
});

useHead({
  title: "Data Visualizer",
});
</script>

<style scoped>
/* Prevent scrolling on all devices */
body,
html {
  overflow: hidden;
  height: 100%;
  margin: 0;
}

/* Center content on mobile and desktop */
.animated-background {
  overflow: hidden; /* Prevent scrolling on the background */
  position: fixed; /* Fix the container position */
}

/* Wrapper for the content */
.content-wrapper {
  width: 100%;
  max-width: 1200px;
  text-align: center;
  padding: 20px;
  display: flex; /* Use flex layout */
  flex-direction: column; /* Stack children vertically */
  justify-content: center; /* Center vertically */
  align-items: center; /* Center horizontally */
}

/* Style for grid buttons */
.grid-item {
  /* Existing styles */
  border: 15px solid transparent;
  border-image: url("@/assets/christmas-lights-border3.png") 900 repeat;
  border-radius: 16px;
  background-color: white !important;
  color: black !important;
  font-size: 1.3em;
  font-weight: bold;
  height: 80px;
  font-family: Inter;
  width: 100%;
  max-width: 300px;
  text-transform: none;
  cursor: pointer;
  transition: transform 0.2s ease-in-out;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  /* Updated box-shadow for white/yellow glow */
  box-shadow: 0 0 15px rgba(255, 255, 200, 0.6),
    /* Soft yellow */ 0 0 30px rgba(255, 255, 240, 0.6),
    /* Ivory */ 0 0 45px rgba(255, 255, 255, 0.6); /* White */
}

/* Special background adjustment for mobile */
.mobile-background {
  border-image: url("/assets/christmas-lights-border3.png") 1250 repeat; /* Smaller scale */
}

.grid-item:hover {
  transform: scale(1.05);
  background-color: #f0f0f0 !important;
  color: black !important;
  /* Intensify the glow on hover */
  box-shadow: 0 0 20px rgba(255, 255, 200, 0.8),
    0 0 40px rgba(255, 255, 240, 0.8), 0 0 60px rgba(255, 255, 255, 0.8);
}

.button-text {
  white-space: pre-line;
  text-align: center;
}

/* Style for logout button */
.logout-btn {
  background-color: red !important;
  color: white;
  width: 150px;
  text-transform: none;
}

.logout-btn:hover {
  background-color: darkred !important;
  transform: scale(1.05);
  color: white;
}

/* Style for title and subtitle */
.title {
  font-size: 2.5em;
  font-weight: bold;
  color: white;
}

.subtitle {
  font-size: 1.2em;
  color: white;
  margin-top: 10px;
  padding: 0 20px; /* Add padding to avoid text touching edges */
}

/* Desktop Grid Layout */
.desktop-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 3 columns, 2 rows */
  grid-template-rows: auto;
  gap: 20px;
}

/* Mobile Grid Layout */
.mobile-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* 2 columns */
}

/* Responsive adjustments for mobile */
@media (max-width: 768px) {
  .animated-background {
    overflow-x: hidden;
    overflow-y: hidden; /* Prevent any scrolling */
  }

  /* Smaller font sizes for mobile */
  .title {
    font-size: 1.8em !important;
    margin: 5px 0;
  }

  .subtitle {
    font-size: 0.9em !important;
    margin: 5px 0;
    padding: 0 20px; /* Keep padding on mobile */
  }

  /* Adjust button sizes for mobile */
  .grid-item {
    font-size: 0.6em; /* Smaller font size */
    height: 50px; /* Reduced height */
    width: 80%; /* Reduced width */
    max-width: 150px; /* Restrict max-width */
    line-height: 1.2;
  }

  .logout-btn {
    width: 120px; /* Smaller width */
    font-size: 0.9em; /* Adjust font size */
  }

  /* Adjust content wrapper to fit mobile screen */
  .content-wrapper {
    padding: 10px; /* Reduce padding for more space */
    height: auto; /* Let the height adjust automatically */
  }
}
</style>
