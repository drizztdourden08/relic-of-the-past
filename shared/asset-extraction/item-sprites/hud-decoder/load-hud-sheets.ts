/* @layer shared-asset-extraction @kind logic */
import { decompress } from '../../compression/lz-decompress';
import { kCompSpritePtrs } from '../../data/tables';
import { HUD_SHEET_IDS } from './hud-decoder.constants';
import type { RomData } from '../../rom/rom-types';

const loadHudSheets = (rom: RomData): Buffer[] =>
  HUD_SHEET_IDS.map(id =>
    decompress(kCompSpritePtrs[id], (addr) => rom.getByte(addr), false)
  );

export { loadHudSheets };
