/* @layer bridge-wasm @kind logic */
import { decode2bppTile } from '@rotp/asset-extraction';
import type { TileSpot } from './glyph-atlas.type';
import { TILE_BYTES } from './glyph-atlas.constants';

const paintTile = (ctx: CanvasRenderingContext2D, spot: TileSpot): void => {
  const { tiles, tile, x, y, ramp } = spot;
  const pixels = decode2bppTile(tiles, tile * TILE_BYTES);
  for (let py = 0; py < 8; py++) {
    for (let px = 0; px < 8; px++) {
      const value = pixels[py * 8 + px];
      if (value === 0) continue;
      const color = value === undefined ? undefined : ramp[value];
      if (color === undefined) throw new RangeError(`glyph pixel ${String(value)} has no palette color`);
      ctx.fillStyle = color;
      ctx.fillRect(x + px, y + py, 1, 1);
    }
  }
};

export { paintTile };
