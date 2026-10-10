/* @layer shared-asset-extraction @kind logic */
import type { RomData } from '../rom/rom-types';
import { decompress } from '../compression/lz-decompress';
import { applyStripes } from '../graphics/stripe-image';
import type { SheetSlot } from './title-tables.type';
import {
  TITLE_BACKGROUND_MAP, TITLE_BG_SLOTS, TITLE_BLANK_TILE, TITLE_LOGO_MAP,
  TITLE_SWORD_SLOT, TITLE_TILEMAP_STRIPES, TRIFORCE_BITMAP_VRAM,
} from './title-tables';
import { SOURCE_3BPP_TILE_BYTES, TILE_4BPP_WORDS, TILEMAP_WORDS, TILES_PER_SHEET, VRAM_WORDS } from './title-vram.constants';
import { readTriforceModel, TRIFORCE_REST_POSE } from './triforce/poly-model';
import { renderPolyhedron } from './triforce/poly-render';
import { spriteSheetAddress } from '../data/sprite-sheet-address';
import { bgSheetAddress } from '../data/bg-sheet-address';

const expand3bpp = (vram: Uint16Array, slot: SheetSlot, src: Buffer): void => {
  const { vram: base, high } = slot;
  for (let tile = 0; tile < TILES_PER_SHEET; tile += 1) {
    const s = tile * SOURCE_3BPP_TILE_BYTES;
    const d = base + tile * TILE_4BPP_WORDS;
    for (let row = 0; row < 8; row += 1) {
      const p0 = src[s + row * 2] ?? 0;
      const p1 = src[s + row * 2 + 1] ?? 0;
      const p2 = src[s + 16 + row] ?? 0;
      vram[d + row] = p0 | (p1 << 8);
      vram[d + 8 + row] = p2 | ((high ? p0 | p1 | p2 : 0) << 8);
    }
  }
};

const readByte = (rom: RomData) => (addr: number): number => rom.getByte(addr);

const writeTriforceBitmap = (vram: Uint16Array, rom: RomData): void => {
  const bitmap = renderPolyhedron(readTriforceModel(rom), TRIFORCE_REST_POSE);
  for (let i = 0; i < bitmap.length >> 1; i += 1) vram[TRIFORCE_BITMAP_VRAM + i] = (bitmap[i * 2] ?? 0) | ((bitmap[i * 2 + 1] ?? 0) << 8);
};

const buildTitleVram = (rom: RomData): Uint16Array => {
  const vram = new Uint16Array(VRAM_WORDS);
  for (const slot of TITLE_BG_SLOTS) expand3bpp(vram, slot, decompress(bgSheetAddress(slot.sheet), readByte(rom), false));
  expand3bpp(vram, TITLE_SWORD_SLOT, decompress(spriteSheetAddress(TITLE_SWORD_SLOT.sheet), readByte(rom), false));
  vram.fill(TITLE_BLANK_TILE, TITLE_BACKGROUND_MAP, TITLE_BACKGROUND_MAP + TILEMAP_WORDS);
  vram.fill(TITLE_BLANK_TILE, TITLE_LOGO_MAP, TITLE_LOGO_MAP + TILEMAP_WORDS);
  applyStripes(vram, rom, TITLE_TILEMAP_STRIPES);
  writeTriforceBitmap(vram, rom);
  return vram;
};

export { buildTitleVram };
