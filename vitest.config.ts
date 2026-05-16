import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@domain': '/src/domain',
      '@application': '/src/application',
      '@infrastructure': '/src/infrastructure',
      '@tests': '/src/tests',
      '@shared': '/src/shared'
    }
  }
});
