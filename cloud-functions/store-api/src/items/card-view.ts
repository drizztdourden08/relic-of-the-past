/* @layer store-api @kind logic */
/** The card a shelf or the catalogue shows for an item: listing text, pictures, the live
 *  version and the totals. Nothing on it is private, so it needs no projection. */
import type { ItemCardView } from '../../../../shared/store/home-types';
import type { StoreItem } from '../../../../shared/store/types';
import { liveVersionOf } from './versions';

const ratingAverage = ({ ratingSum, ratingCount }: StoreItem['stats']): number | null =>
  (ratingCount > 0 ? ratingSum / ratingCount : null);

const toCardView = (item: StoreItem): ItemCardView => ({
  id: item.id,
  kind: item.kind,
  slug: item.slug,
  name: item.name,
  summary: item.summary,
  author: item.author,
  color: item.color,
  card: item.card,
  banner: item.banner,
  semver: liveVersionOf(item)?.semver ?? null,
  ratingAverage: ratingAverage(item.stats),
  ratingCount: item.stats.ratingCount,
  installs30d: item.stats.installs30d,
});

export { toCardView, ratingAverage };
