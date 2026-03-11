import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'course-data': [
            './src/database/course-math.json',
            './src/database/course-science.json',
            './src/database/course-english.json',
            './src/database/course-social-studies.json',
          ],
        },
      },
    },
  },
})
