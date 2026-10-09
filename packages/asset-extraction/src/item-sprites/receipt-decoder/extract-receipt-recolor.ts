/* @layer shared-asset-extraction @kind logic */
import { kDecodeTab, kReceiveItemGfx } from '../receipt-tables';
import { combinedSheet } from './combined-sheet';
import { receiptPicture } from './receipt-picture';
import type { ImageBuffer } from '../../graphics/png-writer';
import type { RomData } from '../../rom/rom-types';
import type { SpritePalettes } from '../receipt-palettes';
import type { ReceiptSheets } from './receipt-decoder.type';

const extractReceiptRecolor = (receiptId: number, palIdx: number, rom: RomData, sheets: ReceiptSheets, spritePalettes: SpritePalettes): ImageBuffer | null => {
  const gfx = kReceiveItemGfx[receiptId];
  if (gfx >= kDecodeTab.length) return null;

  const offset = kDecodeTab[gfx];
  const combined = combinedSheet(sheets, gfx);
  const palette = spritePalettes.palettes[palIdx];
  return receiptPicture(combined, offset, palette, receiptId);
};

export { extractReceiptRecolor };
