/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // honour PORT so a second dev server can be told which port to take
  server: process.env.PORT ? { port: Number(process.env.PORT) } : undefined,
  build: {
    // ~1000 generated space facts are ~120kB of the bundle, 12kB gzipped. Fine
    // over home wifi and worth it for a pool that lasts years. If the fact set
    // grows much past this, split it out with a dynamic import instead of
    // raising this number again.
    chunkSizeWarningLimit: 600,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
})
