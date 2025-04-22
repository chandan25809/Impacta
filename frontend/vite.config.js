import { defineConfig } from "vite";
import tailwindcss from '@tailwindcss/vite'
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api": {
        target: "https://860d-2600-8807-c185-f00-5af-ac49-f9c0-6213.ngrok-free.app",
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
