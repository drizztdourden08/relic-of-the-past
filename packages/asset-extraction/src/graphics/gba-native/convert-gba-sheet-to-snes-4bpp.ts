/* @layer shared-asset-extraction @kind logic */
import { decodeGbaPacked4bppTile } from './decode-gba-packed-4bpp-tile';
import { encodeSnesPlanar4bppTile } from './encode-snes-planar-4bpp-tile';
import { GBA_4BPP_TILE_BYTES } from './gba-native.constants';

const convertGbaSheetToSnes4bpp = (data: Uint8Array): Buffer => {
  if (data.length % GBA_4BPP_TILE_BYTES !== 0) throw new Error('GBA sheet is not tile-aligned');
  const result = Buffer.alloc(data.length);
  for (let offset = 0; offset < data.length; offset += GBA_4BPP_TILE_BYTES) {
    encodeSnesPlanar4bppTile(decodeGbaPacked4bppTile(data, offset)).copy(result, offset);
  }
  return result;
};

export { convertGbaSheetToSnes4bpp };
