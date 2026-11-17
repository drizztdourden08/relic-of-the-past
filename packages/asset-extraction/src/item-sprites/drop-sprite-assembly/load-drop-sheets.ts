/* @layer shared-asset-extraction @kind logic */
import type { SpriteSource } from '../sources';
import type { DropSheets } from './drop-sprite-assembly.type';
import { DROP_BASE_SHEET, DROP_SHEET_IDS } from './load-drop-sheets.constants';

const loadDropSheets = (source: SpriteSource): DropSheets => {
  const sheets = new Map<number, Buffer>();
  for (const id of DROP_SHEET_IDS) sheets.set(id, source.readSheet('spr', id));
  return { sheets, sheet96: source.readSheet('spr', DROP_BASE_SHEET) };
};

export { loadDropSheets };
