/* @layer shared-asset-extraction @kind logic */
import { decompressGbaLz77 } from '../../../compression/gba-lz77';
import type { NativeDungeonLayer } from '../../../dungeon/model';
import { convertGbaMapWordToSnes } from '../../../graphics/gba-native';
import { gbaAddressToOffset } from '../../../rom/gba-rom';
import type { GbaRomReader } from '../../../rom/gba-rom';
import {
  FLIP_VARIANT_ATTR_END, FLIP_VARIANT_ATTR_FIRST, ROOM_MAP_BYTES, ROOM_MAP_CELLS, ROOM_MAP_SIDE, SCREEN_BLOCK_CELLS,
  SCREEN_BLOCK_SIDE, SNES_FLIP_SHIFT, TILE_ATTRIBUTE_INDEX_MASK,
} from './dungeon-source.constants';

const screenBlockSource = (x: number, y: number): number => {
  const screenBlock = Math.floor(y / SCREEN_BLOCK_SIDE) * 2 + Math.floor(x / SCREEN_BLOCK_SIDE);
  return screenBlock * SCREEN_BLOCK_CELLS + (y % SCREEN_BLOCK_SIDE) * SCREEN_BLOCK_SIDE + (x % SCREEN_BLOCK_SIDE);
};

const cellAttribute = (attributes: Buffer, gbaWord: number, snesWord: number): number => {
  const attribute = attributes[gbaWord & TILE_ATTRIBUTE_INDEX_MASK];
  if (attribute >= FLIP_VARIANT_ATTR_FIRST && attribute < FLIP_VARIANT_ATTR_END) return attribute | (snesWord >>> SNES_FLIP_SHIFT);
  return attribute;
};

const parseRoomLayer = (rom: GbaRomReader, address: number, attributes: Buffer): NativeDungeonLayer => {
  const decompressed = decompressGbaLz77(rom, gbaAddressToOffset(address));
  if (decompressed.data.length !== ROOM_MAP_BYTES) throw new Error(`Room layer at 0x${address.toString(16)} is not 64x64`);
  const gbaWords = new Uint16Array(ROOM_MAP_CELLS);
  const snesWords = new Uint16Array(ROOM_MAP_CELLS);
  const collision = new Uint8Array(ROOM_MAP_CELLS);
  for (let y = 0; y < ROOM_MAP_SIDE; y++) {
    for (let x = 0; x < ROOM_MAP_SIDE; x++) {
      const destination = y * ROOM_MAP_SIDE + x;
      const gbaWord = decompressed.data.readUInt16LE(screenBlockSource(x, y) * 2);
      const snesWord = convertGbaMapWordToSnes(gbaWord);
      gbaWords[destination] = gbaWord;
      snesWords[destination] = snesWord;
      collision[destination] = cellAttribute(attributes, gbaWord, snesWord);
    }
  }
  return { width: ROOM_MAP_SIDE, height: ROOM_MAP_SIDE, gbaWords, snesWords, collision, sourceAddress: address };
};

export { parseRoomLayer };
