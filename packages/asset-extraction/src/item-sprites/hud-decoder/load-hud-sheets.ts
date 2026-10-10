/* @layer shared-asset-extraction @kind logic */
import { decompress } from '../../compression/lz-decompress';
import { HUD_SHEET_IDS } from './hud-decoder.constants';
import type { RomData } from '../../rom/rom-types';
import { spriteSheetAddress } from '../../data/sprite-sheet-address';

const loadHudSheets = (rom: RomData): Buffer[] =>
  HUD_SHEET_IDS.map(id =>
    decompress(spriteSheetAddress(id), (addr) => rom.getByte(addr), false)
  );

export { loadHudSheets };
