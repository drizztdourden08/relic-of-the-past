/* @layer tests @kind test */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from 'vitest';
import { ALL_ENUMERATION, all } from '@rotp/game-data';
import { buildGeneratedTypesSource } from '../generate-enum-types.mjs';

const REPO_ROOT = resolve(fileURLToPath(import.meta.url), '..', '..', '..', '..');
const describeDataset = all('screen').length > 0 ? describe : describe.skip;

const GENERATED_FILE = resolve(REPO_ROOT, 'packages/game-data/src/data/enumeration/enumeration.type.ts');

describeDataset('enumeration/enumeration.type.ts', { tags: ['standard'] }, () => {
  it('matches what generate-enum-types.mjs would emit from the current ALL_ENUMERATION', () => {
    const committed = readFileSync(GENERATED_FILE, 'utf8');
    const fresh = buildGeneratedTypesSource(ALL_ENUMERATION);
    expect(committed).toBe(fresh);
  });
});
