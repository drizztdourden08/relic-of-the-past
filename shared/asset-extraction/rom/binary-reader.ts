/* @layer shared-asset-extraction @kind logic */
import { createHash } from 'crypto';

class BinaryReader {
  readonly bytes: Buffer;

  constructor(bytes: Buffer) {
    this.bytes = bytes;
  }

  private check(offset: number, size: number): void {
    if (!Number.isInteger(offset) || offset < 0 || offset + size > this.bytes.length) {
      throw new Error(`Binary read outside input at 0x${offset.toString(16)} (${size} bytes)`);
    }
  }

  byte(offset: number): number {
    this.check(offset, 1);
    return this.bytes[offset];
  }

  word(offset: number): number {
    this.check(offset, 2);
    return this.bytes.readUInt16LE(offset);
  }

  uint24(offset: number): number {
    this.check(offset, 3);
    return this.bytes[offset] | (this.bytes[offset + 1] << 8) | (this.bytes[offset + 2] << 16);
  }

  uint32(offset: number): number {
    this.check(offset, 4);
    return this.bytes.readUInt32LE(offset);
  }

  slice(offset: number, size: number): Buffer {
    this.check(offset, size);
    return this.bytes.subarray(offset, offset + size);
  }

  hash(algorithm: 'sha1' | 'sha256'): string {
    return createHash(algorithm).update(this.bytes).digest('hex');
  }
}

export { BinaryReader };
