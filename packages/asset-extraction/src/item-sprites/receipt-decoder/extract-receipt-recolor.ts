/* @layer shared-asset-extraction @kind logic */
import { itemAt } from '../../checked-read';
import { kDecodeTab, kReceiveItemGfx } from '../receipt-tables';
import { combinedSheet } from './combined-sheet';
import { receiptPicture } from './receipt-picture';
import type { ImageBuffer } from '../../graphics/png-writer';
import type { RomData } from '../../rom/rom-types';
import type { SpritePalettes } from '../receipt-palettes';
import type { ReceiptSheets } from './receipt-decoder.type';
import { paletteRow } from '../receipt-palettes';

const extractReceiptRecolor = (receiptId: number, palIdx: number, rom: RomData, sheets: ReceiptSheets, spritePalettes: SpritePalettes): ImageBuffer | null => {
  const gfx = itemAt(kReceiveItemGfx, receiptId, 'Receipt graphic');
  const offset = kDecodeTab[gfx];
  if (offset === undefined) return null;

  const combined = combinedSheet(sheets, gfx);
  const palette = paletteRow(spritePalettes, palIdx);
  return receiptPicture(combined, offset, palette, receiptId);
};

export { extractReceiptRecolor };
