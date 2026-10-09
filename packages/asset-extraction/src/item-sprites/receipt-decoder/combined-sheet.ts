/* @layer shared-asset-extraction @kind logic */
import type { ReceiptSheets } from './receipt-decoder.type';

const secondarySheet = (sheets: ReceiptSheets, gfxSheet: number): Buffer => {
  if (gfxSheet === 0x23 || gfxSheet >= 0x37) return sheets.sheet5D;
  if (gfxSheet === 0x0c || gfxSheet >= 0x24) return sheets.sheet5C;
  return sheets.sheet5B;
};

const combinedSheet = (sheets: ReceiptSheets, gfxSheet: number): Buffer =>
  Buffer.concat([sheets.base, secondarySheet(sheets, gfxSheet)]);

export { combinedSheet };
