import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@domain':         resolve(__dirname, 'libs/crafty/src/domain'),
      '@application':    resolve(__dirname, 'libs/crafty/src/application'),
      '@infrastructure': resolve(__dirname, 'libs/crafty/src/infrastructure'),
      '@shared':         resolve(__dirname, 'libs/crafty/src/shared'),
      '@tests':          resolve(__dirname, 'libs/crafty/src/tests'),
      '@builders':       resolve(__dirname, 'libs/crafty/src/tests/builders'),
      '@generated':      resolve(__dirname, 'generated'),
    }
  },
  test: {
    exclude: ['**/*.integration.spec.ts', 'node_modules/**'],
  },
});
