/* @layer shared-asset-extraction @kind logic */
import { HEADER_BYTES, SIG_BYTES } from './dat-container.constants';
import { datAssetNames } from './dat-asset-names';
import { u32At } from './u32-at';

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

export { findDatAsset };
