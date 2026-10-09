/* @layer renderer-components @kind logic */
import type { ItemCardView } from '@shared/store/home-types';
import type { StoreKind } from '@shared/store/types';
import { matchesQuery } from './matches-query';

const filterItems = (items: ItemCardView[], kind: StoreKind | null, query: string): ItemCardView[] => {
  const needle = query.trim().toLowerCase();
  return items.filter((item) => (kind === null || item.kind === kind) && (!needle || matchesQuery(item, needle)));
};

export { filterItems };
