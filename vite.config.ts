import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Fixed dev port so it always matches the backend's CORS allowlist
  // (backend/.env CLIENT_URL) instead of silently shifting to 5174+ when
  // a stray dev server is already holding 5173.
  server: {
    port: 5173,
    strictPort: true,
  },
})
