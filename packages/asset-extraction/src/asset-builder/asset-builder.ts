/* @layer shared-asset-extraction @kind logic */
import { createHash } from 'crypto';
import { stampBakeVersion } from '../bake-version';
import { packArrays } from './pack-arrays';
import { signedByteOf } from './signed-byte-of';
import type { AssetEntry } from './asset-builder.type';

const totalLen = (bufs: Buffer[]): number => {
  return bufs.reduce((s, b) => s + b.length, 0);
};

class AssetBuilder {
  private assets = new Map<string, AssetEntry>();

  addUint8(name: string, data: number[]): void {
    this.assets.set(name, { type: 'uint8', data: Buffer.from(data) });
  }

  addUint16(name: string, data: number[]): void {
    const buf = Buffer.alloc(data.length * 2);
    for (const [i, value] of data.entries()) buf.writeUInt16LE(value & 0xffff, i * 2);
    this.assets.set(name, { type: 'uint16', data: buf });
  }

  addInt8(name: string, data: number[]): void {
    const buf = Buffer.alloc(data.length);
    for (const [i, value] of data.entries()) buf.writeInt8(signedByteOf(value), i);
    this.assets.set(name, { type: 'int8', data: Buffer.from(new Int8Array(data).buffer) });
  }

  addInt16(name: string, data: number[]): void {
    const buf = Buffer.alloc(data.length * 2);
    for (const [i, value] of data.entries()) buf.writeInt16LE(value, i * 2);
    this.assets.set(name, { type: 'int16', data: buf });
  }

  addPacked(name: string, arrays: Buffer[]): void {
    this.assets.set(name, { type: 'packed', data: packArrays(arrays) });
  }

  serialize(): Buffer {
    const keySig = Buffer.concat(
      Array.from(this.assets.keys()).map(k => Buffer.from(`${k}\0`, 'utf8'))
    );
    const assetsSig = Buffer.concat([
      Buffer.from('Zelda3_v0     \n\0', 'ascii'),
      createHash('sha256').update(keySig).digest(),
    ]);

    const allData = Array.from(this.assets.values()).map(a => a.data);
    const hdr = Buffer.alloc(assetsSig.length + 32 + 8);
    assetsSig.copy(hdr, 0);
    hdr.writeUInt32LE(allData.length, assetsSig.length + 32);
    hdr.writeUInt32LE(keySig.length, assetsSig.length + 32 + 4);

    const encodedSizes = Buffer.alloc(allData.length * 4);
    for (const [i, data] of allData.entries()) {
      encodedSizes.writeUInt32LE(data.length, i * 4);
    }

    const parts: Buffer[] = [hdr, encodedSizes, keySig];
    for (const v of allData) {
      const padToFourBytes = (4 - (totalLen(parts) % 4)) % 4;
      if (padToFourBytes > 0) parts.push(Buffer.alloc(padToFourBytes));
      parts.push(v);
    }

    const out = Buffer.concat(parts);
    stampBakeVersion(out);
    return out;
  }
}

export { AssetBuilder };
