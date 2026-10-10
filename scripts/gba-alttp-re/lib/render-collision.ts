/* @layer scripts @kind tooling */
import { PNG } from 'pngjs';
import { ROOM_PIXELS, ROOM_TILES } from './render-room.constants';
import type { Rgba } from './native-record.type';

const attributeColor = (attribute: number): Rgba => [
  (attribute * 73) & 0xff,
  (attribute * 151) & 0xff,
  (attribute * 211) & 0xff,
  0xff,
];

const fillTile = (data: Buffer, tileX: number, tileY: number, color: Rgba): void => {
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      data.set(color, ((tileY * 8 + y) * ROOM_PIXELS + tileX * 8 + x) * 4);
    }
  }
};

const renderCollision = (collision: Uint8Array): Buffer => {
  const png = new PNG({ width: ROOM_PIXELS, height: ROOM_PIXELS });
  for (let tileY = 0; tileY < ROOM_TILES; tileY++) {
    for (let tileX = 0; tileX < ROOM_TILES; tileX++) {
      const attribute = collision[tileY * ROOM_TILES + tileX] ?? 0;
      fillTile(png.data, tileX, tileY, attributeColor(attribute));
    }
  }
  return PNG.sync.write(png);
};

export { renderCollision };
