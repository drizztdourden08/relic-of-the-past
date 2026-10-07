/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import { resolveAreaSprite } from '@app/lib/game/simulator/overworld-area';

// A 2x2 overworld area shares one sprite table across its four screens, every
// spawn relative to the HEAD (top-left) screen. Screens lay out 8 per row, so
// head 24 has area-mates 25 (east), 32 (south) and 33 (south-east).
const HEAD = 24;
const heads = (() => {
  const table = new Uint8Array(64);
  for (let i = 0; i < 64; i++) table[i] = i; // every other screen is its own (small) area
  table[24] = HEAD;
  table[25] = HEAD;
  table[32] = HEAD;
  table[33] = HEAD;
  return table;
})();

describe('resolveAreaSprite', () => {
  it('keeps an in-range tile on the head screen unchanged', () => {
    expect(resolveAreaSprite(HEAD, { row: 5, col: 5 }, heads)).toEqual({
      screenIndex: HEAD,
      tile: { row: 5, col: 5 },
    });
  });

  it('resolves a row past 63 to the screen one row down, with the row rebased', () => {
    expect(resolveAreaSprite(HEAD, { row: 84, col: 12 }, heads)).toEqual({
      screenIndex: HEAD + 8,
      tile: { row: 20, col: 12 },
    });
  });

  it('resolves a column past 63 to the screen one column right, with the column rebased', () => {
    expect(resolveAreaSprite(HEAD, { row: 12, col: 84 }, heads)).toEqual({
      screenIndex: HEAD + 1,
      tile: { row: 12, col: 20 },
    });
  });

  it('resolves both axes overflowing to the south-east screen', () => {
    expect(resolveAreaSprite(HEAD, { row: 70, col: 70 }, heads)).toEqual({
      screenIndex: HEAD + 8 + 1,
      tile: { row: 6, col: 6 },
    });
  });

  it('resolves the same way whichever of the area\'s screens the table was queried through', () => {
    // Querying via the south-west sub-screen (32) returns the same area-relative
    // table as querying via the head, so the result must land on the same screen.
    expect(resolveAreaSprite(32, { row: 84, col: 12 }, heads)).toEqual({
      screenIndex: HEAD + 8,
      tile: { row: 20, col: 12 },
    });
  });

  it('reuses the light-world head layout for the dark world via the +64 offset', () => {
    const DARK_HEAD = HEAD + 64;
    expect(resolveAreaSprite(DARK_HEAD, { row: 84, col: 12 }, heads)).toEqual({
      screenIndex: DARK_HEAD + 8,
      tile: { row: 20, col: 12 },
    });
  });
});
