/* @layer shared-asset-extraction @kind logic */
import { BinaryReader } from './binary-reader';

const ALTTP_GBA_US_SHA256 = 'f328f8f07d736288a00c80d31cc1630f3aa02aaf20efdcba73d31dae832b5d76';
const GBA_ROM_BASE = 0x08000000;

const gbaAddressToOffset = (address: number): number => {
  if (!Number.isInteger(address) || address < 0x08000000 || address > 0x09ffffff) {
    throw new Error(`Invalid GBA Game Pak address 0x${address.toString(16)}`);
  }
  return address & 0x01ffffff;
};

class GbaRomReader extends BinaryReader {
  readonly sha256: string;

  constructor(bytes: Buffer, validate = true) {
    super(bytes);
    this.sha256 = this.hash('sha256');
    if (validate && this.sha256 !== ALTTP_GBA_US_SHA256) {
      throw new Error(`Unsupported ALttP GBA ROM SHA-256 ${this.sha256}`);
    }
  }

  romByte(address: number): number {
    return this.byte(gbaAddressToOffset(address));
  }

  romWord(address: number): number {
    return this.word(gbaAddressToOffset(address));
  }

  romUint32(address: number): number {
    return this.uint32(gbaAddressToOffset(address));
  }

  romSlice(address: number, size: number): Buffer {
    return this.slice(gbaAddressToOffset(address), size);
  }
}

const loadGbaAlttpRomFromBuffer = (
  bytes: Buffer,
  options: { allowUnknownHash?: boolean } = {},
): GbaRomReader => new GbaRomReader(bytes, !options.allowUnknownHash);

export { ALTTP_GBA_US_SHA256, GBA_ROM_BASE, GbaRomReader, gbaAddressToOffset, loadGbaAlttpRomFromBuffer };
