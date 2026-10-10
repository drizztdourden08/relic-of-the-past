/* @layer shared-asset-extraction @kind logic */
import { itemAt } from '../../checked-read';
import type { ImageBuffer } from '../../graphics/png-writer';
import type { TilePlacement, TitleSource } from './title-render.type';
import { PALETTE_ROW_COLOURS, VRAM_ADDRESS_MASK } from './title-render.constants';

const pixelOf = (vram: Uint16Array, addr: number, x: number, y: number): number => {
  const lo = vram[(addr + y) & VRAM_ADDRESS_MASK] ?? 0;
  const hi = vram[(addr + 8 + y) & VRAM_ADDRESS_MASK] ?? 0;
  const bit = 7 - x;
  return ((lo >> bit) & 1) | (((lo >> (bit + 8)) & 1) << 1) | (((hi >> bit) & 1) << 2) | (((hi >> (bit + 8)) & 1) << 3);
};

const drawTile = (img: ImageBuffer, src: TitleSource, addr: number, row: number, at: TilePlacement): void => {
  for (let y = 0; y < 8; y += 1) {
    for (let x = 0; x < 8; x += 1) {
      const c = pixelOf(src.vram, addr, at.flipX ? 7 - x : x, at.flipY ? 7 - y : y);
      if (c !== 0) img.putPixel(at.x + x, at.y + y, itemAt(src.palette, row * PALETTE_ROW_COLOURS + c, 'Title palette colour'));
    }
  }
};

export { drawTile };
