/* @layer shared-asset-extraction @kind logic */
/**
 * Reads one named entry out of a compiled assets blob. The inverse of AssetBuilder.serialize().
 *
 * Layout: a 16-byte signature and a 32-byte key hash, 32 bytes of padding, then the entry
 * count and the length of the name block. After that come the entry sizes as u32s, the
 * NUL-separated names, and finally the payloads in the same order, each aligned to the next
 * 4-byte boundary of the file.
 *
 * A caller can pull one asset without re-running extraction from a ROM. The studio needs the
 * stock player tiles and gear palette, and the blob is already cached.
 */

const SIGNATURE = 'Zelda3_v0     \n\0';
const SIG_BYTES = 16;
const HASH_BYTES = 32;
const PAD_BYTES = 32;
const COUNT_AT = SIG_BYTES + HASH_BYTES + PAD_BYTES; // 80
const HEADER_BYTES = COUNT_AT + 8; // 88

const align4 = (n: number): number => (n + 3) & ~3;

const hasSignature = (dat: Uint8Array): boolean => {
  if (dat.length < HEADER_BYTES) return false;
  for (let i = 0; i < SIGNATURE.length; i++) {
    if (dat[i] !== SIGNATURE.charCodeAt(i)) return false;
  }
  return true;
};

/** The entry names, in payload order. */
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

/** The named entry's bytes as a view into `dat`, or null when the blob has no such entry. */
const readDatEntry = (dat: Uint8Array, key: string): Uint8Array | null => {
  if (!hasSignature(dat)) return null;
  const view = new DataView(dat.buffer, dat.byteOffset, dat.byteLength);
  const count = view.getUint32(COUNT_AT, true);
  const keyLen = view.getUint32(COUNT_AT + 4, true);
  const index = readDatKeys(dat).indexOf(key);
  if (index < 0) return null;

  const sizes: number[] = [];
  for (let i = 0; i < count; i++) sizes.push(view.getUint32(HEADER_BYTES + i * 4, true));

  // Walk the payloads: each starts at the next 4-byte boundary after the previous one ends.
  let at = HEADER_BYTES + count * 4 + keyLen;
  for (let i = 0; i < index; i++) at = align4(at) + sizes[i];
  at = align4(at);
  if (at + sizes[index] > dat.length) return null;
  return dat.subarray(at, at + sizes[index]);
};

export { readDatEntry, readDatKeys };
