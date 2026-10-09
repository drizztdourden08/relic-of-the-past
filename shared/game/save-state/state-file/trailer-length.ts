/* @layer shared-game @kind logic */
import { MAGIC, MAGIC_BYTES, TRAILER_FIXED } from './state-file.constants';

const decoder = new TextDecoder();

const hasMagic = (bytes: Uint8Array): boolean => {
  if (bytes.byteLength < TRAILER_FIXED) return false;
  const start = bytes.byteLength - MAGIC_BYTES;
  return decoder.decode(bytes.subarray(start)) === MAGIC;
};

const trailerLength = (buffer: ArrayBuffer): number => {
  const bytes = new Uint8Array(buffer);
  if (!hasMagic(bytes)) return 0;
  const view = new DataView(buffer);
  const jsonLength = view.getUint32(buffer.byteLength - TRAILER_FIXED, true);
  const total = jsonLength + TRAILER_FIXED;
  const fitsInFile = total <= buffer.byteLength;
  return fitsInFile ? total : 0;
};

export { trailerLength };
