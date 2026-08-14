/* @layer tests @kind helper */
/**
 * Skips a suite when the record tree is not on disk.
 *
 * The dataset lives in the private companion repo and is copied in by
 * `npm run vault:sync`. A checkout without access seeds an empty registry on
 * purpose — the app still builds and runs, it just has no screens, checks or
 * connections to show. Tests that assert on real record CONTENT cannot mean
 * anything there, so they skip rather than fail: a public clone has to stay
 * green, and a red suite that only says "you do not have the private repo"
 * teaches a contributor nothing.
 *
 * This is the vitest counterpart to the save-state fixture guard the Playwright
 * specs use (tests/e2e/state-harness.ts).
 *
 * The body is REPLACED rather than marked skipped, because `describe.skip` still
 * runs its callback — it collects the suite and then marks what it found as
 * skipped. Several of these files build their fixtures in the suite body itself
 * (`const field = fieldAt(all('screen'), ...)` outside any `it`), which throws on
 * an empty registry before any skipping can apply. Substituting a placeholder
 * suite keeps the callback from ever being invoked, and still registers one
 * skipped test so vitest does not report the file as empty.
 *
 * Use it for a suite that reads real records. A suite that only exercises
 * behaviour against records it builds itself should keep plain `describe` — it
 * works with or without the vault, and skipping it would lose real coverage.
 */
import { describe, it } from 'vitest';
import { all } from '@shared/game/data';

/** True when the record tree was synced in. Screens are seeded first and are never empty. */
const hasDataset = (): boolean => all('screen').length > 0;

const placeholder = (name: string): void => {
  describe.skip(name, () => {
    it('needs the private record dataset — run npm run vault:sync', () => undefined);
  });
};

const describeDataset = (hasDataset() ? describe : placeholder) as typeof describe;

export { describeDataset, hasDataset };
