/* @layer store-site @kind logic */
/**
 * What My publications says about a version and its file: the state its chip shows, how far
 * its upload is, how long a rejected one keeps its file, and why a removed one has none. The
 * list is the author's own, so a delete of theirs reads as "by you".
 */
import { STORE_LIMITS } from '@shared/store/limits';
import type { FileRemoval, RemovalReason, StoreItem, StoreVersion } from '@shared/store/types';
import { fileExpiresAt } from '@shared/store/version-flow';
import { formatBytes } from '@site-kit/lib/format-bytes';
import { formatDay } from '@site-kit/lib/format-date';
import type { ReviewChipState } from '../components/ReviewChip/ReviewChip';
import { plural } from '../lib/format-count';

const DAY_MS = 24 * 60 * 60 * 1000;
const PERCENT = 100;

/** A ready version whose file the store removed shows as expired. */
const chipStateOf = (version: StoreVersion): ReviewChipState =>
  (version.review.state === 'ready' && version.removed ? 'expired' : version.review.state);

const deletedLine = (item: StoreItem, { at, by }: FileRemoval): string => {
  const who = by === null ? '' : ` by ${by.userId === item.author.userId ? 'you' : by.displayName}`;
  return `deleted${who}, ${formatDay(at)}`;
};

const REMOVED_LINES: Record<RemovalReason, (item: StoreItem, removal: FileRemoval) => string> = {
  deleted: deletedLine,
  'rejected-expired': () => `file removed after ${STORE_LIMITS.rejectedKeepDays} days`,
  'ready-expired': () => `never sent, file removed after ${STORE_LIMITS.readyKeepDays} days`,
  pruned: (item) => `file removed · older than ${STORE_LIMITS.filesKept[item.kind]} kept`,
};

const uploadLine = ({ upload, bytes }: StoreVersion): string => {
  if (!upload || upload.parts === 0) return 'uploading';
  const share = Math.min(1, upload.partsDone / upload.parts);
  return `uploading ${Math.floor(share * PERCENT)}% · ${formatBytes(bytes * share)} of ${formatBytes(bytes)}`;
};

/** The file column of one version row. */
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

export { chipStateOf, fileLineOf };
