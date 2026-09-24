/* @layer shared-asset-extraction @kind logic */
/**
 * Rebuilds the part of VRAM the finished title screen draws from: the background and
 * sprite character data, the triforce bitmap, and the two tilemaps the stripe list writes. Word-addressed,
 * like the PPU (0x8000 words).
 */
import type { RomData } from '../rom/rom-types';
import { decompress } from '../compression/lz-decompress';
import { kCompBgPtrs, kCompSpritePtrs } from '../data/tables';
import { applyStripes } from '../graphics/stripe-image';
import {
  TITLE_BACKGROUND_MAP, TITLE_BG_SLOTS, TITLE_BLANK_TILE, TITLE_LOGO_MAP,
  TITLE_SWORD_SLOT, TITLE_TILEMAP_STRIPES, TRIFORCE_BITMAP_VRAM, type SheetSlot,
} from './title-tables';
import { readTriforceModel, TRIFORCE_REST_POSE } from './triforce/poly-model';
import { renderPolyhedron } from './triforce/poly-render';

const VRAM_WORDS = 0x8000;
const TILES_PER_SHEET = 64;
/** A 64x64 tilemap is four 32x32 screens. */
const TILEMAP_WORDS = 0x1000;

/** Do3To4High / Do3To4Low: 24-byte 3bpp tiles into 16-word 4bpp tiles. */
const expand3bpp = (vram: Uint16Array, slot: SheetSlot, src: Buffer): void => {
  const { vram: base, high } = slot;
  for (let tile = 0; tile < TILES_PER_SHEET; tile += 1) {
    const s = tile * 24;
    const d = base + tile * 16;
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

const buildTitleVram = (rom: RomData): Uint16Array => {
  const vram = new Uint16Array(VRAM_WORDS);
  for (const slot of TITLE_BG_SLOTS) expand3bpp(vram, slot, decompress(kCompBgPtrs[slot.sheet], readByte(rom), false));
  expand3bpp(vram, TITLE_SWORD_SLOT, decompress(kCompSpritePtrs[TITLE_SWORD_SLOT.sheet], readByte(rom), false));
  vram.fill(TITLE_BLANK_TILE, TITLE_BACKGROUND_MAP, TITLE_BACKGROUND_MAP + TILEMAP_WORDS);
  vram.fill(TITLE_BLANK_TILE, TITLE_LOGO_MAP, TITLE_LOGO_MAP + TILEMAP_WORDS);
  applyStripes(vram, rom, TITLE_TILEMAP_STRIPES);
  // The triforce is no sheet: the polyhedral engine draws it, and at rest its frame never changes.
  const bitmap = renderPolyhedron(readTriforceModel(rom), TRIFORCE_REST_POSE);
  for (let i = 0; i < bitmap.length >> 1; i += 1) vram[TRIFORCE_BITMAP_VRAM + i] = bitmap[i * 2] | (bitmap[i * 2 + 1] << 8);
  return vram;
};

export { buildTitleVram };
