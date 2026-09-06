/* @layer shared-asset-extraction @kind logic */
/**
 * Read-only view over a serialized zelda3_assets.dat blob — the exact inverse
 * of AssetBuilder.serialize(). Buffer-free (plain Uint8Array), so it runs in
 * the renderer as well as in Node.
 *
 * Layout: 48-byte signature, 32 reserved bytes, u32 asset count, u32 key-sig
 * length, then count*4 asset sizes, the NUL-separated name list, and each
 * asset's bytes aligned to 4.
 */

const SIG_BYTES = 48;
const HEADER_BYTES = SIG_BYTES + 32 + 8;
const SIG_PREFIX = 'Zelda3_v0';

const u32At = (data: Uint8Array, offset: number): number =>
  data[offset] | (data[offset + 1] << 8) | (data[offset + 2] << 16) | ((data[offset + 3] << 24) >>> 0);

/** The asset names in file order, or null when the blob is not an assets file. */
const datAssetNames = (dat: Uint8Array): string[] | null => {
  if (dat.length < HEADER_BYTES) return null;
  const sig = new TextDecoder().decode(dat.subarray(0, SIG_PREFIX.length));
  if (sig !== SIG_PREFIX) return null;
  const count = u32At(dat, SIG_BYTES + 32);
  const keySigLen = u32At(dat, SIG_BYTES + 36);
  const keysStart = HEADER_BYTES + count * 4;
  if (keysStart + keySigLen > dat.length) return null;
  const keys = new TextDecoder().decode(dat.subarray(keysStart, keysStart + keySigLen));
  const names = keys.split('\0');
  if (names[names.length - 1] === '') names.pop();
  return names.length === count ? names : null;
};

/** The named asset's bytes (a subarray view into |dat|), or undefined. */
const findDatAsset = (dat: Uint8Array, name: string): Uint8Array | undefined => {
  const names = datAssetNames(dat);
  if (names === null) return undefined;
  const count = names.length;
  const keySigLen = u32At(dat, SIG_BYTES + 36);
  let offset = HEADER_BYTES + count * 4 + keySigLen;
  for (let i = 0; i < count; i++) {
    const size = u32At(dat, HEADER_BYTES + i * 4);
    offset = (offset + 3) & ~3;
    if (offset + size > dat.length) return undefined;
    if (names[i] === name) return dat.subarray(offset, offset + size);
    offset += size;
  }
  return undefined;
};

export { datAssetNames, findDatAsset };
