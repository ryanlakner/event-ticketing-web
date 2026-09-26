import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// The API listens on http://localhost:5084 when run with `dotnet run --project Ticketing.Api`.
// Proxying keeps the browser on a single origin in development, so no CORS setup is needed.
const apiTarget = process.env.API_PROXY_TARGET ?? 'http://localhost:5084';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': apiTarget,
      '/health': apiTarget,
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    restoreMocks: true,
  },
});
