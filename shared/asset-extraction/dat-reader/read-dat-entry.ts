/* @layer shared-asset-extraction @kind logic */
import { COUNT_AT, HEADER_BYTES } from './dat-reader.constants';
import { hasSignature } from './has-signature';
import { readDatKeys } from './read-dat-keys';

const align4 = (n: number): number => (n + 3) & ~3;

const readDatEntry = (dat: Uint8Array, key: string): Uint8Array | null => {
  if (!hasSignature(dat)) return null;
  const view = new DataView(dat.buffer, dat.byteOffset, dat.byteLength);
  const count = view.getUint32(COUNT_AT, true);
  const keyLen = view.getUint32(COUNT_AT + 4, true);
  const index = readDatKeys(dat).indexOf(key);
  if (index < 0) return null;

  const sizes: number[] = [];
  for (let i = 0; i < count; i++) sizes.push(view.getUint32(HEADER_BYTES + i * 4, true));

  let at = HEADER_BYTES + count * 4 + keyLen;
  for (let i = 0; i < index; i++) at = align4(at) + sizes[i];
  at = align4(at);
  if (at + sizes[index] > dat.length) return null;
  return dat.subarray(at, at + sizes[index]);
};

export { readDatEntry };
