/* @layer shared-asset-extraction @kind data */
import type { SheetSource, SpritePaletteSource } from './graphics-source.type';

const PALACE_SHEETS: readonly SheetSource[] = [
  { address: 0x08258e38, firstTile: 0 },
  { address: 0x082592e0, firstTile: 64 },
  { address: 0x0825e200, firstTile: 128 },
  { address: 0x0825c910, firstTile: 192 },
  { address: 0x0825d4a8, firstTile: 256 },
  { address: 0x08264ccc, firstTile: 320 },
  { address: 0x08261c50, firstTile: 384 },
  { address: 0x0825d9e4, firstTile: 448 },
];

const PALACE_SPRITE_PALETTES: readonly SpritePaletteSource[] = [
  { bank: 17, address: 0x083bd7d8 },
  { bank: 18, address: 0x083bd7f8 },
  { bank: 19, address: 0x083bd818 },
  { bank: 20, address: 0x083b56ec },
  { bank: 23, address: 0x083bd8f8 },
  { bank: 24, address: 0x083bf858 },
  { bank: 25, address: 0x083bf878 },
  { bank: 26, address: 0x083bf898 },
];

export { PALACE_SHEETS, PALACE_SPRITE_PALETTES };
