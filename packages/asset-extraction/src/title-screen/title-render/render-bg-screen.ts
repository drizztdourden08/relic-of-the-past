/* @layer shared-asset-extraction @kind logic */
import { ImageBuffer } from '../../graphics/png-writer';
import type { TitleSource } from './title-render.type';
import {
  CHAR_INDEX_MASK, FLIP_X_BIT, FLIP_Y_BIT, PALETTE_MASK, PALETTE_SHIFT, SCREEN_PX, SCREEN_TILES, TILE_4BPP_WORDS,
} from './title-render.constants';
import { drawTile } from './draw-tile';

const renderBgScreen = (src: TitleSource, mapBase: number, charBase: number): ImageBuffer => {
  const img = new ImageBuffer(SCREEN_PX, SCREEN_PX);
  for (let ty = 0; ty < SCREEN_TILES; ty += 1) {
    for (let tx = 0; tx < SCREEN_TILES; tx += 1) {
      const entry = src.vram[mapBase + ty * SCREEN_TILES + tx] ?? 0;
      const addr = charBase + (entry & CHAR_INDEX_MASK) * TILE_4BPP_WORDS;
      drawTile(img, src, addr, (entry >> PALETTE_SHIFT) & PALETTE_MASK, {
        x: tx * 8, y: ty * 8, flipX: (entry & FLIP_X_BIT) !== 0, flipY: (entry & FLIP_Y_BIT) !== 0,
      });
    }
  }
  return img;
};

export { renderBgScreen };
