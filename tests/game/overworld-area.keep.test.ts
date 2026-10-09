/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import { resolveAreaSprite } from '@rotp/navigation';

const HEAD = 24;
const SCREENS_PER_ROW = 8;
const SOUTH_SCREEN = HEAD + SCREENS_PER_ROW;
const heads = (() => {
  const table = new Uint8Array(64);
  for (let screen = 0; screen < 64; screen++) table[screen] = screen;
  table[HEAD] = HEAD;
  table[HEAD + 1] = HEAD;
  table[SOUTH_SCREEN] = HEAD;
  table[SOUTH_SCREEN + 1] = HEAD;
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
    expect(resolveAreaSprite(SOUTH_SCREEN,{ row: 84, col: 12 }, heads)).toEqual({
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
