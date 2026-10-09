/* @layer shared-asset-extraction @kind logic */
import type { GbaRomReader } from '../../../rom/gba-rom';
import { DUNGEON_PALETTE_BASE, DUNGEON_PALETTE_SIZE } from './graphics-source.constants';

const extractDungeonPalette = (rom: GbaRomReader, paletteId: number): Buffer => {
  if (!Number.isInteger(paletteId) || paletteId < 0 || paletteId > 0xff) throw new Error('Invalid dungeon palette ID');
  return Buffer.from(rom.romSlice(DUNGEON_PALETTE_BASE + (paletteId >>> 1) * DUNGEON_PALETTE_SIZE, DUNGEON_PALETTE_SIZE));
};

export { extractDungeonPalette };
