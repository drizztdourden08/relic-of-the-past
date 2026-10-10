/* @layer shared-asset-extraction @kind logic */
import { itemAt } from '../../checked-read';
import { extractLarge, extractSmallCentered, extractTall } from '../drop-sprite-assembly';
import { kAbsTab1, kTab1Sprite, kTab2Sprite } from '../drop-tables';
import type { ImageBuffer } from '../../graphics/png-writer';
import type { DropSheets } from '../drop-sprite-assembly';
import type { SpritePalettes } from '../receipt-palettes';
import { paletteRow } from '../receipt-palettes';

const extractDropStandard = (spriteType: number, paletteIdx: number, spritePalettes: SpritePalettes, dropSheets: DropSheets): ImageBuffer => {
  const idx = spriteType - 0xd8;
  const base = itemAt(kTab1Sprite, spriteType, 'Drop sprite base');
  const cid = itemAt(kTab2Sprite, base, 'Drop sprite character');
  const dm = kAbsTab1[idx] ?? 2;
  const palette = paletteRow(spritePalettes, paletteIdx);

  if (dm === 0) return extractSmallCentered(cid, palette, dropSheets);
  if (dm === 1) return extractTall(cid, palette, dropSheets);
  return extractLarge(cid, palette, dropSheets);
};

export { extractDropStandard };
