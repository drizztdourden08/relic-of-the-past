/* @layer bridge-wasm @kind constants */
import { COLORS_PER_OUTFIT, OUTFIT_IDS } from '@rotp/game-data';

const HEADER_BYTES = 29;
const BYTES_PER_WORD = 2;
const OUTFIT_BLOCK = OUTFIT_IDS.length * COLORS_PER_OUTFIT * BYTES_PER_WORD;
const GLOVE_BLOCK = 4;

const ZSPR_MAGIC: readonly number[] = [0x5a, 0x53, 0x50, 0x52];

const ZSPR_HEADER = {
  version: 4,
  checksum: 5,
  pixelOffset: 9,
  pixelLength: 13,
  paletteOffset: 15,
  paletteLength: 19,
  spriteType: 21,
} as const;

export { HEADER_BYTES, BYTES_PER_WORD, OUTFIT_BLOCK, GLOVE_BLOCK, ZSPR_MAGIC, ZSPR_HEADER };
