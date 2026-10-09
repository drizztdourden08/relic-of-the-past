/* @layer store-site @kind logic */
import { HASH_MAX_BYTES } from '@site-kit/upload/hash-file';
import { createSha256 } from './sha256';
import { SLICE_BYTES } from './hash-pack.constants';

const toHex = (digest: ArrayBuffer) =>
  Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');

const hashPack = async (file: Blob, known: string | null = null): Promise<string> => {
  if (known) return known;
  if (file.size <= HASH_MAX_BYTES) return toHex(await crypto.subtle.digest('SHA-256', await file.arrayBuffer()));
  const hasher = createSha256();
  for (let at = 0; at < file.size; at += SLICE_BYTES) {
    hasher.update(new Uint8Array(await file.slice(at, at + SLICE_BYTES).arrayBuffer()));
  }
  return hasher.hex();
};

export { hashPack };
