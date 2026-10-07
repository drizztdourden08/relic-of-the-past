/* @layer store-site @kind logic */
/**
 * The row Browse filters and sorts: an item card's fields flattened to what a filter
 * clause can name. The author is their name, a missing rating is 0 so it sorts last, and
 * the live version reads as text.
 */
import type { ItemCardView } from '@shared/store/home-types';
import type { StoreKind } from '@shared/store/types';

type ItemRow = {
  id: string;
  name: string;
  summary: string;
  kind: StoreKind;
  author: string;
  version: string;
  rating: number;
  ratings: number;
  installs: number;
};

const toItemRow = (item: ItemCardView): ItemRow => ({
  id: item.id,
  name: item.name,
  summary: item.summary,
  kind: item.kind,
  author: item.author.displayName,
  version: item.semver ?? '-',
  rating: item.ratingAverage ?? 0,
  ratings: item.ratingCount,
  installs: item.installs30d,
});

export { toItemRow };
export type { ItemRow };
