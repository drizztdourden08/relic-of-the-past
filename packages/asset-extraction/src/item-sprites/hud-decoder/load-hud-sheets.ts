/* @layer shared-asset-extraction @kind logic */
import { HUD_SHEET_IDS } from './hud-decoder.constants';
import type { SpriteSource } from '../sources';

const loadHudSheets = (source: SpriteSource): Buffer[] => HUD_SHEET_IDS.map((id) => source.readSheet('spr', id));

export { loadHudSheets };
