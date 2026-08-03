/* @layer tests @kind test */
/**
 * The check content tag family (key/big key/map-compass/boss item) is the one
 * CheckTag family that survived the migration off computed tags — it moved
 * from a value recomputed on every read (computeCheckTags) to a real
 * `CheckRecord.tags` array, seeded once from the exact same rules. This pins
 * a few known checks so a future edit to that seed shows up as a real diff.
 */
import { describe, it, expect } from 'vitest';
import { getCheck, hasTagKey } from '@shared/game/data';

describe('check content tags', () => {
  it('tags a key drop that also carries the big key', () => {
    const check = getCheck('check-111');
    expect(check.randomizerName).toBe('Big Key Drop');
    expect(hasTagKey(check.tags ?? [], 'content:key')).toBe(true);
    expect(hasTagKey(check.tags ?? [], 'content:big-key')).toBe(true);
  });

  it('tags a map chest with map-compass', () => {
    const check = getCheck('check-101');
    expect(check.randomizerName).toBe('Map Chest');
    expect(hasTagKey(check.tags ?? [], 'content:map-compass')).toBe(true);
  });

  it('tags a boss prize check with boss-item', () => {
    const check = getCheck('check-131');
    expect(check.randomizerName).toBe('Prize');
    expect(check.kind).toBe('prize');
    expect(hasTagKey(check.tags ?? [], 'content:boss-item')).toBe(true);
  });

  it('leaves a plain chest with no content tags', () => {
    const check = getCheck('check-100');
    expect(check.randomizerName).toBe('Boomerang Chest');
    expect(check.tags ?? []).toEqual([]);
  });
});
