/* @layer shared-asset-extraction @kind logic */
import { HEADER_BYTES, SIG_BYTES, SIG_PREFIX } from './dat-container.constants';
import { u32At } from './u32-at';

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

export { datAssetNames };
