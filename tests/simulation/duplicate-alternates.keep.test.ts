/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import { resolveDuplicate, isDuplicated, itemLabel } from '../../shared/game/logic/queries/item-duplicates';
import type { ItemId } from '../../shared/game/data';
import { describeDataset } from '../dataset-guard';

const EMPTY = new Set<ItemId>();
const WITH_LAMP = new Set<ItemId>(['item-019']);

describeDataset('duplicate item alternates', () => {
  it('yields the primary item when it is not owned', () => {
    expect(resolveDuplicate(0x12, EMPTY)).toBe(0x12);
    expect(itemLabel(resolveDuplicate(0x12, EMPTY))).toBe('Lamp');
  });

  it('swaps the Lamp for 5 Rupees once a lamp is owned', () => {
    expect(resolveDuplicate(0x12, WITH_LAMP)).toBe(0x35);
    expect(itemLabel(resolveDuplicate(0x12, WITH_LAMP))).toBe('Rupees (5)');
  });

  it('covers both boomerangs, not only the lamp', () => {
    expect(resolveDuplicate(0x0c, new Set<ItemId>(['item-013']))).toBe(0x44);
    expect(resolveDuplicate(0x2a, new Set<ItemId>(['item-043']))).toBe(0x46);
  });

  it('leaves items with no alternate alone, owned or not', () => {
    expect(resolveDuplicate(0x01, new Set<ItemId>(['item-012']))).toBe(0x01);
    expect(isDuplicated(0x01, new Set<ItemId>(['item-012']))).toBe(false);
  });

  it('reports whether a swap happened, for the "already owned" note', () => {
    expect(isDuplicated(0x12, WITH_LAMP)).toBe(true);
    expect(isDuplicated(0x12, EMPTY)).toBe(false);
  });

  it('names an unmapped id by hex instead of returning undefined', () => {
    expect(itemLabel(0xdd)).toBe('item 0xdd');
  });
});
