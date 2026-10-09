/* @layer bridge-wasm @kind logic */
import { EXTRA_GLYPHS, extraGlyphTiles } from '@rotp/game-data';
import type { ExtraGlyphSlot } from '@rotp/game-data';
import { ENTRY_BYTES, TILE_OFFSET } from './extra-glyphs.constants';

const tableOf = (extras: readonly ExtraGlyphSlot[]): Uint8Array => {
  const table = new Uint8Array(extras.length * ENTRY_BYTES);
  extras.forEach((extra, index) => {
    const glyph = EXTRA_GLYPHS.find((candidate) => candidate.char === extra.char);
    if (glyph === undefined) return;
    table[index * ENTRY_BYTES] = extra.slot;
    table[index * ENTRY_BYTES + 1] = extra.width;
    table.set(extraGlyphTiles(glyph), index * ENTRY_BYTES + TILE_OFFSET);
  });
  return table;
};

export { tableOf };
