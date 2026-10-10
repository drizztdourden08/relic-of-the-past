/* @layer shared-asset-extraction @kind logic */
import { ImageBuffer } from '../../graphics/png-writer';
import type { SpritePiece } from '../title-tables.type';
import type { TitleSource } from './title-render.type';
import { NAME_TABLE_ROW_CHARS, SCREEN_PX, TILE_4BPP_WORDS } from './title-render.constants';
import { drawTile } from './draw-tile';

const renderSprites = (src: TitleSource, nameBase: number, row: number, pieces: readonly SpritePiece[]): ImageBuffer => {
  const img = new ImageBuffer(SCREEN_PX, SCREEN_PX);
  for (const { char, x, y, flipX = false } of pieces) {
    for (let q = 0; q < 4; q += 1) {
      const tile = char + (q & 1) + (q >> 1) * NAME_TABLE_ROW_CHARS;
      const dx = (flipX ? 1 - (q & 1) : q & 1) * 8;
      drawTile(img, src, { addr: nameBase + tile * TILE_4BPP_WORDS, row, x: x + dx, y: y + (q >> 1) * 8, flipX, flipY: false });
    }
  }
  return img;
};

export { renderSprites };
