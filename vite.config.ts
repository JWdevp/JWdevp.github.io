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
    // three.js alone is ~700 kB minified; it is deliberately split into its own
    // lazily-loaded chunk, so the default 500 kB warning is not useful here.
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          r3f: ['@react-three/fiber', '@react-three/drei'],
          gsap: ['gsap', '@gsap/react'],
        },
      },
    },
  },
})
