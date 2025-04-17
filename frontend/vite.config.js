import { defineConfig } from "vite";
import tailwindcss from '@tailwindcss/vite'
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ""),
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            proxyReq.setHeader('Accept', 'application/json');
          });
        },
      }
    }
  },
  test: {
    globals: true,            
    environment: 'jsdom',
         
    setupFiles: [
      './src/polyfills/matchMedia.js',  // 1) This must come FIRST
      './src/setupTests.js',            // 2) Then your other setup
    ],
  },
});
