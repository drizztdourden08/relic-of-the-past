/* @layer tests @kind test */
/**
 * `generated-types.ts` is committed, not built on the fly — so a data edit to
 * `ALL_ENUMERATION` that forgot to run `npm run generate:enum-types` would
 * otherwise go unnoticed until some unrelated field silently accepted (or
 * rejected) a value. This regenerates the source in memory and diffs it
 * against the committed file, byte for byte.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, it, expect } from 'vitest';
import { ALL_ENUMERATION } from '@shared/game/data';
import { buildGeneratedTypesSource } from '../../../scripts/generate-enum-types.mjs';

const GENERATED_FILE = resolve(__dirname, '../../../shared/game/data/enumeration/generated-types.ts');

describe('enumeration/generated-types.ts', () => {
  it('matches what generate-enum-types.mjs would emit from the current ALL_ENUMERATION', () => {
    const committed = readFileSync(GENERATED_FILE, 'utf8');
    const fresh = buildGeneratedTypesSource(ALL_ENUMERATION);
    expect(committed).toBe(fresh);
  });

  it('carries every value ALL_ENUMERATION seeds for each of the 10 categories', () => {
    const source = readFileSync(GENERATED_FILE, 'utf8');
    const byCategory = new Map<string, string[]>();
    for (const entry of ALL_ENUMERATION) {
      const values = byCategory.get(entry.category) ?? [];
      if (!values.includes(entry.value)) values.push(entry.value);
      byCategory.set(entry.category, values);
    }
    for (const values of byCategory.values()) {
      for (const value of values) expect(source, value).toContain(`'${value}'`);
    }
  });
});
