import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    // Use jsdom to simulate the browser DOM
    environment: 'jsdom',
    // Make describe/it/expect globals (no explicit import needed)
    globals: true,
    // Run jest-dom matchers and any other global setup before every test file
    setupFiles: ['./src/__tests__/setup.ts'],
    // Only look for test files inside our designated folder
    include: ['src/__tests__/**/*.test.{ts,tsx}'],
  },
  resolve: {
    // Mirror the '@/' path alias from vite.config.ts
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
