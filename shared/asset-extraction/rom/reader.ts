/**
 * Sequential byte reader with SNES bank-aware auto-advancement.
 * Replaces Python's `Reader` class and the `get_byte` callback pattern.
 */
import type { RomData } from './rom-types';

export class RomReader {
  private ea: number;
  private readonly rom: RomData;

  constructor(rom: RomData, startAddress: number) {
    this.rom = rom;
    this.ea = startAddress;
  }

  /** Current SNES address */
  get address(): number {
    return this.ea;
  }

  /** Read next byte and advance address (with bank-crossing) */
  next(): number {
    const r = this.rom.getByte(this.ea);
    this.ea += 1;
    if ((this.ea & 0xffff) === 0) {
      this.ea += 0x8000;
    }
    return r;
  }

  /** Read next 16-bit word (little-endian) and advance */
  nextWord(): number {
    const lo = this.next();
    const hi = this.next();
    return lo | (hi << 8);
  }

  /** Read next 24-bit value (little-endian) and advance */
  next24(): number {
    const lo = this.next();
    const mid = this.next();
    const hi = this.next();
    return lo | (mid << 8) | (hi << 16);
  }

  /** Read N bytes and advance */
  nextBytes(n: number): Buffer {
    const result = Buffer.alloc(n);
    for (let i = 0; i < n; i++) {
      result[i] = this.next();
    }
    return result;
  }
}
