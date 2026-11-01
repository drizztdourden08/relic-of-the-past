/* @layer root-config @kind config */
import { defineStandardsVitest } from '@drizztdourden08/standards/vitest';
import { resolve } from 'path';

export default defineStandardsVitest({
  test: {
    include: [
      'apps/desktop/tests/**/*.test.{ts,tsx}',
      'packages/*/tests/**/*.test.{ts,tsx}',
      'tooling/**/tests/**/*.test.{ts,tsx}',
    ],
    exclude: ['**/node_modules/**', '**/dist/**'],
    globals: true,
    passWithNoTests: true,
    // Brock and Tessera ship TypeScript source, so the first cold import of the shell in a hook transforms thousands of files.
    hookTimeout: 240000,
  },
  esbuild: { jsx: 'automatic' },
  resolve: {
    alias: [
      { find: '@app', replacement: resolve(__dirname, 'apps/desktop/src') },
      { find: /^@drizztdourden08\/brock-react$/, replacement: resolve(__dirname, 'apps/desktop/node_modules/@drizztdourden08/brock-react/src/index.ts') },
      { find: /^@drizztdourden08\/brock-core$/, replacement: resolve(__dirname, 'apps/desktop/node_modules/@drizztdourden08/brock-core/src/index.ts') },
    ],
  },
});
