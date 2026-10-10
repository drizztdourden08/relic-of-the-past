/* @layer bridge-wasm @kind logic */
import { kLanguages } from '@rotp/asset-extraction';
import { slotBlockOffset } from './sram-slots';
import {
  DIGIT_TILE_SHIFT, FIRST_DIGIT_TILE, NAME_LENGTH, NAME_OFFSET, SPECIAL_TILE_CODES,
} from './offline-player-name.constants';

const filterNameCode = (tile: number): number => {
  if (tile >= FIRST_DIGIT_TILE) return tile - DIGIT_TILE_SHIFT;
  return SPECIAL_TILE_CODES.get(tile) ?? tile;
};

const glyphText = (code: number): string => {
  const us = kLanguages.us;
  if (us === undefined) throw new Error('The us language table is missing');
  const glyph = us.alphabet[code] ?? ' ';
  const isIconGlyph = glyph.startsWith('[');
  return isIconGlyph ? '?' : glyph;
};

const offlinePlayerName = (sram: Uint8Array, slot: number): string | null => {
  const base = slotBlockOffset(sram, slot);
  if (base === null) return null;
  let name = '';
  for (let i = 0; i < NAME_LENGTH; i++) {
    const at = base + NAME_OFFSET + i * 2;
    const word = (sram[at] ?? 0) | ((sram[at + 1] ?? 0) << 8);
    name += glyphText(filterNameCode((word & 0xf) | ((word >> 1) & 0xf0)));
  }
  const trimmed = name.trimEnd();
  return trimmed.length > 0 ? trimmed : null;
};

export { offlinePlayerName };
