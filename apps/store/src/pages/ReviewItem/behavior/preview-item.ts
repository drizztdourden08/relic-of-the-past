/* @layer store-site @kind logic */
import { cardViewOf } from '@rotp/hub-contracts';
import type { ReviewEntry, StoreItem } from '@rotp/hub-contracts';
import { liveVersionOf } from '../../../catalog/approved-versions';
import { editOfEntry, versionOfEntry } from '../../../review/review-row';
import type { ItemPreview } from './preview-item.type';

const previewOf = (entry: ReviewEntry): ItemPreview => {
  const edit = editOfEntry(entry);
  const item: StoreItem = edit ? { ...entry.item, ...edit.patch } : entry.item;
  const version = versionOfEntry(entry) ?? liveVersionOf(item);
  return { item, version, card: cardViewOf(item, version?.semver ?? null) };
};

export { previewOf };
