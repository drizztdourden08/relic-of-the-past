/**
 * SNES bitplane tile decoders (2bpp, 3bpp, 4bpp).
 *
 * SNES tiles are 8×8 pixels stored in planar format:
 * - 2bpp: 16 bytes/tile (HUD graphics, fonts)
 * - 3bpp: 24 bytes/tile (sprites — 2 interleaved planes + 1 separate plane)
 * - 4bpp: 32 bytes/tile (backgrounds, Link sprite)
 *
 * All decoders output pixel indices (palette indices) in row-major order.
 */

/**
 * Decode one 8×8 tile from 2bpp SNES format.
 * Layout: 16 bytes — for each row y: byte[y*2] = plane0, byte[y*2+1] = plane1
 *
 * @param data - Raw tileset bytes
 * @param offset - Byte offset to start of this tile
 * @returns 64-element array of 2-bit palette indices (row-major, left-to-right)
 */
function decode2bppTile(data: Buffer | Uint8Array, offset: number): Uint8Array {
  const pixels = new Uint8Array(64);
  for (let y = 0; y < 8; y++) {
    const d0 = data[offset + y * 2];
    const d1 = data[offset + y * 2 + 1];
    for (let x = 0; x < 8; x++) {
      const bit = 7 - x;
      pixels[y * 8 + x] = ((d0 >>> bit) & 1) | (((d1 >>> bit) & 1) << 1);
    }
  }
  return pixels;
}

/**
 * Decode one 8×8 tile from 3bpp SNES format.
 * Layout: 24 bytes — planes 0+1 interleaved (16 bytes) + plane 2 separate (8 bytes)
 *   bytes[0..15]: row y → byte[y*2] = plane0, byte[y*2+1] = plane1
 *   bytes[16..23]: row y → byte[16+y] = plane2
 *
 * @param data - Raw tileset bytes
 * @param offset - Byte offset to start of this tile
 * @returns 64-element array of 3-bit palette indices
 */
function decode3bppTile(data: Buffer | Uint8Array, offset: number): Uint8Array {
  const pixels = new Uint8Array(64);
  for (let y = 0; y < 8; y++) {
    const d0 = data[offset + y * 2];
    const d1 = data[offset + y * 2 + 1];
    const d2 = data[offset + 16 + y];
    for (let x = 0; x < 8; x++) {
      const bit = 7 - x;
      pixels[y * 8 + x] =
        ((d0 >>> bit) & 1) |
        (((d1 >>> bit) & 1) << 1) |
        (((d2 >>> bit) & 1) << 2);
    }
  }
  return pixels;
}

/**
 * Decode one 8×8 tile from 4bpp SNES format.
 * Layout: 32 bytes — planes 0+1 interleaved (16 bytes) + planes 2+3 interleaved (16 bytes)
 *   bytes[0..15]: row y → byte[y*2] = plane0, byte[y*2+1] = plane1
 *   bytes[16..31]: row y → byte[16+y*2] = plane2, byte[16+y*2+1] = plane3
 *
 * @param data - Raw tileset bytes
 * @param offset - Byte offset to start of this tile
 * @returns 64-element array of 4-bit palette indices
 */
function decode4bppTile(data: Buffer | Uint8Array, offset: number): Uint8Array {
  const pixels = new Uint8Array(64);
  for (let y = 0; y < 8; y++) {
    const d0 = data[offset + y * 2];
    const d1 = data[offset + y * 2 + 1];
    const d2 = data[offset + 16 + y * 2];
    const d3 = data[offset + 16 + y * 2 + 1];
    for (let x = 0; x < 8; x++) {
      const bit = 7 - x;
      pixels[y * 8 + x] =
        ((d0 >>> bit) & 1) |
        (((d1 >>> bit) & 1) << 1) |
        (((d2 >>> bit) & 1) << 2) |
        (((d3 >>> bit) & 1) << 3);
    }
  }
  return pixels;
}

/**
 * Decode a full tileset of 2bpp tiles.
 *
 * @param data - Raw compressed/decompressed tileset bytes
 * @param tileCount - Number of 8×8 tiles to decode
 * @param startOffset - Byte offset into data to begin decoding
 * @returns Array of decoded tiles (each tile is 64-element Uint8Array)
 */
function decode2bppTileset(
  data: Buffer | Uint8Array,
  tileCount: number,
  startOffset = 0,
): Uint8Array[] {
  const tiles: Uint8Array[] = [];
  for (let i = 0; i < tileCount; i++) {
    tiles.push(decode2bppTile(data, startOffset + i * 16));
  }
  return tiles;
}

/**
 * Decode a full tileset of 3bpp tiles.
 *
 * @param data - Raw tileset bytes
 * @param tileCount - Number of 8×8 tiles to decode
 * @param startOffset - Byte offset into data
 * @returns Array of decoded tiles
 */
function decode3bppTileset(
  data: Buffer | Uint8Array,
  tileCount: number,
  startOffset = 0,
): Uint8Array[] {
  const tiles: Uint8Array[] = [];
  for (let i = 0; i < tileCount; i++) {
    tiles.push(decode3bppTile(data, startOffset + i * 24));
  }
  return tiles;
}

/**
 * Decode a full tileset of 4bpp tiles.
 *
 * @param data - Raw tileset bytes
 * @param tileCount - Number of 8×8 tiles to decode
 * @param startOffset - Byte offset into data
 * @returns Array of decoded tiles
 */
function decode4bppTileset(
  data: Buffer | Uint8Array,
  tileCount: number,
  startOffset = 0,
): Uint8Array[] {
  const tiles: Uint8Array[] = [];
  for (let i = 0; i < tileCount; i++) {
    tiles.push(decode4bppTile(data, startOffset + i * 32));
  }
  return tiles;
}

/**
 * Apply horizontal flip to an 8×8 tile pixel array.
 */
function flipTileX(pixels: Uint8Array): Uint8Array {
  const flipped = new Uint8Array(64);
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      flipped[y * 8 + x] = pixels[y * 8 + (7 - x)];
    }
  }
  return flipped;
}

/**
 * Apply vertical flip to an 8×8 tile pixel array.
 */
function flipTileY(pixels: Uint8Array): Uint8Array {
  const flipped = new Uint8Array(64);
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      flipped[y * 8 + x] = pixels[(7 - y) * 8 + x];
    }
  }
  return flipped;
}

export {
  decode2bppTile,
  decode2bppTileset,
  decode3bppTile,
  decode3bppTileset,
  decode4bppTile,
  decode4bppTileset,
  flipTileX,
  flipTileY
};
