/* @layer root-config @kind config */
import { defineConfig } from 'vitest/config';
import { existsSync } from 'fs';
import { resolve } from 'path';

// The record dataset is synced in from the private companion repo. Almost every
// suite that reads it guards itself with `describeDataset`
// (tests/dataset-guard.ts) and skips cleanly when it is absent.
//
// These four cannot: they build their fixtures from real records at MODULE
// scope, so the file throws while it is being imported, before any suite has a
// chance to skip. Keeping their assertions strict is worth more than making them
// self-guarding — each one is checking that the dataset still holds a record of
// the shape the test needs, and softening that to a fallback would let a real
// regression pass silently. So they are dropped from the run instead, and only
// when there is genuinely nothing for them to read.
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
