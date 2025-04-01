import { defineConfig } from "vite";
import tailwindcss from '@tailwindcss/vite'
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api": {
        target: "/api/6ec9-2600-8807-c185-f00-50b8-6bc4-7045-280a.ngrok-free.app",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ""),
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // Set Accept header to JSON
            proxyReq.setHeader('Accept', 'application/json');
          });
        },
      }
    }
  },
  test: {
    globals: true,            
    environment: 'jsdom',     
    setupFiles: './src/setupTests.js',  
  },
});
