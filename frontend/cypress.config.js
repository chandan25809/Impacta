// cypress.config.js
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173', // Adjust to your running app's URL
    setupNodeEvents(on, config) {
      // implement node event listeners here if needed
      return config;
    },
  },
});
