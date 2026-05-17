import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'vendor-react', test: /node_modules[\\/](react|react-dom|react-router-dom|zustand)[\\/]/, priority: 20 },
            { name: 'vendor-charts', test: /node_modules[\\/](recharts|d3-[^\\/]+)[\\/]/, priority: 15 },
            { name: 'vendor-jspdf', test: /node_modules[\\/]jspdf[\\/]/, priority: 15 },
            { name: 'vendor-html2canvas', test: /node_modules[\\/]html2canvas[\\/]/, priority: 15 },
            { name: 'vendor-tfjs-core', test: /node_modules[\\/]@tensorflow[\\/]tfjs-core[\\/]/, priority: 15 },
            { name: 'vendor-tfjs-backends', test: /node_modules[\\/]@tensorflow[\\/](tfjs-backend-cpu|tfjs-backend-webgl)[\\/]/, priority: 15 },
            { name: 'vendor-tfjs-layers', test: /node_modules[\\/]@tensorflow[\\/](tfjs-layers|tfjs-converter)[\\/]/, priority: 15 },
            { name: 'vendor-tfjs-data', test: /node_modules[\\/]@tensorflow[\\/](tfjs|tfjs-data)[\\/]/, priority: 15 },
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
