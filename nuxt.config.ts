export default defineNuxtConfig({
  css: ['~/assets/css/global.css'],  // Include your global CSS file here

  build: {
    transpile: ['vuetify'],
  },

  plugins: ['~/plugins/vuetify.ts'],
  compatibilityDate: '2024-09-14',
})