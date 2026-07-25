/* @layer tests @kind test */
/**
 * The duplicate-item rule has to give the SAME answer to the simulator's
 * delivery, the sim log and the overlay annotation. It previously lived inside
 * the trigger, so the overlay promised a Lamp in a room where the run would hand
 * over 5 Rupees — these tests pin the shared rule those consumers now share.
 */
import { describe, it, expect } from 'vitest';
import { resolveDuplicate, isDuplicated, itemLabel } from '../../shared/game/items';

const EMPTY = new Set<string>();
const WITH_LAMP = new Set(['Lamp']);

describe('duplicate item alternates', () => {
  it('yields the primary item when it is not owned', () => {
    expect(resolveDuplicate(0x12, EMPTY)).toBe(0x12);
    expect(itemLabel(resolveDuplicate(0x12, EMPTY))).toBe('Lamp');
  });

  it('swaps the Lamp for 5 Rupees once a lamp is owned', () => {
    expect(resolveDuplicate(0x12, WITH_LAMP)).toBe(0x35);
    expect(itemLabel(resolveDuplicate(0x12, WITH_LAMP))).toBe('5 Rupees');
  });

  it('covers both boomerangs, not only the lamp', () => {
    expect(resolveDuplicate(0x0c, new Set(['Blue Boomerang']))).toBe(0x44);
    expect(resolveDuplicate(0x2a, new Set(['Red Boomerang']))).toBe(0x46);
  });

  it('leaves items with no alternate alone, owned or not', () => {
    expect(resolveDuplicate(0x01, new Set(['Bow']))).toBe(0x01);
    expect(isDuplicated(0x01, new Set(['Bow']))).toBe(false);
  });

  it('reports whether a swap happened, for the "already owned" note', () => {
    expect(isDuplicated(0x12, WITH_LAMP)).toBe(true);
    expect(isDuplicated(0x12, EMPTY)).toBe(false);
  });

  it('names an unmapped id by hex rather than returning undefined', () => {
    expect(itemLabel(0xdd)).toBe('item 0xdd');
  });
});
