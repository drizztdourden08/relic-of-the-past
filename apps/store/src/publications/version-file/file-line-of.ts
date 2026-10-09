/* @layer store-site @kind logic */
import type { StoreItem, StoreVersion } from '@rotp/hub-contracts';
import { fileExpiresAt } from '@rotp/hub-contracts';
import { formatBytes } from '@site-kit/lib/format-bytes';
import { plural } from '../../lib/format-count/plural';
import { DAY_MS, REMOVED_LINES } from './version-file.constants';
import { uploadLine } from './upload-line';

const fileLineOf = (item: StoreItem, version: StoreVersion, now: number): string => {
  if (version.removed) return REMOVED_LINES[version.removed.reason](item, version.removed);
  if (version.review.state === 'uploading') return uploadLine(version);
  const size = formatBytes(version.bytes);
  const until = fileExpiresAt(version);
  if (version.review.state === 'rejected' && until !== null) {
    return `${size} · file removed in ${plural(Math.max(0, Math.ceil((until - now) / DAY_MS)), 'day', 'days')}`;
  }
  return version.review.state === 'ready' ? `${size} · checked` : size;
};

export { fileLineOf };
