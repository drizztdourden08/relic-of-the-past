/* @layer renderer-lib @kind logic */
import { OGG_CRC_POLYNOMIAL } from './ogg-crc32.constants';

const buildOggCrcTable = (): Uint32Array => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i += 1) {
    let r = i << 24;
    for (let bit = 0; bit < 8; bit += 1) {
      r = (r & 0x80000000) !== 0 ? ((r << 1) ^ OGG_CRC_POLYNOMIAL) : (r << 1);
    }
    table[i] = r >>> 0;
  }
  return table;
};

export { buildOggCrcTable };
