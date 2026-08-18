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
import { buildGeneratedTypesSource, CATEGORY_TYPE_NAMES } from '../../../scripts/generate-enum-types.mjs';
import { describeDataset } from '../../dataset-guard';

const GENERATED_FILE = resolve(__dirname, '../../../shared/game/data/enumeration/generated-types.ts');

/** The categories the generator emits a union for — the rule, not a count. */
const GENERATED_CATEGORIES = new Set(Object.keys(CATEGORY_TYPE_NAMES as Record<string, string>));

describeDataset('enumeration/generated-types.ts', () => {
  it('matches what generate-enum-types.mjs would emit from the current ALL_ENUMERATION', () => {
    const committed = readFileSync(GENERATED_FILE, 'utf8');
    const fresh = buildGeneratedTypesSource(ALL_ENUMERATION);
    expect(committed).toBe(fresh);
  });

  it('carries every value ALL_ENUMERATION seeds for each generated category', () => {
    const source = readFileSync(GENERATED_FILE, 'utf8');
    const byCategory = new Map<string, string[]>();
    for (const entry of ALL_ENUMERATION) {
      const values = byCategory.get(entry.category) ?? [];
      if (!values.includes(entry.value)) values.push(entry.value);
      byCategory.set(entry.category, values);
    }
    for (const [category, values] of byCategory) {
      if (!GENERATED_CATEGORIES.has(category)) continue;
      for (const value of values) expect(source, value).toContain(`'${value}'`);
    }
  });

  /**
   * A category earns a union only when the field it labels stores the value as a
   * string. One labels a numeric field, so generating its union would retype
   * that field to string literals — the generator's category table is what
   * decides, and this holds that line.
   */
  it('leaves a category that labels a non-string field out of the unions', () => {
    const source = readFileSync(GENERATED_FILE, 'utf8');
    const ungenerated = ALL_ENUMERATION.filter((entry) => !GENERATED_CATEGORIES.has(entry.category));
    expect(ungenerated.length).toBeGreaterThan(0);
    for (const entry of ungenerated) expect(source, entry.value).not.toContain(`'${entry.value}'`);
  });
});

describeDataset('review-status category', () => {
  it('seeds exactly 5 values, in the untouched → verified progression', () => {
    const values = ALL_ENUMERATION.filter((entry) => entry.category === 'review-status').map((entry) => entry.value);
    expect(values).toEqual(['untouched', 'in-review', 'needs-work', 'accepted', 'verified']);
  });

  it('applies to every entity kind, since review covers all eleven collections', () => {
    const entries = ALL_ENUMERATION.filter((entry) => entry.category === 'review-status');
    expect(entries.length).toBeGreaterThan(0);
    for (const entry of entries) {
      expect(entry.appliesTo).toContain('screen');
      expect(entry.appliesTo).toContain('enumeration');
      expect(entry.appliesTo.length).toBe(11);
    }
  });

  it('regenerated a real ReviewStatus union in generated-types.ts', () => {
    const source = readFileSync(GENERATED_FILE, 'utf8');
    expect(source).toContain("type ReviewStatus = 'untouched' | 'in-review' | 'needs-work' | 'accepted' | 'verified';");
    expect(source).toMatch(/export type \{[\s\S]*\bReviewStatus\b[\s\S]*\};/);
  });
});
