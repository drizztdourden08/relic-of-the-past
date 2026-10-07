/* @layer store-site @kind logic */
/**
 * The item as players would see it once the entry is approved: a listing edit's patch laid
 * over the listing, and the version under review (or the live one, for a listing edit) as
 * the version its card and its page show.
 */
import type { ReviewEntry } from '@shared/store/api-types';
import type { ItemCardView } from '@shared/store/home-types';
import type { StoreItem, StoreVersion } from '@shared/store/types';
import { liveVersionOf } from '../../../catalog/approved-versions';
import { editOfEntry, versionOfEntry } from '../../../review/review-row';

type ItemPreview = {
  item: StoreItem;
  /** The version on show; null for a listing edit of an item with nothing approved. */
  version: StoreVersion | null;
  card: ItemCardView;
};

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
export type { ItemPreview };
