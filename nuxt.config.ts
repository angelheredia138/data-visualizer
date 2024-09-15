export default defineNuxtConfig({
  css: ['~/assets/css/global.css'],  // Include your global CSS file here

  build: {
    transpile: ['vuetify'],
  },

  plugins: ['~/plugins/vuetify.ts'],
  compatibilityDate: '2024-09-14',
  
  runtimeConfig: {
    // Server-side environment variables (not exposed to the client)
    spotifyClientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    
    public: {
      // Client-side environment variables (exposed to the browser)
      spotifyClientId: process.env.NUXT_PUBLIC_SPOTIFY_CLIENT_ID,
      spotifyRedirectUri: process.env.NUXT_PUBLIC_SPOTIFY_REDIRECT_URI
    }
  }
})