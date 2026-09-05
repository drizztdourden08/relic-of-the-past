/* @layer tests @kind helper */
/**
 * Skips a suite when the record tree is not on disk.
 *
 * The dataset lives in the private companion repo (`npm run vault:sync`). A
 * checkout without access seeds an empty registry on purpose, so tests that
 * assert on real record CONTENT skip instead of fail: a public clone has to
 * stay green. Vitest counterpart of the Playwright fixture guard in
 * tests/e2e/state-harness.ts.
 *
 * The body is REPLACED, not marked skipped: `describe.skip` still runs its
 * callback, and several suites build fixtures in the body itself
 * (`fieldAt(all('screen'), ...)` outside any `it`), which throws on an empty
 * registry. The placeholder still registers one skipped test so vitest does
 * not report the file as empty.
 *
 * Only for suites that read real records. A suite over records it builds
 * itself should keep plain `describe`.
 */
import { describe, it } from 'vitest';
import { all } from '@shared/game/data';

/** True when the record tree was synced in. Screens are seeded first and are never empty. */
const hasDataset = (): boolean => all('screen').length > 0;

const placeholder = (name: string): void => {
  describe.skip(name, () => {
    it('needs the private record dataset, so run npm run vault:sync', () => undefined);
  });
};

const describeDataset = (hasDataset() ? describe : placeholder) as typeof describe;

export { describeDataset, hasDataset };
