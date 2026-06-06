/* @layer shared-asset-extraction @kind logic */
/**
 * AssetBuilder — accumulates named assets and serializes to zelda3_assets.dat format.
 */
import { createHash } from 'crypto';
import type { RomData } from './rom/rom-types';
import { decompress as lzDecompress } from './compression/lz-decompress';

const bufToArr = (buf: Buffer): number[] => {
  return Array.from(buf);
};

type AssetType = 'uint8' | 'uint16' | 'int8' | 'int16' | 'packed';

interface AssetEntry {
  type: AssetType;
  data: Buffer;
}

class AssetBuilder {
  private assets = new Map<string, AssetEntry>();

  addUint8(name: string, data: number[]): void {
    this.assets.set(name, { type: 'uint8', data: Buffer.from(data) });
  }

  addUint16(name: string, data: number[]): void {
    const buf = Buffer.alloc(data.length * 2);
    for (let i = 0; i < data.length; i++) buf.writeUInt16LE(data[i] & 0xffff, i * 2);
    this.assets.set(name, { type: 'uint16', data: buf });
  }

  addInt8(name: string, data: number[]): void {
    const buf = Buffer.alloc(data.length);
    for (let i = 0; i < data.length; i++) buf.writeInt8(data[i] & 0xff ? (data[i] > 127 ? data[i] - 256 : data[i]) : 0, i);
    this.assets.set(name, { type: 'int8', data: Buffer.from(new Int8Array(data).buffer) });
  }

  addInt16(name: string, data: number[]): void {
    const buf = Buffer.alloc(data.length * 2);
    for (let i = 0; i < data.length; i++) buf.writeInt16LE(data[i], i * 2);
    this.assets.set(name, { type: 'int16', data: buf });
  }

  addPacked(name: string, arrays: Buffer[]): void {
    this.assets.set(name, { type: 'packed', data: packArrays(arrays) });
  }

  /** Serialize all assets into the zelda3_assets.dat binary format */
  serialize(): Buffer {
    const keySig = Buffer.concat(
      Array.from(this.assets.keys()).map(k => Buffer.from(k + '\0', 'utf8'))
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
    for (let i = 0; i < allData.length; i++) {
      encodedSizes.writeUInt32LE(allData[i].length, i * 4);
    }

    const parts: Buffer[] = [hdr, encodedSizes, keySig];
    for (const v of allData) {
      // Align to 4 bytes
      const pad = (4 - (totalLen(parts) % 4)) % 4;
      if (pad > 0) parts.push(Buffer.alloc(pad));
      parts.push(v);
    }

    return Buffer.concat(parts);
  }
}

const totalLen = (bufs: Buffer[]): number => {
  return bufs.reduce((s, b) => s + b.length, 0);
};

const packArrays = (arr: Buffer[]): Buffer => {
  if (arr.length === 0) return Buffer.alloc(0);
  const offsets: number[] = [];
  let offs = 0;
  for (let i = 0; i < arr.length - 1; i++) {
    offs += arr[i].length;
    offsets.push(offs);
  }
  if (offs < 65536 && arr.length <= 8192) {
    const hdr = Buffer.alloc(offsets.length * 2 + 2);
    for (let i = 0; i < offsets.length; i++) hdr.writeUInt16LE(offsets[i], i * 2);
    hdr.writeUInt16LE(arr.length - 1, offsets.length * 2);
    return Buffer.concat([Buffer.alloc(offsets.length * 2, 0).fill((() => { const b = Buffer.alloc(offsets.length * 2); for (let i = 0; i < offsets.length; i++) b.writeUInt16LE(offsets[i], i * 2); return b; })(), 0, offsets.length * 2), ...arr, (() => { const b = Buffer.alloc(2); b.writeUInt16LE(arr.length - 1, 0); return b; })()]);
  } else {
    const idxBuf = Buffer.alloc(offsets.length * 4);
    for (let i = 0; i < offsets.length; i++) idxBuf.writeUInt32LE(offsets[i], i * 4);
    const trailer = Buffer.alloc(2);
    trailer.writeUInt16LE(8192 + arr.length - 1, 0);
    return Buffer.concat([idxBuf, ...arr, trailer]);
  }
};

const lzDecompressWithLen = (rom: RomData, addr: number): { data: Buffer; compressedLength: number } => {
  const [data, compressedLength] = lzDecompress(addr, (a) => rom.getByte(a), false, true);
  return { data, compressedLength };
};

export { AssetBuilder, bufToArr, lzDecompressWithLen, packArrays };
export type { AssetEntry, AssetType };
