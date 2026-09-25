/* @layer root-config @kind config */
import { defineConfig } from 'vitest/config';
import { existsSync } from 'fs';
import { resolve } from 'path';

// Suites that build fixtures from real records at module scope throw on import,
// before `describeDataset` (tests/dataset-guard.ts) can skip them. Their strict
// assertions are worth keeping, so they are dropped from the run when the
// private record dataset is absent.
const DATASET_ONLY_SUITES = [
  'tests/design-system/field-kit-render.keep.test.ts',
  'tests/design-system/id-ref-display.keep.test.ts',
  'tests/design-system/id-ref-display-default.keep.test.ts',
  'tests/design-system/record-editor-state.keep.test.ts',
];

const hasDataset = existsSync(resolve(__dirname, 'shared/game/data/records'));

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    exclude: ['**/node_modules/**', '**/dist/**', ...(hasDataset ? [] : DATASET_ONLY_SUITES)],
    globals: true,
    // The default 5s is a measure of how loaded the machine is, not of whether a
    // test is correct. Two dataset suites render every screen in the record set
    // and finish in about two seconds alone; the moment a jsdom suite runs
    // alongside them they cross five and fail for no reason of their own. Raised
    // so the number is a real hang, not a busy CPU.
    testTimeout: 20000,
  },
  resolve: {
    alias: {
      '@shared': resolve(__dirname, 'shared'),
      '@app': resolve(__dirname, 'apps/web/src'),
      '@ds': resolve(__dirname, 'apps/web/src/ui/design-system'),
    },
  },
});
