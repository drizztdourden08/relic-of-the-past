/* @layer shared-asset-extraction @kind logic */
/**
 * Draws title screen layers out of a rebuilt VRAM and palette: a 4bpp background
 * screen from its tilemap, or a list of 16x16 sprites. Colour 0 stays transparent.
 */
import type { RGBA } from '../graphics/palette';
import { ImageBuffer } from '../graphics/png-writer';
import type { SpritePiece } from './title-tables';

const SCREEN_TILES = 32;
const SCREEN_PX = 256;

interface TitleSource {
  vram: Uint16Array;
  palette: RGBA[];
}

/** Colour index of pixel (x, y) of the 4bpp tile at VRAM word address |addr|. */
const pixelOf = (vram: Uint16Array, addr: number, x: number, y: number): number => {
  const lo = vram[(addr + y) & 0x7fff];
  const hi = vram[(addr + 8 + y) & 0x7fff];
  const bit = 7 - x;
  return ((lo >> bit) & 1) | (((lo >> (bit + 8)) & 1) << 1) | (((hi >> bit) & 1) << 2) | (((hi >> (bit + 8)) & 1) << 3);
};

const drawTile = (
  img: ImageBuffer, src: TitleSource, addr: number, row: number,
  at: { x: number; y: number; flipX: boolean; flipY: boolean },
): void => {
  for (let y = 0; y < 8; y += 1) {
    for (let x = 0; x < 8; x += 1) {
      const c = pixelOf(src.vram, addr, at.flipX ? 7 - x : x, at.flipY ? 7 - y : y);
      if (c !== 0) img.putPixel(at.x + x, at.y + y, src.palette[row * 16 + c]);
    }
  }
};

/** The first 32x32 screen of a background layer, as the PPU would draw it unscrolled. */
const renderBgScreen = (src: TitleSource, mapBase: number, charBase: number): ImageBuffer => {
  const img = new ImageBuffer(SCREEN_PX, SCREEN_PX);
  for (let ty = 0; ty < SCREEN_TILES; ty += 1) {
    for (let tx = 0; tx < SCREEN_TILES; tx += 1) {
      const entry = src.vram[mapBase + ty * SCREEN_TILES + tx];
      const addr = charBase + (entry & 0x3ff) * 16;
      drawTile(img, src, addr, (entry >> 10) & 7, {
        x: tx * 8, y: ty * 8, flipX: (entry & 0x4000) !== 0, flipY: (entry & 0x8000) !== 0,
      });
    }
  }
  return img;
};

/** 16x16 sprites from a name table, on one OBJ palette row, onto a 256x256 canvas. */
const renderSprites = (src: TitleSource, nameBase: number, row: number, pieces: readonly SpritePiece[]): ImageBuffer => {
  const img = new ImageBuffer(SCREEN_PX, SCREEN_PX);
  for (const { char, x, y, flipX = false } of pieces) {
    for (let q = 0; q < 4; q += 1) {
      const tile = char + (q & 1) + (q >> 1) * 16;
      const dx = (flipX ? 1 - (q & 1) : q & 1) * 8;
      drawTile(img, src, nameBase + tile * 16, row, { x: x + dx, y: y + (q >> 1) * 8, flipX, flipY: false });
    }
  }
  return img;
};

export { renderBgScreen, renderSprites };
export type { TitleSource };
