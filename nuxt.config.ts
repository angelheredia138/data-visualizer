import * as dotenv from "dotenv";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";
dotenv.config(); // Ensure dotenv loads the environment variables

export default defineNuxtConfig({
  // Include your global CSS file here
  css: ["~/assets/css/global.css"],

  devServer: {
    host: "0.0.0.0",
    port: 3000,
  },

  build: {
    transpile: ["vuetify"],
  },
  vite: {
    plugins: [cssInjectedByJsPlugin()],
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@import "@/assets/styles/variables.scss";', // if needed for SCSS variables
        },
      },
    },
    ssr: {
      noExternal: ["vuetify"], // Ensure Vuetify styles are not processed externally
    },
  },
  nitro: {
    preset: "vercel",
  },
  plugins: [
    "~/plugins/vuetify.ts",
    "~/plugins/axios",
    "~/plugins/vue-scrollto.ts",
  ],

  runtimeConfig: {
    // Server-side environment variables (not exposed to the client)
    spotifyClientSecret: process.env.SPOTIFY_CLIENT_SECRET,

    public: {
      // Client-side environment variables (exposed to the browser)
      spotifyClientId: process.env.NUXT_PUBLIC_SPOTIFY_CLIENT_ID,
      spotifyRedirectUri: process.env.NUXT_PUBLIC_SPOTIFY_REDIRECT_URI,
    },
  },

  compatibilityDate: "2024-12-02",
  app: {
    baseURL: "/", // baseURL: '/<repository>/'
    buildAssetsDir: "/_nuxt/", // don't use "_" at the begining of the folder name to avoids nojkill conflict
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
