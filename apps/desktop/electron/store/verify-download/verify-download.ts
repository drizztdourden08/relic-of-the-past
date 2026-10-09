/* @layer electron-main @kind logic */
import { createHash } from 'crypto';
import type { DownloadResponse } from '@shared/store/api-types';
import { MISMATCH } from './verify-download.constants';

const verifyDownload = (bytes: Uint8Array, grant: DownloadResponse): void => {
  if (bytes.byteLength !== grant.bytes) throw new Error(MISMATCH);
  const digest = createHash('sha256').update(bytes).digest('hex');
  if (digest !== grant.sha256.toLowerCase()) throw new Error(MISMATCH);
};

export { verifyDownload };
