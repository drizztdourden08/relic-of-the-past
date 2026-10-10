/* @layer shared-asset-extraction @kind logic */
import type { RomData, RomLanguage } from '../rom-types';
import { snesToLinear } from '../snes-address';

const createRomData = (bytes: Buffer, language: RomLanguage, description: string): RomData => {
  return {
    bytes,
    language,
    description,

    getByte(ea: number): number {
      const offset = snesToLinear(ea);
      const value = bytes[offset];
      if (value === undefined) throw new RangeError(`ROM read outside the image at SNES 0x${ea.toString(16)}`);
      return value;
    },

    getWord(ea: number): number {
      return this.getByte(ea) + this.getByte(ea + 1) * 256;
    },

    get24(ea: number): number {
      return this.getByte(ea) + this.getByte(ea + 1) * 256 + this.getByte(ea + 2) * 65536;
    },

    getInt8(ea: number): number {
      const b = this.getByte(ea);
      return b & 0x80 ? b - 256 : b;
    },

    getInt16(ea: number): number {
      const w = this.getWord(ea);
      return w & 0x8000 ? w - 65536 : w;
    },

    getBytes(addr: number, n: number): Buffer {
      const result = Buffer.alloc(n);
      let a = addr;
      for (let i = 0; i < n; i++) {
        result[i] = this.getByte(a);
        a += 1;
        if ((a & 0x8000) === 0) {
          a += 0x8000;
        }
      }
      return result;
    },

    getWords(addr: number, n: number): number[] {
      const result = new Array<number>(n);
      let a = addr;
      for (let i = 0; i < n; i++) {
        result[i] = this.getWord(a);
        a += 2;
        if ((a & 0x8000) === 0) {
          a += 0x8000;
        }
      }
      return result;
    },
  };
};

export { createRomData };
