import { decompress } from '../../../asset-extraction/compression/lz-decompress';
import type { RomData } from '../../../asset-extraction/rom/rom-types';
import type { Map32Tables } from '../types';
import {
  ADDR_HI_PTRS, ADDR_LO_PTRS,
  ADDR_MAP32_0, ADDR_MAP32_1, ADDR_MAP32_2, ADDR_MAP32_3,
  ADDR_MAP16_TO_MAP8, ADDR_MAP8_TO_ATTR,
} from './rom-addresses';

export function loadMap32Tables(rom: RomData): Map32Tables {
  const size = 2218 * 6;
  return {
    t0: rom.getBytes(ADDR_MAP32_0, size),
    t1: rom.getBytes(ADDR_MAP32_1, size),
    t2: rom.getBytes(ADDR_MAP32_2, size),
    t3: rom.getBytes(ADDR_MAP32_3, size),
  };
}

export function loadMap16ToMap8(rom: RomData): Uint16Array {
  return Uint16Array.from(rom.getWords(ADDR_MAP16_TO_MAP8, 3752 * 4));
}

export function loadMap8ToAttr(rom: RomData): Uint8Array {
  return Uint8Array.from(rom.getBytes(ADDR_MAP8_TO_ATTR, 512));
}

function decodeMap32(map32Id: number, tables: Map32Tables): [number, number, number, number] {
  const input = map32Id * 2;
  const a = input & ~7;
  const x = (a >> 1) + (a >> 2);
  const sel = input & 7;

  function readMap16(table: Buffer): number {
    const mainByte = table[x + (sel >> 1)];
    const nibbleByte = table[x + 4 + (sel >> 2)];
    const nibble = (sel & 2) ? (nibbleByte & 0x0f) : (nibbleByte >> 4);
    return mainByte | (nibble << 8);
  }

  return [readMap16(tables.t0), readMap16(tables.t1), readMap16(tables.t2), readMap16(tables.t3)];
}

/** Decompress a screen's map16 tile data from ROM. */
export function decompressScreen(rom: RomData, screenIdx: number, tables: Map32Tables): Uint16Array {
  const hiAddr = rom.get24(ADDR_HI_PTRS + screenIdx * 3);
  const loAddr = rom.get24(ADDR_LO_PTRS + screenIdx * 3);
  const hiBuf = decompress(hiAddr, (a) => rom.getByte(a));
  const loBuf = decompress(loAddr, (a) => rom.getByte(a));

  const map32Ids = new Uint16Array(256);
  for (let i = 0; i < 256; i++) {
    map32Ids[i] = loBuf[i] | (hiBuf[i] << 8);
  }

  const map16 = new Uint16Array(32 * 32);
  for (let row = 0; row < 16; row++) {
    for (let col = 0; col < 16; col++) {
      const [tl, tr, bl, br] = decodeMap32(map32Ids[row * 16 + col], tables);
      map16[(row * 2) * 32 + col * 2] = tl;
      map16[(row * 2) * 32 + col * 2 + 1] = tr;
      map16[(row * 2 + 1) * 32 + col * 2] = bl;
      map16[(row * 2 + 1) * 32 + col * 2 + 1] = br;
    }
  }
  return map16;
}
