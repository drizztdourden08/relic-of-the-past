/* @layer store-site @kind logic */
import type { ReviewEntry } from '@rotp/hub-contracts';
import { formatBytes, formatDateTime } from '@rotp/hub-client';
import type { ReviewRow } from './review-row.type';
import { changeOf } from './change-of';
import { entryId } from './entry-id';
import { versionOfEntry } from './version-of-entry';

const toReviewRow = (entry: ReviewEntry): ReviewRow => {
  const { item } = entry;
  const version = versionOfEntry(entry);
  const label = version ? `${item.name} · ${version.semver}` : `${item.name} · listing`;
  return {
    id: entryId(entry),
    item: label,
    kind: item.kind,
    change: changeOf(entry),
    author: item.author.displayName,
    size: version ? formatBytes(version.bytes) : '-',
    submitted: formatDateTime(entry.submittedAt),
  };
};

export { toReviewRow };
