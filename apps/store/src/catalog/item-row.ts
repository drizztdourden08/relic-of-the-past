/* @layer store-site @kind logic */
import type { ItemCardView } from '@shared/store/home-types';
import type { ItemRow } from './item-row.type';

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
export type { ItemRow } from './item-row.type';
