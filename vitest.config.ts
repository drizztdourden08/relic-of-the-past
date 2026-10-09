/* @layer root-config @kind config */
import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    globals: true,
    // The default 5s is a measure of how loaded the machine is, not of whether a
    // test is correct. Two dataset suites render every screen in the record set
    // and finish in about two seconds alone; the moment a jsdom suite runs
    // alongside them they cross five and fail for no reason of their own. Both
    // limits are raised so the number is a real hang, not a busy CPU: a hook that
    // resets modules and imports a view graph cold crosses ten the same way.
    testTimeout: 20000,
    hookTimeout: 60000,
  },
  esbuild: { jsx: 'automatic' },
  resolve: {
    alias: {
      '@shared': resolve(__dirname, 'shared'),
      '@app': resolve(__dirname, 'apps/web/src'),
      '@domains': resolve(__dirname, 'apps/web/src/ui/domains'),
    },
  },
});
