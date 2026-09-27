/* @layer electron-main @kind logic */
/**
 * The checks a download passes before anything is unpacked. The grant must describe the item
 * that was asked for, in the container its kind ships in, within the kind's size cap, over
 * https, and the bytes that arrived must match its size and sha256 exactly.
 */
import { createHash } from 'crypto';
import type { DownloadResponse } from '@shared/store/api-types';
import { KIND_CONTAINER } from '@shared/store/containers';
import { STORE_LIMITS } from '@shared/store/limits';

const MISMATCH = 'The download does not match the published pack.';

const checkGrant = (grant: DownloadResponse, itemId: string): void => {
  if (grant.itemId !== itemId) throw new Error('The Hookshop answered for a different item.');
  if (KIND_CONTAINER[grant.kind] !== grant.container) throw new Error('The Hookshop answered with an unknown kind of pack.');
  if (!(grant.bytes > 0) || grant.bytes > STORE_LIMITS.packBytes[grant.kind]) {
    throw new Error('The pack is larger than the Hookshop allows.');
  }
  if (!grant.url.startsWith('https://')) throw new Error('The Hookshop answered with a download that is not secure.');
};

const verifyDownload = (bytes: Uint8Array, grant: DownloadResponse): void => {
  if (bytes.byteLength !== grant.bytes) throw new Error(MISMATCH);
  const digest = createHash('sha256').update(bytes).digest('hex');
  if (digest !== grant.sha256.toLowerCase()) throw new Error(MISMATCH);
};

export { checkGrant, verifyDownload };
