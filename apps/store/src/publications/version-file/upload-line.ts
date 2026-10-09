/* @layer store-site @kind logic */
import type { StoreVersion } from '@rotp/hub-contracts';
import { formatBytes } from '@rotp/hub-client';
import { PERCENT } from './version-file.constants';

const uploadLine = ({ upload, bytes }: StoreVersion): string => {
  if (!upload || upload.parts === 0) return 'uploading';
  const share = Math.min(1, upload.partsDone / upload.parts);
  return `uploading ${Math.floor(share * PERCENT)}% · ${formatBytes(bytes * share)} of ${formatBytes(bytes)}`;
};

export { uploadLine };
