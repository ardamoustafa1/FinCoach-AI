import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5173,
    strictPort: true,
  },
  preview: {
    port: 5173,
    strictPort: true,
  },
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'vendor-react', test: /node_modules[\\/](react|react-dom|react-router-dom|zustand)[\\/]/, priority: 20 },
            { name: 'vendor-charts', test: /node_modules[\\/](recharts|d3-[^\\/]+)[\\/]/, priority: 15 },
            { name: 'vendor-jspdf', test: /node_modules[\\/]jspdf[\\/]/, priority: 15 },
            { name: 'vendor-html2canvas', test: /node_modules[\\/]html2canvas[\\/]/, priority: 15 },
            { name: 'vendor-tfjs', test: /node_modules[\\/]@tensorflow[\\/]/, priority: 15 },
          ],
        },
      },
    },
    chunkSizeWarningLimit: 700,
  },
  esbuild: {
    drop: ['console', 'debugger'],
  },
})
