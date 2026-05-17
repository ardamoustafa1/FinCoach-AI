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
            { name: 'vendor-pdf', test: /node_modules[\\/](jspdf|html2canvas)[\\/]/, priority: 15 },
            { name: 'vendor-tfjs', test: /node_modules[\\/]@tensorflow[\\/]tfjs/, priority: 15 },
          ],
        },
      },
    },
  },
  esbuild: {
    drop: ['console', 'debugger'],
  },
})
