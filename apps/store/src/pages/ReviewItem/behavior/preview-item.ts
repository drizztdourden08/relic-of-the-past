/* @layer store-site @kind logic */
import type { ReviewEntry } from '@rotp/hub-contracts';
import type { ItemCardView } from '@rotp/hub-contracts';
import type { StoreItem, StoreVersion } from '@rotp/hub-contracts';
import { liveVersionOf } from '../../../catalog/approved-versions';
import { editOfEntry, versionOfEntry } from '../../../review/review-row';
import type { ItemPreview } from './preview-item.type';

const ratingAverage = ({ ratingSum, ratingCount }: StoreItem['stats']): number | null =>
  (ratingCount > 0 ? ratingSum / ratingCount : null);

const cardOf = (item: StoreItem, version: StoreVersion | null): ItemCardView => ({
  id: item.id,
  kind: item.kind,
  slug: item.slug,
  name: item.name,
  summary: item.summary,
  author: item.author,
  color: item.color,
  card: item.card,
  banner: item.banner,
  semver: version?.semver ?? null,
  ratingAverage: ratingAverage(item.stats),
  ratingCount: item.stats.ratingCount,
  installs30d: item.stats.installs30d,
});

const previewOf = (entry: ReviewEntry): ItemPreview => {
  const edit = editOfEntry(entry);
  const item: StoreItem = edit ? { ...entry.item, ...edit.patch } : entry.item;
  const version = versionOfEntry(entry) ?? liveVersionOf(item);
  return { item, version, card: cardOf(item, version) };
};

export { previewOf };
