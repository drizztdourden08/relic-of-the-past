/* @layer store-site @kind logic */
/**
 * The sha256 of a pack or a picture, as lowercase hex; store-api requires one for each. A
 * file that fits one part goes through WebCrypto in one call; a larger one is read in
 * slices and fed to the incremental hasher, so memory stays at one slice whatever the size.
 */
import { HASH_MAX_BYTES } from '@site-kit/upload/hash-file';
import { createSha256 } from './sha256';

const SLICE_BYTES = 8 * 1024 * 1024;

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
