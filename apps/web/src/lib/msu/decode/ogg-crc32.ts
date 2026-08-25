/* @layer renderer-lib @kind logic */
/**
 * The CRC-32 Ogg uses for its page checksums. It shares only the polynomial (0x04c11db7)
 * with the familiar zip/PNG CRC: Ogg reflects neither the input bytes nor the result, starts
 * from zero and applies no final xor. Feeding page bytes to a stock CRC-32 therefore produces
 * a number a demuxer rejects, and it rejects it quietly — a bad checksum simply looks like a
 * corrupt page, so the stream decodes to nothing with no error to read.
 *
 * The checksum covers the entire page, header included, with the four checksum bytes
 * themselves set to zero while it is computed.
 */

const OGG_CRC_POLYNOMIAL = 0x04c11db7;

const buildTable = (): Uint32Array => {
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

const OGG_CRC_TABLE = buildTable();

const oggCrc32 = (bytes: Uint8Array): number => {
  let crc = 0;
  for (let i = 0; i < bytes.length; i += 1) {
    crc = ((crc << 8) ^ OGG_CRC_TABLE[((crc >>> 24) ^ bytes[i]) & 0xff]) >>> 0;
  }
  return crc >>> 0;
};

export { oggCrc32 };
