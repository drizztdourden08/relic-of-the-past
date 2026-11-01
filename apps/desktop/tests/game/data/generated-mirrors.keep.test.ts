/* @layer tests @kind test */
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';
import { hasDataset } from '../../dataset-guard';
import { REPO_ROOT } from '../../repo-root';

const ROOT = REPO_ROOT;
const SCRIPT = join('tooling', 'generate-from-records', 'generate-from-records.mjs');

const runCheck = (): { ok: boolean; output: string } => {
  try {
    return { ok: true, output: execFileSync(process.execPath, [SCRIPT, '--check'], { cwd: ROOT, encoding: 'utf8' }) };
  } catch (error) {
    const failure = error as { stdout?: string; stderr?: string; message: string };
    return { ok: false, output: `${failure.stdout ?? ''}${failure.stderr ?? ''}${failure.message}` };
  }
};

describe('the generated mirrors', () => {
  it.runIf(hasDataset())('equals a fresh generation', { tags: ['e2e'] }, () => {
    const { ok, output } = runCheck();
    expect(output, output).not.toMatch(/^STALE/m);
    expect(ok, output).toBe(true);
  });
});
