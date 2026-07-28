/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // honour PORT so a second dev server can be told which port to take
  server: process.env.PORT ? { port: Number(process.env.PORT) } : undefined,
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
})
