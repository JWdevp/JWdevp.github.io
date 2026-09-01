import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * `base` is resolved at build time from the BASE_PATH environment variable so that
 * no repository URL is hardcoded. The GitHub Actions workflow computes it:
 *   - user/organisation page  (<owner>.github.io)  ->  "/"
 *   - project page            (<owner>/<repo>)     ->  "/<repo>/"
 * Locally BASE_PATH is unset and the app is served from "/".
 */
export default defineConfig({
  base: process.env.BASE_PATH || '/',
  plugins: [react()],
  build: {
    target: 'es2022',
    rollupOptions: {
      output: {
        manualChunks: {
          gsap: ['gsap', '@gsap/react'],
        },
      },
    },
  },
})
