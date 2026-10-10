/* @layer shared-asset-extraction @kind logic */
import { itemAt } from '../../checked-read';
import { kDecodeTab, kOamFlags, kReceiveItemGfx, PAL5_CONFIG } from '../receipt-tables';
import { buildPal5, paletteRow } from '../receipt-palettes';
import { combinedSheet } from './combined-sheet';
import { receiptPicture } from './receipt-picture';
import {
  CRYSTAL_GRADIENT, CRYSTAL_GRADIENT_FIRST_INDEX, CRYSTAL_PALETTE_ROW, CRYSTAL_RECEIPT_ID,
  GEAR_PALETTE_ROW, OAM_FLAGS_FALLBACK,
} from './receipt-decoder.constants';
import type { ImageBuffer } from '../../graphics/png-writer';
import type { RGBA } from '../../graphics/palette';
import type { RomData } from '../../rom/rom-types';
import type { SpritePalettes } from '../receipt-palettes';
import type { ReceiptSheets } from './receipt-decoder.type';

const crystalPalette = (spritePalettes: SpritePalettes): RGBA[] => {
  const palette = [...paletteRow(spritePalettes, CRYSTAL_PALETTE_ROW)];
  CRYSTAL_GRADIENT.forEach((color, i) => { palette[CRYSTAL_GRADIENT_FIRST_INDEX + i] = color; });
  return palette;
};

const extractReceipt = (receiptId: number, rom: RomData, sheets: ReceiptSheets, spritePalettes: SpritePalettes): ImageBuffer | null => {
  const gfx = itemAt(kReceiveItemGfx, receiptId, 'Receipt graphic');
  const offset = kDecodeTab[gfx];
  if (offset === undefined) return null;

  let palIdx = itemAt(kOamFlags, receiptId, 'Receipt OAM flags');
  if (palIdx === OAM_FLAGS_FALLBACK) palIdx = GEAR_PALETTE_ROW;

  let palette = paletteRow(spritePalettes, palIdx);
  const gearTypes = PAL5_CONFIG[receiptId];
  if (palIdx === GEAR_PALETTE_ROW && gearTypes) {
    const [sw, sh] = gearTypes;
    palette = buildPal5(rom, palette, sw, sh);
  }
  if (receiptId === CRYSTAL_RECEIPT_ID) palette = crystalPalette(spritePalettes);

  return receiptPicture(combinedSheet(sheets, gfx), offset, palette, receiptId);
};

export { extractReceipt };
