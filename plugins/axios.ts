import { defineNuxtPlugin } from "#app";
import axios from "axios";

export default defineNuxtPlugin(() => {
  const instance = axios.create({
    baseURL: process.env.API_BASE_URL || "http://localhost:3000/api", // Ensure this is correct
  });

  return {
    provide: {
      axios: instance,
    },
  };
});