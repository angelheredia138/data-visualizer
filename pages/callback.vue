<template>
    <v-container fluid class="animated-background" style="min-height: 100vh; width: 100vw;">
      <v-card elevation="8" class="d-flex flex-column justify-center align-center" style="padding: 32px;">
        <v-row>
          <v-col class="text-center">
            <!-- 'Redirecting...' message -->
            <v-card-title class="text-h5" style="font-size: 2em; font-weight: bold;">
                Redirecting...
            </v-card-title>
            <!-- Spinning Loader -->
            <v-progress-circular :size="50" :width="5" indeterminate color="green" class="mt-4"></v-progress-circular>
          </v-col>
        </v-row>
      </v-card>
    </v-container>
  </template>
  
<script setup>
  import { useRouter } from 'vue-router'
  import { onMounted } from 'vue'
  
  const router = useRouter()
  
  onMounted(() => {
    // Extract the token from the hash in the URL
    const hashParams = new URLSearchParams(window.location.hash.substring(1)); 
    const accessToken = hashParams.get('access_token');
    
    if (accessToken) {
      // Store the access token in localStorage
      localStorage.setItem('spotify_access_token', accessToken);
      
      // Redirect to /main page
      router.push('/main');
    } else {
      // In case of any issues, redirect back to the login page
      router.push('/');
    }
  });
</script>
  

  <style scoped>
  .animated-background {
    background-color: #e0f7fa; /* Same background as your login page */
    padding: 20px;
  }
  </style>
  