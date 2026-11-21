/* @layer shared-asset-extraction @kind logic */
import { msg } from '@drizztdourden08/brock-core/i18n';
import { BinaryReader } from '../binary-reader';
import { RomLoadError } from '../rom-loader/rom-load-error';
import { gbaAddressToOffset } from './gba-address-to-offset';
import { ALTTP_GBA_US_SHA256 } from './gba-rom.constants';

class GbaRomReader extends BinaryReader {
  readonly sha256: string;

  constructor(bytes: Buffer, validate = true) {
    super(bytes);
    this.sha256 = this.hash('sha256');
    if (validate && this.sha256 !== ALTTP_GBA_US_SHA256) {
      throw new RomLoadError(
        msg('rom-loader:error.unsupportedGba'),
        `Unsupported ALttP GBA ROM SHA-256 ${this.sha256}`,
      );
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

export { GbaRomReader };
