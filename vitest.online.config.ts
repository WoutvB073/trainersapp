import { defineConfig } from 'vitest/config';

// Tests tegen de Firebase-emulator (auth + firestore): npm run test:online (start en stopt de emulator zelf).
export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/online/**/*.test.ts'],
    testTimeout: 30000,
    hookTimeout: 30000,
    // Eén voor één: alle tests delen dezelfde emulator.
    fileParallelism: false,
  },
});
