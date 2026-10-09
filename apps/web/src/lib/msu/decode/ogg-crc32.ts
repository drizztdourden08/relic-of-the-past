/* @layer renderer-lib @kind logic */
import { buildOggCrcTable } from './build-ogg-crc-table';

const crcTable = buildOggCrcTable();

const oggCrc32 = (bytes: Uint8Array): number => {
  let crc = 0;
  for (let i = 0; i < bytes.length; i += 1) {
    crc = ((crc << 8) ^ crcTable[((crc >>> 24) ^ bytes[i]) & 0xff]) >>> 0;
  }
  return crc >>> 0;
};

export { oggCrc32 };
