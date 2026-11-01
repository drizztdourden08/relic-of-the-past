/* @layer shared-store @kind logic */
import type { StoreItem } from '../types';
import type { ItemCardView } from './home-types.type';

const ratingAverage = ({ ratingSum, ratingCount }: StoreItem['stats']): number | null =>
  (ratingCount > 0 ? ratingSum / ratingCount : null);

const cardViewOf = (item: StoreItem, semver: string | null): ItemCardView => ({
  id: item.id,
  kind: item.kind,
  slug: item.slug,
  name: item.name,
  summary: item.summary,
  author: item.author,
  color: item.color,
  card: item.card,
  banner: item.banner,
  semver,
  ratingAverage: ratingAverage(item.stats),
  ratingCount: item.stats.ratingCount,
  installs30d: item.stats.installs30d,
});

export { cardViewOf };
