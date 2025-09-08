import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Auto-sets the correct base path for GitHub Pages (/<repo>/) if available.
export default defineConfig({
  plugins: [react()],
  base: process.env.GITHUB_REPOSITORY ? `/${process.env.GITHUB_REPOSITORY.split('/').pop()}/` : '/',
})
