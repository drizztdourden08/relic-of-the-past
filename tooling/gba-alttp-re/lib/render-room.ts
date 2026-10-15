/* @layer scripts @kind tooling */

import { PNG } from 'pngjs';
import { decode4bppTile } from '@rotp/asset-extraction';
import { ROOM_PIXELS, ROOM_TILES } from './render-room.constants';
import type { Rgba } from './native-record.type';

const decodeColor = (value: number): Rgba => [
  Math.round((value & 0x1f) * 255 / 31),
  Math.round(((value >>> 5) & 0x1f) * 255 / 31),
  Math.round(((value >>> 10) & 0x1f) * 255 / 31),
  0xff,
];

const colorAt = (colors: readonly (readonly Rgba[])[], bank: number, colorIndex: number): Rgba => {
  const color = colors[bank]?.[colorIndex];
  if (color === undefined) throw new Error(`Missing palette color ${colorIndex} in bank ${bank}`);
  return color;
};

const tileAt = (tiles: readonly Uint8Array[], index: number): Uint8Array => {
  const tile = tiles[index];
  if (tile === undefined) throw new Error(`Missing tile ${index}`);
  return tile;
};

const paintTile = (
  data: Buffer,
  { word, tileX, tileY }: { word: number; tileX: number; tileY: number },
  { tiles, colors }: { tiles: readonly Uint8Array[]; colors: readonly (readonly Rgba[])[] },
): void => {
  const tile = tileAt(tiles, word & 0x03ff);
  const bank = (word >>> 10) & 7;
  const horizontalFlip = Boolean(word & 0x4000);
  const verticalFlip = Boolean(word & 0x8000);
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const sourceX = horizontalFlip ? 7 - x : x;
      const sourceY = verticalFlip ? 7 - y : y;
      const colorIndex = tile[sourceY * 8 + sourceX] ?? 0;
      if (colorIndex === 0 || bank < 2) continue;
      const color = colorAt(colors, bank, colorIndex);
      const destination = ((tileY * 8 + y) * ROOM_PIXELS + tileX * 8 + x) * 4;
      data.set(color, destination);
    }
  }
};

const renderRoom = (
  layers: readonly { snesWords: Uint16Array }[],
  graphics: Buffer,
  palette: Buffer,
): Buffer => {
  const png = new PNG({ width: ROOM_PIXELS, height: ROOM_PIXELS });
  const tiles = Array.from({ length: 512 }, (_, index) => decode4bppTile(graphics, index * 32));
  const colors = Array.from({ length: 8 }, (_, bank) => Array.from({ length: 16 }, (_, color): Rgba => {
    if (bank < 2) return [0, 0, 0, 0];
    return decodeColor(palette.readUInt16LE((bank - 2) * 32 + color * 2));
  }));

  for (const layer of layers) {
    for (const [index, word] of layer.snesWords.entries()) {
      if (index >= ROOM_TILES * ROOM_TILES) break;
      paintTile(png.data, { word, tileX: index % ROOM_TILES, tileY: Math.floor(index / ROOM_TILES) }, { tiles, colors });
    }
  }
  return PNG.sync.write(png);
};

export { renderRoom };
