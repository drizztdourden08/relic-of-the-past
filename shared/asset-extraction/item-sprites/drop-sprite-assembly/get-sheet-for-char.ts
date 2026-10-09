/* @layer shared-asset-extraction @kind logic */
import type { DropSheets, SheetForChar } from './drop-sprite-assembly.type';

const getSheetForChar = (charId: number, dropSheets: DropSheets): SheetForChar => {
  const slot = charId >>> 6;
  const tile = charId & 0x3f;
  const offset = tile * 24;

  let sheetId: number;
  let high: boolean;

  if (slot === 0) {
    sheetId = 0; high = true;
  } else if (slot === 1) {
    sheetId = 10; high = true;
  } else if (slot === 2) {
    sheetId = 6; high = false;
  } else {
    sheetId = 7; high = false;
  }

  return { sheet: dropSheets.sheets.get(sheetId)!, offset, high };
};

export { getSheetForChar };
