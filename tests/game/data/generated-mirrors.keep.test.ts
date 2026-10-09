/* @layer tests @kind test */
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';
import { hasDataset } from '../../dataset-guard';

const ROOT = join(__dirname, '..', '..', '..');
const SCRIPT = join('scripts', 'generate-from-records.mjs');

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

  it.runIf(hasDataset())('equals a fresh generation', () => {
    const { ok, output } = runCheck();
    expect(output, output).not.toMatch(/^STALE/m);
    expect(ok, output).toBe(true);
  }, 120_000);
});
