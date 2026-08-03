/* @layer tests @kind test */
/**
 * `generateEnumTypes`'s explicit `root` parameter — the fix for a real
 * production crash. Its default guess (a path relative to THIS script's own
 * file) is only correct for the CLI running from its real, unbundled location;
 * `enumeration-writer.ts` runs from a bundled `dist/electron/main.js`, where
 * `import.meta.url` resolves to the bundle's own location instead — a
 * different directory depth in dev, an electron-vite production build and a
 * packaged app. The guess landed on a nonexistent `dist/shared/...` path and
 * crashed every production launch (`ERR_MODULE_NOT_FOUND`). This proves an
 * explicit root is honoured instead of the guess, using a temp workspace whose
 * location cannot possibly match the script's own by accident.
 */
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it, expect, afterEach } from 'vitest';
import { generateEnumTypes } from '../../../scripts/generate-enum-types.mjs';

// buildGeneratedTypesSource requires at least one row per category it knows
// about, so the fixture seeds a minimal one-row stand-in for every category —
// `world` carries the two values this test actually reads back, since it's
// the one that would give away a fallback to the real committed file.
const FIXTURE_ENUMERATION = `
export const ALL_ENUMERATION = [
  { id: 'enum-000', category: 'world', value: 'light', label: 'Light World', appliesTo: ['screen'] },
  { id: 'enum-001', category: 'world', value: 'dark', label: 'Dark World', appliesTo: ['screen'] },
  { id: 'enum-002', category: 'screen-status', value: 'draft', label: 'Draft', appliesTo: ['screen'] },
  { id: 'enum-003', category: 'screen-kind', value: 'overworld', label: 'Overworld', appliesTo: ['screen'] },
  { id: 'enum-004', category: 'interior-kind', value: 'cave', label: 'Cave', appliesTo: ['screen'] },
  { id: 'enum-005', category: 'connection-kind', value: 'edge', label: 'Edge', appliesTo: ['connection'] },
  { id: 'enum-006', category: 'connection-side', value: 'north', label: 'North', appliesTo: ['connection'] },
  { id: 'enum-007', category: 'actor-kind', value: 'enemy', label: 'Enemy', appliesTo: ['actor'] },
  { id: 'enum-008', category: 'check-kind', value: 'chest', label: 'Chest', appliesTo: ['check'] },
  { id: 'enum-009', category: 'item-category', value: 'weapon', label: 'Weapon', appliesTo: ['item'] },
  { id: 'enum-010', category: 'item-origin', value: 'vanilla', label: 'Vanilla', appliesTo: ['item'] },
  { id: 'enum-011', category: 'review-status', value: 'untouched', label: 'Untouched', appliesTo: ['screen'] },
];
`;

let tempRoot: string | null = null;

afterEach(() => {
  if (tempRoot) rmSync(tempRoot, { recursive: true, force: true });
  tempRoot = null;
});

describe('generateEnumTypes(root) — an explicit root wins over the file-relative guess', () => {
  it('reads and writes under the GIVEN root, not the script\'s own directory', async () => {
    tempRoot = mkdtempSync(join(tmpdir(), 'enum-root-'));
    const enumDir = join(tempRoot, 'shared', 'game', 'data', 'enumeration');
    mkdirSync(enumDir, { recursive: true });
    writeFileSync(join(enumDir, 'enumeration.ts'), FIXTURE_ENUMERATION);

    // Every OTHER category this repo's real ALL_ENUMERATION carries is absent
    // from this fixture on purpose — proving the read really came from the
    // temp root, not a fallback to the real committed file.
    const outputPath = await generateEnumTypes(tempRoot);

    expect(outputPath).toBe(join(enumDir, 'generated-types.ts'));
    const generated = readFileSync(outputPath, 'utf-8');
    expect(generated).toContain("type World = 'light' | 'dark';");
  });

  it('fails cleanly rather than silently reading some other root\'s data when the given root has none', async () => {
    tempRoot = mkdtempSync(join(tmpdir(), 'enum-root-empty-'));
    await expect(generateEnumTypes(tempRoot)).rejects.toThrow();
  });
});
