import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  root: 'app',
  base: '/brutti-ai-marketing-hub/',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
})
