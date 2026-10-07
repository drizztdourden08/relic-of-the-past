/* @layer sanctuary-site @kind logic */
/**
 * The client-side sha256 the record carries. WebCrypto digests a whole buffer, so a file
 * is hashed only while it fits one part; a larger one records null and the size check at
 * complete stays the guard.
 */
import { LIMITS } from '@shared/sanctuary/limits';

const HASH_MAX_BYTES = LIMITS.partBytes;

const toHex = (digest: ArrayBuffer) =>
  Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');

const hashFile = async (file: File): Promise<string | null> => {
  if (file.size > HASH_MAX_BYTES) return null;
  const digest = await crypto.subtle.digest('SHA-256', await file.arrayBuffer());
  return toHex(digest);
};

export { hashFile, HASH_MAX_BYTES };
