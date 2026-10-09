/* @layer shared-asset-extraction @kind logic */
import type { RomData } from './rom-types';

class RomReader {
  private ea: number;
  private readonly rom: RomData;

  constructor(rom: RomData, startAddress: number) {
    this.rom = rom;
    this.ea = startAddress;
  }

  get address(): number {
    return this.ea;
  }

  next(): number {
    const r = this.rom.getByte(this.ea);
    this.ea += 1;
    if ((this.ea & 0xffff) === 0) {
      this.ea += 0x8000;
    }
    return r;
  }

  nextWord(): number {
    const lo = this.next();
    const hi = this.next();
    return lo | (hi << 8);
  }

  next24(): number {
    const lo = this.next();
    const mid = this.next();
    const hi = this.next();
    return lo | (mid << 8) | (hi << 16);
  }

  nextBytes(n: number): Buffer {
    const result = Buffer.alloc(n);
    for (let i = 0; i < n; i++) {
      result[i] = this.next();
    }
    return result;
  }
}

export { RomReader };
