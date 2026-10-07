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
  },
  resolve: {
    alias: {
      '@shared': resolve(__dirname, 'shared'),
      '@app': resolve(__dirname, 'apps/web/src'),
      '@ds': resolve(__dirname, 'apps/web/src/ui/design-system'),
    },
  },
});
