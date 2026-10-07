/* @layer scripts @kind tooling */
/** Debug pictures of an exported room: its layers drawn with its palette, and its collision. */

import { PNG } from 'pngjs';
import { decode4bppTile } from '../../../shared/asset-extraction/graphics/bitplane-decoder';

const decodeColor = (value: number): readonly [number, number, number, number] => [
  Math.round((value & 0x1f) * 255 / 31),
  Math.round(((value >>> 5) & 0x1f) * 255 / 31),
  Math.round(((value >>> 10) & 0x1f) * 255 / 31),
  0xff,
];

const renderRoom = (
  layers: readonly { snesWords: Uint16Array }[],
  graphics: Buffer,
  palette: Buffer,
): Buffer => {
  const width = 512;
  const png = new PNG({ width, height: 512 });
  const tiles = Array.from({ length: 512 }, (_, index) => decode4bppTile(graphics, index * 32));
  const colors = Array.from({ length: 8 }, (_, bank) => Array.from({ length: 16 }, (_, color) => {
    if (bank < 2) return [0, 0, 0, 0] as const;
    return decodeColor(palette.readUInt16LE((bank - 2) * 32 + color * 2));
  }));

  for (const layer of layers) {
    for (let tileY = 0; tileY < 64; tileY++) {
      for (let tileX = 0; tileX < 64; tileX++) {
        const word = layer.snesWords[tileY * 64 + tileX];
        const tile = tiles[word & 0x03ff];
        const bank = (word >>> 10) & 7;
        const horizontalFlip = Boolean(word & 0x4000);
        const verticalFlip = Boolean(word & 0x8000);
        for (let y = 0; y < 8; y++) {
          for (let x = 0; x < 8; x++) {
            const sourceX = horizontalFlip ? 7 - x : x;
            const sourceY = verticalFlip ? 7 - y : y;
            const colorIndex = tile[sourceY * 8 + sourceX];
            if (colorIndex === 0 || bank < 2) continue;
            const color = colors[bank][colorIndex];
            const destination = ((tileY * 8 + y) * width + tileX * 8 + x) * 4;
            png.data[destination] = color[0];
            png.data[destination + 1] = color[1];
            png.data[destination + 2] = color[2];
            png.data[destination + 3] = color[3];
          }
        }
      }
    }
  }
  return PNG.sync.write(png);
};

const renderCollision = (collision: Uint8Array): Buffer => {
  const png = new PNG({ width: 512, height: 512 });
  for (let tileY = 0; tileY < 64; tileY++) {
    for (let tileX = 0; tileX < 64; tileX++) {
      const attribute = collision[tileY * 64 + tileX];
      const red = (attribute * 73) & 0xff;
      const green = (attribute * 151) & 0xff;
      const blue = (attribute * 211) & 0xff;
      for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
          const destination = ((tileY * 8 + y) * 512 + tileX * 8 + x) * 4;
          png.data[destination] = red;
          png.data[destination + 1] = green;
          png.data[destination + 2] = blue;
          png.data[destination + 3] = 0xff;
        }
      }
    }
  }
  return PNG.sync.write(png);
};

export { renderCollision, renderRoom };
