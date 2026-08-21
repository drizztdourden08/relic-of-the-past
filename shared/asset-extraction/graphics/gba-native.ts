/* @layer shared-asset-extraction @kind logic */
const TILE_PIXELS = 64;
const GBA_4BPP_TILE_BYTES = 32;
const SNES_4BPP_TILE_BYTES = 32;

const decodeGbaPacked4bppTile = (data: Uint8Array, offset = 0): Uint8Array => {
  if (offset < 0 || offset + GBA_4BPP_TILE_BYTES > data.length) throw new Error('GBA tile offset is out of range');
  const pixels = new Uint8Array(TILE_PIXELS);
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const packed = data[offset + y * 4 + (x >>> 1)];
      pixels[y * 8 + x] = x & 1 ? packed >>> 4 : packed & 0x0f;
    }
  }
  return pixels;
};

const encodeSnesPlanar4bppTile = (pixels: Uint8Array): Buffer => {
  if (pixels.length !== TILE_PIXELS) throw new Error('SNES tile requires exactly 64 pixels');
  const result = Buffer.alloc(SNES_4BPP_TILE_BYTES);
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const color = pixels[y * 8 + x];
      if (color > 15) throw new Error(`SNES 4bpp color index ${color} is out of range`);
      const bit = 7 - x;
      result[y * 2] |= (color & 1) << bit;
      result[y * 2 + 1] |= ((color >>> 1) & 1) << bit;
      result[16 + y * 2] |= ((color >>> 2) & 1) << bit;
      result[16 + y * 2 + 1] |= ((color >>> 3) & 1) << bit;
    }
  }
  return result;
};

const convertGbaSheetToSnes4bpp = (data: Uint8Array): Buffer => {
  if (data.length % GBA_4BPP_TILE_BYTES !== 0) throw new Error('GBA sheet is not tile-aligned');
  const result = Buffer.alloc(data.length);
  for (let offset = 0; offset < data.length; offset += GBA_4BPP_TILE_BYTES) {
    encodeSnesPlanar4bppTile(decodeGbaPacked4bppTile(data, offset)).copy(result, offset);
  }
  return result;
};

const convertGbaMapWordToSnes = (word: number, priority = false): number => {
  const palette = word >>> 12;
  if (palette > 7) throw new Error(`GBA palette bank ${palette} cannot be represented by a SNES BG tile word`);
  return (word & 0x03ff)
    | (palette << 10)
    | (priority ? 0x2000 : 0)
    | ((word & 0x0400) << 4)
    | ((word & 0x0800) << 4);
};

export {
  GBA_4BPP_TILE_BYTES,
  SNES_4BPP_TILE_BYTES,
  convertGbaMapWordToSnes,
  convertGbaSheetToSnes4bpp,
  decodeGbaPacked4bppTile,
  encodeSnesPlanar4bppTile,
};
