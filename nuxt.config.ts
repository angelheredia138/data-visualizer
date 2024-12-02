import * as dotenv from "dotenv";
dotenv.config(); // Ensure dotenv loads the environment variables

export default defineNuxtConfig({
  css: ["~/assets/css/global.css"], // Include your global CSS file here
  devServer: {
    host: "0.0.0.0",
    port: 3000,
  },
  build: {
    transpile: ["vuetify"],
  },

  plugins: ["~/plugins/vuetify.ts", "~/plugins/axios"],
  compatibilityDate: "2024-09-14",

  runtimeConfig: {
    // Server-side environment variables (not exposed to the client)
    spotifyClientSecret: process.env.SPOTIFY_CLIENT_SECRET,

    public: {
      // Client-side environment variables (exposed to the browser)
      spotifyClientId: process.env.NUXT_PUBLIC_SPOTIFY_CLIENT_ID,
      spotifyRedirectUri: process.env.NUXT_PUBLIC_SPOTIFY_REDIRECT_URI,
    },
  },

  hooks: {
    ready: () => {
      console.log("Loaded Environment Variables:", {
        SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET,
        NUXT_PUBLIC_SPOTIFY_CLIENT_ID:
          process.env.NUXT_PUBLIC_SPOTIFY_CLIENT_ID,
        NUXT_PUBLIC_SPOTIFY_REDIRECT_URI:
          process.env.NUXT_PUBLIC_SPOTIFY_REDIRECT_URI,
      });
    },
  },
});
