/* @layer renderer-lib @kind logic */
import { buildOggCrcTable } from './build-ogg-crc-table';

const crcTable = buildOggCrcTable();

const oggCrc32 = (bytes: Uint8Array): number => {
  let crc = 0;
  for (const byte of bytes) {
    crc = ((crc << 8) ^ (crcTable[((crc >>> 24) ^ byte) & 0xff] ?? 0)) >>> 0;
  }
  return crc >>> 0;
};

export { oggCrc32 };
