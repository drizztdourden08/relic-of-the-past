/* @layer shared-asset-extraction @kind logic */
import { COUNT_AT, HEADER_BYTES } from './dat-reader.constants';
import { hasSignature } from './has-signature';

const readDatKeys = (dat: Uint8Array): string[] => {
  if (!hasSignature(dat)) return [];
  const view = new DataView(dat.buffer, dat.byteOffset, dat.byteLength);
  const count = view.getUint32(COUNT_AT, true);
  const keyLen = view.getUint32(COUNT_AT + 4, true);
  const keysAt = HEADER_BYTES + count * 4;
  const keys: string[] = [];
  let start = keysAt;
  for (let i = keysAt; i < keysAt + keyLen && keys.length < count; i++) {
    if (dat[i] !== 0) continue;
    keys.push(String.fromCharCode(...dat.subarray(start, i)));
    start = i + 1;
  }
  return keys;
};

export { readDatKeys };
