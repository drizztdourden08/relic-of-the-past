/* @layer site-kit @kind logic */
import { HASH_MAX_BYTES } from './hash-file.constants';

const toHex = (digest: ArrayBuffer) =>
  Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');

const hashFile = async (file: Blob): Promise<string | null> => {
  if (file.size > HASH_MAX_BYTES) return null;
  const digest = await crypto.subtle.digest('SHA-256', await file.arrayBuffer());
  return toHex(digest);
};

export { hashFile };
