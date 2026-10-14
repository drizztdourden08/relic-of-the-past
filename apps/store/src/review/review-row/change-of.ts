/* @layer store-site @kind logic */
import type { ReviewEntry } from '@rotp/hub-contracts';
import type { ReviewRow } from './review-row.type';

const changeOf = (entry: ReviewEntry): ReviewRow['change'] => {
  const { item, target } = entry;
  if (target.kind === 'listing') return 'listing edit';
  return item.liveVersion === null ? 'new item' : 'update';
};

export { changeOf };
