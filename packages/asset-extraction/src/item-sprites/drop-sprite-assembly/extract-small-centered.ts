/* @layer shared-asset-extraction @kind logic */
import { ImageBuffer } from '../../graphics/png-writer';
import { decode3bppTile } from '../receipt-decoder/decode-3bpp-tile';
import { getSheetForChar } from './get-sheet-for-char';
import type { RGBA } from '../../graphics/palette';
import type { DropSheets } from './drop-sprite-assembly.type';

const extractSmallCentered = (charId: number, palette: RGBA[], dropSheets: DropSheets): ImageBuffer => {
  const { sheet, offset, high } = getSheetForChar(charId, dropSheets);
  const img = new ImageBuffer(16, 16);
  const tile = decode3bppTile(sheet, offset, palette, high);
  img.paste(tile, 4, 4);
  return img;
};

export { extractSmallCentered };
