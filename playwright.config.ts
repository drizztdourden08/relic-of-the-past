/* @layer root-config @kind config */
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testMatch: '**/*.spec.ts',
  timeout: 120_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  outputDir: 'apps/desktop/tests/test-results',
  projects: [
    { name: 'app', testDir: './apps/desktop/tests' },
    { name: 'scratch', testDir: './tests/scratch' },
  ],
});
