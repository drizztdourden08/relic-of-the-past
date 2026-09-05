/* @layer tests @kind test */
/**
 * `generateEnumTypes`'s explicit `root` parameter, the fix for a production
 * crash. Its default guess is relative to THIS script's file, which is wrong
 * from the bundled `dist/electron/main.js` (`import.meta.url` resolves to the
 * bundle), so every production launch hit `ERR_MODULE_NOT_FOUND`. This proves
 * an explicit root wins, in a temp workspace that cannot match the guess.
 */
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it, expect, afterEach } from 'vitest';
import { generateEnumTypes } from '../../../scripts/generate-enum-types.mjs';

// buildGeneratedTypesSource needs one row per category, so the fixture seeds
// a stand-in for each; `world` carries the two values read back, since it
// would give away a fallback to the real committed file.
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

describe('generateEnumTypes(root) lets an explicit root win over the file-relative guess', () => {
  it('reads and writes under the GIVEN root, not the script\'s own directory', async () => {
    tempRoot = mkdtempSync(join(tmpdir(), 'enum-root-'));
    // The seed is read from the synced record tree; the generated union is
    // written beside the lookup that consumes it, which stays in this repo.
    const recordsDir = join(tempRoot, 'shared', 'game', 'data', 'records', 'enumeration');
    const enumDir = join(tempRoot, 'shared', 'game', 'data', 'enumeration');
    mkdirSync(recordsDir, { recursive: true });
    mkdirSync(enumDir, { recursive: true });
    writeFileSync(join(recordsDir, 'enumeration.ts'), FIXTURE_ENUMERATION);

    // Every OTHER category this repo's real ALL_ENUMERATION carries is absent
    // from this fixture on purpose, which proves the read really came from the
    // temp root, not a fallback to the real committed file.
    const outputPath = await generateEnumTypes(tempRoot);

    expect(outputPath).toBe(join(enumDir, 'generated-types.ts'));
    const generated = readFileSync(outputPath, 'utf-8');
    expect(generated).toContain("type World = 'light' | 'dark';");
  });

  it('fails instead of silently reading some other root\'s data when the given root has none', async () => {
    tempRoot = mkdtempSync(join(tmpdir(), 'enum-root-empty-'));
    await expect(generateEnumTypes(tempRoot)).rejects.toThrow();
  });
});
