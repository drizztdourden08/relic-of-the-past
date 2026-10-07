/* @layer tests @kind helper */
/**
 * Marks a suite as one that reads real record CONTENT, and skips it if the tree is empty.
 *
 * The records are tracked in this repository, so the registry is never empty and this never
 * skips. It stays as the marker that says which suites depend on the data itself, and as the
 * one place a decision about an empty registry would be made.
 *
 * The body is REPLACED, not marked skipped: `describe.skip` still runs its
 * callback, and several suites build fixtures in the body itself
 * (`fieldAt(all('screen'), ...)` outside any `it`), which throws on an empty
 * registry. The placeholder still registers one skipped test so vitest does
 * not report the file as empty.
 *
 * A suite over records it builds itself should keep plain `describe`.
 */
import { describe, it } from 'vitest';
import { all } from '@shared/game/data';

/** True when the registry holds records. Screens are seeded first and are never empty. */
const hasDataset = (): boolean => all('screen').length > 0;

const placeholder = (name: string): void => {
  describe.skip(name, () => {
    it('needs the record dataset, which seeded empty', () => undefined);
  });
};

const describeDataset = (hasDataset() ? describe : placeholder) as typeof describe;

export { describeDataset, hasDataset };
