/* @layer shared-asset-extraction @kind logic */
const decode2bppTile = (data: Buffer | Uint8Array, offset: number): Uint8Array => {
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
};

const decode3bppTile = (data: Buffer | Uint8Array, offset: number): Uint8Array => {
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
};

const decode4bppTile = (data: Buffer | Uint8Array, offset: number): Uint8Array => {
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
};

const decode2bppTileset = (data: Buffer | Uint8Array, tileCount: number, startOffset = 0): Uint8Array[] => {
  const tiles: Uint8Array[] = [];
  for (let i = 0; i < tileCount; i++) {
    tiles.push(decode2bppTile(data, startOffset + i * 16));
  }
  return tiles;
};

const decode3bppTileset = (data: Buffer | Uint8Array, tileCount: number, startOffset = 0): Uint8Array[] => {
  const tiles: Uint8Array[] = [];
  for (let i = 0; i < tileCount; i++) {
    tiles.push(decode3bppTile(data, startOffset + i * 24));
  }
  return tiles;
};

const decode4bppTileset = (data: Buffer | Uint8Array, tileCount: number, startOffset = 0): Uint8Array[] => {
  const tiles: Uint8Array[] = [];
  for (let i = 0; i < tileCount; i++) {
    tiles.push(decode4bppTile(data, startOffset + i * 32));
  }
  return tiles;
};

const flipTileX = (pixels: Uint8Array): Uint8Array => {
  const flipped = new Uint8Array(64);
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      flipped[y * 8 + x] = pixels[y * 8 + (7 - x)];
    }
  }
  return flipped;
};

const flipTileY = (pixels: Uint8Array): Uint8Array => {
  const flipped = new Uint8Array(64);
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      flipped[y * 8 + x] = pixels[(7 - y) * 8 + x];
    }
  }
  return flipped;
};

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
