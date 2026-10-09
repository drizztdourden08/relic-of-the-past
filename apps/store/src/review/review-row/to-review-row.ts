/* @layer store-site @kind logic */
import type { ReviewEntry } from '@rotp/hub-contracts';
import { formatBytes } from '@rotp/hub-client';
import { formatDateTime } from '@rotp/hub-client';
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
