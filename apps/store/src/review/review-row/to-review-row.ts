/* @layer store-site @kind logic */
import type { ReviewEntry } from '@shared/store/api-types';
import { formatBytes } from '@site-kit/lib/format-bytes';
import { formatDateTime } from '@site-kit/lib/format-date';
import type { ReviewRow } from './review-row.type';
import { entryId } from './entry-id';
import { versionOfEntry } from './version-of-entry';

const toReviewRow = (entry: ReviewEntry): ReviewRow => {
  const { item, target } = entry;
  const version = versionOfEntry(entry);
  const label = version ? `${item.name} · ${version.semver}` : `${item.name} · listing`;
  const change = target.kind === 'listing' ? 'listing edit' : item.liveVersion === null ? 'new item' : 'update';
  return {
    id: entryId(entry),
    item: label,
    kind: item.kind,
    change,
    author: item.author.displayName,
    size: version ? formatBytes(version.bytes) : '-',
    submitted: formatDateTime(entry.submittedAt),
  };
};

export { toReviewRow };
