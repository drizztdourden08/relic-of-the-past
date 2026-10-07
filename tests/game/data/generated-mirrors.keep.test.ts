/* @layer tests @kind test */
/**
 * Every generated file still equals a fresh generation, byte for byte.
 *
 * `scripts/generate-from-records.mjs --check` rebuilds each target in memory and compares
 * it to the file on disk, so a hand edit to a generated file fails here and names it. The
 * generator is the only thing that writes those files, which is what makes the record the
 * one source: a table restated in TypeScript or in our C cannot drift from it unnoticed.
 *
 * The check runs as a child process on purpose. It loads the dataset through vite's SSR
 * runner, the same path the CLI takes, so this test cannot pass on a code path the CLI
 * does not use.
 */
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';
import { hasDataset } from '../../dataset-guard';

const ROOT = join(__dirname, '..', '..', '..');
const SCRIPT = join('scripts', 'generate-from-records.mjs');

/** The generated files, as the plan's `[G]` list names them. */
const GENERATED = [
  'shared/game/data/records/checks/events/event-bits.ts',
  'shared/game/data/taxonomy/screen-tags.ts',
  'shared/game/data/taxonomy/connection-tags.ts',
  'shared/game/data/taxonomy/check-content-tags.ts',
  'core/game-hooks/story_events.c',
  'core/game-hooks/prize_presentation.c',
];

const runCheck = (): { ok: boolean; output: string } => {
  try {
    return { ok: true, output: execFileSync(process.execPath, [SCRIPT, '--check'], { cwd: ROOT, encoding: 'utf8' }) };
  } catch (error) {
    const failure = error as { stdout?: string; stderr?: string; message: string };
    return { ok: false, output: `${failure.stdout ?? ''}${failure.stderr ?? ''}${failure.message}` };
  }
};

describe('the generated mirrors', () => {
  it('lists a file that exists for every target', () => {
    expect(GENERATED.filter((rel) => !existsSync(join(ROOT, rel)))).toEqual([]);
  });

  // The dataset guard applies: three of the targets are built from records, so a checkout
  // without the record tree would generate empty tables and report every one of them stale.
  it.runIf(hasDataset())('equals a fresh generation', () => {
    const { ok, output } = runCheck();
    expect(output, output).not.toMatch(/^STALE/m);
    expect(ok, output).toBe(true);
  }, 120_000);
});
